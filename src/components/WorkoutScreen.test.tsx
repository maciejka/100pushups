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
