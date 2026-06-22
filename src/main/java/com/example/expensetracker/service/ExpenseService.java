package com.example.expensetracker.service;

import com.example.expensetracker.dto.ExpenseRequestDto;
import com.example.expensetracker.dto.ExpenseResponseDto;
import com.example.expensetracker.dto.StatisticsDto;

import java.util.List;

/**
 * Service contract for all expense-related business operations.
 * The controller layer depends only on this interface (DIP).
 */
public interface ExpenseService {

    /** Create a new expense record */
    ExpenseResponseDto createExpense(ExpenseRequestDto requestDto);

    /** Retrieve a single expense by its ID */
    ExpenseResponseDto getExpenseById(Long id);

    /** Retrieve all expenses ordered by date descending */
    List<ExpenseResponseDto> getAllExpenses();

    /** Update an existing expense */
    ExpenseResponseDto updateExpense(Long id, ExpenseRequestDto requestDto);

    /** Delete an expense by ID */
    void deleteExpense(Long id);

    /** Get all expenses in the current week */
    List<ExpenseResponseDto> getWeeklyExpenses();

    /** Get all expenses in the current month */
    List<ExpenseResponseDto> getMonthlyExpenses();

    /** Get all expenses in the current year */
    List<ExpenseResponseDto> getYearlyExpenses();

    /** Get all expenses for a specific category */
    List<ExpenseResponseDto> getExpensesByCategory(String category);

    /** Search expenses by keyword (matches description or category) */
    List<ExpenseResponseDto> searchExpenses(String keyword);

    /** Get aggregated dashboard statistics */
    StatisticsDto getStatistics();
}
