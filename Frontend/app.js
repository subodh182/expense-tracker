// ===========================
// CONFIGURATION & CONSTANTS
// ===========================
// Firebase will handle data storage - no need for API_BASE_URL

let allExpenses = [];
let editingExpenseId = null;
let charts = {
    pie: null,
    bar: null,
    trend: null,
    monthlyBar: null
};

// Function to update expenses UI (called by firebase-auth.js)
window.updateExpensesUI = function(expenses) {
    allExpenses = expenses;
    renderExpenses();
    updateSummaryCards();
    renderCharts();
};

// ===========================
// THEME MANAGEMENT
// ===========================
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
    
    // Update charts with new theme colors
    if (allExpenses.length > 0) {
        renderCharts();
    }
}

function updateThemeIcon(theme) {
    const themeIcon = document.querySelector('.theme-icon');
    themeIcon.textContent = theme === 'light' ? '🌙' : '☀️';
}

// ===========================
// NAVIGATION SYSTEM
// ===========================
function initializeNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const section = button.getAttribute('data-section');
            switchSection(section);
            
            // Update active state
            navButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        });
    });
    
    // Footer links navigation
    const footerLinks = document.querySelectorAll('[data-nav]');
    footerLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.getAttribute('data-nav');
            switchSection(section);
            
            // Update nav button active state
            navButtons.forEach(btn => btn.classList.remove('active'));
            const targetBtn = document.querySelector(`.nav-btn[data-section="${section}"]`);
            if (targetBtn) targetBtn.classList.add('active');
        });
    });
}

function switchSection(section) {
    // All sections are always visible in this design
    // But we can scroll to relevant content based on section
    switch(section) {
        case 'dashboard':
            window.scrollTo({ top: 0, behavior: 'smooth' });
            break;
        case 'expenses':
            document.querySelector('#expenseForm').scrollIntoView({ behavior: 'smooth', block: 'start' });
            break;
        case 'analytics':
            document.querySelector('#categoryPieChart').parentElement.parentElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            break;
    }
}

// ===========================
// API CALLS (Now using Firebase)
// ===========================
async function loadExpenses() {
    // Firebase handles loading via real-time listener in firebase-auth.js
    // This function is no longer needed but kept for compatibility
    console.log('Expenses loaded via Firebase real-time listener');
}

async function saveExpense(expenseData) {
    try {
        if (editingExpenseId) {
            // Update existing expense
            await window.updateExpenseInFirestore(editingExpenseId, expenseData);
            showNotification('Expense updated successfully!', 'success');
        } else {
            // Add new expense
            await window.addExpenseToFirestore(expenseData);
            showNotification('Expense added successfully!', 'success');
        }
        
        resetForm();
        editingExpenseId = null;
    } catch (error) {
        console.error('Error saving expense:', error);
        showNotification('Failed to save expense. Please try again.', 'error');
    }
}

async function deleteExpense(id) {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    
    try {
        await window.deleteExpenseFromFirestore(id);
        showNotification('Expense deleted successfully!', 'success');
    } catch (error) {
        console.error('Error deleting expense:', error);
        showNotification('Failed to delete expense', 'error');
    }
}

// ===========================
// FORM HANDLING
// ===========================
function resetForm() {
    const form = document.getElementById('expenseForm');
    const dateInput = document.getElementById('date');
    const cancelBtn = document.getElementById('cancelBtn');
    
    form.reset();
    dateInput.value = new Date().toISOString().split('T')[0];
    document.getElementById('submitBtn').textContent = 'Add Expense';
    cancelBtn.style.display = 'none';
    editingExpenseId = null;
}

function initializeForm() {
    const form = document.getElementById('expenseForm');
    const cancelBtn = document.getElementById('cancelBtn');
    const dateInput = document.getElementById('date');
    
    // Set today's date as default
    dateInput.value = new Date().toISOString().split('T')[0];
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        const expenseData = {
            title: document.getElementById('title').value.trim(),
            amount: parseFloat(document.getElementById('amount').value),
            category: document.getElementById('category').value,
            date: document.getElementById('date').value
        };
        
        await saveExpense(expenseData);
        form.reset();
        dateInput.value = new Date().toISOString().split('T')[0];
        document.getElementById('submitBtn').textContent = 'Add Expense';
        cancelBtn.style.display = 'none';
    });
    
    cancelBtn.addEventListener('click', () => {
        form.reset();
        dateInput.value = new Date().toISOString().split('T')[0];
        editingExpenseId = null;
        document.getElementById('submitBtn').textContent = 'Add Expense';
        cancelBtn.style.display = 'none';
    });
}

