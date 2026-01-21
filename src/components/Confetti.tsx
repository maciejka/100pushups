import { useEffect, useState } from "preact/hooks";

const COLORS = ["#00d4ff", "#7c3aed", "#22c55e", "#f59e0b", "#ef4444"];
const rand = (max: number) => Math.random() * max;
const pick = <T,>(arr: T[]) => arr[Math.floor(rand(arr.length))] as T;

export function Confetti() {
	const [pieces, setPieces] = useState(() =>
		Array.from({ length: 50 }, (_, i) => ({
			id: i,
			left: rand(100),
			color: pick(COLORS),
			delay: rand(0.5),
			size: rand(8) + 6,
			round: Math.random() > 0.5,
		})),
	);

	useEffect(() => {
		const timeout = setTimeout(() => setPieces([]), 3500);
		return () => clearTimeout(timeout);
	}, []);

	if (pieces.length === 0) return null;

	return (
		<div class="confetti-container">
			{pieces.map((p) => (
				<div
					key={p.id}
					class="confetti"
					style={{
						left: `${p.left}%`,
						backgroundColor: p.color,
						width: `${p.size}px`,
						height: `${p.size}px`,
						animationDelay: `${p.delay}s`,
						borderRadius: p.round ? "50%" : "0",
					}}
				/>
			))}
		</div>
	);
}
