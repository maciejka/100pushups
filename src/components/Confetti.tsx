import { useEffect, useState } from "preact/hooks";

interface ConfettiPiece {
	id: number;
	left: number;
	color: string;
	delay: number;
	size: number;
}

const COLORS = ["#00d4ff", "#7c3aed", "#22c55e", "#f59e0b", "#ef4444"] as const;

export function Confetti() {
	const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

	useEffect(() => {
		const newPieces: ConfettiPiece[] = [];
		for (let i = 0; i < 50; i++) {
			newPieces.push({
				id: i,
				left: Math.random() * 100,
				color: COLORS[Math.floor(Math.random() * COLORS.length)] ?? "#00d4ff",
				delay: Math.random() * 0.5,
				size: Math.random() * 8 + 6,
			});
		}
		setPieces(newPieces);

		// Clean up after animation
		const timeout = setTimeout(() => {
			setPieces([]);
		}, 3500);

		return () => clearTimeout(timeout);
	}, []);

	if (pieces.length === 0) return null;

	return (
		<div class="confetti-container">
			{pieces.map((piece) => (
				<div
					key={piece.id}
					class="confetti"
					style={{
						left: `${piece.left}%`,
						backgroundColor: piece.color,
						width: `${piece.size}px`,
						height: `${piece.size}px`,
						animationDelay: `${piece.delay}s`,
						borderRadius: Math.random() > 0.5 ? "50%" : "0",
					}}
				/>
			))}
		</div>
	);
}
