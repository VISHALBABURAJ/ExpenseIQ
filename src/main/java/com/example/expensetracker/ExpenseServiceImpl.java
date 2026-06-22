package com.example.expensetracker;

import com.example.expensetracker.dto.ExpenseRequestDto;
import com.example.expensetracker.dto.ExpenseResponseDto;
import com.example.expensetracker.dto.StatisticsDto;
import com.example.expensetracker.exception.ResourceNotFoundException;
import com.example.expensetracker.service.ExpenseService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional
public class ExpenseServiceImpl implements ExpenseService {


private static final Logger log =
        LoggerFactory.getLogger(ExpenseServiceImpl.class);

private final ExpenseRepository expenseRepository;

public ExpenseServiceImpl(ExpenseRepository expenseRepository) {
    this.expenseRepository = expenseRepository;
}

@Override
public ExpenseResponseDto createExpense(ExpenseRequestDto dto) {
    Expense expense = mapToEntity(dto);
    Expense saved = expenseRepository.save(expense);
    return mapToResponseDto(saved);
}

@Override
@Transactional(readOnly = true)
public ExpenseResponseDto getExpenseById(Long id) {
    Expense expense = findById(id);
    return mapToResponseDto(expense);
}

@Override
@Transactional(readOnly = true)
public List<ExpenseResponseDto> getAllExpenses() {
    return expenseRepository.findAllByOrderByExpenseDateDesc()
            .stream()
            .map(this::mapToResponseDto)
            .collect(Collectors.toList());
}

@Override
public ExpenseResponseDto updateExpense(Long id, ExpenseRequestDto dto) {

    Expense expense = findById(id);

    expense.setCategory(dto.getCategory());
    expense.setAmount(dto.getAmount());
    expense.setExpenseDate(dto.getExpenseDate());
    expense.setDescription(dto.getDescription());

    Expense updated = expenseRepository.save(expense);

    return mapToResponseDto(updated);
}

@Override
public void deleteExpense(Long id) {
    Expense expense = findById(id);
    expenseRepository.delete(expense);
}

@Override
@Transactional(readOnly = true)
public List<ExpenseResponseDto> getWeeklyExpenses() {

    LocalDate today = LocalDate.now();
    LocalDate weekStart =
            today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
    LocalDate weekEnd =
            today.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY));

    return expenseRepository
            .findByExpenseDateBetweenOrderByExpenseDateDesc(
                    weekStart, weekEnd)
            .stream()
            .map(this::mapToResponseDto)
            .collect(Collectors.toList());
}

@Override
@Transactional(readOnly = true)
public List<ExpenseResponseDto> getMonthlyExpenses() {

    LocalDate today = LocalDate.now();

    return expenseRepository
            .findByMonthAndYear(
                    today.getMonthValue(),
                    today.getYear())
            .stream()
            .map(this::mapToResponseDto)
            .collect(Collectors.toList());
}

@Override
@Transactional(readOnly = true)
public List<ExpenseResponseDto> getYearlyExpenses() {

    return expenseRepository
            .findByYear(LocalDate.now().getYear())
            .stream()
            .map(this::mapToResponseDto)
            .collect(Collectors.toList());
}

@Override
@Transactional(readOnly = true)
public List<ExpenseResponseDto> getExpensesByCategory(String category) {

    return expenseRepository
            .findByCategoryIgnoreCase(category)
            .stream()
            .map(this::mapToResponseDto)
            .collect(Collectors.toList());
}

@Override
@Transactional(readOnly = true)
public List<ExpenseResponseDto> searchExpenses(String keyword) {

    String pattern = "%" + keyword.trim() + "%";

    return expenseRepository
            .searchByKeyword(pattern)
            .stream()
            .map(this::mapToResponseDto)
            .collect(Collectors.toList());
}

@Override
@Transactional(readOnly = true)
public StatisticsDto getStatistics() {

    LocalDate today = LocalDate.now();
    LocalDate weekStart =
            today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
    LocalDate weekEnd =
            today.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY));

    BigDecimal total =
            expenseRepository.sumAllExpenses();

    BigDecimal weekly =
            expenseRepository.sumByDateRange(weekStart, weekEnd);

    BigDecimal monthly =
            expenseRepository.sumByDateRange(
                    today.withDayOfMonth(1),
                    today.with(TemporalAdjusters.lastDayOfMonth()));

    BigDecimal yearly =
            expenseRepository.sumByDateRange(
                    today.withDayOfYear(1),
                    today.with(TemporalAdjusters.lastDayOfYear()));

    Long totalTx =
            expenseRepository.countAllExpenses();

    List<Object[]> rows =
            expenseRepository.sumGroupedByCategory();

    Map<String, BigDecimal> breakdown =
            new LinkedHashMap<>();

    String topCat = null;
    BigDecimal topAmt = BigDecimal.ZERO;

    for (Object[] row : rows) {
        String cat = (String) row[0];
        BigDecimal amt = (BigDecimal) row[1];

        breakdown.put(cat, amt);

        if (topCat == null) {
            topCat = cat;
            topAmt = amt;
        }
    }

    StatisticsDto stats = new StatisticsDto();

    stats.setTotalExpenses(total);
    stats.setTotalTransactions(totalTx);
    stats.setWeeklyExpenses(weekly);
    stats.setMonthlyExpenses(monthly);
    stats.setYearlyExpenses(yearly);
    stats.setTopCategory(topCat);
    stats.setTopCategoryAmount(topAmt);
    stats.setCategoryBreakdown(breakdown);

    return stats;
}

private Expense findById(Long id) {

    return expenseRepository.findById(id)
            .orElseThrow(() ->
                    new ResourceNotFoundException(
                            "Expense not found with id: " + id));
}

private Expense mapToEntity(ExpenseRequestDto dto) {

    Expense expense = new Expense();

    expense.setCategory(dto.getCategory());
    expense.setAmount(dto.getAmount());
    expense.setExpenseDate(dto.getExpenseDate());
    expense.setDescription(dto.getDescription());

    return expense;
}

private ExpenseResponseDto mapToResponseDto(Expense e) {

    ExpenseResponseDto dto =
            new ExpenseResponseDto();

    dto.setId(e.getId());
    dto.setCategory(e.getCategory());
    dto.setAmount(e.getAmount());
    dto.setExpenseDate(e.getExpenseDate());
    dto.setDay(e.getDay());
    dto.setMonth(e.getMonth());
    dto.setYear(e.getYear());
    dto.setDescription(e.getDescription());

    return dto;
}


}
