import sqlite3
from pathlib import Path
from contextlib import contextmanager

import shutil

DB_DIR = Path(__file__).resolve().parent
DB_PATH = DB_DIR / "codeethos.db"
LEGACY_DB_PATH = DB_DIR / "python_profesor.db"

# Migrate legacy database if codeethos.db does not exist yet
if not DB_PATH.exists() and LEGACY_DB_PATH.exists():
    try:
        shutil.copy2(LEGACY_DB_PATH, DB_PATH)
    except Exception:
        pass


def init_db():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA journal_mode=WAL;")
    cursor = conn.cursor()

    cursor.executescript("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        username TEXT UNIQUE NOT NULL,
        hashed_password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'student',
        display_name TEXT DEFAULT '',
        avatar_seed TEXT DEFAULT '🐍',
        avatar_url TEXT DEFAULT '',
        bio TEXT DEFAULT '',
        xp INTEGER DEFAULT 0,
        level INTEGER DEFAULT 1,
        streak_count INTEGER DEFAULT 1,
        badges_json TEXT DEFAULT '[]',
        last_active_date TEXT DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        lesson_id TEXT NOT NULL,
        completed_steps_json TEXT DEFAULT '[]',
        is_completed INTEGER DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, lesson_id),
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS submissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        lesson_id TEXT NOT NULL,
        step_index INTEGER NOT NULL,
        code TEXT NOT NULL,
        passed INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        source TEXT DEFAULT 'web_footer',
        is_active INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS newsletter_campaigns (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        subject TEXT NOT NULL,
        content TEXT NOT NULL,
        recipients_count INTEGER DEFAULT 0,
        sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    for col, col_def in [
        ("display_name", "TEXT DEFAULT ''"),
        ("avatar_seed", "TEXT DEFAULT '🐍'"),
        ("badges_json", "TEXT DEFAULT '[]'"),
    ]:
        try:
            cursor.execute(f"ALTER TABLE users ADD COLUMN {col} {col_def}")
        except Exception:
            pass

    conn.commit()
    conn.close()


@contextmanager
def get_db():
    conn = sqlite3.connect(DB_PATH, timeout=10)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()
