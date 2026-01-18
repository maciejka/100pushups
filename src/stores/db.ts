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

export async function getData(): Promise<UserData> {
	const db = await openDB();
	return new Promise((resolve, reject) => {
		const transaction = db.transaction(STORE_NAME, "readonly");
		const store = transaction.objectStore(STORE_NAME);
		const request = store.get("user");

		request.onerror = () => reject(request.error);
		request.onsuccess = () => {
			resolve(request.result ?? defaultUserData);
		};
	});
}

export async function saveData(data: UserData): Promise<void> {
	const db = await openDB();
	return new Promise((resolve, reject) => {
		const transaction = db.transaction(STORE_NAME, "readwrite");
		const store = transaction.objectStore(STORE_NAME);
		const request = store.put(data, "user");

		request.onerror = () => reject(request.error);
		request.onsuccess = () => resolve();
	});
}

export async function clearData(): Promise<void> {
	const db = await openDB();
	return new Promise((resolve, reject) => {
		const transaction = db.transaction(STORE_NAME, "readwrite");
		const store = transaction.objectStore(STORE_NAME);
		const request = store.delete("user");

		request.onerror = () => reject(request.error);
		request.onsuccess = () => resolve();
	});
}
