# 📊 Prometheus Queries cho StayHub

Tập hợp các Prometheus queries hữu ích để tạo dashboard đẹp trong Grafana.

## 🚀 Application Health & Status

### 1. Application Uptime (Thời gian hoạt động)

```promql
process_uptime_seconds / 3600
```

- **Visualization:** Stat
- **Unit:** hours
- **Mô tả:** Hiển thị số giờ application đã chạy

### 2. Application Status (Trạng thái)

```promql
up{job="stayhub-backend"}
```

- **Visualization:** Stat hoặc Gauge
- **Value:** 1 = UP, 0 = DOWN
- **Mô tả:** Trạng thái của application

---

## 📈 HTTP Metrics

### 3. HTTP Request Rate (Tốc độ request)

```promql
rate(http_server_requests_seconds_count[5m])
```

- **Visualization:** Time Series
- **Unit:** reqps (requests per second)
- **Mô tả:** Số lượng requests mỗi giây

### 4. HTTP Request Rate by Endpoint (Theo endpoint)

```promql
sum(rate(http_server_requests_seconds_count[5m])) by (uri)
```

- **Visualization:** Time Series với legend
- **Unit:** reqps
- **Mô tả:** Top endpoints được gọi nhiều nhất

### 5. HTTP Error Rate (Tỷ lệ lỗi)

```promql
sum(rate(http_server_requests_seconds_count{status=~"5.."}[5m])) by (status)
```

- **Visualization:** Time Series
- **Unit:** reqps
- **Mô tả:** Số lỗi 5xx mỗi giây

### 6. HTTP Success Rate (Tỷ lệ thành công)

```promql
sum(rate(http_server_requests_seconds_count{status=~"2.."}[5m])) by (status)
```

- **Visualization:** Time Series
- **Unit:** reqps
- **Mô tả:** Số requests thành công (2xx)

### 7. HTTP Response Time - Average (Thời gian phản hồi trung bình)

```promql
rate(http_server_requests_seconds_sum[5m]) / rate(http_server_requests_seconds_count[5m])
```

- **Visualization:** Time Series
- **Unit:** seconds hoặc milliseconds
- **Mô tả:** Thời gian phản hồi trung bình

### 8. HTTP Response Time - P95 (95th percentile)

```promql
histogram_quantile(0.95, rate(http_server_requests_seconds_bucket[5m]))
```

- **Visualization:** Time Series
- **Unit:** seconds hoặc milliseconds
- **Mô tả:** 95% requests có thời gian phản hồi nhỏ hơn giá trị này

### 9. HTTP Response Time - P99 (99th percentile)

```promql
histogram_quantile(0.99, rate(http_server_requests_seconds_bucket[5m]))
```

- **Visualization:** Time Series
- **Unit:** seconds hoặc milliseconds
- **Mô tả:** 99% requests có thời gian phản hồi nhỏ hơn giá trị này

### 10. Total HTTP Requests (Tổng số requests)

```promql
sum(increase(http_server_requests_seconds_count[1h]))
```

- **Visualization:** Stat
- **Unit:** none
- **Mô tả:** Tổng số requests trong 1 giờ qua

---

## 💾 JVM Memory

### 11. JVM Heap Memory Used (Bộ nhớ heap đang dùng)

```promql
jvm_memory_used_bytes{area="heap"}
```

- **Visualization:** Time Series
- **Unit:** bytes
- **Mô tả:** Dung lượng bộ nhớ heap đang sử dụng

### 12. JVM Heap Memory Max (Bộ nhớ heap tối đa)

```promql
jvm_memory_max_bytes{area="heap"}
```

- **Visualization:** Time Series
- **Unit:** bytes
- **Mô tả:** Dung lượng bộ nhớ heap tối đa

### 13. JVM Heap Memory Usage Percentage (% sử dụng)

```promql
(jvm_memory_used_bytes{area="heap"} / jvm_memory_max_bytes{area="heap"}) * 100
```

- **Visualization:** Gauge hoặc Time Series
- **Unit:** percent (0-100)
- **Thresholds:**
  - Green: < 70%
  - Yellow: 70-90%
  - Red: > 90%
- **Mô tả:** Phần trăm bộ nhớ heap đang dùng

### 14. JVM Non-Heap Memory

```promql
jvm_memory_used_bytes{area="nonheap"}
```

- **Visualization:** Time Series
- **Unit:** bytes
- **Mô tả:** Non-heap memory usage

---

## 🧵 JVM Threads

### 15. Active Threads (Số thread đang chạy)

```promql
jvm_threads_live_threads
```

- **Visualization:** Stat hoặc Time Series
- **Unit:** none
- **Mô tả:** Số lượng thread đang active

### 16. Daemon Threads

```promql
jvm_threads_daemon_threads
```

- **Visualization:** Time Series
- **Unit:** none
- **Mô tả:** Số lượng daemon threads

---

## 🔄 Garbage Collection

### 17. GC Pause Time (Thời gian pause GC)

```promql
rate(jvm_gc_pause_seconds_sum[5m])
```

- **Visualization:** Time Series
- **Unit:** seconds
- **Mô tả:** Tổng thời gian GC pause

### 18. GC Pause Count (Số lần GC)

```promql
rate(jvm_gc_pause_seconds_count[5m])
```

- **Visualization:** Time Series
- **Unit:** count/second
- **Mô tả:** Số lần GC được thực hiện

---

## 💻 CPU & System

### 19. CPU Usage (Sử dụng CPU)

```promql
process_cpu_usage * 100
```

