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
	it("displays set progress", () => {
		const data = createMockUserData();
		const onComplete = mock(() => {});
		const onCancel = mock(() => {});
		render(
			<WorkoutScreen data={data} onComplete={onComplete} onCancel={onCancel} />,
		);

		// Verify set progress is displayed (Seria 1 z 5)
		expect(screen.getByText(/Seria 1 z 5/)).toBeTruthy();
	});

	it("displays target reps for current set", () => {
		const data = createMockUserData();
		const onComplete = mock(() => {});
		const onCancel = mock(() => {});
		render(
			<WorkoutScreen data={data} onComplete={onComplete} onCancel={onCancel} />,
		);

		// Verify target label is displayed
		expect(screen.getByText("Cel:")).toBeTruthy();
	});

	it("displays input field for reps", () => {
		const data = createMockUserData();
		const onComplete = mock(() => {});
		const onCancel = mock(() => {});
		render(
			<WorkoutScreen data={data} onComplete={onComplete} onCancel={onCancel} />,
		);

		// Verify input field is present
		expect(screen.getByText(/Wykonane powtórzenia/)).toBeTruthy();
		const input = document.querySelector(
			'input[type="number"]',
		) as HTMLInputElement;
		expect(input).toBeTruthy();
	});

	it("displays workout info (week and day)", () => {
		const data = createMockUserData({ currentWeek: 2, currentDay: 3 });
		const onComplete = mock(() => {});
		const onCancel = mock(() => {});
		render(
			<WorkoutScreen data={data} onComplete={onComplete} onCancel={onCancel} />,
		);

		// Verify week and day are displayed
		expect(screen.getByText(/Tydzień 2, Dzień 3/)).toBeTruthy();
	});

	it("shows 'maksimum' for final set (set 5)", () => {
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

		// Now on set 5, should show "maksimum"
		expect(screen.getByText(/Seria 5 z 5/)).toBeTruthy();
		expect(screen.getByText("maksimum")).toBeTruthy();
		expect(
			screen.getByText(/Zrób tyle powtórzeń, ile dasz radę!/),
		).toBeTruthy();
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

		// Should still be on set 1
		expect(screen.getByText(/Seria 1 z 5/)).toBeTruthy();
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

	it("displays next set number during rest", () => {
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

		// Should show "Następna: Seria 2 z 5"
		expect(screen.getByText(/Następna: Seria 2 z 5/)).toBeTruthy();
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
