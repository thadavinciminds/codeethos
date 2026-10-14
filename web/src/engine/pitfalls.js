// Pitfall detector: static checks for high-frequency beginner mistakes,
// plus friendly explanations of Python runtime errors.

const BLOCK_KEYWORDS = /^\s*(if|elif|else|while|for|def|class|try|except|finally|with)\b/;
const SHADOWED = ['list', 'str', 'int', 'float', 'dict', 'input', 'print', 'sum', 'max', 'min', 'type', 'len', 'id', 'range', 'set'];

function stripComment(line) {
  // naive but good enough: drop text after a # that is not inside quotes
  let inS = null;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inS) {
      if (c === inS) inS = null;
    } else if (c === '"' || c === "'") inS = c;
    else if (c === '#') return line.slice(0, i);
  }
  return line;
}

export function detectPitfalls(code) {
  const warnings = [];
  const lines = code.split('\n');
  let sawTab = false;
  let sawSpace = false;
  let open = 0; // bracket depth to skip multi-line expressions

  lines.forEach((raw, i) => {
    const n = i + 1;
    const line = stripComment(raw).replace(/\s+$/, '');
    const indent = raw.match(/^[ \t]*/)[0];
    if (indent.includes('\t')) sawTab = true;
    if (indent.includes(' ')) sawSpace = true;
    if (indent.includes('\t') && indent.includes(' ')) {
      warnings.push({ line: n, id: 'tabs', title: 'Mixed tabs and spaces', text: 'This line mixes tabs and spaces in its indentation. Python will raise a TabError. Use 4 spaces everywhere.' });
    }
    if (!line.trim()) return;

    if (open === 0 && BLOCK_KEYWORDS.test(line) && !line.endsWith(':') && !line.endsWith('\\') && !/[([{,]$/.test(line)) {
      const kw = line.trim().split(/[\s(:]/)[0];
      warnings.push({ line: n, id: 'colon', title: 'Missing colon', text: `Lines that start a block (\`${kw}\`) must end with a colon \`:\`.` });
    }
    if (/^\s*(if|elif|while)\b/.test(line)) {
      const cond = line.replace(/:$/, '');
      if (/[^=!<>]=[^=]/.test(cond)) {
        warnings.push({ line: n, id: 'assign', title: '`=` used instead of `==`', text: '`=` stores a value; `==` compares two values. Inside a condition you almost always want `==`.' });
      }
    }
    const shadow = line.match(new RegExp(`^\\s*(${SHADOWED.join('|')})\\s*=[^=]`));
    if (shadow) {
      warnings.push({ line: n, id: 'shadow', title: `Shadowing built-in \`${shadow[1]}\``, text: `Naming a variable \`${shadow[1]}\` hides Python's built-in \`${shadow[1]}()\` function. Pick a more descriptive name like \`user_${shadow[1]}\`.` });
    }
    if (/\bis\s+(not\s+)?(['"]|-?\d)/.test(line)) {
      warnings.push({ line: n, id: 'is', title: '`is` used to compare values', text: '`is` checks if two things are the *same object*. To compare values (numbers, strings) use `==`. Only use `is` with `None`, `True`, `False`.' });
    }
    if (/^\s*def\s+\w+\(.*=\s*(\[\]|\{\}|list\(\)|dict\(\))/.test(line)) {
      warnings.push({ line: n, id: 'mutable', title: 'Mutable default argument', text: 'A default like `[]` is created once and shared between calls. Use `None` and create the list inside the function.' });
    }
    if (/^\s*global\s+/.test(line)) {
      warnings.push({ line: n, id: 'global', title: 'Global variable', text: 'Using `global` makes code hard to follow. Prefer passing values into functions and returning results.' });
    }
    for (const ch of line) {
      if ('([{'.includes(ch)) open++;
      else if (')]}'.includes(ch)) open = Math.max(0, open - 1);
    }
  });

  if (sawTab && sawSpace && !warnings.some((w) => w.id === 'tabs')) {
    warnings.push({ line: 0, id: 'tabs', title: 'Mixed tabs and spaces', text: 'Your file uses both tabs and spaces for indentation. Use 4 spaces everywhere.' });
  }
  return warnings;
}

const ERROR_HELP = [
  { type: 'SyntaxError', match: /expected ':'/, text: 'You forgot a colon `:` at the end of an `if`, `while`, `for`, `def`… line.' },
  { type: 'SyntaxError', match: /invalid syntax\. Maybe you meant '==' or ':='/, text: 'You used `=` (assign) where Python expected `==` (compare).' },
  { type: 'SyntaxError', match: /unterminated string/, text: 'A string is missing its closing quote.' },
  { type: 'SyntaxError', match: /never closed|unmatched/, text: 'A bracket `( [ {` is not closed (or closed twice).' },
  { type: 'SyntaxError', match: /.*/, text: 'Python could not understand the grammar of this line. Check colons, quotes and brackets.' },
  { type: 'IndentationError', match: /expected an indented block/, text: 'After a line ending with `:`, the next line must be indented (4 spaces).' },
  { type: 'IndentationError', match: /unexpected indent/, text: 'This line is indented but should not be. Line it up with the code around it.' },
  { type: 'IndentationError', match: /.*/, text: 'Indentation does not line up. Python uses indentation to know which lines belong to a block.' },
  { type: 'TabError', match: /.*/, text: 'You mixed tabs and spaces. Use 4 spaces everywhere.' },
  { type: 'TypeError', match: /can only concatenate str/, text: 'You tried to join a string and a number with `+`. Convert the number with `str(x)` or use an f-string: `f"Age: {x}"`.' },
  { type: 'TypeError', match: /unsupported operand/, text: 'You used an operator on incompatible types — often a number stored as text. `input()` always returns a string; convert with `int()` or `float()`.' },
  { type: 'TypeError', match: /.*/, text: 'A value has the wrong type for this operation.' },
  { type: 'NameError', match: /.*/, text: 'You used a name Python does not know. Check spelling (Python is case-sensitive) and that the variable is created before it is used.' },
  { type: 'ValueError', match: /invalid literal for int|could not convert string to float/, text: '`int()`/`float()` got text that is not a number. Wrap it in `try/except ValueError`.' },
  { type: 'ZeroDivisionError', match: /.*/, text: 'You divided by zero. Check the divisor first or catch `ZeroDivisionError`.' },
  { type: 'EOFError', match: /.*/, text: 'Your program asked for more `input()` than there are lines in the Input box. Add more lines, or make sure your loop stops.' },
  { type: 'Timeout', match: /.*/, text: 'Probably an infinite loop: the loop condition never became False, or `break` was never reached.' },
];

export function explainError(type, msg = '') {
  const hit = ERROR_HELP.find((h) => h.type === type && h.match.test(msg));
  return hit ? hit.text : '';
}
