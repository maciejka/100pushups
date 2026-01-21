const DB_NAME = "100pushups";
const DB_VERSION = 1;
const STORE_NAME = "userData";

let dbInstance: IDBDatabase | null = null;

export interface UserData {
	level: number | null;
	currentWeek: number;
	currentDay: number;
	testResult: number | null;
	workouts: WorkoutRecord[];
	weekAttempts: Record<number, number>;
}

export interface WorkoutRecord {
	week: number;
	day: number;
	attempt: number;
	date: string;
	sets: number[];
}

const defaultUserData: UserData = {
	level: null,
	currentWeek: 1,
	currentDay: 1,
	testResult: null,
	workouts: [],
	weekAttempts: {},
};

function openDB(): Promise<IDBDatabase> {
	if (dbInstance) {
		return Promise.resolve(dbInstance);
	}

	return new Promise((resolve, reject) => {
		const request = indexedDB.open(DB_NAME, DB_VERSION);

		request.onerror = () => reject(request.error);

		request.onsuccess = () => {
			dbInstance = request.result;
			resolve(dbInstance);
		};

		request.onupgradeneeded = (event) => {
			const db = (event.target as IDBOpenDBRequest).result;
			if (!db.objectStoreNames.contains(STORE_NAME)) {
				db.createObjectStore(STORE_NAME);
			}
		};
	});
}

async function withStore<T>(
	mode: IDBTransactionMode,
	fn: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
	const db = await openDB();
	return new Promise((resolve, reject) => {
		const request = fn(
			db.transaction(STORE_NAME, mode).objectStore(STORE_NAME),
		);
		request.onerror = () => reject(request.error);
		request.onsuccess = () => resolve(request.result);
	});
}

export const getData = (): Promise<UserData> =>
	withStore("readonly", (store) => store.get("user")).then(
		(r) => r ?? defaultUserData,
	);

export const saveData = (data: UserData): Promise<void> =>
	withStore("readwrite", (store) => store.put(data, "user")).then(() => {});

export const clearData = (): Promise<void> =>
	withStore("readwrite", (store) => store.delete("user")).then(() => {});
