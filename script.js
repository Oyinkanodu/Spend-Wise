'use strict';

/* ============================================================
   Spend Wise - Main Logic
============================================================ */

const $ = id => document.getElementById(id);

// Formats numbers into Nigerian Naira (e.g., 5000 -> ₦5,000)
function fmt(n) {
  return '₦' + Number(n).toLocaleString('en-NG', { minimumFractionDigits:0, maximumFractionDigits:0 });
}

// Formats ugly dates (2026-04-01) into pretty ones (1 Apr 2026)
function fmtDate(iso) {
  if (!iso) return '—';
  const [y,m,d] = iso.split('-').map(Number);
  const M = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${d} ${M[m-1]} ${y}`;
}

// Generates a random unique ID for each new entry
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2,6);
}

// Prevents HTML injection attacks when printing user text
function esc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// Gets today's date in YYYY-MM-DD format for the input fields
function today() { return new Date().toISOString().slice(0,10); }

/* ============================================================
   2. STATE VARIABLES & LOCAL STORAGE
============================================================ */
const KEYS = {
  expenses: 'lst_expenses_v2',
  income:   'lst_income_v2',
  settings: 'lst_settings_v2',
};

let expenses  = [];
let incomes   = [];
let settings  = { budget: 0 };
let activeTab = 'dashboard';

// Pulls saved data out of the browser's memory
function load() {
  try { expenses = JSON.parse(localStorage.getItem(KEYS.expenses)) || []; } catch { expenses = []; }
  try { incomes  = JSON.parse(localStorage.getItem(KEYS.income))   || []; } catch { incomes  = []; }
  try {
    const s = JSON.parse(localStorage.getItem(KEYS.settings));
    if (s) settings = { ...settings, ...s };
  } catch {}
}

// Pushes updated data back into the browser's memory
function save(key, val) { localStorage.setItem(key, JSON.stringify(val)); }


/* ============================================================
   3. TAB SWITCHING LOGIC
============================================================ */
document.querySelectorAll('.tab-btn:not(#help-btn)').forEach(btn => {
  btn.addEventListener('click', () => {
    activeTab = btn.dataset.tab;
    // Highlight the correct button
    document.querySelectorAll('.tab-btn:not(#help-btn)').forEach(b => b.classList.toggle('active', b === btn));
    // Show the correct panel by matching the ID
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.toggle('active', p.id === 'tab-' + activeTab));
  });
});


/* ============================================================
   4. ADDING DATA (FORM SUBMISSIONS)
============================================================ */
$('expense-form').addEventListener('submit', e => {
  e.preventDefault(); // Stop page reload
  
  const amount = parseFloat($('exp-amount').value);
  const category = $('exp-category').value;
  const date = $('exp-date').value;
  if (!amount || !category || !date) return;

  // Add new object to the start of the array
  expenses.unshift({ id: uid(), amount, category, date });
  save(KEYS.expenses, expenses);
  
  // Clear the form
  $('exp-amount').value = ''; 
  $('exp-category').value = ''; 
  $('exp-date').value = today();
  
  // Show brief "Saved." text
  $('expense-save-feedback').hidden = false;
  setTimeout(() => $('expense-save-feedback').hidden = true, 1800);
  
  renderAll(); // Update screen
});

$('income-form').addEventListener('submit', e => {
  e.preventDefault();
  
  const amount = parseFloat($('inc-amount').value);
  const source = $('inc-source').value;
  const date = $('inc-date').value;
  if (!amount || !source || !date) return;

  incomes.unshift({ id: uid(), amount, source, date });
  save(KEYS.income, incomes);
  
  $('inc-amount').value = ''; 
  $('inc-source').value = ''; 
  $('inc-date').value = today();
  
  $('income-save-feedback').hidden = false;
  setTimeout(() => $('income-save-feedback').hidden = true, 1800);
  
  renderAll();
});


/* ============================================================
   5. RENDERING THE UI
============================================================ */
function renderExpenseList() {
  const list = $('expense-list');
  list.innerHTML = ''; // Clear old list
  
  expenses.forEach(ex => {
    const li = document.createElement('li');
    li.className = 'expense-item';
    li.innerHTML = `
      <div class="expense-item__left">
        <span style="font-weight:600; font-size:13px; color:var(--col-accent);">${esc(ex.category)}</span>
        <div style="font-size:12px; color:var(--col-ink-faint); font-family:var(--font-mono)">${fmtDate(ex.date)}</div>
      </div>
      <div style="font-family:var(--font-mono); font-size:15px; font-weight:500;">
        ${fmt(ex.amount)}
      </div>
    `;
    list.appendChild(li);
  });
}

function renderIncomeList() {
  const list = $('income-list');
  list.innerHTML = '';
  
  incomes.forEach(inc => {
    const li = document.createElement('li');
    li.className = 'income-item';
    li.innerHTML = `
      <div class="income-item__left">
        <span style="font-weight:600; font-size:13px; color:var(--col-income);">${esc(inc.source)}</span>
        <div style="font-size:12px; color:var(--col-ink-faint); font-family:var(--font-mono)">${fmtDate(inc.date)}</div>
      </div>
      <div style="font-family:var(--font-mono); font-size:15px; font-weight:500; color:var(--col-income);">
        ${fmt(inc.amount)}
      </div>
    `;
    list.appendChild(li);
  });
}

function renderDashboard() {
  // Calculate totals using JavaScript array reductions
  const totalSpent = expenses.reduce((sum, item) => sum + item.amount, 0);
  const totalIncome = incomes.reduce((sum, item) => sum + item.amount, 0);
  const balance = totalIncome - totalSpent;

  // Update the DOM text
  $('total-amount').textContent = fmt(totalSpent);
  $('expense-count').textContent = expenses.length === 0 ? 'No expenses yet' : `${expenses.length} expenses recorded`;
  
  $('dash-income').textContent = fmt(totalIncome);
  
  const balEl = $('dash-balance');
  balEl.textContent = fmt(Math.abs(balance));
  balEl.className = 'stat-value ' + (balance >= 0 ? 'stat-value--pos' : 'stat-value--neg');
  $('dash-balance-sub').textContent = balance >= 0 ? 'surplus' : 'deficit';
  $('balance-card').className = 'stat-card ' + (balance >= 0 ? 'stat-card--balance-pos' : 'stat-card--balance-neg');
}

// Master function to update everything at once
function renderAll() {
  renderDashboard();
  renderExpenseList();
  renderIncomeList();
}


/* ============================================================
   6. APP INITIALIZATION
============================================================ */
(function init() {
  // Pre-fill the date inputs to today
  $('exp-date').value = today();
  $('inc-date').value = today();
  
  load(); // Pull saved data
  renderAll(); // Paint the screen
})();
