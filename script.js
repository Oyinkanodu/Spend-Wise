'use strict';

/* ═══════════════════════════════════════════════════════════
   STORAGE KEYS
═══════════════════════════════════════════════════════════ */
const KEYS = {
  expenses: 'lst_expenses_v2',
  income:   'lst_income_v2',
  settings: 'lst_settings_v2',
};

/* ═══════════════════════════════════════════════════════════
   STATE
═══════════════════════════════════════════════════════════ */
let expenses      = [];
let incomes       = [];
let settings      = { budget: 0, allowance: 0, currencyName: 'Naira' };
let filterCat     = 'all';
let sortOrder     = 'newest';
let activeTab     = 'dashboard';

// Two-step delete/clear maps
const pendingDel  = new Map();
let clearExpPending = false,  clearExpTimer = null;
let clearIncPending = false,  clearIncTimer = null;
let resetPending    = false,  resetTimer    = null;

/* ═══════════════════════════════════════════════════════════
   DOM SHORTCUTS
═══════════════════════════════════════════════════════════ */
const $ = id => document.getElementById(id);

/* ═══════════════════════════════════════════════════════════
   UTILS
═══════════════════════════════════════════════════════════ */
function fmt(n) {
  return '₦' + Number(n).toLocaleString('en-NG', { minimumFractionDigits:0, maximumFractionDigits:0 });
}

