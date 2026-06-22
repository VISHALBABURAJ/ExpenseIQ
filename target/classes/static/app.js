/**
 * ExpenseIQ — app.js
 * Vanilla JS SPA connecting to the Spring Boot REST API.
 * Architecture: Module pattern with clear separation of concerns.
 */

'use strict';

// ═══════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════

const CONFIG = {
    API_BASE: 'http://localhost:8080',
    CURRENCY: '₹',
    DATE_LOCALE: 'en-IN',
    CATEGORIES: ['Food','Transport','Shopping','Entertainment','Health','Education','Utilities','Rent','Other'],
    CAT_COLORS: {
        Food:          '#fbbf24',
        Transport:     '#818cf8',
        Shopping:      '#fb7185',
        Entertainment: '#c084fc',
        Health:        '#4ade80',
        Education:     '#2dd4bf',
        Utilities:     '#fb923c',
        Rent:          '#f87171',
        Other:         '#94a3b8',
    },
    CAT_EMOJI: {
        Food:'🍔', Transport:'🚗', Shopping:'🛍️', Entertainment:'🎬',
        Health:'🏥', Education:'📚', Utilities:'💡', Rent:'🏠', Other:'📦',
    },
};

// ═══════════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════════

const state = {
    currentPage: 'dashboard',
    expenses: [],
    filteredExpenses: [],
    deleteTargetId: null,
    editMode: false,
};

// ═══════════════════════════════════════════════════════════════════
// API MODULE
// ═══════════════════════════════════════════════════════════════════

