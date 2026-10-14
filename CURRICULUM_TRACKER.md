# 🚀 8-Week Interactive Python Mastery Curriculum

## Overview
This document serves as the absolute source of truth for the curriculum state. The Google Antigravity Agent must read this file at the start of every session and update the checklist boxes [x] as tasks are verified and completed.

## Verification Protocol
For every task marked [PROJECT] or [QUIZ], the Antigravity Agent must:
1. Generate the architectural scaffolding via implementation_plan.md.
2. Allow the user to write the core logic.
3. Run pytest or execute the script in the integrated terminal to verify execution.
4. Only upon successful execution, check off the corresponding box below using file editing tools.

---

## 📅 Week 1: Foundations & Interactive CLI
**Focus:** Variables, Data Types, Control Flow, and Terminal I/O.
**Common Pitfalls Monitored:** Missing colons, indentation errors, incorrect comparison operators (= vs ==).

- [x] Task 1.1: Environment & Hello World
  - [x] Write a basic script using print() and input().
  - [x] Agent verification: Run script in terminal, ensure it handles basic string concatenation without type errors.
- [x] Task 1.2: Control Flow & Logic
  - [x] Implement if/elif/else blocks and while loops.
  - [x] [QUIZ]: Agent generates a 5-question CLI quiz script testing boolean logic, runs it, and grades the user.
- [x] Task 1.3: [PROJECT] The Smart CLI Calculator
  - [x] Description: A calculator that accepts user input, parses operations, and handles ZeroDivisionError and ValueError.
  - [x] Acceptance Criteria: Must use a while True: loop that only breaks on an explicit 'exit' command. Utilize the pass keyword appropriately if stubbing logic.
  - [x] Verification: Agent runs the script and inputs edge cases (letters instead of numbers) to ensure it does not crash.

## 📅 Week 2: Data Structures & Clean Code
**Focus:** Lists, Dictionaries, Tuples, and Functions (D.R.Y principles).
**Common Pitfalls Monitored:** Index out of bounds, mutable default arguments, shadowing built-ins.

- [x] Task 2.1: Lists and Iterables
  - [x] List slicing, appending, and for loops.
  - [x] Refactoring standard loops into List Comprehensions.
- [x] Task 2.2: Dictionaries and Data Mapping
  - [x] Key-value pairing, .get() method, and nested dictionaries.
- [x] Task 2.3: [PROJECT] Interactive Terminal Menu
  - [x] Description: Use the inquirer and rich libraries to build a beautiful CLI menu.
  - [x] Acceptance Criteria: Menu must navigate using arrow keys. Output must use rich formatting (colors, bold text, progress bars).
  - [x] Verification: Agent runs script in terminal, verifies the menu is interactive and handles KeyboardInterrupt gracefully.

## 📅 Week 3: Object-Oriented Programming (OOP)
**Focus:** Classes, Objects, Inheritance, and Encapsulation.

- [x] Task 3.1: The Blueprint (Classes & Instances)
  - [x] __init__ constructor, self parameter, and instance variables.
- [x] Task 3.2: Inheritance and Polymorphism
  - [x] Subclasses, overriding methods, and the super() function.
- [x] Task 3.3: [PROJECT] The Spaced Repetition Flashcard Engine
  - [x] Description: An active recall application based on the Leitner system.
  - [x] Acceptance Criteria: Must use OOP. A Card class, a Deck class, and a LeitnerSystem class. Cards answered correctly extend intervals; hard cards repeat daily.
  - [x] Feature: Must save state to a local data.json file.
  - [x] Verification: Agent writes unit tests (test_flashcards.py) to verify that card intervals change correctly based on right/wrong answers.

## 📅 Week 4: File I/O, APIs, and Error Handling
**Focus:** Reading/Writing files, requests library, and robust exception handling.
**Common Pitfalls Monitored:** Unclosed files (enforce use of with context managers), bare except: blocks.

- [x] Task 4.1: Context Managers
  - [x] Reading and writing text and JSON files using with open(...).
