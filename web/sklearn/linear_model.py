class Ridge:
    def __init__(self, alpha=1.0):
        self.alpha = float(alpha)
        self.coef_ = []
        self.intercept_ = 0.0

    def fit(self, X, y):
        # Lightweight least-squares gradient descent or pseudo-inverse
        n = len(X)
        if n == 0:
            return self
        d = len(X[0])
        self.intercept_ = sum(y) / n
        self.coef_ = [0.0] * d
        for j in range(d):
            feature_vals = [row[j] for row in X]
            var = sum(v ** 2 for v in feature_vals) + self.alpha
            cov = sum(v * (target - self.intercept_) for v, target in zip(feature_vals, y))
            self.coef_[j] = cov / var if var > 0 else 0.0
        return self

    def predict(self, X):
        return [self.intercept_ + sum(val * c for val, c in zip(row, self.coef_)) for row in X]

    def score(self, X, y):
        from .metrics import r2_score
        return r2_score(y, self.predict(X))


class LinearRegression(Ridge):
    def __init__(self):
        super().__init__(alpha=0.0)
