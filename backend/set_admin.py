#!/usr/bin/env python3
"""
Set or update the admin login credentials for Aveness LLC.

Usage:
    python backend/set_admin.py <email> <password>

Examples:
    python backend/set_admin.py admin@avenessllc.com mypassword123
    python backend/set_admin.py newemail@avenessllc.com newpassword
"""

import sys
import os
from urllib.parse import urlsplit

BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BACKEND_DIR)

from dotenv import load_dotenv
load_dotenv(os.path.join(BACKEND_DIR, "..", ".env"))

from database import SessionLocal, Base, engine, Admin
from auth import get_password_hash


def describe_target(url: str) -> str:
    parts = urlsplit(url)
    if parts.scheme.startswith("sqlite"):
        return f"SQLite file ({parts.path or url})"
    return f"{parts.scheme} database at {parts.hostname or '?'} (db: {parts.path.lstrip('/') or '?'})"


def main():
    if len(sys.argv) != 3:
        print("Usage: python set_admin.py <email> <password>")
        print("Example: python set_admin.py admin@avenessllc.com mypassword123")
        sys.exit(1)

    email = sys.argv[1].strip()
    password = sys.argv[2].strip()

    if not email or "@" not in email:
        print(f"Error: '{email}' is not a valid email address.")
        sys.exit(1)

    if len(password) < 6:
        print("Error: Password must be at least 6 characters.")
        sys.exit(1)

    db_url = os.getenv("DATABASE_URL", "sqlite:///./aveness.db")
    print(f"Target: {describe_target(db_url)}")
    if db_url.startswith("sqlite"):
        print(
            "WARNING: DATABASE_URL is not set in this environment, so this will write to a "
            "local SQLite file, NOT your production database. Set DATABASE_URL (e.g. run this "
            "from an environment where it's exported, or from Render's Shell) if you meant to "
            "update the live admin account."
        )
        confirm = input("Continue anyway? [y/N] ").strip().lower()
        if confirm != "y":
            print("Aborted.")
            sys.exit(1)

    print("Connecting to database...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        existing = db.query(Admin).first()

        if existing:
            existing.email = email
            existing.hashed_password = get_password_hash(password)
            db.commit()
            print("Admin updated successfully.")
            print(f"  Email: {email}")
            print("  You can now log in at /admin")
        else:
            admin = Admin(
                email=email,
                hashed_password=get_password_hash(password),
            )
            db.add(admin)
            db.commit()
            print("Admin created successfully.")
            print(f"  Email: {email}")
            print("  You can now log in at /admin")
    except Exception as e:
        db.rollback()
        print(f"Error: {e}")
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    main()
