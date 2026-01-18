#!/bin/bash
# ralph.sh - AFK (away from keyboard) mode
# Runs Ralph in a loop for autonomous coding
# Usage: ./ralph.sh <iterations> [--sandbox]

set -e

if [ -z "$1" ]; then
  echo "Usage: $0 <iterations> [--sandbox]"
  echo "  iterations: number of loops (recommended: 5-10 for small tasks, 30-50 for large)"
  echo "  --sandbox: run in Docker sandbox for safety (recommended for AFK)"
  exit 1
fi

ITERATIONS=$1
USE_SANDBOX=false

if [ "$2" == "--sandbox" ]; then
  USE_SANDBOX=true
fi

# The prompt incorporating tips from aihero.dev/tips-for-ai-coding-with-ralph-wiggum
PROMPT='@AGENTS.md @plans/prd.json @progress.txt

You are working through a PRD autonomously. Follow these instructions carefully:

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

echo "Starting Ralph with $ITERATIONS iterations..."
echo "Use Ctrl+C to stop early"
echo ""

for ((i=1; i<=$ITERATIONS; i++)); do
  echo "=========================================="
  echo "Iteration $i of $ITERATIONS"
  echo "=========================================="

  if [ "$USE_SANDBOX" = true ]; then
    result=$(docker sandbox run claude -p "$PROMPT")
  else
    result=$(claude -p "$PROMPT")
  fi

  echo "$result"

  if [[ "$result" == *"<promise>COMPLETE</promise>"* ]]; then
    echo ""
    echo "=========================================="
    echo "PRD complete after $i iterations!"
    echo "=========================================="
    exit 0
  fi

  echo ""
done

echo "=========================================="
echo "Reached max iterations ($ITERATIONS)"
echo "Check progress.txt for status"
echo "=========================================="
