package com.expensetracker.service;

import com.expensetracker.model.Expense;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ExecutionException;

/**
 * Service for managing expenses with Firebase Firestore.
 */
@Service
public class ExpenseService {

    private static final Logger logger = LoggerFactory.getLogger(ExpenseService.class);
    private static final String COLLECTION_NAME = "expenses";

    @Autowired
    private Firestore firestore;

    /**
     * Get all expenses for a user.
     */
    public List<Expense> getAllExpenses(String userId) {
        try {
            CollectionReference expenses = firestore.collection(COLLECTION_NAME);
            Query query = expenses.whereEqualTo("userId", userId)
                    .orderBy("date", Query.Direction.DESCENDING);

            ApiFuture<QuerySnapshot> querySnapshot = query.get();
            List<Expense> expenseList = new ArrayList<>();

            for (DocumentSnapshot document : querySnapshot.get().getDocuments()) {
                Expense expense = documentToExpense(document);
                if (expense != null) {
                    expenseList.add(expense);
                }
            }

            logger.info("Retrieved {} expenses for user {}", expenseList.size(), userId);
            return expenseList;
        } catch (InterruptedException | ExecutionException e) {
            logger.error("Error getting expenses", e);
            throw new RuntimeException("Failed to get expenses", e);
        }
    }

    /**
     * Get expense by ID.
     */
    public Optional<Expense> getExpenseById(String id) {
        try {
            DocumentReference docRef = firestore.collection(COLLECTION_NAME).document(id);
            ApiFuture<DocumentSnapshot> future = docRef.get();
            DocumentSnapshot document = future.get();

            if (document.exists()) {
                return Optional.ofNullable(documentToExpense(document));
            }
            return Optional.empty();
        } catch (InterruptedException | ExecutionException e) {
            logger.error("Error getting expense by ID", e);
            return Optional.empty();
        }
    }

    /**
     * Create a new expense.
     */
    public Expense createExpense(Expense expense, String userId) {
        try {
            sanitizeExpense(expense);
            expense.setUserId(userId);

            CollectionReference expenses = firestore.collection(COLLECTION_NAME);
            ApiFuture<DocumentReference> future = expenses.add(expenseToMap(expense));
            DocumentReference docRef = future.get();

            expense.setId(docRef.getId());
            logger.info("Created expense with ID: {}", expense.getId());
            return expense;
        } catch (InterruptedException | ExecutionException e) {
            logger.error("Error creating expense", e);
            throw new RuntimeException("Failed to create expense", e);
        }
    }

    /**
     * Update an existing expense.
     */
    public Optional<Expense> updateExpense(String id, Expense updatedExpense, String userId) {
        try {
            DocumentReference docRef = firestore.collection(COLLECTION_NAME).document(id);
            ApiFuture<DocumentSnapshot> future = docRef.get();
            DocumentSnapshot document = future.get();

            if (!document.exists()) {
                return Optional.empty();
            }

            // Security check
            String docUserId = document.getString("userId");
            if (userId != null && !userId.equals(docUserId)) {
                logger.warn("User {} attempted to update expense {} owned by {}", 
                    userId, id, docUserId);
                return Optional.empty();
            }

            sanitizeExpense(updatedExpense);
            updatedExpense.setId(id);
            updatedExpense.setUserId(userId);

            ApiFuture<WriteResult> updateFuture = docRef.update(expenseToMap(updatedExpense));
            updateFuture.get();

            logger.info("Updated expense with ID: {}", id);
            return Optional.of(updatedExpense);
        } catch (InterruptedException | ExecutionException e) {
            logger.error("Error updating expense", e);
            return Optional.empty();
        }
    }

    /**
     * Delete an expense.
     */
    public boolean deleteExpense(String id, String userId) {
        try {
            DocumentReference docRef = firestore.collection(COLLECTION_NAME).document(id);
            ApiFuture<DocumentSnapshot> future = docRef.get();
            DocumentSnapshot document = future.get();

            if (!document.exists()) {
                return false;
            }

            // Security check
            String docUserId = document.getString("userId");
            if (userId != null && !userId.equals(docUserId)) {
                logger.warn("User {} attempted to delete expense {} owned by {}", 
                    userId, id, docUserId);
                return false;
            }

            ApiFuture<WriteResult> deleteFuture = docRef.delete();
            deleteFuture.get();

            logger.info("Deleted expense with ID: {}", id);
            return true;
        } catch (InterruptedException | ExecutionException e) {
            logger.error("Error deleting expense", e);
            return false;
        }
    }

    /**
     * Get total amount of all expenses for a user.
     */
    public BigDecimal getTotalAmount(String userId) {
        List<Expense> expenses = getAllExpenses(userId);
        return expenses.stream()
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    /**
     * Convert Firestore document to Expense object.
     */
    private Expense documentToExpense(DocumentSnapshot document) {
        try {
            Expense expense = new Expense();
            expense.setId(document.getId());
            expense.setTitle(document.getString("title"));
            expense.setAmount(new BigDecimal(document.getDouble("amount").toString()));
            expense.setCategory(document.getString("category"));
            
            // Convert Firestore Timestamp to LocalDate
            com.google.cloud.Timestamp timestamp = document.getTimestamp("date");
            if (timestamp != null) {
                Date date = timestamp.toDate();
                expense.setDate(date.toInstant()
                        .atZone(ZoneId.systemDefault())
                        .toLocalDate());
            }
            
            expense.setUserId(document.getString("userId"));
            return expense;
        } catch (Exception e) {
            logger.error("Error converting document to expense", e);
            return null;
        }
    }

    /**
     * Convert Expense object to Firestore map.
     */
    private java.util.Map<String, Object> expenseToMap(Expense expense) {
        java.util.Map<String, Object> map = new java.util.HashMap<>();
        map.put("title", expense.getTitle());
        map.put("amount", expense.getAmount().doubleValue());
        map.put("category", expense.getCategory());
        
        // Convert LocalDate to Firestore Timestamp
        if (expense.getDate() != null) {
            Date date = Date.from(expense.getDate()
                    .atStartOfDay(ZoneId.systemDefault())
                    .toInstant());
            map.put("date", com.google.cloud.Timestamp.of(date));
        }
        
        map.put("userId", expense.getUserId());
        return map;
    }

    /**
     * Sanitize expense data.
     */
    private void sanitizeExpense(Expense expense) {
        if (expense.getTitle() != null) {
            expense.setTitle(expense.getTitle().trim());
        }
        if (expense.getCategory() != null) {
            expense.setCategory(expense.getCategory().trim());
        }
    }
}