function fmtDate(iso) {
  if (!iso) return '—';
  const [y,m,d] = iso.split('-').map(Number);
  const M = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${d} ${M[m-1]} ${y}`;
}

function relDate(iso) {
  const today = new Date().toISOString().slice(0,10);
  const yest  = new Date(Date.now()-86400000).toISOString().slice(0,10);
  if (iso === today) return 'Today';
  if (iso === yest)  return 'Yesterday';
  return fmtDate(iso);
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2,6);
}

function esc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function today() { return new Date().toISOString().slice(0,10); }

const BADGE = {
  Food:'badge--food', Transport:'badge--transport', Utilities:'badge--utilities',
  Shopping:'badge--shopping', Health:'badge--health', Education:'badge--education',
  Entertainment:'badge--entertainment', Other:'badge--other'
};

/* ═══════════════════════════════════════════════════════════
   STORAGE
═══════════════════════════════════════════════════════════ */
function load() {
  try { expenses = JSON.parse(localStorage.getItem(KEYS.expenses)) || []; } catch { expenses = []; }
  try { incomes  = JSON.parse(localStorage.getItem(KEYS.income))   || []; } catch { incomes  = []; }
  try {
    const s = JSON.parse(localStorage.getItem(KEYS.settings));
    if (s) settings = { ...settings, ...s };
  } catch {}
}

function save(key, val) { localStorage.setItem(key, JSON.stringify(val)); }

/* ═══════════════════════════════════════════════════════════
   ANIMATED COUNTER
═══════════════════════════════════════════════════════════ */
let _counterRaf = null;
let _displayed  = 0;

function animateTotal(target) {
  if (_counterRaf) cancelAnimationFrame(_counterRaf);
  const start = _displayed, delta = target - start;
  const dur   = Math.min(Math.abs(delta)/10, 500);
  const t0    = performance.now();

  const el = $('total-amount');
  el.classList.remove('stat-amount--pop');
  void el.offsetWidth;
  el.classList.add('stat-amount--pop');

  if (dur < 16) { _displayed = target; el.textContent = fmt(target); return; }

  function tick(now) {
    const p = Math.min((now - t0) / dur, 1);
    const e = 1 - Math.pow(1-p, 3);
    el.textContent = fmt(Math.round(start + delta * e));
    if (p < 1) { _counterRaf = requestAnimationFrame(tick); }
    else        { _displayed = target; el.textContent = fmt(target); _counterRaf = null; }
  }
  _counterRaf = requestAnimationFrame(tick);
}

/* ═══════════════════════════════════════════════════════════
   SAVE FEEDBACK
═══════════════════════════════════════════════════════════ */
function flashFeedback(elId) {
  const el = $(elId);
  if (!el) return;
  el.hidden = false;
  el.classList.remove('feedback--visible');
  void el.offsetWidth;
  el.classList.add('feedback--visible');
  setTimeout(() => {
    el.classList.remove('feedback--visible');
    setTimeout(() => { el.hidden = true; }, 300);
  }, 1800);
}

/* ═══════════════════════════════════════════════════════════
   ADD EXPENSE
═══════════════════════════════════════════════════════════ */
$('expense-form').addEventListener('submit', e => {
  e.preventDefault();
  const amountEl = $('exp-amount'), catEl = $('exp-category'), dateEl = $('exp-date');
  [amountEl, catEl, dateEl].forEach(x => x.classList.remove('input--error'));

  const amount   = parseFloat(amountEl.value);
  const category = catEl.value;
  const date     = dateEl.value;
  const note     = $('exp-note').value.trim();

  let ok = true;
  if (!amount || amount <= 0) { amountEl.classList.add('input--error'); amountEl.focus(); ok = false; }
  if (!category && ok)        { catEl.classList.add('input--error'); catEl.focus(); ok = false; }
  if (!date && ok)            { dateEl.classList.add('input--error'); dateEl.focus(); ok = false; }
  if (!ok) return;

  expenses.unshift({ id: uid(), amount, category, date, note });
  save(KEYS.expenses, expenses);
  amountEl.value = ''; catEl.value = ''; $('exp-note').value = ''; dateEl.value = today();
  flashFeedback('expense-save-feedback');
  renderAll();
});

/* ═══════════════════════════════════════════════════════════
   ADD INCOME
═══════════════════════════════════════════════════════════ */
$('income-form').addEventListener('submit', e => {
  e.preventDefault();
  const amountEl = $('inc-amount'), srcEl = $('inc-source'), dateEl = $('inc-date');
  [amountEl, srcEl, dateEl].forEach(x => x.classList.remove('input--error'));

  const amount = parseFloat(amountEl.value);
  const source = srcEl.value;
  const date   = dateEl.value;
  const note   = $('inc-note').value.trim();

  let ok = true;
  if (!amount || amount <= 0) { amountEl.classList.add('input--error'); amountEl.focus(); ok = false; }
  if (!source && ok)          { srcEl.classList.add('input--error'); srcEl.focus(); ok = false; }
  if (!date && ok)            { dateEl.classList.add('input--error'); dateEl.focus(); ok = false; }
  if (!ok) return;

  incomes.unshift({ id: uid(), amount, source, date, note });
  save(KEYS.income, incomes);
  amountEl.value = ''; srcEl.value = ''; $('inc-note').value = ''; dateEl.value = today();
  flashFeedback('income-save-feedback');
  renderAll();
});

/* ═══════════════════════════════════════════════════════════
   LOG ALLOWANCE SHORTCUT
═══════════════════════════════════════════════════════════ */
$('log-allowance-btn').addEventListener('click', () => {
  const amt = settings.allowance;
  if (!amt) return;
  incomes.unshift({ id: uid(), amount: amt, source: 'Allowance', date: today(), note: 'Monthly allowance' });
  save(KEYS.income, incomes);
  const note = $('allowance-logged-note');
  note.textContent = `Logged ${fmt(amt)} — ${fmtDate(today())}`;
  note.classList.add('visible');
  setTimeout(() => note.classList.remove('visible'), 3000);
  renderAll();
});

/* ═══════════════════════════════════════════════════════════
   SAVE SETTINGS
═══════════════════════════════════════════════════════════ */
$('save-settings-btn').addEventListener('click', () => {
  settings.budget       = parseFloat($('set-budget').value)       || 0;
  settings.allowance    = parseFloat($('set-allowance').value)    || 0;
  settings.currencyName = $('set-currency-name').value.trim()     || 'Naira';
  save(KEYS.settings, settings);

  // Enable/disable allowance button
  $('log-allowance-btn').disabled = !settings.allowance;

  const saved = $('settings-saved');
  saved.classList.add('visible');
  setTimeout(() => saved.classList.remove('visible'), 2000);
  renderAll();
});

/* ═══════════════════════════════════════════════════════════
   EXPORT JSON
═══════════════════════════════════════════════════════════ */
$('export-btn').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify({ expenses, incomes, settings }, null, 2)], { type:'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `lst-export-${today()}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
});

/* ═══════════════════════════════════════════════════════════
   TWO-STEP DELETE — EXPENSES
═══════════════════════════════════════════════════════════ */
$('expense-list').addEventListener('click', e => {
  const btn = e.target.closest('.btn--delete');
  if (!btn) return;
  const id = btn.dataset.id;
  if (pendingDel.has(id)) {
    clearTimeout(pendingDel.get(id));
    pendingDel.delete(id);
    animateRemove(id, () => {
      expenses = expenses.filter(x => x.id !== id);
      save(KEYS.expenses, expenses);
      renderAll();
    });
  } else {
    btn.classList.add('btn--confirm'); btn.textContent = 'Sure?';
    const t = setTimeout(() => {
      btn.classList.remove('btn--confirm'); btn.textContent = '✕';
      pendingDel.delete(id);
    }, 2500);
    pendingDel.set(id, t);
  }
});

