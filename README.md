# BÁO CÁO MÔN HỌC: STAYHUB - HỆ THỐNG ĐẶT PHÒNG TRỰC TUYẾN

**Môn học:** Phát triển Ứng dụng Doanh nghiệp  
**Giảng viên hướng dẫn:** TS. Lê Hồng Hải
**Nhóm thực hiện:** Aigle

---

## 1. Tổng quan đề tài

**StayHub** là một nền tảng web ứng dụng doanh nghiệp (Enterprise Web Application) cho phép kết nối giữa người có nhu cầu thuê phòng (Guest) và người cho thuê (Host). Hệ thống được xây dựng nhằm giải quyết bài toán đặt phòng, quản lý tài sản lưu trú và thanh toán trực tuyến một cách tự động hóa, an toàn và hiệu quả.

### Mục tiêu dự án:

- Xây dựng hệ thống có khả năng chịu tải tốt, dễ dàng mở rộng.
- Áp dụng các quy trình chuẩn trong phát triển phần mềm doanh nghiệp (CI/CD, Containerization).
- Cung cấp trải nghiệm người dùng mượt mà trên đa nền tảng.

---

## 2. Kiến trúc & Công nghệ sử dụng

Hệ thống được thiết kế theo mô hình **Client-Server** (Microservices-ready), tách biệt hoàn toàn giữa Frontend và Backend.

### Frontend (Client)

- **Framework:** ReactJS 18 (Vite).
- **Ngôn ngữ:** TypeScript.
- **Styling:** Tailwind CSS, Shadcn/UI.
- **State Management:** React Context API, React Query.
- **Tính năng:** Responsive Design, PWA support.

### Backend (Server)

- **Framework:** Spring Boot 3.x (Java 21).
- **Kiến trúc:** Layered Architecture (Controller - Service - Repository).
- **Security:** Spring Security, JWT (JSON Web Token), OAuth2.
- **Build Tool:** Maven.

### Database & Infrastructure

- **Database:** PostgreSQL 16.
- **Caching:** Redis (cho caching dữ liệu và session).
- **Containerization:** Docker, Docker Compose.
- **CI/CD:** GitHub Actions.

---

## 3. Các phân hệ chức năng chính

### Phân hệ Khách hàng (Guest)

- **Tìm kiếm & Lọc:** Tìm phòng theo địa điểm, ngày, giá, tiện ích.
- **Đặt phòng:** Quy trình booking, giữ chỗ tạm thời, thanh toán online.
- **Cá nhân:** Quản lý hồ sơ, lịch sử đặt phòng, yêu thích (Wishlist).

### Phân hệ Chủ nhà (Host)

- **Quản lý tài sản:** Đăng tải khách sạn/homestay, quản lý phòng.
- **Dashboard:** Thống kê doanh thu, lịch trình phòng trống.
- **Quản lý đơn:** Duyệt/Từ chối yêu cầu đặt phòng.

### Phân hệ Quản trị (Admin)

- Quản lý người dùng hệ thống.
- Duyệt các bài đăng khách sạn.
- Báo cáo thống kê toàn hệ thống.

---

## 4. Cấu trúc mã nguồn

`nstayhub/
 docker-compose.yml      # Cấu hình Docker cho toàn bộ hệ thống
 src/
    client/             # Mã nguồn Frontend (ReactJS)
       src/features/   # Các module chức năng (Auth, Booking, Host...)
       ...
    server/             # Mã nguồn Backend (Spring Boot)
        src/main/java/  # Logic xử lý (Controller, Service...)
        ...
 README.md               # Tài liệu dự án
`n

---

## 5. Hướng dẫn cài đặt & Chạy ứng dụng

### Yêu cầu:

- Node.js >= 18
- Java JDK >= 21
- Docker Desktop

### Cách 1: Chạy bằng Docker (Khuyến nghị)

Đây là cách nhanh nhất để dựng toàn bộ môi trường giống như Production.

`ash

# 1. Clone dự án

git clone https://github.com/Verzol/stayhub.git
cd stayhub

# 2. Khởi chạy hệ thống

docker-compose up -d --build
``n- Truy cập Web: http://localhost:3000

### Cách 2: Chạy môi trường phát triển (Dev)

**Backend:**
` ash
cd src/server
./mvnw spring-boot:run
``n
**Frontend:**
 `ash
cd src/client
npm install
npm run dev
``n

---

_Báo cáo này là tài liệu tổng quan phục vụ cho môn học Phát triển Ứng dụng Doanh nghiệp._
