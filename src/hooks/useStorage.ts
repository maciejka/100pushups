import { useCallback, useEffect, useState } from "preact/hooks";
import { getData, saveData, type UserData } from "../stores/db.ts";

interface UseStorageResult {
	data: UserData | null;
	loading: boolean;
	error: Error | null;
	update: (updates: Partial<UserData>) => Promise<void>;
	reload: () => Promise<void>;
}

export function useStorage(): UseStorageResult {
	const [data, setData] = useState<UserData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	const load = useCallback(async () => {
		try {
			setLoading(true);
			const userData = await getData();
			setData(userData);
			setError(null);
		} catch (e) {
			setError(e instanceof Error ? e : new Error(String(e)));
		} finally {
			setLoading(false);
		}
	}, []);

	const update = useCallback(
		async (updates: Partial<UserData>) => {
			if (!data) return;
			const newData = { ...data, ...updates };
			await saveData(newData);
			setData(newData);
		},
		[data],
	);

	useEffect(() => {
		load();
	}, [load]);

	return {
		data,
		loading,
		error,
		update,
		reload: load,
	};
}
