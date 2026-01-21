import { afterEach, describe, expect, it, mock } from "bun:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/preact";
import type { UserData } from "../stores/db.ts";
import { WorkoutScreen } from "./WorkoutScreen.tsx";

afterEach(() => {
	cleanup();
});

function createMockUserData(overrides: Partial<UserData> = {}): UserData {
	return {
		level: 1,
		currentWeek: 1,
		currentDay: 1,
		testResult: 5,
		workouts: [],
		weekAttempts: {},
		...overrides,
	};
}

describe("TEST-WORKOUT-001: WorkoutScreen renders correctly", () => {
	it("displays compact session info with T: D: S: format", () => {
		const data = createMockUserData({ currentWeek: 2, currentDay: 3 });
		const onComplete = mock(() => {});
		const onCancel = mock(() => {});
		render(
			<WorkoutScreen data={data} onComplete={onComplete} onCancel={onCancel} />,
		);

		// Verify compact format: T: 2/6, D: 3/3, S: 1/5
		expect(screen.getByText(/T: 2\/6, D: 3\/3, S: 1\/5/)).toBeTruthy();
	});

	it("displays compact reps input with target indicator", () => {
		const data = createMockUserData();
		const onComplete = mock(() => {});
		const onCancel = mock(() => {});
		render(
			<WorkoutScreen data={data} onComplete={onComplete} onCancel={onCancel} />,
		);

		// Verify compact input with target indicator (/ X format)
		expect(screen.getByText(/\/ \d+/)).toBeTruthy();
		const input = document.querySelector(
			'input[type="number"]',
		) as HTMLInputElement;
		expect(input).toBeTruthy();
	});

	it("shows '/ max' for final set (set 5)", () => {
		const data = createMockUserData();
		const onComplete = mock(() => {});
		const onCancel = mock(() => {});
		const { container } = render(
			<WorkoutScreen data={data} onComplete={onComplete} onCancel={onCancel} />,
		);

		// Progress through sets 1-4 to reach set 5 (max set)
		const input = container.querySelector(
			'input[type="number"]',
		) as HTMLInputElement;

		for (let i = 0; i < 4; i++) {
			fireEvent.input(input, { target: { value: "10" } });
			const submitButton = screen.getByText("Następna seria");
			fireEvent.click(submitButton);

			// Skip rest timer
			const skipButton = screen.getByText("Pomiń");
			fireEvent.click(skipButton);
		}

		// Now on set 5, should show "/ max" and S: 5/5
		expect(screen.getByText(/S: 5\/5/)).toBeTruthy();
		expect(screen.getByText(/\/ max/)).toBeTruthy();
	});
});

