import math
from collections import Counter


class KNeighborsClassifier:
    def __init__(self, n_neighbors=5):
        self.n_neighbors = n_neighbors
        self.X_train = []
        self.y_train = []

    def fit(self, X, y):
        self.X_train = [list(row) for row in X]
        self.y_train = list(y)
        return self

    def _distance(self, a, b):
        return math.sqrt(sum((float(x) - float(y)) ** 2 for x, y in zip(a, b)))

    def predict(self, X):
        predictions = []
        for row in X:
            # calculate distances to all training points
            distances = [(self._distance(row, train_row), label) for train_row, label in zip(self.X_train, self.y_train)]
            distances.sort(key=lambda t: t[0])
            top_k = [label for _, label in distances[: self.n_neighbors]]
            most_common = Counter(top_k).most_common(1)[0][0]
            predictions.append(most_common)
        return predictions

    def score(self, X, y):
        preds = self.predict(X)
        correct = sum(1 for p, actual in zip(preds, y) if p == actual)
        return correct / len(y) if y else 0.0
