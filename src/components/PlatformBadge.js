/**
 * PlatformBadge.js — renders a colored pill for a given platform.
 * All components in this app are simple functions returning an HTML
 * string (or an HTMLElement for stateful ones). No framework needed
 * for a project of this size — keeps the bundle at ~0kb of dependencies.
 */
import { PLATFORM_META } from '../data/model.js';

export function PlatformBadge(platform) {
  const meta = PLATFORM_META[platform] ?? { label: platform, color: '#8a94b3' };
  return `
    <span class="platform-badge" style="--pf-color:${meta.color}">
      <span class="swatch"></span>${meta.label}
    </span>
  `;
}
