def accuracy_score(y_true, y_pred):
    correct = sum(1 for a, b in zip(y_true, y_pred) if a == b)
    return correct / len(y_true) if y_true else 0.0


def confusion_matrix(y_true, y_pred):
    labels = sorted(list(set(y_true) | set(y_pred)))
    label_to_idx = {l: i for i, l in enumerate(labels)}
    size = len(labels)
    matrix = [[0] * size for _ in range(size)]
    for true, pred in zip(y_true, y_pred):
        matrix[label_to_idx[true]][label_to_idx[pred]] += 1
    return matrix


def classification_report(y_true, y_pred):
    labels = sorted(list(set(y_true) | set(y_pred)))
    lines = ["              precision    recall  f1-score   support\n"]
    for l in labels:
        tp = sum(1 for a, b in zip(y_true, y_pred) if a == l and b == l)
        pred_pos = sum(1 for b in y_pred if b == l)
        true_pos = sum(1 for a in y_true if a == l)

        prec = tp / pred_pos if pred_pos else 0.0
        rec = tp / true_pos if true_pos else 0.0
        f1 = (2 * prec * rec) / (prec + rec) if (prec + rec) else 0.0

        lines.append(f"     class {l}       {prec:.2f}      {rec:.2f}      {f1:.2f}        {true_pos}\n")

    acc = accuracy_score(y_true, y_pred)
    lines.append(f"\n    accuracy                           {acc:.2f}       {len(y_true)}\n")
    return "".join(lines)


def r2_score(y_true, y_pred):
    if not y_true:
        return 0.0
    mean_y = sum(y_true) / len(y_true)
    ss_tot = sum((y - mean_y) ** 2 for y in y_true)
    ss_res = sum((y - y_hat) ** 2 for y, y_hat in zip(y_true, y_pred))
    if ss_tot == 0:
        return 0.0
    return 1.0 - (ss_res / ss_tot)
