# StayHub - System Requirements Specification (SRS)

**Version:** 1.0  
**Last Updated:** November 2025  
**Status:** Draft

---

## 1. Project Overview
**StayHub** is a comprehensive hotel booking and management platform designed to connect travelers with property owners. The system provides a seamless experience for guests to discover and book accommodations while empowering hosts with powerful tools to manage their properties, inventory, and revenue.

## 2. Technology Stack

### Backend
- **Language:** Java 21
- **Framework:** Spring Boot 3.x
- **Database:** PostgreSQL 16 (Managed via Supabase)
- **ORM:** Hibernate / Spring Data JPA (Validation Mode)
- **Security:** Spring Security + JWT (OAuth2 for Social Login)
- **Containerization:** Docker
- **Orchestration:** Kubernetes (K8s)

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** React Context / Hooks
- **Maps:** Leaflet / Mapbox / Google Maps API

### DevOps
- **CI/CD:** GitHub Actions
- **Registry:** Docker Hub / GitHub Container Registry

---

## 3. System Modules

Hệ thống được chia thành các module chức năng dựa trên cấu trúc source code thực tế (Backend Modules & Frontend Features).

### 3.1. Authentication & User Management (Identity)
*   **Backend Module:** `auth`, `user`
*   **Frontend Feature:** `auth`, `user`
*   **Chức năng:**
    *   **Đăng ký/Đăng nhập:** Email/Password, xác thực email, hỗ trợ OAuth2 (Google, Facebook).
    *   **Quản lý tài khoản:** Cập nhật hồ sơ (avatar, thông tin cá nhân), đổi mật khẩu.
    *   **Phân quyền (RBAC):** Hệ thống phân quyền rõ ràng cho `CUSTOMER`, `HOST`, và `ADMIN`.
    *   **Bảo mật:** Sử dụng JWT cho xác thực stateless, mã hóa mật khẩu với Bcrypt.

### 3.2. Host Management (Hotel & Room)
*   **Backend Module:** `hotel`, `room`, `amenity`
*   **Frontend Feature:** `host` (Dashboard, HotelForm, RoomForm, etc.)
*   **Chức năng:**
    *   **Quản lý Khách sạn (Hotel):** Thêm, sửa, xóa thông tin khách sạn, địa chỉ, hình ảnh, chính sách.
    *   **Quản lý Phòng (Room):** Thiết lập loại phòng, giá cơ bản, sức chứa, cấu hình giường.
    *   **Quản lý Tiện nghi (Amenity):** Gắn các tiện ích (Wifi, Bể bơi, v.v.) cho khách sạn và phòng.
    *   **Dashboard:** Thống kê doanh thu, lượt đặt phòng, lịch rảnh bận (Availability Calendar).

### 3.3. Booking & Payment Core
*   **Backend Module:** `booking`, `payment`
*   **Frontend Feature:** `booking`
*   **Chức năng:**
    *   **Quy trình đặt phòng:** Kiểm tra tình trạng phòng, tính toán giá tiền (bao gồm thuế, phí, giảm giá).
    *   **Inventory Locking:** Cơ chế khóa phòng tạm thời để tránh trùng lặp đơn đặt trong quá trình thanh toán.
    *   **Thanh toán:** Tích hợp cổng thanh toán, xử lý giao dịch, tạo hóa đơn (InvoiceService).
    *   **Quản lý trạng thái:** Theo dõi vòng đời đơn đặt (`PENDING`, `CONFIRMED`, `CHECKED_IN`, `COMPLETED`, `CANCELLED`).
    *   **Refund:** Tính toán hoàn tiền dựa trên chính sách hủy phòng.

### 3.4. Search & Discovery
*   **Backend Module:** `search`, `wishlist`, `hotel` (Public API)
*   **Frontend Feature:** `search`, `wishlist`, `landing`, `hotels`
*   **Chức năng:**
    *   **Tìm kiếm:** Tìm kiếm theo địa điểm, ngày đến/đi, số lượng khách.
    *   **Bộ lọc:** Lọc theo khoảng giá, xếp hạng sao, tiện nghi.
    *   **Hiển thị:** Danh sách kết quả, xem chi tiết khách sạn, bản đồ trực quan.
    *   **Wishlist:** Lưu và quản lý danh sách khách sạn yêu thích.

### 3.5. Promotions & Marketing
*   **Backend Module:** `promotion`
*   **Frontend Feature:** `promotions`
*   **Chức năng:**
    *   **Quản lý khuyến mãi:** Tạo mã giảm giá, thiết lập mức giảm (%), ngày áp dụng, giới hạn sử dụng.
    *   **Áp dụng mã:** Kiểm tra tính hợp lệ và tính toán số tiền giảm giá khi đặt phòng.

### 3.6. Communication & Social
*   **Backend Module:** `review`, `message`, `notification`
*   **Frontend Feature:** `review`, `chat`
*   **Chức năng:**
    *   **Đánh giá (Review):** Cho phép khách hàng đánh giá và bình luận sau khi hoàn tất kỳ nghỉ.
    *   **Tin nhắn (Message):** Hệ thống chat thời gian thực (Real-time) giữa chủ nhà và khách thuê.
    *   **Thông báo (Notification):** Gửi thông báo hệ thống về trạng thái đặt phòng, tin nhắn mới.

### 3.7. Admin & System
*   **Backend Module:** `admin` (logic nằm rải rác hoặc trong user role ADMIN)
*   **Chức năng:** Quản lý người dùng, kiểm duyệt khách sạn (nếu có quy trình duyệt), theo dõi hoạt động hệ thống.

---

## 4. Database Schema (DBML)

