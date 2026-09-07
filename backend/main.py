from fastapi import FastAPI, Depends, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime, timezone
import time
import random
import string
import os

from database import init_db, get_db, Booking, Contact, Admin
from schemas import (
    BookingCreate, BookingResponse, BookingStatusUpdate, BookingsPage,
    ContactCreate, ContactResponse, ContactStatusUpdate, ContactsPage,
    AdminLogin, Token,
)

from auth import verify_password, get_password_hash, create_access_token, get_current_admin
from email_service import (
    send_email, booking_confirmation_html, booking_status_html,
    contact_confirmation_html, contact_admin_notification_html,
)

PAGE_SIZE = 10

app = FastAPI(title="Aveness API", version="1.0.0")

origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    # Production frontend (GitHub Pages + custom domain)
    "https://tprimelawncare.org",
    "https://www.tprimelawncare.org",
    # GitHub Pages fallback (before custom domain is configured)
    "https://clintonkes.github.io",
]
render_url = os.getenv("RENDER_EXTERNAL_URL")
if render_url:
    origins.append(render_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup():
    init_db()
    _seed_admin()


def _seed_admin():
    from database import SessionLocal
    admin_password = os.getenv("ADMIN_PASSWORD")
    if not admin_password:
        # No ADMIN_PASSWORD set in this environment: leave whatever admin
        # account already exists untouched, and don't create one with a
        # guessable default.
        return

    admin_email = os.getenv("ADMIN_EMAIL", "admin@avenessllc.com")
    db = SessionLocal()
    try:
        existing = db.query(Admin).first()
        if existing:
            existing.email = admin_email
            existing.hashed_password = get_password_hash(admin_password)
            db.commit()
            print(f"Admin credentials synced from environment: {admin_email}")
        else:
            db.add(Admin(email=admin_email, hashed_password=get_password_hash(admin_password)))
            db.commit()
            print(f"Admin seeded: {admin_email}")
    finally:
        db.close()


def _generate_reference():
    ts = str(int(time.time()))[-6:]
    rand = "".join(random.choices(string.digits, k=3))
    return f"AVN-{ts}{rand}"


# ── Health Check ──────────────────────────────────────────────────

@app.get("/api/health")
def health_check():
    return {"status": "ok"}


# ── Public Endpoints ──────────────────────────────────────────────


@app.post("/api/bookings", response_model=BookingResponse, status_code=201)
def create_booking(data: BookingCreate, db: Session = Depends(get_db)):
    reference = _generate_reference()
    booking = Booking(
        reference=reference,
        address=data.address,
        frequency=data.frequency,
        name=data.name,
        email=data.email,
        phone=data.phone,
        preferred_date=data.preferred_date,
        preferred_time=data.preferred_time,
        lawn_size=data.lawn_size,
        notes=data.notes,
        status="pending",
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)

    send_email(
        to_email=data.email,
        subject=f"Your Aveness Service Request {reference}",
        html_body=booking_confirmation_html(
            name=data.name,
            reference=reference,
            address=data.address,
            frequency=data.frequency,
            preferred_date=data.preferred_date,
            preferred_time=data.preferred_time,
            lawn_size=data.lawn_size,
            notes=data.notes,
        ),
    )

    return booking


@app.post("/api/contacts", response_model=ContactResponse, status_code=201)
def create_contact(data: ContactCreate, db: Session = Depends(get_db)):
    contact = Contact(
        name=data.name,
        email=data.email,
        phone=data.phone,
        subject=data.subject,
        message=data.message,
    )
    db.add(contact)
    db.commit()
    db.refresh(contact)

    send_email(
        to_email=data.email,
        subject="Thank you for contacting Aveness",
        html_body=contact_confirmation_html(
            name=data.name,
            subject=data.subject,
            message=data.message,
        ),
    )

    admin_email = os.getenv("ADMIN_EMAIL", "admin@avenessllc.com")
    send_email(
        to_email=admin_email,
        subject=f"New Contact: {data.subject or 'No subject'}",
        html_body=contact_admin_notification_html(
            name=data.name,
            email=data.email,
            subject=data.subject,
            message=data.message,
        ),
    )

    return contact


# ── Auth Endpoints ────────────────────────────────────────────────

@app.post("/api/admin/login", response_model=Token)
def admin_login(data: AdminLogin, db: Session = Depends(get_db)):
    admin = db.query(Admin).filter(Admin.email == data.email).first()
    if not admin or not verify_password(data.password, admin.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    access_token = create_access_token(data={"sub": admin.email})
    return {"access_token": access_token, "token_type": "bearer"}


# ── Admin Endpoints ───────────────────────────────────────────────

@app.get("/api/admin/bookings", response_model=BookingsPage)
def list_bookings(
    page: int = Query(1, ge=1),
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin),
):
    query = db.query(Booking).order_by(Booking.created_at.desc())
    total = query.count()
    pending_count = db.query(Booking).filter(Booking.status == "pending").count()
    items = query.offset((page - 1) * PAGE_SIZE).limit(PAGE_SIZE).all()
    return {
        "items": items, "total": total, "page": page, "page_size": PAGE_SIZE,
        "pending_count": pending_count,
    }


@app.patch("/api/admin/bookings/{booking_id}", response_model=BookingResponse)
def update_booking_status(
    booking_id: int,
    data: BookingStatusUpdate,
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin),
):
    if data.status not in ("pending", "approved", "cancelled", "completed"):
        raise HTTPException(status_code=400, detail="Invalid status")

    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    booking.status = data.status
    booking.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(booking)

    send_email(
        to_email=booking.email,
        subject=f"Aveness Service Update — {booking.reference}",
        html_body=booking_status_html(
            name=booking.name,
            reference=booking.reference,
            status=data.status,
            address=booking.address,
        ),
    )

    return booking


