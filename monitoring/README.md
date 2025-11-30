# 📊 Monitoring Setup - Prometheus & Grafana

Hướng dẫn thiết lập và sử dụng Prometheus và Grafana để monitor StayHub application.

## 🚀 Quick Start

### 1. Khởi động Services

```bash
# Khởi động tất cả services (bao gồm Prometheus và Grafana)
docker-compose up -d

# Kiểm tra services đang chạy
docker-compose ps
```

### 2. Truy cập Services

- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3001
  - Username: `admin` (hoặc từ biến môi trường `GRAFANA_ADMIN_USER`)
  - Password: `admin` (hoặc từ biến môi trường `GRAFANA_ADMIN_PASSWORD`)

### 3. Kiểm tra Actuator Endpoints

```bash
# Health check
curl http://localhost:8080/actuator/health

# Prometheus metrics
curl http://localhost:8080/actuator/prometheus

# Tất cả metrics
curl http://localhost:8080/actuator/metrics
```

## 📋 Kiểm tra Prometheus

### 1. Kiểm tra Targets

1. Mở: http://localhost:9090/targets
2. Kiểm tra status:
   - ✅ `prometheus` - Status: **UP**
   - ✅ `stayhub-backend` - Status: **UP**

**Nếu `stayhub-backend` bị DOWN:**

- Kiểm tra backend logs: `docker-compose logs backend`
- Kiểm tra actuator endpoint: `curl http://localhost:8080/actuator/prometheus`
- Đảm bảo SecurityConfiguration đã permit `/actuator/**`

### 2. Test Query

1. Vào: http://localhost:9090/graph
2. Nhập query: `up{job="stayhub-backend"}`
3. Click **Execute**
4. Phải thấy kết quả: `stayhub-backend 1`

## 📈 Sử dụng Grafana

### 1. Kiểm tra Datasource

1. Vào: http://localhost:3001
2. **Configuration** (⚙️) > **Data Sources**
3. Click vào **Prometheus**
4. Click **Save & Test** - Phải hiện "Data source is working" ✅

### 2. Import Dashboard

#### Option 1: Import Dashboard có sẵn

1. **Dashboards** > **Import**
2. Nhập Dashboard ID: **11378** (Spring Boot 2.1 Statistics)
3. Click **Load**
4. Chọn **Prometheus** datasource
5. Click **Import**

#### Option 2: Sử dụng Dashboard tự động

Dashboard `stayhub-overview.json` sẽ tự động được load từ thư mục `monitoring/grafana/dashboards/`.

1. Vào **Dashboards**
2. Tìm "StayHub - Application Overview"
3. Click để mở

### 3. Tạo Dashboard mới

1. **Dashboards** > **New** > **New Dashboard**
2. Click **Add visualization**
3. Chọn datasource: **Prometheus**
4. Nhập query (xem phần Queries hữu ích bên dưới)
5. Click **Apply**
6. Click **Save dashboard**

## 🔍 Queries hữu ích

### Application Metrics

```promql
# Application Status
up{job="stayhub-backend"}

# HTTP Request Rate
rate(http_server_requests_seconds_count[5m])

# HTTP Error Rate
rate(http_server_requests_seconds_count{status=~"5.."}[5m])

# Response Time (p95)
histogram_quantile(0.95, rate(http_server_requests_seconds_bucket[5m]))
```

### JVM Metrics

```promql
# Memory Used
jvm_memory_used_bytes{area="heap"}

# Memory Max
jvm_memory_max_bytes{area="heap"}

# Memory Usage %
(jvm_memory_used_bytes{area="heap"} / jvm_memory_max_bytes{area="heap"}) * 100

# GC Pause Time
rate(jvm_gc_pause_seconds_sum[5m])
```

### Database Metrics

```promql
# Active Connections
hikari_connections_active

# Idle Connections
hikari_connections_idle

# Connection Pool Usage
(hikari_connections_active / hikari_connections_max) * 100
```

### System Metrics

```promql
# CPU Usage
process_cpu_usage * 100

# Thread Count
jvm_threads_live_threads

# Uptime (hours)
process_uptime_seconds / 3600
```

## 🐛 Troubleshooting

### Prometheus không scrape được

1. **Kiểm tra Targets:**

   - http://localhost:9090/targets
   - Xem error message nếu DOWN

2. **Kiểm tra Actuator:**

   ```bash
   curl http://localhost:8080/actuator/prometheus
   ```

   - Phải trả về metrics (text format)
   - Nếu trả về HTML, kiểm tra SecurityConfiguration

3. **Kiểm tra Network:**

   ```bash
   docker network inspect stayhub_stayhub-network
   ```

   - Đảm bảo `backend` và `prometheus` cùng network

4. **Restart Prometheus:**
   ```bash
   docker-compose restart prometheus
   ```

### Grafana không có data

1. **Kiểm tra Datasource:**

   - Configuration > Data Sources > Prometheus
   - Test connection
   - URL phải là: `http://prometheus:9090`

2. **Kiểm tra Query:**

   - Thử query: `up`
   - Nếu không có kết quả, kiểm tra Prometheus

3. **Kiểm tra Time Range:**
   - Chọn "Last 15 minutes" hoặc "Last 1 hour"
   - Không chọn "Last 5 minutes" (có thể chưa có data)

### Backend không expose metrics

1. **Kiểm tra application.properties:**

   ```properties
   management.endpoints.web.exposure.include=health,info,prometheus,metrics
   management.metrics.export.prometheus.enabled=true
   ```

2. **Kiểm tra SecurityConfiguration:**

   - Đảm bảo có: `.requestMatchers("/actuator/**").permitAll()`

3. **Kiểm tra pom.xml:**

   - Đảm bảo có dependencies:
     - `spring-boot-starter-actuator`
     - `micrometer-registry-prometheus`

4. **Restart backend:**
   ```bash
   docker-compose restart backend
   ```

## 📁 Cấu trúc Files

```
monitoring/
├── prometheus/
│   └── prometheus.yml          # Cấu hình Prometheus
├── grafana/
│   ├── provisioning/
│   │   ├── datasources/
│   │   │   └── prometheus.yml   # Auto-configure Prometheus datasource
│   │   └── dashboards/
│   │       └── dashboard.yml    # Auto-load dashboards
│   └── dashboards/
│       └── stayhub-overview.json # Dashboard mẫu
└── README.md                    # File này
```

## 🔧 Environment Variables

Thêm vào file `.env` (tùy chọn):

```env
# Grafana Configuration
GRAFANA_ADMIN_USER=admin
GRAFANA_ADMIN_PASSWORD=admin
```

## ✅ Checklist

- [ ] Services đang chạy: `docker-compose ps`
- [ ] Actuator endpoint hoạt động: `curl http://localhost:8080/actuator/prometheus`
- [ ] Prometheus targets UP: http://localhost:9090/targets
- [ ] Grafana datasource connected: Configuration > Data Sources
- [ ] Dashboard hiển thị data: Dashboards > StayHub - Application Overview

## 🎯 Next Steps

1. Tạo custom dashboards cho business metrics
2. Setup alerts trong Prometheus
3. Tích hợp với Alertmanager
4. Monitor database performance
5. Track custom business metrics

## 📚 Tài liệu tham khảo

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [Spring Boot Actuator](https://docs.spring.io/spring-boot/docs/current/reference/html/actuator.html)
- [Micrometer Prometheus](https://micrometer.io/docs/registry/prometheus)
