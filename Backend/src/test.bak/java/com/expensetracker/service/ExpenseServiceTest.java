package com.expensetracker.service;

import com.expensetracker.model.Expense;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.File;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

class ExpenseServiceTest {

    private ExpenseService expenseService;

    @TempDir
    File tempDir;

    @BeforeEach
    void setUp() {
        expenseService = new ExpenseService();
        File testDataFile = new File(tempDir, "test-expenses.json");
        ReflectionTestUtils.setField(expenseService, "dataFilePath", testDataFile.getAbsolutePath());
        expenseService.init();
    }

    @Test
    void testCreateExpense() {
        Expense expense = new Expense(null, "Test Expense", 100.0, "Food", LocalDate.now());
        Expense created = expenseService.createExpense(expense);

        assertNotNull(created.getId());
        assertEquals("Test Expense", created.getTitle());
        assertEquals(100.0, created.getAmount());
        assertEquals("Food", created.getCategory());
    }

    @Test
    void testGetAllExpenses() {
        Expense expense1 = new Expense(null, "Expense 1", 100.0, "Food", LocalDate.now());
        Expense expense2 = new Expense(null, "Expense 2", 200.0, "Transport", LocalDate.now());
        
        expenseService.createExpense(expense1);
        expenseService.createExpense(expense2);

        List<Expense> expenses = expenseService.getAllExpenses();
        assertEquals(2, expenses.size());
    }

    @Test
    void testGetExpenseById() {
        Expense expense = new Expense(null, "Test Expense", 100.0, "Food", LocalDate.now());
        Expense created = expenseService.createExpense(expense);

        Optional<Expense> found = expenseService.getExpenseById(created.getId());
        assertTrue(found.isPresent());
        assertEquals(created.getId(), found.get().getId());
    }

    @Test
    void testUpdateExpense() {
        Expense expense = new Expense(null, "Original", 100.0, "Food", LocalDate.now());
        Expense created = expenseService.createExpense(expense);

        Expense updated = new Expense(null, "Updated", 150.0, "Transport", LocalDate.now());
        Optional<Expense> result = expenseService.updateExpense(created.getId(), updated);

        assertTrue(result.isPresent());
        assertEquals("Updated", result.get().getTitle());
        assertEquals(150.0, result.get().getAmount());
    }

    @Test
    void testDeleteExpense() {
        Expense expense = new Expense(null, "Test Expense", 100.0, "Food", LocalDate.now());
        Expense created = expenseService.createExpense(expense);

        boolean deleted = expenseService.deleteExpense(created.getId());
        assertTrue(deleted);

        Optional<Expense> found = expenseService.getExpenseById(created.getId());
        assertFalse(found.isPresent());
    }

    @Test
    void testGetTotalAmount() {
        Expense expense1 = new Expense(null, "Expense 1", 100.0, "Food", LocalDate.now());
        Expense expense2 = new Expense(null, "Expense 2", 200.0, "Transport", LocalDate.now());
        
        expenseService.createExpense(expense1);
        expenseService.createExpense(expense2);

        Double total = expenseService.getTotalAmount();
        assertEquals(300.0, total);
    }

    @Test
    void testSanitization() {
        Expense expense = new Expense(null, "<script>alert('xss')</script>", 100.0, "Food<script>", LocalDate.now());
        Expense created = expenseService.createExpense(expense);

        assertFalse(created.getTitle().contains("<script>"));
        assertFalse(created.getCategory().contains("<script>"));
    }
}
