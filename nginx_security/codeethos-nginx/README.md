# Codeethos nginx — authenticated /llm/ proxy + security headers

## Files → where they go

| File | Install to |
|---|---|
| `conf.d/codeethos-zones.conf` | `/etc/nginx/conf.d/` |
| `snippets/codeethos-security-headers.conf` | `/etc/nginx/snippets/` |
| `snippets/codeethos-api-proxy.conf` | `/etc/nginx/snippets/` |
| `snippets/codeethos-llm-proxy.conf` | `/etc/nginx/snippets/` |
| `sites-available/codeethos.conf` | merge into your existing site file |
| `secrets/codeethos-llm-auth.conf.example` | create `/etc/nginx/secrets/codeethos-llm-auth.conf` (steps below) |
| `frontend-llm-client.js` | change in the Codeethos frontend (not nginx) |

## Install

```bash
# 0. back up what you have
cp -a /etc/nginx /root/nginx-backup-$(date +%F)

# 1. edit the two CHANGE lines first:
#    conf.d/codeethos-zones.conf      -> upstream codeethos_api (your FastAPI port)
#    sites-available/codeethos.conf   -> root (your built frontend dir)
#    If nginx is NOT on your LAN, switch upstream codeethos_llm to 100.96.208.90:8000

# 2. copy files
cp conf.d/codeethos-zones.conf /etc/nginx/conf.d/
cp snippets/*.conf             /etc/nginx/snippets/

# 3. Cloudflare real-IP list (needed for per-visitor rate limits)
{ curl -s https://www.cloudflare.com/ips-v4; echo; curl -s https://www.cloudflare.com/ips-v6; } \
  | sed '/^$/d; s/.*/set_real_ip_from &;/' > /etc/nginx/snippets/cloudflare-ips.conf
# using cloudflared (tunnel)? also add:  echo 'set_real_ip_from 127.0.0.1;' >> /etc/nginx/snippets/cloudflare-ips.conf

# 4. llama.cpp key — server-side only (run on the nginx host; key comes from CT 101)
install -d -m 700 /etc/nginx/secrets
KEY='paste-LLAMACPP_API_KEY'
printf 'proxy_set_header Authorization "Bearer %s";\n' "$KEY" > /etc/nginx/secrets/codeethos-llm-auth.conf
chmod 600 /etc/nginx/secrets/codeethos-llm-auth.conf; unset KEY

# 5. merge sites-available/codeethos.conf into your site, then
nginx -t && systemctl reload nginx
```

## Verify after reload

```bash
U=https://codeethos.tech
curl -sI $U | grep -iE 'strict|frame|nosniff|content-security'   # headers present
curl -s -o /dev/null -w '%{http_code}\n' $U/.env                 # 404
curl -s -o /dev/null -w '%{http_code}\n' -X POST $U/llm/v1/chat/completions   # 401 (anonymous blocked)
curl -s -o /dev/null -w '%{http_code}\n' $U/llm/props            # 404 (only 2 routes exposed)
```
Then sign in on the site, ask the tutor something, and confirm it streams.

## What it does

- **/llm/** — only `GET /llm/v1/models` and `POST /llm/v1/chat/completions` exist. Each request
  must carry a valid Codeethos login token (checked via `/api/auth/me`); nginx then replaces it
  with the llama.cpp key, so the key never reaches a browser. Limits: 6 req/min per user
  (burst 3), 10/min per IP, 1 stream at a time per user, 64 KB request body.
- **Rate limits** — login/register 5/min per IP, newsletter 3/min, rest of `/api/` 10/s.
- **Headers** — HSTS, nosniff, X-Frame-Options, Referrer-Policy, Permissions-Policy, COOP,
  and CSP in **report-only** mode.
- **Dotfiles** — `/.env`, `/.git/...` return a real 404 instead of the app.
- **Caching** — hashed `/assets/` cached for a year; `index.html` revalidated each load so
  deploys show up immediately.

## Things to know

1. **Frontend change is required.** Until `frontend-llm-client.js` is applied, the tutor sends
   the user's `apiKey` setting (empty) instead of their login token, and nginx returns 401.
2. **Turn CSP on after a test day.** Browse every page and run code with DevTools open; fix any
   `[Report Only]` violations (Pyodide may need `'unsafe-eval'`), then rename the header to
   `Content-Security-Policy`.
3. **Model choice is enforced only in the frontend.** Vanilla nginx can't read the JSON body, so a
   determined user could request any model in your `presets.ini` — including
   `deepseek-v4-flash-0731`, which needs VM 103 shut down. If that matters, point
   `upstream codeethos_llm` at LiteLLM instead and use a virtual key restricted to
   `qwen38-27b-abl` with its own RPM limit.
4. **Cloudflare idle timeout is 100 s** (free plan). Streams that keep sending tokens are fine,
   but a very long prompt that takes >100 s before the first token returns a 524.
5. **SSL mode:** this listens on port 80. That's correct for a cloudflared tunnel or Cloudflare
   "Flexible"; for "Full (strict)" keep your existing `listen 443 ssl` + cert lines.
6. **HSTS** is set without `preload`; add it only once you're sure every subdomain is HTTPS.

Tested locally against mock API/LLM servers: anonymous and bad tokens → 401, valid token → 200
with the upstream receiving the server key, `/llm/props` → 404, wrong method → 403,
`/.env` and `/.git/HEAD` → 404, SPA routes → 200, login throttled after 6 rapid attempts,
LLM throttled after 4.
