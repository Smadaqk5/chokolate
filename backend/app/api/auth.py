from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth.security import create_access_token, get_current_user, get_password_hash, verify_password
from app.database import get_db
from app.models import User, UserRole
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse, UserResponse, UserUpdate

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse)
def register(data: RegisterRequest, db: Annotated[Session, Depends(get_db)]):
    if db.query(User).filter(User.email == data.email.lower()).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        first_name=data.first_name,
        last_name=data.last_name,
        email=data.email.lower(),
        phone_number=data.phone_number,
        password_hash=get_password_hash(data.password),
        role=UserRole.CUSTOMER,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token({"sub": user.id, "role": user.role.value})
    return TokenResponse(access_token=token, user=UserResponse.model_validate(user))


@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, db: Annotated[Session, Depends(get_db)]):
    user = db.query(User).filter(User.email == data.email.lower()).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is deactivated")
    user.last_login = datetime.utcnow()
    db.commit()
    token = create_access_token({"sub": user.id, "role": user.role.value})
    return TokenResponse(access_token=token, user=UserResponse.model_validate(user))


@router.get("/me", response_model=UserResponse)
def get_me(current_user: Annotated[User, Depends(get_current_user)]):
    return UserResponse.model_validate(current_user)


@router.put("/me", response_model=UserResponse)
def update_me(
    data: UserUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(current_user, field, value)
    current_user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(current_user)
    return UserResponse.model_validate(current_user)