@app.delete("/api/admin/bookings/{booking_id}", status_code=204)
def delete_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin),
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    db.delete(booking)
    db.commit()


@app.get("/api/admin/contacts", response_model=ContactsPage)
def list_contacts(
    page: int = Query(1, ge=1),
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin),
):
    query = db.query(Contact).order_by(Contact.created_at.desc())
    total = query.count()
    new_count = db.query(Contact).filter(Contact.status == "new").count()
    items = query.offset((page - 1) * PAGE_SIZE).limit(PAGE_SIZE).all()
    return {
        "items": items, "total": total, "page": page, "page_size": PAGE_SIZE,
        "new_count": new_count,
    }


@app.patch("/api/admin/contacts/{contact_id}", response_model=ContactResponse)
def update_contact_status(
    contact_id: int,
    data: ContactStatusUpdate,
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin),
):
    if data.status not in ("new", "read", "archived"):
        raise HTTPException(status_code=400, detail="Invalid status")

    contact = db.query(Contact).filter(Contact.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")

    contact.status = data.status
    db.commit()
    db.refresh(contact)
    return contact


@app.delete("/api/admin/contacts/{contact_id}", status_code=204)
def delete_contact(
    contact_id: int,
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin),
):
    contact = db.query(Contact).filter(Contact.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    db.delete(contact)
    db.commit()


@app.get("/api/admin/dashboard")
def dashboard_stats(
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin),
):
    total = db.query(Booking).count()
    pending = db.query(Booking).filter(Booking.status == "pending").count()
    approved = db.query(Booking).filter(Booking.status == "approved").count()
    completed = db.query(Booking).filter(Booking.status == "completed").count()
    cancelled = db.query(Booking).filter(Booking.status == "cancelled").count()
    contacts = db.query(Contact).count()
    return {
        "total_bookings": total,
        "pending": pending,
        "approved": approved,
        "completed": completed,
        "cancelled": cancelled,
        "total_contacts": contacts,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)


# The frontend is deployed separately on GitHub Pages (see .github/workflows/frontend.yml)
# — this service is the API only.
@app.get("/")
def root():
    return {"status": "ok", "service": "tprime-api"}
