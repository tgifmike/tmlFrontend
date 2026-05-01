'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ThemeSelect() {
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return (
			<div className="w-52 h-10 rounded-md border bg-muted animate-pulse" />
		);
	}

	const base =
		'flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-all';

	const isActive = (value: string) => theme === value;

	return (
		<div className="flex items-center p-1 rounded-lg border bg-background w-fit shadow-sm">
			<Button
				type="button"
				variant="ghost"
				onClick={() => setTheme('light')}
				className={`${base} ${
					isActive('light')
						? 'bg-primary text-primary-foreground shadow-sm'
						: 'hover:bg-muted'
				}`}
			>
				<Sun className="h-4 w-4" />
				Light
			</Button>

			<Button
				type="button"
				variant="ghost"
				onClick={() => setTheme('dark')}
				className={`${base} ${
					isActive('dark')
						? 'bg-primary text-primary-foreground shadow-sm'
						: 'hover:bg-muted'
				}`}
			>
				<Moon className="h-4 w-4" />
				Dark
			</Button>

			<Button
				type="button"
				variant="ghost"
				onClick={() => setTheme('system')}
				className={`${base} ${
					isActive('system')
						? 'bg-primary text-primary-foreground shadow-sm'
						: 'hover:bg-muted'
				}`}
			>
				<Monitor className="h-4 w-4" />
				System
			</Button>
		</div>
	);
}
