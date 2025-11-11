// Firebase Authentication Integration
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// Import API Service for expense operations
import { ExpenseAPI, ExpenseValidator } from './api-service.js';

let currentUser = null;

// DOM Elements
const authModal = document.getElementById('authModal');
const mainHeader = document.getElementById('mainHeader');
const mainContainer = document.getElementById('mainContainer');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const logoutBtn = document.getElementById('logoutBtn');
const userEmailSpan = document.getElementById('userEmail');
const authTabs = document.querySelectorAll('.auth-tab');

// Wait for Firebase to be ready before setting up auth observer
function initializeAuth() {
    if (!window.auth) {
        console.error('❌ Firebase Auth not initialized yet. Waiting...');
        // Wait for Firebase to be ready
        window.addEventListener('firebaseReady', () => {
            console.log('✅ Firebase ready event received, setting up auth...');
            setupAuthObserver();
        });
        return;
    }
    setupAuthObserver();
}

// Setup Auth State Observer
function setupAuthObserver() {
    onAuthStateChanged(window.auth, (user) => {
        if (user) {
            currentUser = user;
            showMainApp();
            userEmailSpan.textContent = user.email;
            loadUserExpenses();
        } else {
            currentUser = null;
            showAuthModal();
        }
    });
}

// Initialize auth when script loads
initializeAuth();

// Show/Hide UI based on auth state
function showAuthModal() {
    authModal.style.display = 'flex';
    mainHeader.style.display = 'none';
    mainContainer.style.display = 'none';
}

function showMainApp() {
    authModal.style.display = 'none';
    mainHeader.style.display = 'block';
    mainContainer.style.display = 'block';
}

// Auth Tab Switching
authTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const tabName = tab.dataset.tab;
        
        authTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        if (tabName === 'login') {
            loginForm.style.display = 'block';
            signupForm.style.display = 'none';
            document.getElementById('authTitle').textContent = 'Welcome Back';
            document.getElementById('authSubtitle').textContent = 'Sign in to manage your expenses';
        } else {
            loginForm.style.display = 'none';
            signupForm.style.display = 'block';
            document.getElementById('authTitle').textContent = 'Create Account';
            document.getElementById('authSubtitle').textContent = 'Start tracking your expenses today';
        }
        
        // Clear errors
        document.getElementById('loginError').textContent = '';
        document.getElementById('signupError').textContent = '';
    });
});

// Login Form Handler
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const errorEl = document.getElementById('loginError');
    
    try {
        await signInWithEmailAndPassword(window.auth, email, password);
        errorEl.textContent = '';
    } catch (error) {
        console.error('Login error:', error);
        errorEl.textContent = getErrorMessage(error.code);
    }
});

// Signup Form Handler
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const errorEl = document.getElementById('signupError');
    
    try {
        const userCredential = await createUserWithEmailAndPassword(window.auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        errorEl.textContent = '';
    } catch (error) {
        console.error('Signup error:', error);
        errorEl.textContent = getErrorMessage(error.code);
    }
});

// Logout Handler
logoutBtn.addEventListener('click', async () => {
    try {
        await signOut(window.auth);
    } catch (error) {
        console.error('Logout error:', error);
        alert('Error logging out. Please try again.');
    }
});

// Error Messages
function getErrorMessage(errorCode) {
    const messages = {
        'auth/email-already-in-use': 'This email is already registered.',
        'auth/invalid-email': 'Invalid email address.',
        'auth/weak-password': 'Password should be at least 6 characters.',
        'auth/user-not-found': 'No account found with this email.',
        'auth/wrong-password': 'Incorrect password.',
        'auth/too-many-requests': 'Too many attempts. Please try again later.',
        'auth/invalid-credential': 'Invalid email or password.'
    };
    return messages[errorCode] || 'An error occurred. Please try again.';
}

// ============================================
// EXPENSE FUNCTIONS (Using API Service)
// ============================================

// Load User's Expenses
async function loadUserExpenses() {
    if (!currentUser) return;
    
    try {
        // Wait for Firebase modules to be ready
        if (!window.firestoreModules) {
            console.log('⏳ Waiting for Firestore modules to load...');
            
            // Wait for firebaseReady event or timeout after 10 seconds
            await new Promise((resolve, reject) => {
                let attempts = 0;
                const maxAttempts = 100; // 10 seconds (100 * 100ms)
                
                const checkModules = setInterval(() => {
                    attempts++;
                    console.log(`Checking for modules... attempt ${attempts}`);
                    
                    if (window.firestoreModules) {
                        console.log('✅ Firestore modules loaded!');
                        clearInterval(checkModules);
                        resolve();
                    } else if (attempts >= maxAttempts) {
                        clearInterval(checkModules);
                        reject(new Error('Timeout: Firestore modules not loaded'));
                    }
                }, 100);
            });
        }
        
        if (!window.firestoreModules) {
            throw new Error('Firestore modules failed to load. Please refresh the page.');
        }
        
        console.log('📊 Loading expenses for user:', currentUser.uid);
        
        // Use imported ExpenseAPI
        const expenses = await ExpenseAPI.getAll(currentUser.uid);
        
        console.log('✅ Loaded expenses:', expenses.length);
        
        // Update UI with expenses
        window.updateExpensesUI(expenses);
    } catch (error) {
        console.error('❌ Error loading expenses:', error);
        alert('Failed to load expenses. Please refresh the page.');
    }
}

// Add Expense (Using API Service)
window.addExpenseToFirestore = async (expense) => {
    if (!currentUser) {
        throw new Error('User not authenticated');
    }
    
    try {
        // Validate using imported ExpenseValidator
        const validation = ExpenseValidator.validateExpense(expense);
        if (!validation.valid) {
            throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
        }
        
        // Use imported ExpenseAPI
        const result = await ExpenseAPI.create(expense, currentUser.uid);
        
        // Reload expenses to get updated list
        await loadUserExpenses();
        
        return result;
    } catch (error) {
        console.error('Error adding expense:', error);
        throw error;
    }
};

// Update Expense (Using API Service)
window.updateExpenseInFirestore = async (id, expense) => {
    if (!currentUser) {
        throw new Error('User not authenticated');
    }
    
    try {
        // Validate using imported ExpenseValidator
        const validation = ExpenseValidator.validateExpense(expense);
        if (!validation.valid) {
            throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
        }
        
        // Use imported ExpenseAPI
        const result = await ExpenseAPI.update(id, expense, currentUser.uid);
        
        // Reload expenses to get updated list
        await loadUserExpenses();
        
        return result;
    } catch (error) {
        console.error('Error updating expense:', error);
        throw error;
    }
};

// Delete Expense (Using API Service)
window.deleteExpenseFromFirestore = async (id) => {
    if (!currentUser) {
        throw new Error('User not authenticated');
    }
    
    try {
        // Use imported ExpenseAPI
        await ExpenseAPI.delete(id, currentUser.uid);
        
        // Reload expenses to get updated list
        await loadUserExpenses();
        
        return true;
    } catch (error) {
        console.error('Error deleting expense:', error);
        throw error;
    }
};

// Get Current User
window.getCurrentUser = () => currentUser;

// Export functions for app.js to use
export {
    loadUserExpenses,
    currentUser
};
