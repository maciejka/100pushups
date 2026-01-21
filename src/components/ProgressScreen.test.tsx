import { afterEach, describe, expect, it, mock } from "bun:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/preact";
import type { UserData, WorkoutRecord } from "../stores/db.ts";
import { ProgressScreen } from "./ProgressScreen.tsx";

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

describe("TEST-PROGRESS-001: ProgressScreen displays weeks and days", () => {
	it("displays all 6 weeks", () => {
		const data = createMockUserData();
		const onRepeatWeek = mock(() => {});
		const onNavigateHome = mock(() => {});

		const { container } = render(
			<ProgressScreen
				data={data}
				onRepeatWeek={onRepeatWeek}
				onNavigateHome={onNavigateHome}
			/>,
		);

		const weeks = container.querySelectorAll(".week");
		expect(weeks.length).toBe(6);
	});

	it("shows checkmark for completed days", () => {
		const data = createMockUserData({
			currentWeek: 2,
			currentDay: 1,
			workouts: [
				createMockWorkout(1, 1),
				createMockWorkout(1, 2),
				createMockWorkout(1, 3),
			],
		});
		const onRepeatWeek = mock(() => {});
		const onNavigateHome = mock(() => {});

		const { container } = render(
			<ProgressScreen
				data={data}
				onRepeatWeek={onRepeatWeek}
				onNavigateHome={onNavigateHome}
			/>,
		);

		// Week 1 should have 3 completed days with checkmarks
		const completedDays = container.querySelectorAll(".day.completed");
		expect(completedDays.length).toBe(3);

		// Each completed day should show checkmark
		for (const day of completedDays) {
			expect(day.textContent).toBe("✓");
		}
	});

	it("highlights current day", () => {
		const data = createMockUserData({
			currentWeek: 2,
			currentDay: 2,
			workouts: [
				createMockWorkout(1, 1),
				createMockWorkout(1, 2),
				createMockWorkout(1, 3),
				createMockWorkout(2, 1),
			],
		});
		const onRepeatWeek = mock(() => {});
		const onNavigateHome = mock(() => {});

		const { container } = render(
			<ProgressScreen
				data={data}
				onRepeatWeek={onRepeatWeek}
				onNavigateHome={onNavigateHome}
			/>,
		);

		// Current day should have both current-day class
		const currentDayEl = container.querySelector(".day.current-day");
		expect(currentDayEl).toBeTruthy();
		expect(currentDayEl?.textContent).toBe("2");
	});

	it("marks current week with 'current' class", () => {
		const data = createMockUserData({
			currentWeek: 3,
			currentDay: 1,
		});
		const onRepeatWeek = mock(() => {});
		const onNavigateHome = mock(() => {});

		const { container } = render(
			<ProgressScreen
				data={data}
				onRepeatWeek={onRepeatWeek}
				onNavigateHome={onNavigateHome}
			/>,
		);

		const currentWeek = container.querySelector(".week.current");
		expect(currentWeek).toBeTruthy();

		// Should only have one current week
		const currentWeeks = container.querySelectorAll(".week.current");
		expect(currentWeeks.length).toBe(1);
	});
});

describe("REPEAT-005: Visual feedback for week repeat", () => {
	it("shows repeat button on current week when day > 1", () => {
		const data = createMockUserData({
			currentWeek: 2,
			currentDay: 2,
		});
		const onRepeatWeek = mock(() => {});
		const onNavigateHome = mock(() => {});

		render(
			<ProgressScreen
				data={data}
				onRepeatWeek={onRepeatWeek}
				onNavigateHome={onNavigateHome}
			/>,
		);

		const repeatButton = screen.getByRole("button", {
			name: /Powtórz/,
		});
		expect(repeatButton).toBeTruthy();
	});

	it("calls onRepeatWeek when repeat button is clicked", () => {
		const data = createMockUserData({
			currentWeek: 3,
			currentDay: 2,
		});
		const onRepeatWeek = mock(() => {});
		const onNavigateHome = mock(() => {});

		render(
			<ProgressScreen
				data={data}
				onRepeatWeek={onRepeatWeek}
				onNavigateHome={onNavigateHome}
			/>,
		);

		const repeatButton = screen.getByRole("button", {
			name: /Powtórz/,
		});
		fireEvent.click(repeatButton);

		expect(onRepeatWeek).toHaveBeenCalledTimes(1);
	});

	it("does not show repeat button when day is 1", () => {
		const data = createMockUserData({
			currentWeek: 2,
			currentDay: 1,
		});
		const onRepeatWeek = mock(() => {});
		const onNavigateHome = mock(() => {});

		render(
			<ProgressScreen
				data={data}
				onRepeatWeek={onRepeatWeek}
				onNavigateHome={onNavigateHome}
			/>,
		);

		const repeatButton = screen.queryByRole("button", {
			name: /Powtórz/,
		});
		expect(repeatButton).toBeNull();
	});
});

