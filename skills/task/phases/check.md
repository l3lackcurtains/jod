# Phase: check (see it working)

Goal: see the change working in the real app, not just in tests.

**When it runs** in a multi-step plan:
- right after a step the plan tags user-visible;
- otherwise once 3 steps are "check pending", covering all of them;
- always after the last step, before `done`.

A single-step plan, or `/jod:task check` on its own, checks now.

1. **Make sure it's the current build.** Check what's listening on the profile's dev ports. Stale containers or old processes can serve an old build, so tell the user.
   - If nothing is running: start it only if the profile allows that; otherwise ask the user to start it.
2. **Exercise the change with the cheapest check that shows it,** as each role the plan names.
   - **API, job or data change:** a real request (`curl`, the API client) or a small script, and read the response. No browser.
   - **CLI or library:** run the real command or a small script against it.
   - **UI change:** the browser, scripted: go straight to the page, do the flow's actions in as few calls as the tool allows (batch them when it can), then read the result, the network requests and console errors once. Capture the key state. Don't explore the app around it; hundreds of single clicks were an hour of a real session.
3. **Verify data when the UI isn't enough.** Use a read-only query. If the profile marks the database as shared or production, never write to it without the user's explicit yes.
4. **Ask first for side effects:** real posts, emails, payments, external webhooks, anything a customer would see.
5. **Clean up** the tabs and processes you opened. Report a table of flow / role → ✅ worked, ❌ the exact error, or ⏭️ not checked (why). A bug found here goes back to build and test, for the step that caused it.
