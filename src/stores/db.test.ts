import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { clearData, getData, saveData, type UserData } from "./db";

describe("TEST-STORAGE-001: IndexedDB data persistence", () => {
	beforeEach(async () => {
		await clearData();
	});

	afterEach(async () => {
		await clearData();
	});

	it("should return default data when no data exists", async () => {
		const data = await getData();

		expect(data).toEqual({
			level: null,
			currentWeek: 1,
			currentDay: 1,
			testResult: null,
			workouts: [],
			weekAttempts: {},
		});
	});

	it("should save and retrieve data correctly (round-trip)", async () => {
		const testData: UserData = {
			level: 3,
			currentWeek: 2,
			currentDay: 2,
			testResult: 15,
			workouts: [
				{
					week: 1,
					day: 1,
					attempt: 1,
					date: "2024-01-15",
					sets: [10, 12, 8, 8, 15],
				},
			],
			weekAttempts: { 1: 1 },
		};

		await saveData(testData);
		const retrieved = await getData();

		expect(retrieved).toEqual(testData);
	});

	it("should overwrite existing data when saving", async () => {
		const initialData: UserData = {
			level: 1,
			currentWeek: 1,
			currentDay: 1,
			testResult: 5,
			workouts: [],
			weekAttempts: {},
		};

		const updatedData: UserData = {
			level: 2,
			currentWeek: 3,
			currentDay: 2,
			testResult: 8,
			workouts: [
				{
					week: 1,
					day: 1,
					attempt: 1,
					date: "2024-01-10",
					sets: [5, 5, 5, 5, 10],
				},
			],
			weekAttempts: { 1: 2 },
		};

		await saveData(initialData);
		await saveData(updatedData);
		const retrieved = await getData();

		expect(retrieved).toEqual(updatedData);
	});

	it("should persist complex workout records", async () => {
		const testData: UserData = {
			level: 5,
			currentWeek: 4,
			currentDay: 3,
			testResult: 35,
			workouts: [
				{
					week: 1,
					day: 1,
					attempt: 1,
					date: "2024-01-01",
					sets: [20, 25, 20, 20, 30],
				},
				{
					week: 1,
					day: 2,
					attempt: 1,
					date: "2024-01-03",
					sets: [22, 27, 22, 22, 35],
				},
				{
					week: 1,
					day: 3,
					attempt: 1,
					date: "2024-01-05",
					sets: [25, 30, 25, 25, 40],
				},
			],
			weekAttempts: { 1: 1, 2: 2 },
		};

		await saveData(testData);
		const retrieved = await getData();

		expect(retrieved.workouts).toHaveLength(3);
		expect(retrieved.workouts[0]?.sets).toEqual([20, 25, 20, 20, 30]);
		expect(retrieved.weekAttempts).toEqual({ 1: 1, 2: 2 });
	});

	it("should clear data and return defaults after clear", async () => {
		const testData: UserData = {
			level: 4,
			currentWeek: 2,
			currentDay: 1,
			testResult: 25,
			workouts: [],
			weekAttempts: {},
		};

		await saveData(testData);
		await clearData();
		const retrieved = await getData();

		expect(retrieved.level).toBeNull();
		expect(retrieved.currentWeek).toBe(1);
		expect(retrieved.currentDay).toBe(1);
	});
});
