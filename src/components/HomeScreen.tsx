import { getTargetReps, getWorkout } from "../data/program.ts";
import type { UserData } from "../stores/db.ts";

interface HomeScreenProps {
	data: UserData;
	onStartWorkout: () => void;
}

const isSameDay = (d1: Date, d2: Date) =>
	d1.getFullYear() === d2.getFullYear() &&
	d1.getMonth() === d2.getMonth() &&
	d1.getDate() === d2.getDate();

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

export function HomeScreen({ data, onStartWorkout }: HomeScreenProps) {
	const level = data.level as 1 | 2 | 3 | 4 | 5;
	const workout = getWorkout(level, data.currentWeek, data.currentDay);
	const targetReps = workout ? getTargetReps(workout) : 0;

	// Check if last workout was done today
	const lastWorkout = data.workouts[data.workouts.length - 1];
	const completedToday =
		lastWorkout && isSameDay(new Date(lastWorkout.date), new Date());

	// Check if program is complete (after week 6, day 3)
	const programComplete = data.currentWeek > 6;

	// Get current week attempt number
	const currentAttempt = data.weekAttempts[data.currentWeek] ?? 1;

	return (
		<div class="screen home-screen">
			<div class="compact-header">
				<div class="header-left">
					<span class="greeting-name">Stefan</span>
					<span class="header-divider">·</span>
					<span class="level-badge">P{data.level}</span>
				</div>
				<div class="header-right">
					{!programComplete && (
						<span class="progress-compact">
							T: {data.currentWeek}/6, D: {data.currentDay}/3
							{currentAttempt > 1 && `, P: ${currentAttempt}`}
						</span>
					)}
				</div>
			</div>
			{programComplete ? (
				<div class="program-complete">
					<p class="week-info">Program ukończony!</p>
					<p>Gratulacje! Ukończyłeś 6-tygodniowy program.</p>
				</div>
			) : completedToday ? (
				<div class="workout-done-today success-glow">
					<p>Dzisiejszy trening ukończony! 🎉</p>
					<p class="next-workout-hint">
						Świetna robota, Stefan! Odpoczywaj do następnego treningu.
					</p>
					{workout && (
						<button
							type="button"
							class="btn-secondary"
							onClick={onStartWorkout}
						>
							Następny trening
						</button>
					)}
				</div>
			) : (
				workout && (
					<>
						<div class="motivational-message">
							<p class="message-text">{randomMessage()}</p>
						</div>
						<div class="workout-preview">
							<p>Następny trening:</p>
							<p>
								{workout.sets.length} serii, cel: {targetReps}+ powtórzeń
							</p>
							<button
								type="button"
								class="btn-primary"
								onClick={onStartWorkout}
							>
								Rozpocznij trening
							</button>
						</div>
					</>
				)
			)}
		</div>
	);
}
