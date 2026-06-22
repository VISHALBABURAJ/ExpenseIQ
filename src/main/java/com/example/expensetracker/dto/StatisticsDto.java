package com.example.expensetracker.dto;

import java.math.BigDecimal;
import java.util.Map;

public class StatisticsDto {

    private BigDecimal totalExpenses;
    private Long totalTransactions;
    private BigDecimal weeklyExpenses;
    private BigDecimal monthlyExpenses;
    private BigDecimal yearlyExpenses;
    private String topCategory;
    private BigDecimal topCategoryAmount;
    private Map<String, BigDecimal> categoryBreakdown;

    public StatisticsDto() {
    }

    public StatisticsDto(
            BigDecimal totalExpenses,
            Long totalTransactions,
            BigDecimal weeklyExpenses,
            BigDecimal monthlyExpenses,
            BigDecimal yearlyExpenses,
            String topCategory,
            BigDecimal topCategoryAmount,
            Map<String, BigDecimal> categoryBreakdown) {

        this.totalExpenses = totalExpenses;
        this.totalTransactions = totalTransactions;
        this.weeklyExpenses = weeklyExpenses;
        this.monthlyExpenses = monthlyExpenses;
        this.yearlyExpenses = yearlyExpenses;
        this.topCategory = topCategory;
        this.topCategoryAmount = topCategoryAmount;
        this.categoryBreakdown = categoryBreakdown;
    }

    public BigDecimal getTotalExpenses() {
        return totalExpenses;
    }

    public void setTotalExpenses(BigDecimal totalExpenses) {
        this.totalExpenses = totalExpenses;
    }

    public Long getTotalTransactions() {
        return totalTransactions;
    }

    public void setTotalTransactions(Long totalTransactions) {
        this.totalTransactions = totalTransactions;
    }

    public BigDecimal getWeeklyExpenses() {
        return weeklyExpenses;
    }

    public void setWeeklyExpenses(BigDecimal weeklyExpenses) {
        this.weeklyExpenses = weeklyExpenses;
    }

    public BigDecimal getMonthlyExpenses() {
        return monthlyExpenses;
    }

    public void setMonthlyExpenses(BigDecimal monthlyExpenses) {
        this.monthlyExpenses = monthlyExpenses;
    }

    public BigDecimal getYearlyExpenses() {
        return yearlyExpenses;
    }

    public void setYearlyExpenses(BigDecimal yearlyExpenses) {
        this.yearlyExpenses = yearlyExpenses;
    }

    public String getTopCategory() {
        return topCategory;
    }

    public void setTopCategory(String topCategory) {
        this.topCategory = topCategory;
    }

    public BigDecimal getTopCategoryAmount() {
        return topCategoryAmount;
    }

    public void setTopCategoryAmount(BigDecimal topCategoryAmount) {
        this.topCategoryAmount = topCategoryAmount;
    }

    public Map<String, BigDecimal> getCategoryBreakdown() {
        return categoryBreakdown;
    }

    public void setCategoryBreakdown(Map<String, BigDecimal> categoryBreakdown) {
        this.categoryBreakdown = categoryBreakdown;
    }
}