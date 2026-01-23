import { getTargetReps, getWorkout } from "../data/program.ts";
import type { UserData, WorkoutRecord } from "../stores/db.ts";
import { AppHeader } from "./AppHeader.tsx";

interface DashboardScreenProps {
	data: UserData;
	onStartWorkout: () => void;
	onRepeatWeek: () => void;
}

const isSameDay = (d1: Date, d2: Date) =>
	d1.getFullYear() === d2.getFullYear() &&
	d1.getMonth() === d2.getMonth() &&
	d1.getDate() === d2.getDate();

function getWorkoutTotal(
	workouts: WorkoutRecord[],
	week: number,
	day: number,
): number | null {
	const workout = workouts.find((w) => w.week === week && w.day === day);
	if (!workout) return null;
	return workout.sets.reduce((sum, r) => sum + r, 0);
}

const MESSAGES = [
	"Każda pompka to krok do celu!",
	"Dzisiaj budujesz siłę na jutro!",
	"Nie poddawaj się, Stefan!",
	"Jesteś silniejszy niż myślisz!",
	"100 pompek? Dasz radę!",
	"Cel jest w zasięgu ręki!",
	"Twoja determinacja jest inspirująca!",
	"Ruszamy po rekord!",
];

const randomMessage = () =>
	MESSAGES[Math.floor(Math.random() * MESSAGES.length)] ?? MESSAGES[0];

export function DashboardScreen({
	data,
	onStartWorkout,
	onRepeatWeek,
}: DashboardScreenProps) {
	const level = data.level as 1 | 2 | 3 | 4 | 5;
	const workout = getWorkout(level, data.currentWeek, data.currentDay);
	const targetReps = workout ? getTargetReps(workout) : 0;

	const lastWorkout = data.workouts[data.workouts.length - 1];
	const completedToday =
		lastWorkout && isSameDay(new Date(lastWorkout.date), new Date());

	const programComplete = data.currentWeek > 6;
	const currentAttempt = data.weekAttempts[data.currentWeek] ?? 1;

	return (
		<div class="screen dashboard-screen">
			<AppHeader
				level={data.level}
				week={data.currentWeek}
				day={data.currentDay}
			/>

			{programComplete ? (
				<div class="workout-card program-complete-card">
					<p class="complete-title">Program ukończony!</p>
					<p>Gratulacje! Ukończyłeś 6-tygodniowy program.</p>
				</div>
			) : completedToday ? (
				<div class="workout-card success-glow">
					<p class="done-title">Dzisiejszy trening ukończony! 🎉</p>
					<p class="done-hint">
						Świetna robota, Stefan! Odpoczywaj do następnego treningu.
					</p>
					{workout && (
						<button type="button" class="btn-primary" onClick={onStartWorkout}>
							Następny trening
						</button>
					)}
				</div>
			) : (
				workout && (
					<div class="workout-card">
						<p class="motivational-text">{randomMessage()}</p>
						<div class="workout-info">
							<span class="workout-label">
								T{data.currentWeek}/D{data.currentDay}
								{currentAttempt > 1 && ` P${currentAttempt}`}
							</span>
							<span class="workout-target">
								{workout.sets.length} serii · {targetReps}+ powtórzeń
							</span>
						</div>
						<button type="button" class="btn-primary" onClick={onStartWorkout}>
							Rozpocznij trening
						</button>
					</div>
				)
			)}

			<div class="weeks-overview">
				{[1, 2, 3, 4, 5, 6].map((week) => {
					const isCurrent = week === data.currentWeek;
					const attempt = data.weekAttempts[week] ?? 1;
					return (
						<div key={week} class={`week-box ${isCurrent ? "current" : ""}`}>
							<div class="week-header">
								<span class="week-label">
									T{week}
									{attempt > 1 && ` P${attempt}`}
								</span>
								{isCurrent && data.currentDay > 1 && (
									<button
										type="button"
										class="btn-repeat"
										onClick={onRepeatWeek}
									>
										Powtórz
									</button>
								)}
							</div>
							<div class="days-row">
								{[1, 2, 3].map((day) => {
									const total = getWorkoutTotal(data.workouts, week, day);
									const completed = total !== null;
									const isCurrentDay = isCurrent && day === data.currentDay;
									return (
										<span
											key={day}
											class={`day-indicator ${completed ? "completed" : ""} ${isCurrentDay ? "current-day" : ""}`}
										>
											{completed ? total : day}
										</span>
									);
								})}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
