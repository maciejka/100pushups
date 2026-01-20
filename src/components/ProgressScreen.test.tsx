import { afterEach, describe, expect, it, mock } from "bun:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/preact";
import type { UserData } from "../stores/db.ts";
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
			name: /Powtórz tydzień/,
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
			name: /Powtórz tydzień/,
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
			name: /Powtórz tydzień/,
		});
		expect(repeatButton).toBeNull();
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

		// Current week (2) should have a clickable button
		const weekLink = screen.getByRole("button", { name: /T: 2\/6/ });
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

		// Click the current week link
		const weekLink = screen.getByRole("button", { name: /T: 3\/6/ });
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

		// Current week link should show attempt
		const weekLink = screen.getByRole("button", { name: /T: 4\/6, P: 3/ });
		expect(weekLink).toBeTruthy();
	});
});
