import Link from 'next/link';
import type { ReactNode } from 'react';

type LegalSection = {
	title: string;
	content: ReactNode;
};

type LegalPageProps = {
	eyebrow: string;
	title: string;
	intro: string;
	sections: LegalSection[];
	otherPage: {
		href: string;
		label: string;
	};
};

export default function LegalPage({
	eyebrow,
	title,
	intro,
	sections,
	otherPage,
}: LegalPageProps) {
	return (
		<main className="relative isolate overflow-hidden px-5 py-10 sm:px-8 sm:py-16">
			<div
				aria-hidden="true"
				className="absolute inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(circle_at_top_left,_#f6c344_0,_transparent_42%),radial-gradient(circle_at_top_right,_#d84b2a_0,_transparent_34%)] opacity-55"
			/>

			<div className="mx-auto max-w-3xl">
				<header className="mb-10 border-b-4 border-[#2b160d] pb-8">
					<div className="mb-7 inline-flex items-center gap-3 rounded-full border-2 border-[#2b160d] bg-[#f6c344] px-4 py-2 shadow-[3px_3px_0_#2b160d]">
						<span aria-hidden="true" className="text-xl">🍔</span>
						<span className="text-sm font-black uppercase tracking-[0.14em]">
							Sal&apos;s Burger Shack
						</span>
					</div>

					<p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-[#9d351f]">
						{eyebrow}
					</p>
					<h1 className="text-4xl font-black tracking-[-0.04em] sm:text-6xl">
						{title}
					</h1>
					<p className="mt-5 max-w-2xl text-base leading-7 text-[#654235] sm:text-lg">
						{intro}
					</p>
					<p className="mt-5 text-sm font-semibold text-[#7c594b]">
						Effective September 18, 2026
					</p>
				</header>

				<div className="space-y-5">
					{sections.map((section, index) => (
						<section
							key={section.title}
							className="rounded-2xl border-2 border-[#2b160d]/15 bg-white/80 p-6 shadow-[0_8px_30px_rgba(80,43,22,0.08)] backdrop-blur sm:p-8"
						>
							<h2 className="mb-3 text-xl font-black tracking-tight sm:text-2xl">
								<span className="mr-3 text-[#c84427]">{index + 1}.</span>
								{section.title}
							</h2>
							<div className="space-y-3 text-[15px] leading-7 text-[#654235]">
								{section.content}
							</div>
						</section>
					))}
				</div>

				<footer className="mt-10 flex flex-col gap-4 border-t-2 border-[#2b160d]/20 pt-6 text-sm text-[#765244] sm:flex-row sm:items-center sm:justify-between">
					<p>© 2026 Sal&apos;s Burger Shack</p>
					<Link
						href={otherPage.href}
						className="font-bold text-[#a93820] underline decoration-2 underline-offset-4 hover:text-[#702313]"
					>
						{otherPage.label}
					</Link>
				</footer>
			</div>
		</main>
	);
}
