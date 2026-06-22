# ExpenseIQ — Full-Stack Expense Tracker

A complete, production-ready expense tracking application built with **Spring Boot 3**, **MySQL**, and **Vanilla JavaScript**.

---

## Project Structure

```
expense-tracker/
├── expense-tracker-backend/
│   ├── pom.xml
│   └── src/
│       ├── main/
│       │   ├── java/com/example/expense_tracker/
│       │   │   ├── ExpenseTrackerApplication.java
│       │   │   ├── config/
│       │   │   │   ├── CorsConfig.java
│       │   │   │   └── OpenApiConfig.java
│       │   │   ├── controller/
│       │   │   │   └── ExpenseController.java
│       │   │   ├── dto/
│       │   │   │   ├── ApiResponse.java
│       │   │   │   ├── ExpenseRequestDto.java
│       │   │   │   ├── ExpenseResponseDto.java
│       │   │   │   └── StatisticsDto.java
│       │   │   ├── entity/
│       │   │   │   └── Expense.java
│       │   │   ├── exception/
│       │   │   │   ├── GlobalExceptionHandler.java
│       │   │   │   └── ResourceNotFoundException.java
│       │   │   ├── repository/
│       │   │   │   └── ExpenseRepository.java
│       │   │   └── service/
│       │   │       ├── ExpenseService.java
│       │   │       └── impl/
│       │   │           └── ExpenseServiceImpl.java
│       │   └── resources/
│       │       ├── application.properties
│       │       └── data.sql
│       └── test/
└── expense-tracker-frontend/
    ├── index.html
    ├── style.css
    ├── app.js
    └── assets/
        ├── icons/
        └── images/
```

---

## Prerequisites

| Tool       | Version  |
|------------|----------|
| Java       | 17+      |
| Maven      | 3.8+     |
| MySQL      | 8.0+     |
| Web Browser| Modern   |

---

## Database Setup

### Step 1 — Start MySQL and create the database

```sql
-- Connect to MySQL as root
mysql -u root -p

-- Create the database (JPA will auto-create the table via ddl-auto=update)
CREATE DATABASE IF NOT EXISTS expense_tracker_db;
```

That's it! The `expenses` table is created automatically when the backend starts.

---

## Backend Setup

### Step 2 — Configure database credentials

Open `expense-tracker-backend/src/main/resources/application.properties` and update:

```properties
spring.datasource.username=root          # ← your MySQL username
spring.datasource.password=root          # ← your MySQL password
```

### Step 3 — Build and run

```bash
cd expense-tracker-backend
mvn clean install
mvn spring-boot:run
```

You should see:
```
==============================================
  Expense Tracker Backend is running!
  API Base URL : http://localhost:8080
  Swagger UI   : http://localhost:8080/swagger-ui.html
==============================================
```

---

## Frontend Setup

### Step 4 — Open the frontend

The frontend is pure HTML/CSS/JS — no build step required.

**Option A: Open directly in browser**
```
Open expense-tracker-frontend/index.html with your browser (File → Open)
```

**Option B: Serve with a local HTTP server (recommended)**
```bash
# Python 3
cd expense-tracker-frontend
python3 -m http.server 3000
# Then visit: http://localhost:3000
```

---

## REST API Reference

| Method | Endpoint                          | Description                       |
|--------|-----------------------------------|-----------------------------------|
| GET    | `/expenses`                       | Get all expenses                  |
| GET    | `/expenses/{id}`                  | Get expense by ID                 |
| POST   | `/expenses`                       | Create new expense                |
| PUT    | `/expenses/{id}`                  | Update expense                    |
| DELETE | `/expenses/{id}`                  | Delete expense                    |
| GET    | `/expenses/weekly`                | Get current week expenses         |
| GET    | `/expenses/monthly`               | Get current month expenses        |
| GET    | `/expenses/yearly`                | Get current year expenses         |
| GET    | `/expenses/category/{category}`   | Get expenses by category          |
| GET    | `/expenses/search?keyword=food`   | Search by keyword                 |
| GET    | `/expenses/statistics`            | Get dashboard statistics          |

### Swagger UI
Visit `http://localhost:8080/swagger-ui.html` to explore and test all endpoints interactively.

---

## Sample API Requests

**Create expense:**
```bash
curl -X POST http://localhost:8080/expenses \
  -H "Content-Type: application/json" \
  -d '{
    "category": "Food",
    "amount": 450.00,
    "expenseDate": "2024-06-15",
    "description": "Lunch at restaurant"
  }'
```

**Get statistics:**
```bash
curl http://localhost:8080/expenses/statistics
```

**Search:**
```bash
curl "http://localhost:8080/expenses/search?keyword=food"
```

---

## Expense Categories

| Category      | Emoji |
|---------------|-------|
| Food          | 🍔    |
| Transport     | 🚗    |
| Shopping      | 🛍️   |
| Entertainment | 🎬    |
| Health        | 🏥    |
| Education     | 📚    |
| Utilities     | 💡    |
| Rent          | 🏠    |
| Other         | 📦    |

---

## Features

### Dashboard
- Total expenses, transactions, weekly/monthly/yearly summaries
- Category breakdown donut chart (vanilla canvas)
- Top spending category
- Recent expenses quick view

### Expense Management
- Add, edit, delete with confirmation modal
- Form validation (frontend + backend)
- Date picker with auto day/month/year extraction

### Expense List
- Real-time search by category or description
- Filter by category and time period (weekly/monthly/yearly/all)
- Export to CSV
- Sortable table view

### Reports
- Weekly, Monthly, Yearly, Category-wise tabs
- Summary cards per report type
- Per-report totals and top category

---

## Tech Stack

**Backend**
- Spring Boot 3.2
- Spring Data JPA + Hibernate
- MySQL 8 with utf8mb4
- SpringDoc OpenAPI 2 (Swagger UI)
- Jakarta Bean Validation
- Lombok
- Global exception handling

**Frontend**
- HTML5 / CSS3 / Vanilla JS (ES2021)
- Fetch API for async HTTP
- Canvas API for donut chart
- CSS Custom Properties for theming
- Responsive grid layout (no framework)

---

## Troubleshooting

**CORS error in browser:**
> The `CorsConfig.java` allows all origins in development. If you still get CORS errors, ensure the backend is running on port 8080 and that you haven't changed `CONFIG.API_BASE` in `app.js`.

**MySQL connection refused:**
> Verify MySQL is running and the credentials in `application.properties` match your MySQL setup.

**Port 8080 already in use:**
> Change `server.port=8080` to another port in `application.properties`, and update `API_BASE` in `app.js` accordingly.

**Blank dashboard:**
> Check the browser console for network errors. The backend must be running before opening the frontend.