The following **Database Markup Language (DBML)** defines the schema for the entire system. You can visualize this schema by pasting the code below into [dbdiagram.io](https://dbdiagram.io).

```dbml
Project HotelManagement {
  database_type: 'PostgreSQL'
  Note: 'Database schema for StayHub (Spring Boot + React)'
}

// --- ENUMS ---
Enum user_role {
  CUSTOMER
  HOST
  ADMIN
}

Enum gender {
  MALE
  FEMALE
  OTHER
}

Enum booking_status {
  PENDING
  CONFIRMED
  CHECKED_IN
  COMPLETED
  CANCELLED
}

Enum payment_status {
  PENDING
  COMPLETED
  FAILED
  REFUNDED
}

Enum hotel_badge {
  NONE
  POPULAR
  NEW
  DEAL
  TOP_RATED
}

// --- AUTH & USER MODULE ---
Table users {
  id bigint [pk, increment]
  email varchar [unique, not null]
  password varchar [not null]
  full_name varchar [not null]
  role user_role [not null, default: 'CUSTOMER']
  gender gender
  phone_number varchar
  address varchar
  avatar_url varchar
  date_of_birth date
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]
  
  // Auth & Security
  enabled boolean [default: false]
  email_verified boolean [default: false]
  two_factor_enabled boolean [default: false]
  reset_password_token varchar
  reset_password_token_expiry timestamp
  verification_token varchar
  verification_token_expiry timestamp
  
  // Preferences
  preferences jsonb
}

// --- HOST MANAGEMENT MODULE ---
Table hotels {
  id bigint [pk, increment]
  owner_id bigint [not null, ref: > users.id]
  name varchar [not null]
  description text
  address text [not null]
  city varchar [not null]
  country varchar [not null]
  latitude decimal(10, 7)
  longitude decimal(10, 7)
  star_rating int
  check_in_time time
  check_out_time time
  policies jsonb
  
  // Stats & Badges
  view_count int [default: 0]
  badge hotel_badge [default: 'NONE']
  
  is_active boolean [default: false]
  is_approved boolean [default: false]
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]
}

Table hotel_images {
  id bigint [pk, increment]
  hotel_id bigint [not null, ref: > hotels.id]
  url varchar [not null]
  is_primary boolean [default: false]
}

Table rooms {
  id bigint [pk, increment]
  hotel_id bigint [not null, ref: > hotels.id]
  name varchar [not null]
  description text
  base_price decimal(10, 2) [not null]
  capacity int [not null]
  area decimal
  
  // Room Details
  bedrooms int [default: 1]
  bathrooms int [default: 1]
  bed_config jsonb
  
  quantity int [default: 1]
  
  // Inventory Locking
  locked_until timestamp
  
  is_active boolean [default: true]
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]
}

Table room_images {
  id bigint [pk, increment]
  room_id bigint [not null, ref: > rooms.id]
  url varchar [not null]
}

Table amenities {
  id bigint [pk, increment]
  name varchar [unique, not null]
  category varchar
  icon varchar
}

Table hotel_amenities {
  hotel_id bigint [ref: > hotels.id]
  amenity_id bigint [ref: > amenities.id]
  indexes {
    (hotel_id, amenity_id) [pk]
  }
}

Table room_amenities {
  room_id bigint [ref: > rooms.id]
  amenity_id bigint [ref: > amenities.id]
  indexes {
    (room_id, amenity_id) [pk]
  }
}

Table promotions {
  id bigint [pk, increment]
  code varchar [unique, not null]
  discount_percent int [not null]
  max_discount_amount decimal(10, 2)
  start_date timestamp [not null]
  end_date timestamp [not null]
  max_usage int
  current_usage int [default: 0]
  is_active boolean [default: true]
}

// --- BOOKING & PAYMENT MODULE ---
Table bookings {
  id bigint [pk, increment]
  user_id bigint [not null, ref: > users.id]
  room_id bigint [not null, ref: > rooms.id]
  check_in_date date [not null]
  check_out_date date [not null]
  guests int [not null]
  total_price decimal(12, 2) [not null]
  status booking_status [default: 'PENDING']
  coupon_code varchar
  note text
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]
}

Table payments {
  id bigint [pk, increment]
  booking_id bigint [not null, unique, ref: - bookings.id]
  amount decimal(12, 2) [not null]
  provider varchar
  transaction_id varchar
  status payment_status [default: 'PENDING']
  created_at timestamp [default: `now()`]
}

// --- SOCIAL & COMMUNICATION MODULE ---
Table reviews {
  id bigint [pk, increment]
  booking_id bigint [not null, unique, ref: - bookings.id]
  user_id bigint [not null, ref: > users.id]
  hotel_id bigint [not null, ref: > hotels.id]
  rating int [not null]
  comment text
  photos jsonb
  created_at timestamp [default: `now()`]
}

Table messages {
  id bigint [pk, increment]
  sender_id bigint [not null, ref: > users.id]
  receiver_id bigint [not null, ref: > users.id]
  content text [not null]
  is_read boolean [default: false]
  created_at timestamp [default: `now()`]
}

Table notifications {
  id bigint [pk, increment]
  user_id bigint [not null, ref: > users.id]
  title varchar
  message text
  type varchar
  is_read boolean [default: false]
  created_at timestamp [default: `now()`]
}

// --- SEARCH & DISCOVERY MODULE ---
Table wishlists {
  id bigint [pk, increment]
  user_id bigint [not null, ref: > users.id]
  hotel_id bigint [not null, ref: > hotels.id]
  created_at timestamp [default: `now()`]
  indexes {
    (user_id, hotel_id) [unique]
  }
}

// --- ADMIN MODULE ---
Table admin_logs {
  id bigint [pk, increment]
  admin_id bigint [not null, ref: > users.id]
  action varchar [not null]
  target_type varchar
  target_id bigint
  details jsonb
  created_at timestamp [default: `now()`]
}
```