/* ═══════════════════════════════════════════════════════════
   TWO-STEP DELETE — INCOME
═══════════════════════════════════════════════════════════ */
$('income-list').addEventListener('click', e => {
  const btn = e.target.closest('.btn--delete');
  if (!btn) return;
  const id = btn.dataset.id;
  if (pendingDel.has(id)) {
    clearTimeout(pendingDel.get(id));
    pendingDel.delete(id);
    animateRemove(id + '-inc', () => {
      incomes = incomes.filter(x => x.id !== id);
      save(KEYS.income, incomes);
      renderAll();
    });
  } else {
    btn.classList.add('btn--confirm'); btn.textContent = 'Sure?';
    const t = setTimeout(() => {
      btn.classList.remove('btn--confirm'); btn.textContent = '✕';
      pendingDel.delete(id);
    }, 2500);
    pendingDel.set(id, t);
  }
});

function animateRemove(id, cb) {
  const el = document.querySelector(`[data-id="${id}"]`);
  if (el) {
    el.style.transition = 'opacity .18s ease,transform .18s ease';
    el.style.opacity = '0'; el.style.transform = 'translateX(12px)';
    setTimeout(cb, 200);
  } else { cb(); }
}

/* ═══════════════════════════════════════════════════════════
   CLEAR ALL — EXPENSES
═══════════════════════════════════════════════════════════ */
$('clear-expenses-btn').addEventListener('click', () => {
  if (!expenses.length) return;
  if (clearExpPending) {
    clearTimeout(clearExpTimer); clearExpPending = false;
    $('clear-expenses-btn').classList.remove('btn--confirm');
    $('clear-expenses-btn').textContent = 'Clear all';
    const list = $('expense-list');
    list.style.transition = 'opacity .2s ease'; list.style.opacity = '0';
    setTimeout(() => {
      expenses = []; _displayed = 0; save(KEYS.expenses, expenses);
      list.style.opacity = '1'; renderAll();
    }, 200);
  } else {
    clearExpPending = true;
    $('clear-expenses-btn').classList.add('btn--confirm');
    $('clear-expenses-btn').textContent = 'Confirm clear';
    clearExpTimer = setTimeout(() => {
      clearExpPending = false;
      $('clear-expenses-btn').classList.remove('btn--confirm');
      $('clear-expenses-btn').textContent = 'Clear all';
    }, 3000);
  }
});

/* ═══════════════════════════════════════════════════════════
   CLEAR ALL — INCOME
═══════════════════════════════════════════════════════════ */
$('clear-income-btn').addEventListener('click', () => {
  if (!incomes.length) return;
  if (clearIncPending) {
    clearTimeout(clearIncTimer); clearIncPending = false;
    $('clear-income-btn').classList.remove('btn--confirm');
    $('clear-income-btn').textContent = 'Clear all';
    incomes = []; save(KEYS.income, incomes); renderAll();
  } else {
    clearIncPending = true;
    $('clear-income-btn').classList.add('btn--confirm');
    $('clear-income-btn').textContent = 'Confirm clear';
    clearIncTimer = setTimeout(() => {
      clearIncPending = false;
      $('clear-income-btn').classList.remove('btn--confirm');
      $('clear-income-btn').textContent = 'Clear all';
    }, 3000);
  }
});

/* ═══════════════════════════════════════════════════════════
   RESET EVERYTHING
═══════════════════════════════════════════════════════════ */
$('reset-all-btn').addEventListener('click', () => {
  if (resetPending) {
    clearTimeout(resetTimer); resetPending = false;
    expenses = []; incomes = []; settings = { budget:0, allowance:0, currencyName:'Naira' };
    Object.values(KEYS).forEach(k => localStorage.removeItem(k));
    _displayed = 0;
    populateSettingsForm();
    renderAll();
    $('reset-all-btn').textContent = 'Reset everything';
    $('reset-all-btn').classList.remove('btn--confirm');
  } else {
    resetPending = true;
    $('reset-all-btn').classList.add('btn--confirm');
    $('reset-all-btn').textContent = 'Click again to confirm';
    resetTimer = setTimeout(() => {
      resetPending = false;
      $('reset-all-btn').classList.remove('btn--confirm');
      $('reset-all-btn').textContent = 'Reset everything';
    }, 3500);
  }
});

