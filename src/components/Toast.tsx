import { useEffect } from "preact/hooks";

interface ToastProps {
	message: string;
	onClose: () => void;
	duration?: number;
}

export function Toast({ message, onClose, duration = 2500 }: ToastProps) {
	useEffect(() => {
		const timeout = setTimeout(onClose, duration);
		return () => clearTimeout(timeout);
	}, [onClose, duration]);

	return <output class="toast">{message}</output>;
}
