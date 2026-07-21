/**
 * Charts.js — small dependency-free SVG chart primitives shared across
 * pages (Profile's platform breakdown, Achievements' rarity breakdown,
 * global progress ring). Pure render functions, no framework needed —
 * consistent with the rest of this codebase.
 */

let uid = 0;
const nextId = (prefix) => `${prefix}-${(uid += 1)}-${Date.now().toString(36)}`;

/**
 * Donut chart with a centered total and a legend.
 * @param {{label: string, value: number, color: string}[]} segments
 * @param {{size?: number, thickness?: number, centerLabel?: string, centerSub?: string}} opts
 */
export function DonutChart(segments, opts = {}) {
  const { size = 176, thickness = 20, centerLabel, centerSub = '' } = opts;
  const visible = segments.filter((s) => s.value > 0);
  const total = visible.reduce((sum, s) => sum + s.value, 0);
  const r = (size - thickness) / 2;
  const circumference = 2 * Math.PI * r;
  const cx = size / 2;
  const cy = size / 2;

  let offset = 0;
  const arcs = total === 0
    ? `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="${thickness}" />`
    : visible.map((s) => {
      const fraction = s.value / total;
      const dash = fraction * circumference;
      const gap = circumference - dash;
      const dashOffset = -offset;
      offset += dash;
      return `<circle class="donut-arc" cx="${cx}" cy="${cy}" r="${r}" fill="none"
                stroke="${s.color}" stroke-width="${thickness}"
                stroke-dasharray="${dash} ${gap}" stroke-dashoffset="${dashOffset}"
                stroke-linecap="butt" transform="rotate(-90 ${cx} ${cy})">
                <title>${escapeAttr(s.label)}: ${s.value}</title>
              </circle>`;
    }).join('');

  const label = centerLabel ?? String(total);

  return `
    <div class="donut-chart">
      <svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img" aria-label="Gráfico de distribución">
        ${arcs}
        <text x="${cx}" y="${cy - (centerSub ? 6 : 0)}" text-anchor="middle" dominant-baseline="middle" class="donut-center-value">${label}</text>
        ${centerSub ? `<text x="${cx}" y="${cy + 20}" text-anchor="middle" dominant-baseline="middle" class="donut-center-sub">${escapeAttr(centerSub)}</text>` : ''}
      </svg>
      <ul class="chart-legend">
        ${segments.map((s) => {
          const pct = total ? Math.round((s.value / total) * 100) : 0;
          return `
            <li class="chart-legend-item">
              <span class="chart-swatch" style="background:${s.color}"></span>
              <span class="chart-legend-label">${escapeAttr(s.label)}</span>
              <span class="chart-legend-value">${s.value}${total ? ` · ${pct}%` : ''}</span>
            </li>`;
        }).join('')}
      </ul>
    </div>
  `;
}

/**
 * Horizontal bar chart — one row per item, bar length proportional to
 * the largest value in the set (or an explicit max).
 * @param {{label: string, value: number, color: string}[]} items
 * @param {{max?: number, icon?: (item:any)=>string}} opts
 */
export function BarChart(items, opts = {}) {
  const max = opts.max ?? Math.max(1, ...items.map((i) => i.value));
  return `
    <div class="bar-chart">
      ${items.map((item) => {
        const pct = max ? clampPct((item.value / max) * 100) : 0;
        return `
          <div class="bar-chart-row">
            <div class="bar-chart-label">${opts.icon ? opts.icon(item) : ''}${escapeAttr(item.label)}</div>
            <div class="bar-chart-track" role="img" aria-label="${escapeAttr(item.label)}: ${item.value}">
              <div class="bar-chart-fill" style="width:${pct}%; background:${item.color}"></div>
            </div>
            <div class="bar-chart-value">${item.value}</div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

/**
 * Single-value radial progress ring (e.g. "Progreso global").
 * @param {number} pct 0-100
 * @param {{size?: number, thickness?: number, label?: string, color?: string}} opts
 */
export function RadialProgress(pct, opts = {}) {
  const { size = 96, thickness = 10, label = '', color } = opts;
  const value = clampPct(pct);
  const r = (size - thickness) / 2;
  const circumference = 2 * Math.PI * r;
  const dash = (value / 100) * circumference;
  const cx = size / 2;
  const cy = size / 2;
  const strokeColor = color ?? (value >= 100 ? 'var(--success)' : 'var(--accent-primary)');
  const gradientId = nextId('radial');

  return `
    <div class="radial-progress" style="width:${size}px; height:${size}px;">
      <svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img" aria-label="${label ? escapeAttr(label) + ': ' : ''}${value}%">
        <defs>
          <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="var(--accent-primary)" />
            <stop offset="100%" stop-color="${value >= 100 ? 'var(--success)' : 'var(--accent-secondary)'}" />
          </linearGradient>
        </defs>
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="${thickness}" />
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="url(#${gradientId})" stroke-width="${thickness}"
          stroke-linecap="round" stroke-dasharray="${dash} ${circumference - dash}"
          transform="rotate(-90 ${cx} ${cy})" class="radial-progress-arc" />
        <text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle" class="radial-progress-value">${value}%</text>
      </svg>
      ${label ? `<div class="radial-progress-label">${escapeAttr(label)}</div>` : ''}
    </div>
  `;
}

function clampPct(n) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function escapeAttr(str = '') {
  return String(str).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}
