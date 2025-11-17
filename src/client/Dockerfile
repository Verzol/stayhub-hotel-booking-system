# Build stage - Sử dụng Node.js để build React app
FROM node:20-alpine AS build

# Thiết lập thư mục làm việc
WORKDIR /app

# Set build arg for API URL
ARG VITE_API_BASE_URL=http://localhost:8080/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Copy package files và install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code và build
COPY . .
RUN npm run build

# Production stage - Sử dụng Nginx để serve static files
FROM nginx:alpine

# Copy built files từ build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration (nếu cần)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]