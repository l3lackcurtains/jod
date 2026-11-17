---
tags: [jod, fix]
max_turns: 40
timeout_seconds: 900
allowed_tools: [Read, Glob, Grep, Skill, Write, Edit, Bash]
---

/jod:fix customers say a 10% discount code makes the checkout total negative. cartTotal([{priceCents: 2550, qty: 1}], 10) returns -22950, should be 2295.

Input files: package.json, src/cart.js, src/cart.test.js, src/format.js, src/format.test.js, README.md, .claude/jod.md
