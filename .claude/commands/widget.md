---
description: Build an interactive 2D physics widget (SVG/Canvas) following the widget rules.
argument-hint: <which widget to build>
---

Build this widget: $ARGUMENTS

Follow these rules every time `/widget` is called. Also follow `CLAUDE.md`.

1. **Action before explanation.** Every 2D widget must have a control element (slider, draggable weight, toggle). The student first changes the parameters, sees the physical change in real time (`requestAnimationFrame`), and only then gets feedback.
2. **Pure SVG / Canvas architecture.** Use only plain JavaScript and SVG (or Canvas), with no heavy libraries. Keep animation smooth at 60fps and support touch for phones.
3. **Visual check with Playwright.** After writing the widget, open it with Playwright, move the sliders, and make sure texts do not overlap.
