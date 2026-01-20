import { describe, expect, it } from "bun:test";
import { getLevelFromTest, getTargetReps, isMaxSet, PROGRAM } from "./program";

describe("TEST-PROGRAM-001: Program structure (6 weeks, 3 days)", () => {
	it("should have 5 levels", () => {
		const levels = Object.keys(PROGRAM).map(Number);
		expect(levels).toEqual([1, 2, 3, 4, 5]);
	});

	it("should have 6 weeks per level", () => {
		for (const level of [1, 2, 3, 4, 5] as const) {
			expect(PROGRAM[level].weeks).toHaveLength(6);
		}
	});

	it("should have 3 days per week", () => {
		for (const level of [1, 2, 3, 4, 5] as const) {
			for (const week of PROGRAM[level].weeks) {
				expect(week.days).toHaveLength(3);
			}
		}
	});

	it("should have 5 sets per day", () => {
		for (const level of [1, 2, 3, 4, 5] as const) {
			for (const week of PROGRAM[level].weeks) {
				for (const day of week.days) {
					expect(day.sets).toHaveLength(5);
				}
			}
		}
	});
});

describe("TEST-PROGRAM-002: Final set is always max (-1)", () => {
	it("should have -1 as the last set for every workout", () => {
		for (const level of [1, 2, 3, 4, 5] as const) {
			for (const week of PROGRAM[level].weeks) {
				for (const day of week.days) {
					const lastSet = day.sets[day.sets.length - 1];
					expect(lastSet).toBe(-1);
				}
			}
		}
	});

	it("isMaxSet() should return true for -1", () => {
		expect(isMaxSet(-1)).toBe(true);
	});

	it("isMaxSet() should return false for positive numbers", () => {
		expect(isMaxSet(0)).toBe(false);
		expect(isMaxSet(5)).toBe(false);
		expect(isMaxSet(10)).toBe(false);
	});
});

describe("TEST-PROGRAM-003: Progressive rep increase across weeks", () => {
	it("should have higher total target reps in week 6 than week 1", () => {
		for (const level of [1, 2, 3, 4, 5] as const) {
			const week1Day1 = PROGRAM[level].weeks[0].days[0];
			const week6Day1 = PROGRAM[level].weeks[5].days[0];

			const week1Reps = getTargetReps(week1Day1);
			const week6Reps = getTargetReps(week6Day1);

			expect(week6Reps).toBeGreaterThan(week1Reps);
		}
	});
});

describe("TEST-TEST-002: Level assignment from pushup count", () => {
	it("should assign Level 1 for 0-5 pushups", () => {
		expect(getLevelFromTest(0)).toBe(1);
		expect(getLevelFromTest(3)).toBe(1);
		expect(getLevelFromTest(5)).toBe(1);
	});

	it("should assign Level 2 for 6-10 pushups", () => {
		expect(getLevelFromTest(6)).toBe(2);
		expect(getLevelFromTest(8)).toBe(2);
		expect(getLevelFromTest(10)).toBe(2);
	});

	it("should assign Level 3 for 11-20 pushups", () => {
		expect(getLevelFromTest(11)).toBe(3);
		expect(getLevelFromTest(15)).toBe(3);
		expect(getLevelFromTest(20)).toBe(3);
	});

	it("should assign Level 4 for 21-29 pushups", () => {
		expect(getLevelFromTest(21)).toBe(4);
		expect(getLevelFromTest(23)).toBe(4);
		expect(getLevelFromTest(29)).toBe(4);
	});

	it("should assign Level 5 for 30+ pushups", () => {
		expect(getLevelFromTest(30)).toBe(5);
		expect(getLevelFromTest(50)).toBe(5);
		expect(getLevelFromTest(100)).toBe(5);
	});
});

describe("TEST-TIMER-002: Rest duration varies by day", () => {
	it("Day 1 workouts should have rest: 60", () => {
		for (const level of [1, 2, 3, 4, 5] as const) {
			for (const week of PROGRAM[level].weeks) {
				expect(week.days[0].rest).toBe(60);
			}
		}
	});

	it("Day 2 workouts should have rest: 90", () => {
		for (const level of [1, 2, 3, 4, 5] as const) {
			for (const week of PROGRAM[level].weeks) {
				expect(week.days[1].rest).toBe(90);
			}
		}
	});

	it("Day 3 workouts should have rest: 120", () => {
		for (const level of [1, 2, 3, 4, 5] as const) {
			for (const week of PROGRAM[level].weeks) {
				expect(week.days[2].rest).toBe(120);
			}
		}
	});
});
