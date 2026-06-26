from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    first_name: str = Field(min_length=1, max_length=100)
    last_name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    phone_number: str | None = None
    password: str = Field(min_length=6)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    first_name: str
    last_name: str
    email: str
    phone_number: str | None
    role: str
    profile_photo: str | None
    is_verified: bool
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    phone_number: str | None = None
    profile_photo: str | None = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