- [x] Task 4.2: Web Requests
  - [x] Fetching data from a public REST API (e.g., a weather API or trivia API).
- [x] Task 4.3: [PROJECT] CLI Trivia Game
  - [x] Description: Fetch questions from an online Open Trivia Database, parse the JSON, and use rich to present them to the user.
  - [x] Acceptance Criteria: Track score, give formatted feedback, gracefully handle network disconnects using specific exceptions (requests.exceptions.ConnectionError).

## 📅 Week 5: Introduction to Graphics with Python Arcade
**Focus:** Moving from terminal to GUI, coordinate systems, and drawing primitives.

- [x] Task 5.1: Arcade Initialization
  - [x] Setup the arcade.Window, on_draw(), and understand the bottom-left origin Cartesian coordinate system.
- [x] Task 5.2: Drawing & Movement
  - [x] Drawing basic shapes, loading textures.
  - [x] Handling keyboard input via on_key_press() to move a basic object. Abstracting the game loop with arcade.run().
- [x] Task 5.3: [PROJECT] Interactive Generative Art
  - [x] Description: Use loops and math to generate a visually appealing, animated screen saver.
  - [x] Acceptance Criteria: Must utilize arcade.start_render() and arcade.finish_render().
  - [x] Verification: Agent writes an artifact implementation_plan.md describing the math/geometry used. User must run /grill-me to discuss the geometry before coding.

## 📅 Week 6: Game Development Capstone
**Focus:** Sprites, Collision Detection, and Physics.

- [x] Task 6.1: Sprites and SpriteLists
  - [x] Creating arcade.Sprite objects and grouping them in a SpriteList for efficient GPU batch rendering.
- [x] Task 6.2: Physics Engine
  - [x] Setting up arcade.PhysicsEngineSimple for gravity and platform collisions.
- [x] Task 6.3: [PROJECT] 2D Platformer Game
  - [x] Description: A multi-level jumping game with coins, enemies, and a win state.
  - [x] Acceptance Criteria: Player must be able to jump, collide with walls, and collect items resulting in a score update.
  - [x] Verification: Agent creates a walkthrough document and uses the /browser subagent to confirm file structures (assets loaded correctly).

## 📅 Week 7: Machine Learning Fundamentals (Scikit-Learn)
**Focus:** Data manipulation, arrays, and basic classification.

- [x] Task 7.1: Intro to Datasets
  - [x] Load sklearn.datasets.load_iris(). Understand features (X) and targets (y).
- [x] Task 7.2: Basic Classifiers
  - [x] Train a K-Nearest Neighbors (KNN) or Decision Tree classifier.
  - [x] Understand train_test_split and data leakage.
- [x] Task 7.3: [PROJECT] Handwritten Digit Recognizer
  - [x] Description: Use load_digits() to train a model that recognizes 8x8 pixel images of numbers.
  - [x] Acceptance Criteria: Print a classification report and confusion matrix to the terminal using rich tables.

## 📅 Week 8: Advanced ML Pipelines and Deployment
**Focus:** Preprocessing, ColumnTransformer, and Pipeline.

- [x] Task 8.1: The Preprocessing Problem
  - [x] Setup StandardScaler for numerical data and OneHotEncoder for categorical data.
- [x] Task 8.2: Building the Pipeline
  - [x] Use ColumnTransformer with remainder='passthrough'.
  - [x] Chain the preprocessor and estimator using make_pipeline.
- [x] Task 8.3: [PROJECT] The Health Predictor (Diabetes Dataset)
  - [x] Description: Use load_diabetes() regression dataset. Build a modular, reproducible ML pipeline that scales numerical inputs and predicts disease progression.
  - [x] Acceptance Criteria: Must use Pipeline and ColumnTransformer. Must tune hyperparameters using GridSearchCV.
  - [x] Verification: Agent runs the full pipeline script to ensure it executes without errors and achieves a positive R-squared score.

---

**Agent Directive:** Upon completion of Week 8, generate a CERTIFICATE.md artifact summarizing the user's journey, strengths, and recommended next steps for continued learning.
