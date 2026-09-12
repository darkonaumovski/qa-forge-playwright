import { authenticatedTest as test, expect } from '../src/fixtures/test';
import { auditEvents } from '../src/data/users';

test.beforeEach(async ({ shell }) => { await shell.navigate('Audit log'); });

test('QF-AUDIT-01 Audit initially shows the first four events in order @smoke', async ({ audit }) => {
  await expect(audit.heading).toBeVisible(); await expect(audit.details).toHaveText(auditEvents.slice(0, 4));
  await expect(audit.state).toHaveText('Ready'); await expect(audit.loadMore).toBeVisible();
});

test('QF-AUDIT-02 Load more shows a disabled loading state then all eight events', async ({ audit }) => {
  await audit.loadMore.click(); await expect(audit.loadMore).toHaveText('Loading…'); await expect(audit.loadMore).toBeDisabled();
  await expect(audit.details).toHaveText(auditEvents); await expect(audit.loadMore).toBeHidden();
});

test('QF-AUDIT-03 Debounced role search exposes Filtering then Ready @smoke', async ({ audit }) => {
  await audit.search.fill('role'); await expect(audit.state).toHaveText('Filtering…');
  await expect(audit.state).toHaveText('Ready'); await expect(audit.details).toHaveText([auditEvents[2]]);
  await expect(audit.loadMore).toBeHidden();
});

test('QF-AUDIT-04 Search is case-insensitive and trims whitespace', async ({ audit }) => {
  await audit.search.fill('  ROLE  '); await expect(audit.details).toHaveText([auditEvents[2]]); await expect(audit.state).toHaveText('Ready');
});

test('QF-AUDIT-05 No-match state recovers when the search is cleared', async ({ audit }) => {
  await audit.search.fill('nonexistent'); await expect(audit.empty).toBeVisible(); await expect(audit.events).toHaveCount(0);
  await expect(audit.loadMore).toBeHidden(); await audit.search.clear();
  await expect(audit.details).toHaveText(auditEvents.slice(0, 4)); await expect(audit.loadMore).toBeVisible();
});

test('QF-AUDIT-06 Rapid input cancels stale debounce work', async ({ audit, page }) => {
  const now = new Date();
  await page.clock.install({ time: now });
  await page.clock.pauseAt(new Date(now.getTime() + 1000));
  await audit.search.fill('role'); await page.clock.runFor(100); await audit.search.fill('MFA');
  await page.clock.runFor(299); await expect(audit.state).toHaveText('Filtering…');
  await expect(audit.details).toHaveText(auditEvents.slice(0, 4));
  await page.clock.runFor(1); await expect(audit.state).toHaveText('Ready'); await expect(audit.details).toHaveText([auditEvents[6]]);
});

test('QF-AUDIT-07 Search covers events that have not yet been loaded', async ({ audit }) => {
  await audit.search.fill('archived'); await expect(audit.details).toHaveText([auditEvents[7]]);
});

test('QF-AUDIT-08 Clearing a filter preserves the expanded event limit', async ({ audit }) => {
  await audit.loadMore.click(); await expect(audit.events).toHaveCount(8);
  await audit.search.fill('role'); await expect(audit.events).toHaveCount(1); await audit.search.clear();
  await expect(audit.details).toHaveText(auditEvents); await expect(audit.loadMore).toBeHidden();
});

test('QF-AUDIT-09 Export CSV produces the documented simulation notification', async ({ audit, shell }) => {
  await audit.export.click(); await expect(shell.toast('CSV export prepared — assertion target reached')).toBeVisible();
  await expect(audit.events).toHaveCount(4);
});

test('QF-AUDIT-10 Whitespace-only event search leaves results unfiltered', async ({ audit }) => {
  await audit.search.fill('   '); await expect(audit.state).toHaveText('Ready');
  await expect(audit.details).toHaveText(auditEvents.slice(0, 4)); await expect(audit.loadMore).toBeVisible();
});
