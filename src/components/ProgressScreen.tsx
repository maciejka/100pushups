import type { UserData, WorkoutRecord } from "../stores/db.ts";

interface ProgressScreenProps {
	data: UserData;
	onRepeatWeek: () => void;
	onNavigateHome: () => void;
}

// Get the total reps for a specific week/day from workouts
function getWorkoutTotal(
	workouts: WorkoutRecord[],
	week: number,
	day: number,
): number | null {
	const workout = workouts.find((w) => w.week === week && w.day === day);
	if (!workout) return null;
	return workout.sets.reduce((sum, r) => sum + r, 0);
}

export function ProgressScreen({
	data,
	onRepeatWeek,
	onNavigateHome,
}: ProgressScreenProps) {
	const completedWorkouts = data.workouts.length;
	const totalWorkouts = 18;
	const completionPercent = Math.round(
		(completedWorkouts / totalWorkouts) * 100,
	);

	// Calculate total reps for each workout for the chart
	const workoutTotals = data.workouts.map((w) => ({
		label: `T${w.week}D${w.day}`,
		reps: w.sets.reduce((sum, r) => sum + r, 0),
		date: w.date,
	}));
	const maxReps = Math.max(...workoutTotals.map((w) => w.reps), 1);

	return (
		<div class="screen progress-screen progress-screen-compact">
			<div class="progress-header">
				<h1>Postępy</h1>
				<span class="completion">
					{completedWorkouts}/{totalWorkouts} ({completionPercent}%)
				</span>
			</div>

			{workoutTotals.length > 0 && (
				<div class="reps-chart reps-chart-compact">
					<div class="chart-container">
						{workoutTotals.map((w, i) => (
							<div key={i} class="chart-bar-container">
								<div
									class="chart-bar"
									style={{
										height: `${(w.reps / maxReps) * 100}%`,
									}}
								/>
								<div class="chart-x-label">{w.label}</div>
							</div>
						))}
					</div>
				</div>
			)}

			<div class="weeks weeks-grid">
				{[1, 2, 3, 4, 5, 6].map((week) => {
					const isCurrent = week === data.currentWeek;
					const attempt = data.weekAttempts[week] ?? 1;
					return (
						<div
							key={week}
							class={`week week-compact ${isCurrent ? "current" : ""}`}
						>
							<div class="week-header">
								{isCurrent ? (
									<button
										type="button"
										class="week-link"
										onClick={onNavigateHome}
									>
										T{week}
										{attempt > 1 && ` P${attempt}`}
									</button>
								) : (
									<span class="week-label">
										T{week}
										{attempt > 1 && ` P${attempt}`}
									</span>
								)}
							</div>
							<div class="days days-compact">
								{[1, 2, 3].map((day) => {
									const total = getWorkoutTotal(data.workouts, week, day);
									const completed = total !== null;
									const isCurrentDay = isCurrent && day === data.currentDay;
									return (
										<span
											key={day}
											class={`day day-compact ${completed ? "completed" : ""} ${isCurrentDay ? "current-day" : ""}`}
										>
											{completed ? total : day}
										</span>
									);
								})}
							</div>
							{isCurrent && data.currentDay > 1 && (
								<button
									type="button"
									class="btn-repeat-compact"
									onClick={onRepeatWeek}
								>
									Powtórz
								</button>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}
