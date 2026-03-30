# FlowState Planner (Personalized)

A friendlier, calmer planner for balancing MRes research + classes + sports + personal growth.

## What's new

- Human-centered UI refresh (softer visuals, clearer hierarchy, less mechanical feel).
- Eisenhower Matrix board (Do First / Schedule / Delegate / Eliminate).
- Add new tasks with deadlines and estimated duration.
- Smart weekly planner prioritizes deadline-driven matrix tasks first, then recurring goals.
- Completion tracking + browser reminders.
- Local storage persistence.

## Run locally

1. Open `index.html` directly in browser, or
2. Use a local server:

```bash
cd /workspace/John-Calendar
python3 -m http.server 8000
```

Open `http://localhost:8000`.

## Personalization

- Update `fixedCommitments` in `app.js`.
- Add recurring goals in UI.
- Add one-off tasks in the Eisenhower panel with deadline + urgency/importance.
