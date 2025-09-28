# Event API

A Spring Boot REST API for managing calendar events, built with Java 21 and MySQL.

## Features

- Create, read, update, and delete calendar events
- MySQL database with Flyway migrations
- Input validation and error handling
- Docker containerization
- Cross-origin resource sharing (CORS) enabled

## Technology Stack

- **Java 21**
- **Spring Boot 3.5.6**
- **Spring Data JPA**
- **MySQL 8**
- **Flyway** for database migrations
- **Maven** for dependency management
- **Docker** for containerization
- **Lombok** for reducing boilerplate code

## API Endpoints

### Events

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/events` | Get all events |
| GET | `/events/{id}` | Get event by ID |
| POST | `/events` | Create a new event |
| PUT | `/events/{id}` | Update an existing event |
| DELETE | `/events/{id}` | Delete an event |

## Getting Started

### Prerequisites

- Java 21
- Maven 3.9+
- MySQL 8
- Docker (optional)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd event-api
   ```

2. **Set up MySQL database**
   - Create a database named `event_api_db`
   - Update database credentials in `src/main/resources/application.properties` if needed

3. **Run the application**
   ```bash
   ./mvnw spring-boot:run
   ```

The API will be available at `http://localhost:8081`

### Docker Deployment

1. **Build the Docker image**
   ```bash
   docker build -t event-api .
   ```

2. **Run with Docker Compose** (from project root)
   ```bash
   docker-compose up
   ```

## Configuration

The application can be configured through `src/main/resources/application.properties`:

- **Server port**: `8081`
- **Database**: MySQL on `localhost:3306`
- **Database name**: `event_api_db`
- **Flyway migrations**: Located in `src/main/resources/db/migration`

## Database Migrations

Database schema is managed with Flyway. Migration scripts are located in `src/main/resources/db/migration/`.