/* ═══════════════════════════════════════════════════════════
   FORM TOGGLES
═══════════════════════════════════════════════════════════ */
function wireToggle(btnId, formId) {
  $(btnId).addEventListener('click', () => {
    const collapsed = $(formId).classList.toggle('form--collapsed');
    $(btnId).textContent = collapsed ? 'Show form' : 'Hide form';
    $(btnId).setAttribute('aria-expanded', String(!collapsed));
  });
}
wireToggle('toggle-expense-form-btn', 'expense-form');
wireToggle('toggle-income-form-btn',  'income-form');

/* ═══════════════════════════════════════════════════════════
   FILTER + SORT
═══════════════════════════════════════════════════════════ */
$('filter-category').addEventListener('change', e => { filterCat = e.target.value; renderExpenseList(); });
$('sort-order').addEventListener('change',      e => { sortOrder = e.target.value; renderExpenseList(); });

/* ═══════════════════════════════════════════════════════════
   TAB SWITCHING
═══════════════════════════════════════════════════════════ */
document.querySelectorAll('.tab-btn:not(#help-btn)').forEach(btn => {
  btn.addEventListener('click', () => {
    activeTab = btn.dataset.tab;
    document.querySelectorAll('.tab-btn:not(#help-btn)').forEach(b => b.classList.toggle('active', b === btn));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.toggle('active', p.id === 'tab-' + activeTab));
    if (activeTab === 'charts') setTimeout(renderCharts, 50);
  });
});

/* ═══════════════════════════════════════════════════════════
   KEYBOARD SHORTCUTS
═══════════════════════════════════════════════════════════ */
document.addEventListener('keydown', e => {
  if (!(e.metaKey || e.ctrlKey)) return;
  if (e.key === 'Enter') {
    e.preventDefault();
    if (activeTab === 'expenses') $('expense-form').dispatchEvent(new Event('submit',{cancelable:true,bubbles:true}));
    if (activeTab === 'income')   $('income-form').dispatchEvent(new Event('submit',{cancelable:true,bubbles:true}));
  }
});

/* ═══════════════════════════════════════════════════════════
   RENDER: DASHBOARD
═══════════════════════════════════════════════════════════ */
function renderDashboard() {
  const totalSpent  = expenses.reduce((s,x) => s + x.amount, 0);
  const totalIncome = incomes.reduce((s,x)  => s + x.amount, 0);
  const balance     = totalIncome - totalSpent;
  const count       = expenses.length;

  // Hero
  animateTotal(totalSpent);
  $('expense-count').textContent = count === 0
    ? 'No expenses yet'
    : `${count} expense${count!==1?'s':''} recorded`;

  // Income card
  $('dash-income').textContent   = fmt(totalIncome);
  $('dash-income-sub').textContent = incomes.length
    ? `${incomes.length} source${incomes.length!==1?'s':''}`
    : 'No income added';

  // Balance card
  const balEl = $('dash-balance');
  balEl.textContent = fmt(Math.abs(balance));
  balEl.className   = 'stat-value ' + (balance >= 0 ? 'stat-value--pos' : 'stat-value--neg');
  $('dash-balance-sub').textContent = balance >= 0 ? 'surplus' : 'deficit';
  $('balance-card').className = 'stat-card ' + (balance >= 0 ? 'stat-card--balance-pos' : 'stat-card--balance-neg');

  // Avg expense
  $('dash-avg').textContent = count > 0 ? fmt(Math.round(totalSpent / count)) : '—';

  // Top category
  if (count > 0) {
    const t = {};
    expenses.forEach(x => { t[x.category] = (t[x.category]||0) + x.amount; });
    const top = Object.entries(t).sort((a,b) => b[1]-a[1])[0];
    $('dash-top-cat').textContent     = top[0];
    $('dash-top-cat-sub').textContent = fmt(top[1]);
  } else {
    $('dash-top-cat').textContent     = '—';
    $('dash-top-cat-sub').textContent = 'by spending';
  }

  // Budget
  const budget = settings.budget;
  const budgetStatCard = $('budget-stat-card');
  const progressWrap   = $('budget-progress-wrap');
  const overPill       = $('over-budget-pill');

  if (budget > 0) {
    budgetStatCard.hidden  = false;
    progressWrap.hidden    = false;
    const pct     = Math.min((totalSpent / budget) * 100, 100);
    const over    = totalSpent > budget;
    const left    = budget - totalSpent;

    $('dash-budget-left').textContent = over ? '-' + fmt(Math.abs(left)) : fmt(left);
    $('dash-budget-left').className   = 'stat-value ' + (over ? 'stat-value--neg' : 'stat-value--gold');
    $('dash-budget-sub').textContent  = over ? 'over budget!' : 'remaining';
    budgetStatCard.className = 'stat-card ' + (over ? 'stat-card--balance-neg' : 'stat-card--budget');

    $('budget-spent-label').textContent     = fmt(totalSpent) + ' spent';
    $('budget-of-label').textContent        = 'of ' + fmt(budget);
    $('budget-remaining-label').textContent = over ? `${fmt(Math.abs(left))} over budget` : `${fmt(left)} left`;
    $('budget-pct-label').textContent       = Math.round((totalSpent/budget)*100) + '%';

    const fill = $('budget-bar-fill');
    fill.style.width = pct + '%';
    fill.className = 'budget-bar-fill' + (over ? ' budget-bar-fill--over' : pct >= 80 ? ' budget-bar-fill--warn' : '');
    overPill.classList.toggle('is-visible', over);
  } else {
    budgetStatCard.hidden = true;
    progressWrap.hidden   = true;
    overPill.classList.remove('is-visible');
  }
}

