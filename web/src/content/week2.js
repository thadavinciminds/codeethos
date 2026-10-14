// Week 2 lesson content: Data Structures & Clean Code.
// Step types: concept | predict | challenge | quiz
// Python code uses the `py` tag (String.raw + trim) so backslashes stay intact.

const py = (s, ...v) => String.raw(s, ...v).replace(/^\n/, '').replace(/\s+$/, '') + '\n';

export const week2 = {
  id: 2,
  title: 'Data Structures & Clean Code',
  lessons: [
    // ─────────────────────────────── 2.1
    {
      id: '2.1',
      title: 'Lists & Iterables',
      emoji: '📜',
      minutes: 10,
      steps: [
        {
          type: 'concept',
          title: 'Ordered collections: Lists',
          body: `<p>A <b>list</b> stores multiple items in order using square brackets <code>[ ]</code>.</p>
<p>Items can be accessed by their index starting at <code>0</code>, or from the end using negative numbers like <code>-1</code>.</p>
<p>Add new items to the end using <code>.append()</code>.</p>`,
          code: py`
languages = ["Python", "JavaScript", "Rust"]
print("First:", languages[0])
print("Last:", languages[-1])

languages.append("Go")
print("All languages:", languages)
print("Count:", len(languages))
`,
        },
        {
          type: 'predict',
          title: 'Predict the output',
          code: py`
scores = [90, 85, 78]
print(scores[3])
`,
          question: 'What happens when this runs?',
          options: ['None', '0', 'IndexError', '78'],
          answer: 2,
          explain: 'A list with 3 items has indices <code>0</code>, <code>1</code>, and <code>2</code>. Asking for index <code>3</code> raises an <code>IndexError: list index out of range</code>.',
        },
        {
          type: 'concept',
          title: 'List Slicing [start:stop:step]',
          body: `<p><b>Slicing</b> extracts a sub-list using <code>[start:stop:step]</code>.</p>
<ul>
<li><code>start</code> is inclusive (default 0).</li>
<li><code>stop</code> is <b>exclusive</b> (the item at <code>stop</code> is not included).</li>
<li><code>step</code> is how many items to jump (default 1; <code>-1</code> reverses!).</li>
</ul>`,
          code: py`
letters = ["a", "b", "c", "d", "e", "f"]

print("letters[1:4] ->", letters[1:4])   # items 1, 2, 3
print("letters[:3]  ->", letters[:3])    # first 3 items
print("letters[::2] ->", letters[::2])   # every 2nd item
print("letters[::-1]->", letters[::-1])  # reversed!
`,
        },
        {
          type: 'predict',
          title: 'Predict the output',
          code: py`
nums = [10, 20, 30, 40, 50]
sub = nums[2:-1]
print(sub)
`,
          question: 'What is the value of <code>sub</code>?',
          options: ['[30, 40, 50]', '[30, 40]', '[20, 30, 40]', '[30]'],
          answer: 1,
          explain: 'Index <code>2</code> is <code>30</code>. Index <code>-1</code> is <code>50</code> (exclusive, so not included). The slice contains <b>[30, 40]</b>.',
        },
        {
          type: 'concept',
          title: 'for loops & List Comprehensions',
          body: `<p>A <code>for</code> loop iterates over each item in a collection.</p>
<p>Python offers a concise syntax called a <b>List Comprehension</b> to build new lists from existing ones: <code>[expression for item in iterable if condition]</code>.</p>`,
          code: py`
# Traditional loop
squares = []
for n in range(1, 6):
    squares.append(n * n)
print("Standard loop:", squares)

# Refactored as List Comprehension (Pythonic!)
comp_squares = [n * n for n in range(1, 6)]
print("Comprehension:", comp_squares)
`,
        },
        {
          type: 'challenge',
          title: 'Challenge: Filter and Square Evens',
          body: `<p>Given a list of numbers, create a new list containing only the <b>squares of the even numbers</b>.</p>
<ul>
<li>Use a <b>list comprehension</b> with an <code>if</code> condition.</li>
<li>Check if a number is even with <code>n % 2 == 0</code>.</li>
<li>Print the resulting list.</li>
</ul>`,
          starter: py`
numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

# TODO: Create 'even_squares' using a list comprehension:
# [n * n for n in numbers if ...]
even_squares = []

print(even_squares)
`,
          tests: [
            {
              name: 'Result list matches expected even squares',
              check: py`
assert even_squares == [4, 16, 36, 64, 100], f"Expected [4, 16, 36, 64, 100], got {even_squares}"
`,
            },
            {
              name: 'Uses a list comprehension',
              check: py`
assert "[" in source and "for" in source and "if" in source, "Must use a list comprehension with 'for' and 'if'"
assert ".append(" not in source, "Do not use .append(), use list comprehension syntax"
`,
            },
            {
              name: 'Output is printed',
              check: py`
assert "[4, 16, 36, 64, 100]" in output, "Expected the list [4, 16, 36, 64, 100] to be printed"
`,
            },
          ],
          hints: [
            'A list comprehension takes the shape: <code>[n * n for n in numbers if condition]</code>.',
            'An even number satisfies <code>n % 2 == 0</code> (modulo 2 equals 0).',
            'Put them together: <code>even_squares = [n * n for n in numbers if n % 2 == 0]</code>.',
          ],
          solution: py`
numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

even_squares = [n * n for n in numbers if n % 2 == 0]

print(even_squares)
`,
        },
        {
          type: 'quiz',
          title: 'Quiz: Lists and Comprehensions',
          passScore: 4,
          questions: [
            {
              q: 'What is the index of the first element in a Python list?',
              options: ['-1', '0', '1', 'None'],
              answer: 1,
              explain: 'Python lists are zero-indexed, so the first element is at index <code>0</code>.',
            },
            {
              q: 'What does <code>[1, 2, 3][-1]</code> return?',
              options: ['1', '2', '3', 'IndexError'],
              answer: 2,
              explain: 'Negative indices count backwards from the end: <code>-1</code> is the last element (<code>3</code>).',
            },
            {
              q: 'What does <code>"python"[:: -1]</code> produce?',
              options: ['"python"', '"nohtyp"', '"p"', 'SyntaxError'],
              answer: 1,
              explain: 'A step of <code>-1</code> reverses any sequence, returning <code>"nohtyp"</code>.',
            },
            {
              q: 'Which expression correctly filters odd numbers from <code>nums</code>?',
              options: [
                '[x for x in nums if x % 2 != 0]',
                '[if x % 2 != 0 for x in nums]',
                '[x if x % 2 != 0 for x in nums]',
                'nums.filter(lambda x: x % 2 != 0)',
              ],
              answer: 0,
              explain: 'In a filtering comprehension, the <code>if</code> clause goes at the end: <code>[x for x in nums if x % 2 != 0]</code>.',
            },
            {
              q: 'What happens when you run <code>a = [1, 2]; b = a; b.append(3)</code>?',
              options: [
                'Only b has 3',
                'Both a and b have [1, 2, 3]',
                'TypeError: cannot mutate',
                'a is empty',
              ],
              answer: 1,
              explain: 'Lists are mutable objects. <code>b = a</code> does not copy the list; both variables reference the same list in memory.',
            },
          ],
        },
      ],
    },

    // ─────────────────────────────── 2.2
    {
      id: '2.2',
      title: 'Dictionaries & Data Mapping',
      emoji: '🗺️',
      minutes: 12,
      steps: [
        {
          type: 'concept',
          title: 'Key-Value pairs: Dictionaries',
          body: `<p>A <b>dictionary</b> maps unique <b>keys</b> to <b>values</b> using curly braces <code>{key: value}</code>.</p>
<p>Lookup by key is near instantaneous (O(1)). Keys are typically strings or integers.</p>`,
          code: py`
user = {
    "name": "Grace Hopper",
    "role": "Computer Scientist",
    "year": 1906
}

print(user["name"])
user["rank"] = "Admiral"   # add a new key
print(user)
`,
        },
        {
          type: 'concept',
          title: 'Safe lookups with .get()',
          body: `<p>Accessing a key that does not exist with brackets like <code>d["missing"]</code> raises a <code>KeyError</code> and crashes your script.</p>
<p>Use <code>.get(key, default)</code> to safely fetch a value without crashing:</p>`,
          code: py`
stock = {"apples": 10, "bananas": 5}

# Safe lookup with default fallback
oranges = stock.get("oranges", 0)
print("Oranges in stock:", oranges)

# Without default, it returns None
print("Pears:", stock.get("pears"))
`,
        },
        {
          type: 'predict',
          title: 'Predict the output',
          code: py`
scores = {"Alice": 95, "Bob": 80}
print(scores.get("Charlie", 50))
print(scores.get("Alice", 50))
`,
          question: 'What gets printed?',
          options: ['50 then 50', '50 then 95', 'KeyError then 95', 'None then 95'],
          answer: 1,
          explain: '"Charlie" is not in the dictionary, so <code>.get()</code> returns the default <code>50</code>. "Alice" exists, so it returns her real score <code>95</code>.',
        },
        {
          type: 'concept',
          title: 'Iterating over dictionaries',
          body: `<p>You can loop over keys, values, or both at once using <code>.items()</code>:</p>
<ul>
<li><code>for key in d:</code> loops over keys.</li>
<li><code>for val in d.values():</code> loops over values.</li>
<li><code>for key, val in d.items():</code> unpacks key and value together!</li>
</ul>`,
          code: py`
inventory = {"pencil": 12, "notebook": 4, "eraser": 7}

for item, count in inventory.items():
    print(f"{item.capitalize()}: {count} in stock")
`,
        },
        {
          type: 'predict',
          title: 'Predict the output',
          code: py`
counts = {"a": 1, "b": 2}
for k in counts:
    print(k, end=" ")
`,
          question: 'What does looping directly over <code>counts</code> yield?',
          options: ['1 2', 'a b', '("a", 1) ("b", 2)', 'KeyError'],
          answer: 1,
          explain: 'Looping directly over a dictionary (<code>for k in counts</code>) iterates over its <b>keys</b>: <code>a b</code>.',
        },
        {
          type: 'challenge',
          title: 'Challenge: Word Frequency Counter',
          body: `<p>Write a program that counts how many times each word appears in a sentence.</p>
<ul>
<li>Convert the sentence to lowercase and split it into words using <code>.lower().split()</code>.</li>
<li>Use a dictionary named <code>frequencies</code>.</li>
<li>Use <code>.get(word, 0) + 1</code> to increment counts safely.</li>
<li>Print the final <code>frequencies</code> dictionary.</li>
</ul>`,
          starter: py`
text = "Python is great and python is fun and python is fast"

# TODO 1: normalize text to lowercase and split into words
words = []

frequencies = {}
# TODO 2: loop over each word and update its count in 'frequencies' using .get()

print(frequencies)
`,
          tests: [
            {
              name: 'Counts matches expected word frequencies',
              check: py`
expected = {"python": 3, "is": 3, "great": 1, "and": 2, "fun": 1, "fast": 1}
assert frequencies == expected, f"Expected {expected}, got {frequencies}"
`,
            },
            {
              name: 'Used .lower() and .split()',
              check: py`
assert ".lower()" in source or ".lower ()" in source, "Must convert words to lowercase"
assert ".split()" in source or ".split (" in source, "Must split text into words"
`,
            },
            {
              name: 'Used .get() for safe counting',
              check: py`
assert ".get(" in source, "Use frequencies.get(word, 0) + 1 to increment counts"
`,
            },
          ],
          hints: [
            'Create the list of words: <code>words = text.lower().split()</code>.',
            'Inside the loop: <code>for word in words:</code> update with <code>frequencies[word] = frequencies.get(word, 0) + 1</code>.',
            'Finally, print <code>print(frequencies)</code>.',
          ],
          solution: py`
text = "Python is great and python is fun and python is fast"

words = text.lower().split()
frequencies = {}

for word in words:
    frequencies[word] = frequencies.get(word, 0) + 1

print(frequencies)
`,
        },
        {
          type: 'quiz',
          title: 'Quiz: Dictionaries & Data Mapping',
          passScore: 4,
          questions: [
            {
              q: 'What happens when you look up a non-existent key with <code>d["missing"]</code>?',
              options: ['Returns None', 'Returns False', 'Raises KeyError', 'Creates the key with value 0'],
              answer: 2,
              explain: 'Direct indexing raises a <code>KeyError</code>. Use <code>d.get("missing", default)</code> to avoid crashes.',
            },
            {
              q: 'Which data type CANNOT be used as a dictionary key?',
              options: ['str (e.g. "id")', 'int (e.g. 42)', 'tuple (e.g. (1, 2))', 'list (e.g. [1, 2])'],
              answer: 3,
              explain: 'Dictionary keys must be <b>hashable (immutable)</b>. Lists are mutable and cannot be keys.',
            },
            {
              q: 'What does <code>d.items()</code> return when iterated?',
              options: ['Only keys', 'Only values', '(key, value) pairs as tuples', 'The length of the dictionary'],
              answer: 2,
              explain: '<code>.items()</code> yields <code>(key, value)</code> pairs, which can be unpacked into two variables.',
            },
            {
              q: 'What is the warning when naming a variable <code>dict = {"a": 1}</code>?',
              options: [
                'SyntaxError',
                'Shadowing the built-in dict() function',
                'Memory leak',
                'Invalid assignment',
              ],
              answer: 1,
              explain: 'Naming a variable <code>dict</code> shadows Python\'s built-in <code>dict</code> type/constructor.',
            },
            {
              q: 'What does <code>d.get("score", 100)</code> return if <code>d = {"score": 0}</code>?',
              options: ['100', '0', 'None', 'KeyError'],
              answer: 1,
              explain: 'Because "score" is present with value <code>0</code>, <code>.get()</code> returns <code>0</code> (not the fallback default).',
            },
          ],
        },
      ],
    },

    // ─────────────────────────────── 2.3
    {
      id: '2.3',
      title: 'The Interactive Terminal Menu',
      emoji: '📟',
      project: true,
      minutes: 15,
      steps: [
        {
          type: 'concept',
          title: 'Project Architecture: CLI Menus & State',
          body: `<p>A classic terminal application runs a continuous <b>event loop</b>, presenting an interactive menu, reading commands, updating state, and displaying formatted output.</p>
<p>In this project, you will build an interactive store inventory manager with rich formatting.</p>
<ul>
<li><b>State:</b> A dictionary of products, where each product maps to a dict of <code>price</code> and <code>stock</code>.</li>
<li><b>Loop:</b> A <code>while True:</code> loop waiting for user choices.</li>
<li><b>Actions:</b> View stock, Add item, View stats, and Exit.</li>
</ul>`,
          code: py`
# Quick demo of formatted terminal tables:
print("=" * 30)
print(f"{'ITEM':<12} {'PRICE':>8} {'QTY':>6}")
print("-" * 30)
print(f"{'Apples':<12} {'$1.50':>8} {25:>6}")
print(f"{'Oranges':<12} {'$2.00':>8} {14:>6}")
print("=" * 30)
`,
        },
        {
          type: 'concept',
          title: 'Clean Code: D.R.Y. & Functions',
          body: `<p><b>D.R.Y. (Don't Repeat Yourself):</b> Factor repeated actions into small helper functions.</p>
<p>Functions keep our main loop clean, testable, and readable:</p>`,
          code: py`
inventory = {
    "apples": {"price": 1.5, "stock": 20},
    "bananas": {"price": 0.8, "stock": 15}
}

def total_inventory_value(inv):
    total = sum(item["price"] * item["stock"] for item in inv.values())
    return round(total, 2)

print("Total Value: $" + str(total_inventory_value(inventory)))
`,
        },
        {
          type: 'challenge',
          title: 'Project: Interactive Store Menu',
          body: `<p>Complete the interactive Store Inventory Menu CLI program!</p>
<p>The program maintains a dictionary <code>store</code> and accepts commands in a <code>while True:</code> loop:</p>
<ul>
<li><code>1</code> or <code>view</code>: Prints each item formatted as <code>[item]: stock=[stock], price=$[price]</code></li>
<li><code>2</code> or <code>add</code>: Reads <code>item_name</code>, <code>price</code>, <code>stock</code>, and updates the dictionary</li>
<li><code>3</code> or <code>stats</code>: Prints total units and total inventory value: <code>Units: [total_units] | Value: $[total_val]</code></li>
<li><code>exit</code>: Prints <code>Goodbye!</code> and terminates the loop using <code>break</code></li>
<li>Any other command: Prints <code>Invalid choice</code> and continues the loop</li>
</ul>`,
          starter: py`
store = {
    "laptop": {"price": 999.0, "stock": 5},
    "mouse": {"price": 25.0, "stock": 30}
}

print("=== STORE MANAGER CLI ===")
while True:
    cmd = input("choice> ").strip().lower()

    if cmd == "exit":
        # TODO 1: print goodbye and break
        pass

    elif cmd == "1" or cmd == "view":
        # TODO 2: iterate store.items() and print:
        # f"{item}: stock={info['stock']}, price=$" + f"{info['price']}"
        pass

    elif cmd == "2" or cmd == "add":
        # TODO 3: prompt for name, price, stock and add to store
        name = input("Item name: ").strip().lower()
        price = float(input("Price: "))
        stock = int(input("Stock: "))
        # store[name] = {"price": price, "stock": stock}
        pass

    elif cmd == "3" or cmd == "stats":
        # TODO 4: compute total units and total value
        # total_units = sum(info["stock"] for info in store.values())
        # total_val = sum(info["stock"] * info["price"] for info in store.values())
        # print(f"Units: {total_units} | Value: $" + f"{total_val:.2f}")
        pass

    else:
        # TODO 5: handle unknown commands
        pass
`,
          stdin: 'view\nstats\nexit',
          tests: [
            {
              name: 'Exit command stops gracefully',
              stdin: 'exit',
              check: py`
assert "Goodbye!" in output, "Expected 'Goodbye!' when typing exit"
`,
            },
            {
              name: 'View command lists products',
              stdin: '1\nexit',
              check: py`
assert "laptop: stock=5, price=$999.0" in output, "Must list laptop info"
assert "mouse: stock=30, price=$25.0" in output, "Must list mouse info"
`,
            },
            {
              name: 'Stats command computes units and total value',
              stdin: 'stats\nexit',
              check: py`
assert "Units: 35 | Value: $5745.00" in output, "Expected 'Units: 35 | Value: $5745.00'"
`,
            },
            {
              name: 'Add command updates inventory',
              stdin: '2\nkeyboard\n49.50\n10\n1\nexit',
              check: py`
assert "keyboard: stock=10, price=$49.5" in output, "New item 'keyboard' must be present in view after adding"
`,
            },
            {
              name: 'Invalid command handled',
              stdin: 'banana\nexit',
              check: py`
assert "Invalid choice" in output, "Invalid choice should print 'Invalid choice'"
`,
            },
          ],
          hints: [
            'For <code>exit</code>: <code>print("Goodbye!")</code> followed by <code>break</code>.',
            'For <code>1 / view</code>: loop through <code>for item, info in store.items():</code> and print <code>print(f"{item}: stock={info[\'stock\']}, price=${info[\'price\']}")</code>.',
            'For <code>2 / add</code>: assign <code>store[name] = {"price": price, "stock": stock}</code> and optionally print confirmation.',
            'For <code>3 / stats</code>: sum stocks and values, then print with <code>print(f"Units: {total_units} | Value: $" + f"{total_val:.2f}")</code>.',
            'For <code>else:</code> print <code>print("Invalid choice")</code>.',
          ],
          solution: py`
store = {
    "laptop": {"price": 999.0, "stock": 5},
    "mouse": {"price": 25.0, "stock": 30}
}

print("=== STORE MANAGER CLI ===")
while True:
    cmd = input("choice> ").strip().lower()

    if cmd == "exit":
        print("Goodbye!")
        break

    elif cmd == "1" or cmd == "view":
        for item, info in store.items():
            print(f"{item}: stock={info['stock']}, price=$" + f"{info['price']}")

    elif cmd == "2" or cmd == "add":
        name = input("Item name: ").strip().lower()
        price = float(input("Price: "))
        stock = int(input("Stock: "))
        store[name] = {"price": price, "stock": stock}

    elif cmd == "3" or cmd == "stats":
        total_units = sum(info["stock"] for info in store.values())
        total_val = sum(info["stock"] * info["price"] for info in store.values())
        print(f"Units: {total_units} | Value: $" + f"{total_val:.2f}")

    else:
        print("Invalid choice")
`,
        },
      ],
    },
  ],
};
