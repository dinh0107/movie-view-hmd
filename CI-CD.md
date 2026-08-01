# CI/CD — GitHub Actions → Windows Plesk

## Workflows

| File | Khi chạy | Việc |
|------|----------|------|
| `.github/workflows/ci.yml` | Push / PR → `main` | Lint + build (kiểm tra) |
| `.github/workflows/deploy-plesk.yml` | Push → `main` hoặc chạy tay | Build standalone + FTP lên Plesk |

## Secrets cần thêm trên GitHub

**Repo → Settings → Secrets and variables → Actions → New repository secret**

| Secret | Ví dụ | Bắt buộc |
|--------|--------|----------|
| `FTP_SERVER` | `ftp.domain.com` hoặc IP | Có |
| `FTP_USERNAME` | user FTP Plesk | Có |
| `FTP_PASSWORD` | mật khẩu FTP | Có |
| `FTP_REMOTE_DIR` | `/httpdocs/` hoặc `./` (workflow tự thêm `/` cuối) | Có |
| `SITE_URL` | `https://phimngay.top` | Nên có |
| `NEXT_PUBLIC_SITE_URL` | cùng `SITE_URL` | Nên có |
| `PORT` | `3303` | Không |

Protocol mặc định: **`ftp`** (Plesk Windows hay bị `ECONNRESET` với `ftps`).

Đổi protocol:
- **Actions → Deploy Plesk → Run workflow** → chọn `ftp` / `ftps` / `ftps-legacy`
- Hoặc Variables: `FTP_PROTOCOL`, `FTP_PORT` (Settings → Variables)

Nếu vẫn lỗi kết nối: trong Plesk bật FTP (không bắt buộc FTPS), kiểm tra firewall passive ports.

### Lấy FTP trong Plesk

1. **Websites & Domains → FTP Access** (hoặc File Manager → connection info)
2. Host / username / password
3. `FTP_REMOTE_DIR` = thư mục chứa `main.js` (Application root Node.js)

## Cách chạy

1. Push code lên `main` → CI chạy tự động  
2. Deploy chạy sau khi build OK (cùng push `main`)  
3. Hoặc **Actions → Deploy Plesk → Run workflow**

Sau deploy: vào Plesk → **Node.js → Restart App** (startup file vẫn là `main.js`).

> Lưu ý: FTP upload **không tự restart** Node app. Có thể restart tay, hoặc thêm secret webhook/SSH sau.

## Local pack (không CI)

```bash
npm run pack:plesk
```

Ra `plesk-deploy.zip` để upload tay.

## Checklist lần đầu

- [ ] Node 20 trên Plesk, Startup File = `main.js`
- [ ] `PORT=3303` trong `.env` / Plesk env
- [ ] Đã thêm đủ secrets FTP trên GitHub
- [ ] Push thử 1 commit lên `main` → xem tab Actions
