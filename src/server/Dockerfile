# Sử dụng Maven image để build ứng dụng
FROM maven:3.9-eclipse-temurin-21-alpine AS builder

# Thiết lập thư mục làm việc
WORKDIR /app

# Copy pom.xml và download dependencies trước (tận dụng Docker layer caching)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code và build ứng dụng
COPY src ./src
RUN mvn clean package -DskipTests

# Sử dụng JRE image nhẹ hơn để chạy ứng dụng
FROM eclipse-temurin:21-jre-alpine

# Cài đặt curl cho healthcheck
RUN apk add --no-cache curl

# Thiết lập thư mục làm việc
WORKDIR /app

# Copy file jar từ builder stage
COPY --from=builder /app/target/*.jar app.jar

# Environment variables - NO DEFAULT VALUES (injected at runtime)
# DB_URL, DB_USERNAME, DB_PASSWORD, JWT_SECRET_KEY, MAIL_* 
# are provided via docker-compose.yml or deployment config

# Expose port mà ứng dụng sẽ chạy
EXPOSE 8080

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

# Command để chạy ứng dụng
ENTRYPOINT ["java", "-Djava.net.preferIPv4Stack=true", "-jar", "app.jar"]