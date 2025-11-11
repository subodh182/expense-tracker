// ===========================
// API SERVICE LAYER
// ===========================
// This service handles all backend communication
// Can work with Firebase OR Spring Boot Backend

const API_CONFIG = {
    USE_FIREBASE: true, // Set to false to use Spring Boot backend
    BACKEND_URL: 'http://localhost:8080/api/expenses', // Change for production
    PRODUCTION_URL: 'https://your-railway-app.up.railway.app/api/expenses'
};

// Get the correct API URL based on environment
function getApiUrl() {
    if (API_CONFIG.USE_FIREBASE) {
        return null; // Firebase handles this differently
    }
    return window.location.hostname === 'localhost' 
        ? API_CONFIG.BACKEND_URL 
        : API_CONFIG.PRODUCTION_URL;
}

// ===========================
// VALIDATION (From Backend)
// ===========================
const ExpenseValidator = {
    validateTitle(title) {
        if (!title || title.trim().length === 0) {
            return { valid: false, error: 'Title is required' };
        }
        if (title.length > 100) {
            return { valid: false, error: 'Title must not exceed 100 characters' };
        }
        return { valid: true };
    },

    validateAmount(amount) {
        const numAmount = parseFloat(amount);
        if (!amount || isNaN(numAmount)) {
            return { valid: false, error: 'Amount is required' };
        }
        if (numAmount < 0.01) {
            return { valid: false, error: 'Amount must be greater than 0' };
        }
        if (numAmount > 999999999.99) {
            return { valid: false, error: 'Amount is too large' };
        }
        return { valid: true };
    },

    validateCategory(category) {
        if (!category || category.trim().length === 0) {
            return { valid: false, error: 'Category is required' };
        }
        const categoryRegex = /^[a-zA-Z0-9\s-]+$/;
        if (!categoryRegex.test(category)) {
            return { valid: false, error: 'Category contains invalid characters' };
        }
        if (category.length > 50) {
            return { valid: false, error: 'Category must not exceed 50 characters' };
        }
        return { valid: true };
    },

    validateDate(date) {
        if (!date) {
            return { valid: false, error: 'Date is required' };
        }
        
        // Parse the date string (YYYY-MM-DD) in local timezone
        const selectedDate = new Date(date + 'T00:00:00');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate > today) {
            return { valid: false, error: 'Date cannot be in the future' };
        }
        return { valid: true };
    },

    validateExpense(expenseData) {
        const errors = [];

        const titleValidation = this.validateTitle(expenseData.title);
        if (!titleValidation.valid) errors.push(titleValidation.error);

        const amountValidation = this.validateAmount(expenseData.amount);
        if (!amountValidation.valid) errors.push(amountValidation.error);

        const categoryValidation = this.validateCategory(expenseData.category);
        if (!categoryValidation.valid) errors.push(categoryValidation.error);

        const dateValidation = this.validateDate(expenseData.date);
        if (!dateValidation.valid) errors.push(dateValidation.error);

        return {
            valid: errors.length === 0,
            errors: errors
        };
    }
};

// ===========================
// FIREBASE API (Current)
// ===========================
const FirebaseAPI = {
    async getAllExpenses(userId) {
        if (!window.db || !userId) {
            console.warn('Firebase not ready or user not authenticated');
            return [];
        }
        
        try {
            // Wait for Firestore modules to be available
            if (!window.firestoreModules) {
                console.log('⏳ FirebaseAPI: Waiting for Firestore modules...');
                
                // Wait up to 10 seconds for modules to load
                await new Promise((resolve, reject) => {
                    let attempts = 0;
                    const maxAttempts = 100;
                    
                    const checkModules = setInterval(() => {
                        attempts++;
                        if (window.firestoreModules) {
                            console.log('✅ FirebaseAPI: Modules loaded!');
                            clearInterval(checkModules);
                            resolve();
                        } else if (attempts >= maxAttempts) {
                            clearInterval(checkModules);
                            reject(new Error('Timeout waiting for Firestore modules'));
                        }
                    }, 100);
                });
            }
            
            if (!window.firestoreModules) {
                console.error('❌ Firestore modules still not loaded');
                throw new Error('Firestore modules not available');
            }
            
            console.log('📦 Destructuring Firestore modules...');
            const { collection, query, where, orderBy, getDocs } = window.firestoreModules;
            
            console.log('🔍 Querying expenses for user:', userId);
            const expensesRef = collection(window.db, 'expenses');
            const q = query(
                expensesRef,
                where('userId', '==', userId),
                orderBy('date', 'desc')
            );
            
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                date: doc.data().date?.toDate?.() || new Date(doc.data().date)
            }));
        } catch (error) {
            console.error('Error getting expenses:', error);
            throw error;
        }
    },

    async createExpense(expenseData, userId) {
        if (!window.db || !userId) throw new Error('Not authenticated');

        // Validate
        const validation = ExpenseValidator.validateExpense(expenseData);
        if (!validation.valid) {
            throw new Error(validation.errors.join(', '));
        }

        try {
            const { collection, addDoc, Timestamp } = window.firestoreModules;
            const expensesRef = collection(window.db, 'expenses');
            
            const docRef = await addDoc(expensesRef, {
                title: expenseData.title.trim(),
                amount: parseFloat(expenseData.amount),
                category: expenseData.category.trim(),
                date: Timestamp.fromDate(new Date(expenseData.date)),
                userId: userId,
                createdAt: Timestamp.now()
            });
            
            return { id: docRef.id, ...expenseData };
        } catch (error) {
            console.error('Error creating expense:', error);
            throw error;
        }
    },

    async updateExpense(expenseId, expenseData, userId) {
        if (!window.db || !userId) throw new Error('Not authenticated');

        // Validate
        const validation = ExpenseValidator.validateExpense(expenseData);
        if (!validation.valid) {
            throw new Error(validation.errors.join(', '));
        }

        try {
            const { doc, updateDoc, Timestamp } = window.firestoreModules;
            const expenseRef = doc(window.db, 'expenses', expenseId);
            
            await updateDoc(expenseRef, {
                title: expenseData.title.trim(),
                amount: parseFloat(expenseData.amount),
                category: expenseData.category.trim(),
                date: Timestamp.fromDate(new Date(expenseData.date)),
                updatedAt: Timestamp.now()
            });
            
            return { id: expenseId, ...expenseData };
        } catch (error) {
            console.error('Error updating expense:', error);
            throw error;
        }
    },

    async deleteExpense(expenseId, userId) {
        if (!window.db || !userId) throw new Error('Not authenticated');

        try {
            const { doc, deleteDoc } = window.firestoreModules;
            const expenseRef = doc(window.db, 'expenses', expenseId);
            await deleteDoc(expenseRef);
            return { success: true, message: 'Expense deleted successfully' };
        } catch (error) {
            console.error('Error deleting expense:', error);
            throw error;
        }
    }
};