function validateForm() {
    let isValid = true;
    
    // Clear previous errors
    document.querySelectorAll('.error').forEach(el => el.textContent = '');
    
    const title = document.getElementById('title').value.trim();
    const amount = document.getElementById('amount').value;
    const category = document.getElementById('category').value;
    const date = document.getElementById('date').value;
    
    if (!title) {
        document.getElementById('titleError').textContent = 'Title is required';
        isValid = false;
    }
    
    if (!amount || parseFloat(amount) <= 0) {
        document.getElementById('amountError').textContent = 'Amount must be greater than 0';
        isValid = false;
    }
    
    if (!category) {
        document.getElementById('categoryError').textContent = 'Category is required';
        isValid = false;
    }
    
    if (!date) {
        document.getElementById('dateError').textContent = 'Date is required';
        isValid = false;
    }
    
    return isValid;
}

// ===========================
// RENDERING
// ===========================
function renderExpenses() {
    const tbody = document.getElementById('expensesTableBody');
    
    if (allExpenses.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No expenses found</td></tr>';
        return;
    }
    
    let expenses = filterAndSortExpenses();
    
    tbody.innerHTML = expenses.map(expense => `
        <tr>
            <td>${formatDate(expense.date)}</td>
            <td>${escapeHtml(expense.title)}</td>
            <td>
                <span class="category-badge category-${expense.category.toLowerCase()}">
                    ${expense.category}
                </span>
            </td>
            <td class="amount">₹${expense.amount.toFixed(2)}</td>
            <td>
                <button class="btn-icon" onclick="editExpense('${expense.id}')" title="Edit">
                    ✏️
                </button>
                <button class="btn-icon" onclick="deleteExpense('${expense.id}')" title="Delete">
                    🗑️
                </button>
            </td>
        </tr>
    `).join('');
}

function filterAndSortExpenses() {
    let filtered = [...allExpenses];
    
    // Apply category filter
    const categoryFilter = document.getElementById('categoryFilter').value;
    if (categoryFilter) {
        filtered = filtered.filter(exp => exp.category === categoryFilter);
    }
    
    // Apply sorting
    const sortBy = document.getElementById('sortBy').value;
    filtered.sort((a, b) => {
        switch(sortBy) {
            case 'date-desc':
                return new Date(b.date) - new Date(a.date);
            case 'date-asc':
                return new Date(a.date) - new Date(b.date);
            case 'amount-desc':
                return b.amount - a.amount;
            case 'amount-asc':
                return a.amount - b.amount;
            default:
                return 0;
        }
    });
    
    return filtered;
}

function updateSummaryCards() {
    const total = allExpenses.length;
    const totalAmount = allExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    
    // Calculate monthly amount
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyExpenses = allExpenses.filter(exp => {
        const expDate = new Date(exp.date);
        return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
    });
    const monthlyAmount = monthlyExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    
    // Calculate average per day (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentExpenses = allExpenses.filter(exp => new Date(exp.date) >= thirtyDaysAgo);
    const avgAmount = recentExpenses.length > 0 ? recentExpenses.reduce((sum, exp) => sum + exp.amount, 0) / 30 : 0;
    
    document.getElementById('totalExpenses').textContent = total;
    document.getElementById('totalAmount').textContent = `₹${totalAmount.toFixed(2)}`;
    document.getElementById('monthlyAmount').textContent = `₹${monthlyAmount.toFixed(2)}`;
    document.getElementById('avgAmount').textContent = `₹${avgAmount.toFixed(2)}`;
}

