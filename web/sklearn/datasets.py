import math
import random


class Bunch(dict):
    def __init__(self, **kwargs):
        super().__init__(kwargs)
        self.__dict__ = self


def load_iris():
    # 150 samples, 4 features
    random.seed(42)
    feature_names = ["sepal length (cm)", "sepal width (cm)", "petal length (cm)", "petal width (cm)"]
    target_names = ["setosa", "versicolor", "virginica"]
    data = []
    target = []

    # 50 setosa
    for _ in range(50):
        data.append([round(random.uniform(4.5, 5.5), 1), round(random.uniform(3.0, 4.0), 1), round(random.uniform(1.0, 1.9), 1), round(random.uniform(0.1, 0.4), 1)])
        target.append(0)
    # 50 versicolor
    for _ in range(50):
        data.append([round(random.uniform(5.5, 6.7), 1), round(random.uniform(2.5, 3.4), 1), round(random.uniform(3.5, 4.9), 1), round(random.uniform(1.0, 1.6), 1)])
        target.append(1)
    # 50 virginica
    for _ in range(50):
        data.append([round(random.uniform(6.0, 7.5), 1), round(random.uniform(2.8, 3.8), 1), round(random.uniform(5.0, 6.7), 1), round(random.uniform(1.8, 2.5), 1)])
        target.append(2)

    return Bunch(data=data, target=target, feature_names=feature_names, target_names=target_names)


def load_digits():
    # 8x8 pixel handwritten digits (0-9)
    random.seed(42)
    data = []
    target = []
    target_names = list(range(10))
    for d in range(10):
        for _ in range(10):
            pixels = [round(random.uniform(0.0, 1.0), 1) for _ in range(64)]
            # Distinct stroke signature for class d
            for offset in [0, 8, 16, 24, 32, 40]:
                pixels[(d + offset) % 64] = round(12.0 + random.uniform(0.0, 4.0), 1)
            data.append(pixels)
            target.append(d)

    return Bunch(data=data, target=target, target_names=target_names)


def load_diabetes():
    # 10 physiological variables to predict quantitative progression
    random.seed(42)
    feature_names = ["age", "sex", "bmi", "bp", "s1", "s2", "s3", "s4", "s5", "s6"]
    data = []
    target = []
    for _ in range(100):
        row = [round(random.uniform(-0.1, 0.1), 4) for _ in range(10)]
        data.append(row)
        # linear combination with noise
        y = 150.0 + (row[2] * 500.0) + (row[3] * 300.0) + random.uniform(-10.0, 10.0)
        target.append(round(y, 1))

    return Bunch(data=data, target=target, feature_names=feature_names)