/* ═══════════════════════════════════════════════════════════
   RENDER: CATEGORY BREAKDOWN
═══════════════════════════════════════════════════════════ */
function renderBreakdown() {
  const container = $('breakdown-list');
  container.querySelectorAll('.breakdown-row').forEach(el => el.remove());
  const empty = container.querySelector('.empty-state');

  if (expenses.length === 0) {
    if (empty) empty.style.display = '';
    return;
  }
  if (empty) empty.style.display = 'none';

  const tally = {};
  expenses.forEach(x => { tally[x.category] = (tally[x.category]||0) + x.amount; });
  const total  = Object.values(tally).reduce((s,v) => s+v, 0);
  const sorted = Object.entries(tally).sort((a,b) => b[1]-a[1]);

  sorted.forEach(([cat, amt]) => {
    const pct = total > 0 ? Math.round((amt/total)*100) : 0;
    const row = document.createElement('div');
    row.className = 'breakdown-row';
    row.innerHTML = `
      <div class="breakdown-row__header">
        <span class="breakdown-row__label">${esc(cat)}</span>
        <span class="breakdown-row__amount">${fmt(amt)}<span class="breakdown-row__pct">&nbsp;${pct}%</span></span>
      </div>
      <div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div>`;
    container.appendChild(row);
  });
}

/* ═══════════════════════════════════════════════════════════
   RENDER: EXPENSE LIST
═══════════════════════════════════════════════════════════ */
function renderExpenseList() {
  // Rebuild filter dropdown
  const cats = [...new Set(expenses.map(x => x.category))].sort();
  const cur  = $('filter-category').value;
  $('filter-category').innerHTML = '<option value="all">All categories</option>';
  cats.forEach(c => {
    const o = document.createElement('option');
    o.value = c; o.textContent = c;
    $('filter-category').appendChild(o);
  });
  $('filter-category').value = cats.includes(cur) ? cur : 'all';

  let visible = filterCat === 'all' ? [...expenses] : expenses.filter(x => x.category === filterCat);
  visible.sort((a,b) => {
    if (sortOrder === 'newest')  return b.date.localeCompare(a.date) || b.id.localeCompare(a.id);
    if (sortOrder === 'oldest')  return a.date.localeCompare(b.date);
    if (sortOrder === 'highest') return b.amount - a.amount;
    if (sortOrder === 'lowest')  return a.amount - b.amount;
    return 0;
  });

  $('expense-empty').style.display = visible.length > 0 ? 'none' : '';
  const list = $('expense-list');
  list.innerHTML = '';

  const useGroups = sortOrder === 'newest' || sortOrder === 'oldest';
  let lastDate = null;

  visible.forEach(ex => {
    if (useGroups && ex.date !== lastDate) {
      lastDate = ex.date;
      const hdr = document.createElement('li');
      hdr.className = 'date-group-header'; hdr.role = 'presentation';
      hdr.textContent = relDate(ex.date);
      list.appendChild(hdr);
    }
    const note = ex.note || ex.category;
    const li = document.createElement('li');
    li.className = 'expense-item'; li.dataset.id = ex.id;
    li.innerHTML = `
      <div class="expense-item__left">
        <span class="category-badge ${BADGE[ex.category]||'badge--other'}">${esc(ex.category)}</span>
        <div class="expense-item__meta">
          <span class="expense-item__note">${esc(note)}</span>
          <span class="expense-item__date">${fmtDate(ex.date)}</span>
        </div>
      </div>
      <div class="expense-item__right">
        <span class="expense-item__amount">${fmt(ex.amount)}</span>
        <button class="btn btn--delete" data-id="${ex.id}" aria-label="Delete">✕</button>
      </div>`;
    list.appendChild(li);
  });
}

