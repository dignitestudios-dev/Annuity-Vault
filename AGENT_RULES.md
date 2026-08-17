# Agent Rules

These rules govern how the coding agent operates on this codebase (a MERN stack project — work may involve backend, frontend, or both). They apply to every task: bug fixes, new features, refactors, and reviews. Follow them in order of priority when they conflict.

## 1. Never Assume, Never Hallucinate

- Do not invent APIs, file paths, function signatures, config keys, library behavior, or business logic. If it isn't visible in the codebase, docs, or the task description, look it up before writing code that depends on it.
- Before using a library or framework feature, verify it exists in the actual installed version (check `package.json` and `package-lock.json`/`yarn.lock` for both client and server) rather than relying on memory.
- If information needed to proceed correctly is missing or ambiguous, **stop and ask a clarifying question** instead of guessing. A wrong guess that ships is worse than a short delay for clarification.
- Never claim a test passed, a build succeeded, or a change was verified unless it was actually run and the output was observed.
- Do not fabricate citations, changelog entries, commit messages, or reasoning that implies work was done when it wasn't.

## 2. Understand Before Changing

- Read the relevant code (not just the function you're editing) before making a change: callers, callees, related tests, and any shared state or config.
- Identify the root cause of a bug, not just the symptom. A fix that patches a symptom while leaving the root cause is not acceptable.
- For any non-trivial change, briefly state your understanding of the current behavior and your plan before implementing, so mistaken assumptions surface early.

## 3. Protect Existing Behavior

- Any bug fix or new feature must not break or silently change unrelated functionality. Treat this as a hard constraint, not a nice-to-have.
- Before finishing, actively check the "blast radius" of the change:
  - What else calls this function/module/component?
  - What tests currently cover this area? Do they still pass?
  - Are there edge cases (nulls, empty inputs, concurrency, permissions, localization, etc.) that the change could affect?
- Prefer the smallest, most targeted change that correctly solves the problem. Avoid opportunistic rewrites of code unrelated to the task.
- If a change requires touching shared/core logic, explicitly call out what else depends on it and confirm the impact is acceptable.
- Add or update tests to cover the fix/feature, including a regression test for the specific bug when fixing one.
- Stay scoped to the task you were given. If while working you notice an unrelated bug, code smell, security issue, or something that should be improved, **do not fix it on your own** — finish the assigned task first, then report it separately at the end (what you found, where, and why it matters) and let the decision to act on it be made explicitly.

## 4. Follow Industry Best Practices

- Match the existing codebase's conventions (naming, formatting, architecture, folder structure) before applying general best practices — consistency within the project comes first.
- Where the project has no established convention, default to widely accepted standards for the language/framework in use (idiomatic code, SOLID principles where applicable, proper error handling, no dead code, no magic numbers/strings without explanation).
- Handle errors explicitly; do not swallow exceptions or fail silently.
- Validate inputs at boundaries (API endpoints, public functions, user input) rather than assuming well-formed data.
- Never hardcode secrets, credentials, or environment-specific values. Use environment variables / config files consistent with how the project already manages them.
- Write code that is readable and maintainable over code that is clever. Optimize for the next person (or agent) who has to read it.
- Keep functions and modules focused; avoid unnecessary complexity or premature abstraction.

## 5. Optimized, Deliberate Work

- Don't add dependencies, files, or abstractions that aren't needed to solve the task at hand.
- Consider performance implications of the change (e.g., N+1 queries, unnecessary loops, large payloads) when relevant to the task's scope — but don't micro-optimize at the expense of correctness or clarity unless performance is the actual goal.
- Remove now-dead code that your change makes obsolete, but never remove code you don't understand "just in case."

## 6. Verification Before Completion

- After completing the work, run the build to verify nothing is broken. If the build fails, fix the issue before considering the task done — never hand off a broken build.
- Manually trace through the changed logic for the main case and at least one edge case before declaring the task done.
- Summarize what changed, why, and what was verified when reporting completion — don't just say "done."

## 7. When in Doubt, Ask

- If requirements are unclear, conflicting, or could reasonably be interpreted more than one way, ask a specific clarifying question rather than picking an interpretation silently.
- If a requested change seems like it could introduce a security, data-loss, or breaking-change risk, flag it explicitly before proceeding, even if not asked.
- It is always acceptable to pause and ask rather than deliver a confident-but-wrong result.
