import { getTargetReps, getWorkout } from "../data/program.ts";
import type { UserData } from "../stores/db.ts";
import { AppHeader } from "./AppHeader.tsx";

interface HomeScreenProps {
	data: UserData;
	onStartWorkout: () => void;
}

const isSameDay = (d1: Date, d2: Date) =>
	d1.getFullYear() === d2.getFullYear() &&
	d1.getMonth() === d2.getMonth() &&
	d1.getDate() === d2.getDate();

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

	return (
		<div class="screen home-screen">
			<AppHeader
				level={data.level}
				week={data.currentWeek}
				day={data.currentDay}
			/>
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
						<button type="button" class="btn-primary" onClick={onStartWorkout}>
							Następny trening
						</button>
					)}
				</div>
			) : (
				workout && (
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
				)
			)}
		</div>
	);
}