const API = {
    async _fetch(path, opts = {}) {
        const url = `${CONFIG.API_BASE}${path}`;
        const res = await fetch(url, {
            headers: { 'Content-Type': 'application/json' },
            ...opts,
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || 'API error');
        return json.data;
    },

    getAll:        ()       => API._fetch('/expenses'),
    getById:       (id)     => API._fetch(`/expenses/${id}`),
    create:        (body)   => API._fetch('/expenses', { method:'POST', body: JSON.stringify(body) }),
    update:        (id,body)=> API._fetch(`/expenses/${id}`, { method:'PUT', body: JSON.stringify(body) }),
    delete:        (id)     => API._fetch(`/expenses/${id}`, { method:'DELETE' }),
    getWeekly:     ()       => API._fetch('/expenses/weekly'),
    getMonthly:    ()       => API._fetch('/expenses/monthly'),
    getYearly:     ()       => API._fetch('/expenses/yearly'),
    getByCategory: (cat)    => API._fetch(`/expenses/category/${cat}`),
    search:        (kw)     => API._fetch(`/expenses/search?keyword=${encodeURIComponent(kw)}`),
    getStats:      ()       => API._fetch('/expenses/statistics'),
};

// ═══════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════

function fmt(amount) {
    const n = parseFloat(amount) || 0;
    return CONFIG.CURRENCY + n.toLocaleString(CONFIG.DATE_LOCALE, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString(CONFIG.DATE_LOCALE, { day:'numeric', month:'short', year:'numeric' });
}

function catBadge(cat) {
    const emoji = CONFIG.CAT_EMOJI[cat] || '📦';
    return `<span class="cat-badge cat-${cat}">${emoji} ${cat}</span>`;
}

// ═══════════════════════════════════════════════════════════════════
// TOAST
// ═══════════════════════════════════════════════════════════════════

function toast(msg, type = 'success') {
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `<div class="toast-dot"></div>${msg}`;
    document.getElementById('toastContainer').appendChild(el);
    setTimeout(() => el.remove(), 3200);
}

// ═══════════════════════════════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════════════════════════════

const PAGE_META = {
    'dashboard':    { title:'Dashboard',     subtitle:'Welcome back — here\'s what\'s happening' },
    'add-expense':  { title:'Add Expense',   subtitle:'Record a new transaction' },
    'expense-list': { title:'All Expenses',  subtitle:'Browse, search, and manage your expenses' },
    'reports':      { title:'Reports',       subtitle:'Analytics and spending insights' },
};

function navigate(page, opts = {}) {
    document.querySelectorAll('.nav-item').forEach(a => {
        a.classList.toggle('active', a.dataset.page === page);
    });

    document.querySelectorAll('.page').forEach(sec => {
        sec.classList.toggle('hidden', sec.id !== `page-${page}`);
    });

    const meta = PAGE_META[page] || { title: page, subtitle: '' };
    document.getElementById('pageTitle').textContent = meta.title;
    document.getElementById('pageSubtitle').textContent = meta.subtitle;

    const globalSearchBar = document.getElementById('globalSearchBar');
    if (globalSearchBar) {
        globalSearchBar.style.display = page === 'expense-list' ? 'flex' : 'none';
    }

    state.currentPage = page;

    if (page === 'dashboard') loadDashboard();
    if (page === 'expense-list') {
        if (opts.search) {
            const listSearch = document.getElementById('listSearch');
            if (listSearch) listSearch.value = opts.search;
        }
        loadExpenseList();
    }
    if (page === 'add-expense' && !opts.edit) resetForm();
    if (page === 'reports') loadReport('weekly');

    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.remove('open');
}

// ═══════════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════════

async function loadDashboard() {
    try {
        const [stats, expenses] = await Promise.all([API.getStats(), API.getAll()]);

        const statTotal = document.getElementById('stat-total');
        if (statTotal) statTotal.textContent = fmt(stats.totalExpenses);

        const statWeekly = document.getElementById('stat-weekly');
        if (statWeekly) statWeekly.textContent = fmt(stats.weeklyExpenses);

        const statMonthly = document.getElementById('stat-monthly');
        if (statMonthly) statMonthly.textContent = fmt(stats.monthlyExpenses);

        const statYearly = document.getElementById('stat-yearly');
        if (statYearly) statYearly.textContent = fmt(stats.yearlyExpenses);

        renderRecentList(expenses.slice(0, 8));

        state.expenses = expenses;
        syncCustomCategoriesToFilter(expenses);
    } catch (err) {
        toast('Failed to load dashboard: ' + err.message, 'error');
    }
}

function renderRecentList(items) {
    const el = document.getElementById('recentExpensesList');
    if (!el) return;
    if (!items.length) {
        el.innerHTML = '<div class="loading-msg">No expenses recorded yet.</div>';
        return;
    }
    el.innerHTML = items.map(e => `
        <div class="recent-item">
            <div class="recent-cat-icon cat-${e.category}">${CONFIG.CAT_EMOJI[e.category] || '📦'}</div>
            <div class="recent-info">
                <div class="recent-cat">${e.category}</div>
                <div class="recent-desc">${e.description || '—'}</div>
            </div>
            <div class="recent-right">
                <div class="recent-amount">${fmt(e.amount)}</div>
                <div class="recent-date">${fmtDate(e.expenseDate)}</div>
            </div>
        </div>
    `).join('');
}

// ═══════════════════════════════════════════════════════════════════
// EXPENSE LIST PAGE
// ═══════════════════════════════════════════════════════════════════

async function loadExpenseList() {
    const tbody = document.getElementById('expenseTableBody');
    if (tbody) tbody.innerHTML = '<tr><td colspan="6" class="table-empty">Loading…</td></tr>';

    try {
        const expenses = await API.getAll();
        state.expenses = expenses;
        syncCustomCategoriesToFilter(expenses);
        applyListFilters();
    } catch (err) {
        toast('Failed to load expenses: ' + err.message, 'error');
    }
}

// Inject any custom categories found in expenses into the filter dropdown
function syncCustomCategoriesToFilter(expenses) {
    const filterSelect = document.getElementById('filterCategory');
    if (!filterSelect) return;

    const builtIn = new Set(CONFIG.CATEGORIES);
    const existing = new Set(Array.from(filterSelect.options).map(o => o.value));

    expenses.forEach(e => {
        const cat = e.category;
        if (cat && !builtIn.has(cat) && !existing.has(cat)) {
            const opt = document.createElement('option');
            opt.value = cat;
            opt.textContent = cat;
            filterSelect.appendChild(opt);
            existing.add(cat);
        }
    });
}

function applyListFilters() {
    const listSearch = document.getElementById('listSearch');
    const filterCategory = document.getElementById('filterCategory');
    const filterPeriod = document.getElementById('filterPeriod');

    const search   = listSearch ? listSearch.value.trim().toLowerCase() : '';
    const category = filterCategory ? filterCategory.value : '';
    const period   = filterPeriod ? filterPeriod.value : 'all';

    let list = [...state.expenses];

    if (search) {
        list = list.filter(e =>
            (e.category || '').toLowerCase().includes(search) ||
            (e.description || '').toLowerCase().includes(search)
        );
    }
    if (category) {
        list = list.filter(e => e.category === category);
    }
    if (period !== 'all') {
        const now   = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        list = list.filter(e => {
            const d = new Date(e.expenseDate + 'T00:00:00');
            if (period === 'weekly') {
                const weekStart = new Date(today);
                weekStart.setDate(today.getDate() - ((today.getDay() + 6) % 7));
                return d >= weekStart && d <= today;
            }
            if (period === 'monthly') {
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            }
            if (period === 'yearly') {
                return d.getFullYear() === now.getFullYear();
            }
            return true;
        });
    }

    state.filteredExpenses = list;
    renderTable(list);
}

function renderTable(expenses) {
    const tbody = document.getElementById('expenseTableBody');
    const tableCount = document.getElementById('tableCount');
    if (!tbody) return;

    if (tableCount) {
        tableCount.textContent = `${expenses.length} record${expenses.length !== 1 ? 's' : ''}`;
    }

    if (!expenses.length) {
        tbody.innerHTML = '<tr><td colspan="6" class="table-empty">No expenses found.</td></tr>';
        return;
    }

    tbody.innerHTML = expenses.map((e, i) => `
        <tr>
            <td style="color:var(--text-muted)">${i + 1}</td>
            <td>${catBadge(e.category)}</td>
            <td class="amount-cell">${fmt(e.amount)}</td>
            <td style="white-space:nowrap">${fmtDate(e.expenseDate)}</td>
            <td style="max-width:220px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${e.description || '—'}</td>
            <td>
                <div class="actions-cell">
                    <button class="btn-icon edit" onclick="editExpense(${e.id})" title="Edit">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button class="btn-icon delete" onclick="confirmDelete(${e.id})" title="Delete">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// ═══════════════════════════════════════════════════════════════════
// EXPENSE FORM (Add / Edit)
// ═══════════════════════════════════════════════════════════════════

function resetForm() {
    state.editMode = false;
    const expenseId = document.getElementById('expenseId');
    if (expenseId) expenseId.value = '';
    const formTitle = document.getElementById('expenseFormTitle');
    if (formTitle) formTitle.textContent = 'New Expense';
    const expenseForm = document.getElementById('expenseForm');
    if (expenseForm) expenseForm.reset();
    const expenseDate = document.getElementById('expenseDate');
    if (expenseDate) expenseDate.value = new Date().toISOString().split('T')[0];
    const charCount = document.getElementById('charCount');
    if (charCount) charCount.textContent = '0 / 500';

    // Hide custom category on reset
    const customCategoryContainer = document.getElementById('customCategoryContainer');
    if (customCategoryContainer) customCategoryContainer.style.display = 'none';
    const customCategory = document.getElementById('customCategory');
    if (customCategory) customCategory.value = '';

    clearFormErrors();
}

async function editExpense(id) {
    try {
        const e = await API.getById(id);
        state.editMode = true;

        const expenseId = document.getElementById('expenseId');
        if (expenseId) expenseId.value = e.id;

        const formTitle = document.getElementById('expenseFormTitle');
        if (formTitle) formTitle.textContent = 'Edit Expense';

        const categorySelect = document.getElementById('expenseCategory');
        const customCategoryContainer = document.getElementById('customCategoryContainer');
        const customCategoryInput = document.getElementById('customCategory');

        if (categorySelect) {
            // Check if the saved category matches a known category
            const knownCategories = CONFIG.CATEGORIES;
            if (knownCategories.includes(e.category) && e.category !== 'Other') {
                categorySelect.value = e.category;
                if (customCategoryContainer) customCategoryContainer.style.display = 'none';
            } else {
                // It's either "Other" or a custom value saved previously
                categorySelect.value = 'Other';
                if (customCategoryContainer) customCategoryContainer.style.display = 'block';
                if (customCategoryInput) customCategoryInput.value = e.category === 'Other' ? '' : e.category;
            }
        }

        const expenseAmount = document.getElementById('expenseAmount');
        if (expenseAmount) expenseAmount.value = e.amount;

        const expenseDate = document.getElementById('expenseDate');
        if (expenseDate) expenseDate.value = e.expenseDate;

        const expenseDescription = document.getElementById('expenseDescription');
        if (expenseDescription) expenseDescription.value = e.description || '';

        const charCount = document.getElementById('charCount');
        if (charCount) charCount.textContent = `${(e.description||'').length} / 500`;

        clearFormErrors();
        navigate('add-expense', { edit: true });
    } catch (err) {
        toast('Could not load expense: ' + err.message, 'error');
    }
}

function clearFormErrors() {
    ['category','amount','date'].forEach(f => {
        const el = document.getElementById(`err-${f}`);
        if (el) el.textContent = '';
    });
}

function validateForm() {
    let valid = true;
    clearFormErrors();

    const categorySelect = document.getElementById('expenseCategory');
    const cat = categorySelect ? categorySelect.value : '';
    const amount = document.getElementById('expenseAmount') ? document.getElementById('expenseAmount').value : '';
    const date   = document.getElementById('expenseDate') ? document.getElementById('expenseDate').value : '';

    // If "Other" is selected, ensure a custom category name is entered
    if (!cat) {
        const errCat = document.getElementById('err-category');
        if (errCat) errCat.textContent = 'Please select a category.';
        valid = false;
    } else if (cat === 'Other') {
        const customVal = document.getElementById('customCategory') ? document.getElementById('customCategory').value.trim() : '';
        if (!customVal) {
            const errCat = document.getElementById('err-category');
            if (errCat) errCat.textContent = 'Please enter a custom category name.';
            valid = false;
        }
    }

    if (!amount || parseFloat(amount) <= 0) {
        const errAmt = document.getElementById('err-amount');
        if (errAmt) errAmt.textContent = 'Enter a valid amount greater than 0.';
        valid = false;
    }
    if (!date) {
        const errDate = document.getElementById('err-date');
        if (errDate) errDate.textContent = 'Please select a date.';
        valid = false;
    }

    return valid;
}

async function handleFormSubmit(e) {
    e.preventDefault();
    if (!validateForm()) return;

    const id = document.getElementById('expenseId') ? document.getElementById('expenseId').value : '';
    const categorySelect = document.getElementById('expenseCategory');
    let categoryValue = categorySelect ? categorySelect.value : '';

    // If "Other" selected, use the typed custom category instead
    if (categoryValue === 'Other') {
        const customCategoryInput = document.getElementById('customCategory');
        const customVal = customCategoryInput ? customCategoryInput.value.trim() : '';
        if (customVal) categoryValue = customVal;
    }

    const payload = {
        category:    categoryValue,
        amount:      parseFloat(document.getElementById('expenseAmount').value),
        expenseDate: document.getElementById('expenseDate').value,
        description: document.getElementById('expenseDescription').value.trim() || null,
    };

    const submitBtn = document.getElementById('submitExpenseBtn');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving…';
    }

    try {
        if (state.editMode && id) {
            await API.update(id, payload);
            toast('Expense updated successfully!', 'success');
        } else {
            await API.create(payload);
            toast('Expense added successfully!', 'success');
        }
        // Refresh expense cache so custom categories appear in filters
        const refreshed = await API.getAll();
        state.expenses = refreshed;
        syncCustomCategoriesToFilter(refreshed);
        navigate('expense-list');
    } catch (err) {
        toast('Save failed: ' + err.message, 'error');
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20,6 9,17 4,12"/></svg> Save Expense';
        }
    }
}

// ═══════════════════════════════════════════════════════════════════
// DELETE
// ═══════════════════════════════════════════════════════════════════

function confirmDelete(id) {
    state.deleteTargetId = id;
    const deleteModal = document.getElementById('deleteModal');
    if (deleteModal) deleteModal.classList.remove('hidden');
}

function closeDeleteModal() {
    state.deleteTargetId = null;
    const deleteModal = document.getElementById('deleteModal');
    if (deleteModal) deleteModal.classList.add('hidden');
}

async function handleDelete() {
    if (!state.deleteTargetId) return;
    try {
        await API.delete(state.deleteTargetId);
        toast('Expense deleted.', 'success');
        closeDeleteModal();

        if (state.currentPage === 'dashboard') loadDashboard();
        else if (state.currentPage === 'expense-list') loadExpenseList();
        else if (state.currentPage === 'reports') {
            const activeTab = document.querySelector('.report-tab.active');
            loadReport(activeTab ? activeTab.dataset.report : 'weekly');
        }
    } catch (err) {
        toast('Delete failed: ' + err.message, 'error');
    }
}

// ═══════════════════════════════════════════════════════════════════
// CSV EXPORT
// ═══════════════════════════════════════════════════════════════════

function exportCSV() {
    const data = state.filteredExpenses.length ? state.filteredExpenses : state.expenses;
    if (!data.length) { toast('No expenses to export.', 'error'); return; }

    const header = ['ID','Category','Amount','Date','Day','Month','Year','Description'];
    const rows   = data.map(e => [
        e.id, e.category, e.amount, e.expenseDate,
        e.day, e.month, e.year,
        `"${(e.description || '').replace(/"/g,'""')}"`,
    ]);

    const csv = [header, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type:'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `expenses_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast('CSV exported!', 'success');
}

