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
				<div
					class="reps-chart"
					style={{ marginBottom: "1.5rem", padding: "1rem" }}
				>
					<h2 style={{ marginBottom: "0.5rem" }}>Powtórzenia w treningach</h2>
					<div
						class="chart-container"
						style={{
							display: "flex",
							alignItems: "flex-end",
							gap: "0.25rem",
							height: "120px",
							borderBottom: "1px solid #ccc",
							paddingBottom: "0.25rem",
						}}
					>
						{workoutTotals.map((w, i) => (
							<div
								key={i}
								class="chart-bar-container"
								style={{
									display: "flex",
									flexDirection: "column",
									alignItems: "center",
									flex: 1,
									minWidth: "30px",
								}}
							>
								<div
									class="chart-bar-label"
									style={{ fontSize: "0.7rem", marginBottom: "2px" }}
								>
									{w.reps}
								</div>
								<div
									class="chart-bar"
									style={{
										width: "100%",
										height: `${(w.reps / maxReps) * 100}%`,
										backgroundColor: "#4f46e5",
										borderRadius: "2px 2px 0 0",
										minHeight: "4px",
									}}
								/>
							</div>
						))}
					</div>
					<div
						class="chart-x-labels"
						style={{
							display: "flex",
							gap: "0.25rem",
							marginTop: "0.25rem",
						}}
					>
						{workoutTotals.map((w, i) => (
							<div
								key={i}
								style={{
									flex: 1,
									textAlign: "center",
									fontSize: "0.6rem",
									minWidth: "30px",
								}}
							>
								{w.label}
							</div>
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
