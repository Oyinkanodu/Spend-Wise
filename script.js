/* ============================================================
   DESIGN TOKENS
============================================================ */
:root {
  --col-bg:           #F3F1EC;
  --col-surface:      #FDFCF9;
  --col-border:       #E2DDD5;
  --col-border-mid:   #CCC8BF;
  --col-ink:          #1C2420;
  --col-ink-mid:      #3D4A45;
  --col-ink-muted:    #7A8680;
  --col-ink-faint:    #B0B8B4;
  --col-primary:      #1C3828;
  --col-primary-mid:  #2A5040;
  --col-accent:       #4A7B5E;
  --col-accent-pale:  #D6EAE0;
  --col-warning:      #B84C42;
  --col-warning-pale: #F5E0DE;
  --col-income:       #2E6B8A;
  --col-income-pale:  #D6EBF5;
  --col-gold:         #8A6A2E;
  --col-gold-pale:    #F5EDD6;
  --col-badge-bg:     #EEF4F1;
  --col-mono:         #344B42;

  --font-sans: 'DM Sans', system-ui, sans-serif;
  --font-mono: 'DM Mono', 'Courier New', monospace;

  --sp-1:4px; --sp-2:8px; --sp-3:12px; --sp-4:16px;
  --sp-5:20px; --sp-6:24px; --sp-8:32px; --sp-10:40px;
  --sp-12:48px; --sp-16:64px;

  --r-sm:6px; --r-md:10px; --r-lg:16px;
  --shadow-card: 0 1px 3px rgba(28,36,32,.06), 0 4px 12px rgba(28,36,32,.06);
  --shadow-focus: 0 0 0 3px rgba(74,123,94,.30);
  --ease: cubic-bezier(.22,.68,0,1.2);
  --t: 180ms;
}

/* ============================================================
   RESET & BASE
============================================================ */
*,*::before,*::after { box-sizing:border-box; margin:0; padding:0; }
html { font-size:16px; -webkit-font-smoothing:antialiased; scroll-behavior:smooth; }
body { font-family:var(--font-sans); background:var(--col-bg); color:var(--col-ink); line-height:1.6; min-height:100vh; }
ul  { list-style:none; }
button { cursor:pointer; font-family:inherit; }
input,select { font-family:inherit; }

::-webkit-scrollbar { width:6px; }
::-webkit-scrollbar-track { background:transparent; }
::-webkit-scrollbar-thumb { background:var(--col-border-mid); border-radius:999px; }

/* ============================================================
   APP SHELL + NAV TABS
============================================================ */
#app { display:flex; flex-direction:column; min-height:100vh; }

#site-header {
  background:var(--col-primary);
  color:#fff;
  position:sticky; top:0; z-index:100;
  border-bottom:1px solid rgba(255,255,255,.08);
}
.header-inner {
  max-width:800px; margin:0 auto;
  padding:var(--sp-4) var(--sp-6);
  display:flex; align-items:center; justify-content:space-between;
}
.brand { display:flex; align-items:center; gap:var(--sp-3); }
.brand-mark {
  font-family:var(--font-mono); font-size:11px; font-weight:500;
  letter-spacing:.08em; background:rgba(255,255,255,.12);
  color:rgba(255,255,255,.85); padding:3px 8px;
  border-radius:var(--r-sm); border:1px solid rgba(255,255,255,.15);
}
.brand-name { font-size:15px; font-weight:500; letter-spacing:-.01em; color:rgba(255,255,255,.92); }
.header-meta { font-family:var(--font-mono); font-size:12px; color:rgba(255,255,255,.50); letter-spacing:.04em; }

/* Tab navigation */
.tab-nav {
  background:var(--col-primary);
  border-bottom:1px solid rgba(255,255,255,.10);
}
.tab-nav-inner {
  max-width:800px; margin:0 auto;
  display:flex; gap:0;
  padding:0 var(--sp-6);
}
.tab-btn {
  font-family:var(--font-sans); font-size:13px; font-weight:500;
  color:rgba(255,255,255,.50); background:transparent;
  border:none; border-bottom:2px solid transparent;
  padding:var(--sp-3) var(--sp-4);
  cursor:pointer; letter-spacing:.02em;
  transition:color var(--t) ease, border-color var(--t) ease;
  white-space:nowrap;
}
.tab-btn:hover { color:rgba(255,255,255,.80); }
.tab-btn.active {
  color:#fff;
  border-bottom-color:rgba(255,255,255,.70);
}

