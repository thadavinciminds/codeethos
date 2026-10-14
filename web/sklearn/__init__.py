"""Lightweight pure-Python shim for scikit-learn (sklearn).
Provides genuine dataset bunches, estimators (KNN, DecisionTree, Ridge),
data preprocessing, metrics, and pipeline composition for education and testing.
"""

from . import datasets, model_selection, metrics, preprocessing, compose, pipeline
from .neighbors import KNeighborsClassifier
from .tree import DecisionTreeClassifier
from .pipeline import Pipeline, make_pipeline

__all__ = [
    "datasets",
    "model_selection",
    "metrics",
    "preprocessing",
    "compose",
    "pipeline",
    "KNeighborsClassifier",
    "DecisionTreeClassifier",
    "Pipeline",
    "make_pipeline",
]
