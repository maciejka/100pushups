import type { UserData } from "../stores/db.ts";

interface ProgressScreenProps {
	data: UserData;
	onRepeatWeek: () => void;
}

export function ProgressScreen({ data, onRepeatWeek }: ProgressScreenProps) {
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
		<div class="screen progress-screen">
			<h1>Postępy</h1>
			<p class="completion">
				Ukończono: {completedWorkouts} z {totalWorkouts} treningów (
				{completionPercent}%)
			</p>

			{workoutTotals.length > 0 && (
				<div class="reps-chart">
					<h2>Powtórzenia w treningach</h2>
					<div class="chart-container">
						{workoutTotals.map((w, i) => (
							<div key={i} class="chart-bar-container">
								<div class="chart-bar-label">{w.reps}</div>
								<div
									class="chart-bar"
									style={{
										height: `${(w.reps / maxReps) * 100}%`,
									}}
								/>
							</div>
						))}
					</div>
					<div class="chart-x-labels">
						{workoutTotals.map((w, i) => (
							<div key={i}>{w.label}</div>
						))}
					</div>
				</div>
			)}

			<div class="weeks">
				{[1, 2, 3, 4, 5, 6].map((week) => {
					const weekWorkouts = data.workouts.filter((w) => w.week === week);
					const isCurrent = week === data.currentWeek;
					const attempt = data.weekAttempts[week] ?? 1;
					return (
						<div key={week} class={`week ${isCurrent ? "current" : ""}`}>
							<h2>
								Tydzień {week}
								{attempt > 1 && ` - Próba ${attempt}`}
							</h2>
							<div class="days">
								{[1, 2, 3].map((day) => {
									const completed = weekWorkouts.some((w) => w.day === day);
									const isCurrentDay = isCurrent && day === data.currentDay;
									return (
										<span
											key={day}
											class={`day ${completed ? "completed" : ""} ${isCurrentDay ? "current-day" : ""}`}
										>
											{completed ? "✓" : day}
										</span>
									);
								})}
							</div>
							{isCurrent && data.currentDay > 1 && (
								<button
									type="button"
									class="btn-secondary btn-small"
									onClick={onRepeatWeek}
								>
									Powtórz tydzień
								</button>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}