/* Tab panels */
.tab-panel { display:none; }
.tab-panel.active { display:contents; }

/* ============================================================
   MAIN LAYOUT
============================================================ */
#main-content {
  flex:1; max-width:800px; margin:0 auto; width:100%;
  padding:var(--sp-8) var(--sp-6) var(--sp-16);
  display:flex; flex-direction:column; gap:var(--sp-6);
}

/* ============================================================
   SECTION HEADER
============================================================ */
.section-header {
  display:flex; align-items:center;
  justify-content:space-between; margin-bottom:var(--sp-4);
}
.section-title {
  font-size:13px; font-weight:600;
  letter-spacing:.06em; text-transform:uppercase; color:var(--col-ink-muted);
}

/* ============================================================
   STAT CARDS
============================================================ */
.stat-grid {
  display:grid;
  grid-template-columns:1fr 1fr 1fr;
  gap:var(--sp-3);
}
.stat-card {
  background:var(--col-surface);
  border:1px solid var(--col-border);
  border-radius:var(--r-lg);
  box-shadow:var(--shadow-card);
  padding:var(--sp-5) var(--sp-5);
}
.stat-card--hero {
  grid-column:1 / -1;
  background:var(--col-primary);
  border-color:transparent;
  padding:var(--sp-6) var(--sp-8) var(--sp-5);
  position:relative; overflow:hidden;
}
.stat-card--hero::after {
  content:''; position:absolute;
  right:-50px; top:-50px; width:200px; height:200px;
  border-radius:50%; border:40px solid rgba(255,255,255,.04);
  pointer-events:none;
}
.stat-card--income { border-left:3px solid var(--col-income); }
.stat-card--balance-pos { border-left:3px solid var(--col-accent); }
.stat-card--balance-neg { border-left:3px solid var(--col-warning); }
.stat-card--budget { border-left:3px solid var(--col-gold); }

.stat-label {
  font-size:11px; font-weight:600; letter-spacing:.06em;
  text-transform:uppercase; color:var(--col-ink-muted); margin-bottom:var(--sp-1);
}
.stat-card--hero .stat-label { color:rgba(255,255,255,.50); }

.stat-amount {
  font-family:var(--font-mono);
  font-size:clamp(32px,5vw,48px);
  font-weight:500; color:#fff;
  letter-spacing:-.02em; line-height:1.1; margin-bottom:var(--sp-1);
}
.stat-sublabel { font-size:12px; color:rgba(255,255,255,.45); }

.stat-value {
  font-family:var(--font-mono); font-size:20px; font-weight:500;
  color:var(--col-ink); line-height:1.2; margin-bottom:2px;
}
.stat-value--income { color:var(--col-income); }
.stat-value--pos    { color:var(--col-accent); }
.stat-value--neg    { color:var(--col-warning); }
.stat-value--gold   { color:var(--col-gold); }
.stat-sub { font-size:11px; color:var(--col-ink-faint); }

