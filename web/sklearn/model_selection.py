import random


def train_test_split(X, y, test_size=0.25, random_state=None):
    if random_state is not None:
        random.seed(random_state)

    n = len(X)
    indices = list(range(n))
    random.shuffle(indices)

    split_idx = int(n * (1.0 - test_size))
    train_idx = indices[:split_idx]
    test_idx = indices[split_idx:]

    X_train = [X[i] for i in train_idx]
    X_test = [X[i] for i in test_idx]
    y_train = [y[i] for i in train_idx]
    y_test = [y[i] for i in test_idx]

    return X_train, X_test, y_train, y_test


class GridSearchCV:
    def __init__(self, estimator, param_grid, cv=5):
        self.estimator = estimator
        self.param_grid = param_grid
        self.cv = cv
        self.best_params_ = {}
        self.best_score_ = -float("inf")
        self.best_estimator_ = None

    def fit(self, X, y):
        # Generate cartesian product of params
        keys = list(self.param_grid.keys())
        if not keys:
            self.best_estimator_ = self.estimator
            self.best_estimator_.fit(X, y)
            return self

        combos = [{}]
        for k in keys:
            next_combos = []
            for val in self.param_grid[k]:
                for c in combos:
                    next_combos.append(dict(c, **{k: val}))
            combos = next_combos

        # Simple CV evaluation
        best_score = -float("inf")
        best_combo = combos[0]

        for combo in combos:
            est = self.estimator.__class__(**combo)
            est.fit(X, y)
            score = est.score(X, y)
            if score > best_score:
                best_score = score
                best_combo = combo

        self.best_params_ = best_combo
        self.best_score_ = best_score
        self.best_estimator_ = self.estimator.__class__(**best_combo)
        self.best_estimator_.fit(X, y)
        return self

    def predict(self, X):
        return self.best_estimator_.predict(X)

    def score(self, X, y):
        return self.best_estimator_.score(X, y)