- **Visualization:** Gauge
- **Unit:** percent (0-100)
- **Thresholds:**
  - Green: < 50%
  - Yellow: 50-80%
  - Red: > 80%
- **Mô tả:** Phần trăm CPU đang sử dụng

### 20. Process CPU Time

```promql
process_cpu_seconds_total
```

- **Visualization:** Time Series
- **Unit:** seconds
- **Mô tả:** Tổng CPU time của process

---

## 🗄️ Database (HikariCP)

### 21. Active Database Connections (Kết nối DB đang active)

```promql
hikari_connections_active
```

- **Visualization:** Stat hoặc Time Series
- **Unit:** none
- **Mô tả:** Số kết nối database đang active

### 22. Idle Database Connections (Kết nối DB idle)

```promql
hikari_connections_idle
```

- **Visualization:** Time Series
- **Unit:** none
- **Mô tả:** Số kết nối database đang idle

### 23. Total Database Connections (Tổng kết nối)

```promql
hikari_connections_active + hikari_connections_idle
```

- **Visualization:** Time Series
- **Unit:** none
- **Mô tả:** Tổng số kết nối trong pool

### 24. Connection Pool Usage (%)

```promql
(hikari_connections_active / hikari_connections_max) * 100
```

- **Visualization:** Gauge
- **Unit:** percent
- **Mô tả:** Phần trăm connection pool đang dùng

### 25. Connection Timeouts (Kết nối timeout)

```promql
hikari_connections_timeout_total
```

- **Visualization:** Counter
- **Unit:** none
- **Mô tả:** Số lần connection timeout

---

## 🎯 Business Metrics (Nếu có custom metrics)

### 26. Active Users (Số user đang active)

```promql
# Ví dụ - cần implement custom metric
# active_users_total
```

### 27. API Calls by Endpoint (Gọi API theo endpoint)

```promql
sum(rate(http_server_requests_seconds_count[5m])) by (uri, method)
```

- **Visualization:** Bar Chart hoặc Table
- **Unit:** reqps
- **Mô tả:** Top endpoints được gọi

---

## 📊 Dashboard Panels Đẹp

### Panel 1: Application Overview Card

```promql
up{job="stayhub-backend"}
```

- **Type:** Stat
- **Options:**
  - Value: Last
  - Color: Green if 1, Red if 0
  - Text: "Application Status"

### Panel 2: Request Rate Graph

```promql
sum(rate(http_server_requests_seconds_count[5m]))
```

- **Type:** Time Series
- **Title:** "HTTP Request Rate"
- **Y-axis:** Requests/second

### Panel 3: Response Time Percentiles

```promql
# P50
histogram_quantile(0.50, rate(http_server_requests_seconds_bucket[5m]))

# P95
histogram_quantile(0.95, rate(http_server_requests_seconds_bucket[5m]))

# P99
histogram_quantile(0.99, rate(http_server_requests_seconds_bucket[5m]))
```

- **Type:** Time Series (multi-query)
- **Title:** "Response Time Percentiles"
- **Legend:** P50, P95, P99

### Panel 4: Memory Usage Gauge

```promql
(jvm_memory_used_bytes{area="heap"} / jvm_memory_max_bytes{area="heap"}) * 100
```

- **Type:** Gauge
- **Title:** "Heap Memory Usage"
- **Min:** 0, **Max:** 100
- **Thresholds:** 70 (yellow), 90 (red)

### Panel 5: Error Rate vs Success Rate

```promql
# Success (2xx)
sum(rate(http_server_requests_seconds_count{status=~"2.."}[5m]))

# Errors (5xx)
sum(rate(http_server_requests_seconds_count{status=~"5.."}[5m]))
```

- **Type:** Time Series (multi-query)
- **Title:** "Success vs Error Rate"
- **Legend:** Success, Errors

---

## 🎨 Query Templates cho Grafana

### Template 1: Top N Endpoints

```promql
topk(10, sum(rate(http_server_requests_seconds_count[5m])) by (uri))
```

- Hiển thị top 10 endpoints được gọi nhiều nhất

### Template 2: Error Rate by Status Code

```promql
sum(rate(http_server_requests_seconds_count{status=~"[45].."}[5m])) by (status)
```

- Phân tích lỗi theo status code

### Template 3: Request Duration by Method

```promql
rate(http_server_requests_seconds_sum[5m]) / rate(http_server_requests_seconds_count[5m])
```

- Thời gian phản hồi theo HTTP method

---

## 💡 Tips để tạo Dashboard đẹp

1. **Color Scheme:**

   - Green: Healthy metrics
   - Yellow: Warning thresholds
   - Red: Critical issues

2. **Panel Sizes:**

   - Stat panels: 4x4 hoặc 6x4
   - Graph panels: 12x6 hoặc 12x8

3. **Refresh Rate:**

   - Set 30s hoặc 1m cho real-time monitoring

4. **Time Range:**

   - Default: Last 15 minutes
   - Quick ranges: 5m, 15m, 1h, 6h, 24h

5. **Thresholds:**
   - Memory: < 70% (green), 70-90% (yellow), > 90% (red)
   - CPU: < 50% (green), 50-80% (yellow), > 80% (red)
   - Response Time: < 100ms (green), 100-500ms (yellow), > 500ms (red)

---

## 🚀 Quick Start: Import vào Grafana

1. Tạo Dashboard mới trong Grafana
2. Add panels với các queries ở trên
3. Hoặc import dashboard ID: **11378** (Spring Boot 2.1 Statistics)

Các queries trên sẽ cho bạn một dashboard đẹp và chuyên nghiệp! 🎉