/* ═══════════════════════════════════════════════════════════
   RENDER: INCOME LIST
═══════════════════════════════════════════════════════════ */
function renderIncomeList() {
  $('income-empty').style.display = incomes.length > 0 ? 'none' : '';
  const list = $('income-list');
  list.innerHTML = '';

  incomes.forEach(inc => {
    const note = inc.note || inc.source;
    const li = document.createElement('li');
    li.className = 'income-item'; li.dataset.id = inc.id + '-inc';
    li.innerHTML = `
      <div class="income-item__left">
        <span class="income-badge">${esc(inc.source)}</span>
        <div class="income-item__meta">
          <span class="income-item__source">${esc(note)}</span>
          <span class="income-item__date">${fmtDate(inc.date)}</span>
        </div>
      </div>
      <div class="expense-item__right">
        <span class="income-item__amount">${fmt(inc.amount)}</span>
        <button class="btn btn--delete" data-id="${inc.id}" aria-label="Delete">✕</button>
      </div>`;
    list.appendChild(li);
  });
}

/* ═══════════════════════════════════════════════════════════
   POPULATE SETTINGS FORM
═══════════════════════════════════════════════════════════ */
function populateSettingsForm() {
  $('set-budget').value        = settings.budget    || '';
  $('set-allowance').value     = settings.allowance || '';
  $('set-currency-name').value = settings.currencyName || '';
  $('log-allowance-btn').disabled = !settings.allowance;
}

/* ═══════════════════════════════════════════════════════════
   RENDER ALL
═══════════════════════════════════════════════════════════ */
function renderAll() {
  renderDashboard();
  renderBreakdown();
  renderInsight();
  renderExpenseList();
  renderIncomeList();
  renderCharts();
}

/* ═══════════════════════════════════════════════════════════
   CHART COLOURS (10 slots, cycles if more categories)
═══════════════════════════════════════════════════════════ */
const CHART_COLORS = [
  '#4A7B5E','#2E6B8A','#8A6A2E','#7B4A6E',
  '#6E4A4A','#4A5E7B','#5E7B4A','#7B654A',
  '#4A7B74','#7B4A5E'
];

/* ═══════════════════════════════════════════════════════════
   INIT
═══════════════════════════════════════════════════════════ */
(function init() {
  // Set current month in header
  $('current-month-label').textContent = new Date().toLocaleDateString('en-GB',{month:'long',year:'numeric'});
  // Pre-fill dates
  $('exp-date').value = today();
  $('inc-date').value = today();
  // Load data
  load();
  // Seed counter without animation
  _displayed = expenses.reduce((s,x) => s+x.amount, 0);
  // Populate settings panel
  populateSettingsForm();
  // First render
  renderAll();
  // Override counter display to skip startup animation
  $('total-amount').textContent = fmt(_displayed);
})();
/* ═══════════════════════════════════════════════════════════
   HELP MODAL
═══════════════════════════════════════════════════════════ */
const HELP_KEY = 'lst_help_seen';

function openHelp() {
  $('help-overlay').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}
function closeHelp() {
  $('help-overlay').classList.add('hidden');
  document.body.style.overflow = '';
  if ($('dont-show-help').checked) {
    localStorage.setItem(HELP_KEY, '1');
  }
}

$('help-close-btn').addEventListener('click', closeHelp);
$('help-got-it-btn').addEventListener('click', closeHelp);
$('help-overlay').addEventListener('click', e => { if (e.target === $('help-overlay')) closeHelp(); });

// Override the help tab button so it opens modal, not a tab
$('help-btn').addEventListener('click', e => {
  e.stopPropagation();
  openHelp();
});

// Show on first visit
if (!localStorage.getItem(HELP_KEY)) {
  setTimeout(openHelp, 600);
}

