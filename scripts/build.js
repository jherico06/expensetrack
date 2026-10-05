/**
 * scripts/build.js
 * Assembles the modular component files from modules/ into the root index.html
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const templatePath = path.join(rootDir, 'index.template.html');
const outputPath = path.join(rootDir, 'index.html');

if (!fs.existsSync(templatePath)) {
  console.error('Error: index.template.html not found.');
  process.exit(1);
}

let html = fs.readFileSync(templatePath, 'utf8');

const modules = [
  { tag: '<!-- {{MODULE:LANDING}} -->', file: 'modules/landing/landing.html' },
  { tag: '<!-- {{MODULE:SIDEBAR}} -->', file: 'modules/sidebar/sidebar.html' },
  { tag: '<!-- {{MODULE:TOPBAR}} -->', file: 'modules/topbar/topbar.html' },
  { tag: '<!-- {{MODULE:DASHBOARD}} -->', file: 'modules/dashboard/dashboard.html' },
  { tag: '<!-- {{MODULE:TRANSACTIONS}} -->', file: 'modules/transactions/transactions.html' },
  { tag: '<!-- {{MODULE:BUDGETS}} -->', file: 'modules/budgets/budgets.html' },
  { tag: '<!-- {{MODULE:CATEGORIES}} -->', file: 'modules/categories/categories.html' },
  { tag: '<!-- {{MODULE:RECURRING}} -->', file: 'modules/recurring/recurring.html' },
  { tag: '<!-- {{MODULE:REPORTS}} -->', file: 'modules/reports/reports.html' },
  { tag: '<!-- {{MODULE:SETTINGS}} -->', file: 'modules/settings/settings.html' },
  { tag: '<!-- {{MODULE:FAQ}} -->', file: 'modules/faq/faq.html' },
  { tag: '<!-- {{MODULE:ABOUT}} -->', file: 'modules/about/about.html' },
  { tag: '<!-- {{MODULE:PROFILE}} -->', file: 'modules/profile/profile.html' },
  { tag: '<!-- {{MODULE:MODALS}} -->', file: 'modules/modals/modals.html' }
];

let insertedCount = 0;
modules.forEach(m => {
  const filePath = path.join(rootDir, m.file);
  if (!fs.existsSync(filePath)) {
    console.warn(`Warning: module file ${m.file} not found. Skipping.`);
    return;
  }
  const content = fs.readFileSync(filePath, 'utf8').trim();
  if (html.includes(m.tag)) {
    html = html.replace(m.tag, content);
    insertedCount++;
  } else {
    console.warn(`Warning: placeholder tag ${m.tag} not found in template.`);
  }
});

fs.writeFileSync(outputPath, html, 'utf8');
console.log(`✓ Built index.html successfully (${insertedCount}/${modules.length} modules merged, ${html.length} bytes).`);
