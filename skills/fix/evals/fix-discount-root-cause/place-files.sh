#!/usr/bin/env bash
# Copies the fixture repo into the run folder as a git repo on `development`.
set -eu
cp -R "$(dirname "$0")/files/." .
git init -q -b development
git add -A
git -c user.name=eval -c user.email=eval@example.com commit -qm "initial"
