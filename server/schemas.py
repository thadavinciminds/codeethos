from typing import Optional, Any
from pydantic import BaseModel, Field


class RegisterRequest(BaseModel):
    email: str = Field(..., min_length=3, max_length=120)
    username: str = Field(..., min_length=2, max_length=50)
    password: str = Field(..., min_length=6, max_length=100)
    display_name: Optional[str] = None


class LoginRequest(BaseModel):
    username_or_email: Optional[str] = None
    identifier: Optional[str] = None
    password: str


class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    display_name: Optional[str] = ""
    avatar_seed: Optional[str] = "🐍"
    role: str
    avatar_url: Optional[str] = ""
    bio: Optional[str] = ""
    xp: int = 0
    level: int = 1
    streak_count: int = 1
    created_at: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class ProfileUpdateRequest(BaseModel):
    display_name: Optional[str] = None
    avatar_seed: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None


class ProgressSyncRequest(BaseModel):
    xp: int = 0
    lessons: Any = Field(default_factory=list)
    steps: Optional[dict[str, list[int]]] = None
    badges: list[str] = Field(default_factory=list)
    streak: Optional[int] = None
    streak_days: Optional[int] = None
    last_active: Optional[str] = None


class ProgressSyncResponse(BaseModel):
    success: bool
    xp: int
    level: int
    streak_count: int


class NewsletterSubscribeRequest(BaseModel):
    email: str = Field(..., min_length=5, max_length=120)
    source: str = "web_footer"


class BroadcastCampaignRequest(BaseModel):
    subject: str = Field(..., min_length=3, max_length=200)
    content: str = Field(..., min_length=5)


class AdminUserRoleUpdate(BaseModel):
    role: str = Field(..., pattern="^(student|admin)$")
