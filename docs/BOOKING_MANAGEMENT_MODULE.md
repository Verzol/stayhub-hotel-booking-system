# Module 5: Booking Management - Tài liệu Backend

## Tổng quan

Module Booking Management cung cấp các chức năng quản lý vòng đời của đơn đặt phòng, từ tạo booking đến hoàn thành hoặc hủy bỏ. Module này hỗ trợ cả Guest và Host với các chức năng riêng biệt.

## Kiến trúc

### 1. Booking Status State Machine

Booking có thể chuyển đổi giữa các trạng thái sau:

```
PENDING → CONFIRMED → CHECKED_IN → COMPLETED
   ↓           ↓            ↓
CANCELLED   CANCELLED   CANCELLED
```

- **PENDING**: Chờ thanh toán (mặc định khi tạo booking)
- **CONFIRMED**: Đã thanh toán/Host xác nhận
- **CHECKED_IN**: Đang ở (khách đã check-in)
- **COMPLETED**: Đã trả phòng (hoàn thành)
- **CANCELLED**: Đã hủy (terminal state)

### 2. Cancellation Policy

Hệ thống hỗ trợ 3 loại chính sách hủy phòng:

- **FLEXIBLE**: Hoàn tiền 100% nếu hủy trước 1 ngày check-in
- **MODERATE**: Hoàn tiền 100% trước 14 ngày, 50% trước 5 ngày check-in
- **STRICT**: Hoàn tiền 50% nếu hủy trước 7 ngày check-in

Số tiền hoàn lại được tính toán tự động dựa trên:

- Chính sách hủy của booking
- Thời điểm hủy so với ngày check-in
- Tổng giá trị booking

## Entities

### Booking Entity

```java
@Entity
@Table(name = "bookings")
public class Booking {
    // Existing fields...
    private String status; // PENDING, CONFIRMED, CHECKED_IN, COMPLETED, CANCELLED

    // New fields for booking management
    private LocalDateTime checkedInAt;
    private LocalDateTime checkedOutAt;
    private LocalDateTime cancelledAt;
    private String cancellationReason;
    private String cancelledBy; // "GUEST" or "HOST"
    private BigDecimal refundAmount;
    private String cancellationPolicy; // FLEXIBLE, MODERATE, STRICT
}
```

## Services

### 1. BookingService

Service chính xử lý logic booking:

**Methods:**

- `calculatePrice(BookingRequest)` - Tính giá booking
- `createPendingBooking(BookingRequest, Long userId)` - Tạo booking mới
- `confirmBooking(Long bookingId)` - Xác nhận booking (sau khi thanh toán)
- `cancelBooking(Long bookingId, Long userId, CancellationRequest)` - Hủy booking
- `checkIn(Long bookingId, Long hotelId)` - Check-in khách (Host)
- `checkOut(Long bookingId, Long hotelId)` - Check-out khách (Host)
- `getUserBookings(Long userId)` - Lấy danh sách bookings của user
- `getHostBookings(Long hotelId, ...)` - Lấy danh sách bookings của hotel (Host)
- `getUpcomingBookings(Long hotelId)` - Lấy bookings sắp tới
- `getPendingCheckIns(Long hotelId)` - Lấy bookings đang chờ check-in
- `getPendingCheckOuts(Long hotelId)` - Lấy bookings đang chờ check-out

### 2. BookingStateMachine

Service quản lý state transitions:

**Methods:**

- `isValidTransition(String currentStatus, String newStatus)` - Kiểm tra transition hợp lệ
- `validateTransition(String, String)` - Validate và throw exception nếu không hợp lệ
- `transitionTo(Booking, String)` - Chuyển booking sang trạng thái mới
- `canBeCancelled(String status)` - Kiểm tra có thể hủy không
- `canCheckIn(String status)` - Kiểm tra có thể check-in không
- `canCheckOut(String status)` - Kiểm tra có thể check-out không

### 3. RefundCalculationService

Service tính toán hoàn tiền:

**Methods:**

- `calculateRefund(Booking, LocalDate)` - Tính số tiền hoàn lại
- `calculateCancellationFee(Booking, LocalDate)` - Tính phí hủy
- `getPolicyDescription(String policy)` - Lấy mô tả chính sách

### 4. InvoiceService

Service tạo hóa đơn/xác nhận:

**Methods:**

- `generateInvoiceHtml(Booking, Room, Hotel, String)` - Generate HTML invoice

## Controllers

### 1. BookingController (Guest endpoints)

**Base path:** `/api/bookings`

**Endpoints:**

- `POST /preview` - Tính giá booking
- `POST /` - Tạo booking mới
- `GET /{id}` - Xem chi tiết booking
- `POST /{id}/confirm` - Xác nhận thanh toán
- `GET /my-bookings` - Lấy danh sách bookings của user
- `POST /{id}/cancel` - Hủy booking
- `GET /{id}/invoice` - Tải hóa đơn (HTML)

### 2. HostBookingController (Host endpoints)

**Base path:** `/api/host/bookings`

**Requires:** Role `HOST`

**Endpoints:**

- `GET /?hotelId={id}&status={status}&startDate={date}&endDate={date}` - Lấy danh sách bookings của hotel
- `GET /{hotelId}/upcoming` - Lấy bookings sắp tới
- `GET /{hotelId}/pending-checkins` - Lấy bookings chờ check-in
- `GET /{hotelId}/pending-checkouts` - Lấy bookings chờ check-out
- `POST /{bookingId}/checkin?hotelId={id}` - Check-in khách
- `POST /{bookingId}/checkout?hotelId={id}` - Check-out khách

## DTOs

### BookingResponse (Guest)

Chứa đầy đủ thông tin booking bao gồm:

