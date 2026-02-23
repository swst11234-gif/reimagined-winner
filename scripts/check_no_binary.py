#!/usr/bin/env python3
"""Fail if files look binary or use disallowed binary extensions.

By default scans tracked files in working tree.
Use --history to scan all blobs reachable from git history.
"""
from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path

DISALLOWED_EXTENSIONS = {
    ".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico", ".bmp", ".pdf",
    ".zip", ".gz", ".tar", ".7z", ".rar", ".woff", ".woff2", ".ttf",
    ".otf", ".eot", ".mp3", ".mp4", ".mov", ".avi",
}


def tracked_files() -> list[Path]:
    out = subprocess.check_output(["git", "ls-files"], text=True)
    return [Path(line.strip()) for line in out.splitlines() if line.strip()]


def history_blobs() -> list[tuple[str, str]]:
    out = subprocess.check_output(["git", "rev-list", "--objects", "--all"], text=True)
    blobs: dict[str, str] = {}
    for line in out.splitlines():
        parts = line.split(" ", 1)
        if len(parts) != 2:
            continue
        sha, path = parts
        try:
            typ = subprocess.check_output(["git", "cat-file", "-t", sha], text=True).strip()
        except subprocess.CalledProcessError:
            continue
        if typ == "blob":
            blobs[sha] = path
    return [(sha, path) for sha, path in blobs.items()]


def blob_bytes(sha: str) -> bytes:
    return subprocess.check_output(["git", "cat-file", "-p", sha])


def looks_binary(data: bytes) -> bool:
    if b"\x00" in data:
        return True
    try:
        data.decode("utf-8")
        return False
    except UnicodeDecodeError:
        return True


def check_working_tree() -> list[str]:
    bad: list[str] = []
    for path in tracked_files():
        if not path.is_file():
            continue
        if path.suffix.lower() in DISALLOWED_EXTENSIONS:
            bad.append(f"{path} (disallowed extension)")
            continue
        if looks_binary(path.read_bytes()):
            bad.append(f"{path} (binary content)")
    return bad


def check_history() -> list[str]:
    bad: list[str] = []
    for sha, path in history_blobs():
        suffix = Path(path).suffix.lower()
        if suffix in DISALLOWED_EXTENSIONS:
            bad.append(f"{path} ({sha[:10]}) disallowed extension")
            continue
        if looks_binary(blob_bytes(sha)):
            bad.append(f"{path} ({sha[:10]}) binary content")
    return bad


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--history", action="store_true", help="Scan all reachable git history blobs")
    args = parser.parse_args()

    bad = check_history() if args.history else check_working_tree()
    if bad:
        print("Binary files are not supported. Found:", file=sys.stderr)
        for item in bad:
            print(f" - {item}", file=sys.stderr)
        return 1

    mode = "history" if args.history else "tracked files"
    print(f"OK: no binary files detected in {mode}.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
