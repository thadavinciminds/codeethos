class Pipeline:
    def __init__(self, steps):
        self.steps = steps

    def fit(self, X, y=None):
        cur_X = X
        for name, step in self.steps[:-1]:
            cur_X = step.fit_transform(cur_X, y)
        self.steps[-1][1].fit(cur_X, y)
        return self

    def predict(self, X):
        cur_X = X
        for name, step in self.steps[:-1]:
            cur_X = step.transform(cur_X)
        return self.steps[-1][1].predict(cur_X)

    def score(self, X, y):
        cur_X = X
        for name, step in self.steps[:-1]:
            cur_X = step.transform(cur_X)
        return self.steps[-1][1].score(cur_X, y)


def make_pipeline(*steps):
    pipeline_steps = [(f"step_{i}", s) for i, s in enumerate(steps)]
    return Pipeline(pipeline_steps)
