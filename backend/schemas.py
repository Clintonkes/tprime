from pydantic import BaseModel, EmailStr
from typing import Optional, Literal
from datetime import datetime, date


class BookingCreate(BaseModel):
    address: str
    frequency: str
    name: str
    email: EmailStr
    phone: str
    preferred_date: date
    preferred_time: Literal["morning", "afternoon", "evening"]


class BookingResponse(BaseModel):
    id: int
    reference: str
    address: str
    frequency: str
    name: str
    email: str
    phone: Optional[str]
    preferred_date: Optional[date]
    preferred_time: Optional[str]
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class BookingStatusUpdate(BaseModel):
    status: str


class ContactCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    subject: Optional[str] = None
    message: str


class ContactResponse(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str]
    subject: Optional[str]
    message: str
    created_at: datetime

    class Config:
        from_attributes = True


class AdminLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str
