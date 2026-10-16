import json
import os
from contextlib import asynccontextmanager
from datetime import datetime
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

from .database import init_db, get_db
from .auth import hash_password, verify_password, create_access_token, get_current_user, require_admin
from .discord_notify import notify_user_registered, notify_streak_milestone, notify_certificate_earned
from .schemas import (
    RegisterRequest,
    LoginRequest,
    UserResponse,
    TokenResponse,
    ProfileUpdateRequest,
    ProgressSyncRequest,
    ProgressSyncResponse,
    NewsletterSubscribeRequest,
    BroadcastCampaignRequest,
    AdminUserRoleUpdate,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables and migrations
    init_db()
    # Optional one-time admin bootstrap. Runs only when NO admin exists and both
    # ADMIN_EMAIL and ADMIN_PASSWORD are set. Never modifies existing accounts.
    admin_email = os.environ.get("ADMIN_EMAIL", "").strip().lower()
    admin_password = os.environ.get("ADMIN_PASSWORD", "")
    if admin_email and admin_password:
        with get_db() as db:
            has_admin = db.execute("SELECT 1 FROM users WHERE role = 'admin' LIMIT 1").fetchone()
            if not has_admin:
                username = admin_email.split("@")[0]
                db.execute(
                    """
                    INSERT INTO users (email, username, display_name, hashed_password, role, bio)
                    VALUES (?, ?, ?, ?, 'admin', 'Lead Educator & System Administrator')
                    """,
                    (admin_email, username, "Codeethos Admin", hash_password(admin_password)),
                )
    yield


app = FastAPI(title="Codeethos API", version="1.0.0", lifespan=lifespan)

# Allow CORS for development and production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def user_to_response(u: dict) -> UserResponse:
    keys = u.keys() if hasattr(u, "keys") else {}
    return UserResponse(
        id=u["id"],
        email=u["email"],
        username=u["username"],
        display_name=u["display_name"] if "display_name" in keys and u["display_name"] else u["username"],
        avatar_seed=u["avatar_seed"] if "avatar_seed" in keys and u["avatar_seed"] else "🐍",
        role=u["role"],
        avatar_url=u["avatar_url"] or "",
        bio=u["bio"] or "",
        xp=u["xp"] or 0,
        level=u["level"] or 1,
        streak_count=u["streak_count"] or 1,
        created_at=str(u["created_at"]),
    )


# ─────────────────────────────────────────────────────────
# AUTH ENDPOINTS
# ─────────────────────────────────────────────────────────


@app.post("/api/auth/register", response_model=TokenResponse)
def register(req: RegisterRequest):
    email = req.email.strip().lower()
    username = req.username.strip()
    display_name = req.display_name.strip() if req.display_name else username

    with get_db() as db:
        existing = db.execute("SELECT id FROM users WHERE lower(email) = ? OR lower(username) = ?", (email, username.lower())).fetchone()
        if existing:
            raise HTTPException(status_code=400, detail="Email or username is already registered")

        pwd_hash = hash_password(req.password)
        cursor = db.execute(
            """
            INSERT INTO users (email, username, display_name, hashed_password, role, xp, level, streak_count)
            VALUES (?, ?, ?, ?, 'student', 0, 1, 1)
            """,
            (email, username, display_name, pwd_hash),
        )
        user_id = cursor.lastrowid
        user = db.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()

    user_dict = dict(user)
    notify_user_registered(user_dict["username"], user_dict.get("display_name"))
    token = create_access_token({"sub": str(user_id), "role": user_dict["role"]})
    return TokenResponse(access_token=token, user=user_to_response(user_dict))


@app.post("/api/auth/login", response_model=TokenResponse)
def login(req: LoginRequest):
    identifier = (req.username_or_email or req.identifier or "").strip()
    if not identifier:
        raise HTTPException(status_code=400, detail="Username or email is required")

    with get_db() as db:
        user = db.execute(
            "SELECT * FROM users WHERE lower(email) = ? OR lower(username) = ?",
            (identifier.lower(), identifier.lower()),
        ).fetchone()

        if not user or not verify_password(req.password, user["hashed_password"]):
            raise HTTPException(status_code=400, detail="Invalid username/email or password")

        user_dict = dict(user)

    token = create_access_token({"sub": str(user_dict["id"]), "role": user_dict["role"]})
    return TokenResponse(access_token=token, user=user_to_response(user_dict))


@app.get("/api/auth/me", response_model=UserResponse)
def get_me(user: dict = Depends(get_current_user)):
    return user_to_response(user)


# ─────────────────────────────────────────────────────────
# PROFILE ENDPOINTS
# ─────────────────────────────────────────────────────────


@app.put("/api/profile", response_model=UserResponse)
def update_profile(req: ProfileUpdateRequest, user: dict = Depends(get_current_user)):
    with get_db() as db:
        if req.display_name is not None:
            db.execute("UPDATE users SET display_name = ? WHERE id = ?", (req.display_name.strip(), user["id"]))
        if req.avatar_seed is not None:
            db.execute("UPDATE users SET avatar_seed = ? WHERE id = ?", (req.avatar_seed.strip(), user["id"]))
        if req.bio is not None:
            db.execute("UPDATE users SET bio = ? WHERE id = ?", (req.bio.strip(), user["id"]))
        if req.avatar_url is not None:
            db.execute("UPDATE users SET avatar_url = ? WHERE id = ?", (req.avatar_url.strip(), user["id"]))
        updated = db.execute("SELECT * FROM users WHERE id = ?", (user["id"],)).fetchone()
    return user_to_response(dict(updated))


# ─────────────────────────────────────────────────────────
# PROGRESS & SYNC ENDPOINTS
# ─────────────────────────────────────────────────────────


@app.get("/api/progress")
def get_progress(user: dict = Depends(get_current_user)):
    with get_db() as db:
        rows = db.execute("SELECT lesson_id, completed_steps_json, is_completed FROM progress WHERE user_id = ?", (user["id"],)).fetchall()
        steps_map = {}
        completed_lessons = []
        for r in rows:
            lesson_id = r["lesson_id"]
            if r["is_completed"]:
                completed_lessons.append(lesson_id)
            try:
                steps_map[lesson_id] = json.loads(r["completed_steps_json"])
            except Exception:
                steps_map[lesson_id] = []

        badges = []
        try:
            raw_badges = user.get("badges_json") if hasattr(user, "get") else user["badges_json"]
            if raw_badges:
                badges = json.loads(raw_badges)
        except Exception:
            badges = []

        return {
            "xp": user["xp"] or 0,
            "level": user["level"] or 1,
            "streak_days": user["streak_count"] or 1,
            "streak": {"count": user["streak_count"] or 1, "last": user["last_active_date"] or ""},
            "lessons": completed_lessons,
            "steps": steps_map,
            "badges": badges,
        }


@app.post("/api/progress/sync", response_model=ProgressSyncResponse)
def sync_progress(req: ProgressSyncRequest, user: dict = Depends(get_current_user)):
    new_xp = max(user["xp"] or 0, req.xp or 0)
    new_level = max(1, int((new_xp / 60) ** 0.5) + 1)
    client_streak = req.streak_days or req.streak or 1
    new_streak = max(user["streak_count"] or 1, client_streak)
    badges_json = json.dumps(req.badges or [])

    with get_db() as db:
        db.execute(
            "UPDATE users SET xp = ?, level = ?, streak_count = ?, badges_json = ?, last_active_date = ? WHERE id = ?",
            (new_xp, new_level, new_streak, badges_json, req.last_active or datetime.now().strftime("%Y-%m-%d"), user["id"]),
        )

        # Handle steps & completed lessons
        steps_dict = req.steps or (req.lessons if isinstance(req.lessons, dict) else {})
        for lesson_id, steps in steps_dict.items():
            steps_json = json.dumps(steps)
            db.execute(
                """
                INSERT INTO progress (user_id, lesson_id, completed_steps_json, is_completed, updated_at)
                VALUES (?, ?, ?, 0, CURRENT_TIMESTAMP)
                ON CONFLICT(user_id, lesson_id) DO UPDATE SET
                    completed_steps_json = excluded.completed_steps_json,
                    updated_at = CURRENT_TIMESTAMP
                """,
                (user["id"], str(lesson_id), steps_json),
            )

        if isinstance(req.lessons, list):
            for lesson_id in req.lessons:
                db.execute(
                    """
                    INSERT INTO progress (user_id, lesson_id, completed_steps_json, is_completed, updated_at)
                    VALUES (?, ?, '[]', 1, CURRENT_TIMESTAMP)
                    ON CONFLICT(user_id, lesson_id) DO UPDATE SET
                        is_completed = 1,
                        updated_at = CURRENT_TIMESTAMP
                    """,
                    (user["id"], str(lesson_id)),
                )
            if len(req.lessons) >= 8:
                notify_certificate_earned(user["username"], f"CE-PY-{user['id']:04d}")

    if new_streak >= 7 and (user["streak_count"] or 0) < 7:
        notify_streak_milestone(user["username"], new_streak)

    return ProgressSyncResponse(success=True, xp=new_xp, level=new_level, streak_count=new_streak)


# ─────────────────────────────────────────────────────────
# NEWSLETTER ENDPOINTS
# ─────────────────────────────────────────────────────────


@app.post("/api/newsletter/subscribe")
def subscribe_newsletter(req: NewsletterSubscribeRequest):
    email = req.email.strip().lower()
    if "@" not in email or "." not in email:
        raise HTTPException(status_code=400, detail="Invalid email address format")

    with get_db() as db:
        existing = db.execute("SELECT id FROM newsletter_subscribers WHERE email = ?", (email,)).fetchone()
        if existing:
            return {"success": True, "message": "You are already subscribed to the Codeethos digest!"}

        db.execute("INSERT INTO newsletter_subscribers (email, source) VALUES (?, ?)", (email, req.source))

    return {"success": True, "message": "Subscribed successfully! Welcome to the Codeethos community 🚀"}


# ─────────────────────────────────────────────────────────
# ADMIN ENDPOINTS (Restricted to role == 'admin')
# ─────────────────────────────────────────────────────────


@app.get("/api/admin/metrics")
def get_admin_metrics(admin: dict = Depends(require_admin)):
    with get_db() as db:
        total_users = db.execute("SELECT COUNT(*) FROM users").fetchone()[0]
        total_subscribers = db.execute("SELECT COUNT(*) FROM newsletter_subscribers WHERE is_active = 1").fetchone()[0]
        total_xp = db.execute("SELECT COALESCE(SUM(xp), 0) FROM users").fetchone()[0]
        total_completions = db.execute("SELECT COUNT(*) FROM progress WHERE is_completed = 1").fetchone()[0]
        active_learners = db.execute("SELECT COUNT(*) FROM users WHERE xp > 0").fetchone()[0]

        recent_users = db.execute(
            "SELECT id, username, display_name, email, role, xp, level, created_at FROM users ORDER BY id DESC LIMIT 5"
        ).fetchall()

    return {
        "total_users": total_users,
        "active_learners": active_learners,
        "total_subscribers": total_subscribers,
        "total_xp_awarded": total_xp,
        "total_lessons_completed": total_completions,
        "total_lesson_completions": total_completions,
        "recent_users": [dict(u) for u in recent_users],
    }


@app.get("/api/admin/users")
def get_admin_users(q: str = "", admin: dict = Depends(require_admin)):
    with get_db() as db:
        if q.strip():
            term = f"%{q.strip().lower()}%"
            rows = db.execute(
                "SELECT id, username, display_name, email, role, xp, level, streak_count, created_at FROM users WHERE lower(username) LIKE ? OR lower(email) LIKE ? ORDER BY id DESC",
                (term, term),
            ).fetchall()
        else:
            rows = db.execute(
                "SELECT id, username, display_name, email, role, xp, level, streak_count, created_at FROM users ORDER BY id DESC LIMIT 100"
            ).fetchall()

    return {"users": [dict(r) for r in rows]}


@app.patch("/api/admin/users/{user_id}/role")
def update_user_role(user_id: int, req: AdminUserRoleUpdate, admin: dict = Depends(require_admin)):
    with get_db() as db:
        db.execute("UPDATE users SET role = ? WHERE id = ?", (req.role, user_id))
    return {"success": True, "user_id": user_id, "new_role": req.role}


@app.get("/api/admin/newsletter/subscribers")
def get_newsletter_subscribers(admin: dict = Depends(require_admin)):
    with get_db() as db:
        rows = db.execute(
            "SELECT id, email, source, is_active, created_at FROM newsletter_subscribers ORDER BY id DESC LIMIT 200"
        ).fetchall()
    return {"subscribers": [dict(r) for r in rows]}


@app.post("/api/admin/newsletter/broadcast")
def broadcast_campaign(req: BroadcastCampaignRequest, admin: dict = Depends(require_admin)):
    with get_db() as db:
        subscribers = db.execute("SELECT email FROM newsletter_subscribers WHERE is_active = 1").fetchall()
        count = len(subscribers)
        db.execute(
            "INSERT INTO newsletter_campaigns (subject, content, recipients_count) VALUES (?, ?, ?)",
            (req.subject, req.content, count),
        )
    return {
        "success": True,
        "message": f"Broadcast campaign queued to {count} active subscribers!",
        "sent_count": count,
        "recipients_count": count,
    }