// ═══════════════════════════════════════════════════════════════════
// REPORTS PAGE
// ═══════════════════════════════════════════════════════════════════

async function loadReport(type) {
    document.querySelectorAll('.report-tab').forEach(t => {
        t.classList.toggle('active', t.dataset.report === type);
    });

    const titleMap = {
        weekly: 'Weekly Report', monthly: 'Monthly Report',
        yearly: 'Yearly Report', category: 'Category-wise Report',
    };
    const reportTableTitle = document.getElementById('reportTableTitle');
    if (reportTableTitle) reportTableTitle.textContent = titleMap[type] || 'Report';

    const tbody = document.getElementById('reportTableBody');
    const colSpan = type === 'category' ? 3 : 5;
    if (tbody) tbody.innerHTML = `<tr><td colspan="${colSpan}" class="table-empty">Loading…</td></tr>`;

    // Swap table headers for category view
    const thead = document.getElementById('reportTableHead');
    if (thead) {
        if (type === 'category') {
            thead.innerHTML = `<tr>
                <th>#</th>
                <th>Category</th>
                <th>Total Amount</th>
            </tr>`;
        } else {
            thead.innerHTML = `<tr>
                <th>#</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Description</th>
            </tr>`;
        }
    }

    const summaryCards = document.getElementById('reportSummaryCards');
    if (summaryCards) summaryCards.innerHTML = '';

    try {
        let expenses = [];
        if (type === 'weekly')   expenses = await API.getWeekly();
        if (type === 'monthly')  expenses = await API.getMonthly();
        if (type === 'yearly')   expenses = await API.getYearly();
        if (type === 'category') expenses = await API.getAll();

        if (type === 'category') {
            renderCategoryGroupReport(expenses);
        } else {
            renderReportTable(expenses);
        }
        renderReportSummary(expenses, type);
    } catch (err) {
        if (tbody) tbody.innerHTML = `<tr><td colspan="${colSpan}" class="table-empty">Failed to load report.</td></tr>`;
        toast('Report error: ' + err.message, 'error');
    }
}

