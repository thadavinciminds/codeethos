class ColumnTransformer:
    def __init__(self, transformers, remainder="passthrough"):
        self.transformers = transformers
        self.remainder = remainder

    def fit(self, X, y=None):
        for name, transformer, cols in self.transformers:
            if hasattr(transformer, "fit"):
                sub_X = [[row[c] for c in cols] for row in X]
                transformer.fit(sub_X, y)
        return self

    def transform(self, X):
        all_cols_transformed = set()
        parts = []

        for name, transformer, cols in self.transformers:
            sub_X = [[row[c] for c in cols] for row in X]
            transformed_part = transformer.transform(sub_X)
            parts.append(transformed_part)
            for c in cols:
                all_cols_transformed.add(c)

        if self.remainder == "passthrough":
            num_cols = len(X[0]) if X else 0
            remainder_cols = [c for c in range(num_cols) if c not in all_cols_transformed]
            if remainder_cols:
                rem_part = [[row[c] for c in remainder_cols] for row in X]
                parts.append(rem_part)

        # Concatenate horizontally
        num_rows = len(X)
        result = [[] for _ in range(num_rows)]
        for part in parts:
            for r in range(num_rows):
                result[r].extend(part[r])
        return result

    def fit_transform(self, X, y=None):
        return self.fit(X, y).transform(X)