describe("TEST-WORKOUT-002: Test rep logging in WorkoutScreen", () => {
	it("allows entering reps in input field", () => {
		const data = createMockUserData();
		const onComplete = mock(() => {});
		const onCancel = mock(() => {});
		const { container } = render(
			<WorkoutScreen data={data} onComplete={onComplete} onCancel={onCancel} />,
		);

		const input = container.querySelector(
			'input[type="number"]',
		) as HTMLInputElement;
		expect(input).toBeTruthy();

		fireEvent.input(input, { target: { value: "15" } });
		expect(input.value).toBe("15");
	});

	it("updates completed sets list after submitting a set", () => {
		const data = createMockUserData();
		const onComplete = mock(() => {});
		const onCancel = mock(() => {});
		const { container } = render(
			<WorkoutScreen data={data} onComplete={onComplete} onCancel={onCancel} />,
		);

		// Initially no completed sets
		expect(screen.queryByText("Ukończone serie:")).toBeNull();

		// Enter reps and submit
		const input = container.querySelector(
			'input[type="number"]',
		) as HTMLInputElement;
		fireEvent.input(input, { target: { value: "8" } });
		const submitButton = screen.getByText("Następna seria");
		fireEvent.click(submitButton);

		// Skip rest timer to see updated UI
		const skipButton = screen.getByText("Pomiń");
		fireEvent.click(skipButton);

		// Completed sets list should now show
		expect(screen.getByText("Ukończone serie:")).toBeTruthy();
		expect(screen.getByText(/Seria 1: 8 powtórzeń/)).toBeTruthy();
	});

	it("accumulates multiple completed sets in the list", () => {
		const data = createMockUserData();
		const onComplete = mock(() => {});
		const onCancel = mock(() => {});
		const { container } = render(
			<WorkoutScreen data={data} onComplete={onComplete} onCancel={onCancel} />,
		);

		const input = container.querySelector(
			'input[type="number"]',
		) as HTMLInputElement;

		// Complete first set
		fireEvent.input(input, { target: { value: "10" } });
		fireEvent.click(screen.getByText("Następna seria"));
		fireEvent.click(screen.getByText("Pomiń"));

		// Complete second set
		fireEvent.input(input, { target: { value: "12" } });
		fireEvent.click(screen.getByText("Następna seria"));
		fireEvent.click(screen.getByText("Pomiń"));

		// Both sets should be visible
		expect(screen.getByText(/Seria 1: 10 powtórzeń/)).toBeTruthy();
		expect(screen.getByText(/Seria 2: 12 powtórzeń/)).toBeTruthy();
	});

	it("does not submit when input is empty", () => {
		const data = createMockUserData();
		const onComplete = mock(() => {});
		const onCancel = mock(() => {});
		const { container } = render(
			<WorkoutScreen data={data} onComplete={onComplete} onCancel={onCancel} />,
		);

		// Clear the prefilled input
		const input = container.querySelector(
			'input[type="number"]',
		) as HTMLInputElement;
		fireEvent.input(input, { target: { value: "" } });

		// Submit button should be disabled
		const submitButton = screen.getByText("Następna seria");
		expect(submitButton.hasAttribute("disabled")).toBe(true);

		// Should still be on set 1 (S: 1/5)
		expect(screen.getByText(/S: 1\/5/)).toBeTruthy();
	});
});

describe("TEST-TIMER-001: Test rest timer appears between sets", () => {
	it("shows rest timer screen after completing a set", () => {
		const data = createMockUserData();
		const onComplete = mock(() => {});
		const onCancel = mock(() => {});
		const { container } = render(
			<WorkoutScreen data={data} onComplete={onComplete} onCancel={onCancel} />,
		);

		// Complete first set
		const input = container.querySelector(
			'input[type="number"]',
		) as HTMLInputElement;
		fireEvent.input(input, { target: { value: "10" } });
		fireEvent.click(screen.getByText("Następna seria"));

		// Rest timer screen should appear
		expect(screen.getByText("Odpoczynek")).toBeTruthy();
	});

	it("displays countdown timer value", () => {
		const data = createMockUserData();
		const onComplete = mock(() => {});
		const onCancel = mock(() => {});
		const { container } = render(
			<WorkoutScreen data={data} onComplete={onComplete} onCancel={onCancel} />,
		);

		// Complete first set
		const input = container.querySelector(
			'input[type="number"]',
		) as HTMLInputElement;
		fireEvent.input(input, { target: { value: "10" } });
		fireEvent.click(screen.getByText("Następna seria"));

		// Day 1 has 60 second rest timer, displayed as "1:00"
		expect(screen.getByText("1:00")).toBeTruthy();
	});

	it("displays compact session info during rest", () => {
		const data = createMockUserData();
		const onComplete = mock(() => {});
		const onCancel = mock(() => {});
		const { container } = render(
			<WorkoutScreen data={data} onComplete={onComplete} onCancel={onCancel} />,
		);

		// Complete first set
		const input = container.querySelector(
			'input[type="number"]',
		) as HTMLInputElement;
		fireEvent.input(input, { target: { value: "10" } });
		fireEvent.click(screen.getByText("Następna seria"));

		// Should show compact format with S: 2/5 (next set)
		expect(screen.getByText(/S: 2\/5/)).toBeTruthy();
	});

	it("shows completed sets during rest", () => {
		const data = createMockUserData();
		const onComplete = mock(() => {});
		const onCancel = mock(() => {});
		const { container } = render(
			<WorkoutScreen data={data} onComplete={onComplete} onCancel={onCancel} />,
		);

		// Complete first set
		const input = container.querySelector(
			'input[type="number"]',
		) as HTMLInputElement;
		fireEvent.input(input, { target: { value: "8" } });
		fireEvent.click(screen.getByText("Następna seria"));

		// Completed sets should be visible during rest
		expect(screen.getByText("Ukończone serie:")).toBeTruthy();
		expect(screen.getByText(/Seria 1: 8 powtórzeń/)).toBeTruthy();
	});
});

