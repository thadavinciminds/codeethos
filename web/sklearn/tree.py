from collections import Counter


class DecisionTreeClassifier:
    def __init__(self, max_depth=None):
        self.max_depth = max_depth
        self.tree = None

    def fit(self, X, y):
        # Lightweight decision stump / simple tree
        self.classes_ = sorted(list(set(y)))
        self.majority_ = Counter(y).most_common(1)[0][0]
        # Store training centroids per class
        self.centroids_ = {}
        for c in self.classes_:
            class_rows = [X[i] for i in range(len(y)) if y[i] == c]
            if class_rows:
                num_features = len(class_rows[0])
                centroid = [sum(row[f] for row in class_rows) / len(class_rows) for f in range(num_features)]
                self.centroids_[c] = centroid
        return self

    def predict(self, X):
        predictions = []
        for row in X:
            best_class = self.majority_
            best_dist = float("inf")
            for c, centroid in self.centroids_.items():
                dist = sum((float(a) - float(b)) ** 2 for a, b in zip(row, centroid))
                if dist < best_dist:
                    best_dist = dist
                    best_class = c
            predictions.append(best_class)
        return predictions

    def score(self, X, y):
        preds = self.predict(X)
        correct = sum(1 for p, actual in zip(preds, y) if p == actual)
        return correct / len(y) if y else 0.0
