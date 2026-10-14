// Week 3 lesson content: Object-Oriented Programming (OOP).
// Step types: concept | predict | challenge | quiz
// Python code uses the `py` tag (String.raw + trim) so backslashes stay intact.

const py = (s, ...v) => String.raw(s, ...v).replace(/^\n/, '').replace(/\s+$/, '') + '\n';

export const week3 = {
  id: 3,
  title: 'Object-Oriented Programming',
  lessons: [
    // ─────────────────────────────── 3.1
    {
      id: '3.1',
      title: 'The Blueprint: Classes & Instances',
      emoji: '🏗️',
      minutes: 10,
      steps: [
        {
          type: 'concept',
          title: 'What is a Class?',
          body: `<p>A <b>class</b> is a blueprint or template for creating objects. An <b>instance</b> is an actual object created from that blueprint.</p>
<p>The <code>__init__</code> method is the constructor: it runs automatically whenever you create a new instance.</p>
<p>The <code>self</code> parameter represents the specific instance being created or manipulated. Use <code>self.variable_name</code> to attach data (attributes) to the instance.</p>`,
          code: py`
class Dog:
    def __init__(self, name, breed):
        self.name = name
        self.breed = breed
        self.tricks = []

    def learn_trick(self, trick):
        self.tricks.append(trick)
        print(f"{self.name} learned {trick}!")

# Creating instances
buddy = Dog("Buddy", "Golden Retriever")
milo = Dog("Milo", "Beagle")

buddy.learn_trick("fetch")
print(f"{buddy.name}'s tricks:", buddy.tricks)
print(f"{milo.name}'s tricks:", milo.tricks)
`,
        },
        {
          type: 'predict',
          title: 'Predict the output: Instance isolation',
          code: py`
class Counter:
    def __init__(self):
        self.count = 0

    def increment(self):
        self.count += 1

c1 = Counter()
c2 = Counter()
c1.increment()
c1.increment()
print(c1.count, c2.count)
`,
          question: 'What is printed by <code>print(c1.count, c2.count)</code>?',
          options: ['2 2', '2 0', '0 2', '1 1'],
          answer: 1,
          explain: 'Each instance maintains its own separate attributes attached to <code>self</code>. <code>c1</code> was incremented twice to <code>2</code>, while <code>c2</code> remains at <code>0</code>.',
        },
        {
          type: 'concept',
          title: 'String Representation: __str__ and __repr__',
          body: `<p>When you print an object, Python by default prints something obscure like <code>&lt;Dog object at 0x7f...&gt;</code>.</p>
<p>Defining <code>def __str__(self):</code> gives your class a human-friendly string representation when passed to <code>print()</code> or <code>str()</code>.</p>`,
          code: py`
class Book:
    def __init__(self, title, author, pages):
        self.title = title
        self.author = author
        self.pages = pages

    def __str__(self):
        return f"'{self.title}' by {self.author} ({self.pages} pages)"

book = Book("Fluent Python", "Luciano Ramalho", 800)
print(book)
`,
        },
        {
          type: 'predict',
          title: 'Predict the output: Missing self',
          code: py`
class Person:
    def __init__(self, name):
        self.name = name

    def greet():
        print("Hello from " + self.name)

p = Person("Ada")
p.greet()
`,
          question: 'What happens when <code>p.greet()</code> is called?',
          options: ['Prints: Hello from Ada', 'Prints: Hello from Person', 'TypeError: greet() takes 0 positional arguments but 1 was given', 'NameError: name is not defined'],
          answer: 2,
          explain: 'In Python, instance methods automatically receive the instance as their first argument. Because <code>greet</code> was defined without <code>self</code>, Python raises a <code>TypeError</code>.',
        },
        {
          type: 'challenge',
          title: 'Challenge: Bank Account Manager',
          body: `<p>Create a <code>BankAccount</code> class with encapsulated balances and safe transactions.</p>
<ul>
<li><code>__init__(self, owner, balance=0.0)</code>: Stores <code>self.owner</code> and float <code>self.balance</code>.</li>
<li><code>deposit(self, amount)</code>: Adds positive amount to balance and returns <code>True</code>. If amount &lt;= 0, prints <code>"Invalid deposit"</code> and returns <code>False</code>.</li>
<li><code>withdraw(self, amount)</code>: If amount &gt; balance, prints <code>"Insufficient funds"</code> and returns <code>False</code>. Otherwise, subtracts amount and returns <code>True</code>.</li>
<li><code>__str__(self)</code>: Returns <code>f"Account({self.owner}, balance=$" + f"{self.balance:.2f})"</code>.</li>
</ul>`,
          starter: py`
class BankAccount:
    def __init__(self, owner, balance=0.0):
        # TODO: initialize owner and balance
        pass

    def deposit(self, amount):
        # TODO: deposit amount if valid (> 0)
        pass

    def withdraw(self, amount):
        # TODO: withdraw amount if funds sufficient
        pass

    def __str__(self):
        # TODO: string representation
        return ""

# Test execution:
acc = BankAccount("Alice", 100.0)
acc.deposit(50.0)
acc.deposit(-10.0)
acc.withdraw(30.0)
acc.withdraw(200.0)
print(acc)
`,
          tests: [
            {
              name: 'Deposits and withdrawals update balance accurately',
              check: py`
acc = BankAccount("TestUser", 50.0)
assert acc.owner == "TestUser"
assert acc.balance == 50.0

ok_dep = acc.deposit(25.0)
assert ok_dep is True
assert acc.balance == 75.0

ok_draw = acc.withdraw(35.0)
assert ok_draw is True
assert acc.balance == 40.0
`,
            },
            {
              name: 'Insufficient funds blocked',
              check: py`
acc = BankAccount("Bob", 10.0)
ok = acc.withdraw(50.0)
assert ok is False
assert acc.balance == 10.0
assert "Insufficient funds" in output
`,
            },
            {
              name: 'Invalid deposit blocked',
              check: py`
acc = BankAccount("Charlie", 10.0)
ok = acc.deposit(-5.0)
assert ok is False
assert acc.balance == 10.0
assert "Invalid deposit" in output
`,
            },
            {
              name: '__str__ formatting',
              check: py`
acc = BankAccount("Alice", 120.0)
assert str(acc) == "Account(Alice, balance=$120.00)"
`,
            },
          ],
          hints: [
            'In <code>__init__</code>, assign <code>self.owner = owner</code> and <code>self.balance = float(balance)</code>.',
            'In <code>deposit</code>, check <code>if amount > 0: self.balance += amount; return True</code>, else print <code>"Invalid deposit"</code> and return <code>False</code>.',
            'In <code>withdraw</code>, check <code>if amount > self.balance: print("Insufficient funds"); return False</code>.',
            'In <code>__str__</code>, return <code>f"Account({self.owner}, balance=$" + f"{self.balance:.2f})"</code>.',
          ],
          solution: py`
class BankAccount:
    def __init__(self, owner, balance=0.0):
        self.owner = owner
        self.balance = float(balance)

    def deposit(self, amount):
        if amount > 0:
            self.balance += amount
            return True
        print("Invalid deposit")
        return False

    def withdraw(self, amount):
        if amount > self.balance:
            print("Insufficient funds")
            return False
        self.balance -= amount
        return True

    def __str__(self):
        return f"Account({self.owner}, balance=$" + f"{self.balance:.2f})"

acc = BankAccount("Alice", 100.0)
acc.deposit(50.0)
acc.deposit(-10.0)
acc.withdraw(30.0)
acc.withdraw(200.0)
print(acc)
`,
        },
      ],
    },

    // ─────────────────────────────── 3.2
    {
      id: '3.2',
      title: 'Inheritance & Polymorphism',
      emoji: '🧬',
      minutes: 12,
      steps: [
        {
          type: 'concept',
          title: 'Subclassing & Inheritance',
          body: `<p><b>Inheritance</b> lets a child class inherit attributes and methods from a parent class without duplicating code.</p>
<p>Syntax: <code>class ChildClass(ParentClass):</code></p>
<p>Use <code>super().__init__(...)</code> inside the child's constructor to let the parent initialize its own fields.</p>`,
          code: py`
class Vehicle:
    def __init__(self, make, model):
        self.make = make
        self.model = model

    def describe(self):
        return f"{self.make} {self.model}"

class ElectricCar(Vehicle):
    def __init__(self, make, model, battery_kwh):
        super().__init__(make, model)  # reuse Vehicle init!
        self.battery_kwh = battery_kwh

    def describe(self):
        return f"{super().describe()} (Electric, {self.battery_kwh} kWh)"

ev = ElectricCar("Tesla", "Model 3", 75)
print(ev.describe())
`,
        },
        {
          type: 'predict',
          title: 'Predict the output: Method Overriding',
          code: py`
class Animal:
    def speak(self):
        return "Generic sound"

class Cat(Animal):
    def speak(self):
        return "Meow!"

class Fish(Animal):
    pass

animals = [Cat(), Fish()]
sounds = [a.speak() for a in animals]
print(", ".join(sounds))
`,
          question: 'What is printed?',
          options: ['Meow!, Meow!', 'Generic sound, Generic sound', 'Meow!, Generic sound', 'Error: speak not defined on Fish'],
          answer: 2,
          explain: '<code>Cat</code> overrides <code>speak()</code> to return <code>"Meow!"</code>. <code>Fish</code> does not override it, so it inherits <code>"Generic sound"</code> from <code>Animal</code>.',
        },
        {
          type: 'quiz',
          title: 'Quiz: Object-Oriented Principles',
          passScore: 4,
          questions: [
            {
              q: 'What is the purpose of the <code>self</code> parameter in Python methods?',
              options: [
                'It refers to the class definition',
                'It refers to the current instance of the class',
                'It is an optional naming keyword',
                'It acts as a global variable',
              ],
              answer: 1,
              explain: '<code>self</code> represents the specific instance on which the method is called, allowing access to its unique attributes and methods.',
            },
            {
              q: 'What built-in function is used to invoke a method from a parent class?',
              options: ['parent()', 'super()', 'base()', 'inherit()'],
              answer: 1,
              explain: '<code>super()</code> delegates method calls to a parent or sibling class in the inheritance chain.',
            },
            {
              q: 'Which special dunder method is executed upon object creation?',
              options: ['__new__', '__create__', '__init__', '__start__'],
              answer: 2,
              explain: '<code>__init__</code> is the initializer method called immediately after the new object has been instantiated.',
            },
            {
              q: 'What is Polymorphism in Python?',
              options: [
                'Writing code that only runs on multiple operating systems',
                'The ability of different classes to respond to the same method interface in their own way',
                'Restricting variables from being changed after creation',
                'Creating a class with no attributes',
              ],
              answer: 1,
              explain: 'Polymorphism allows different object types to be treated uniformly through shared method signatures while implementing custom behaviors.',
            },
            {
              q: 'What is the result of <code>isinstance([1, 2], object)</code> in Python?',
              options: ['False', 'True', 'TypeError', 'None'],
              answer: 1,
              explain: 'In Python, everything is an object! All classes implicitly inherit from the base <code>object</code> class.',
            },
          ],
        },
        {
          type: 'challenge',
          title: 'Challenge: Employee Payroll Hierarchy',
          body: `<p>Design an employee payroll hierarchy using inheritance and polymorphism.</p>
<ul>
<li>Base class <code>Employee</code>:
  <ul>
    <li><code>__init__(self, name, base_salary)</code>: sets <code>self.name</code> and float <code>self.base_salary</code>.</li>
    <li><code>calculate_pay(self)</code>: returns <code>self.base_salary</code>.</li>
    <li><code>get_role(self)</code>: returns <code>"Standard Employee"</code>.</li>
  </ul>
</li>
<li>Subclass <code>Manager(Employee)</code>:
  <ul>
    <li><code>__init__(self, name, base_salary, bonus)</code>: calls <code>super().__init__(name, base_salary)</code> and sets float <code>self.bonus</code>.</li>
    <li><code>calculate_pay(self)</code>: returns <code>self.base_salary + self.bonus</code> using <code>super().calculate_pay()</code>.</li>
    <li><code>get_role(self)</code>: returns <code>"Manager"</code>.</li>
  </ul>
</li>
<li>Subclass <code>Contractor(Employee)</code>:
  <ul>
    <li><code>__init__(self, name, hourly_rate, hours_worked)</code>: sets <code>base_salary = 0.0</code> via <code>super()</code>, and sets <code>self.hourly_rate</code> and <code>self.hours_worked</code>.</li>
    <li><code>calculate_pay(self)</code>: returns <code>self.hourly_rate * self.hours_worked</code>.</li>
    <li><code>get_role(self)</code>: returns <code>"Contractor"</code>.</li>
  </ul>
</li>
</ul>`,
          starter: py`
class Employee:
    def __init__(self, name, base_salary):
        # TODO: initialize name and base_salary
        pass

    def calculate_pay(self):
        # TODO: return pay
        return 0.0

    def get_role(self):
        return "Standard Employee"


class Manager(Employee):
    def __init__(self, name, base_salary, bonus):
        # TODO: call super() and set bonus
        pass

    def calculate_pay(self):
        # TODO: base_salary + bonus using super()
        return 0.0

    def get_role(self):
        return "Manager"


class Contractor(Employee):
    def __init__(self, name, hourly_rate, hours_worked):
        # TODO: call super() with base_salary=0 and store hourly info
        pass

    def calculate_pay(self):
        # TODO: hourly_rate * hours_worked
        return 0.0

    def get_role(self):
        return "Contractor"
`,
          tests: [
            {
              name: 'Employee base pay calculation',
              check: py`
emp = Employee("Diana", 4000.0)
assert emp.name == "Diana"
assert emp.calculate_pay() == 4000.0
assert emp.get_role() == "Standard Employee"
`,
            },
            {
              name: 'Manager pay includes bonus and inherits Employee',
              check: py`
mgr = Manager("Bruce", 6000.0, 1500.0)
assert isinstance(mgr, Employee)
assert mgr.calculate_pay() == 7500.0
assert mgr.get_role() == "Manager"
`,
            },
            {
              name: 'Contractor hourly pay calculation',
              check: py`
con = Contractor("Clark", 50.0, 40)
assert isinstance(con, Employee)
assert con.calculate_pay() == 2000.0
assert con.get_role() == "Contractor"
`,
            },
            {
              name: 'Polymorphic team total pay calculation',
              check: py`
team = [
    Employee("Diana", 4000.0),
    Manager("Bruce", 6000.0, 1500.0),
    Contractor("Clark", 50.0, 40)
]
total_payroll = sum(member.calculate_pay() for member in team)
assert total_payroll == 13500.0, f"Expected 13500.0, got {total_payroll}"
`,
            },
          ],
          hints: [
            'In <code>Employee.__init__</code>, store <code>self.name = name</code> and <code>self.base_salary = float(base_salary)</code>.',
            'In <code>Manager.__init__</code>, call <code>super().__init__(name, base_salary)</code> and assign <code>self.bonus = float(bonus)</code>.',
            'In <code>Manager.calculate_pay</code>, return <code>super().calculate_pay() + self.bonus</code>.',
            'In <code>Contractor.__init__</code>, call <code>super().__init__(name, 0.0)</code> and store <code>self.hourly_rate = float(hourly_rate)</code>, <code>self.hours_worked = float(hours_worked)</code>.',
            'In <code>Contractor.calculate_pay</code>, return <code>self.hourly_rate * self.hours_worked</code>.',
          ],
          solution: py`
class Employee:
    def __init__(self, name, base_salary):
        self.name = name
        self.base_salary = float(base_salary)

    def calculate_pay(self):
        return self.base_salary

    def get_role(self):
        return "Standard Employee"


class Manager(Employee):
    def __init__(self, name, base_salary, bonus):
        super().__init__(name, base_salary)
        self.bonus = float(bonus)

    def calculate_pay(self):
        return super().calculate_pay() + self.bonus

    def get_role(self):
        return "Manager"


class Contractor(Employee):
    def __init__(self, name, hourly_rate, hours_worked):
        super().__init__(name, 0.0)
        self.hourly_rate = float(hourly_rate)
        self.hours_worked = float(hours_worked)

    def calculate_pay(self):
        return self.hourly_rate * self.hours_worked

    def get_role(self):
        return "Contractor"
`,
        },
      ],
    },

    // ─────────────────────────────── 3.3
    {
      id: '3.3',
      title: 'Project: Spaced Repetition Flashcards',
      emoji: '🗂️',
      minutes: 15,
      steps: [
        {
          type: 'concept',
          title: 'The Leitner Spaced Repetition System',
          body: `<p>The <b>Leitner System</b> is an evidence-based learning technique using active recall and spaced intervals.</p>
<p>Flashcards are sorted into boxes (e.g., Box 1, Box 2, Box 3):</p>
<ul>
<li><b>Box 1:</b> Cards reviewed every session (new or difficult cards).</li>
<li><b>Box 2:</b> Cards reviewed every 3 days.</li>
<li><b>Box 3:</b> Mastered cards reviewed weekly.</li>
</ul>
<p>When you answer a card correctly, it moves <b>up</b> to the next box (<code>promote</code>). If you answer incorrectly, it drops back to <b>Box 1</b> (<code>demote</code>)!</p>`,
          code: py`
# Architecture preview:
# Card: front, back, box
# Deck: holds cards, filter by box
# LeitnerSystem: administers review session
`,
        },
        {
          type: 'challenge',
          title: 'Project: Spaced Repetition Engine',
          body: `<p>Build the full OOP engine for the Leitner Flashcard system!</p>
<ol>
<li><code>Card</code> class:
  <ul>
    <li><code>__init__(self, front, back, box=1)</code>: sets <code>self.front</code>, <code>self.back</code>, <code>self.box = int(box)</code>.</li>
    <li><code>promote(self, max_box=3)</code>: if <code>self.box &lt; max_box</code>, increment <code>self.box += 1</code>.</li>
    <li><code>demote(self)</code>: reset <code>self.box = 1</code>.</li>
    <li><code>to_dict(self)</code>: returns <code>{"front": self.front, "back": self.back, "box": self.box}</code>.</li>
  </ul>
</li>
<li><code>Deck</code> class:
  <ul>
    <li><code>__init__(self)</code>: initializes empty list <code>self.cards = []</code>.</li>
    <li><code>add_card(self, card)</code>: appends card to <code>self.cards</code>.</li>
    <li><code>cards_in_box(self, box)</code>: returns list of cards with <code>c.box == box</code>.</li>
    <li><code>to_list(self)</code>: returns list of dicts from <code>[c.to_dict() for c in self.cards]</code>.</li>
  </ul>
</li>
<li><code>LeitnerSystem</code> class:
  <ul>
    <li><code>__init__(self, deck)</code>: stores <code>self.deck = deck</code>.</li>
    <li><code>review_card(self, card, user_answer)</code>: checks if <code>user_answer.strip().lower() == card.back.strip().lower()</code>.
      If correct: calls <code>card.promote()</code> and returns <code>True</code>.
      If incorrect: calls <code>card.demote()</code> and returns <code>False</code>.</li>
    <li><code>get_summary(self)</code>: returns a dictionary mapping box numbers <code>1</code>, <code>2</code>, and <code>3</code> to the count of cards in each box: <code>{1: count1, 2: count2, 3: count3}</code>.</li>
  </ul>
</li>
</ol>`,
          starter: py`
class Card:
    def __init__(self, front, back, box=1):
        # TODO: initialize front, back, box
        pass

    def promote(self, max_box=3):
        # TODO: increase box up to max_box
        pass

    def demote(self):
        # TODO: drop back to box 1
        pass

    def to_dict(self):
        # TODO: return dict
        return {}


class Deck:
    def __init__(self):
        # TODO: list of cards
        self.cards = []

    def add_card(self, card):
        # TODO: append card
        pass

    def cards_in_box(self, box):
        # TODO: return cards matching box
        return []

    def to_list(self):
        # TODO: return list of dicts
        return []


class LeitnerSystem:
    def __init__(self, deck):
        self.deck = deck

    def review_card(self, card, user_answer):
        # TODO: compare answer, promote on match, demote on failure
        pass

    def get_summary(self):
        # TODO: return {1: count1, 2: count2, 3: count3}
        return {}
`,
          tests: [
            {
              name: 'Card promote and demote logic',
              check: py`
c = Card("What is Python?", "A programming language")
assert c.box == 1
c.promote()
assert c.box == 2
c.promote()
assert c.box == 3
c.promote(max_box=3)
assert c.box == 3, "Card should not exceed max_box 3"
c.demote()
assert c.box == 1, "Demote must return card to box 1"
`,
            },
            {
              name: 'Deck management and filtering',
              check: py`
deck = Deck()
c1 = Card("Q1", "A1", box=1)
c2 = Card("Q2", "A2", box=2)
c3 = Card("Q3", "A3", box=1)
deck.add_card(c1)
deck.add_card(c2)
deck.add_card(c3)

assert len(deck.cards) == 3
box1_cards = deck.cards_in_box(1)
assert len(box1_cards) == 2
assert c1 in box1_cards and c3 in box1_cards
`,
            },
            {
              name: 'Leitner review promotes correct and demotes incorrect answers',
              check: py`
deck = Deck()
c = Card("Capital of France?", "Paris", box=1)
deck.add_card(c)
engine = LeitnerSystem(deck)

# Correct review (case-insensitive)
res1 = engine.review_card(c, "paris")
assert res1 is True
assert c.box == 2, "Correct answer should promote to Box 2"

# Second correct review
res2 = engine.review_card(c, " PARIS ")
assert res2 is True
assert c.box == 3, "Correct answer should promote to Box 3"

# Incorrect answer
res3 = engine.review_card(c, "Rome")
assert res3 is False
assert c.box == 1, "Wrong answer must demote back to Box 1"
`,
            },
            {
              name: 'Engine summary counts boxes accurately',
              check: py`
deck = Deck()
deck.add_card(Card("Q1", "A1", 1))
deck.add_card(Card("Q2", "A2", 2))
deck.add_card(Card("Q3", "A3", 2))
deck.add_card(Card("Q4", "A4", 3))

engine = LeitnerSystem(deck)
summary = engine.get_summary()
assert summary == {1: 1, 2: 2, 3: 1}, f"Expected {1: 1, 2: 2, 3: 1}, got {summary}"
`,
            },
            {
              name: 'Serialization to dict and list for persistence',
              check: py`
c = Card("Front", "Back", 2)
assert c.to_dict() == {"front": "Front", "back": "Back", "box": 2}

deck = Deck()
deck.add_card(c)
serialized = deck.to_list()
assert serialized == [{"front": "Front", "back": "Back", "box": 2}]
`,
            },
          ],
          hints: [
            'In <code>Card.promote</code>: <code>if self.box < max_box: self.box += 1</code>.',
            'In <code>Card.demote</code>: <code>self.box = 1</code>.',
            'In <code>Deck.cards_in_box</code>: use list comprehension <code>[c for c in self.cards if c.box == box]</code>.',
            'In <code>LeitnerSystem.review_card</code>: compare <code>user_answer.strip().lower() == card.back.strip().lower()</code>. If True, call <code>card.promote()</code> and return <code>True</code>, else call <code>card.demote()</code> and return <code>False</code>.',
            'In <code>LeitnerSystem.get_summary</code>: return <code>{b: len(self.deck.cards_in_box(b)) for b in (1, 2, 3)}</code>.',
          ],
          solution: py`
class Card:
    def __init__(self, front, back, box=1):
        self.front = front
        self.back = back
        self.box = int(box)

    def promote(self, max_box=3):
        if self.box < max_box:
            self.box += 1

    def demote(self):
        self.box = 1

    def to_dict(self):
        return {"front": self.front, "back": self.back, "box": self.box}


class Deck:
    def __init__(self):
        self.cards = []

    def add_card(self, card):
        self.cards.append(card)

    def cards_in_box(self, box):
        return [c for c in self.cards if c.box == box]

    def to_list(self):
        return [c.to_dict() for c in self.cards]


class LeitnerSystem:
    def __init__(self, deck):
        self.deck = deck

    def review_card(self, card, user_answer):
        if user_answer.strip().lower() == card.back.strip().lower():
            card.promote()
            return True
        else:
            card.demote()
            return False

    def get_summary(self):
        return {b: len(self.deck.cards_in_box(b)) for b in (1, 2, 3)}

# Verification run demo
deck = Deck()
deck.add_card(Card("What is a class?", "A blueprint for objects"))
deck.add_card(Card("What does super() do?", "Calls the parent method"))
system = LeitnerSystem(deck)
print("Initial summary:", system.get_summary())
`,
        },
      ],
    },
  ],
};