/* ═══════════════════════════════════════════════════════════
   DONUT CHART
═══════════════════════════════════════════════════════════ */
function drawDonut() {
  const canvas = $('donut-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  if (expenses.length === 0) {
    // Empty ring
    ctx.beginPath();
    ctx.arc(W/2, H/2, 80, 0, Math.PI*2);
    ctx.strokeStyle = '#E2DDD5';
    ctx.lineWidth = 28;
    ctx.stroke();
    $('donut-total').textContent = '₦0';
    $('donut-legend').innerHTML = '<p style="font-size:13px;color:#B0B8B4;font-style:italic">No expenses yet</p>';
    return;
  }

  const tally = {};
  expenses.forEach(x => { tally[x.category] = (tally[x.category]||0) + x.amount; });
  const total  = Object.values(tally).reduce((s,v) => s+v, 0);
  const slices = Object.entries(tally).sort((a,b) => b[1]-a[1]);

  $('donut-total').textContent = fmt(total);

  const cx = W/2, cy = H/2, r = 80, lineW = 28;
  const gap = 0.03; // radians gap between slices
  let angle = -Math.PI / 2;

  slices.forEach(([cat, amt], i) => {
    const sweep = (amt / total) * (Math.PI * 2) - (slices.length > 1 ? gap : 0);
    ctx.beginPath();
    ctx.arc(cx, cy, r, angle, angle + sweep);
    ctx.strokeStyle = CHART_COLORS[i % CHART_COLORS.length];
    ctx.lineWidth = lineW;
    ctx.lineCap = slices.length === 1 ? 'butt' : 'round';
    ctx.stroke();
    angle += sweep + (slices.length > 1 ? gap : 0);
  });

  // Legend
  $('donut-legend').innerHTML = slices.map(([cat, amt], i) => `
    <div class="legend-item">
      <span class="legend-dot" style="background:${CHART_COLORS[i % CHART_COLORS.length]}"></span>
      <span>${esc(cat)}</span>
      <span style="font-family:var(--font-mono);font-size:11px;color:var(--col-ink-faint);">${Math.round((amt/total)*100)}%</span>
    </div>
  `).join('');
}

