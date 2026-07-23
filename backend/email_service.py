import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import logging
import os

logger = logging.getLogger(__name__)

# Email configuration - Resend API
RESEND_API_KEY = os.getenv("RESEND_API_KEY")
EMAIL_FROM = os.getenv("EMAIL_FROM", "onboarding@resend.dev")
EMAIL_ENABLED = bool(RESEND_API_KEY)


def send_email(to_email: str, subject: str, html_body: str) -> bool:
    if not EMAIL_ENABLED:
        logger.info(f"Email disabled. Would send to {to_email}: {subject}")
        return True

    try:
        import httpx

        response = httpx.post(
            "https://api.resend.com/emails",
            headers={
                "Authorization": f"Bearer {RESEND_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "from": EMAIL_FROM,
                "to": [to_email],
                "subject": subject,
                "html": html_body,
            },
        )
        response.raise_for_status()
        logger.info(f"Email sent to {to_email}: {subject}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {e}")
        return False


TIME_WINDOW_LABELS = {
    "morning": "Morning (8am–12pm)",
    "afternoon": "Afternoon (12pm–4pm)",
    "evening": "Evening (4pm–7pm)",
}


def booking_confirmation_html(name: str, reference: str, address: str, frequency: str, preferred_date=None, preferred_time: str = None, lawn_size: str = None, notes: str = None) -> str:
    date_display = preferred_date.strftime("%B %-d, %Y") if preferred_date else "To be scheduled"
    time_display = TIME_WINDOW_LABELS.get(preferred_time, preferred_time or "To be scheduled")
    lawn_size_row = f'<p><strong>Lawn Size:</strong> {lawn_size}</p>' if lawn_size else ""
    notes_row = f'<p><strong>Notes:</strong> {notes}</p>' if notes else ""
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: 'Helvetica Neue', Arial, sans-serif; background: #f9f8f4; margin: 0; padding: 40px; }}
            .container {{ max-width: 600px; margin: 0 auto; background: white; border: 1px solid #e5e5e5; }}
            .header {{ background: #1A3C34; padding: 40px; text-align: center; }}
            .header h1 {{ color: #F9F8F4; font-size: 28px; font-weight: 300; letter-spacing: 4px; margin: 0; }}
            .header p {{ color: #C5A059; font-size: 11px; letter-spacing: 3px; margin-top: 8px; }}
            .body {{ padding: 40px; }}
            .body h2 {{ color: #1A3C34; font-size: 22px; font-weight: 300; margin-bottom: 20px; }}
            .body p {{ color: #555; line-height: 1.7; font-size: 15px; }}
            .details {{ background: #f9f8f4; padding: 24px; margin: 24px 0; border-left: 3px solid #C5A059; }}
            .details p {{ margin: 8px 0; font-size: 14px; color: #1A3C34; }}
            .details strong {{ color: #1A3C34; }}
            .ref {{ font-family: 'Courier New', monospace; font-size: 12px; color: #999; text-align: center; margin-top: 30px; letter-spacing: 2px; }}
            .footer {{ padding: 30px 40px; border-top: 1px solid #eee; text-align: center; }}
            .footer p {{ font-size: 12px; color: #999; margin: 4px 0; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>AVENESS</h1>
                <p>ESTATE LAWNCARE</p>
            </div>
            <div class="body">
                <h2>Thank you, {name}.</h2>
                <p>Your service request has been received. An Aveness estate specialist will review your request and contact you within one business day.</p>
                <div class="details">
                    <p><strong>Property Address:</strong> {address}</p>
                    <p><strong>Service:</strong> {frequency.title()}</p>
                    <p><strong>Preferred Start Date:</strong> {date_display}</p>
                    <p><strong>Preferred Time:</strong> {time_display}</p>
                    {lawn_size_row}
                    {notes_row}
                    <p><strong>Status:</strong> Pending Review</p>
                </div>
                <p>We appreciate your interest in Aveness. Our team is committed to providing the highest standard of estate lawncare in Naples, Florida.</p>
            </div>
            <div class="ref">REF · {reference}</div>
            <div class="footer">
                <p>AVENESS LLC · NAPLES, FLORIDA</p>
                <p>LICENSED · INSURED · COLLIER COUNTY</p>
            </div>
        </div>
    </body>
    </html>
    """


def booking_status_html(name: str, reference: str, status: str, address: str) -> str:
    if hasattr(status, "value"):
        status = status.value

    display_status = status.capitalize()

    status_messages = {
        "approved": "Your service request has been <strong>approved</strong>. Our team will contact you shortly to schedule your first visit.",
        "cancelled": "Your service request has been <strong>cancelled</strong>. If you believe this is an error, please contact us.",
        "completed": "Your service has been <strong>completed</strong>. Thank you for choosing Aveness for your estate lawncare needs.",
    }

    status_colors = {
        "approved": "#2d8a4e",
        "cancelled": "#c0392b",
        "completed": "#1A3C34",
    }

    message = status_messages.get(status, f"Your request status has been updated to {display_status}.")
    color = status_colors.get(status, "#1A3C34")

    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: 'Helvetica Neue', Arial, sans-serif; background: #f9f8f4; margin: 0; padding: 40px; }}
            .container {{ max-width: 600px; margin: 0 auto; background: white; border: 1px solid #e5e5e5; }}
            .header {{ background: #1A3C34; padding: 40px; text-align: center; }}
            .header h1 {{ color: #F9F8F4; font-size: 28px; font-weight: 300; letter-spacing: 4px; margin: 0; }}
            .header p {{ color: #C5A059; font-size: 11px; letter-spacing: 3px; margin-top: 8px; }}
            .body {{ padding: 40px; }}
            .body h2 {{ color: #1A3C34; font-size: 22px; font-weight: 300; margin-bottom: 20px; }}
            .body p {{ color: #555; line-height: 1.7; font-size: 15px; }}
            .status-badge {{ display: inline-block; padding: 8px 20px; background: {color}; color: white; font-size: 13px; letter-spacing: 2px; text-transform: uppercase; font-weight: 500; margin: 16px 0; }}
            .details {{ background: #f9f8f4; padding: 24px; margin: 24px 0; border-left: 3px solid #C5A059; }}
            .details p {{ margin: 8px 0; font-size: 14px; color: #1A3C34; }}
            .details strong {{ color: #1A3C34; }}
            .ref {{ font-family: 'Courier New', monospace; font-size: 12px; color: #999; text-align: center; margin-top: 30px; letter-spacing: 2px; }}
            .footer {{ padding: 30px 40px; border-top: 1px solid #eee; text-align: center; }}
            .footer p {{ font-size: 12px; color: #999; margin: 4px 0; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>AVENESS</h1>
                <p>ESTATE LAWNCARE</p>
            </div>
            <div class="body">
                <h2>Hello, {name}.</h2>
                <div class="status-badge">{display_status}</div>
                <p>{message}</p>
                <div class="details">
                    <p><strong>Property Address:</strong> {address}</p>
                    <p><strong>Reference:</strong> {reference}</p>
                </div>
            </div>
            <div class="ref">REF · {reference}</div>
            <div class="footer">
                <p>AVENESS LLC · NAPLES, FLORIDA</p>
                <p>LICENSED · INSURED · COLLIER COUNTY</p>
            </div>
        </div>
    </body>
    </html>
    """


def contact_confirmation_html(name: str, subject: str, message: str) -> str:
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: 'Helvetica Neue', Arial, sans-serif; background: #f9f8f4; margin: 0; padding: 40px; }}
            .container {{ max-width: 600px; margin: 0 auto; background: white; border: 1px solid #e5e5e5; }}
            .header {{ background: #1A3C34; padding: 40px; text-align: center; }}
            .header h1 {{ color: #F9F8F4; font-size: 28px; font-weight: 300; letter-spacing: 4px; margin: 0; }}
            .header p {{ color: #C5A059; font-size: 11px; letter-spacing: 3px; margin-top: 8px; }}
            .body {{ padding: 40px; }}
            .body h2 {{ color: #1A3C34; font-size: 22px; font-weight: 300; margin-bottom: 20px; }}
            .body p {{ color: #555; line-height: 1.7; font-size: 15px; }}
            .message-box {{ background: #f9f8f4; padding: 24px; margin: 24px 0; border-left: 3px solid #C5A059; }}
            .message-box p {{ margin: 8px 0; font-size: 14px; color: #1A3C34; }}
            .footer {{ padding: 30px 40px; border-top: 1px solid #eee; text-align: center; }}
            .footer p {{ font-size: 12px; color: #999; margin: 4px 0; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>AVENESS</h1>
                <p>ESTATE LAWNCARE</p>
            </div>
            <div class="body">
                <h2>Thank you, {name}.</h2>
                <p>We have received your message and will respond within one business day.</p>
                <div class="message-box">
                    <p><strong>Subject:</strong> {subject or "No subject"}</p>
                    <p><strong>Message:</strong> {message}</p>
                </div>
            </div>
            <div class="footer">
                <p>AVENESS LLC · NAPLES, FLORIDA</p>
                <p>LICENSED · INSURED · COLLIER COUNTY</p>
            </div>
        </div>
    </body>
    </html>
    """


def contact_admin_notification_html(name: str, email: str, subject: str, message: str) -> str:
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: 'Helvetica Neue', Arial, sans-serif; background: #f9f8f4; margin: 0; padding: 40px; }}
            .container {{ max-width: 600px; margin: 0 auto; background: white; border: 1px solid #e5e5e5; }}
            .header {{ background: #1A3C34; padding: 40px; text-align: center; }}
            .header h1 {{ color: #F9F8F4; font-size: 28px; font-weight: 300; letter-spacing: 4px; margin: 0; }}
            .header p {{ color: #C5A059; font-size: 11px; letter-spacing: 3px; margin-top: 8px; }}
            .body {{ padding: 40px; }}
            .body h2 {{ color: #1A3C34; font-size: 22px; font-weight: 300; margin-bottom: 20px; }}
            .body p {{ color: #555; line-height: 1.7; font-size: 15px; }}
            .details {{ background: #f9f8f4; padding: 24px; margin: 24px 0; border-left: 3px solid #C5A059; }}
            .details p {{ margin: 8px 0; font-size: 14px; color: #1A3C34; }}
            .footer {{ padding: 30px 40px; border-top: 1px solid #eee; text-align: center; }}
            .footer p {{ font-size: 12px; color: #999; margin: 4px 0; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>AVENESS</h1>
                <p>NEW CONTACT MESSAGE</p>
            </div>
            <div class="body">
                <h2>New message from {name}</h2>
                <div class="details">
                    <p><strong>From:</strong> {name} ({email})</p>
                    <p><strong>Subject:</strong> {subject or "No subject"}</p>
                    <p><strong>Message:</strong> {message}</p>
                </div>
            </div>
            <div class="footer">
                <p>AVENESS LLC · NAPLES, FLORIDA</p>
            </div>
        </div>
    </body>
    </html>
    """
