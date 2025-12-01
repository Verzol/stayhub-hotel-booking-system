# 🏨 StayHub - Hotel Booking & Management Platform

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Java](https://img.shields.io/badge/Java-21-orange.svg)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.7-brightgreen.svg)
![React](https://img.shields.io/badge/React-18-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

**Nền tảng đặt phòng khách sạn và quản lý tài sản toàn diện**

[Giới thiệu](#-giới-thiệu) • [Tính năng](#-tính-năng) • [Cài đặt](#-cài-đặt) • [Sử dụng](#-sử-dụng) • [Tài liệu](#-tài-liệu)

</div>

---

## 📋 Mục lục

- [Giới thiệu](#-giới-thiệu)
- [Quick Start](#-quick-start)
- [Tính năng](#-tính-năng)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Yêu cầu hệ thống](#-yêu-cầu-hệ-thống)
- [Cài đặt](#-cài-đặt)
- [Cấu hình](#-cấu-hình)
- [Chạy ứng dụng](#-chạy-ứng-dụng)
- [Cấu trúc dự án](#-cấu-trúc-dự-án)
- [API Documentation](#-api-documentation)
- [Testing](#-testing)
- [Monitoring](#-monitoring)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

---

## ⚡ Quick Start

Nếu bạn muốn chạy nhanh ứng dụng, làm theo các bước sau:

```bash
# 1. Clone repository
git clone https://github.com/your-username/stayhub.git
cd stayhub

# 2. Tạo file .env (xem phần Cấu hình)
cp .env.example .env
# Chỉnh sửa .env với thông tin database và các credentials của bạn

# 3. Chạy với Docker Compose (khuyến nghị)
docker-compose up -d

# 4. Truy cập ứng dụng
# Frontend: http://localhost:3000
# Backend API: http://localhost:8080/api
# Grafana: http://localhost:3001
```

Xem [phần Cài đặt](#-cài-đặt) để biết hướng dẫn chi tiết hơn.

---

## 🎯 Giới thiệu

**StayHub** là một nền tảng đặt phòng khách sạn và quản lý tài sản toàn diện, được thiết kế để kết nối du khách với chủ nhà. Hệ thống cung cấp trải nghiệm mượt mà cho khách hàng trong việc khám phá và đặt chỗ nghỉ, đồng thời trao quyền cho chủ nhà với các công cụ mạnh mẽ để quản lý tài sản, kho hàng và doanh thu của họ.

### Đối tượng sử dụng

- **Khách hàng (Customers)**: Tìm kiếm, đặt phòng và quản lý các đặt chỗ của họ
- **Chủ nhà (Hosts)**: Quản lý khách sạn, phòng, lịch đặt chỗ và doanh thu
- **Quản trị viên (Admins)**: Quản lý người dùng, kiểm duyệt nội dung và theo dõi hệ thống

---

## ✨ Tính năng

### 🔐 Authentication & User Management
- ✅ Đăng ký/Đăng nhập với Email & Password
- ✅ Xác thực email để tránh spam
- ✅ Đăng nhập xã hội (OAuth2) - Google, Facebook
- ✅ Quên mật khẩu & Đặt lại mật khẩu
- ✅ Hỗ trợ 2FA (Two-Factor Authentication)
- ✅ Quản lý hồ sơ người dùng với upload avatar
- ✅ Role-Based Access Control (RBAC): CUSTOMER, HOST, ADMIN

### 🏢 Host Management
- ✅ Tạo và quản lý khách sạn/tài sản
- ✅ Quản lý phòng với giá, dung lượng, cấu hình giường
- ✅ Upload và quản lý hình ảnh
- ✅ Chọn tiện ích từ danh sách hệ thống
- ✅ Lịch khả dụng trực quan
- ✅ Chặn/Bỏ chặn ngày thủ công
- ✅ Đồng bộ tự động với đặt chỗ

### 🔍 Search & Discovery
- ✅ Tìm kiếm nâng cao theo Thành phố/Tên khách sạn
- ✅ Lọc theo: Giá, Xếp hạng sao, Tiện ích, Loại phòng
- ✅ Sắp xếp theo: Giá (Thấp/Cao), Xếp hạng (Cao/Thấp)
- ✅ Xem bản đồ tương tác với các property dưới dạng pins
- ✅ Danh sách yêu thích (Wishlist)

### 📅 Booking Core
- ✅ Quy trình đặt chỗ từng bước: Tìm kiếm → Chọn phòng → Xem lại → Thanh toán → Xác nhận
- ✅ Khóa kho hàng: Ngăn chặn đặt chỗ trùng bằng cách khóa tạm thời phòng đã chọn trong 10 phút
- ✅ Động cơ định giá: `(Giá cơ bản × Số đêm) - Giảm giá + Phí dịch vụ`
- ✅ Tích hợp cổng thanh toán: VNPay/Stripe/PayPal (Sandbox)
- ✅ Hỗ trợ Webhook cho cập nhật trạng thái thanh toán
- ✅ Thanh toán QR Code

### 📊 Booking Management
- ✅ State Machine: `PENDING` → `CONFIRMED` → `CHECKED_IN` → `COMPLETED` (hoặc `CANCELLED`)
- ✅ Khách hàng: Xem lịch sử đặt chỗ, hủy đặt chỗ (với kiểm tra chính sách hoàn tiền tự động), tải hóa đơn
- ✅ Chủ nhà: Xem khách đến, quản lý check-in/check-out, xem tỷ lệ lấp đầy hàng ngày

### 💬 Social & Communication
- ✅ Đánh giá & Xếp hạng: Khách đã xác minh có thể đánh giá và đánh giá tài sản sau khi ở xong
- ✅ Hỗ trợ upload ảnh trong đánh giá
- ✅ Hệ thống nhắn tin: Chat real-time giữa Chủ nhà và Khách để phối hợp trước khi ở
- ✅ Thông báo: Cảnh báo real-time (Biểu tượng chuông) cho xác nhận đặt chỗ, tin nhắn mới và hủy đặt chỗ

### 👨‍💼 Admin Dashboard
- ✅ Analytics: Biểu đồ trực quan cho doanh thu, tăng trưởng người dùng mới và xu hướng đặt chỗ
- ✅ Quản lý người dùng: Cấm/Bỏ cấm người dùng, xem chi tiết người dùng
- ✅ Kiểm duyệt nội dung: Phê duyệt danh sách khách sạn mới trước khi chúng được công khai
- ✅ Cấu hình hệ thống: Quản lý cài đặt toàn cục, danh sách tiện ích và dữ liệu vị trí

---

## 🛠 Công nghệ sử dụng

### Backend
- **Language**: Java 21 (LTS)
- **Framework**: Spring Boot 3.5.7
  - Spring Security (Authentication & Authorization)
  - Spring Data JPA / Hibernate (ORM)
  - Spring WebSocket (Real-time messaging)
  - Spring Mail (Email verification)
  - Spring Boot Actuator (Monitoring)
- **Database**: PostgreSQL 16 (Managed via Supabase)
- **Security**: JWT (JSON Web Token), OAuth2
- **Build Tool**: Maven 3.9
- **Image Processing**: Thumbnailator

### Frontend
- **Framework**: React 18
- **Language**: TypeScript 5.9
- **Build Tool**: Vite 7.2
- **Styling**: Tailwind CSS 4.1
- **State Management**: React Context API & Hooks
- **Routing**: React Router 7.9
- **Forms**: React Hook Form + Zod validation
- **HTTP Client**: Axios
- **Maps**: Leaflet / React Leaflet
- **UI Components**: Lucide React (Icons)
- **Notifications**: Sonner
- **Web Workers**: Background processing (analytics, filtering, search)

### DevOps & Infrastructure
- **Containerization**: Docker & Docker Compose
- **Orchestration**: Kubernetes (K8s) ready
- **CI/CD**: GitHub Actions
- **Monitoring**: 
  - Prometheus (Metrics collection)
  - Grafana (Visualization & Dashboards)
  - Spring Boot Actuator (Health checks)
- **Database Management**: pgAdmin 4

---

## 💻 Yêu cầu hệ thống

### Development
- **Java**: JDK 21 hoặc cao hơn
- **Node.js**: v20.x hoặc cao hơn
- **npm**: v9.x hoặc cao hơn
- **Maven**: 3.9.x hoặc cao hơn
- **Docker**: 20.x hoặc cao hơn
- **Docker Compose**: 2.x hoặc cao hơn
- **PostgreSQL**: 16 (hoặc sử dụng Supabase)

### Production
- **Java Runtime**: JRE 21
- **Web Server**: Nginx (cho frontend)
- **Application Server**: Spring Boot embedded Tomcat
- **Database**: PostgreSQL 16
- **Container Runtime**: Docker / Kubernetes

---

## 🚀 Cài đặt

### 1. Clone Repository

```bash
git clone https://github.com/your-username/stayhub.git
cd stayhub
```

### 2. Tạo file `.env`

Tạo file `.env` ở thư mục gốc với nội dung sau:

```env
# Database Configuration (Supabase PostgreSQL)
DB_URL=jdbc:postgresql://your-supabase-host:5432/postgres
DB_USERNAME=your-db-username
DB_PASSWORD=your-db-password

# JWT Configuration
# Generate a strong secret key: openssl rand -base64 64
JWT_SECRET_KEY=your-super-secret-jwt-key-min-256-bits

# Mail Configuration (Gmail example)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
# Use App Password, not regular password!
MAIL_PASSWORD=your-app-password

# OAuth2 Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FACEBOOK_CLIENT_ID=your-facebook-app-id
FACEBOOK_CLIENT_SECRET=your-facebook-app-secret

# CORS Configuration (comma-separated)
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:3000

# pgAdmin Configuration (Optional)
PGADMIN_DEFAULT_EMAIL=admin@stayhub.com
PGADMIN_DEFAULT_PASSWORD=admin123

# Grafana Configuration (Optional)
GRAFANA_ADMIN_USER=admin
GRAFANA_ADMIN_PASSWORD=admin

# Booking Configuration
BOOKING_PAYMENT_HOLD_DURATION=10
```

**Lưu ý quan trọng:**
- ⚠️ **KHÔNG commit file `.env` vào Git** (đã được thêm vào `.gitignore`)
- 🔐 Sử dụng mật khẩu mạnh và secrets an toàn trong production
- 🔄 Rotate `JWT_SECRET_KEY` định kỳ
- 📧 Đối với Gmail, sử dụng **App Password** thay vì mật khẩu thông thường

### 3. Cài đặt Dependencies

#### Backend
```bash
cd src/server
mvn clean install
```

#### Frontend
```bash
cd src/client
npm install
```

---

## ⚙️ Cấu hình

### Database Setup

1. **Tạo database trên Supabase** (hoặc PostgreSQL local):
   ```sql
   CREATE DATABASE stayhub;
   ```

2. **Spring Boot sẽ tự động tạo schema** khi chạy lần đầu (với `spring.jpa.hibernate.ddl-auto=update`)

3. **Hoặc import schema thủ công** từ file `docs/SRS.md` (DBML format)

### OAuth2 Setup

#### Google OAuth2
1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project hiện có
3. Enable Google+ API
4. Tạo OAuth 2.0 Client ID
5. Thêm Authorized redirect URIs: `http://localhost:8080/login/oauth2/code/google`
6. Copy Client ID và Client Secret vào file `.env`

#### Facebook OAuth2
1. Truy cập [Facebook Developers](https://developers.facebook.com/)
2. Tạo App mới
3. Thêm Facebook Login product
4. Cấu hình Valid OAuth Redirect URIs: `http://localhost:8080/login/oauth2/code/facebook`
5. Copy App ID và App Secret vào file `.env`

### Mail Configuration

#### Gmail Setup
1. Bật 2-Step Verification trong Google Account
2. Tạo App Password: [Google App Passwords](https://myaccount.google.com/apppasswords)
3. Sử dụng App Password (không phải mật khẩu thông thường) trong `MAIL_PASSWORD`

---

## 🏃 Chạy ứng dụng

### Option 1: Docker Compose (Khuyến nghị)

Chạy tất cả services (Backend, Frontend, Prometheus, Grafana):

```bash
docker-compose up -d
```

Kiểm tra logs:
```bash
docker-compose logs -f
```

Dừng services:
```bash
docker-compose down
```

### Option 2: Chạy riêng lẻ

#### Backend
```bash
cd src/server
mvn spring-boot:run
```

Backend sẽ chạy tại: `http://localhost:8080`

#### Frontend
```bash
cd src/client
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:3000` (hoặc port được chỉ định)

### Option 3: Production Build

#### Build Backend
```bash
cd src/server
mvn clean package -DskipTests
java -jar target/stayhub-0.0.1-SNAPSHOT.jar
```

#### Build Frontend
```bash
cd src/client
npm run build
# Files được build vào thư mục dist/
```

### Truy cập ứng dụng

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080/api
- **API Health Check**: http://localhost:8080/actuator/health
- **Prometheus Metrics**: http://localhost:8080/actuator/prometheus
- **Prometheus UI**: http://localhost:9090
- **Grafana**: http://localhost:3001 (admin/admin)
- **pgAdmin**: http://localhost:5050 (nếu được bật)

---

## 📁 Cấu trúc dự án

```
stayhub/
├── .github/
│   └── workflows/          # GitHub Actions CI/CD
│       └── monitoring-test.yml
├── docs/                    # Tài liệu
│   └── SRS.md              # System Requirements Specification
├── monitoring/              # Monitoring setup
│   ├── grafana/            # Grafana dashboards & provisioning
│   │   ├── dashboards/
│   │   └── provisioning/
│   ├── prometheus/         # Prometheus configuration
│   │   └── prometheus.yml
│   └── README.md
├── src/
│   ├── client/            # Frontend React application
│   │   ├── public/
│   │   ├── src/
│   │   │   ├── components/    # React components
│   │   │   ├── features/      # Feature modules
│   │   │   │   ├── auth/
│   │   │   │   ├── booking/
│   │   │   │   ├── chat/
│   │   │   │   ├── host/
│   │   │   │   ├── hotels/
│   │   │   │   ├── search/
│   │   │   │   └── ...
│   │   │   ├── services/      # API services
│   │   │   ├── hooks/         # Custom React hooks
│   │   │   ├── utils/         # Utility functions
│   │   │   ├── workers/       # Web Workers
│   │   │   └── types/         # TypeScript types
│   │   ├── Dockerfile
│   │   ├── nginx.conf
│   │   └── package.json
│   └── server/            # Backend Spring Boot application
│       ├── src/
│       │   └── main/
│       │       ├── java/com/verzol/stayhub/
│       │       │   ├── module/        # Business modules
│       │       │   │   ├── auth/
│       │       │   │   ├── booking/
│       │       │   │   ├── hotel/
│       │       │   │   ├── message/
│       │       │   │   └── ...
│       │       │   ├── config/        # Configuration classes
│       │       │   ├── exception/    # Exception handlers
│       │       │   ├── common/        # Shared utilities
│       │       │   └── StayhubApplication.java
│       │       └── resources/
│       │           └── application.properties
│       ├── Dockerfile
│       └── pom.xml
├── docker-compose.yml     # Docker Compose configuration
├── package.json           # Root package.json (optional)
└── README.md              # File này
```

### Module Structure (Backend)

Mỗi module trong `src/server/src/main/java/com/verzol/stayhub/module/` có cấu trúc:

```
module-name/
├── controller/        # REST Controllers
├── service/          # Business Logic
├── repository/       # Data Access Layer
├── entity/           # JPA Entities
├── dto/              # Data Transfer Objects
└── exception/        # Module-specific exceptions
```

---

## 📚 API Documentation

### Base URL
```
http://localhost:8080/api
```

### Authentication

Tất cả các API (trừ public endpoints) yêu cầu JWT token trong header:

```
Authorization: Bearer <your-jwt-token>
```

### Main Endpoints

#### Authentication (`/api/v1/auth`)
- `POST /api/v1/auth/check-email` - Kiểm tra email đã tồn tại
- `POST /api/v1/auth/register` - Đăng ký tài khoản mới
- `POST /api/v1/auth/login` - Đăng nhập
- `POST /api/v1/auth/forgot-password` - Quên mật khẩu (gửi OTP)
- `POST /api/v1/auth/reset-password` - Đặt lại mật khẩu với OTP
- `GET /api/v1/auth/verify-email` - Xác thực email
- `GET /oauth2/authorization/google` - OAuth2 Google login
- `GET /oauth2/authorization/facebook` - OAuth2 Facebook login

#### Public Hotels (`/api/public/hotels`)
- `GET /api/public/hotels` - Danh sách khách sạn công khai (với filters)
- `GET /api/public/hotels/{id}` - Chi tiết khách sạn công khai
- `GET /api/public/promotions` - Danh sách khuyến mãi công khai

#### Host Management (`/api/host`)
- `GET /api/host/hotels` - Danh sách khách sạn của host
- `POST /api/host/hotels` - Tạo khách sạn mới (HOST only)
- `PUT /api/host/hotels/{id}` - Cập nhật khách sạn (HOST only)
- `DELETE /api/host/hotels/{id}` - Xóa khách sạn (HOST only)
- `GET /api/host/rooms` - Danh sách phòng của host
- `POST /api/host/rooms` - Tạo phòng mới (HOST only)
- `PUT /api/host/rooms/{id}` - Cập nhật phòng (HOST only)
- `DELETE /api/host/rooms/{id}` - Xóa phòng (HOST only)
- `GET /api/host/dashboard/summary` - Tổng quan dashboard (HOST only)
- `GET /api/host/dashboard/recent-bookings` - Đặt chỗ gần đây (HOST only)
- `GET /api/host/bookings` - Danh sách đặt chỗ của host

#### Bookings (`/api/bookings`)
- `POST /api/bookings/preview` - Xem trước giá đặt chỗ
- `POST /api/bookings` - Tạo đặt chỗ mới (CUSTOMER only)
- `GET /api/bookings/{id}` - Chi tiết đặt chỗ
- `GET /api/bookings/my-bookings` - Danh sách đặt chỗ của user (CUSTOMER only)
- `POST /api/bookings/{id}/confirm` - Xác nhận đặt chỗ (CUSTOMER only)
- `PUT /api/bookings/{id}/cancel` - Hủy đặt chỗ

#### User Profile (`/api/v1/users`)
- `GET /api/v1/users/me` - Thông tin profile hiện tại
- `PUT /api/v1/users/me` - Cập nhật profile
- `POST /api/v1/users/me/avatar` - Upload avatar
- `PATCH /api/v1/users/change-password` - Đổi mật khẩu

#### Reviews (`/api/v1/reviews`)
- `GET /api/v1/reviews/hotel/{hotelId}` - Đánh giá của khách sạn (public)
- `GET /api/v1/reviews/booking/{bookingId}` - Kiểm tra đã đánh giá chưa
- `POST /api/v1/reviews` - Tạo đánh giá mới (CUSTOMER only)

#### Messages (`/api/v1/messages`)
- `GET /api/v1/messages` - Danh sách cuộc trò chuyện
- `GET /api/v1/messages/{userId}` - Tin nhắn với user cụ thể
- `POST /api/v1/messages` - Gửi tin nhắn
- WebSocket: `/ws/message` - Real-time messaging

#### Notifications (`/api/v1/notifications`)
- `GET /api/v1/notifications` - Danh sách thông báo
- `PUT /api/v1/notifications/{id}/read` - Đánh dấu đã đọc

#### Payments (`/api/payments`)
- `POST /api/payments/create` - Tạo thanh toán
- `POST /api/payments/callback` - Webhook callback từ payment gateway

### Response Format

Tất cả API responses theo format:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "timestamp": "2025-01-15T10:30:00Z"
}
```

Error response:
```json
{
  "success": false,
  "message": "Error message",
  "errors": [ ... ],
  "timestamp": "2025-01-15T10:30:00Z"
}
```

---

## 🧪 Testing

### Backend Tests

```bash
cd src/server
mvn test
```

Chạy với coverage:
```bash
mvn test jacoco:report
# Xem report tại: target/site/jacoco/index.html
```

### Frontend Tests

```bash
cd src/client
npm test
```

Chạy với coverage:
```bash
npm run test:coverage
```

### Integration Tests

```bash
# Chạy với Docker Compose
docker-compose -f docker-compose.test.yml up --abort-on-container-exit
```

---

## 📊 Monitoring

### Prometheus

Prometheus tự động thu thập metrics từ Spring Boot Actuator:

- **URL**: http://localhost:9090
- **Metrics Endpoint**: http://localhost:8080/actuator/prometheus

### Grafana

Grafana dashboards được tự động load từ `monitoring/grafana/dashboards/`:

- **URL**: http://localhost:3001
- **Default Credentials**: admin/admin

### Metrics được theo dõi

- HTTP request rate & error rate
- Response times (p50, p95, p99)
- JVM memory usage
- CPU usage
- Database connection pool
- Active threads
- Application uptime

Xem thêm: [monitoring/README.md](monitoring/README.md)

---

## 🚢 Deployment

### Docker Deployment

1. **Build images:**
```bash
docker-compose build
```

2. **Deploy:**
```bash
docker-compose up -d
```

### Kubernetes Deployment

1. **Build và push images:**
```bash
docker build -t your-registry/stayhub-backend:latest ./src/server
docker build -t your-registry/stayhub-frontend:latest ./src/client
docker push your-registry/stayhub-backend:latest
docker push your-registry/stayhub-frontend:latest
```

2. **Apply Kubernetes manifests:**
```bash
kubectl apply -f k8s/
```

### Environment Variables cho Production

Đảm bảo cấu hình các biến môi trường sau trong production:

- `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`
- `JWT_SECRET_KEY` (sử dụng secret management)
- `MAIL_*` credentials
- `CORS_ALLOWED_ORIGINS` (chỉ domain production)
- `FRONTEND_URL` (URL production)

---

## 🐛 Troubleshooting

### Backend không khởi động

1. **Kiểm tra database connection:**
   ```bash
   # Test connection
   psql -h your-host -U your-username -d stayhub
   ```

2. **Kiểm tra logs:**
   ```bash
   docker-compose logs backend
   ```

3. **Kiểm tra port đã được sử dụng:**
   ```bash
   # Windows
   netstat -ano | findstr :8080
   
   # Linux/Mac
   lsof -i :8080
   ```

### Frontend không kết nối được Backend

1. **Kiểm tra CORS configuration** trong `application.properties`
2. **Kiểm tra API base URL** trong `src/client/src/utils/config.ts`
3. **Kiểm tra proxy configuration** trong `vite.config.ts`

### Database migration issues

1. **Reset database** (cẩn thận - sẽ mất dữ liệu):
   ```sql
   DROP SCHEMA public CASCADE;
   CREATE SCHEMA public;
   ```

2. **Hoặc set** `spring.jpa.hibernate.ddl-auto=create` (chỉ cho development)

### Email không gửi được

1. **Kiểm tra App Password** (Gmail) thay vì mật khẩu thông thường
2. **Kiểm tra SMTP settings** trong `application.properties`
3. **Test với telnet:**
   ```bash
   telnet smtp.gmail.com 587
   ```

### Prometheus không scrape được

Xem: [monitoring/README.md#troubleshooting](monitoring/README.md#troubleshooting)

---

## 🤝 Contributing

Chúng tôi hoan nghênh mọi đóng góp! Vui lòng làm theo các bước sau:

1. **Fork** repository
2. **Tạo branch** mới (`git checkout -b feature/AmazingFeature`)
3. **Commit** các thay đổi (`git commit -m 'Add some AmazingFeature'`)
4. **Push** lên branch (`git push origin feature/AmazingFeature`)
5. **Mở Pull Request**

### Code Style

- **Backend**: Tuân theo Java conventions, sử dụng Lombok
- **Frontend**: ESLint + Prettier configuration
- **Commits**: Sử dụng conventional commits format

### Pull Request Guidelines

- Mô tả rõ ràng về thay đổi
- Thêm tests nếu cần
- Cập nhật documentation
- Đảm bảo tất cả tests pass

---

## 📄 License

Dự án này được phân phối dưới giấy phép MIT. Xem file `LICENSE` để biết thêm chi tiết.

---

## 👥 Authors

- **Your Name** - *Initial work* - [YourGitHub](https://github.com/yourusername)

---

## 🙏 Acknowledgments

- Spring Boot team
- React team
- PostgreSQL community
- Tất cả các contributors và maintainers của các thư viện open-source được sử dụng

---

## 📞 Contact & Support

- **Issues**: [GitHub Issues](https://github.com/your-username/stayhub/issues)
- **Email**: support@stayhub.com
- **Documentation**: [docs/](docs/)

---

<div align="center">

**Made with ❤️ by StayHub Team**

⭐ Star this repo nếu bạn thấy hữu ích!

</div>
