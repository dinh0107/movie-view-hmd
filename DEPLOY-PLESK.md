# Deploy Next.js lên Windows Plesk

## Yêu cầu trên server

- Plesk + **Node.js Toolkit** (Node **20.x** trở lên)
- Domain trỏ về hosting
- (Tuỳ chọn IIS) URL Rewrite + ARR nếu dùng reverse proxy qua `web.config`

## Biến môi trường

Tạo file `.env` (hoặc Custom environment variables trong Plesk):

```
SITE_URL=https://domain-cua-ban.com
NEXT_PUBLIC_SITE_URL=https://domain-cua-ban.com
PORT=3000
HOSTNAME=0.0.0.0
NODE_ENV=production
```

`SITE_URL` phải đúng domain production (canonical / sitemap / robots).

## Cách A — Build trên máy local, upload zip (khuyến nghị)

### 1. Pack

```powershell
cd C:\Users\nguye\Desktop\movie-view
powershell -ExecutionPolicy Bypass -File .\scripts\pack-plesk.ps1
```

Ra file `plesk-deploy.zip`.

### 2. Upload lên Plesk

1. File Manager → thư mục app (vd. `httpdocs` hoặc `nodejs-app`)
2. Upload + Extract `plesk-deploy.zip`
3. Copy `.env.example` → `.env`, sửa domain

### 3. Bật Node.js trong Plesk

**Domains → domain → Node.js:**

| Field | Value |
|-------|--------|
| Node.js version | 20.x |
| Application mode | `production` |
| Application root | thư mục chứa `main.js` |
| Application startup file | `main.js` |
| Application URL | `/` |

**Environment variables:** thêm `SITE_URL`, `PORT=3000`, `NODE_ENV=production`.

Bấm **Enable Node.js** / **Restart App**.

### 4. Proxy domain → Node (nếu Plesk chưa proxy sẵn)

- Nếu Node.js Toolkit đã gắn domain → thường xong.
- Nếu site vẫn mở IIS tĩnh: dùng `web.config` (reverse proxy `127.0.0.1:3000`) — cần ARR + URL Rewrite.

## Cách B — Build trên server (cần đủ RAM)

1. Upload source (không cần `node_modules`)
2. SSH / Plesk Terminal:

```bat
npm ci
npm run build
```

3. Copy static vào standalone:

```bat
xcopy /E /I /Y .next\static .next\standalone\.next\static
xcopy /E /I /Y public .next\standalone\public
```

4. Startup file = `main.js`, Restart App.

## Kiểm tra sau deploy

- `https://domain/` mở được
- `https://domain/robots.txt`
- `https://domain/sitemap.xml`
- View Source trang phim có `canonical` đúng domain

## Lỗi thường gặp

| Lỗi | Cách xử lý |
|-----|------------|
| `missing .next/standalone/server.js` | Chưa build / pack sai (file này do Next tạo; startup Plesk vẫn là `main.js`) |
| Port bị chiếm | Đổi `PORT` trong `.env` + `web.config` |
| CSS/JS 404 | Thiếu copy `.next/static` vào standalone |
| Canonical sai domain | Set `SITE_URL` / `NEXT_PUBLIC_SITE_URL` |
| App crash khi build trên host | Dùng Cách A (pack local) |

## Ghi chú

- Không cần Vercel khi chạy Plesk; Analytics/Speed Insights của Vercel có thể bỏ hoặc giữ (không bắt buộc).
- Firewall Windows: cho phép localhost `PORT` nếu dùng IIS proxy.
- Sau mỗi lần sửa code: chạy lại `pack-plesk.ps1` → upload → Restart App.
