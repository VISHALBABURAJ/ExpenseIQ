package com.example.expensetracker;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Main entry point for the Expense Tracker Application.
 * Bootstraps the Spring Boot context and starts the embedded server.
 */
@SpringBootApplication
public class ExpenseTrackerApplication {

    public static void main(String[] args) {
        SpringApplication.run(ExpenseTrackerApplication.class, args);
        System.out.println("==============================================");
        System.out.println("  Expense Tracker Backend is running!");
        System.out.println("  API Base URL : http://localhost:8080");
        System.out.println("  Swagger UI   : http://localhost:8080/swagger-ui.html");
        System.out.println("==============================================");
    }
}
