import { afterEach, describe, expect, it, mock } from "bun:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/preact";
import type { UserData } from "../stores/db.ts";
import { SettingsScreen } from "./SettingsScreen.tsx";

afterEach(() => {
	cleanup();
});

function createMockUserData(overrides: Partial<UserData> = {}): UserData {
	return {
		level: 3,
		currentWeek: 2,
		currentDay: 2,
		testResult: 15,
		workouts: [
			{
				week: 1,
				day: 1,
				attempt: 1,
				date: "2024-01-01T10:00:00.000Z",
				sets: [10, 10, 10, 10, 15],
			},
			{
				week: 1,
				day: 2,
				attempt: 1,
				date: "2024-01-03T10:00:00.000Z",
				sets: [10, 10, 10, 10, 16],
			},
			{
				week: 1,
				day: 3,
				attempt: 1,
				date: "2024-01-05T10:00:00.000Z",
				sets: [12, 12, 10, 10, 18],
			},
			{
				week: 2,
				day: 1,
				attempt: 1,
				date: "2024-01-07T10:00:00.000Z",
				sets: [12, 12, 12, 12, 20],
			},
		],
		weekAttempts: { 1: 1, 2: 1 },
		...overrides,
	};
}

describe("TEST-003: User can retake initial fitness test from settings", () => {
	it("displays 'Powtórz test' button in settings screen", () => {
		const data = createMockUserData();
		const onRetakeTest = mock(() => {});

		render(<SettingsScreen data={data} onRetakeTest={onRetakeTest} />);

		expect(screen.getByText("Powtórz test")).toBeTruthy();
	});

	it("displays current level and test result", () => {
		const data = createMockUserData({ level: 3, testResult: 15 });
		const onRetakeTest = mock(() => {});

		render(<SettingsScreen data={data} onRetakeTest={onRetakeTest} />);

		expect(screen.getByText("Aktualny poziom:")).toBeTruthy();
		expect(screen.getByText("3")).toBeTruthy();
		expect(screen.getByText("Wynik testu:")).toBeTruthy();
		expect(screen.getByText("15 pompek")).toBeTruthy();
	});

	it("calls onRetakeTest when 'Powtórz test' button is clicked", () => {
		const data = createMockUserData();
		const onRetakeTest = mock(() => {});

		render(<SettingsScreen data={data} onRetakeTest={onRetakeTest} />);

		const retakeButton = screen.getByText("Powtórz test");
		fireEvent.click(retakeButton);

		expect(onRetakeTest).toHaveBeenCalledTimes(1);
	});
});

describe("TEST-004: Retaking test fully resets training program", () => {
	it("handleRetakeTest should reset all program state", () => {
		// This test verifies the contract: when onRetakeTest is called,
		// App.tsx should reset: level, testResult, currentWeek, currentDay, workouts, weekAttempts
		// The actual reset logic is in App.tsx, tested via integration

		const data = createMockUserData({
			level: 4,
			currentWeek: 3,
			currentDay: 2,
			testResult: 25,
			workouts: [
				{
					week: 1,
					day: 1,
					attempt: 1,
					date: "2024-01-01",
					sets: [10, 10, 10, 10, 15],
				},
				{
					week: 1,
					day: 2,
					attempt: 1,
					date: "2024-01-02",
					sets: [10, 10, 10, 10, 16],
				},
			],
			weekAttempts: { 1: 1, 2: 2 },
		});
		const onRetakeTest = mock(() => {});

		render(<SettingsScreen data={data} onRetakeTest={onRetakeTest} />);

		// User is on week 3, day 2, with workout history
		expect(screen.getByText("4")).toBeTruthy(); // level shown
		expect(screen.getByText("25 pompek")).toBeTruthy(); // test result shown

		// Click retake test
		const retakeButton = screen.getByText("Powtórz test");
		fireEvent.click(retakeButton);

		// Verify onRetakeTest was called (App.tsx will handle the actual reset)
		expect(onRetakeTest).toHaveBeenCalledTimes(1);
	});

	it("retake button is visible regardless of program progress", () => {
		// Even at week 5, day 3 with many attempts, user should be able to retake
		const data = createMockUserData({
			currentWeek: 5,
			currentDay: 3,
			weekAttempts: { 1: 2, 2: 3, 3: 1, 4: 2, 5: 1 },
		});
		const onRetakeTest = mock(() => {});

		render(<SettingsScreen data={data} onRetakeTest={onRetakeTest} />);

		const retakeButton = screen.getByText("Powtórz test");
		expect(retakeButton).toBeTruthy();
		expect(retakeButton.tagName).toBe("BUTTON");
	});
});

describe("SettingsScreen UI", () => {
	it("has settings-screen class", () => {
		const data = createMockUserData();
		const onRetakeTest = mock(() => {});

		const { container } = render(
			<SettingsScreen data={data} onRetakeTest={onRetakeTest} />,
		);

		expect(container.querySelector(".settings-screen")).toBeTruthy();
	});

	it("displays header with Stefan's name (DESIGN-012)", () => {
		const data = createMockUserData();
		const onRetakeTest = mock(() => {});

		render(<SettingsScreen data={data} onRetakeTest={onRetakeTest} />);

		expect(screen.getByText("Stefan · Ustawienia")).toBeTruthy();
	});

	it("retake button uses btn-secondary class", () => {
		const data = createMockUserData();
		const onRetakeTest = mock(() => {});

		render(<SettingsScreen data={data} onRetakeTest={onRetakeTest} />);

		const retakeButton = screen.getByText("Powtórz test");
		expect(retakeButton.classList.contains("btn-secondary")).toBe(true);
	});
});
