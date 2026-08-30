from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from uuid import UUID


# ─────────── Organization ───────────

class OrganizationBase(BaseModel):
    name: str = Field(..., max_length=255)
    slug: str = Field(..., max_length=100)


class OrganizationCreate(OrganizationBase):
    pass


class OrganizationUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    slug: Optional[str] = Field(None, max_length=100)


class OrganizationOut(OrganizationBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ─────────── User ───────────

class UserBase(BaseModel):
    email: EmailStr
    name: str = Field(..., max_length=255)
    role: str = Field(default="paralegal")


class UserCreate(UserBase):
    pass


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    name: Optional[str] = Field(None, max_length=255)
    role: Optional[str] = Field(None)


class UserOut(UserBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ─────────── Matter ───────────

class MatterBase(BaseModel):
    name: str = Field(..., max_length=255)
    description: Optional[str] = None
    status: str = Field(default="active")


class MatterCreate(MatterBase):
    pass


class MatterUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    status: Optional[str] = Field(None)


class MatterOut(MatterBase):
    id: UUID
    organization_id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ─────────── MatterMembership ───────────

class MatterMembershipCreate(BaseModel):
    user_id: UUID
    role: str = Field(default="viewer")


class MatterMembershipOut(BaseModel):
    id: UUID
    matter_id: UUID
    user_id: UUID
    role: str
    joined_at: datetime

    model_config = {"from_attributes": True}


# ─────────── Document ───────────

class DocumentBase(BaseModel):
    filename: str = Field(..., max_length=512)
    mime_type: Optional[str] = None


class DocumentCreate(DocumentBase):
    pass


class DocumentStatus(BaseModel):
    filename: str
    status: str
    page_count: int
    file_size: Optional[int] = None
    mime_type: Optional[str] = None
    uploaded_by: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class DocumentOut(DocumentBase):
    id: UUID
    matter_id: UUID
    status: str
    metadata: Optional[dict] = None
    uploaded_by: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ─────────── QueryLog ───────────

class QueryLogCreate(BaseModel):
    user_id: Optional[UUID] = None
    matter_id: Optional[UUID] = None
    query_text: str
    response_text: Optional[str] = None
    model_used: Optional[str] = None
    latency_ms: Optional[int] = None


class QueryLogOut(BaseModel):
    id: UUID
    query_text: str
    response_text: Optional[str] = None
    model_used: Optional[str] = None
    latency_ms: Optional[int] = None
    created_at: datetime

    model_config = {"from_attributes": True}


# ─────────── AccessLog ───────────

class AccessLogOut(BaseModel):
    id: UUID
    user_id: Optional[UUID] = None
    resource_type: str
    resource_id: UUID
    action: str
    ip_address: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


# ─────────── Health ───────────

class HealthOut(BaseModel):
    status: str
    app_name: str


class ReadyOut(BaseModel):
    status: str
    checks: dict
