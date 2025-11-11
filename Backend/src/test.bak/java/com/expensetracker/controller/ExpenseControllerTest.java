package com.expensetracker.controller;

import com.expensetracker.dto.ExpenseRequest;
import com.expensetracker.model.Expense;
import com.expensetracker.service.ExpenseService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ExpenseController.class)
class ExpenseControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ExpenseService expenseService;

    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
    }

    @Test
    void testGetAllExpenses() throws Exception {
        Expense expense1 = new Expense(1L, "Groceries", 100.0, "Food", LocalDate.now());
        Expense expense2 = new Expense(2L, "Bus Fare", 50.0, "Transport", LocalDate.now());
        
        when(expenseService.getAllExpenses()).thenReturn(Arrays.asList(expense1, expense2));
        when(expenseService.getTotalAmount()).thenReturn(150.0);

        mockMvc.perform(get("/api/expenses"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").value(2))
                .andExpect(jsonPath("$.totalAmount").value(150.0))
                .andExpect(jsonPath("$.expenses[0].title").value("Groceries"));
    }

    @Test
    void testGetExpenseById() throws Exception {
        Expense expense = new Expense(1L, "Groceries", 100.0, "Food", LocalDate.now());
        when(expenseService.getExpenseById(1L)).thenReturn(Optional.of(expense));

        mockMvc.perform(get("/api/expenses/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Groceries"))
                .andExpect(jsonPath("$.amount").value(100.0));
    }

    @Test
    void testCreateExpense() throws Exception {
        ExpenseRequest request = new ExpenseRequest("Groceries", 100.0, "Food", LocalDate.now());
        Expense created = new Expense(1L, "Groceries", 100.0, "Food", LocalDate.now());
        
        when(expenseService.createExpense(any(Expense.class))).thenReturn(created);

        mockMvc.perform(post("/api/expenses")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.title").value("Groceries"));
    }

    @Test
    void testCreateExpenseWithInvalidData() throws Exception {
        ExpenseRequest request = new ExpenseRequest("", -100.0, "", LocalDate.now());

        mockMvc.perform(post("/api/expenses")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testUpdateExpense() throws Exception {
        ExpenseRequest request = new ExpenseRequest("Updated", 150.0, "Transport", LocalDate.now());
        Expense updated = new Expense(1L, "Updated", 150.0, "Transport", LocalDate.now());
        
        when(expenseService.updateExpense(eq(1L), any(Expense.class))).thenReturn(Optional.of(updated));

        mockMvc.perform(put("/api/expenses/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Updated"));
    }

    @Test
    void testDeleteExpense() throws Exception {
        when(expenseService.deleteExpense(1L)).thenReturn(true);

        mockMvc.perform(delete("/api/expenses/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Expense deleted successfully"));
    }
}
