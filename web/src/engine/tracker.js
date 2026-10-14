// Export progress back into CURRICULUM_TRACKER.md format (spec-driven tracking).
import trackerTemplate from '../../../CURRICULUM_TRACKER.md?raw';
import { store } from './store.js';

/** Returns tracker markdown with [x] for every completed task and its sub-items. */
export function buildTracker() {
  const done = new Set(store.get().lessons);
  let current = null;
  return trackerTemplate
    .split('\n')
    .map((line) => {
      const m = line.match(/^\s*- \[[ x]\] Task (\d+\.\d+)/);
      if (m) current = m[1];
      else if (/^#/.test(line)) current = null;
      if (current && done.has(current)) return line.replace('[ ]', '[x]');
      return line;
    })
    .join('\n');
}

export function downloadTracker() {
  const blob = new Blob([buildTracker()], { type: 'text/markdown' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'CURRICULUM_TRACKER.md';
  a.click();
  URL.revokeObjectURL(a.href);
}
