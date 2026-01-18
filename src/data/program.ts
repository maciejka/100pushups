/**
 * 100 Pushups Program Data
 *
 * 6 weeks × 3 days × 5 sets × 5 levels
 * Based on the classic 100 Pushups training program
 * Simplified to 5 levels per PRD requirements
 *
 * Level assignment (from initial test):
 * - Level 1: 0-5 pushups
 * - Level 2: 6-10 pushups
 * - Level 3: 11-20 pushups
 * - Level 4: 21-29 pushups
 * - Level 5: 30+ pushups
 */

export interface WorkoutDay {
	sets: number[];
	rest: number; // seconds between sets
}

export interface ProgramWeek {
	days: [WorkoutDay, WorkoutDay, WorkoutDay];
}

export interface ProgramLevel {
	weeks: [
		ProgramWeek,
		ProgramWeek,
		ProgramWeek,
		ProgramWeek,
		ProgramWeek,
		ProgramWeek,
	];
}

/**
 * Determines level (1-5) from initial test result
 */
export function getLevelFromTest(pushups: number): number {
	if (pushups <= 5) return 1;
	if (pushups <= 10) return 2;
	if (pushups <= 20) return 3;
	if (pushups <= 29) return 4;
	return 5;
}

/**
 * Level thresholds for display purposes
 */
export const LEVEL_THRESHOLDS = [
	{ level: 1, min: 0, max: 5 },
	{ level: 2, min: 6, max: 10 },
	{ level: 3, min: 11, max: 20 },
	{ level: 4, min: 21, max: 29 },
	{ level: 5, min: 30, max: Infinity },
] as const;

/**
 * Program data for all 5 levels
 * Each level has 6 weeks, each week has 3 days, each day has 5 sets
 * Last set is always "max" (indicated by -1)
 *
 * Rest times:
 * - Day 1: 60 seconds
 * - Day 2: 90 seconds
 * - Day 3: 120 seconds
 */
