// Week 7 lesson content: Machine Learning Fundamentals (Scikit-Learn).
// Step types: concept | predict | challenge | quiz
// Python code uses the `py` tag (String.raw + trim) so backslashes stay intact.

const py = (s, ...v) => String.raw(s, ...v).replace(/^\n/, '').replace(/\s+$/, '') + '\n';

export const week7 = {
  id: 7,
  title: 'Machine Learning Basics',
  lessons: [
    // ─────────────────────────────── 7.1
    {
      id: '7.1',
      title: 'Intro to Datasets (Features & Targets)',
      emoji: '📊',
      minutes: 10,
      steps: [
        {
          type: 'concept',
          title: 'Supervised Learning: Features (X) & Targets (y)',
          body: `<p>In <b>Machine Learning</b>, models learn patterns from historical examples to make predictions on unseen data.</p>
<ul>
<li><b>Features (<code>X</code>)</b>: The input measurements or attributes (a 2D matrix of shape <code>n_samples × n_features</code>).</li>
<li><b>Target (<code>y</code>)</b>: The ground-truth label or outcome we want to predict (a 1D array of length <code>n_samples</code>).</li>
</ul>
<p>The famous <b>Iris dataset</b> contains 150 flower specimens across 3 species, measured by 4 physical traits (sepal length, sepal width, petal length, petal width).</p>`,
          code: py`
from sklearn.datasets import load_iris

iris = load_iris()
X = iris.data
y = iris.target

print("Number of samples:", len(X))
print("Number of features:", len(X[0]))
print("Feature names:", iris.feature_names)
print("Target classes:", iris.target_names)
print("First sample features:", X[0])
print("First sample class label:", y[0], f"({iris.target_names[y[0]]})")
`,
        },
        {
          type: 'predict',
          title: 'Predict the output: Feature matrix dimensions',
          code: py`
data = [
    [5.1, 3.5, 1.4, 0.2],
    [4.9, 3.0, 1.4, 0.2],
    [4.7, 3.2, 1.3, 0.2]
]
n_samples = len(data)
n_features = len(data[0])
print(f"Shape: ({n_samples}, {n_features})")
`,
          question: 'What is the shape of this feature matrix?',
          options: ['Shape: (3, 4)', 'Shape: (4, 3)', 'Shape: (12, 1)', 'Shape: (3, 1)'],
          answer: 0,
          explain: 'There are 3 rows (samples) and 4 columns (features per sample), yielding shape <b>(3, 4)</b>.',
        },
        {
          type: 'challenge',
          title: 'Challenge: Dataset Inspector',
          body: `<p>Write a function <code>inspect_dataset(bunch)</code> that extracts key statistics from any scikit-learn dataset Bunch:</p>
<ol>
<li><code>n_samples</code>: Total count of rows in <code>bunch.data</code>.</li>
<li><code>n_features</code>: Number of features in the first row of <code>bunch.data</code>.</li>
<li><code>classes</code>: List of unique target values present in <code>bunch.target</code> (sorted).</li>
<li><code>class_counts</code>: Dictionary mapping each class label to its frequency in <code>bunch.target</code>.</li>
<li>Return the dictionary: <code>{"samples": n_samples, "features": n_features, "classes": classes, "counts": class_counts}</code>.</li>
</ol>`,
          starter: py`
from collections import Counter

def inspect_dataset(bunch):
    # TODO: compute samples, features, classes, and counts
    return {}
`,
          tests: [
            {
              name: 'Extracts accurate statistics from Iris dataset',
              check: py`
from sklearn.datasets import load_iris
iris = load_iris()
stats = inspect_dataset(iris)

assert stats["samples"] == 150
assert stats["features"] == 4
assert stats["classes"] == [0, 1, 2]
assert stats["counts"] == {0: 50, 1: 50, 2: 50}
`,
            },
          ],
          hints: [
            'Count samples with <code>len(bunch.data)</code> and features with <code>len(bunch.data[0])</code>.',
            'Compute unique sorted classes with <code>sorted(list(set(bunch.target)))</code>.',
            'Use <code>dict(Counter(bunch.target))</code> to map class frequencies.',
          ],
          solution: py`
from collections import Counter
from sklearn.datasets import load_iris

def inspect_dataset(bunch):
    n_samples = len(bunch.data)
    n_features = len(bunch.data[0]) if n_samples > 0 else 0
    classes = sorted(list(set(bunch.target)))
    counts = dict(Counter(bunch.target))
    return {
        "samples": n_samples,
        "features": n_features,
        "classes": classes,
        "counts": counts
    }

iris = load_iris()
print("Dataset summary:", inspect_dataset(iris))
`,
        },
      ],
    },

    // ─────────────────────────────── 7.2
    {
      id: '7.2',
      title: 'Classifiers & Train/Test Split',
      emoji: '🧠',
      minutes: 12,
      steps: [
        {
          type: 'concept',
          title: 'Train/Test Split & Preventing Data Leakage',
          body: `<p>If you evaluate a model on the exact same data it was trained on, it might simply memorize the answers (<b>overfitting</b>).</p>
<p>To measure genuine generalization ability, always split your dataset into two sets:</p>
<ul>
<li><b>Training set (e.g. 80%)</b>: Used by the model to learn weights/rules.</li>
<li><b>Testing set (e.g. 20%)</b>: Held out until evaluation to simulate real-world unseen data.</li>
</ul>
<p>In scikit-learn, use <code>train_test_split(X, y, test_size=0.2, random_state=42)</code>.</p>`,
          code: py`
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier

iris = load_iris()
X_train, X_test, y_train, y_test = train_test_split(iris.data, iris.target, test_size=0.2, random_state=42)

print(f"Total: {len(iris.data)} | Train: {len(X_train)} | Test: {len(X_test)}")

# Train a K-Nearest Neighbors (KNN) model
knn = KNeighborsClassifier(n_neighbors=3)
knn.fit(X_train, y_train)

train_acc = knn.score(X_train, y_train)
test_acc = knn.score(X_test, y_test)
print(f"Train Accuracy: {train_acc:.2%}")
print(f"Test Accuracy:  {test_acc:.2%}")
`,
        },
        {
          type: 'predict',
          title: 'Predict the output: Decision Tree classification',
          code: py`
from sklearn.tree import DecisionTreeClassifier

# Simple 1D threshold dataset: values <= 5 are class 0, > 5 are class 1
X_train = [[1], [3], [4], [7], [9], [10]]
y_train = [0, 0, 0, 1, 1, 1]

clf = DecisionTreeClassifier()
clf.fit(X_train, y_train)

test_sample = [[8]]
prediction = clf.predict(test_sample)
print(prediction)
`,
          question: 'What is the predicted class for sample [[8]]?',
          options: ['[0]', '[1]', '[0.5]', 'TypeError'],
          answer: 1,
          explain: 'Since <code>8</code> is closer to the high group (7, 9, 10), the tree classifies it as <b>[1]</b>.',
        },
        {
          type: 'quiz',
          title: 'Quiz: Machine Learning Essentials',
          passScore: 4,
          questions: [
            {
              q: 'What is the primary purpose of splitting data into train and test sets?',
              options: [
                'To reduce file size on disk',
                'To verify the model generalizes well to unseen data and prevent overfitting',
                'To double the amount of training examples',
                'To encrypt the target labels',
              ],
              answer: 1,
              explain: 'Evaluating on held-out test data provides an unbiased estimate of how well the model performs on real-world unseen inputs.',
            },
            {
              q: 'What is "Data Leakage" in Machine Learning?',
              options: [
                'When information from the test set inadvertently influences model training',
                'When a database password is leaked',
                'When numbers lose precision due to floating-point rounding',
                'When training data contains duplicate rows',
              ],
              answer: 0,
              explain: 'Data leakage occurs when test information bleeds into training, leading to unrealistically optimistic validation metrics that collapse in production.',
            },
            {
              q: 'How does the K-Nearest Neighbors (KNN) algorithm classify a new point?',
              options: [
                'By training a deep neural network',
                'By assigning the majority label among the K closest training points',
                'By calculating a linear regression slope',
                'By randomly guessing between the target categories',
              ],
              answer: 1,
              explain: 'KNN computes distances to all training points and assigns the most frequent class among the K nearest neighbors.',
            },
            {
              q: 'What standard method is called to train an estimator in scikit-learn?',
              options: ['model.train(X, y)', 'model.fit(X, y)', 'model.learn(X, y)', 'model.run(X, y)'],
              answer: 1,
              explain: 'All scikit-learn estimators implement the unified <code>.fit(X, y)</code> interface.',
            },
            {
              q: 'What does a model score of 1.0 (100%) on the test set mean?',
              options: [
                'The model made zero errors on that test partition',
                'The dataset was empty',
                'The model must be retrained',
                'The code has an infinite loop',
              ],
              answer: 0,
              explain: 'Accuracy is the ratio of correct predictions over total predictions. An accuracy score of 1.0 indicates 100% correct classifications on that test split.',
            },
          ],
        },
        {
          type: 'challenge',
          title: 'Challenge: Model Trainer & Evaluator',
          body: `<p>Build a model evaluation pipeline function <code>train_and_evaluate(X, y, n_neighbors=3, test_size=0.2, random_state=42)</code>:</p>
<ol>
<li>Splits <code>X</code> and <code>y</code> using <code>train_test_split(...)</code>.</li>
<li>Instantiates a <code>KNeighborsClassifier(n_neighbors=n_neighbors)</code>.</li>
<li>Fits the classifier on <code>X_train</code> and <code>y_train</code>.</li>
<li>Calculates accuracy on training set: <code>train_score = model.score(X_train, y_train)</code>.</li>
<li>Calculates accuracy on test set: <code>test_score = model.score(X_test, y_test)</code>.</li>
<li>Returns a dictionary: <code>{"model": model, "train_acc": train_score, "test_acc": test_score}</code>.</li>
</ol>`,
          starter: py`
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier

def train_and_evaluate(X, y, n_neighbors=3, test_size=0.2, random_state=42):
    # TODO: split, fit KNN, compute scores, return dict
    return {}
`,
          tests: [
            {
              name: 'Trains KNN model and returns high accuracy metrics on Iris',
              check: py`
from sklearn.datasets import load_iris
iris = load_iris()
results = train_and_evaluate(iris.data, iris.target, n_neighbors=3, test_size=0.2, random_state=42)

assert isinstance(results["model"], KNeighborsClassifier)
assert 0.9 <= results["train_acc"] <= 1.0, f"Expected train accuracy >= 0.9, got {results['train_acc']}"
assert 0.9 <= results["test_acc"] <= 1.0, f"Expected test accuracy >= 0.9, got {results['test_acc']}"
`,
            },
          ],
          hints: [
            'Call <code>X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=test_size, random_state=random_state)</code>.',
            'Instantiate <code>clf = KNeighborsClassifier(n_neighbors=n_neighbors)</code> and call <code>clf.fit(X_tr, y_tr)</code>.',
            'Return <code>{"model": clf, "train_acc": clf.score(X_tr, y_tr), "test_acc": clf.score(X_te, y_te)}</code>.',
          ],
          solution: py`
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier
from sklearn.datasets import load_iris

def train_and_evaluate(X, y, n_neighbors=3, test_size=0.2, random_state=42):
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state
    )
    model = KNeighborsClassifier(n_neighbors=n_neighbors)
    model.fit(X_train, y_train)
    train_acc = model.score(X_train, y_train)
    test_acc = model.score(X_test, y_test)
    return {
        "model": model,
        "train_acc": train_acc,
        "test_acc": test_acc
    }

iris = load_iris()
res = train_and_evaluate(iris.data, iris.target)
print(f"Train: {res['train_acc']:.2%}, Test: {res['test_acc']:.2%}")
`,
        },
      ],
    },

    // ─────────────────────────────── 7.3
    {
      id: '7.3',
      title: 'Project: Handwritten Digit Recognizer',
      emoji: '🔢',
      minutes: 15,
      steps: [
        {
          type: 'concept',
          title: 'Computer Vision: Classifying 8x8 Pixel Images',
          body: `<p>The <b>load_digits</b> dataset consists of 8×8 pixel images of handwritten numerals (0 through 9).</p>
<p>Each image is flattened into a 64-dimensional feature vector, where each feature represents the grayscale intensity of that pixel (from 0 to 16).</p>
<p>We train a classifier to predict which digit is drawn from pixel intensity values, then generate a <b>Confusion Matrix</b> and <b>Classification Report</b>.</p>`,
          code: py`
from sklearn.datasets import load_digits
from sklearn.metrics import classification_report, confusion_matrix

digits = load_digits()
print("Images count:", len(digits.data))
print("Pixels per image:", len(digits.data[0]))
print("Target classes:", digits.target_names)
`,
        },
        {
          type: 'challenge',
          title: 'Project: The Digit Classifier Pipeline',
          body: `<p>Build a handwritten digit classification engine:</p>
<ol>
<li><code>DigitRecognizer</code> class:
  <ul>
    <li><code>__init__(self, n_neighbors=3)</code>: initializes <code>self.model = KNeighborsClassifier(n_neighbors=n_neighbors)</code> and sets <code>self.is_trained = False</code>.</li>
    <li><code>train(self, X_train, y_train)</code>: fits <code>self.model</code> on training data and sets <code>self.is_trained = True</code>.</li>
    <li><code>predict(self, X)</code>: calls <code>self.model.predict(X)</code>.</li>
    <li><code>evaluate(self, X_test, y_test)</code>:
      <ul>
        <li>Generates predictions: <code>y_pred = self.predict(X_test)</code>.</li>
        <li>Computes accuracy: <code>accuracy_score(y_test, y_pred)</code>.</li>
        <li>Computes confusion matrix: <code>confusion_matrix(y_test, y_pred)</code>.</li>
        <li>Computes classification report: <code>classification_report(y_test, y_pred)</code>.</li>
        <li>Returns a dictionary: <code>{"accuracy": acc, "matrix": matrix, "report": report}</code>.</li>
      </ul>
    </li>
  </ul>
</li>
</ol>`,
          starter: py`
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report

class DigitRecognizer:
    def __init__(self, n_neighbors=3):
        # TODO: initialize attributes
        pass

    def train(self, X_train, y_train):
        # TODO: fit model and update is_trained
        pass

    def predict(self, X):
        # TODO: return predictions
        return []

    def evaluate(self, X_test, y_test):
        # TODO: return dict with accuracy, matrix, report
        return {}
`,
          tests: [
            {
              name: 'DigitRecognizer trains and predicts accurately',
              check: py`
from sklearn.datasets import load_digits
from sklearn.model_selection import train_test_split

digits = load_digits()
X_tr, X_te, y_tr, y_te = train_test_split(digits.data, digits.target, test_size=0.2, random_state=42)

clf = DigitRecognizer(n_neighbors=3)
assert clf.is_trained is False
clf.train(X_tr, y_tr)
assert clf.is_trained is True

eval_res = clf.evaluate(X_te, y_te)
assert eval_res["accuracy"] >= 0.85, f"Expected accuracy >= 0.85, got {eval_res['accuracy']}"
assert isinstance(eval_res["matrix"], list)
assert isinstance(eval_res["report"], str)
assert "precision" in eval_res["report"]
`,
            },
          ],
          hints: [
            'In <code>__init__</code>: set <code>self.model = KNeighborsClassifier(n_neighbors=n_neighbors)</code> and <code>self.is_trained = False</code>.',
            'In <code>train</code>: call <code>self.model.fit(X_train, y_train)</code> and set <code>self.is_trained = True</code>.',
            'In <code>evaluate</code>: compute <code>preds = self.predict(X_test)</code>, then return <code>{"accuracy": accuracy_score(y_test, preds), "matrix": confusion_matrix(y_test, preds), "report": classification_report(y_test, preds)}</code>.',
          ],
          solution: py`
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report
from sklearn.datasets import load_digits
from sklearn.model_selection import train_test_split

class DigitRecognizer:
    def __init__(self, n_neighbors=3):
        self.model = KNeighborsClassifier(n_neighbors=n_neighbors)
        self.is_trained = False

    def train(self, X_train, y_train):
        self.model.fit(X_train, y_train)
        self.is_trained = True

    def predict(self, X):
        return self.model.predict(X)

    def evaluate(self, X_test, y_test):
        preds = self.predict(X_test)
        acc = accuracy_score(y_test, preds)
        matrix = confusion_matrix(y_test, preds)
        report = classification_report(y_test, preds)
        return {
            "accuracy": acc,
            "matrix": matrix,
            "report": report
        }

# Demonstration
digits = load_digits()
X_train, X_test, y_train, y_test = train_test_split(digits.data, digits.target, test_size=0.2, random_state=42)
recognizer = DigitRecognizer(n_neighbors=3)
recognizer.train(X_train, y_train)
metrics = recognizer.evaluate(X_test, y_test)
print(f"Digit Recognizer Accuracy: {metrics['accuracy']:.2%}")
`,
        },
      ],
    },
  ],
};