describe("TEST-TIMER-003: Test skip and pause timer functionality", () => {
	it("skip button ends rest immediately", () => {
		const data = createMockUserData();
		const onComplete = mock(() => {});
		const onCancel = mock(() => {});
		const { container } = render(
			<WorkoutScreen data={data} onComplete={onComplete} onCancel={onCancel} />,
		);

		// Complete first set to enter rest
		const input = container.querySelector(
			'input[type="number"]',
		) as HTMLInputElement;
		fireEvent.input(input, { target: { value: "10" } });
		fireEvent.click(screen.getByText("Następna seria"));

		// Verify we're in rest mode
		expect(screen.getByText("Odpoczynek")).toBeTruthy();
		expect(screen.getByText("Pomiń")).toBeTruthy();

		// Click skip
		fireEvent.click(screen.getByText("Pomiń"));

		// Should no longer be in rest mode - back to workout input
		expect(screen.queryByText("Odpoczynek")).toBeNull();
		expect(screen.getByText(/S: 2\/5/)).toBeTruthy();
	});

	it("pause button stops countdown", () => {
		const data = createMockUserData();
		const onComplete = mock(() => {});
		const onCancel = mock(() => {});
		const { container } = render(
			<WorkoutScreen data={data} onComplete={onComplete} onCancel={onCancel} />,
		);

		// Complete first set to enter rest
		const input = container.querySelector(
			'input[type="number"]',
		) as HTMLInputElement;
		fireEvent.input(input, { target: { value: "10" } });
		fireEvent.click(screen.getByText("Następna seria"));

		// Verify we're in rest mode with pause button
		expect(screen.getByText("Odpoczynek")).toBeTruthy();
		expect(screen.getByText("Pauza")).toBeTruthy();

		// Click pause
		fireEvent.click(screen.getByText("Pauza"));

		// Button should now show "Wznów" (Resume)
		expect(screen.getByText("Wznów")).toBeTruthy();
		expect(screen.queryByText("Pauza")).toBeNull();
	});

	it("resume button continues countdown", () => {
		const data = createMockUserData();
		const onComplete = mock(() => {});
		const onCancel = mock(() => {});
		const { container } = render(
			<WorkoutScreen data={data} onComplete={onComplete} onCancel={onCancel} />,
		);

		// Complete first set to enter rest
		const input = container.querySelector(
			'input[type="number"]',
		) as HTMLInputElement;
		fireEvent.input(input, { target: { value: "10" } });
		fireEvent.click(screen.getByText("Następna seria"));

		// Pause the timer
		fireEvent.click(screen.getByText("Pauza"));
		expect(screen.getByText("Wznów")).toBeTruthy();

		// Resume the timer
		fireEvent.click(screen.getByText("Wznów"));

		// Button should show "Pauza" again
		expect(screen.getByText("Pauza")).toBeTruthy();
		expect(screen.queryByText("Wznów")).toBeNull();
	});

	it("skip button resets pause state", () => {
		const data = createMockUserData();
		const onComplete = mock(() => {});
		const onCancel = mock(() => {});
		const { container } = render(
			<WorkoutScreen data={data} onComplete={onComplete} onCancel={onCancel} />,
		);

		const input = container.querySelector(
			'input[type="number"]',
		) as HTMLInputElement;

		// Complete first set, pause, then skip
		fireEvent.input(input, { target: { value: "10" } });
		fireEvent.click(screen.getByText("Następna seria"));
		fireEvent.click(screen.getByText("Pauza"));
		fireEvent.click(screen.getByText("Pomiń"));

		// Complete second set and enter rest again
		fireEvent.input(input, { target: { value: "10" } });
		fireEvent.click(screen.getByText("Następna seria"));

		// Should show "Pauza" not "Wznów" - pause state should be reset
		expect(screen.getByText("Pauza")).toBeTruthy();
		expect(screen.queryByText("Wznów")).toBeNull();
	});
});

