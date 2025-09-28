# Web Calendar

A full-stack web calendar application that allows users to create, view, and manage events. The application consists of a Spring Boot backend API with MySQL database and an Angular frontend.
Part of the frontend (HTML, CSS) and some logic of components and services was implemented via Claude Code.

## Architecture

- **Backend**: Spring Boot REST API (event-api)
- **Frontend**: Angular web application (web-calendar-ui)
- **Database**: MySQL 8.0
- **Containerization**: Docker with Docker Compose

## Running the Application

1. **Build the application**:
   ```bash
   docker compose build
   ```

2. **Start the application**:
   ```bash
   docker compose up
   ```

The application will be available at:
- Frontend: http://localhost (port 80)
- Backend API: http://localhost:8081
- MySQL Database: localhost:3306