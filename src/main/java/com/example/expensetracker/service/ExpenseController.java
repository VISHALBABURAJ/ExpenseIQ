package com.example.expensetracker.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.example.expensetracker.dto.ApiResponse;
import com.example.expensetracker.dto.ExpenseRequestDto;
import com.example.expensetracker.dto.ExpenseResponseDto;
import com.example.expensetracker.dto.StatisticsDto;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller exposing all expense-related endpoints.
 * Base URL: /expenses
 *
 * Uses constructor injection and delegates all logic to {@link ExpenseService}.
 */
@RestController
@RequestMapping("/expenses")
@Tag(name = "Expenses", description = "API for managing expense records")

public class ExpenseController {
    private static final Logger log =
        LoggerFactory.getLogger(ExpenseController.class);

    private final ExpenseService expenseService;

    public ExpenseController(ExpenseService expenseService) {
        this.expenseService = expenseService;
    }

    // ── Core CRUD ─────────────────────────────────────────────────────────────

    @PostMapping
    @Operation(summary = "Create a new expense")
    public ResponseEntity<ApiResponse<ExpenseResponseDto>> createExpense(
            @Valid @RequestBody ExpenseRequestDto requestDto) {
        log.info("POST /expenses - creating expense");
        ExpenseResponseDto created = expenseService.createExpense(requestDto);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Expense created successfully", created));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a single expense by ID")
    public ResponseEntity<ApiResponse<ExpenseResponseDto>> getExpenseById(
            @Parameter(description = "Expense ID") @PathVariable Long id) {
        log.info("GET /expenses/{}", id);
        ExpenseResponseDto dto = expenseService.getExpenseById(id);
        return ResponseEntity.ok(ApiResponse.success("Expense retrieved successfully", dto));
    }

    @GetMapping
    @Operation(summary = "Get all expenses (ordered by date descending)")
    public ResponseEntity<ApiResponse<List<ExpenseResponseDto>>> getAllExpenses() {
        log.info("GET /expenses");
        List<ExpenseResponseDto> expenses = expenseService.getAllExpenses();
        return ResponseEntity.ok(ApiResponse.success("Expenses retrieved successfully", expenses));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing expense")
    public ResponseEntity<ApiResponse<ExpenseResponseDto>> updateExpense(
            @Parameter(description = "Expense ID") @PathVariable Long id,
            @Valid @RequestBody ExpenseRequestDto requestDto) {
        log.info("PUT /expenses/{}", id);
        ExpenseResponseDto updated = expenseService.updateExpense(id, requestDto);
        return ResponseEntity.ok(ApiResponse.success("Expense updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an expense by ID")
    public ResponseEntity<ApiResponse<Void>> deleteExpense(
            @Parameter(description = "Expense ID") @PathVariable Long id) {
        log.info("DELETE /expenses/{}", id);
        expenseService.deleteExpense(id);
        return ResponseEntity.ok(ApiResponse.success("Expense deleted successfully", null));
    }

    // ── Reporting Endpoints ───────────────────────────────────────────────────

    @GetMapping("/weekly")
    @Operation(summary = "Get all expenses for the current week (Mon–Sun)")
    public ResponseEntity<ApiResponse<List<ExpenseResponseDto>>> getWeeklyExpenses() {
        return ResponseEntity.ok(
                ApiResponse.success("Weekly expenses retrieved", expenseService.getWeeklyExpenses()));
    }

    @GetMapping("/monthly")
    @Operation(summary = "Get all expenses for the current calendar month")
    public ResponseEntity<ApiResponse<List<ExpenseResponseDto>>> getMonthlyExpenses() {
        return ResponseEntity.ok(
                ApiResponse.success("Monthly expenses retrieved", expenseService.getMonthlyExpenses()));
    }

    @GetMapping("/yearly")
    @Operation(summary = "Get all expenses for the current calendar year")
    public ResponseEntity<ApiResponse<List<ExpenseResponseDto>>> getYearlyExpenses() {
        return ResponseEntity.ok(
                ApiResponse.success("Yearly expenses retrieved", expenseService.getYearlyExpenses()));
    }

    @GetMapping("/category/{category}")
    @Operation(summary = "Get all expenses for a specific category")
    public ResponseEntity<ApiResponse<List<ExpenseResponseDto>>> getExpensesByCategory(
            @Parameter(description = "Expense category name") @PathVariable String category) {
        log.info("GET /expenses/category/{}", category);
        return ResponseEntity.ok(
                ApiResponse.success("Category expenses retrieved", expenseService.getExpensesByCategory(category)));
    }

    @GetMapping("/search")
    @Operation(summary = "Search expenses by keyword (matches description or category)")
    public ResponseEntity<ApiResponse<List<ExpenseResponseDto>>> searchExpenses(
            @Parameter(description = "Search keyword") @RequestParam String keyword) {
        log.info("GET /expenses/search?keyword={}", keyword);
        return ResponseEntity.ok(
                ApiResponse.success("Search results", expenseService.searchExpenses(keyword)));
    }

    @GetMapping("/statistics")
    @Operation(summary = "Get aggregated dashboard statistics")
    public ResponseEntity<ApiResponse<StatisticsDto>> getStatistics() {
        log.info("GET /expenses/statistics");
        StatisticsDto stats = expenseService.getStatistics();
        return ResponseEntity.ok(ApiResponse.success("Statistics retrieved successfully", stats));
    }
}
