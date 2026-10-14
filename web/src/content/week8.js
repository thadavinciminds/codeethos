// Week 8 lesson content: Advanced ML Pipelines & Deployment.
// Step types: concept | predict | challenge | quiz
// Python code uses the `py` tag (String.raw + trim) so backslashes stay intact.

const py = (s, ...v) => String.raw(s, ...v).replace(/^\n/, '').replace(/\s+$/, '') + '\n';

export const week8 = {
  id: 8,
  title: 'ML Pipelines & Deployment',
  lessons: [
    // ─────────────────────────────── 8.1
    {
      id: '8.1',
      title: 'The Preprocessing Problem',
      emoji: '⚙️',
      minutes: 10,
      steps: [
        {
          type: 'concept',
          title: 'Feature Scaling: StandardScaler & OneHotEncoder',
          body: `<p>Real-world datasets contain features on wildly different scales (e.g. Age in decades vs. Salary in tens of thousands). Features with larger numbers can unfairly dominate algorithms.</p>
<ul>
<li><b><code>StandardScaler</code></b>: Rescales numerical features to have <b>mean = 0</b> and <b>standard deviation = 1</b> (z-score normalization: <code>z = (x - μ) / σ</code>).</li>
<li><b><code>OneHotEncoder</code></b>: Converts categorical text columns into binary indicator columns (e.g. <code>["US", "EU", "ASIA"]</code> → <code>[1, 0, 0]</code>).</li>
</ul>`,
          code: py`
from sklearn.preprocessing import StandardScaler

raw_data = [
    [10.0, 1000.0],
    [20.0, 2000.0],
    [30.0, 3000.0]
]

scaler = StandardScaler()
scaled = scaler.fit_transform(raw_data)

print("Original:\n", raw_data)
print("Standardized (mean=0, std=1):\n", [[round(v, 2) for v in row] for row in scaled])
`,
        },
        {
          type: 'predict',
          title: 'Predict the output: Z-score Normalization',
          code: py`
# Values: [10, 20, 30] -> mean = 20
mean = 20.0
std = 8.165

# For value = 20 (exact mean):
z = (20.0 - mean) / std
print("Z-score of mean:", round(z, 2))
`,
          question: 'What is the z-score of the mean value?',
          options: ['1.0', '0.0', '20.0', '-1.0'],
          answer: 1,
          explain: 'A data point equal to the average has a deviation of <code>0</code>, resulting in a standardized z-score of <b>0.0</b>.',
        },
        {
          type: 'challenge',
          title: 'Challenge: Robust Feature Preprocessor',
          body: `<p>Write a function <code>standardize_matrix(data)</code> that fits and transforms an input feature matrix:</p>
<ol>
<li>Instantiates a <code>StandardScaler()</code>.</li>
<li>Calls <code>fit_transform(data)</code>.</li>
<li>Rounds each float to <code>3</code> decimal places.</li>
<li>Returns a dictionary: <code>{"scaler": scaler, "scaled_data": rounded_data, "mean": scaler.mean_}</code>.</li>
</ol>`,
          starter: py`
from sklearn.preprocessing import StandardScaler

def standardize_matrix(data):
    # TODO: fit_transform using StandardScaler, round values to 3 decimals, return dict
    return {}
`,
          tests: [
            {
              name: 'Scales matrix and centers mean at zero',
              check: py`
matrix = [[1.0, 100.0], [2.0, 200.0], [3.0, 300.0]]
res = standardize_matrix(matrix)

assert isinstance(res["scaler"], StandardScaler)
assert res["mean"] == [2.0, 200.0]
assert res["scaled_data"][1] == [0.0, 0.0], "Middle row (mean) should scale to [0.0, 0.0]"
`,
            },
          ],
          hints: [
            'Instantiate <code>scaler = StandardScaler()</code> and call <code>scaled = scaler.fit_transform(data)</code>.',
            'Round the values with <code>[[round(val, 3) for val in row] for row in scaled]</code>.',
            'Return <code>{"scaler": scaler, "scaled_data": rounded, "mean": scaler.mean_}</code>.',
          ],
          solution: py`
from sklearn.preprocessing import StandardScaler

def standardize_matrix(data):
    scaler = StandardScaler()
    scaled = scaler.fit_transform(data)
    rounded = [[round(val, 3) for val in row] for row in scaled]
    return {
        "scaler": scaler,
        "scaled_data": rounded,
        "mean": scaler.mean_
    }

print("Scaled:", standardize_matrix([[10.0], [20.0], [30.0]]))
`,
        },
      ],
    },

    // ─────────────────────────────── 8.2
    {
      id: '8.2',
      title: 'Building the Pipeline & ColumnTransformer',
      emoji: '🔗',
      minutes: 12,
      steps: [
        {
          type: 'concept',
          title: 'ColumnTransformer & make_pipeline',
          body: `<p>In production Machine Learning, you must apply different transformers to different columns:</p>
<ul>
<li><code>ColumnTransformer</code> applies scalers to numerical columns while applying encoders to categorical columns and passing through others.</li>
<li><code>Pipeline</code> chains all preprocessing steps directly to the estimator.</li>
</ul>
<p>This encapsulates the entire workflow into a single object: calling <code>pipeline.fit(X_train, y_train)</code> and <code>pipeline.predict(X_test)</code> guarantees zero data leakage.</p>`,
          code: py`
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.neighbors import KNeighborsClassifier

# Example: Scale columns 0 and 1, passthrough the rest
preprocessor = ColumnTransformer(
    transformers=[
        ("num", StandardScaler(), [0, 1])
    ],
    remainder="passthrough"
)

pipeline = Pipeline([
    ("preprocessor", preprocessor),
    ("classifier", KNeighborsClassifier(n_neighbors=3))
])

print("Pipeline initialized with steps:", [name for name, _ in pipeline.steps])
`,
        },
        {
          type: 'predict',
          title: 'Predict the output: Pipeline encapsulation',
          code: py`
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import KNeighborsClassifier

pipe = make_pipeline(StandardScaler(), KNeighborsClassifier(n_neighbors=1))
print(len(pipe.steps))
`,
          question: 'How many stages are chained in this pipeline?',
          options: ['1', '2', '3', '0'],
          answer: 1,
          explain: '<code>make_pipeline</code> bundles 2 stages: the <code>StandardScaler</code> transformer followed by the <code>KNeighborsClassifier</code> estimator.',
        },
        {
          type: 'quiz',
          title: 'Quiz: ML Pipelines & Production Best Practices',
          passScore: 4,
          questions: [
            {
              q: 'What is the main benefit of bundling transformers and estimators into a Pipeline?',
              options: [
                'It avoids code duplication and eliminates data leakage by applying transforms identically to train and test sets',
                'It converts Python to C++ automatically',
                'It eliminates the need for test labels',
                'It encrypts datasets on disk',
              ],
              answer: 0,
              explain: 'Pipelines enforce that test data is only transformed using parameters learned on training data, preventing data leakage.',
            },
            {
              q: 'What does <code>ColumnTransformer</code> allow you to do?',
              options: [
                'Delete duplicate rows from a database',
                'Apply different transformations to different subsets of columns',
                'Train multiple models at once',
                'Rename columns in a CSV file',
              ],
              answer: 1,
              explain: '<code>ColumnTransformer</code> applies specific transforms (e.g. scaling or encoding) to selected columns while passing the rest.',
            },
            {
              q: 'What does the <code>remainder="passthrough"</code> argument in ColumnTransformer do?',
              options: [
                'Drops all columns not explicitly specified',
                'Leaves columns not explicitly listed untouched in the output',
                'Replaces missing values with zeroes',
                'Raises an exception if extra columns exist',
              ],
              answer: 1,
              explain: 'Setting <code>remainder="passthrough"</code> preserves unlisted columns in the output matrix without modifying them.',
            },
            {
              q: 'What tool systematically searches over specified parameter values for an estimator?',
              options: ['GridSearchCV', 'BinarySearch', 'DataTransformer', 'ColumnSampler'],
              answer: 0,
              explain: '<code>GridSearchCV</code> exhaustively trains and cross-validates across a grid of parameter combinations to select the optimal model hyperparameters.',
            },
            {
              q: 'In regression tasks, what metric measures the proportion of variance explained by the model?',
              options: ['Accuracy', 'Confusion Matrix', 'R-squared (R²)', 'F1-score'],
              answer: 2,
              explain: 'The R-squared ($R^2$) score represents the coefficient of determination, where 1.0 is a perfect fit and 0.0 indicates predicting the baseline mean.',
            },
          ],
        },
        {
          type: 'challenge',
          title: 'Challenge: Modular Pipeline Builder',
          body: `<p>Build a factory function <code>build_ml_pipeline(numeric_cols, n_neighbors=3)</code>:</p>
<ol>
<li>Creates a <code>ColumnTransformer</code> named <code>preprocessor</code> that applies <code>StandardScaler()</code> to the indices in <code>numeric_cols</code> with <code>remainder="passthrough"</code>.</li>
<li>Creates a <code>Pipeline</code> with two steps:
  <ul>
    <li><code>("preprocessor", preprocessor)</code></li>
    <li><code>("classifier", KNeighborsClassifier(n_neighbors=n_neighbors))</code></li>
  </ul>
</li>
<li>Returns the constructed <code>Pipeline</code> instance.</li>
</ol>`,
          starter: py`
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.neighbors import KNeighborsClassifier

def build_ml_pipeline(numeric_cols, n_neighbors=3):
    # TODO: assemble and return the Pipeline
    return None
`,
          tests: [
            {
              name: 'Pipeline trains and classifies end-to-end',
              check: py`
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split

iris = load_iris()
X_tr, X_te, y_tr, y_te = train_test_split(iris.data, iris.target, test_size=0.2, random_state=42)

pipeline = build_ml_pipeline(numeric_cols=[0, 1, 2, 3], n_neighbors=3)
assert isinstance(pipeline, Pipeline)
assert len(pipeline.steps) == 2

pipeline.fit(X_tr, y_tr)
test_acc = pipeline.score(X_te, y_te)
assert test_acc >= 0.9, f"Expected pipeline test accuracy >= 0.9, got {test_acc}"
`,
            },
          ],
          hints: [
            'Create preprocessor: <code>preprocessor = ColumnTransformer([("scale", StandardScaler(), numeric_cols)], remainder="passthrough")</code>.',
            'Assemble Pipeline: <code>return Pipeline([("preprocessor", preprocessor), ("classifier", KNeighborsClassifier(n_neighbors=n_neighbors))])</code>.',
          ],
          solution: py`
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.neighbors import KNeighborsClassifier

def build_ml_pipeline(numeric_cols, n_neighbors=3):
    preprocessor = ColumnTransformer(
        transformers=[
            ("scaler", StandardScaler(), list(numeric_cols))
        ],
        remainder="passthrough"
    )
    return Pipeline([
        ("preprocessor", preprocessor),
        ("classifier", KNeighborsClassifier(n_neighbors=n_neighbors))
    ])

# Test instantiation
pipe = build_ml_pipeline([0, 1])
print("Built pipeline successfully:", pipe)
`,
        },
      ],
    },

    // ─────────────────────────────── 8.3
    {
      id: '8.3',
      title: 'Project: Health Predictor (Diabetes Regression)',
      emoji: '🩺',
      minutes: 15,
      steps: [
        {
          type: 'concept',
          title: 'The Diabetes Regression Dataset & Pipeline Deployment',
          body: `<p>In this capstone, we predict disease progression based on 10 physiological variables (age, sex, BMI, blood pressure, etc.).</p>
<p>Unlike classification (predicting distinct categories), <b>regression</b> predicts continuous numerical values.</p>
<p>We assemble a complete reproducible ML system: data splitting, column standardization, Ridge regression, and hyperparameter tuning with <code>GridSearchCV</code>.</p>`,
          code: py`
from sklearn.datasets import load_diabetes

diabetes = load_diabetes()
print("Patients count:", len(diabetes.data))
print("Variables:", diabetes.feature_names)
print("Target sample values (disease progression):", diabetes.target[:5])
`,
        },
        {
          type: 'challenge',
          title: 'Project: The Health Predictor Pipeline',
          body: `<p>Build the full <code>HealthPredictor</code> system:</p>
<ol>
<li><code>HealthPredictor</code> class:
  <ul>
    <li><code>__init__(self, alpha=1.0)</code>:
      <ul>
        <li>Sets up <code>self.preprocessor = ColumnTransformer([("scaler", StandardScaler(), list(range(10)))], remainder="passthrough")</code>.</li>
        <li>Sets up <code>self.regressor = Ridge(alpha=alpha)</code>.</li>
        <li>Assembles <code>self.pipeline = Pipeline([("preprocessor", self.preprocessor), ("regressor", self.regressor)])</code>.</li>
      </ul>
    </li>
    <li><code>train(self, X_train, y_train)</code>:
      <ul>
        <li>Fits <code>self.pipeline.fit(X_train, y_train)</code>.</li>
      </ul>
    </li>
    <li><code>predict(self, X)</code>:
      <ul>
        <li>Returns predictions from <code>self.pipeline.predict(X)</code>.</li>
      </ul>
    </li>
    <li><code>evaluate(self, X_test, y_test)</code>:
      <ul>
        <li>Calculates $R^2$ score: <code>score = self.pipeline.score(X_test, y_test)</code>.</li>
        <li>Returns <code>{"r2_score": round(score, 3), "status": "pass" if score &gt; 0 else "fail"}</code>.</li>
      </ul>
    </li>
  </ul>
</li>
</ol>`,
          starter: py`
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.linear_model import Ridge

class HealthPredictor:
    def __init__(self, alpha=1.0):
        # TODO: assemble pipeline with ColumnTransformer and Ridge regressor
        pass

    def train(self, X_train, y_train):
        # TODO: fit pipeline
        pass

    def predict(self, X):
        # TODO: return predictions
        return []

    def evaluate(self, X_test, y_test):
        # TODO: return dict with r2_score and status
        return {}
`,
          tests: [
            {
              name: 'HealthPredictor trains on diabetes dataset and achieves positive R2 score',
              check: py`
from sklearn.datasets import load_diabetes
from sklearn.model_selection import train_test_split

diabetes = load_diabetes()
X_tr, X_te, y_tr, y_te = train_test_split(diabetes.data, diabetes.target, test_size=0.2, random_state=42)

model = HealthPredictor(alpha=0.5)
model.train(X_tr, y_tr)
preds = model.predict(X_te)
assert len(preds) == len(y_te)

metrics = model.evaluate(X_te, y_te)
assert metrics["status"] == "pass"
assert metrics["r2_score"] > 0.0, f"Expected positive R2 score, got {metrics['r2_score']}"
`,
            },
          ],
          hints: [
            'In <code>__init__</code>: set <code>self.preprocessor = ColumnTransformer([("scaler", StandardScaler(), list(range(10)))], remainder="passthrough")</code> and <code>self.pipeline = Pipeline([("prep", self.preprocessor), ("model", Ridge(alpha=alpha))])</code>.',
            'In <code>train</code>: call <code>self.pipeline.fit(X_train, y_train)</code>.',
            'In <code>predict</code>: return <code>self.pipeline.predict(X)</code>.',
            'In <code>evaluate</code>: compute <code>r2 = self.pipeline.score(X_test, y_test)</code> and return <code>{"r2_score": round(r2, 3), "status": "pass" if r2 > 0 else "fail"}</code>.',
          ],
          solution: py`
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.linear_model import Ridge
from sklearn.datasets import load_diabetes
from sklearn.model_selection import train_test_split

class HealthPredictor:
    def __init__(self, alpha=1.0):
        self.preprocessor = ColumnTransformer(
            transformers=[
                ("scaler", StandardScaler(), list(range(10)))
            ],
            remainder="passthrough"
        )
        self.regressor = Ridge(alpha=float(alpha))
        self.pipeline = Pipeline([
            ("preprocessor", self.preprocessor),
            ("regressor", self.regressor)
        ])

    def train(self, X_train, y_train):
        self.pipeline.fit(X_train, y_train)

    def predict(self, X):
        return self.pipeline.predict(X)

    def evaluate(self, X_test, y_test):
        score = self.pipeline.score(X_test, y_test)
        return {
            "r2_score": round(score, 3),
            "status": "pass" if score > 0 else "fail"
        }

# Full pipeline run
diabetes = load_diabetes()
X_tr, X_te, y_tr, y_te = train_test_split(diabetes.data, diabetes.target, test_size=0.2, random_state=42)
predictor = HealthPredictor(alpha=0.5)
predictor.train(X_tr, y_tr)
metrics = predictor.evaluate(X_te, y_te)
print("Pipeline evaluation:", metrics)
`,
        },
      ],
    },
  ],
};
