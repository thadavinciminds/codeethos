"""Verifies Week 1 challenges: every reference solution must pass all hidden
tests, and every starter scaffold must fail (so students actually have work to do).

Run from web/:  python -m pytest tests -q
"""
import builtins
import io
import json
import subprocess
import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))
subprocess.run(["node", "scripts/dump-content.mjs"], cwd=ROOT, check=True, shell=sys.platform == "win32")
WEEKS = json.loads((ROOT / "tests/.cache/content.json").read_text(encoding="utf-8"))


def run(code: str, stdin: str, check: str) -> tuple[bool, str]:
    """Mirror of the browser harness in src/engine/py.worker.js."""
    out = io.StringIO()
    lines = io.StringIO(stdin)
    real_input, old_out = builtins.input, sys.stdout

    def fake_input(prompt=""):
        out.write(str(prompt))
        line = lines.readline()
        if line == "":
            raise EOFError("no more input")
        out.write(line)
        return line.rstrip("\r\n")

    builtins.input, sys.stdout = fake_input, out
    ns = {"__name__": "__main__"}
    ok, err = True, ""
    try:
        exec(compile(code, "main.py", "exec"), ns)
    except BaseException as e:  # noqa: BLE001 - mirror harness behaviour
        ok, err = False, f"{type(e).__name__}: {e}"
    finally:
        builtins.input, sys.stdout = real_input, old_out
    if not ok:
        return False, err
    cns = dict(ns, output=out.getvalue(), error_type="", source=code)
    try:
        exec(check, cns)
    except AssertionError as e:
        return False, f"check failed: {e}"
    except BaseException as e:
        return False, f"check failed: {type(e).__name__}: {e}"
    return True, ""


CHALLENGES = [
    pytest.param(step, id=f"{lesson['id']}-{step['title']}")
    for week in WEEKS
    for lesson in week["lessons"]
    for step in lesson["steps"]
    if step["type"] == "challenge"
]


@pytest.mark.parametrize("step", CHALLENGES)
def test_solution_passes_all_tests(step):
    for t in step["tests"]:
        ok, msg = run(step["solution"], t.get("stdin", ""), t.get("check", ""))
        assert ok, f"{t['name']}: {msg}"


@pytest.mark.parametrize("step", CHALLENGES)
def test_starter_fails(step):
    results = [run(step["starter"], t.get("stdin", ""), t.get("check", ""))[0] for t in step["tests"]]
    assert not all(results), "starter code should not already pass every test"


def test_predict_answers_are_valid():
    for week in WEEKS:
        for lesson in week["lessons"]:
            for step in lesson["steps"]:
                if step["type"] == "predict":
                    assert 0 <= step["answer"] < len(step["options"])
                if step["type"] == "quiz":
                    assert len(step["questions"]) == 5
                    for q in step["questions"]:
                        assert 0 <= q["answer"] < len(q["options"])
