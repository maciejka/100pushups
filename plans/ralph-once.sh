#!/bin/bash
# ralph-once.sh - HITL (human-in-the-loop) mode
# Runs a single Ralph iteration for interactive development
# Usage: ./ralph-once.sh

set -e

# The prompt incorporating tips from aihero.dev/tips-for-ai-coding-with-ralph-wiggum
PROMPT='@AGENTS.md @plans/prd.json @progress.txt

You are working through a PRD with human supervision. Follow these instructions carefully:

## 1. Choose Next Task (Prioritize Risky Work First)
When choosing the next task, prioritize in this order:
1. Architectural decisions and core abstractions
2. Integration points between modules
3. Unknown unknowns and spike work
4. Standard features and implementation
5. Polish, cleanup, and quick wins

Pick the task YOU decide has highest priority - not necessarily the first in the list.
Skip any task where "passes": true.

## 2. Implement With Small Steps
Keep changes small and focused:
- One logical change per commit
- If a task feels too large, break it into subtasks
- Prefer multiple small commits over one large commit
- Run feedback loops after each change, not at the end

Quality over speed. Small steps compound into big progress.

## 3. Run ALL Feedback Loops Before Committing
Before committing, run ALL feedback loops:
1. TypeScript: bun run typecheck (must pass with no errors)
2. Tests: bun run test (must pass)
3. Lint: bun run check (must pass)

Do NOT commit if any feedback loop fails. Fix issues first.

## 4. Update PRD
Set "passes": true for the completed requirement in plans/prd.json.

## 5. Update Progress File
After completing each task, append to progress.txt:
- Task completed and PRD item reference (e.g., "TIMER-001")
- Key decisions made and reasoning
- Files changed
- Any blockers or notes for next iteration

Keep entries concise. Sacrifice grammar for brevity.

## 6. Commit
Make a git commit with a clear message describing the feature.

## Rules
- ONLY WORK ON A SINGLE FEATURE per iteration
- Follow patterns established in AGENTS.md and existing code
- Fight entropy - leave the codebase better than you found it

## Completion
If ALL requirements in prd.json have "passes": true, output exactly:
<promise>COMPLETE</promise>
'

echo "Running single Ralph iteration (HITL mode)..."
echo "Watch the output and intervene if needed"
echo ""

claude -p "$PROMPT"

echo ""
echo "=========================================="
echo "Iteration complete. Review changes before running again."
echo "=========================================="
