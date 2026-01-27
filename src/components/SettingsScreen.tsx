import type { UserData } from "../stores/db.ts";
import { AppHeader } from "./AppHeader.tsx";

interface SettingsScreenProps {
	data: UserData;
	onRetakeTest: () => void;
}

function formatDeployDate(isoString: string): string {
	const date = new Date(isoString);
	const day = String(date.getDate()).padStart(2, "0");
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const year = date.getFullYear();
	const hours = String(date.getHours()).padStart(2, "0");
	const minutes = String(date.getMinutes()).padStart(2, "0");
	return `${day}.${month}.${year} ${hours}:${minutes}`;
}

export function SettingsScreen({ data, onRetakeTest }: SettingsScreenProps) {
	const deployDate =
		typeof __DEPLOY_DATE__ !== "undefined" ? __DEPLOY_DATE__ : null;

	return (
		<div class="screen settings-screen">
			<AppHeader
				level={data.level}
				week={data.currentWeek}
				day={data.currentDay}
			/>
			<div class="setting-item">
				<span>Aktualny poziom:</span>
				<span>{data.level}</span>
			</div>
			<div class="setting-item">
				<span>Wynik testu:</span>
				<span>{data.testResult} pompek</span>
			</div>
			{deployDate && (
				<div class="setting-item">
					<span>Wersja:</span>
					<span>{formatDeployDate(deployDate)}</span>
				</div>
			)}
			<div class="setting-actions">
				<button type="button" class="btn-secondary" onClick={onRetakeTest}>
					Powtórz test
				</button>
			</div>
		</div>
	);
}