export const PROGRAM: Record<1 | 2 | 3 | 4 | 5, ProgramLevel> = {
	1: {
		weeks: [
			// Week 1
			{
				days: [
					{ sets: [2, 3, 2, 2, -1], rest: 60 },
					{ sets: [3, 4, 2, 3, -1], rest: 90 },
					{ sets: [4, 5, 4, 4, -1], rest: 120 },
				],
			},
			// Week 2
			{
				days: [
					{ sets: [4, 6, 4, 4, -1], rest: 60 },
					{ sets: [5, 6, 4, 4, -1], rest: 90 },
					{ sets: [5, 7, 5, 5, -1], rest: 120 },
				],
			},
			// Week 3
			{
				days: [
					{ sets: [10, 12, 7, 7, -1], rest: 60 },
					{ sets: [10, 12, 8, 8, -1], rest: 90 },
					{ sets: [11, 13, 9, 9, -1], rest: 120 },
				],
			},
			// Week 4
			{
				days: [
					{ sets: [12, 14, 11, 10, -1], rest: 60 },
					{ sets: [14, 16, 12, 12, -1], rest: 90 },
					{ sets: [16, 18, 13, 13, -1], rest: 120 },
				],
			},
			// Week 5
			{
				days: [
					{ sets: [17, 19, 15, 15, -1], rest: 60 },
					{ sets: [18, 20, 16, 16, -1], rest: 90 },
					{ sets: [20, 22, 17, 17, -1], rest: 120 },
				],
			},
			// Week 6
			{
				days: [
					{ sets: [25, 30, 20, 15, -1], rest: 60 },
					{ sets: [27, 32, 22, 17, -1], rest: 90 },
					{ sets: [30, 35, 25, 20, -1], rest: 120 },
				],
			},
		],
	},
	2: {
		weeks: [
			// Week 1
			{
				days: [
					{ sets: [6, 6, 4, 4, -1], rest: 60 },
					{ sets: [6, 8, 6, 6, -1], rest: 90 },
					{ sets: [8, 10, 7, 7, -1], rest: 120 },
				],
			},
			// Week 2
			{
				days: [
					{ sets: [9, 11, 8, 8, -1], rest: 60 },
					{ sets: [10, 12, 9, 9, -1], rest: 90 },
					{ sets: [12, 13, 10, 10, -1], rest: 120 },
				],
			},
			// Week 3
			{
				days: [
					{ sets: [12, 17, 13, 13, -1], rest: 60 },
					{ sets: [14, 19, 14, 14, -1], rest: 90 },
					{ sets: [16, 21, 15, 15, -1], rest: 120 },
				],
			},
			// Week 4
			{
				days: [
					{ sets: [18, 22, 16, 16, -1], rest: 60 },
					{ sets: [20, 25, 20, 20, -1], rest: 90 },
					{ sets: [23, 28, 23, 23, -1], rest: 120 },
				],
			},
			// Week 5
			{
				days: [
					{ sets: [28, 35, 25, 22, -1], rest: 60 },
					{ sets: [30, 38, 27, 25, -1], rest: 90 },
					{ sets: [33, 40, 30, 28, -1], rest: 120 },
				],
			},
			// Week 6
			{
				days: [
					{ sets: [40, 50, 25, 25, -1], rest: 60 },
					{ sets: [42, 52, 28, 27, -1], rest: 90 },
					{ sets: [45, 55, 30, 30, -1], rest: 120 },
				],
			},
		],
	},
	3: {
		weeks: [
			// Week 1
			{
				days: [
					{ sets: [10, 12, 7, 7, -1], rest: 60 },
					{ sets: [10, 12, 8, 8, -1], rest: 90 },
					{ sets: [11, 15, 9, 9, -1], rest: 120 },
				],
			},
			// Week 2
			{
				days: [
					{ sets: [14, 14, 10, 10, -1], rest: 60 },
					{ sets: [14, 16, 12, 12, -1], rest: 90 },
					{ sets: [16, 17, 14, 14, -1], rest: 120 },
				],
			},
			// Week 3
			{
				days: [
					{ sets: [14, 18, 14, 14, -1], rest: 60 },
					{ sets: [20, 25, 15, 15, -1], rest: 90 },
					{ sets: [22, 30, 20, 20, -1], rest: 120 },
				],
			},
			// Week 4
			{
				days: [
					{ sets: [21, 25, 21, 21, -1], rest: 60 },
					{ sets: [25, 29, 25, 25, -1], rest: 90 },
					{ sets: [29, 33, 29, 29, -1], rest: 120 },
				],
			},
			// Week 5
			{
				days: [
					{ sets: [36, 40, 30, 24, -1], rest: 60 },
					{ sets: [38, 42, 32, 28, -1], rest: 90 },
					{ sets: [40, 45, 35, 30, -1], rest: 120 },
				],
			},
			// Week 6
			{
				days: [
					{ sets: [45, 55, 35, 30, -1], rest: 60 },
					{ sets: [48, 58, 38, 33, -1], rest: 90 },
					{ sets: [50, 60, 40, 35, -1], rest: 120 },
				],
			},
		],
	},
	4: {
		weeks: [
			// Week 1
			{
				days: [
					{ sets: [12, 14, 9, 9, -1], rest: 60 },
					{ sets: [12, 15, 10, 10, -1], rest: 90 },
					{ sets: [14, 18, 11, 11, -1], rest: 120 },
				],
			},
			// Week 2
			{
				days: [
					{ sets: [16, 18, 12, 12, -1], rest: 60 },
					{ sets: [18, 20, 14, 14, -1], rest: 90 },
					{ sets: [20, 22, 16, 16, -1], rest: 120 },
				],
			},
			// Week 3
			{
				days: [
					{ sets: [18, 22, 16, 16, -1], rest: 60 },
					{ sets: [22, 28, 18, 18, -1], rest: 90 },
					{ sets: [26, 32, 22, 22, -1], rest: 120 },
				],
			},
			// Week 4
			{
				days: [
					{ sets: [26, 30, 24, 24, -1], rest: 60 },
					{ sets: [30, 34, 28, 28, -1], rest: 90 },
					{ sets: [34, 38, 32, 32, -1], rest: 120 },
				],
			},
			// Week 5
			{
				days: [
					{ sets: [40, 45, 35, 30, -1], rest: 60 },
					{ sets: [42, 48, 38, 33, -1], rest: 90 },
					{ sets: [45, 50, 40, 35, -1], rest: 120 },
				],
			},
			// Week 6
			{
				days: [
					{ sets: [50, 60, 40, 35, -1], rest: 60 },
					{ sets: [53, 63, 43, 38, -1], rest: 90 },
					{ sets: [55, 65, 45, 40, -1], rest: 120 },
				],
			},
		],
	},
	5: {
		weeks: [
			// Week 1
			{
				days: [
					{ sets: [15, 18, 12, 12, -1], rest: 60 },
					{ sets: [16, 20, 14, 14, -1], rest: 90 },
					{ sets: [18, 22, 16, 16, -1], rest: 120 },
				],
			},
			// Week 2
			{
				days: [
					{ sets: [20, 24, 16, 16, -1], rest: 60 },
					{ sets: [22, 26, 18, 18, -1], rest: 90 },
					{ sets: [24, 28, 20, 20, -1], rest: 120 },
				],
			},
			// Week 3
			{
				days: [
					{ sets: [24, 28, 20, 20, -1], rest: 60 },
					{ sets: [28, 34, 24, 24, -1], rest: 90 },
					{ sets: [32, 38, 28, 28, -1], rest: 120 },
				],
			},
			// Week 4
			{
				days: [
					{ sets: [32, 36, 28, 28, -1], rest: 60 },
					{ sets: [36, 40, 32, 32, -1], rest: 90 },
					{ sets: [40, 44, 36, 36, -1], rest: 120 },
				],
			},
			// Week 5
			{
				days: [
					{ sets: [44, 50, 40, 35, -1], rest: 60 },
					{ sets: [48, 54, 44, 40, -1], rest: 90 },
					{ sets: [52, 58, 48, 44, -1], rest: 120 },
				],
			},
			// Week 6
			{
				days: [
					{ sets: [55, 65, 50, 45, -1], rest: 60 },
					{ sets: [58, 68, 53, 48, -1], rest: 90 },
					{ sets: [60, 70, 55, 50, -1], rest: 120 },
				],
			},
		],
	},
};

/**
 * Get workout data for a specific level, week, and day
 */
export function getWorkout(
	level: 1 | 2 | 3 | 4 | 5,
	week: number,
	day: number,
): WorkoutDay | null {
	if (week < 1 || week > 6 || day < 1 || day > 3) {
		return null;
	}
	const weekData = PROGRAM[level].weeks[week - 1];
	if (!weekData) return null;
	const dayData = weekData.days[day - 1];
	return dayData ?? null;
}

/**
 * Calculate total target reps for a workout (excluding max set)
 */
export function getTargetReps(workout: WorkoutDay): number {
	return workout.sets
		.filter((reps) => reps !== -1)
		.reduce((sum, reps) => sum + reps, 0);
}

/**
 * Check if a set is the "max" set
 */
export function isMaxSet(reps: number): boolean {
	return reps === -1;
}
