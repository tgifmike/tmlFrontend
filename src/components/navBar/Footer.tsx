export default function Footer() {
	return (
		<footer className="w-full border-t bg-accent">
			<div className="mx-auto max-w-7xl px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
				<p>© {new Date().getFullYear()} The Manager Life</p>

				<div className="flex gap-6">
					<a href="/privacy" className="hover:text-foreground transition">
						Privacy
					</a>
					<a href="/terms" className="hover:text-foreground transition">
						Terms
					</a>
					<a href="/contact" className="hover:text-foreground transition">
						Contact
					</a>
				</div>
			</div>
		</footer>
	);
}
