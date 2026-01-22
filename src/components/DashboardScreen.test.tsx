import { afterEach, describe, expect, it, mock } from "bun:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/preact";
import type { UserData, WorkoutRecord } from "../stores/db.ts";
import { DashboardScreen } from "./DashboardScreen.tsx";

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

function createMockWorkout(
	week: number,
	day: number,
	sets: number[] = [10, 10, 10, 10, 15],
): WorkoutRecord {
	return {
		week,
		day,
		attempt: 1,
		date: new Date().toISOString(),
		sets,
	};
}

describe("DESIGN-011: Merged home and progress screens", () => {
	it("shows single main screen with workout start button and progress overview", () => {
		const data = createMockUserData({ level: 2 });
		const onStartWorkout = mock(() => {});
		const onRepeatWeek = mock(() => {});

		const { container } = render(
			<DashboardScreen
				data={data}
				onStartWorkout={onStartWorkout}
				onRepeatWeek={onRepeatWeek}
			/>,
		);

		// Should show workout card with start button
		expect(screen.getByText("Rozpocznij trening")).toBeTruthy();

		// Should show progress overview with 6 weeks
		const weekBoxes = container.querySelectorAll(".week-box");
		expect(weekBoxes.length).toBe(6);
	});

	it("displays all 6 weeks with day indicators", () => {
		const data = createMockUserData();
		const onStartWorkout = mock(() => {});
		const onRepeatWeek = mock(() => {});

		const { container } = render(
			<DashboardScreen
				data={data}
				onStartWorkout={onStartWorkout}
				onRepeatWeek={onRepeatWeek}
			/>,
		);

		// 6 weeks with 3 days each = 18 day indicators
		const dayIndicators = container.querySelectorAll(".day-indicator");
		expect(dayIndicators.length).toBe(18);
	});

	it("shows current workout details and start button prominently", () => {
		const data = createMockUserData({
			level: 1,
			currentWeek: 2,
			currentDay: 1,
		});
		const onStartWorkout = mock(() => {});
		const onRepeatWeek = mock(() => {});

		render(
			<DashboardScreen
				data={data}
				onStartWorkout={onStartWorkout}
				onRepeatWeek={onRepeatWeek}
			/>,
		);

		// Should show workout details
		expect(screen.getByText(/T2\/D1/)).toBeTruthy();
		expect(screen.getByText(/5 serii/)).toBeTruthy();

		// Should have primary button for starting workout
		const startButton = screen.getByText("Rozpocznij trening");
		expect(startButton.classList.contains("btn-primary")).toBe(true);
	});

	it("displays header with '100p' title, level and completion percentage (DESIGN-012)", () => {
		const data = createMockUserData({
			level: 3,
			workouts: [
				createMockWorkout(1, 1),
				createMockWorkout(1, 2),
				createMockWorkout(1, 3),
			],
		});
		const onStartWorkout = mock(() => {});
		const onRepeatWeek = mock(() => {});

		render(
			<DashboardScreen
				data={data}
				onStartWorkout={onStartWorkout}
				onRepeatWeek={onRepeatWeek}
			/>,
		);

		// Should show '100p' title (DESIGN-012)
		expect(screen.getByText("100p")).toBeTruthy();

		// Should show level badge
		expect(screen.getByText("P3")).toBeTruthy();

		// Should show completion (3/18 = 17%)
		expect(screen.getByText(/3\/18/)).toBeTruthy();
		expect(screen.getByText(/17%/)).toBeTruthy();
	});

	it("shows completed workout state with next workout button", () => {
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
		const onRepeatWeek = mock(() => {});

		render(
			<DashboardScreen
				data={data}
				onStartWorkout={onStartWorkout}
				onRepeatWeek={onRepeatWeek}
			/>,
		);

		// Should show workout done message
		expect(screen.getByText(/Dzisiejszy trening ukończony!/)).toBeTruthy();

		// Should show next workout button
		expect(screen.getByText("Następny trening")).toBeTruthy();
	});

	it("shows program complete state when week > 6", () => {
		const data = createMockUserData({
			currentWeek: 7,
		});
		const onStartWorkout = mock(() => {});
		const onRepeatWeek = mock(() => {});

		render(
			<DashboardScreen
				data={data}
				onStartWorkout={onStartWorkout}
				onRepeatWeek={onRepeatWeek}
			/>,
		);

		// Should show program complete message
		expect(screen.getByText(/Program ukończony!/)).toBeTruthy();
	});

	it("shows repeat button on current week when day > 1", () => {
		const data = createMockUserData({
			currentWeek: 2,
			currentDay: 2,
		});
		const onStartWorkout = mock(() => {});
		const onRepeatWeek = mock(() => {});

		render(
			<DashboardScreen
				data={data}
				onStartWorkout={onStartWorkout}
				onRepeatWeek={onRepeatWeek}
			/>,
		);

		const repeatButton = screen.getByRole("button", { name: /Powtórz/ });
		expect(repeatButton).toBeTruthy();
	});

	it("calls onRepeatWeek when repeat button is clicked", () => {
		const data = createMockUserData({
			currentWeek: 3,
			currentDay: 2,
		});
		const onStartWorkout = mock(() => {});
		const onRepeatWeek = mock(() => {});

		render(
			<DashboardScreen
				data={data}
				onStartWorkout={onStartWorkout}
				onRepeatWeek={onRepeatWeek}
			/>,
		);

		const repeatButton = screen.getByRole("button", { name: /Powtórz/ });
		fireEvent.click(repeatButton);

		expect(onRepeatWeek).toHaveBeenCalledTimes(1);
	});

	it("shows session totals for completed days", () => {
		const data = createMockUserData({
			currentWeek: 2,
			currentDay: 1,
			workouts: [
				createMockWorkout(1, 1, [10, 10, 10, 10, 15]), // total: 55
				createMockWorkout(1, 2, [8, 8, 8, 8, 12]), // total: 44
			],
		});
		const onStartWorkout = mock(() => {});
		const onRepeatWeek = mock(() => {});

		const { container } = render(
			<DashboardScreen
				data={data}
				onStartWorkout={onStartWorkout}
				onRepeatWeek={onRepeatWeek}
			/>,
		);

		const completedDays = container.querySelectorAll(
			".day-indicator.completed",
		);
		const totals = Array.from(completedDays).map((d) => d.textContent);
		expect(totals).toContain("55");
		expect(totals).toContain("44");
	});

	it("highlights current week and day", () => {
		const data = createMockUserData({
			currentWeek: 3,
			currentDay: 2,
		});
		const onStartWorkout = mock(() => {});
		const onRepeatWeek = mock(() => {});

		const { container } = render(
			<DashboardScreen
				data={data}
				onStartWorkout={onStartWorkout}
				onRepeatWeek={onRepeatWeek}
			/>,
		);

		// Current week should have 'current' class
		const currentWeek = container.querySelector(".week-box.current");
		expect(currentWeek).toBeTruthy();

		// Current day should have 'current-day' class
		const currentDay = container.querySelector(".day-indicator.current-day");
		expect(currentDay).toBeTruthy();
		expect(currentDay?.textContent).toBe("2");
	});

	it("shows attempt number when week has been repeated", () => {
		const data = createMockUserData({
			currentWeek: 2,
			currentDay: 1,
			weekAttempts: { 2: 3 },
		});
		const onStartWorkout = mock(() => {});
		const onRepeatWeek = mock(() => {});

		render(
			<DashboardScreen
				data={data}
				onStartWorkout={onStartWorkout}
				onRepeatWeek={onRepeatWeek}
			/>,
		);

		// Should show attempt in workout card
		expect(screen.getByText(/T2\/D1 P3/)).toBeTruthy();

		// Should show attempt in week box
		expect(screen.getByText(/T2 P3/)).toBeTruthy();
	});

	it("calls onStartWorkout when start button is clicked", () => {
		const data = createMockUserData();
		const onStartWorkout = mock(() => {});
		const onRepeatWeek = mock(() => {});

		render(
			<DashboardScreen
				data={data}
				onStartWorkout={onStartWorkout}
				onRepeatWeek={onRepeatWeek}
			/>,
		);

		const startButton = screen.getByText("Rozpocznij trening");
		fireEvent.click(startButton);

		expect(onStartWorkout).toHaveBeenCalledTimes(1);
	});

	it("uses dashboard-screen class for styling", () => {
		const data = createMockUserData();
		const onStartWorkout = mock(() => {});
		const onRepeatWeek = mock(() => {});

		const { container } = render(
			<DashboardScreen
				data={data}
				onStartWorkout={onStartWorkout}
				onRepeatWeek={onRepeatWeek}
			/>,
		);

		expect(container.querySelector(".dashboard-screen")).toBeTruthy();
	});
});
