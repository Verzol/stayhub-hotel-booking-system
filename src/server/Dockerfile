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

# Thiết lập thư mục làm việc
WORKDIR /app

# Copy file jar từ builder stage
COPY --from=builder /app/target/*.jar app.jar

# Expose port mà ứng dụng sẽ chạy
EXPOSE 8080

# Command để chạy ứng dụng
ENTRYPOINT ["java", "-jar", "app.jar"]