function renderReportTable(expenses) {
    const tbody = document.getElementById('reportTableBody');
    if (!tbody) return;
    if (!expenses.length) {
        tbody.innerHTML = '<tr><td colspan="5" class="table-empty">No data for this period.</td></tr>';
        return;
    }
    tbody.innerHTML = expenses.map((e, i) => `
        <tr>
            <td style="color:var(--text-muted)">${i + 1}</td>
            <td>${catBadge(e.category)}</td>
            <td class="amount-cell">${fmt(e.amount)}</td>
            <td style="white-space:nowrap">${fmtDate(e.expenseDate)}</td>
            <td style="max-width:240px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${e.description || '—'}</td>
        </tr>
    `).join('');
}

function renderCategoryGroupReport(expenses) {
    const tbody = document.getElementById('reportTableBody');
    if (!tbody) return;
    if (!expenses.length) {
        tbody.innerHTML = '<tr><td colspan="3" class="table-empty">No data available.</td></tr>';
        return;
    }

    // Group by category and sum amounts
    const byCategory = {};
    expenses.forEach(e => {
        const cat = e.category || 'Other';
        byCategory[cat] = (byCategory[cat] || 0) + parseFloat(e.amount || 0);
    });

    // Sort by total descending
    const sorted = Object.entries(byCategory).sort(([,a],[,b]) => b - a);

    tbody.innerHTML = sorted.map(([cat, total], i) => `
        <tr>
            <td style="color:var(--text-muted)">${i + 1}</td>
            <td>${catBadge(cat)}</td>
            <td class="amount-cell">${fmt(total)}</td>
        </tr>
    `).join('');
}