describe("TEST-REPEAT-001: Test repeat week suggestion logic", () => {
	it("shows repeat suggestion when 3+ sets fail to meet target", () => {
		const data = createMockUserData();
		const onComplete = mock(() => {});
		const onCancel = mock(() => {});
		const { container } = render(
			<WorkoutScreen data={data} onComplete={onComplete} onCancel={onCancel} />,
		);

		const input = container.querySelector(
			'input[type="number"]',
		) as HTMLInputElement;

		// Level 1, Week 1, Day 1 targets: [2, 3, 2, 2, -1]
		// Fail 4 sets by doing 0 reps each
		const repsForSets = [0, 0, 0, 0, 5];
		for (let i = 0; i < 4; i++) {
			fireEvent.input(input, { target: { value: String(repsForSets[i]) } });
			fireEvent.click(screen.getByText("Następna seria"));
			fireEvent.click(screen.getByText("Pomiń"));
		}
		fireEvent.input(input, { target: { value: String(repsForSets[4]) } });
		fireEvent.click(screen.getByText("Zakończ trening"));

		// Should show repeat suggestion text
		expect(
			screen.getByText(/Nie udało Ci się osiągnąć celu w \d+ seriach/),
		).toBeTruthy();
		expect(screen.getByText(/Zalecamy powtórzenie tego tygodnia/)).toBeTruthy();
	});

	it("shows 'Powtórz tydzień' button when repeat suggested", () => {
		const data = createMockUserData();
		const onComplete = mock(() => {});
		const onCancel = mock(() => {});
		const { container } = render(
			<WorkoutScreen data={data} onComplete={onComplete} onCancel={onCancel} />,
		);

		const input = container.querySelector(
			'input[type="number"]',
		) as HTMLInputElement;

		// Fail 3 sets - exactly at the threshold
		// Level 1, Week 1, Day 1 targets: [2, 3, 2, 2, -1]
		const repsForSets = [1, 1, 1, 10, 5]; // First 3 fail, 4th passes
		for (let i = 0; i < 4; i++) {
			fireEvent.input(input, { target: { value: String(repsForSets[i]) } });
			fireEvent.click(screen.getByText("Następna seria"));
			fireEvent.click(screen.getByText("Pomiń"));
		}
		fireEvent.input(input, { target: { value: String(repsForSets[4]) } });
		fireEvent.click(screen.getByText("Zakończ trening"));

		// Should show 'Powtórz tydzień' button
		expect(screen.getByText("Powtórz tydzień")).toBeTruthy();
	});

	it("shows 'Kontynuuj' button alongside repeat button", () => {
		const data = createMockUserData();
		const onComplete = mock(() => {});
		const onCancel = mock(() => {});
		const { container } = render(
			<WorkoutScreen data={data} onComplete={onComplete} onCancel={onCancel} />,
		);

		const input = container.querySelector(
			'input[type="number"]',
		) as HTMLInputElement;

		// Fail 3+ sets
		const repsForSets = [0, 0, 0, 0, 5];
		for (let i = 0; i < 4; i++) {
			fireEvent.input(input, { target: { value: String(repsForSets[i]) } });
			fireEvent.click(screen.getByText("Następna seria"));
			fireEvent.click(screen.getByText("Pomiń"));
		}
		fireEvent.input(input, { target: { value: String(repsForSets[4]) } });
		fireEvent.click(screen.getByText("Zakończ trening"));

		// Should show both buttons
		expect(screen.getByText("Powtórz tydzień")).toBeTruthy();
		expect(screen.getByText("Kontynuuj")).toBeTruthy();
	});

	it("does NOT show repeat suggestion when less than 3 sets fail", () => {
		const data = createMockUserData();
		const onComplete = mock(() => {});
		const onCancel = mock(() => {});
		const { container } = render(
			<WorkoutScreen data={data} onComplete={onComplete} onCancel={onCancel} />,
		);

		const input = container.querySelector(
			'input[type="number"]',
		) as HTMLInputElement;

		// Only 2 sets fail (below threshold)
		// Level 1, Week 1, Day 1 targets: [2, 3, 2, 2, -1]
		const repsForSets = [1, 1, 10, 10, 20]; // Only first 2 fail
		for (let i = 0; i < 4; i++) {
			fireEvent.input(input, { target: { value: String(repsForSets[i]) } });
			fireEvent.click(screen.getByText("Następna seria"));
			fireEvent.click(screen.getByText("Pomiń"));
		}
		fireEvent.input(input, { target: { value: String(repsForSets[4]) } });
		fireEvent.click(screen.getByText("Zakończ trening"));

		// Should NOT show repeat suggestion - should show "Zakończ" button instead
		expect(screen.queryByText("Powtórz tydzień")).toBeNull();
		expect(screen.queryByText("Kontynuuj")).toBeNull();
		expect(screen.getByText("Zakończ")).toBeTruthy();
	});

	it("does NOT count max set as failed even if low reps", () => {
		const data = createMockUserData();
		const onComplete = mock(() => {});
		const onCancel = mock(() => {});
		const { container } = render(
			<WorkoutScreen data={data} onComplete={onComplete} onCancel={onCancel} />,
		);

		const input = container.querySelector(
			'input[type="number"]',
		) as HTMLInputElement;

		// Only 2 regular sets fail, max set with low reps should NOT count
		// Level 1, Week 1, Day 1 targets: [2, 3, 2, 2, -1]
		const repsForSets = [1, 1, 10, 10, 1]; // 2 fail, max set has low reps
		for (let i = 0; i < 4; i++) {
			fireEvent.input(input, { target: { value: String(repsForSets[i]) } });
			fireEvent.click(screen.getByText("Następna seria"));
			fireEvent.click(screen.getByText("Pomiń"));
		}
		fireEvent.input(input, { target: { value: String(repsForSets[4]) } });
		fireEvent.click(screen.getByText("Zakończ trening"));

		// Should NOT show repeat suggestion - max set doesn't count as failed
		expect(screen.queryByText("Powtórz tydzień")).toBeNull();
		expect(screen.getByText("Zakończ")).toBeTruthy();
	});
});

