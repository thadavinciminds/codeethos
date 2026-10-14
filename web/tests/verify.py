"""Standalone content verification runner (no pytest dependency required)."""
import builtins
import io
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))
subprocess.run(["node", "scripts/dump-content.mjs"], cwd=ROOT, check=True, shell=sys.platform == "win32")
WEEKS = json.loads((ROOT / "tests/.cache/content.json").read_text(encoding="utf-8"))


def run(code: str, stdin: str, check: str) -> tuple[bool, str]:
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
    except BaseException as e:
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


passed = 0
failed = 0

print(f"Loaded {len(WEEKS)} weeks.")

for week in WEEKS:
    print(f"\n--- Week {week['id']}: {week['title']} ---")
    for lesson in week["lessons"]:
        print(f"Lesson {lesson['id']}: {lesson['title']}")
        for step in lesson["steps"]:
            stype = step["type"]
            title = step["title"]

            if stype == "predict":
                assert 0 <= step["answer"] < len(step["options"]), f"Invalid predict answer in {title}"
                passed += 1

            elif stype == "quiz":
                assert len(step["questions"]) == 5, f"Quiz must have exactly 5 questions in {title}"
                for i, q in enumerate(step["questions"]):
                    assert 0 <= q["answer"] < len(q["options"]), f"Invalid quiz answer in {title} Q{i+1}"
                passed += 1

            elif stype == "challenge":
                # 1. Solution passes all tests
                for t in step["tests"]:
                    ok, msg = run(step["solution"], t.get("stdin", ""), t.get("check", ""))
                    if not ok:
                        print(f"  [FAIL Solution] {title} - {t['name']}: {msg}")
                        failed += 1
                    else:
                        passed += 1

                # 2. Starter fails at least one test
                starter_results = [run(step["starter"], t.get("stdin", ""), t.get("check", ""))[0] for t in step["tests"]]
                if all(starter_results):
                    print(f"  [FAIL Starter] {title}: starter code already passes all tests!")
                    failed += 1
                else:
                    passed += 1

print(f"\nVerification finished: {passed} checks passed, {failed} failed.")
if failed > 0:
    sys.exit(1)
else:
    print("ALL CONTENT CHECKS PASSED SUCCESSFULLY! [OK]")