/* Budget progress bar */
.budget-bar-wrap { margin-top:var(--sp-4); }
.budget-bar-meta {
  display:flex; justify-content:space-between;
  font-size:11px; color:rgba(255,255,255,.50);
  margin-bottom:6px; font-family:var(--font-mono);
}
.budget-bar-track {
  width:100%; height:6px; background:rgba(255,255,255,.12);
  border-radius:999px; overflow:hidden;
}
.budget-bar-fill {
  height:100%; border-radius:999px;
  background:rgba(255,255,255,.70);
  transition:width .6s var(--ease);
}
.budget-bar-fill--warn  { background:#F5B8B4; }
.budget-bar-fill--over  { background:#F87B73; width:100% !important; }

/* ============================================================
   SECTION CARDS
============================================================ */
.card {
  background:var(--col-surface);
  border:1px solid var(--col-border);
  border-radius:var(--r-lg);
  box-shadow:var(--shadow-card);
  padding:var(--sp-6);
}

/* ============================================================
   FORMS
============================================================ */
.form-row {
  display:grid;
  grid-template-columns:2fr 2fr 1.5fr;
  gap:var(--sp-3);
}
.form-group { display:flex; flex-direction:column; gap:var(--sp-2); }
.form-label {
  font-size:11px; font-weight:600;
  letter-spacing:.05em; text-transform:uppercase; color:var(--col-ink-muted);
}
.optional-tag { font-weight:400; text-transform:none; letter-spacing:0; color:var(--col-ink-faint); }
.input-wrap { position:relative; }
.input-prefix {
  position:absolute; left:12px; top:50%; transform:translateY(-50%);
  font-family:var(--font-mono); font-size:14px;
  color:var(--col-ink-muted); pointer-events:none; user-select:none;
}
.input-wrap .form-input { padding-left:28px; }
.form-input {
  width:100%; height:42px; padding:0 var(--sp-3);
  background:var(--col-bg); border:1px solid var(--col-border-mid);
  border-radius:var(--r-md); font-size:14px; color:var(--col-ink);
  outline:none; transition:border-color var(--t) ease, box-shadow var(--t) ease,background var(--t) ease;
  appearance:none; -webkit-appearance:none;
}
.form-input::placeholder { color:var(--col-ink-faint); }
.form-input:hover  { border-color:var(--col-accent); }
.form-input:focus  { border-color:var(--col-accent); box-shadow:var(--shadow-focus); background:var(--col-surface); }
.form-input.input--error { border-color:var(--col-warning); box-shadow:0 0 0 3px var(--col-warning-pale); }
.form-select {
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%237A8680' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat:no-repeat; background-position:right 12px center;
  padding-right:32px; cursor:pointer;
}
.form-select--sm { height:34px; font-size:13px; padding:0 var(--sp-3); padding-right:30px; }
input[type="date"]::-webkit-calendar-picker-indicator { opacity:.4; cursor:pointer; }
.form-footer { display:flex; align-items:center; gap:var(--sp-4); padding-top:var(--sp-2); }

/* Collapsible form */
.collapsible-form {
  overflow:hidden;
  transition:max-height .35s var(--ease), opacity .25s ease;
  max-height:600px; opacity:1;
}
.collapsible-form.form--collapsed { max-height:0; opacity:0; pointer-events:none; }

/* Save feedback */
.save-feedback {
  font-size:13px; font-weight:500; color:var(--col-accent);
  opacity:0; transform:translateY(4px);
  transition:opacity .25s ease, transform .25s ease;
}
.save-feedback.feedback--visible { opacity:1; transform:translateY(0); }

/* Keyboard hint */
.kbd-hint { font-size:11px; color:var(--col-ink-faint); font-family:var(--font-mono); user-select:none; }
kbd {
  display:inline-block; font-family:var(--font-mono); font-size:10px;
  background:var(--col-border); border:1px solid var(--col-border-mid);
  border-radius:4px; padding:1px 5px; color:var(--col-ink-mid);
}

/* ============================================================
   BUTTONS
============================================================ */
.btn {
  display:inline-flex; align-items:center; justify-content:center; gap:var(--sp-2);
  font-size:14px; font-weight:500; border-radius:var(--r-md);
  border:1px solid transparent; padding:0 var(--sp-5); height:42px;
  white-space:nowrap; transition:background var(--t) ease,color var(--t) ease,
  border-color var(--t) ease,box-shadow var(--t) ease,transform 80ms ease;
  outline:none; line-height:1;
}
.btn:active { transform:scale(.97); }
.btn--primary { background:var(--col-primary); color:#fff; border-color:var(--col-primary); }
.btn--primary:hover { background:var(--col-primary-mid); border-color:var(--col-primary-mid); }
.btn--primary:focus-visible { box-shadow:var(--shadow-focus); }
.btn--income { background:var(--col-income); color:#fff; border-color:var(--col-income); }
.btn--income:hover { background:#255a75; border-color:#255a75; }
.btn--outline { background:transparent; color:var(--col-ink-mid); border-color:var(--col-border-mid); }
.btn--outline:hover { background:var(--col-bg); border-color:var(--col-accent); color:var(--col-accent); }
.btn--ghost  { background:transparent; color:var(--col-ink-mid); border-color:transparent; }
.btn--ghost:hover { background:var(--col-bg); color:var(--col-accent); }
.btn--sm { height:32px; font-size:12px; padding:0 var(--sp-3); border-radius:var(--r-sm); }
.btn--delete {
  width:30px; height:30px; padding:0; font-size:13px;
  border-radius:var(--r-sm); background:transparent;
  color:var(--col-ink-faint); border:1px solid transparent; flex-shrink:0;
}
.btn--delete:hover { background:var(--col-warning-pale); color:var(--col-warning); }
.btn--delete.btn--confirm {
  background:var(--col-warning); color:#fff; border-color:var(--col-warning);
  width:auto; padding:0 var(--sp-2); font-size:11px; font-weight:600; letter-spacing:.03em;
}
.btn--clear {
  background:transparent; color:var(--col-ink-faint);
  border:1px solid transparent; font-size:12px;
  height:30px; padding:0 var(--sp-3); border-radius:var(--r-sm);
}
.btn--clear:hover { color:var(--col-warning); border-color:var(--col-warning-pale); background:var(--col-warning-pale); }
.btn--clear.btn--confirm { color:var(--col-warning); border-color:var(--col-warning); font-weight:600; }

/* ============================================================
   BREAKDOWN BARS
============================================================ */
.breakdown-list { display:flex; flex-direction:column; gap:var(--sp-4); }
.breakdown-row  { display:flex; flex-direction:column; gap:var(--sp-1); }
.breakdown-row__header { display:flex; justify-content:space-between; align-items:baseline; }
.breakdown-row__label  { font-size:13px; font-weight:500; color:var(--col-ink-mid); }
.breakdown-row__amount { font-family:var(--font-mono); font-size:13px; font-weight:500; color:var(--col-mono); }
.breakdown-row__pct    { font-size:11px; color:var(--col-ink-faint); margin-left:4px; }
.bar-track { width:100%; height:6px; background:var(--col-border); border-radius:999px; overflow:hidden; }
.bar-fill  { height:100%; border-radius:999px; background:var(--col-accent); transform-origin:left; animation:barGrow .45s var(--ease) both; }
.bar-fill--income { background:var(--col-income); }
@keyframes barGrow { from{transform:scaleX(0)} to{transform:scaleX(1)} }

/* ============================================================
   INCOME ENTRIES
============================================================ */
.income-item {
  display:flex; align-items:center; justify-content:space-between;
  padding:var(--sp-4) var(--sp-2);
  border-bottom:1px solid var(--col-border);
  border-radius:var(--r-sm);
  transition:background var(--t) ease;
  animation:itemIn .2s ease both;
  gap:var(--sp-4);
}
.income-item:last-child { border-bottom:none; }
.income-item:hover { background:var(--col-bg); }
.income-item__left { display:flex; align-items:center; gap:var(--sp-3); flex:1; min-width:0; }
.income-item__meta { display:flex; flex-direction:column; gap:2px; min-width:0; }
.income-item__source { font-size:14px; font-weight:500; color:var(--col-ink); }
.income-item__date   { font-size:12px; color:var(--col-ink-faint); font-family:var(--font-mono); }
.income-badge {
  display:inline-flex; align-items:center; flex-shrink:0;
  font-size:11px; font-weight:600; letter-spacing:.04em; text-transform:uppercase;
  padding:3px 8px; border-radius:var(--r-sm);
  background:var(--col-income-pale); color:var(--col-income);
}
.income-item__amount { font-family:var(--font-mono); font-size:15px; font-weight:500; color:var(--col-income); }

/* ============================================================
   EXPENSE LIST
============================================================ */
.expense-item {
  display:flex; align-items:center; justify-content:space-between;
  padding:var(--sp-4) var(--sp-2);
  border-bottom:1px solid var(--col-border);
  border-radius:var(--r-sm);
  gap:var(--sp-4);
  animation:itemIn .2s ease both;
  transition:background var(--t) ease;
}
.expense-item:last-child { border-bottom:none; }
.expense-item:hover { background:var(--col-bg); }
.expense-item__left  { display:flex; align-items:center; gap:var(--sp-3); min-width:0; flex:1; }
.expense-item__meta  { display:flex; flex-direction:column; gap:2px; min-width:0; }
.expense-item__note  { font-size:14px; color:var(--col-ink); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.expense-item__date  { font-size:12px; color:var(--col-ink-faint); font-family:var(--font-mono); }
.expense-item__right { display:flex; align-items:center; gap:var(--sp-3); flex-shrink:0; }
.expense-item__amount{ font-family:var(--font-mono); font-size:15px; font-weight:500; color:var(--col-mono); }
.category-badge {
  display:inline-flex; align-items:center; flex-shrink:0;
  font-size:11px; font-weight:600; letter-spacing:.04em; text-transform:uppercase;
  padding:3px 8px; border-radius:var(--r-sm); background:var(--col-badge-bg); color:var(--col-accent);
  white-space:nowrap;
}
.badge--food          { background:#EEF7F0; color:#3A7550; }
.badge--transport     { background:#EEF2F7; color:#3A5575; }
.badge--utilities     { background:#F7F3EE; color:#75583A; }
.badge--shopping      { background:#F7EEF5; color:#753A6E; }
.badge--health        { background:#F7EEEE; color:#75403A; }
.badge--education     { background:#EEEFF7; color:#3A4075; }
.badge--entertainment { background:#F2F7EE; color:#4C753A; }
.badge--other         { background:#F4F4F2; color:#5E6260; }

.date-group-header {
  font-size:11px; font-weight:600; letter-spacing:.06em; text-transform:uppercase;
  color:var(--col-ink-faint); padding:var(--sp-4) var(--sp-2) var(--sp-2);
  border-bottom:1px solid var(--col-border);
}
.date-group-header:first-child { padding-top:0; }

@keyframes itemIn { from{opacity:0;transform:translateY(-5px)} to{opacity:1;transform:translateY(0)} }

/* List controls */
.list-controls { display:flex; gap:var(--sp-2); align-items:center; flex-wrap:wrap; }

/* ============================================================
   EMPTY STATE
============================================================ */
.empty-state {
  padding:var(--sp-10) var(--sp-6);
  text-align:center;
  display:flex; flex-direction:column; align-items:center; gap:var(--sp-3);
}
.empty-state svg { opacity:.22; }
.empty-state p { font-size:14px; color:var(--col-ink-faint); }

/* ============================================================
   BUDGET SETTINGS PANEL
============================================================ */
.settings-grid {
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:var(--sp-5);
}
.settings-hint { font-size:12px; color:var(--col-ink-faint); margin-top:var(--sp-2); line-height:1.5; }
.divider { border:none; border-top:1px solid var(--col-border); margin:var(--sp-5) 0; }
.inline-saved { font-size:13px; font-weight:500; color:var(--col-accent); opacity:0; transition:opacity .25s ease; }
.inline-saved.visible { opacity:1; }

/* Budget ring on hero card */
.hero-right { display:flex; flex-direction:column; justify-content:flex-end; align-items:flex-end; }
.hero-body { display:flex; justify-content:space-between; align-items:flex-start; gap:var(--sp-6); }

/* Over-budget pill — hidden by default, shown via JS class */
.over-budget-pill {
  display:none;
  align-items:center; gap:4px;
  background:rgba(248,123,115,.20); color:#F5B8B4;
  font-size:11px; font-weight:600; letter-spacing:.04em; text-transform:uppercase;
  padding:3px 10px; border-radius:999px; margin-top:6px;
  border:1px solid rgba(248,123,115,.30);
  animation:pillPop .3s var(--ease) both;
}
.over-budget-pill.is-visible { display:inline-flex; }
@keyframes pillPop { from{opacity:0;transform:scale(.8)} to{opacity:1;transform:scale(1)} }

/* ============================================================
   PAGE LOAD ANIMATION
============================================================ */
@keyframes sectionIn { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
#summary-card  { animation:sectionIn .4s ease both; animation-delay:.05s; }
.card-expenses { animation:sectionIn .4s ease both; animation-delay:.15s; }
.card-breakdown{ animation:sectionIn .4s ease both; animation-delay:.22s; }
.card-income   { animation:sectionIn .4s ease both; animation-delay:.10s; }
.card-settings { animation:sectionIn .4s ease both; animation-delay:.08s; }

/* Counter pop */
@keyframes numPop { 0%{transform:scale(1)} 40%{transform:scale(1.04)} 100%{transform:scale(1)} }
.stat-amount--pop { animation:numPop .3s var(--ease) both; }

/* ============================================================
   FOOTER
============================================================ */
#site-footer { border-top:1px solid var(--col-border); padding:var(--sp-5) var(--sp-6); text-align:center; }
.footer-text { font-size:12px; color:var(--col-ink-faint); letter-spacing:.02em; }

/* ============================================================
   CHARTS
============================================================ */
.chart-donut-wrap {
  position:relative; display:flex;
  justify-content:center; align-items:center;
  margin:var(--sp-5) 0 var(--sp-4);
}
.donut-center {
  position:absolute; text-align:center;
  pointer-events:none;
}
.donut-center__label {
  font-size:11px; font-weight:600; letter-spacing:.06em;
  text-transform:uppercase; color:var(--col-ink-muted); margin-bottom:2px;
}
.donut-center__amount {
  font-family:var(--font-mono); font-size:20px; font-weight:500;
  color:var(--col-ink); line-height:1.1;
}
.donut-legend {
  display:flex; flex-wrap:wrap; gap:var(--sp-2) var(--sp-5);
  justify-content:center; margin-top:var(--sp-2);
}
.legend-item {
  display:flex; align-items:center; gap:6px;
  font-size:12px; color:var(--col-ink-mid);
}
.legend-dot {
  width:10px; height:10px; border-radius:50%; flex-shrink:0;
}

.bar-chart-wrap {
  margin:var(--sp-4) 0 var(--sp-2);
  overflow:hidden;
}
.chart-hint {
  font-size:12px; color:var(--col-ink-faint); text-align:center;
  margin-top:var(--sp-2);
}

/* Compare bars */
.compare-bars { display:flex; flex-direction:column; gap:var(--sp-4); margin-top:var(--sp-4); }
.compare-row  { display:flex; align-items:center; gap:var(--sp-3); }
.compare-label { font-size:12px; font-weight:500; color:var(--col-ink-muted); width:60px; flex-shrink:0; }
.compare-track {
  flex:1; height:10px; background:var(--col-border);
  border-radius:999px; overflow:hidden;
}
.compare-fill {
  height:100%; border-radius:999px;
  transition:width .7s var(--ease);
}
.compare-fill--income { background:var(--col-income); }
.compare-fill--spend  { background:var(--col-accent); }
.compare-fill--budget { background:var(--col-gold); }
.compare-val {
  font-family:var(--font-mono); font-size:13px; font-weight:500;
  color:var(--col-mono); width:90px; text-align:right; flex-shrink:0;
}

/* Help tab button special style */
.tab-btn--help {
  margin-left:auto;
  color:rgba(255,255,255,.40) !important;
  font-size:12px;
}
.tab-btn--help:hover { color:rgba(255,255,255,.75) !important; }

/* ============================================================
   HELP MODAL
============================================================ */
.help-overlay {
  position:fixed; inset:0; z-index:999;
  background:rgba(10,20,15,.55);
  backdrop-filter:blur(4px);
  display:flex; align-items:center; justify-content:center;
  padding:var(--sp-4);
  animation:fadeIn .25s ease both;
}
.help-overlay.hidden { display:none; }
@keyframes fadeIn { from{opacity:0} to{opacity:1} }

.help-modal {
  background:var(--col-surface);
  border:1px solid var(--col-border);
  border-radius:20px;
  box-shadow:0 24px 64px rgba(10,20,15,.25);
  width:100%; max-width:560px;
  max-height:90vh; overflow-y:auto;
  animation:modalUp .3s var(--ease) both;
}
@keyframes modalUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }

.help-modal__header {
  display:flex; justify-content:space-between; align-items:flex-start;
  gap:var(--sp-4); padding:var(--sp-8) var(--sp-8) var(--sp-5);
  border-bottom:1px solid var(--col-border);
}
.help-modal__eyebrow {
  font-size:11px; font-weight:600; letter-spacing:.07em;
  text-transform:uppercase; color:var(--col-ink-muted); margin-bottom:4px;
}
.help-modal__title { font-size:22px; font-weight:600; letter-spacing:-.02em; color:var(--col-ink); }
.help-modal__sub   { font-size:14px; color:var(--col-ink-muted); margin-top:4px; }

.help-close-btn {
  flex-shrink:0; width:32px; height:32px; border-radius:50%;
  border:1px solid var(--col-border-mid); background:transparent;
  color:var(--col-ink-muted); font-size:14px;
  display:flex; align-items:center; justify-content:center;
  transition:background var(--t) ease;
}
.help-close-btn:hover { background:var(--col-bg); }

.help-steps {
  padding:var(--sp-6) var(--sp-8);
  display:flex; flex-direction:column; gap:var(--sp-5);
}
.help-step {
  display:flex; gap:var(--sp-4); align-items:flex-start;
}
.help-step__num {
  flex-shrink:0; width:30px; height:30px;
  border-radius:50%; background:var(--col-primary);
  color:#fff; font-size:13px; font-weight:600;
  display:flex; align-items:center; justify-content:center;
  font-family:var(--font-mono);
}
.help-step__body { flex:1; padding-top:4px; }
.help-step__title {
  font-size:14px; font-weight:600; color:var(--col-ink);
  margin-bottom:4px; display:flex; align-items:center; gap:var(--sp-2); flex-wrap:wrap;
}
.help-step__desc { font-size:13px; color:var(--col-ink-mid); line-height:1.6; }
.help-tag {
  font-size:10px; font-weight:600; letter-spacing:.05em; text-transform:uppercase;
  background:var(--col-accent-pale); color:var(--col-accent);
  padding:2px 7px; border-radius:999px;
}

.help-footer {
  display:flex; align-items:center; justify-content:space-between;
  gap:var(--sp-4); flex-wrap:wrap;
  padding:var(--sp-5) var(--sp-8) var(--sp-7);
  border-top:1px solid var(--col-border);
}
.help-dont-show {
  display:flex; align-items:center; gap:var(--sp-2);
  font-size:13px; color:var(--col-ink-muted); cursor:pointer;
}
.help-dont-show input { cursor:pointer; accent-color:var(--col-accent); }

@media(max-width:640px) {
  .help-modal__header { padding:var(--sp-6) var(--sp-5) var(--sp-4); }
  .help-steps { padding:var(--sp-4) var(--sp-5); }
  .help-footer { padding:var(--sp-4) var(--sp-5) var(--sp-6); }
  .help-modal__title { font-size:18px; }
}

/* ============================================================
   STUDENT-FRIENDLY ELEMENTS
============================================================ */
/* Tip/insight callout */
.insight-box {
  background:var(--col-accent-pale);
  border:1px solid rgba(74,123,94,.20);
  border-radius:var(--r-md);
  padding:var(--sp-3) var(--sp-4);
  font-size:13px; color:var(--col-accent);
  display:flex; align-items:flex-start; gap:var(--sp-2);
  margin-top:var(--sp-4);
}
.insight-box svg { flex-shrink:0; margin-top:1px; }
.insight-box p { line-height:1.5; }

/* Friendly empty hint */
.empty-hint {
  font-size:12px; color:var(--col-ink-faint); margin-top:4px;
}