describe("TEST-PROGRESS-002: Completion percentage calculation", () => {
	it("shows ~17% with 3 completed workouts (3/18)", () => {
		const data = createMockUserData({
			currentWeek: 2,
			currentDay: 1,
			workouts: [
				createMockWorkout(1, 1),
				createMockWorkout(1, 2),
				createMockWorkout(1, 3),
			],
		});
		const onRepeatWeek = mock(() => {});
		const onNavigateHome = mock(() => {});

		render(
			<ProgressScreen
				data={data}
				onRepeatWeek={onRepeatWeek}
				onNavigateHome={onNavigateHome}
			/>,
		);

		// 3/18 = 16.67% rounds to 17% - compact format: 3/18 (17%)
		const completion = screen.getByText(/3\/18/);
		expect(completion).toBeTruthy();
		expect(completion.textContent).toContain("17%");
	});

	it("shows 50% with 9 completed workouts (9/18)", () => {
		const workouts = [];
		// Create 9 workouts: 3 weeks × 3 days
		for (let week = 1; week <= 3; week++) {
			for (let day = 1; day <= 3; day++) {
				workouts.push(createMockWorkout(week, day));
			}
		}

		const data = createMockUserData({
			currentWeek: 4,
			currentDay: 1,
			workouts,
		});
		const onRepeatWeek = mock(() => {});
		const onNavigateHome = mock(() => {});

		render(
			<ProgressScreen
				data={data}
				onRepeatWeek={onRepeatWeek}
				onNavigateHome={onNavigateHome}
			/>,
		);

		// 9/18 = 50% - compact format: 9/18 (50%)
		const completion = screen.getByText(/9\/18/);
		expect(completion).toBeTruthy();
		expect(completion.textContent).toContain("50%");
	});
});

describe("DESIGN-007: Progress screen fits phone screen without scrolling", () => {
	it("uses compact layout classes", () => {
		const data = createMockUserData();
		const onRepeatWeek = mock(() => {});
		const onNavigateHome = mock(() => {});

		const { container } = render(
			<ProgressScreen
				data={data}
				onRepeatWeek={onRepeatWeek}
				onNavigateHome={onNavigateHome}
			/>,
		);

		// Check compact classes are applied
		expect(container.querySelector(".progress-screen-compact")).toBeTruthy();
		expect(container.querySelector(".weeks-grid")).toBeTruthy();
		expect(container.querySelectorAll(".week-compact").length).toBe(6);
		expect(container.querySelectorAll(".day-compact").length).toBe(18); // 6 weeks × 3 days
	});

	it("displays weeks in 2-column grid", () => {
		const data = createMockUserData();
		const onRepeatWeek = mock(() => {});
		const onNavigateHome = mock(() => {});

		const { container } = render(
			<ProgressScreen
				data={data}
				onRepeatWeek={onRepeatWeek}
				onNavigateHome={onNavigateHome}
			/>,
		);

		const weeksGrid = container.querySelector(".weeks-grid");
		expect(weeksGrid).toBeTruthy();
	});

	it("uses compact chart when workouts exist", () => {
		const data = createMockUserData({
			workouts: [createMockWorkout(1, 1)],
		});
		const onRepeatWeek = mock(() => {});
		const onNavigateHome = mock(() => {});

		const { container } = render(
			<ProgressScreen
				data={data}
				onRepeatWeek={onRepeatWeek}
				onNavigateHome={onNavigateHome}
			/>,
		);

		expect(container.querySelector(".reps-chart-compact")).toBeTruthy();
	});

	it("displays inline X-axis labels in chart", () => {
		const data = createMockUserData({
			workouts: [createMockWorkout(1, 1)],
		});
		const onRepeatWeek = mock(() => {});
		const onNavigateHome = mock(() => {});

		const { container } = render(
			<ProgressScreen
				data={data}
				onRepeatWeek={onRepeatWeek}
				onNavigateHome={onNavigateHome}
			/>,
		);

		// X-axis labels are now inline with bars (chart-x-label class)
		const xLabels = container.querySelectorAll(".chart-x-label");
		expect(xLabels.length).toBe(1); // One label per workout
		const firstLabel = xLabels[0];
		expect(firstLabel).toBeTruthy();
		expect(firstLabel?.textContent).toBe("T1D1");
	});

	it("uses compact header with inline completion info", () => {
		const data = createMockUserData({
			workouts: [createMockWorkout(1, 1)],
		});
		const onRepeatWeek = mock(() => {});
		const onNavigateHome = mock(() => {});

		const { container } = render(
			<ProgressScreen
				data={data}
				onRepeatWeek={onRepeatWeek}
				onNavigateHome={onNavigateHome}
			/>,
		);

		// Header should contain h1 and completion in a flex row
		const header = container.querySelector(".progress-header");
		expect(header).toBeTruthy();
		expect(header?.querySelector("h1")).toBeTruthy();
		expect(header?.querySelector(".completion")).toBeTruthy();
	});
});

