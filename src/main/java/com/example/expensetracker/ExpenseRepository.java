package com.example.expensetracker;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    // ── Basic Filters ────────────────────────────────────────────────────────

    /** Find all expenses in a given category (case-insensitive) */
    List<Expense> findByCategoryIgnoreCase(String category);

    /** Find all expenses within a date range, ordered newest first */
    List<Expense> findByExpenseDateBetweenOrderByExpenseDateDesc(LocalDate start, LocalDate end);

    /** Find all expenses for a specific month and year */
    List<Expense> findByMonthAndYear(Integer month, Integer year);

    /** Find all expenses for a specific year */
    List<Expense> findByYear(Integer year);

    /** Find expenses by category and month/year */
    List<Expense> findByCategoryIgnoreCaseAndMonthAndYear(String category, Integer month, Integer year);

    // ── Search ───────────────────────────────────────────────────────────────

    /**
     * Full-text search across description and category fields.
     * The % wildcards are added in the service layer.
     */
    @Query("SELECT e FROM Expense e WHERE " +
           "LOWER(e.description) LIKE LOWER(:keyword) OR " +
           "LOWER(e.category) LIKE LOWER(:keyword) " +
           "ORDER BY e.expenseDate DESC")
    List<Expense> searchByKeyword(@Param("keyword") String keyword);

    // ── Aggregation ──────────────────────────────────────────────────────────

    /** Sum of all expenses */
    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e")
    BigDecimal sumAllExpenses();

    /** Sum of expenses within a date range */
    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.expenseDate BETWEEN :start AND :end")
    BigDecimal sumByDateRange(@Param("start") LocalDate start, @Param("end") LocalDate end);

    /** Sum of expenses grouped by category — returns [category, total] pairs */
    @Query("SELECT e.category, COALESCE(SUM(e.amount), 0) FROM Expense e GROUP BY e.category ORDER BY SUM(e.amount) DESC")
    List<Object[]> sumGroupedByCategory();

    /** Total count of all expense records */
    @Query("SELECT COUNT(e) FROM Expense e")
    Long countAllExpenses();

    /** All expenses ordered by date descending */
    List<Expense> findAllByOrderByExpenseDateDesc();
}
