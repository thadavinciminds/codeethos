// Dumps lesson content to JSON so pytest can verify every challenge.
import { writeFileSync, mkdirSync } from 'node:fs';
import { week1 } from '../src/content/week1.js';
import { week2 } from '../src/content/week2.js';
import { week3 } from '../src/content/week3.js';
import { week4 } from '../src/content/week4.js';
import { week5 } from '../src/content/week5.js';
import { week6 } from '../src/content/week6.js';
import { week7 } from '../src/content/week7.js';
import { week8 } from '../src/content/week8.js';

mkdirSync('tests/.cache', { recursive: true });
writeFileSync('tests/.cache/content.json', JSON.stringify([week1, week2, week3, week4, week5, week6, week7, week8], null, 2));
console.log('content dumped');
