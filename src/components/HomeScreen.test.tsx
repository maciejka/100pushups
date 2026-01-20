import { afterEach, describe, expect, it, mock } from "bun:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/preact";
import type { UserData } from "../stores/db.ts";
import { HomeScreen } from "./HomeScreen.tsx";

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

describe("DESIGN-004: Compact home screen header", () => {
	it("displays compact header with Stefan name, level badge, and progress", () => {
		const data = createMockUserData({
			level: 3,
			currentWeek: 2,
			currentDay: 2,
		});
		const onStartWorkout = mock(() => {});

		render(<HomeScreen data={data} onStartWorkout={onStartWorkout} />);

		// Should show Stefan's name
		expect(screen.getByText("Stefan")).toBeTruthy();

		// Should show level badge in compact format P{level}
		expect(screen.getByText("P3")).toBeTruthy();

		// Should show progress in compact format T: X/6, D: X/3
		expect(screen.getByText(/T: 2\/6/)).toBeTruthy();
		expect(screen.getByText(/D: 2\/3/)).toBeTruthy();
	});

	it("displays attempt number in compact format when attempt > 1", () => {
		const data = createMockUserData({
			level: 2,
			currentWeek: 3,
			currentDay: 1,
			weekAttempts: { 3: 2 },
		});
		const onStartWorkout = mock(() => {});

		render(<HomeScreen data={data} onStartWorkout={onStartWorkout} />);

		// Should show week, day, and attempt in compact format
		expect(screen.getByText(/T: 3\/6/)).toBeTruthy();
		expect(screen.getByText(/D: 1\/3/)).toBeTruthy();
		expect(screen.getByText(/P: 2/)).toBeTruthy();
	});

	it("does not display attempt number when attempt is 1", () => {
		const data = createMockUserData({
			level: 1,
			currentWeek: 1,
			currentDay: 1,
		});
		const onStartWorkout = mock(() => {});

		const { container } = render(
			<HomeScreen data={data} onStartWorkout={onStartWorkout} />,
		);

		// Should NOT show P: 1
		const headerText =
			container.querySelector(".progress-compact")?.textContent;
		expect(headerText).not.toContain("P:");
	});

	it("does not display progress compact when program complete", () => {
		const data = createMockUserData({
			currentWeek: 7, // Program complete
		});
		const onStartWorkout = mock(() => {});

		const { container } = render(
			<HomeScreen data={data} onStartWorkout={onStartWorkout} />,
		);

		// Should NOT show progress-compact span
		expect(container.querySelector(".progress-compact")).toBeNull();
	});
});

describe("TEST-HOME-001: HomeScreen displays workout preview", () => {
	it("shows Stefan's name in greeting", () => {
		const data = createMockUserData({ level: 1 });
		const onStartWorkout = mock(() => {});

		render(<HomeScreen data={data} onStartWorkout={onStartWorkout} />);

		expect(screen.getByText("Stefan")).toBeTruthy();
	});

	it("displays current week and day", () => {
		const data = createMockUserData({
			level: 2,
			currentWeek: 3,
			currentDay: 2,
		});
		const onStartWorkout = mock(() => {});

		render(<HomeScreen data={data} onStartWorkout={onStartWorkout} />);

		// Should show week and day in compact format
		expect(screen.getByText(/T: 3\/6/)).toBeTruthy();
		expect(screen.getByText(/D: 2\/3/)).toBeTruthy();
	});

	it("shows next workout details: number of sets and target reps", () => {
		const data = createMockUserData({
			level: 1,
			currentWeek: 1,
			currentDay: 1,
		});
		const onStartWorkout = mock(() => {});

		render(<HomeScreen data={data} onStartWorkout={onStartWorkout} />);

		// Should show "Następny trening:" label
		expect(screen.getByText("Następny trening:")).toBeTruthy();

		// Should show "5 serii" (5 sets per workout)
		expect(screen.getByText(/5 serii/)).toBeTruthy();

		// Should show target reps (cel: X+ powtórzeń)
		expect(screen.getByText(/cel: \d+\+ powtórzeń/)).toBeTruthy();
	});

	it("shows start workout button with correct label", () => {
		const data = createMockUserData({ level: 1 });
		const onStartWorkout = mock(() => {});

		render(<HomeScreen data={data} onStartWorkout={onStartWorkout} />);

		expect(screen.getByText("Rozpocznij trening")).toBeTruthy();
	});
});

describe("WORKOUT-006: Skip waiting period and start next workout", () => {
	it("shows 'Następny trening' button when today's workout is completed", () => {
		const today = new Date().toISOString();
		const data = createMockUserData({
			currentWeek: 1,
			currentDay: 2, // Advanced to next day after completing workout
			workouts: [
				{
					week: 1,
					day: 1,
					attempt: 1,
					date: today,
					sets: [2, 3, 2, 2, 10],
				},
			],
		});
		const onStartWorkout = mock(() => {});

		render(<HomeScreen data={data} onStartWorkout={onStartWorkout} />);

		// Should show workout done message
		expect(screen.getByText(/Dzisiejszy trening ukończony!/)).toBeTruthy();

		// Should show skip wait button
		expect(screen.getByText("Następny trening")).toBeTruthy();
	});

	it("calls onStartWorkout when 'Następny trening' button is clicked", () => {
		const today = new Date().toISOString();
		const data = createMockUserData({
			currentWeek: 1,
			currentDay: 2,
			workouts: [
				{
					week: 1,
					day: 1,
					attempt: 1,
					date: today,
					sets: [2, 3, 2, 2, 10],
				},
			],
		});
		const onStartWorkout = mock(() => {});

		render(<HomeScreen data={data} onStartWorkout={onStartWorkout} />);

		// Click the skip wait button
		const nextWorkoutButton = screen.getByText("Następny trening");
		fireEvent.click(nextWorkoutButton);

		// Verify onStartWorkout was called
		expect(onStartWorkout).toHaveBeenCalledTimes(1);
	});

	it("does not show 'Następny trening' button when program is complete", () => {
		const today = new Date().toISOString();
		const data = createMockUserData({
			currentWeek: 7, // Program complete
			currentDay: 1,
			workouts: [
				{
					week: 6,
					day: 3,
					attempt: 1,
					date: today,
					sets: [20, 25, 20, 20, 50],
				},
			],
		});
		const onStartWorkout = mock(() => {});

		render(<HomeScreen data={data} onStartWorkout={onStartWorkout} />);

		// Should show program complete message
		expect(screen.getByText(/Program ukończony!/)).toBeTruthy();

		// Should NOT show skip wait button
		expect(screen.queryByText("Następny trening")).toBeNull();
	});

	it("shows normal workout preview when no workout completed today", () => {
		const yesterday = new Date();
		yesterday.setDate(yesterday.getDate() - 1);
		const data = createMockUserData({
			currentWeek: 1,
			currentDay: 2,
			workouts: [
				{
					week: 1,
					day: 1,
					attempt: 1,
					date: yesterday.toISOString(),
					sets: [2, 3, 2, 2, 10],
				},
			],
		});
		const onStartWorkout = mock(() => {});

		render(<HomeScreen data={data} onStartWorkout={onStartWorkout} />);

		// Should NOT show workout done message
		expect(screen.queryByText(/Dzisiejszy trening ukończony!/)).toBeNull();

		// Should show normal start workout button
		expect(screen.getByText("Rozpocznij trening")).toBeTruthy();
	});
});