describe("TEST-REPEAT-002: Test week attempt tracking", () => {
	it("includes current attempt number in WorkoutRecord", () => {
		const data = createMockUserData({
			currentWeek: 2,
			currentDay: 1,
			weekAttempts: { 2: 3 }, // Attempt 3 of week 2
		});
		const captured: { record?: { attempt: number } } = {};
		const onComplete = mock((record: { attempt: number }) => {
			captured.record = record;
		});
		const onCancel = mock(() => {});
		const { container } = render(
			<WorkoutScreen data={data} onComplete={onComplete} onCancel={onCancel} />,
		);

		const input = container.querySelector(
			'input[type="number"]',
		) as HTMLInputElement;

		// Complete all 5 sets
		const repsForSets = [10, 12, 10, 10, 20];
		for (let i = 0; i < 4; i++) {
			fireEvent.input(input, { target: { value: String(repsForSets[i]) } });
			fireEvent.click(screen.getByText("Następna seria"));
			fireEvent.click(screen.getByText("Pomiń"));
		}
		fireEvent.input(input, { target: { value: String(repsForSets[4]) } });
		fireEvent.click(screen.getByText("Zakończ trening"));
		fireEvent.click(screen.getByText("Zakończ"));

		// Verify attempt number is correctly captured from weekAttempts
		expect(captured.record?.attempt).toBe(3);
	});

	it("shows attempt number as 1 when weekAttempts is empty", () => {
		const data = createMockUserData({
			currentWeek: 1,
			currentDay: 1,
			weekAttempts: {}, // No attempts tracked yet
		});
		const captured: { record?: { attempt: number } } = {};
		const onComplete = mock((record: { attempt: number }) => {
			captured.record = record;
		});
		const onCancel = mock(() => {});
		const { container } = render(
			<WorkoutScreen data={data} onComplete={onComplete} onCancel={onCancel} />,
		);

		const input = container.querySelector(
			'input[type="number"]',
		) as HTMLInputElement;

		// Complete all 5 sets
		const repsForSets = [10, 12, 10, 10, 20];
		for (let i = 0; i < 4; i++) {
			fireEvent.input(input, { target: { value: String(repsForSets[i]) } });
			fireEvent.click(screen.getByText("Następna seria"));
			fireEvent.click(screen.getByText("Pomiń"));
		}
		fireEvent.input(input, { target: { value: String(repsForSets[4]) } });
		fireEvent.click(screen.getByText("Zakończ trening"));
		fireEvent.click(screen.getByText("Zakończ"));

		// Verify attempt defaults to 1
		expect(captured.record?.attempt).toBe(1);
	});

	it("shows previous attempt reps when repeating a week", () => {
		const data = createMockUserData({
			currentWeek: 2,
			currentDay: 1,
			weekAttempts: { 2: 2 }, // Second attempt of week 2
			workouts: [
				{
					week: 2,
					day: 1,
					attempt: 1, // Previous attempt
					date: new Date().toISOString(),
					sets: [8, 9, 7, 8, 15],
				},
			],
		});
		const onComplete = mock(() => {});
		const onCancel = mock(() => {});
		render(
			<WorkoutScreen data={data} onComplete={onComplete} onCancel={onCancel} />,
		);

		// Should show previous reps for set 1 (which was 8)
		expect(screen.getByText(/poprz\. 8/)).toBeTruthy();
	});

	it("does NOT show previous reps on first attempt", () => {
		const data = createMockUserData({
			currentWeek: 1,
			currentDay: 1,
			weekAttempts: {}, // First attempt (defaults to 1)
			workouts: [],
		});
		const onComplete = mock(() => {});
		const onCancel = mock(() => {});
		render(
			<WorkoutScreen data={data} onComplete={onComplete} onCancel={onCancel} />,
		);

		// Should NOT show "poprz." text
		expect(screen.queryByText(/poprz./)).toBeNull();
	});

	it("shows correct previous reps for each set during workout", () => {
		const data = createMockUserData({
			currentWeek: 3,
			currentDay: 2,
			weekAttempts: { 3: 2 }, // Second attempt
			workouts: [
				{
					week: 3,
					day: 2,
					attempt: 1,
					date: new Date().toISOString(),
					sets: [12, 15, 10, 11, 25],
				},
			],
		});
		const onComplete = mock(() => {});
		const onCancel = mock(() => {});
		const { container } = render(
			<WorkoutScreen data={data} onComplete={onComplete} onCancel={onCancel} />,
		);

		// Set 1: should show 12 from previous attempt
		expect(screen.getByText(/poprz\. 12/)).toBeTruthy();

		// Progress to set 2
		const input = container.querySelector(
			'input[type="number"]',
		) as HTMLInputElement;
		fireEvent.input(input, { target: { value: "10" } });
		fireEvent.click(screen.getByText("Następna seria"));
		fireEvent.click(screen.getByText("Pomiń"));

		// Set 2: should show 15 from previous attempt
		expect(screen.getByText(/poprz\. 15/)).toBeTruthy();
	});
});

