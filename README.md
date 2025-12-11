<div align="center">

# StayHub

### Modern Hotel & Homestay Booking Platform

[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.x-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)](https://spring.io/projects/spring-boot)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

<p align="center">
  <strong>A full-stack enterprise web application connecting travelers with hotels and homestays.</strong>
</p>

[Features](#-features) [Tech Stack](#-tech-stack) [Architecture](#-architecture) [Getting Started](#-getting-started) [API Documentation](#-api-documentation)

</div>

---

## Overview

**StayHub** is a comprehensive accommodation booking platform built with modern technologies and best practices. The system enables seamless connections between guests seeking accommodations and hosts offering properties, featuring real-time availability, secure payments, and an intuitive user experience.

### Key Highlights

- **Secure Authentication** JWT-based auth with OAuth2 social login support
- **Smart Search** Advanced filtering by location, price, amenities, and ratings
- **Payment Integration** Secure online payment processing
- **Analytics Dashboard** Real-time insights for hosts and admins
- **Responsive Design** Optimized for all devices
- **Container-Ready** Docker & Docker Compose for easy deployment

---

## Features

<table>
<tr>
<td width="33%">

### Guest Features

- Browse & search properties
- Advanced filters & sorting
- Secure booking & payment
- Booking history & management
- Wishlist & favorites
- Reviews & ratings

</td>
<td width="33%">

### Host Features

- Property listing management
- Room & pricing control
- Booking request handling
- Revenue analytics
- Calendar management
- Guest communication

</td>
<td width="33%">

### Admin Features

- User management
- Property moderation
- System-wide analytics
- Content management
- Reports & insights
- Platform configuration

</td>
</tr>
</table>

---

## Tech Stack

### Frontend

| Technology                                                                                                           | Purpose       |
| -------------------------------------------------------------------------------------------------------------------- | ------------- |
| ![React](https://img.shields.io/badge/-React_18-61DAFB?style=flat-square&logo=react&logoColor=black)                 | UI Library    |
| ![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)     | Type Safety   |
| ![Vite](https://img.shields.io/badge/-Vite-646CFF?style=flat-square&logo=vite&logoColor=white)                       | Build Tool    |
| ![TailwindCSS](https://img.shields.io/badge/-Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white) | Styling       |
| ![React Query](https://img.shields.io/badge/-React_Query-FF4154?style=flat-square&logo=reactquery&logoColor=white)   | Data Fetching |

### Backend

| Technology                                                                                                                     | Purpose        |
| ------------------------------------------------------------------------------------------------------------------------------ | -------------- |
| ![Spring Boot](https://img.shields.io/badge/-Spring_Boot_3-6DB33F?style=flat-square&logo=springboot&logoColor=white)           | Framework      |
| ![Java](https://img.shields.io/badge/-Java_21-ED8B00?style=flat-square&logo=openjdk&logoColor=white)                           | Language       |
| ![Spring Security](https://img.shields.io/badge/-Spring_Security-6DB33F?style=flat-square&logo=springsecurity&logoColor=white) | Authentication |
| ![JWT](https://img.shields.io/badge/-JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)                          | Token Auth     |
| ![Maven](https://img.shields.io/badge/-Maven-C71A36?style=flat-square&logo=apachemaven&logoColor=white)                        | Build Tool     |

### Database & Infrastructure

| Technology                                                                                                                  | Purpose            |
| --------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| ![PostgreSQL](https://img.shields.io/badge/-PostgreSQL_16-4169E1?style=flat-square&logo=postgresql&logoColor=white)         | Primary Database   |
| ![Redis](https://img.shields.io/badge/-Redis-DC382D?style=flat-square&logo=redis&logoColor=white)                           | Caching & Sessions |
| ![Docker](https://img.shields.io/badge/-Docker-2496ED?style=flat-square&logo=docker&logoColor=white)                        | Containerization   |
| ![GitHub Actions](https://img.shields.io/badge/-GitHub_Actions-2088FF?style=flat-square&logo=githubactions&logoColor=white) | CI/CD              |
| ![Nginx](https://img.shields.io/badge/-Nginx-009639?style=flat-square&logo=nginx&logoColor=white)                           | Reverse Proxy      |

---

## Architecture

```

                         Client Layer

             React + TypeScript + Tailwind CSS
                      (Vite Build)





                        API Gateway
                     (Nginx Reverse Proxy)




                       Backend Layer

                Spring Boot 3.x (Java 21)

     Controllers    Services     Repositories






                        Data Layer

     PostgreSQL 16                  Redis
    (Primary Store)            (Cache/Sessions)


```

---

## Project Structure

```
stayhub/
  src/
     client/                 # Frontend Application
        src/
           components/     # Reusable UI components
           features/       # Feature modules
              auth/       # Authentication pages
              admin/      # Admin dashboard
              host/       # Host management
              user/       # User profile
           services/       # API services
           context/        # React Context
           types/          # TypeScript types
        package.json
        vite.config.ts
        Dockerfile

     server/                 # Backend Application
         src/main/java/
            com/verzol/stayhub/
                config/     # Configuration classes
                controller/ # REST Controllers
                service/    # Business logic
                repository/ # Data access
                model/      # Entity classes
                exception/  # Exception handling
         pom.xml
         Dockerfile

  docs/                       # Documentation
  docker-compose.yml          # Container orchestration
  README.md
```

---

## Getting Started

### Prerequisites

| Requirement | Version |
| ----------- | ------- |
| Node.js     | >= 18.x |
| Java JDK    | >= 21   |
| Docker      | Latest  |
| Maven       | >= 3.9  |

### Quick Start with Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/Verzol/stayhub.git
cd stayhub

# Start all services
docker-compose up -d --build

# View logs
docker-compose logs -f
```

| Service     | URL                                   |
| ----------- | ------------------------------------- |
| Frontend    | http://localhost:3000                 |
| Backend API | http://localhost:8080                 |
| API Docs    | http://localhost:8080/swagger-ui.html |

### Development Setup

<details>
<summary><strong>Backend Setup</strong></summary>

```bash
# Navigate to server directory
cd src/server

# Run with Maven
./mvnw spring-boot:run

# Or build JAR
./mvnw clean package
java -jar target/*.jar
```

</details>

<details>
<summary><strong>Frontend Setup</strong></summary>

```bash
# Navigate to client directory
cd src/client

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

</details>

---

## API Documentation

API documentation is available via Swagger UI when the server is running:

```
http://localhost:8080/swagger-ui.html
```

### Sample Endpoints

| Method | Endpoint             | Description         |
| ------ | -------------------- | ------------------- |
| `POST` | `/api/auth/register` | User registration   |
| `POST` | `/api/auth/login`    | User authentication |
| `GET`  | `/api/properties`    | List all properties |
| `POST` | `/api/bookings`      | Create a booking    |
| `GET`  | `/api/users/profile` | Get user profile    |

---

## Testing

```bash
# Backend tests
cd src/server
./mvnw test

# Frontend tests
cd src/client
npm run test

# E2E tests
npm run test:e2e
```

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

<div align="center">

### Contact

**Author:** Verzol  
**GitHub:** [@Verzol](https://github.com/Verzol)

---

<p>
  <sub>Built with  using React & Spring Boot</sub>
</p>

Star this repository if you find it helpful!

</div>