function renderReportSummary(expenses, type) {
    const container = document.getElementById('reportSummaryCards');
    if (!container) return;
    const total = expenses.reduce((s, e) => s + parseFloat(e.amount || 0), 0);
    const count = expenses.length;

    const byCategory = {};
    expenses.forEach(e => {
        byCategory[e.category] = (byCategory[e.category] || 0) + parseFloat(e.amount || 0);
    });
    const topCat = Object.entries(byCategory).sort(([,a],[,b]) => b - a)[0];

    const cards = [
        { label: 'Total Spend',   value: fmt(total) },
        { label: 'Transactions',  value: count },
        { label: 'Top Category',  value: topCat ? `${CONFIG.CAT_EMOJI[topCat[0]]||''} ${topCat[0]}` : '—' },
        { label: 'Top Category Spend', value: topCat ? fmt(topCat[1]) : '—' },
    ];

    container.innerHTML = cards.map(c => `
        <div class="report-summary-card">
            <div class="rsc-label">${c.label}</div>
            <div class="rsc-value">${c.value}</div>
        </div>
    `).join('');
}

// ═══════════════════════════════════════════════════════════════════
// EVENT LISTENERS
// ═══════════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {

    // Sidebar nav links and data-page anchors
    document.querySelectorAll('.nav-item, .card-link, [data-page]').forEach(el => {
        el.addEventListener('click', ev => {
            const page = el.dataset.page;
            if (page) { ev.preventDefault(); navigate(page); }
        });
    });

    // Quick Add button in topbar
    const quickAddBtn = document.getElementById('quickAddBtn');
    if (quickAddBtn) quickAddBtn.addEventListener('click', () => navigate('add-expense'));

    // Expense form submit
    const expenseForm = document.getElementById('expenseForm');
    if (expenseForm) expenseForm.addEventListener('submit', handleFormSubmit);

    // Cancel form
    const cancelFormBtn = document.getElementById('cancelFormBtn');
    if (cancelFormBtn) {
        cancelFormBtn.addEventListener('click', () => {
            navigate(state.expenses.length ? 'expense-list' : 'dashboard');
        });
    }

    // Category select — show/hide custom category input
    const categorySelect = document.getElementById('expenseCategory');
    const customCategoryContainer = document.getElementById('customCategoryContainer');
    if (categorySelect && customCategoryContainer) {
        categorySelect.addEventListener('change', () => {
            if (categorySelect.value === 'Other') {
                customCategoryContainer.style.display = 'block';
            } else {
                customCategoryContainer.style.display = 'none';
                const customCategory = document.getElementById('customCategory');
                if (customCategory) customCategory.value = '';
            }
        });
    }

    // Description char counter
    const expenseDescription = document.getElementById('expenseDescription');
    if (expenseDescription) {
        expenseDescription.addEventListener('input', function() {
            const charCount = document.getElementById('charCount');
            if (charCount) charCount.textContent = `${this.value.length} / 500`;
        });
    }

    // List page search & filters
    let searchDebounce;
    const listSearch = document.getElementById('listSearch');
    if (listSearch) {
        listSearch.addEventListener('input', () => {
            clearTimeout(searchDebounce);
            searchDebounce = setTimeout(applyListFilters, 280);
        });
    }
    const filterCategory = document.getElementById('filterCategory');
    if (filterCategory) filterCategory.addEventListener('change', applyListFilters);

    const filterPeriod = document.getElementById('filterPeriod');
    if (filterPeriod) filterPeriod.addEventListener('change', applyListFilters);

    const clearFiltersBtn = document.getElementById('clearFiltersBtn');
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', () => {
            if (filterCategory) filterCategory.value = '';
            if (filterPeriod) filterPeriod.value = 'all';
            if (listSearch) listSearch.value = '';
            applyListFilters();
        });
    }

    // Export CSV
    const exportCsvBtn = document.getElementById('exportCsvBtn');
    if (exportCsvBtn) exportCsvBtn.addEventListener('click', exportCSV);

    // Delete modal
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    if (cancelDeleteBtn) cancelDeleteBtn.addEventListener('click', closeDeleteModal);

    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    if (confirmDeleteBtn) confirmDeleteBtn.addEventListener('click', handleDelete);

    const deleteModal = document.getElementById('deleteModal');
    if (deleteModal) {
        deleteModal.addEventListener('click', e => {
            if (e.target === e.currentTarget) closeDeleteModal();
        });
    }

    // Reports tabs
    document.querySelectorAll('.report-tab').forEach(tab => {
        tab.addEventListener('click', () => loadReport(tab.dataset.report));
    });

    // Default page
    navigate('dashboard');
});

// Expose to inline onclick handlers
window.editExpense   = editExpense;
window.confirmDelete = confirmDelete;