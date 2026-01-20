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

## 1. Choose ONE Task (Prioritize Risky Work First)
Pick EXACTLY ONE task to work on. Do NOT work on multiple tasks.
When choosing, prioritize in this order:
1. Architectural decisions and core abstractions
2. Integration points between modules
3. Unknown unknowns and spike work
4. Standard features and implementation
5. Polish, cleanup, and quick wins

Pick the single task YOU decide has highest priority - not necessarily the first in the list.
Skip any task where "passes": true.
STOP after completing ONE task - do not continue to another task.

## 2. Implement With Small Steps
Keep changes small and focused:
- One logical change per commit
- If a task feels too large, break it into subtasks
- Prefer multiple small commits over one large commit
- Run feedback loops after each change, not at the end

Quality over speed. Small steps compound into big progress.

## 3. Ensure Tests Exist
Every feature MUST have automated tests. Before marking a task complete:
- Check if tests already exist for the feature
- If not, write tests that verify the feature works correctly
- Tests should cover the main functionality and edge cases
- Run tests to confirm they pass

Do NOT mark a feature complete without corresponding tests.

## 4. Run ALL Feedback Loops Before Committing
Before committing, run ALL feedback loops:
1. TypeScript: bun run typecheck (must pass with no errors)
2. Tests: bun run test (must pass)
3. Lint: bun run check (must pass)

Do NOT commit if any feedback loop fails. Fix issues first.

## 5. Update PRD
Set "passes": true for the completed requirement in plans/prd.json.

## 6. Update Progress File
After completing each task, append to progress.txt:
- Task completed and PRD item reference (e.g., "TIMER-001")
- Key decisions made and reasoning
- Files changed
- Any blockers or notes for next iteration

Keep entries concise. Sacrifice grammar for brevity.

## 7. Commit
Make a git commit with a clear message describing the feature.

## Rules
- ONLY WORK ON A SINGLE TASK per iteration - after completing one task, STOP
- Do NOT start a second task after finishing the first
- Follow patterns established in AGENTS.md and existing code
- Fight entropy - leave the codebase better than you found it
- If there is an issue with write access stop ralph immediately

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

  OUTFILE=$(mktemp)

  if [ "$USE_SANDBOX" = true ]; then
    docker sandbox run claude -p --verbose --output-format stream-json "$PROMPT" 2>&1 | \
      tee "$OUTFILE" | \
      jq -r --unbuffered '
        if .type == "assistant" and .message.content then
          .message.content[] |
          if .type == "tool_use" then
            "\n\u001b[36m>>> \(.name)\u001b[0m \u001b[33m\(.input | tostring | .[0:100])\u001b[0m"
          elif .type == "text" then
            .text
          else
            empty
          end
        elif .type == "result" then
          "\n\u001b[35m=== DONE (cost: $\(.total_cost_usd | tostring | .[0:6])) ===\u001b[0m"
        else
          empty
        end
      '
  else
    claude -p --verbose --output-format stream-json "$PROMPT" 2>&1 | \
      tee "$OUTFILE" | \
      jq -r --unbuffered '
        if .type == "assistant" and .message.content then
          .message.content[] |
          if .type == "tool_use" then
            "\n\u001b[36m>>> \(.name)\u001b[0m \u001b[33m\(.input | tostring | .[0:100])\u001b[0m"
          elif .type == "text" then
            .text
          else
            empty
          end
        elif .type == "result" then
          "\n\u001b[35m=== DONE (cost: $\(.total_cost_usd | tostring | .[0:6])) ===\u001b[0m"
        else
          empty
        end
      '
  fi

  result=$(cat "$OUTFILE")
  rm -f "$OUTFILE"

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
