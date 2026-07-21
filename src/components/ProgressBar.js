/**
 * ProgressBar.js — reusable progress indicator.
 * @param {number} value 0-100
 * @param {{label?: string, showPercent?: boolean}} opts
 */
export function ProgressBar(value, opts = {}) {
  const { label, showPercent = true } = opts;
  const pct = Math.max(0, Math.min(100, value));
  const completeClass = pct >= 100 ? 'is-complete' : '';
  return `
    ${label || showPercent ? `
      <div class="progress-label">
        <span>${label ?? ''}</span>
        ${showPercent ? `<span>${pct}%</span>` : ''}
      </div>` : ''}
    <div class="progress-bar" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100">
      <div class="progress-bar-fill ${completeClass}" style="width:${pct}%"></div>
    </div>
  `;
}