describe("TEST-WORKOUT-003: Test workout completion callback", () => {
	it("calls onComplete with WorkoutRecord after completing all 5 sets", () => {
		const data = createMockUserData({ currentWeek: 2, currentDay: 3 });
		const onComplete = mock(() => {});
		const onCancel = mock(() => {});
		const { container } = render(
			<WorkoutScreen data={data} onComplete={onComplete} onCancel={onCancel} />,
		);

		const input = container.querySelector(
			'input[type="number"]',
		) as HTMLInputElement;

		// Complete sets 1-4 (with rest timer skips)
		const repsForSets = [10, 12, 8, 8, 15];
		for (let i = 0; i < 4; i++) {
			fireEvent.input(input, { target: { value: String(repsForSets[i]) } });
			fireEvent.click(screen.getByText("Następna seria"));
			fireEvent.click(screen.getByText("Pomiń"));
		}

		// Complete final set (set 5 - max set)
		fireEvent.input(input, { target: { value: String(repsForSets[4]) } });
		fireEvent.click(screen.getByText("Zakończ trening"));

		// Should be on completion screen now
		expect(screen.getByText(/Świetna robota/)).toBeTruthy();

		// Click the finish button
		fireEvent.click(screen.getByText("Zakończ"));

		// Verify onComplete was called
		expect(onComplete).toHaveBeenCalledTimes(1);
	});

	it("passes WorkoutRecord with correct week, day, and sets data", () => {
		const data = createMockUserData({ currentWeek: 3, currentDay: 2 });
		const captured: {
			record?: {
				week: number;
				day: number;
				sets: number[];
				attempt: number;
				date: string;
			};
		} = {};
		const onComplete = mock(
			(record: {
				week: number;
				day: number;
				sets: number[];
				attempt: number;
				date: string;
			}) => {
				captured.record = record;
			},
		);
		const onCancel = mock(() => {});
		const { container } = render(
			<WorkoutScreen data={data} onComplete={onComplete} onCancel={onCancel} />,
		);

		const input = container.querySelector(
			'input[type="number"]',
		) as HTMLInputElement;

		// Complete all 5 sets with specific rep counts
		// Week 3 Day 2 Level 1 targets: [10, 12, 8, 8, -1] - use values >= targets
		const repsForSets = [10, 12, 8, 8, 15];
		for (let i = 0; i < 4; i++) {
			fireEvent.input(input, { target: { value: String(repsForSets[i]) } });
			fireEvent.click(screen.getByText("Następna seria"));
			fireEvent.click(screen.getByText("Pomiń"));
		}
		fireEvent.input(input, { target: { value: String(repsForSets[4]) } });
		fireEvent.click(screen.getByText("Zakończ trening"));

		// Click finish button
		fireEvent.click(screen.getByText("Zakończ"));

		// Verify the record structure
		expect(captured.record).toBeDefined();
		expect(captured.record?.week).toBe(3);
		expect(captured.record?.day).toBe(2);
		expect(captured.record?.sets).toEqual([10, 12, 8, 8, 15]);
		expect(captured.record?.attempt).toBe(1);
		expect(typeof captured.record?.date).toBe("string");
	});

	it("passes repeatWeek=false when user clicks Zakończ", () => {
		const data = createMockUserData();
		const captured: { repeatWeek?: boolean } = {};
		const onComplete = mock((_record: unknown, repeatWeek: boolean) => {
			captured.repeatWeek = repeatWeek;
		});
		const onCancel = mock(() => {});
		const { container } = render(
			<WorkoutScreen data={data} onComplete={onComplete} onCancel={onCancel} />,
		);

		const input = container.querySelector(
			'input[type="number"]',
		) as HTMLInputElement;

		// Complete all 5 sets with passing reps
		const repsForSets = [10, 12, 10, 10, 20];
		for (let i = 0; i < 4; i++) {
			fireEvent.input(input, { target: { value: String(repsForSets[i]) } });
			fireEvent.click(screen.getByText("Następna seria"));
			fireEvent.click(screen.getByText("Pomiń"));
		}
		fireEvent.input(input, { target: { value: String(repsForSets[4]) } });
		fireEvent.click(screen.getByText("Zakończ trening"));

		fireEvent.click(screen.getByText("Zakończ"));

		// Verify repeatWeek parameter is false
		expect(captured.repeatWeek).toBe(false);
	});

	it("passes repeatWeek=true when user clicks Powtórz tydzień", () => {
		const data = createMockUserData();
		const captured: { repeatWeek?: boolean } = {};
		const onComplete = mock((_record: unknown, repeatWeek: boolean) => {
			captured.repeatWeek = repeatWeek;
		});
		const onCancel = mock(() => {});
		const { container } = render(
			<WorkoutScreen data={data} onComplete={onComplete} onCancel={onCancel} />,
		);

		const input = container.querySelector(
			'input[type="number"]',
		) as HTMLInputElement;

		// Complete all 5 sets with 3+ failing sets (below target)
		// Level 1, Week 1, Day 1 targets are [2, 3, 2, 2, -1]
		const repsForSets = [1, 1, 1, 1, 5]; // 3+ sets failed
		for (let i = 0; i < 4; i++) {
			fireEvent.input(input, { target: { value: String(repsForSets[i]) } });
			fireEvent.click(screen.getByText("Następna seria"));
			fireEvent.click(screen.getByText("Pomiń"));
		}
		fireEvent.input(input, { target: { value: String(repsForSets[4]) } });
		fireEvent.click(screen.getByText("Zakończ trening"));

		// Should show repeat suggestion
		expect(screen.getByText("Powtórz tydzień")).toBeTruthy();
		fireEvent.click(screen.getByText("Powtórz tydzień"));

		// Verify repeatWeek parameter is true
		expect(captured.repeatWeek).toBe(true);
	});
});
