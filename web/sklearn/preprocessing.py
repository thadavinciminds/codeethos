import math


class StandardScaler:
    def __init__(self):
        self.mean_ = []
        self.scale_ = []

    def fit(self, X, y=None):
        n = len(X)
        if n == 0:
            return self
        num_features = len(X[0])
        self.mean_ = [sum(row[i] for row in X) / n for i in range(num_features)]
        self.scale_ = []
        for i in range(num_features):
            variance = sum((row[i] - self.mean_[i]) ** 2 for row in X) / n
            std = math.sqrt(variance)
            self.scale_.append(std if std > 1e-9 else 1.0)
        return self

    def transform(self, X):
        res = []
        for row in X:
            scaled_row = [(val - m) / s for val, m, s in zip(row, self.mean_, self.scale_)]
            res.append(scaled_row)
        return res

    def fit_transform(self, X, y=None):
        return self.fit(X, y).transform(X)


class OneHotEncoder:
    def __init__(self, sparse_output=False):
        self.sparse_output = sparse_output
        self.categories_ = []

    def fit(self, X, y=None):
        if not X:
            return self
        num_cols = len(X[0])
        self.categories_ = [sorted(list(set(row[i] for row in X))) for i in range(num_cols)]
        return self

    def transform(self, X):
        res = []
        for row in X:
            encoded_row = []
            for col_idx, val in enumerate(row):
                cats = self.categories_[col_idx]
                for cat in cats:
                    encoded_row.append(1.0 if val == cat else 0.0)
            res.append(encoded_row)
        return res

    def fit_transform(self, X, y=None):
        return self.fit(X, y).transform(X)