/* ═══════════════════════════════════════════════════════════
   7-DAY BAR CHART
═══════════════════════════════════════════════════════════ */
function drawWeekChart() {
  const canvas = $('week-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Build last 7 days array
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const iso = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString('en-GB', { weekday:'short' });
    const total = expenses.filter(x => x.date === iso).reduce((s,x) => s+x.amount, 0);
    days.push({ iso, label, total });
  }

  const weekTotal = days.reduce((s,d) => s+d.total, 0);
  $('week-total-label').textContent = weekTotal > 0 ? `${fmt(weekTotal)} this week` : '';

  const DPR   = window.devicePixelRatio || 1;
  const cW    = canvas.offsetWidth  || 700;
  const cH    = 180;
  canvas.width  = cW * DPR;
  canvas.height = cH * DPR;
  ctx.scale(DPR, DPR);
  ctx.clearRect(0, 0, cW, cH);

  const maxVal   = Math.max(...days.map(d => d.total), 1);
  const padLeft  = 8, padRight = 8, padTop = 16, padBottom = 36;
  const chartW   = cW - padLeft - padRight;
  const chartH   = cH - padTop - padBottom;
  const barW     = Math.floor(chartW / 7) - 8;
  const barGap   = Math.floor(chartW / 7);

  // Get today
  const todayISO = today();

  days.forEach((d, i) => {
    const x    = padLeft + i * barGap + (barGap - barW) / 2;
    const barH = d.total > 0 ? Math.max((d.total / maxVal) * chartH, 4) : 0;
    const y    = padTop + chartH - barH;
    const isToday = d.iso === todayISO;

    // Bar
    ctx.fillStyle = isToday ? '#1C3828' : '#D6EAE0';
    const br = Math.min(6, barW / 2);
    roundRect(ctx, x, y, barW, barH, br);
    ctx.fill();

    // Amount label on bars that have value
    if (d.total > 0) {
      ctx.fillStyle = isToday ? '#1C3828' : '#4A7B5E';
      ctx.font = `500 10px DM Mono, monospace`;
      ctx.textAlign = 'center';
      const label = d.total >= 1000 ? (d.total/1000).toFixed(1)+'k' : String(d.total);
      ctx.fillText(label, x + barW/2, y - 5);
    }

    // Day label
    ctx.fillStyle = isToday ? '#1C3828' : '#B0B8B4';
    ctx.font = isToday ? `600 11px DM Sans, sans-serif` : `400 11px DM Sans, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(d.label, x + barW/2, padTop + chartH + 18);

    // "Today" indicator dot
    if (isToday) {
      ctx.beginPath();
      ctx.arc(x + barW/2, padTop + chartH + 28, 3, 0, Math.PI*2);
      ctx.fillStyle = '#1C3828';
      ctx.fill();
    }
  });

  // Hint text
  const busiest = days.reduce((a, b) => b.total > a.total ? b : a, days[0]);
  $('week-hint').textContent = weekTotal === 0
    ? 'No spending recorded in the last 7 days.'
    : busiest.total > 0
      ? `Biggest day: ${relDate(busiest.iso)} — ${fmt(busiest.total)}`
      : '';
}

function roundRect(ctx, x, y, w, h, r) {
  if (h <= 0) return;
  if (h < r * 2) r = h / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/* ═══════════════════════════════════════════════════════════
   INCOME vs SPENDING COMPARE BARS
═══════════════════════════════════════════════════════════ */
function drawCompareBars() {
  const totalIncome = incomes.reduce((s,x) => s+x.amount, 0);
  const totalSpent  = expenses.reduce((s,x) => s+x.amount, 0);
  const budget      = settings.budget || 0;

  const isEmpty = totalIncome === 0 && totalSpent === 0;
  $('charts-empty').style.display  = isEmpty ? '' : 'none';
  $('compare-bars').style.display  = isEmpty ? 'none' : '';

  if (isEmpty) return;

  const maxVal = Math.max(totalIncome, totalSpent, budget, 1);
  $('cmp-income-fill').style.width  = Math.round((totalIncome / maxVal) * 100) + '%';
  $('cmp-spend-fill').style.width   = Math.round((totalSpent  / maxVal) * 100) + '%';
  $('cmp-income-val').textContent   = fmt(totalIncome);
  $('cmp-spend-val').textContent    = fmt(totalSpent);

  if (budget > 0) {
    $('cmp-budget-row').style.display = '';
    $('cmp-budget-fill').style.width  = Math.round((budget / maxVal) * 100) + '%';
    $('cmp-budget-val').textContent   = fmt(budget);
  } else {
    $('cmp-budget-row').style.display = 'none';
  }
}

/* ═══════════════════════════════════════════════════════════
   SMART INSIGHT ENGINE
═══════════════════════════════════════════════════════════ */
function renderInsight() {
  const el = $('dashboard-insight');
  const txt = $('dashboard-insight-text');
  if (!expenses.length) { el.style.display = 'none'; return; }

  const tally = {};
  expenses.forEach(x => { tally[x.category] = (tally[x.category]||0) + x.amount; });
  const total  = expenses.reduce((s,x) => s+x.amount, 0);
  const sorted = Object.entries(tally).sort((a,b) => b[1]-a[1]);
  const top    = sorted[0];
  const topPct = Math.round((top[1] / total) * 100);

  const count = expenses.length;
  const avg   = Math.round(total / count);

  const insights = [];

  // Top category tip
  if (topPct >= 50) {
    insights.push(`${topPct}% of your spending is on ${top[0]} — that's over half your total. Worth reviewing?`);
  } else {
    insights.push(`${top[0]} is your biggest spend at ${topPct}% of your total.`);
  }

  // Budget insight
  if (settings.budget > 0) {
    const used = Math.round((total / settings.budget) * 100);
    if (used >= 100) insights.push(`You've exceeded your ₦${settings.budget.toLocaleString()} budget by ${fmt(total - settings.budget)}.`);
    else if (used >= 80) insights.push(`You've used ${used}% of your monthly budget — just ${fmt(settings.budget - total)} left.`);
    else insights.push(`Budget health looks good — ${fmt(settings.budget - total)} remaining (${100 - used}%).`);
  }

  // Avg tip
  if (avg > 0) insights.push(`Your average spend per transaction is ${fmt(avg)}.`);

  el.style.display = '';
  // Rotate through insights if multiple
  const idx = Math.floor(Date.now() / 30000) % insights.length;
  txt.textContent = insights[idx];
}

/* ═══════════════════════════════════════════════════════════
   RENDER: CHARTS TAB
═══════════════════════════════════════════════════════════ */
function renderCharts() {
  drawDonut();
  drawWeekChart();
  drawCompareBars();
}

// Redraw week chart on resize (canvas is size-sensitive)
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(drawWeekChart, 150);
});
