package com.expensetracker.dto;

import java.math.BigDecimal;
import java.util.List;

/**
 * Response object containing expenses and summary statistics.
 */
public class ExpenseResponse {

    private List<com.expensetracker.model.Expense> expenses;
    private BigDecimal totalAmount;
    private Integer count;

    public ExpenseResponse() {
    }

    public ExpenseResponse(List<com.expensetracker.model.Expense> expenses, BigDecimal totalAmount, Integer count) {
        this.expenses = expenses;
        this.totalAmount = totalAmount;
        this.count = count;
    }

    public List<com.expensetracker.model.Expense> getExpenses() {
        return expenses;
    }

    public void setExpenses(List<com.expensetracker.model.Expense> expenses) {
        this.expenses = expenses;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public Integer getCount() {
        return count;
    }

    public void setCount(Integer count) {
        this.count = count;
    }
}
