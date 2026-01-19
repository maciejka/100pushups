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

	return (
		<div class="screen progress-screen">
			<h1>Postępy</h1>
			<p class="completion">
				Ukończono: {completedWorkouts} z {totalWorkouts} treningów (
				{completionPercent}%)
			</p>
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