describe("PROGRESS-006: Current week links to home screen", () => {
	it("displays current week header as clickable link", () => {
		const data = createMockUserData({
			currentWeek: 2,
			currentDay: 1,
		});
		const onRepeatWeek = mock(() => {});
		const onNavigateHome = mock(() => {});

		render(
			<ProgressScreen
				data={data}
				onRepeatWeek={onRepeatWeek}
				onNavigateHome={onNavigateHome}
			/>,
		);

		// Current week (2) should have a clickable button - compact format T2
		const weekLink = screen.getByRole("button", { name: /T2/ });
		expect(weekLink).toBeTruthy();
		expect(weekLink.classList.contains("week-link")).toBe(true);
	});

	it("calls onNavigateHome when current week link is clicked", () => {
		const data = createMockUserData({
			currentWeek: 3,
			currentDay: 2,
		});
		const onRepeatWeek = mock(() => {});
		const onNavigateHome = mock(() => {});

		render(
			<ProgressScreen
				data={data}
				onRepeatWeek={onRepeatWeek}
				onNavigateHome={onNavigateHome}
			/>,
		);

		// Click the current week link - compact format T3
		const weekLink = screen.getByRole("button", { name: /T3/ });
		fireEvent.click(weekLink);

		// Verify onNavigateHome was called
		expect(onNavigateHome).toHaveBeenCalledTimes(1);
	});

	it("does not make non-current weeks clickable", () => {
		const data = createMockUserData({
			currentWeek: 2,
			currentDay: 1,
		});
		const onRepeatWeek = mock(() => {});
		const onNavigateHome = mock(() => {});

		const { container } = render(
			<ProgressScreen
				data={data}
				onRepeatWeek={onRepeatWeek}
				onNavigateHome={onNavigateHome}
			/>,
		);

		// Week 1 should not be a button (it's not current)
		const weekButtons = container.querySelectorAll(".week-link");
		expect(weekButtons.length).toBe(1); // Only current week has the link
	});

	it("shows attempt in current week link when attempt > 1", () => {
		const data = createMockUserData({
			currentWeek: 4,
			currentDay: 1,
			weekAttempts: { 4: 3 },
		});
		const onRepeatWeek = mock(() => {});
		const onNavigateHome = mock(() => {});

		render(
			<ProgressScreen
				data={data}
				onRepeatWeek={onRepeatWeek}
				onNavigateHome={onNavigateHome}
			/>,
		);

		// Current week link should show attempt - compact format T4 P3
		const weekLink = screen.getByRole("button", { name: /T4 P3/ });
		expect(weekLink).toBeTruthy();
	});
});