// ===========================
// CHARTS
// ===========================
function renderCharts() {
    if (allExpenses.length === 0) {
        destroyCharts();
        renderEmptyCharts();
        return;
    }
    
    renderCategoryPieChart();
    renderCategoryBarChart();
    renderMonthlyTrendChart();
    renderMonthlyBarChart();
    renderCategorySummary();
}

function renderCategoryPieChart() {
    const ctx = document.getElementById('categoryPieChart');
    if (!ctx) return;
    
    const categoryData = getCategoryData();
    const theme = document.documentElement.getAttribute('data-theme');
    const textColor = theme === 'dark' ? '#e2e8f0' : '#334155';
    
    if (charts.pie) charts.pie.destroy();
    
    charts.pie = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: categoryData.labels,
            datasets: [{
                data: categoryData.amounts,
                backgroundColor: [
                    '#ec4899', '#f97316', '#eab308', '#22c55e', 
                    '#06b6d4', '#3b82f6', '#8b5cf6', '#a855f7'
                ],
                borderWidth: 2,
                borderColor: theme === 'dark' ? '#1e293b' : '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: textColor,
                        padding: 15,
                        font: { size: 12 }
                    }
                },
                title: {
                    display: true,
                    text: 'Spending Distribution',
                    color: textColor,
                    font: { size: 16, weight: 'bold' }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: ₹${value.toFixed(2)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

function renderCategoryBarChart() {
    const ctx = document.getElementById('categoryBarChart');
    if (!ctx) return;
    
    const categoryData = getCategoryData();
    const theme = document.documentElement.getAttribute('data-theme');
    const textColor = theme === 'dark' ? '#e2e8f0' : '#334155';
    const gridColor = theme === 'dark' ? '#334155' : '#e2e8f0';
    
    if (charts.bar) charts.bar.destroy();
    
    charts.bar = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: categoryData.labels,
            datasets: [{
                label: 'Amount Spent',
                data: categoryData.amounts,
                backgroundColor: '#7c3aed',
                borderRadius: 8,
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Category Comparison',
                    color: textColor,
                    font: { size: 16, weight: 'bold' }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `₹${context.parsed.y.toFixed(2)}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: textColor,
                        callback: function(value) {
                            return '₹' + value;
                        }
                    },
                    grid: {
                        color: gridColor,
                        drawBorder: false
                    }
                },
                x: {
                    ticks: {
                        color: textColor
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

function renderMonthlyTrendChart() {
    const ctx = document.getElementById('monthlyTrendChart');
    if (!ctx) return;
    
    const monthlyData = getMonthlyData();
    const theme = document.documentElement.getAttribute('data-theme');
    const textColor = theme === 'dark' ? '#e2e8f0' : '#334155';
    const gridColor = theme === 'dark' ? '#334155' : '#e2e8f0';
    
    if (charts.trend) charts.trend.destroy();
    
    charts.trend = new Chart(ctx, {
        type: 'line',
        data: {
            labels: monthlyData.labels,
            datasets: [{
                label: 'Monthly Spending',
                data: monthlyData.amounts,
                borderColor: '#ec4899',
                backgroundColor: theme === 'dark' ? 'rgba(236, 72, 153, 0.1)' : 'rgba(236, 72, 153, 0.2)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 5,
                pointBackgroundColor: '#ec4899',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Spending Trend',
                    color: textColor,
                    font: { size: 16, weight: 'bold' }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Total: ₹${context.parsed.y.toFixed(2)}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: textColor,
                        callback: function(value) {
                            return '₹' + value;
                        }
                    },
                    grid: {
                        color: gridColor,
                        drawBorder: false
                    }
                },
                x: {
                    ticks: {
                        color: textColor
                    },
                    grid: {
                        color: gridColor,
                        drawBorder: false
                    }
                }
            }
        }
    });
}

function renderMonthlyBarChart() {
    const ctx = document.getElementById('monthlyBarChart');
    if (!ctx) return;
    
    const monthlyData = getMonthlyData();
    const theme = document.documentElement.getAttribute('data-theme');
    const textColor = theme === 'dark' ? '#e2e8f0' : '#334155';
    
    if (charts.monthlyBar) charts.monthlyBar.destroy();
    
    charts.monthlyBar = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: monthlyData.labels,
            datasets: [{
                data: monthlyData.amounts,
                backgroundColor: [
                    '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', 
                    '#10b981', '#06b6d4'
                ],
                borderWidth: 2,
                borderColor: theme === 'dark' ? '#1e293b' : '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: textColor,
                        padding: 15,
                        font: { size: 12 }
                    }
                },
                title: {
                    display: true,
                    text: 'Monthly Distribution',
                    color: textColor,
                    font: { size: 16, weight: 'bold' }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                            return `${label}: ₹${value.toFixed(2)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

function renderCategorySummary() {
    const categoryData = getCategoryData();
    const categorySummary = document.getElementById('categorySummary');
    
    if (categoryData.labels.length === 0) {
        categorySummary.innerHTML = '<p class="text-muted">No expenses yet</p>';
        return;
    }
    
    const total = categoryData.amounts.reduce((sum, amt) => sum + amt, 0);
    
    const html = categoryData.labels.map((label, index) => {
        const amount = categoryData.amounts[index];
        const percentage = ((amount / total) * 100).toFixed(1);
        return `
            <div class="category-item">
                <span class="category-badge category-${label.toLowerCase()}">${label}</span>
                <div class="category-bar">
                    <div class="category-bar-fill" style="width: ${percentage}%"></div>
                </div>
                <span class="category-amount">₹${amount.toFixed(2)} (${percentage}%)</span>
            </div>
        `;
    }).join('');
    
    categorySummary.innerHTML = html;
}

function destroyCharts() {
    if (charts.pie) charts.pie.destroy();
    if (charts.bar) charts.bar.destroy();
    if (charts.trend) charts.trend.destroy();
    if (charts.monthlyBar) charts.monthlyBar.destroy();
}

function renderEmptyCharts() {
    const theme = document.documentElement.getAttribute('data-theme');
    const textColor = theme === 'dark' ? '#94a3b8' : '#64748b';
    const gridColor = theme === 'dark' ? '#334155' : '#e2e8f0';
    
    // Empty Pie Chart
    const pieCtx = document.getElementById('categoryPieChart');
    if (pieCtx) {
        if (charts.pie) charts.pie.destroy();
        charts.pie = new Chart(pieCtx, {
            type: 'doughnut',
            data: {
                labels: ['No Data'],
                datasets: [{
                    data: [1],
                    backgroundColor: [gridColor],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: false },
                    title: {
                        display: true,
                        text: 'No Expenses Yet',
                        color: textColor,
                        font: { size: 14 }
                    },
                    tooltip: { enabled: false }
                }
            }
        });
    }
    
    // Empty Bar Chart
    const barCtx = document.getElementById('categoryBarChart');
    if (barCtx) {
        if (charts.bar) charts.bar.destroy();
        charts.bar = new Chart(barCtx, {
            type: 'bar',
            data: {
                labels: ['Food', 'Transport', 'Entertainment', 'Shopping', 'Other'],
                datasets: [{
                    label: 'Amount Spent',
                    data: [0, 0, 0, 0, 0],
                    backgroundColor: gridColor,
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: false },
                    title: {
                        display: true,
                        text: 'Start Adding Expenses',
                        color: textColor,
                        font: { size: 14 }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            color: textColor,
                            callback: value => '₹' + value
                        },
                        grid: { color: gridColor, drawBorder: false }
                    },
                    x: {
                        ticks: { color: textColor },
                        grid: { display: false }
                    }
                }
            }
        });
    }
    
    // Empty Trend Chart
    const trendCtx = document.getElementById('monthlyTrendChart');
    if (trendCtx) {
        if (charts.trend) charts.trend.destroy();
        
        const months = [];
        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            months.push(date.toLocaleDateString('en-US', { month: 'short' }));
        }
        
        charts.trend = new Chart(trendCtx, {
            type: 'line',
            data: {
                labels: months,
                datasets: [{
                    label: 'Monthly Spending',
                    data: [20, 35, 25, 45, 30, 40],
                    borderColor: gridColor,
                    backgroundColor: theme === 'dark' ? 'rgba(148, 163, 184, 0.1)' : 'rgba(100, 116, 139, 0.1)',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    fill: true,
                    tension: 0.4,
                    pointRadius: 5,
                    pointBackgroundColor: gridColor,
                    pointBorderColor: theme === 'dark' ? '#1e293b' : '#ffffff',
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: false },
                    title: {
                        display: true,
                        text: 'Your Spending Trend Will Appear Here',
                        color: textColor,
                        font: { size: 14 }
                    },
                    tooltip: { enabled: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            color: textColor,
                            callback: value => '₹' + value
                        },
                        grid: { color: gridColor, drawBorder: false }
                    },
                    x: {
                        ticks: { color: textColor },
                        grid: { color: gridColor, drawBorder: false }
                    }
                }
            }
        });
    }
    
    // Empty Monthly Bar Chart
    const monthlyBarCtx = document.getElementById('monthlyBarChart');
    if (monthlyBarCtx) {
        if (charts.monthlyBar) charts.monthlyBar.destroy();
        
        const months = [];
        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            months.push(date.toLocaleDateString('en-US', { month: 'short' }));
        }
        
        charts.monthlyBar = new Chart(monthlyBarCtx, {
            type: 'doughnut',
            data: {
                labels: months,
                datasets: [{
                    data: [1, 1, 1, 1, 1, 1],
                    backgroundColor: [
                        gridColor, gridColor, gridColor, 
                        gridColor, gridColor, gridColor
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: false },
                    title: {
                        display: true,
                        text: 'Monthly Distribution',
                        color: textColor,
                        font: { size: 14 }
                    },
                    tooltip: { enabled: false }
                }
            }
        });
    }
}

// ===========================
// DATA PROCESSING
// ===========================
function getCategoryData() {
    const categoryTotals = {};
    
    allExpenses.forEach(expense => {
        if (!categoryTotals[expense.category]) {
            categoryTotals[expense.category] = 0;
        }
        categoryTotals[expense.category] += expense.amount;
    });
    
    return {
        labels: Object.keys(categoryTotals),
        amounts: Object.values(categoryTotals)
    };
}

function getMonthlyData() {
    const monthlyTotals = {};
    const months = [];
    
    // Get last 6 months
    for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const label = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        months.push({ key, label });
        monthlyTotals[key] = 0;
    }
    
    allExpenses.forEach(expense => {
        const expDate = new Date(expense.date);
        const key = `${expDate.getFullYear()}-${String(expDate.getMonth() + 1).padStart(2, '0')}`;
        if (monthlyTotals.hasOwnProperty(key)) {
            monthlyTotals[key] += expense.amount;
        }
    });
    
    return {
        labels: months.map(m => m.label),
        amounts: months.map(m => monthlyTotals[m.key])
    };
}

// ===========================
// UTILITY FUNCTIONS
// ===========================
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showNotification(message, type = 'info') {
    // Simple notification (you can enhance this with a better UI)
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background: ${type === 'success' ? '#22c55e' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease;
        font-weight: 500;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Global function for edit button
window.editExpense = function(id) {
    const expense = allExpenses.find(exp => exp.id === id);
    if (!expense) return;
    
    document.getElementById('title').value = expense.title;
    document.getElementById('amount').value = expense.amount;
    document.getElementById('category').value = expense.category;
    document.getElementById('date').value = expense.date;
    
    editingExpenseId = id;
    document.getElementById('submitBtn').textContent = 'Update Expense';
    document.getElementById('cancelBtn').style.display = 'inline-block';
    
    // Scroll to form
    document.getElementById('expenseForm').scrollIntoView({ behavior: 'smooth' });
};

// Global function for delete button
window.deleteExpense = deleteExpense;

// ===========================
// EVENT LISTENERS
// ===========================
document.addEventListener('DOMContentLoaded', () => {
    // Initialize theme
    initializeTheme();
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    
    // Initialize navigation
    initializeNavigation();
    
    // Initialize form
    initializeForm();
    
    // Initialize filters
    document.getElementById('categoryFilter').addEventListener('change', renderExpenses);
    document.getElementById('sortBy').addEventListener('change', renderExpenses);
    
    // Firebase will handle loading expenses via auth state observer
    // No need to call loadExpenses() here
    
    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
});
