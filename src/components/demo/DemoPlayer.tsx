'use client';

import { useRef, useState } from 'react';
import {
	BarChart3,
	CheckCircle2,
	ClipboardList,
	History,
	Play,
	Thermometer,
} from 'lucide-react';

const chapters = [
	{
		label: 'The shift',
		detail: 'See the complete story in under 40 seconds.',
		time: 0,
		icon: ClipboardList,
	},
	{
		label: 'Run the check',
		detail: 'Capture clear pass-or-fail answers.',
		time: 4,
		icon: CheckCircle2,
	},
	{
		label: 'Log temperatures',
		detail: 'Record readings and operating context.',
		time: 10,
		icon: Thermometer,
	},
	{
		label: 'Correct the issue',
		detail: 'Open the record and document follow-through.',
		time: 21,
		icon: History,
	},
	{
		label: 'See the signals',
		detail: 'Turn shift activity into manager visibility.',
		time: 26,
		icon: BarChart3,
	},
];

export default function DemoPlayer() {
	const videoRef = useRef<HTMLVideoElement>(null);
	const [activeChapter, setActiveChapter] = useState(0);

	const playChapter = (index: number) => {
		const video = videoRef.current;
		if (!video) return;

		video.currentTime = chapters[index].time;
		setActiveChapter(index);
		void video.play();
	};

	return (
		<>
		<div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
		<div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-black shadow-2xl shadow-black/30">
			<div className="flex items-center justify-between border-b border-white/10 bg-zinc-950 px-4 py-3 text-white">
				<div className="flex gap-1.5" aria-hidden="true">
					<span className="size-2.5 rounded-full bg-red-400" />
					<span className="size-2.5 rounded-full bg-amber-300" />
					<span className="size-2.5 rounded-full bg-emerald-400" />
				</div>
				<span className="text-xs font-medium text-zinc-400">Product overview · 0:38</span>
			</div>
			<video
				ref={videoRef}
				controls
				playsInline
				preload="metadata"
				poster="/videos/the-manager-life-commercial-poster.jpg"
				aria-label="Commercial overview of line checks, corrections, and manager reporting in The Manager Life"
				className="aspect-video w-full bg-black object-contain"
			>
				<source src="/videos/the-manager-life-commercial.mp4" type="video/mp4" />
				Your browser does not support the video element.
			</video>
		</div>

		<div className="flex flex-col gap-3">
			<p className="px-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/50">
				Jump to a chapter
			</p>
			{chapters.map((chapter, index) => {
				const Icon = chapter.icon;
				const active = activeChapter === index;

				return (
					<button
						key={chapter.label}
						type="button"
						onClick={() => playChapter(index)}
						className={`group flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition ${
							active
								? 'border-white/30 bg-white text-zinc-950'
								: 'border-white/10 bg-white/5 text-white hover:border-white/20 hover:bg-white/10'
						}`}
					>
						<span
							className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl ${
								active ? 'bg-zinc-950 text-white' : 'bg-white/10 text-white'
							}`}
						>
							<Icon className="size-4" aria-hidden="true" />
						</span>
						<span className="min-w-0 flex-1">
							<span className="flex items-center justify-between gap-2">
								<span className="font-semibold">{chapter.label}</span>
								<span className={`text-xs ${active ? 'text-zinc-500' : 'text-white/40'}`}>
									{Math.floor(chapter.time / 60)}:{String(chapter.time % 60).padStart(2, '0')}
								</span>
							</span>
							<span className={`mt-1 block text-sm leading-5 ${active ? 'text-zinc-600' : 'text-white/55'}`}>
								{chapter.detail}
							</span>
						</span>
						<Play className={`mt-2 size-3.5 shrink-0 ${active ? 'text-zinc-950' : 'text-white/40'}`} aria-hidden="true" />
					</button>
				);
			})}
		</div>
		</div>
		<p className="mt-4 text-center text-xs text-white/40">
			Music: “Motivator” by Kevin MacLeod ·{' '}
			<a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-white/65">
				CC BY 4.0
			</a>
		</p>
		</>
	);
}
