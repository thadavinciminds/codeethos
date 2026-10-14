// Full 8-week curriculum definitions, track presets, and unlock validation.
import { week1 } from './week1.js';
import { week2 } from './week2.js';
import { week3 } from './week3.js';
import { week4 } from './week4.js';
import { week5 } from './week5.js';
import { week6 } from './week6.js';
import { week7 } from './week7.js';
import { week8 } from './week8.js';

export const curriculum = [
  { ...week1, color: '#FFD43B' },
  { ...week2, color: '#7CE38B' },
  { ...week3, color: '#5CC8FF' },
  { ...week4, color: '#B48CFF' },
  { ...week5, color: '#FF8DC7' },
  { ...week6, color: '#FF9F5A' },
  { ...week7, color: '#4FE0C0' },
  { ...week8, color: '#FF6B6B' },
];

export const TRACK_PRESETS = [
  {
    id: 'all',
    name: 'Full-Stack Software Engineering',
    icon: '⚡',
    tagline: 'Complete 8-Module Journey',
    desc: 'The comprehensive journey covering foundational coding, clean architecture, 2D graphics, and machine learning pipelines.',
    weeks: [1, 2, 3, 4, 5, 6, 7, 8],
  },
  {
    id: 'datascience',
    name: 'Data Science & Machine Learning',
    icon: '📊',
    tagline: 'AI & Data Career Track',
    desc: 'Skip game development to focus deeply on data structures, web APIs, scikit-learn models, and production ML pipelines.',
    weeks: [1, 2, 4, 7, 8],
  },
  {
    id: 'gamedev',
    name: 'Game Development & Graphics',
    icon: '🎮',
    tagline: 'Creative 2D Engineering',
    desc: 'Focus on object-oriented programming, real-time 60fps loops, vector physics, collision algorithms, and sprite capstones.',
    weeks: [1, 2, 3, 5, 6],
  },
  {
    id: 'backend',
    name: 'Backend & System Automation',
    icon: '🛠️',
    tagline: 'Services & Scripting Track',
    desc: 'Master foundational syntax, data structures, OOP patterns, and fault-tolerant REST API / JSON file handling.',
    weeks: [1, 2, 3, 4],
  },
  {
    id: 'custom',
    name: 'Custom Self-Directed Journey',
    icon: '🧭',
    tagline: 'User-Selected Modules',
    desc: 'Choose your own custom combination of modules and learn completely at your own pace.',
    weeks: [],
  },
];

export const allLessons = curriculum.flatMap((w) => w.lessons.map((l) => ({ ...l, week: w.id })));

export function findLesson(id) {
  return allLessons.find((l) => l.id === id);
}

/**
 * Validates whether a lesson is unlocked for the user.
 * Supports:
 * 1. Open Access Mode (any module in the user's journey is accessible immediately).
 * 2. Guided Mode (requires previous modules in the user's active journey to be completed).
 */
export function isUnlocked(id, doneIds = [], journey = null) {
  if (journey?.openAccess) return true;

  const activeWeeks = journey?.activeWeeks || [1, 2, 3, 4, 5, 6, 7, 8];
  const activeLessons = allLessons.filter((l) => activeWeeks.includes(l.week));

  const idx = activeLessons.findIndex((l) => l.id === id);
  if (idx <= 0) return true;

  return activeLessons.slice(0, idx).every((l) => doneIds.includes(l.id));
}
