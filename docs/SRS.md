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

The system is divided into 7 core modules, each responsible for a specific domain of functionality.

### 3.1. Authentication & User Management (Identity)
*   **Role-Based Access Control (RBAC):** Supports `CUSTOMER`, `HOST`, and `ADMIN` roles.
*   **Registration:** Email/Password with Bcrypt encryption.
*   **Social Login:** Integration with Google/Facebook via OAuth2.
*   **Security:**
    *   Email verification to prevent spam.
    *   Two-Factor Authentication (2FA) support.
    *   JWT-based stateless authentication.
*   **Profile Management:** Avatar upload, personal info updates, and password management.

### 3.2. Host Management (Property & Inventory)
*   **Property CRUD:** Hosts can create and manage hotels/properties with rich descriptions, location data (Lat/Long), and policies.
*   **Room Management:** Define room types, base prices, capacity, and bed configurations.
*   **Media Gallery:** Upload and manage high-quality images for hotels and rooms.
*   **Amenities:** Select from a predefined list of system amenities (Wifi, Pool, AC, etc.).
*   **Availability Calendar:**
    *   Visual calendar for managing room availability.
    *   Manual block/unblock dates.
    *   Automatic synchronization with bookings.

### 3.3. Search & Discovery
*   **Search Engine:** Advanced search by City/Hotel Name, Date Range, and Guest Count.
*   **Filtering:** Price range slider, Star rating, Amenities, and Room types.
*   **Sorting:** Price (Low/High), Rating (High/Low).
*   **Map View:** Interactive map displaying properties as pins with price previews.
*   **Wishlist:** Users can save properties to their favorites list.

### 3.4. Booking Core (Transaction Processing)
*   **Booking Flow:** Step-by-step process: Search -> Select Room -> Review -> Payment -> Confirmation.
*   **Inventory Locking:** Prevents double-booking by temporarily locking the selected room for 10 minutes during the payment phase (using Redis or DB timestamps).
*   **Pricing Engine:** dynamic calculation: `(Base Price * Nights) - Discount + Service Fee`.
*   **Payment Gateway:** Integration with VNPay/Stripe/PayPal (Sandbox environment) with Webhook support for status updates.

### 3.5. Booking Management (Lifecycle)
*   **State Machine:** Tracks booking status: `PENDING` -> `CONFIRMED` -> `CHECKED_IN` -> `COMPLETED` (or `CANCELLED`).
*   **Guest Features:** View booking history, cancel bookings (with automated refund policy checks), download invoices.
*   **Host Features:** View upcoming arrivals, manage check-ins/check-outs, view daily occupancy.

### 3.6. Social & Communication
*   **Reviews & Ratings:** Verified guests can rate and review properties after a completed stay. Support for photo uploads in reviews.
*   **Messaging System:** Real-time chat between Host and Guest for pre-stay coordination.
*   **Notifications:** Real-time alerts (Bell icon) for booking confirmations, new messages, and cancellations.

### 3.7. Admin Dashboard
*   **Analytics:** Visual charts for revenue, new user growth, and booking trends.
*   **User Management:** Ban/Unban users, view user details.
*   **Content Moderation:** Approve new hotel listings before they go live.
*   **System Configuration:** Manage global settings, amenity lists, and location data.

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
