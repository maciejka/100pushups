import type { UserData } from "../stores/db.ts";

interface SettingsScreenProps {
	data: UserData;
	onRetakeTest: () => void;
}

export function SettingsScreen({ data, onRetakeTest }: SettingsScreenProps) {
	return (
		<div class="screen settings-screen">
			<h1>Ustawienia</h1>
			<div class="setting-item">
				<span>Aktualny poziom:</span>
				<span>{data.level}</span>
			</div>
			<div class="setting-item">
				<span>Wynik testu:</span>
				<span>{data.testResult} pompek</span>
			</div>
			<div class="setting-actions">
				<button type="button" class="btn-secondary" onClick={onRetakeTest}>
					Powtórz test
				</button>
			</div>
		</div>
	);
}
