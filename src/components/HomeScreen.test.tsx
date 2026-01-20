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
