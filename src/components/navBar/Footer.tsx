export default function Footer() {
	return (
		<footer className="w-full border-t bg-accent">
			<div className="mx-auto max-w-7xl px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
				<p>© {new Date().getFullYear()} The Manager Life</p>

				<div className="flex flex-wrap items-center justify-center gap-6">
					<a href="/about" className="hover:text-foreground transition">
						About
					</a>
					<a href="/restaurant-digital-line-check-software" className="hover:text-foreground transition">
						Line Check Software
					</a>
					<a href="/blog" className="hover:text-foreground transition">
						Blog
					</a>
					<a href="/faq" className="hover:text-foreground transition">
						FAQ
					</a>
					<a href="/how-to" className="hover:text-foreground transition">
						How To
					</a>
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

				<a
					href="https://saasbrowser.com/en/saas/1495481/the-manager-life"
					target="_blank"
					rel="nofollow noopener noreferrer"
					aria-label="View The Manager Life on SaaS Browser"
					className="shrink-0 transition-opacity hover:opacity-80"
				>
					<img
						src="https://static-files.saasbrowser.com/saas-browser-badge-15.svg"
						alt="The Manager Life - software directory"
						width="200"
						loading="lazy"
					/>
				</a>
			</div>
		</footer>
	);
}