// ===========================
// SPRING BOOT API (Backend)
// ===========================
const SpringBootAPI = {
    async getAllExpenses(userId) {
        try {
            const response = await fetch(getApiUrl(), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-Id': userId || 'anonymous'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.expenses || [];
        } catch (error) {
            console.error('Error fetching expenses:', error);
            throw error;
        }
    },

    async createExpense(expenseData, userId) {
        // Validate
        const validation = ExpenseValidator.validateExpense(expenseData);
        if (!validation.valid) {
            throw new Error(validation.errors.join(', '));
        }

        try {
            const response = await fetch(getApiUrl(), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-Id': userId || 'anonymous'
                },
                body: JSON.stringify({
                    title: expenseData.title.trim(),
                    amount: parseFloat(expenseData.amount),
                    category: expenseData.category.trim(),
                    date: expenseData.date
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to create expense');
            }

            return await response.json();
        } catch (error) {
            console.error('Error creating expense:', error);
            throw error;
        }
    },

    async updateExpense(expenseId, expenseData, userId) {
        // Validate
        const validation = ExpenseValidator.validateExpense(expenseData);
        if (!validation.valid) {
            throw new Error(validation.errors.join(', '));
        }

        try {
            const response = await fetch(`${getApiUrl()}/${expenseId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-Id': userId || 'anonymous'
                },
                body: JSON.stringify({
                    title: expenseData.title.trim(),
                    amount: parseFloat(expenseData.amount),
                    category: expenseData.category.trim(),
                    date: expenseData.date
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to update expense');
            }

            return await response.json();
        } catch (error) {
            console.error('Error updating expense:', error);
            throw error;
        }
    },

    async deleteExpense(expenseId, userId) {
        try {
            const response = await fetch(`${getApiUrl()}/${expenseId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-Id': userId || 'anonymous'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete expense');
            }

            return await response.json();
        } catch (error) {
            console.error('Error deleting expense:', error);
            throw error;
        }
    }
};

// ===========================
// UNIFIED API SERVICE
// ===========================
// This automatically uses Firebase or Spring Boot based on config
const ExpenseAPI = {
    // Validation utilities (exposed for form validation)
    validator: ExpenseValidator,

    // Get all expenses
    async getAll(userId) {
        return API_CONFIG.USE_FIREBASE 
            ? await FirebaseAPI.getAllExpenses(userId)
            : await SpringBootAPI.getAllExpenses(userId);
    },

    // Create new expense
    async create(expenseData, userId) {
        return API_CONFIG.USE_FIREBASE 
            ? await FirebaseAPI.createExpense(expenseData, userId)
            : await SpringBootAPI.createExpense(expenseData, userId);
    },

    // Update existing expense
    async update(expenseId, expenseData, userId) {
        return API_CONFIG.USE_FIREBASE 
            ? await FirebaseAPI.updateExpense(expenseId, expenseData, userId)
            : await SpringBootAPI.updateExpense(expenseId, expenseData, userId);
    },

    // Delete expense
    async delete(expenseId, userId) {
        return API_CONFIG.USE_FIREBASE 
            ? await FirebaseAPI.deleteExpense(expenseId, userId)
            : await SpringBootAPI.deleteExpense(expenseId, userId);
    },

    // Get current backend type
    getBackendType() {
        return API_CONFIG.USE_FIREBASE ? 'Firebase' : 'Spring Boot';
    },

    // Switch backend (for testing)
    switchBackend(useFirebase) {
        API_CONFIG.USE_FIREBASE = useFirebase;
        console.log(`✅ Switched to ${useFirebase ? 'Firebase' : 'Spring Boot'} backend`);
    }
};

// Also expose on window for backward compatibility
window.ExpenseAPI = ExpenseAPI;
window.ExpenseValidator = ExpenseValidator;
window.API_CONFIG = API_CONFIG;

// Export for ES6 module imports
export { ExpenseAPI, ExpenseValidator, API_CONFIG };

console.log(`✅ API Service initialized - Using ${API_CONFIG.USE_FIREBASE ? 'Firebase' : 'Spring Boot'} backend`);
