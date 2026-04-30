'use client';

export default function Error({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	return (
		<div className="min-h-screen flex items-center justify-center">
			<div className="text-center space-y-4">
				<h2 className="text-2xl font-semibold">Something went wrong</h2>
				<p className="text-muted-foreground">
					We hit an unexpected issue. Please try again.
				</p>

				<button
					onClick={() => reset()}
					className="px-4 py-2 rounded bg-primary text-white"
				>
					Retry
				</button>
			</div>
		</div>
	);
}
