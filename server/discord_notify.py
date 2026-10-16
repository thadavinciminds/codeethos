import json
import logging
import os
import threading
import urllib.request

logger = logging.getLogger("codeethos.discord")


def _post_webhook(payload: dict):
    url = os.environ.get("DISCORD_WEBHOOK_URL", "").strip()
    if not url:
        return

    try:
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            url,
            data=data,
            headers={
                "Content-Type": "application/json",
                "User-Agent": "CodeethosNotifier/1.0",
            },
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=5) as resp:
            if resp.status not in (200, 204):
                logger.warning(f"Discord webhook responded with HTTP {resp.status}")
    except Exception as e:
        logger.warning(f"Failed to deliver Discord webhook: {e}")


def send_discord_async(payload: dict):
    """Dispatches webhook delivery in a background daemon thread to avoid blocking FastAPI requests."""
    t = threading.Thread(target=_post_webhook, args=(payload,), daemon=True)
    t.start()


def notify_user_registered(username: str, display_name: str = ""):
    """Notify Discord when a new learner signs up."""
    name = display_name or username
    payload = {
        "username": "Codeethos Guild",
        "avatar_url": "https://codeethos.tech/favicon.ico",
        "embeds": [
            {
                "title": "🎉 New Learner Enrolled!",
                "description": f"Welcome **{name}** (`@{username}`) to the Codeethos interactive Python curriculum!",
                "color": 0xD4A65A,  # Codeethos gold
                "fields": [
                    {"name": "Status", "value": "Module 1: Foundations", "inline": True},
                    {"name": "Platform", "value": "[codeethos.tech](https://codeethos.tech)", "inline": True},
                ],
                "footer": {"text": "Codeethos · Hands-on Developer Mastery"},
            }
        ],
    }
    send_discord_async(payload)


def notify_certificate_earned(username: str, cert_id: str, tracks: str = "Python & Backend Systems"):
    """Notify Discord when a student completes all 8 weeks and earns a Certificate."""
    payload = {
        "username": "Codeethos Guild",
        "avatar_url": "https://codeethos.tech/favicon.ico",
        "embeds": [
            {
                "title": "🎓 Course Graduate Verified!",
                "description": f"Congratulations to **@{username}** for mastering the full 8-week curriculum!",
                "color": 0x2ECC71,  # Emerald green
                "fields": [
                    {"name": "Curriculum", "value": tracks, "inline": True},
                    {"name": "Certificate ID", "value": f"`{cert_id}`", "inline": True},
                    {
                        "name": "Verified Link",
                        "value": f"[View on Codeethos](https://codeethos.tech/#/profile)",
                        "inline": False,
                    },
                ],
                "footer": {"text": "Verified Developer Completion · Codeethos"},
            }
        ],
    }
    send_discord_async(payload)


def notify_streak_milestone(username: str, streak_days: int):
    """Notify Discord when a user hits a milestone streak (e.g. 7d, 14d, 30d)."""
    payload = {
        "username": "Codeethos Guild",
        "avatar_url": "https://codeethos.tech/favicon.ico",
        "embeds": [
            {
                "title": "🔥 Streak Milestone Reached!",
                "description": f"**@{username}** has maintained a **{streak_days}-Day Learning Streak**!",
                "color": 0xE67E22,  # Flame orange
                "fields": [
                    {"name": "Streak Days", "value": f"🔥 {streak_days} days", "inline": True},
                    {"name": "Badge", "value": "Flamekeeper Unlocked", "inline": True},
                ],
                "footer": {"text": "Codeethos Daily Consistency"},
            }
        ],
    }
    send_discord_async(payload)
