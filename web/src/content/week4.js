// Week 4 lesson content: File I/O, APIs, and Error Handling.
// Step types: concept | predict | challenge | quiz
// Python code uses the `py` tag (String.raw + trim) so backslashes stay intact.

const py = (s, ...v) => String.raw(s, ...v).replace(/^\n/, '').replace(/\s+$/, '') + '\n';

export const week4 = {
  id: 4,
  title: 'Files, APIs & Errors',
  lessons: [
    // ─────────────────────────────── 4.1
    {
      id: '4.1',
      title: 'Context Managers & JSON',
      emoji: '📁',
      minutes: 10,
      steps: [
        {
          type: 'concept',
          title: 'The with Statement & Safe File I/O',
          body: `<p>In Python, opening a file requires closing it to prevent memory leaks and file lockouts.</p>
<p>The <b><code>with</code></b> statement is a <b>context manager</b>: it guarantees the file is properly closed the instant the block finishes, even if an error crashes your program inside.</p>
<ul>
<li><code>"r"</code>: Read (default)</li>
<li><code>"w"</code>: Write (overwrites existing content)</li>
<li><code>"a"</code>: Append (adds to end of file)</li>
</ul>`,
          code: py`
# Writing to a file safely
with open("notes.txt", "w") as f:
    f.write("Line 1: Learning Python!\n")
    f.write("Line 2: Context managers keep files safe.\n")

# Reading the file back
with open("notes.txt", "r") as f:
    content = f.read()

print("File contents:\n" + content)
`,
        },
        {
          type: 'concept',
          title: 'Structured Data with JSON',
          body: `<p><b>JSON</b> (JavaScript Object Notation) is the standard format for config files and web APIs.</p>
<p>Python's built-in <code>json</code> module converts between Python dictionaries and JSON strings/files:</p>
<ul>
<li><code>json.dumps(obj)</code>: Python dict → JSON string</li>
<li><code>json.loads(str)</code>: JSON string → Python dict</li>
<li><code>json.dump(obj, f)</code>: Write dict directly into open file <code>f</code></li>
<li><code>json.load(f)</code>: Read dict directly from open file <code>f</code></li>
</ul>`,
          code: py`
import json

user_data = {
    "username": "coder42",
    "level": 5,
    "skills": ["python", "cli", "oop"]
}

# Save as JSON file
with open("user.json", "w") as f:
    json.dump(user_data, f, indent=2)

# Load back from JSON file
with open("user.json", "r") as f:
    loaded = json.load(f)

print("Loaded user:", loaded["username"])
print("Skills count:", len(loaded["skills"]))
`,
        },
        {
          type: 'predict',
          title: 'Predict the output: File write mode overwrite',
          code: py`
with open("sample.txt", "w") as f:
    f.write("First write\n")

with open("sample.txt", "w") as f:
    f.write("Second write\n")

with open("sample.txt", "r") as f:
    data = f.read().strip()

print(data)
`,
          question: 'What is the value of <code>data</code>?',
          options: ['First write\\nSecond write', 'Second write', 'First write', 'FileExistsError'],
          answer: 1,
          explain: 'Opening a file with mode <code>"w"</code> truncates (overwrites) existing contents. To preserve existing data and add to the end, use mode <code>"a"</code> (append).',
        },
        {
          type: 'challenge',
          title: 'Challenge: JSON Profile Manager',
          body: `<p>Build two helper functions for managing application configurations in a JSON file:</p>
<ol>
<li><code>save_profile(filename, data)</code>:
  <ul>
    <li>Opens <code>filename</code> in write mode using a <code>with open(...)</code> context manager.</li>
    <li>Writes the Python dict <code>data</code> using <code>json.dump(data, f, indent=2)</code>.</li>
  </ul>
</li>
<li><code>update_xp(filename, added_xp)</code>:
  <ul>
    <li>Opens <code>filename</code> in read mode with <code>with open(...)</code>.</li>
    <li>Loads the dict with <code>json.load(f)</code>.</li>
    <li>Increments the <code>"xp"</code> field: <code>profile["xp"] = profile.get("xp", 0) + added_xp</code>.</li>
    <li>Saves the updated profile back to the same <code>filename</code>.</li>
    <li>Returns the updated total XP.</li>
  </ul>
</li>
</ol>`,
          starter: py`
import json

def save_profile(filename, data):
    # TODO: Write data to filename as JSON using with open
    pass

def update_xp(filename, added_xp):
    # TODO: Read profile, increment 'xp', save back, and return new xp
    return 0
`,
          tests: [
            {
              name: 'save_profile creates valid JSON file',
              check: py`
initial = {"username": "ada", "xp": 100}
save_profile("test_profile.json", initial)

import json
with open("test_profile.json", "r") as f:
    loaded = json.load(f)
assert loaded == {"username": "ada", "xp": 100}
`,
            },
            {
              name: 'update_xp increments and returns updated total',
              check: py`
initial = {"username": "linus", "xp": 250}
save_profile("linus.json", initial)

new_total = update_xp("linus.json", 75)
assert new_total == 325, f"Expected 325, got {new_total}"

import json
with open("linus.json", "r") as f:
    saved = json.load(f)
assert saved["xp"] == 325
`,
            },
            {
              name: 'Enforces with statement for context management',
              check: py`
assert "with open(" in source, "Must use 'with open(' context manager for file operations"
assert ".close()" not in source, "Avoid manual .close(); rely on the with statement"
`,
            },
          ],
          hints: [
            'For <code>save_profile</code>: <code>with open(filename, "w") as f: json.dump(data, f, indent=2)</code>.',
            'For <code>update_xp</code>: read the file with <code>with open(filename, "r") as f: profile = json.load(f)</code>.',
            'Increment XP with <code>profile["xp"] = profile.get("xp", 0) + added_xp</code>, save it with <code>save_profile(filename, profile)</code>, then <code>return profile["xp"]</code>.',
          ],
          solution: py`
import json

def save_profile(filename, data):
    with open(filename, "w") as f:
        json.dump(data, f, indent=2)

def update_xp(filename, added_xp):
    with open(filename, "r") as f:
        profile = json.load(f)
    profile["xp"] = profile.get("xp", 0) + added_xp
    save_profile(filename, profile)
    return profile["xp"]

# Demonstration
sample = {"username": "dev", "xp": 50}
save_profile("profile.json", sample)
updated = update_xp("profile.json", 100)
print(f"Updated XP: {updated}")
`,
        },
      ],
    },

    // ─────────────────────────────── 4.2
    {
      id: '4.2',
      title: 'Web Responses & Error Handling',
      emoji: '🌐',
      minutes: 12,
      steps: [
        {
          type: 'concept',
          title: 'Exceptions: try / except / else / finally',
          body: `<p>Errors in Python are called <b>Exceptions</b>. Without handling, exceptions terminate your script immediately.</p>
<p>Handle exceptions cleanly using <code>try / except</code> blocks:</p>
<ul>
<li><code>try</code>: code that might raise an error</li>
<li><code>except SpecificError as e</code>: catches only that specific failure</li>
<li><code>else</code>: runs only if <i>no</i> error occurred</li>
<li><code>finally</code>: runs unconditionally (e.g., closing cleanup)</li>
</ul>
<div class="callout warn"><b>⚠ Pitfall:</b> Never write a bare <code>except:</code>! Always specify the exact exception type (e.g. <code>ValueError</code>, <code>KeyError</code>, <code>ConnectionError</code>).</div>`,
          code: py`
def parse_int(text, default=0):
    try:
        val = int(text)
    except ValueError as e:
        print(f"Warning: could not parse '{text}', using default {default}")
        return default
    else:
        print("Parsed successfully!")
        return val

print("Result 1:", parse_int("42"))
print("Result 2:", parse_int("not_a_number", default=10))
`,
        },
        {
          type: 'predict',
          title: 'Predict the output: Exception order',
          code: py`
def calc(a, b):
    try:
        return a / b
    except ZeroDivisionError:
        return "ZeroDiv"
    except TypeError:
        return "TypeErr"
    except Exception:
        return "Generic"

print(calc(10, "2"), calc(10, 0))
`,
          question: 'What is printed?',
          options: ['TypeErr ZeroDiv', 'ZeroDiv TypeErr', 'Generic ZeroDiv', 'TypeError: unsupported operand'],
          answer: 0,
          explain: '<code>10 / "2"</code> triggers <code>TypeError</code> which matches the second branch. <code>10 / 0</code> triggers <code>ZeroDivisionError</code> which matches the first branch.',
        },
        {
          type: 'quiz',
          title: 'Quiz: File I/O & Exception Handling',
          passScore: 4,
          questions: [
            {
              q: 'Why is using <code>with open(...)</code> preferred over manual <code>file.close()</code>?',
              options: [
                'It runs faster in assembly',
                'It automatically closes the file even if an exception occurs inside the block',
                'It bypasses operating system security restrictions',
                'It prevents other processes from reading the file permanently',
              ],
              answer: 1,
              explain: 'The <code>with</code> context manager guarantees clean teardown via <code>__exit__</code>, preventing unclosed file leaks even during errors.',
            },
            {
              q: 'Which function parses a JSON-formatted string into a Python dictionary?',
              options: ['json.dump()', 'json.load()', 'json.dumps()', 'json.loads()'],
              answer: 3,
              explain: '<code>json.loads()</code> parses a JSON <b>string</b> (the "s" stands for string), while <code>json.load()</code> reads from a file pointer.',
            },
            {
              q: 'What is considered a dangerous anti-pattern when handling exceptions?',
              options: [
                'Catching specific exceptions like KeyError',
                'Using finally blocks for resource cleanup',
                'Using a bare <code>except:</code> without specifying the exception type',
                'Logging the exception message',
              ],
              answer: 2,
              explain: 'A bare <code>except:</code> silently catches everything, including <code>KeyboardInterrupt</code> and <code>SystemExit</code>, making debugging nightmare-inducing.',
            },
            {
              q: 'What HTTP status code indicates a successful request?',
              options: ['200', '404', '500', '301'],
              answer: 0,
              explain: 'HTTP 200 OK signals that the request succeeded and the server returned the requested resource.',
            },
            {
              q: 'When does an <code>else:</code> block attached to a <code>try / except</code> execute?',
              options: [
                'Whenever an unhandled exception occurs',
                'Only when NO exception was raised in the try block',
                'Always, before the finally block',
                'Only when a ValueError is caught',
              ],
              answer: 1,
              explain: 'The <code>else</code> clause runs only when the <code>try</code> suite completes without raising any exception.',
            },
          ],
        },
        {
          type: 'challenge',
          title: 'Challenge: Robust API Payload Parser',
          body: `<p>Web APIs return JSON responses that may be incomplete, malformed, or missing expected keys.</p>
<p>Write a function <code>parse_weather(raw_json)</code> that parses a JSON string representing weather data:</p>
<ol>
<li>If <code>raw_json</code> is not valid JSON, catch <code>json.JSONDecodeError</code> and return <code>{"error": "Invalid JSON"}</code>.</li>
<li>Extract the city name from <code>data["city"]</code> and temperature from <code>data["temp_c"]</code>.</li>
<li>If either key is missing, catch <code>KeyError</code> and return <code>{"error": "Missing required fields"}</code>.</li>
<li>Calculate temperature in Fahrenheit: <code>temp_f = round((temp_c * 9/5) + 32, 1)</code>.</li>
<li>If temperature is not a number, catch <code>TypeError</code> and return <code>{"error": "Invalid temperature type"}</code>.</li>
<li>On success, return: <code>{"city": city, "temp_c": temp_c, "temp_f": temp_f, "status": "ok"}</code>.</li>
</ol>`,
          starter: py`
import json

def parse_weather(raw_json):
    # TODO: Safely parse raw_json and handle JSONDecodeError, KeyError, and TypeError
    return {}
`,
          tests: [
            {
              name: 'Successfully parses valid weather payload',
              check: py`
valid_json = '{"city": "Tokyo", "temp_c": 20.0}'
res = parse_weather(valid_json)
assert res == {"city": "Tokyo", "temp_c": 20.0, "temp_f": 68.0, "status": "ok"}
`,
            },
            {
              name: 'Catches malformed JSON syntax',
              check: py`
bad_json = '{"city": "Paris", "temp_c": '
res = parse_weather(bad_json)
assert res == {"error": "Invalid JSON"}
`,
            },
            {
              name: 'Catches missing required keys',
              check: py`
missing_key = '{"city": "London"}'
res = parse_weather(missing_key)
assert res == {"error": "Missing required fields"}
`,
            },
            {
              name: 'Catches non-numeric temperature',
              check: py`
bad_type = '{"city": "Berlin", "temp_c": "twenty"}'
res = parse_weather(bad_type)
assert res == {"error": "Invalid temperature type"}
`,
            },
          ],
          hints: [
            'Start with <code>data = json.loads(raw_json)</code> inside a <code>try</code> block catching <code>json.JSONDecodeError</code>.',
            'Inside another <code>try</code> or the same block, read <code>city = data["city"]</code> and <code>temp_c = data["temp_c"]</code>.',
            'Compute <code>temp_f = round((temp_c * 9/5) + 32, 1)</code> and return the formatted dictionary.',
          ],
          solution: py`
import json

def parse_weather(raw_json):
    try:
        data = json.loads(raw_json)
    except json.JSONDecodeError:
        return {"error": "Invalid JSON"}

    try:
        city = data["city"]
        temp_c = data["temp_c"]
    except KeyError:
        return {"error": "Missing required fields"}

    try:
        temp_f = round((temp_c * 9/5) + 32, 1)
    except TypeError:
        return {"error": "Invalid temperature type"}

    return {
        "city": city,
        "temp_c": temp_c,
        "temp_f": temp_f,
        "status": "ok"
    }

print(parse_weather('{"city": "Seoul", "temp_c": 15.5}'))
`,
        },
      ],
    },

    // ─────────────────────────────── 4.3
    {
      id: '4.3',
      title: 'Project: CLI Trivia Game',
      emoji: '❓',
      minutes: 15,
      steps: [
        {
          type: 'concept',
          title: 'Consuming Open Trivia API Data',
          body: `<p>Web services like the <b>Open Trivia Database</b> (OTDB) provide free question sets via REST endpoints.</p>
<p>An API response has standard JSON format:</p>
<pre class="md-code"><code>{
  "response_code": 0,
  "results": [
    {
      "question": "What is the capital of Australia?",
      "correct_answer": "Canberra",
      "incorrect_answers": ["Sydney", "Melbourne", "Brisbane"]
    }
  ]
}</code></pre>
<p>In our game engine, we parse questions, combine and present options, evaluate answers, and safeguard against network or JSON decode errors.</p>`,
          code: py`
# Example trivia payload
raw_data = {
    "response_code": 0,
    "results": [
        {
            "question": "Which language uses indentation for blocks?",
            "correct_answer": "Python",
            "incorrect_answers": ["C++", "Java", "PHP"]
        }
    ]
}
print("Question count:", len(raw_data["results"]))
`,
        },
        {
          type: 'challenge',
          title: 'Project: The Trivia Game Engine',
          body: `<p>Build the full logic for the CLI Trivia Game engine!</p>
<ol>
<li><code>TriviaQuestion</code> class:
  <ul>
    <li><code>__init__(self, question, correct_answer, incorrect_answers)</code>: stores <code>self.question</code>, <code>self.correct_answer</code>, and <code>self.incorrect_answers</code>.</li>
    <li><code>get_all_options(self)</code>: returns all choices sorted alphabetically: <code>sorted([self.correct_answer] + self.incorrect_answers)</code>.</li>
    <li><code>check_answer(self, user_choice)</code>: returns <code>True</code> if <code>user_choice.strip().lower() == self.correct_answer.strip().lower()</code>, else <code>False</code>.</li>
  </ul>
</li>
<li><code>TriviaGame</code> class:
  <ul>
    <li><code>__init__(self)</code>: initializes empty list <code>self.questions = []</code> and <code>self.score = 0</code>.</li>
    <li><code>load_from_json(self, json_string)</code>:
      <ul>
        <li>Parses <code>json_string</code> using <code>json.loads()</code>.</li>
        <li>If invalid JSON, catch <code>json.JSONDecodeError</code> and return <code>False</code>.</li>
        <li>For each item in <code>data.get("results", [])</code>, create a <code>TriviaQuestion</code> and append to <code>self.questions</code>.</li>
        <li>Return <code>True</code>.</li>
      </ul>
    </li>
    <li><code>answer_question(self, question_idx, user_choice)</code>:
      <ul>
        <li>If <code>question_idx</code> is out of range, raise <code>IndexError</code>.</li>
        <li>Calls <code>question.check_answer(user_choice)</code>. If correct, increments <code>self.score += 1</code> and returns <code>True</code>. Otherwise returns <code>False</code>.</li>
      </ul>
    </li>
    <li><code>get_summary(self)</code>: returns <code>{"score": self.score, "total": len(self.questions), "pct": round((self.score / len(self.questions)) * 100, 1) if self.questions else 0.0}</code>.</li>
  </ul>
</li>
</ol>`,
          starter: py`
import json

class TriviaQuestion:
    def __init__(self, question, correct_answer, incorrect_answers):
        # TODO: initialize attributes
        pass

    def get_all_options(self):
        # TODO: return sorted list of all options
        return []

    def check_answer(self, user_choice):
        # TODO: case-insensitive answer comparison
        return False


class TriviaGame:
    def __init__(self):
        self.questions = []
        self.score = 0

    def load_from_json(self, json_string):
        # TODO: load JSON safely, populate self.questions, return True or False on error
        return False

    def answer_question(self, question_idx, user_choice):
        # TODO: check answer, increment score on success, return bool
        return False

    def get_summary(self):
        # TODO: return dict with score, total, pct
        return {}
`,
          tests: [
            {
              name: 'TriviaQuestion options and evaluation',
              check: py`
q = TriviaQuestion("What is 2+2?", "4", ["1", "3", "5"])
assert q.get_all_options() == ["1", "3", "4", "5"]
assert q.check_answer("4") is True
assert q.check_answer(" 4 ") is True
assert q.check_answer("3") is False
`,
            },
            {
              name: 'TriviaGame loads JSON questions cleanly',
              check: py`
payload = json.dumps({
    "response_code": 0,
    "results": [
        {"question": "Q1", "correct_answer": "A1", "incorrect_answers": ["B1", "C1"]},
        {"question": "Q2", "correct_answer": "A2", "incorrect_answers": ["B2", "C2"]}
    ]
})

game = TriviaGame()
ok = game.load_from_json(payload)
assert ok is True
assert len(game.questions) == 2
assert game.questions[0].question == "Q1"
assert game.questions[1].correct_answer == "A2"
`,
            },
            {
              name: 'Handles malformed JSON gracefully without crashing',
              check: py`
game = TriviaGame()
ok = game.load_from_json("{malformed json")
assert ok is False
assert len(game.questions) == 0
`,
            },
            {
              name: 'Scoring and summary computation',
              check: py`
payload = json.dumps({
    "results": [
        {"question": "Q1", "correct_answer": "Alpha", "incorrect_answers": ["Beta"]},
        {"question": "Q2", "correct_answer": "Gamma", "incorrect_answers": ["Delta"]}
    ]
})

game = TriviaGame()
game.load_from_json(payload)

# Question 1: correct
r1 = game.answer_question(0, "alpha")
assert r1 is True
assert game.score == 1

# Question 2: incorrect
r2 = game.answer_question(1, "wrong")
assert r2 is False
assert game.score == 1

summary = game.get_summary()
assert summary == {"score": 1, "total": 2, "pct": 50.0}
`,
            },
          ],
          hints: [
            'In <code>TriviaQuestion.get_all_options</code>: <code>return sorted([self.correct_answer] + self.incorrect_answers)</code>.',
            'In <code>TriviaGame.load_from_json</code>: wrap <code>data = json.loads(json_string)</code> in a <code>try / except json.JSONDecodeError: return False</code>.',
            'Iterate <code>for item in data.get("results", []):</code> and append <code>TriviaQuestion(item["question"], item["correct_answer"], item["incorrect_answers"])</code>.',
            'In <code>answer_question</code>: <code>q = self.questions[question_idx]</code>. If <code>q.check_answer(user_choice): self.score += 1; return True</code> else return <code>False</code>.',
          ],
          solution: py`
import json

class TriviaQuestion:
    def __init__(self, question, correct_answer, incorrect_answers):
        self.question = question
        self.correct_answer = correct_answer
        self.incorrect_answers = list(incorrect_answers)

    def get_all_options(self):
        return sorted([self.correct_answer] + self.incorrect_answers)

    def check_answer(self, user_choice):
        return user_choice.strip().lower() == self.correct_answer.strip().lower()


class TriviaGame:
    def __init__(self):
        self.questions = []
        self.score = 0

    def load_from_json(self, json_string):
        try:
            data = json.loads(json_string)
        except (json.JSONDecodeError, TypeError):
            return False

        self.questions = []
        for item in data.get("results", []):
            q = TriviaQuestion(
                item["question"],
                item["correct_answer"],
                item["incorrect_answers"]
            )
            self.questions.append(q)
        return True

    def answer_question(self, question_idx, user_choice):
        if not (0 <= question_idx < len(self.questions)):
            raise IndexError("Question index out of range")
        question = self.questions[question_idx]
        if question.check_answer(user_choice):
            self.score += 1
            return True
        return False

    def get_summary(self):
        total = len(self.questions)
        pct = round((self.score / total) * 100, 1) if total > 0 else 0.0
        return {"score": self.score, "total": total, "pct": pct}

# Demonstration
sample_data = json.dumps({
    "results": [
        {"question": "Python creator?", "correct_answer": "Guido van Rossum", "incorrect_answers": ["James Gosling", "Bjarne Stroustrup"]}
    ]
})
game = TriviaGame()
game.load_from_json(sample_data)
game.answer_question(0, "guido van rossum")
print("Game Summary:", game.get_summary())
`,
        },
      ],
    },
  ],
};
