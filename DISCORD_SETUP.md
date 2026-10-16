# 🎮 Codeethos Official Discord Community Setup Guide

A complete, turnkey blueprint for launching and organizing the **Codeethos Developer Community** on Discord.

---

## 🏛️ 1. Server Profile & Branding

* **Server Name**: `Codeethos Community` or `Codeethos Developer Guild`
* **Description**: `Official community for Codeethos — learn Python, backend engineering, arcade games, and machine learning by doing.`
* **Server Icon**: Golden terminal icon `~$` or the Codeethos lightning mark `⚡` on a dark obsidian background (`#0c0d0e`).
* **Custom Invite Link**: Once community features are enabled in Discord Server Settings, claim `discord.gg/codeethos` (or use a permanent non-expiring link `https://discord.gg/YOUR_CODE`).

---

## 👥 2. Roles & Permissions Hierarchy

Organize roles so active learners and contributors feel rewarded:

| Role Name | Color | Description / How to Earn | Permissions |
|---|---|---|---|
| **🛡️ Staff / Admin** | `#d4a65a` (Gold) | Server owners & moderators | Administrator |
| **⚡ Pro Engineer** | `#f39c12` (Amber) | Codeethos Pro subscribers & early supporters | Access to `#pro-lounge` & priority code review |
| **🎓 Graduate** | `#2ecc71` (Green) | Completed all 8 weeks & earned the Codeethos Certificate | Verified badge & access to alumni discussions |
| **🔥 Flamekeeper** | `#e67e22` (Orange) | Earned for reaching a 7+ day continuous learning streak | Recognized community active learner |
| **🎯 Sharpshooter** | `#3498db` (Blue) | Passed 10 challenges on the first attempt (spree) | Community recognition |
| **🐍 Learner** | `#95a5a6` (Silver) | Default role given to all members upon joining | Standard chat & code sharing |

---

## 📂 3. Channel Layout & Topics

### 📌 WELCOME & INFO
* `#📢-announcements` (Read-only): Platform updates, new modules, server maintenance.
* `#📜-welcome-rules` (Read-only): Code of conduct, links to [codeethos.tech](https://codeethos.tech), and how to get roles.
* `#👋-introductions`: New members share what they are building and their coding background.
* `#💡-feedback-and-bugs`: Bug reports, UI suggestions, and feature requests.

### 🐍 CODEETHOS CURRICULUM
* `#week-1-foundations`: Variables, control flow, loops, and interactive terminal CLI.
* `#week-2-data-structures`: Lists, dicts, tuples, comprehensions, and DRY functions.
* `#week-3-oop-and-classes`: Classes, inheritance, polymorphism, flashcard project.
* `#week-4-files-and-apis`: JSON, requests, error handling, trivia capstone.
* `#week-5-graphics-arcade`: Windowing, Cartesian coordinates, generative math art.
* `#week-6-game-dev-capstone`: 2D physics engine, collisions, platformer capstone.
* `#week-7-ml-fundamentals`: Scikit-Learn datasets, feature arrays, classifier models.
* `#week-8-production-pipelines`: Preprocessing, pipelines, cross-validation, deployment.

### 🏆 CELEBRATIONS & SHOWCASE
* `#🔥-streak-flex`: Screenshots of daily streaks, level-ups, and mystery loot chest drops.
* `#📜-certificates`: Verified digital certificates shared by course graduates.
* `#💻-project-showcase`: Share games built with Week 6 Arcade or ML models from Week 8.

### ⚡ PRO GUILD (Private / Restricted to `@Pro Engineer`)
* `#pro-lounge`: Exclusive chat with core creators, early access sneak peeks, and in-depth architecture discussions.
* `#code-reviews`: Peer review and mentoring for student projects.

---

## 📜 4. Copy-Paste Templates

### Template A: `#📜-welcome-rules`

```markdown
# ⚡ Welcome to Codeethos Community!

We are a hands-on community of developers learning Python, backend architecture, 2D game engines, and machine learning by **building and breaking real code**.

---

### 🚀 Getting Started
1. **Explore the Curriculum**: Jump into bite-sized, in-browser lessons at https://codeethos.tech
2. **Introduce Yourself**: Head over to <#introductions> and share your background and what you're working on.
3. **Ask for Help**: Stuck on a lesson test? Post your code in the corresponding `<#week-X>` channel!

---

### 🛡️ Code of Conduct
- **Socratic First**: When helping others, give hints, explain concepts, and ask guiding questions rather than pasting the direct answer.
- **Format Code Blocks**: Always use markdown formatting for code (` ```python `) so it is readable.
- **Be Encouraging & Respectful**: Everyone here is learning. No gatekeeping.
- **No Spam or Self-Promotion**: Keep discussions focused on software engineering.

Happy coding! 💻
```

---

### Template B: `#📢-announcements` (Launch Post)

```markdown
@everyone 🚀 **Welcome to the Official Codeethos Discord!**

We've officially launched the community hub for https://codeethos.tech!

Here's what is currently live on the platform:
✨ **Interactive In-Browser Runner**: Zero setup, pure WebAssembly Python execution.
👁 **Execution Step Visualizer**: Step line-by-line through your algorithms with live variable inspection.
🧊 **Streak Freezes & Mystery Chests**: Protect your daily habit and unlock rewards.
🤖 **Socratic AI Tutor**: Real-time guidance right inside your browser code editor.
🎤 **Voice Dictation & Audio Lessons**: Speak your questions and listen to lessons on the go.
📜 **Verified Certificates**: Earn your verifiable certificate upon finishing the 8-week track!

Hop into <#introductions> and let us know what you're building!
```

---

## 🤖 5. Discord Webhook Integration (Automated Notifications)

You can link your live Codeethos server to Discord so that whenever a student earns a **Certificate** or registers, an automated rich embed is sent to your Discord channel.

1. In Discord: Server Settings → **Integrations** → **Webhooks** → **New Webhook**.
2. Name it `Codeethos Bot` and select your `#📜-certificates` or `#📢-announcements` channel.
3. Click **Copy Webhook URL**.
4. Add it to your server `.env`:
   ```bash
   DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/..."
   ```
