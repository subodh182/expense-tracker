package com.expensetracker.controller;

import com.expensetracker.dto.ExpenseRequest;
import com.expensetracker.dto.ExpenseResponse;
import com.expensetracker.model.Expense;
import com.expensetracker.service.ExpenseService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST API controller for expense operations.
 */
@RestController
@RequestMapping("/api/expenses")
@CrossOrigin(origins = "*")
public class ExpenseController {

    private static final Logger logger = LoggerFactory.getLogger(ExpenseController.class);

    @Autowired
    private ExpenseService expenseService;

    /**
     * Get all expenses with summary.
     */
    @GetMapping
    public ResponseEntity<ExpenseResponse> getAllExpenses(
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        List<Expense> expenses = expenseService.getAllExpenses(userId);
        java.math.BigDecimal totalAmount = expenseService.getTotalAmount(userId);
        ExpenseResponse response = new ExpenseResponse(expenses, totalAmount, expenses.size());
        return ResponseEntity.ok(response);
    }

    /**
     * Get expense by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Expense> getExpenseById(@PathVariable String id) {
        return expenseService.getExpenseById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Create a new expense.
     */
    @PostMapping
    public ResponseEntity<Expense> createExpense(
            @Valid @RequestBody ExpenseRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        Expense expense = new Expense();
        expense.setTitle(request.getTitle());
        expense.setAmount(request.getAmount());
        expense.setCategory(request.getCategory());
        expense.setDate(request.getDate());

        Expense created = expenseService.createExpense(expense, userId);
        logger.info("Created expense: {}", created);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * Update an existing expense.
     */
    @PutMapping("/{id}")
    public ResponseEntity<Expense> updateExpense(
            @PathVariable String id,
            @Valid @RequestBody ExpenseRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        
        Expense expense = new Expense();
        expense.setTitle(request.getTitle());
        expense.setAmount(request.getAmount());
        expense.setCategory(request.getCategory());
        expense.setDate(request.getDate());

        return expenseService.updateExpense(id, expense, userId)
                .map(updated -> {
                    logger.info("Updated expense: {}", updated);
                    return ResponseEntity.ok(updated);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Delete an expense.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteExpense(
            @PathVariable String id,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        boolean deleted = expenseService.deleteExpense(id, userId);
        if (deleted) {
            logger.info("Deleted expense with ID: {}", id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Expense deleted successfully");
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.notFound().build();
    }

    /**
     * Exception handler for validation errors.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, String> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        logger.warn("Validation failed: {}", errors);
        return errors;
    }

    /**
     * Global exception handler.
     */
    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public Map<String, String> handleGlobalException(Exception ex) {
        logger.error("Internal server error", ex);
        Map<String, String> error = new HashMap<>();
        error.put("error", "An internal error occurred");
        error.put("message", ex.getMessage());
        return error;
    }
}
