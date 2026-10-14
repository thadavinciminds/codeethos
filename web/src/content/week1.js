// Week 1 lesson content: Foundations & Interactive CLI.
// Step types: concept | predict | challenge | quiz
// Python code uses the `py` tag (String.raw + trim) so backslashes stay intact.

const py = (s, ...v) => String.raw(s, ...v).replace(/^\n/, '').replace(/\s+$/, '') + '\n';

export const week1 = {
  id: 1,
  title: 'Foundations & Interactive CLI',
  lessons: [
    // ─────────────────────────────── 1.1
    {
      id: '1.1',
      title: 'Hello World & Variables',
      emoji: '👋',
      minutes: 8,
      steps: [
        {
          type: 'concept',
          title: 'Your first line of Python',
          body: `<p><code>print()</code> shows text on the screen. Text goes inside quotes and is called a <b>string</b>.</p>
<p>Press <kbd>▶ Run</kbd> (or <kbd>Ctrl</kbd>+<kbd>Enter</kbd>) to run the code on the right. Then change the message and run it again!</p>`,
          code: py`
print("Hello, Python!")
print("I am learning fast 🚀")
`,
        },
        {
          type: 'concept',
          title: 'Variables & data types',
          body: `<p>A <b>variable</b> is a labelled box that stores a value. Use <code>=</code> to put a value in the box.</p>
<ul>
<li><code>str</code> – text: <code>"Ada"</code></li>
<li><code>int</code> – whole number: <code>36</code></li>
<li><code>float</code> – decimal: <code>1.75</code></li>
<li><code>bool</code> – <code>True</code> / <code>False</code></li>
</ul>
<p><code>type(x)</code> tells you what kind of value <code>x</code> holds. Run it!</p>`,
          code: py`
name = "Ada"
age = 36
height = 1.75
is_coder = True

print(name, type(name))
print(age, type(age))
print(height, type(height))
print(is_coder, type(is_coder))
`,
        },
        {
          type: 'concept',
          title: 'Asking the user: input()',
          body: `<p><code>input("prompt")</code> pauses and waits for the user to type something.</p>
<p>In this app, what the user "types" comes from the <b>Input box</b> under the editor — one line per <code>input()</code> call.</p>
<div class="callout warn"><b>⚠ Pitfall:</b> <code>input()</code> <u>always</u> returns a <code>str</code>, even if the user types a number!</div>`,
          code: py`
name = input("What is your name? ")
print("Nice to meet you, " + name + "!")
`,
          stdin: 'Ada',
        },
        {
          type: 'predict',
          title: 'Predict the output',
          code: py`
age = input("Age? ")   # user types 20
print(age + "1")
`,
          question: 'The user types <code>20</code>. What gets printed?',
          options: ['21', '201', 'TypeError', '20 1'],
          answer: 1,
          explain: '<code>input()</code> returns the string <code>"20"</code>. Adding two strings <b>joins</b> them: <code>"20" + "1"</code> → <code>"201"</code>.',
        },
        {
          type: 'predict',
          title: 'Predict the output',
          code: py`
age = 20
print("Age: " + age)
`,
          question: 'What happens?',
          options: ['Age: 20', 'Age:20', 'TypeError', 'Age: age'],
          answer: 2,
          explain: 'You cannot <code>+</code> a <code>str</code> and an <code>int</code>. Fix it with <code>str(age)</code> or an f-string: <code>f"Age: {age}"</code>.',
        },
        {
          type: 'concept',
          title: 'Converting types & f-strings',
          body: `<p>Convert between types with <code>int()</code>, <code>float()</code> and <code>str()</code>.</p>
<p>The easiest way to mix text and numbers is an <b>f-string</b>: put <code>f</code> before the quotes and variables inside <code>{ }</code>.</p>`,
          code: py`
age_text = input("Age? ")
age = int(age_text)          # str -> int
print("In 5 years:", age + 5)
print(f"You are {age} now, {age + 5} in 5 years.")
`,
          stdin: '30',
        },
        {
          type: 'challenge',
          title: 'Challenge: Birthday greeting',
          body: `<p>Write a program that:</p>
<ol>
<li>Asks for the user's <b>name</b></li>
<li>Asks for the user's <b>age</b></li>
<li>Prints exactly: <code>Hello, Ada! Next year you will be 37.</code></li>
</ol>
<p>Fill in the <code># TODO</code> lines. Press <b>✓ Check</b> to run the hidden tests.</p>`,
          starter: py`
# 1. Ask for the name
name = # TODO

# 2. Ask for the age (remember: input() gives you a string!)
age = # TODO

# 3. Print the greeting
# TODO
`,
          stdin: 'Ada\n36',
          tests: [
            { name: 'Greets Ada (36 → 37)', stdin: 'Ada\n36', check: py`
assert "Hello, Ada!" in output, "Expected 'Hello, Ada!' in the output"
assert "Next year you will be 37." in output, "Expected 'Next year you will be 37.'"
` },
            { name: 'Greets Bob (9 → 10)', stdin: 'Bob\n9', check: py`
assert "Hello, Bob! Next year you will be 10." in output, "Expected 'Hello, Bob! Next year you will be 10.'"
` },
          ],
          hints: [
            'Use <code>input("...")</code> twice. What type does it return?',
            'Convert the age with <code>int(...)</code> before adding 1.',
            'An f-string makes the last line easy: <code>print(f"Hello, {name}! ...")</code>',
          ],
          solution: py`
name = input("What is your name? ")
age = int(input("How old are you? "))
print(f"Hello, {name}! Next year you will be {age + 1}.")
`,
        },
      ],
    },

    // ─────────────────────────────── 1.2
    {
      id: '1.2',
      title: 'Control Flow & Logic',
      emoji: '🔀',
      minutes: 12,
      steps: [
        {
          type: 'concept',
          title: 'Comparisons & booleans',
          body: `<p>Comparisons produce <code>True</code> or <code>False</code>:</p>
<table class="mini"><tr><td><code>==</code></td><td>equal</td><td><code>!=</code></td><td>not equal</td></tr>
<tr><td><code>&lt;</code> <code>&gt;</code></td><td>less / greater</td><td><code>&lt;=</code> <code>&gt;=</code></td><td>or equal</td></tr></table>
<p>Combine them with <code>and</code>, <code>or</code>, <code>not</code>.</p>
<div class="callout warn"><b>⚠ Pitfall:</b> <code>=</code> <u>stores</u> a value, <code>==</code> <u>compares</u>.</div>`,
          code: py`
x = 7
print(x == 7)
print(x != 7)
print(x > 3 and x < 10)
print(x < 3 or x == 7)
print(not x == 7)
`,
        },
        {
          type: 'concept',
          title: 'if / elif / else',
          body: `<p>Run different code depending on a condition. Two rules:</p>
<ol><li>The <code>if</code> line ends with a colon <code>:</code></li>
<li>The code inside is <b>indented 4 spaces</b></li></ol>
<p>Python checks top to bottom and runs only the <b>first</b> true branch. Try different scores in the Input box!</p>`,
          code: py`
score = int(input("Score? "))

if score >= 90:
    print("A - excellent!")
elif score >= 70:
    print("B - good job")
else:
    print("Keep practicing")
print("Done")   # not indented: always runs
`,
          stdin: '85',
        },
        {
          type: 'predict',
          title: 'Predict the output',
          code: py`
temp = 25
if temp > 30:
    print("hot")
elif temp > 20:
    print("warm")
elif temp > 10:
    print("mild")
else:
    print("cold")
`,
          question: 'What is printed?',
          options: ['hot', 'warm', 'warm and mild', 'mild'],
          answer: 1,
          explain: '25 > 30 is False; 25 > 20 is True → prints <b>warm</b> and skips the rest. Only the first true branch runs.',
        },
        {
          type: 'concept',
          title: 'while loops',
          body: `<p>A <code>while</code> loop repeats its block <b>as long as</b> the condition is True.</p>
<div class="callout warn"><b>⚠ Pitfall:</b> If the condition never becomes False you get an <b>infinite loop</b>. (Don't worry — this app stops code after 6 seconds.)</div>`,
          code: py`
count = 3
while count > 0:
    print(count, "...")
    count = count - 1    # try deleting this line!
print("Lift off! 🚀")
`,
        },
        {
          type: 'predict',
          title: 'Predict the output',
          code: py`
n = 1
total = 0
while n <= 4:
    total = total + n
    n = n + 1
print(total)
`,
          question: 'What is printed?',
          options: ['4', '6', '10', '15'],
          answer: 2,
          explain: 'total = 1 + 2 + 3 + 4 = <b>10</b>. When n becomes 5, <code>n &lt;= 4</code> is False and the loop stops.',
        },
        {
          type: 'challenge',
          title: 'Challenge: Guess the number',
          body: `<p>The secret number is <code>7</code>. Keep asking for guesses until the user gets it.</p>
<ul>
<li>Guess too small → print <code>Too low</code></li>
<li>Guess too big → print <code>Too high</code></li>
<li>Correct → print <code>Correct! You took 3 tries.</code> (with the real count)</li>
</ul>`,
          starter: py`
secret = 7
tries = 0
guess = 0

while  # TODO: loop while the guess is wrong
    guess = int(input("Your guess: "))
    tries = tries + 1
    # TODO: if / elif to print "Too low" or "Too high"

# TODO: print the success message with the number of tries
`,
          stdin: '3\n9\n7',
          tests: [
            { name: 'Low, high, then correct', stdin: '3\n9\n7', check: py`
assert "Too low" in output, "A guess of 3 should print 'Too low'"
assert "Too high" in output, "A guess of 9 should print 'Too high'"
assert "Correct! You took 3 tries." in output, "Expected 'Correct! You took 3 tries.'"
` },
            { name: 'Correct on first try', stdin: '7', check: py`
assert "Correct! You took 1 tries." in output, "Expected 'Correct! You took 1 tries.'"
assert "Too" not in output, "Should not print Too low/high when the first guess is right"
` },
            { name: 'Many low guesses', stdin: '1\n2\n3\n4\n7', check: py`
assert output.count("Too low") == 4, "Expected 'Too low' four times"
assert "You took 5 tries." in output
` },
          ],
          hints: [
            'The loop should keep going while <code>guess != secret</code>. Don\'t forget the colon!',
            'Inside the loop: <code>if guess &lt; secret:</code> … <code>elif guess &gt; secret:</code> …',
            'After the loop ends, the guess must be right. Use an f-string: <code>f"Correct! You took {tries} tries."</code>',
          ],
          solution: py`
secret = 7
tries = 0
guess = 0

while guess != secret:
    guess = int(input("Your guess: "))
    tries = tries + 1
    if guess < secret:
        print("Too low")
    elif guess > secret:
        print("Too high")

print(f"Correct! You took {tries} tries.")
`,
        },
        {
          type: 'quiz',
          title: 'Quiz: Boolean logic',
          passScore: 4,
          questions: [
            { q: 'What is <code>True and False</code>?', options: ['True', 'False', 'None', 'Error'], answer: 1, explain: '<code>and</code> is True only if <b>both</b> sides are True.' },
            { q: 'What is <code>not (5 &gt; 3) or 2 == 2</code>?', options: ['True', 'False', 'Error', '2'], answer: 0, explain: '<code>not True</code> → False; <code>False or True</code> → <b>True</b>.' },
            { q: 'Which line has a bug?', code: py`
x = 10
if x = 10:
    print("ten")
`, options: ['Line 1', 'Line 2', 'Line 3', 'No bug'], answer: 1, explain: 'Line 2 uses <code>=</code> (assignment). A condition needs <code>==</code>.' },
            { q: 'What does <code>10 != 10.0</code> evaluate to?', options: ['True', 'False', 'TypeError', 'None'], answer: 1, explain: 'Python compares the values: 10 equals 10.0, so <code>!=</code> is <b>False</b>.' },
            { q: 'How many times does "hi" print?', code: py`
i = 0
while i < 3:
    print("hi")
    i = i + 1
`, options: ['2', '3', '4', 'Forever'], answer: 1, explain: 'i takes the values 0, 1, 2 → <b>3</b> times. At i = 3 the condition is False.' },
          ],
        },
      ],
    },

    // ─────────────────────────────── 1.3
    {
      id: '1.3',
      title: 'Project: Smart CLI Calculator',
      emoji: '🧮',
      minutes: 20,
      project: true,
      steps: [
        {
          type: 'concept',
          title: 'Handling errors with try / except',
          body: `<p>When something goes wrong Python raises an <b>exception</b> and your program crashes… unless you catch it!</p>
<ul><li><code>ValueError</code> – e.g. <code>float("abc")</code></li>
<li><code>ZeroDivisionError</code> – e.g. <code>5 / 0</code></li></ul>
<div class="callout warn"><b>⚠ Pitfall:</b> Always catch <b>specific</b> exceptions. A bare <code>except:</code> hides real bugs.</div>
<p>Try typing <code>abc</code> or <code>0</code> in the Input box.</p>`,
          code: py`
text = input("Divide 10 by: ")
try:
    number = float(text)
    print("Result:", 10 / number)
except ValueError:
    print("That's not a number!")
except ZeroDivisionError:
    print("You can't divide by zero!")
`,
          stdin: 'abc',
        },
        {
          type: 'concept',
          title: 'while True, break & pass',
          body: `<p><code>while True:</code> loops <b>forever</b> — until a <code>break</code> jumps out. Perfect for apps that keep running until the user quits.</p>
<p><code>pass</code> means "do nothing". Use it as a placeholder while you build your code step by step.</p>
<p>And <code>.split()</code> breaks text into parts: <code>"3 + 4".split()</code> → <code>['3', '+', '4']</code>.</p>`,
          code: py`
while True:
    command = input("> ")
    if command == "exit":
        print("Bye!")
        break
    elif command == "todo":
        pass   # feature coming soon
    else:
        print("You typed:", command.split())
`,
          stdin: 'hello world\n3 + 4\ntodo\nexit',
        },
        {
          type: 'predict',
          title: 'Predict the output',
          code: py`
parts = "12 * 3".split()
a = float(parts[0])
b = float(parts[2])
print(a * b)
`,
          question: 'What is printed?',
          options: ['36', '36.0', '12 * 3', '1212 12'],
          answer: 1,
          explain: '<code>float()</code> makes decimals, so <code>12.0 * 3.0</code> → <b>36.0</b>.',
        },
        {
          type: 'challenge',
          title: 'Project: Smart CLI Calculator',
          body: `<p>Build a calculator that never crashes. Each input line looks like <code>3 + 4</code>.</p>
<p><b>Acceptance criteria</b></p>
<ul>
<li>Uses a <code>while True:</code> loop that only stops on <code>exit</code> (print <code>Goodbye!</code>)</li>
<li>Supports <code>+ - * /</code> and prints the result like <code>= 7.0</code></li>
<li>Letters instead of numbers → <code>Error: please enter numbers</code></li>
<li>Division by zero → <code>Error: cannot divide by zero</code></li>
<li>Unknown operator → <code>Error: unknown operator</code></li>
<li>Not 3 parts → <code>Error: use format: number operator number</code></li>
</ul>`,
          starter: py`
print("Smart Calculator - type 'exit' to quit")

while True:
    line = input("> ")

    # TODO 1: if the user typed "exit", say Goodbye! and break

    parts = line.split()
    # TODO 2: if there are not exactly 3 parts, print the format error
    #         and use 'continue' to ask again

    try:
        a = float(parts[0])
        op = parts[1]
        b = float(parts[2])

        # TODO 3: compute the result for + - * /
        #         (unknown operator -> print error and continue)
        pass

        print(f"= {result}")
    except ValueError:
        pass  # TODO 4: print the numbers error
    # TODO 5: catch ZeroDivisionError
`,
          stdin: '3 + 4\n10 / 0\nabc * 2\nexit',
          tests: [
            { name: 'Uses a while True: loop', check: py`
assert "while True" in source, "The calculator must use a 'while True:' loop"
` , stdin: 'exit' },
            { name: 'exit quits with Goodbye!', stdin: 'exit', check: py`
assert "Goodbye!" in output, "Typing exit should print 'Goodbye!'"
` },
            { name: 'Addition: 3 + 4', stdin: '3 + 4\nexit', check: py`
assert "= 7" in output, "3 + 4 should print '= 7.0'"
` },
            { name: 'All operators', stdin: '10 - 4\n6 * 7\n9 / 3\nexit', check: py`
assert "= 6" in output, "10 - 4 should be 6"
assert "= 42" in output, "6 * 7 should be 42"
assert "= 3" in output, "9 / 3 should be 3"
` },
            { name: 'Edge case: letters', stdin: 'abc + 2\n5 * xyz\nexit', check: py`
assert output.count("Error: please enter numbers") == 2, "Letters should print 'Error: please enter numbers'"
assert "Goodbye!" in output, "The program must keep running after bad input"
` },
            { name: 'Edge case: divide by zero', stdin: '5 / 0\nexit', check: py`
assert "Error: cannot divide by zero" in output, "Expected 'Error: cannot divide by zero'"
` },
            { name: 'Edge case: unknown operator', stdin: '2 ^ 3\nexit', check: py`
assert "Error: unknown operator" in output, "Expected 'Error: unknown operator'"
` },
            { name: 'Edge case: wrong format', stdin: 'hello\n1 +\n\nexit', check: py`
assert output.count("Error: use format") == 3, "Inputs without 3 parts should print the format error"
` },
          ],
          hints: [
            'Check <code>if line == "exit":</code> first, then <code>print("Goodbye!")</code> and <code>break</code>. For the format check use <code>len(parts) != 3</code>.',
            'Use <code>if op == "+":</code> / <code>elif op == "-":</code> … and an <code>else:</code> that prints the operator error and does <code>continue</code>.',
            'Add a second handler after the first: <code>except ZeroDivisionError:</code> — Python raises it automatically when you do <code>a / 0</code>.',
          ],
          solution: py`
print("Smart Calculator - type 'exit' to quit")

while True:
    line = input("> ")

    if line == "exit":
        print("Goodbye!")
        break

    parts = line.split()
    if len(parts) != 3:
        print("Error: use format: number operator number")
        continue

    try:
        a = float(parts[0])
        op = parts[1]
        b = float(parts[2])

        if op == "+":
            result = a + b
        elif op == "-":
            result = a - b
        elif op == "*":
            result = a * b
        elif op == "/":
            result = a / b
        else:
            print("Error: unknown operator")
            continue

        print(f"= {result}")
    except ValueError:
        print("Error: please enter numbers")
    except ZeroDivisionError:
        print("Error: cannot divide by zero")
`,
        },
      ],
    },
  ],
};
