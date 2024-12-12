---
outline: deep
---

# Configuration

Project configuration is stored in `jurassic.json` file 🕵️‍♀️ Looking for config.
Start from `cwd` and keep going up if needed looking for `jurassic.json`. When
running notebooks, it seems like `cwd` points to notebook's directory (at least
when running in VS Code). Hence this extra gymnastics, just to be on the safe
side. Notice `d` (depth) and `maxD` (max depth) to make sure things don't get
out of control Load and parse config.