- Thông tin booking cơ bản
- Thông tin room và hotel
- Các timestamps (checkedInAt, checkedOutAt, cancelledAt)
- Thông tin refund và cancellation policy

### HostBookingResponse (Host)

Tương tự BookingResponse nhưng tập trung vào:

- Thông tin khách hàng
- Thông tin booking
- Timestamps check-in/check-out

### CancellationResponse

Chứa thông tin về hủy booking:

- Booking ID và status
- Total price, refund amount, cancellation fee
- Cancellation policy và mô tả
- Message thông báo

## Repository Queries

### BookingRepository

Các query methods mới:

- `findByHotelId(Long hotelId)` - Tìm bookings theo hotel
- `findByHotelIdAndStatus(Long, String)` - Tìm bookings theo hotel và status
- `findByHotelIdAndCheckInDateBetween(Long, LocalDate, LocalDate)` - Tìm bookings trong khoảng thời gian
- `findUpcomingBookingsByHotelId(Long, LocalDate)` - Tìm bookings sắp tới
- `findPendingCheckInsByHotelId(Long, LocalDate)` - Tìm bookings chờ check-in
- `findPendingCheckOutsByHotelId(Long, LocalDate)` - Tìm bookings chờ check-out

## Database Migration

Chạy migration script để thêm các column mới:

```sql
-- File: docs/migrations/add_booking_management_fields.sql
```

Các column được thêm:

- `checked_in_at`
- `checked_out_at`
- `cancelled_at`
- `cancellation_reason`
- `cancelled_by`
- `refund_amount`
- `cancellation_policy`

## Đề xuất tính năng bổ sung

### 1. Tính năng đã implement

✅ State Machine quản lý booking status
✅ Cancellation Policy và tự động tính hoàn tiền
✅ Check-in/Check-out cho Host
✅ Xem lịch sử bookings
✅ Tải hóa đơn (HTML)
✅ Filter và search bookings

### 2. Tính năng có thể thêm

#### 2.1. Booking Modification

- Cho phép Guest thay đổi ngày check-in/check-out (nếu chưa check-in)
- Tính toán lại giá và phí thay đổi
- Yêu cầu Host approval cho các thay đổi lớn

#### 2.2. Early Check-in / Late Check-out

- Guest có thể yêu cầu check-in sớm hoặc check-out muộn
- Host có thể approve/reject
- Tính phí bổ sung nếu có

#### 2.3. Booking Reminders

- Gửi email nhắc nhở trước check-in (1 ngày, 3 ngày)
- Gửi email nhắc nhở trước check-out
- Notification cho Host về bookings sắp tới

#### 2.4. Booking Statistics

- Dashboard cho Host: revenue, occupancy rate, booking trends
- Analytics: booking theo tháng, theo room type
- Revenue reports

#### 2.5. PDF Invoice

- Generate PDF invoice (thay vì HTML)
- Cần thêm dependency: iText hoặc Apache PDFBox
- Email PDF invoice tự động

#### 2.6. Booking Reviews Integration

- Link booking với review sau khi completed
- Chỉ cho phép review sau khi stay completed
- Prevent duplicate reviews

#### 2.7. Refund Processing

- Tích hợp với payment gateway để thực hiện refund
- Track refund status
- Refund history

#### 2.8. Booking Notifications

- Real-time notifications khi booking status thay đổi
- Push notifications (Firebase, OneSignal)
- Email notifications cho mọi status changes

#### 2.9. Booking Calendar View

- Calendar view cho Host để xem bookings
- Visual representation của occupancy
- Drag-and-drop để thay đổi dates (future)

#### 2.10. Guest Communication

- Messaging system giữa Guest và Host
- Pre-stay questions/requests
- Special requests trong booking

#### 2.11. Multi-room Booking

- Book nhiều rooms trong cùng một booking
- Group bookings
- Family/friends cùng book

#### 2.12. Booking Vouchers/Gift Cards

- Support booking với voucher
- Gift card system
- Credit system

## Testing Recommendations

### Unit Tests

- `BookingStateMachine` - Test tất cả transitions
- `RefundCalculationService` - Test tính toán hoàn tiền với các policy
- `BookingService` - Test các business logic

### Integration Tests

- Test booking flow end-to-end
- Test cancellation với refund
- Test check-in/check-out flow

### API Tests

- Test tất cả endpoints với các scenarios
- Test authorization (Guest chỉ có thể cancel booking của mình)
- Test Host chỉ có thể manage bookings của hotel mình

## Security Considerations

1. **Authorization:**

   - Guest chỉ có thể xem/cancel bookings của mình
   - Host chỉ có thể manage bookings của hotel mình
   - Verify hotel ownership trong mọi Host operations

2. **Validation:**

   - Validate booking status trước khi transition
   - Validate dates (check-in < check-out)
   - Validate refund calculations

3. **Audit Trail:**
   - Log mọi status changes
   - Track who cancelled booking
   - Timestamp mọi operations

## Performance Considerations

1. **Indexing:**

   - Index trên `status`, `check_in_date`, `room_id`
   - Consider composite indexes cho queries phức tạp

2. **Caching:**

   - Cache booking details nếu cần
   - Cache cancellation policies

3. **Pagination:**
   - Implement pagination cho booking lists
   - Especially cho Host với nhiều bookings

## Future Enhancements

1. **Microservices:**

   - Tách Booking Service thành microservice riêng
   - Separate payment processing service

2. **Event-Driven:**

   - Use event sourcing cho booking state
   - Publish events khi booking status changes

3. **Advanced Analytics:**
   - Machine learning để predict cancellations
   - Dynamic pricing recommendations
   - Demand forecasting
