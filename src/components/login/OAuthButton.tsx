'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = {
	children: React.ReactNode;
	onClick?: () => void;
	loading?: boolean;
	variant?: 'default' | 'dark' | 'light';
};

export function OAuthButton({
	children,
	onClick,
	loading,
	variant = 'default',
}: Props) {
	return (
		<motion.button
			whileTap={{ scale: 0.98 }}
			whileHover={{ scale: 1.01 }}
			onClick={onClick}
			disabled={loading}
			className={cn(
				'w-full h-11 rounded-lg flex items-center justify-center gap-2 font-medium text-xl transition',
				variant === 'dark' && 'bg-black text-white hover:bg-black/90',
				variant === 'light' && 'bg-white text-black border',
				variant === 'default' && 'bg-primary text-primary-foreground',
				loading && 'opacity-70 cursor-not-allowed',
			)}
		>
			<AnimatePresence mode="wait">
				{loading ? (
					<motion.div
						key="loader"
						initial={{ opacity: 0, scale: 0.8 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.8 }}
						className="flex items-center gap-2"
					>
						<Loader2 className="h-4 w-4 animate-spin" />
						<span>Signing in...</span>
					</motion.div>
				) : (
					<motion.div
						key="content"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="flex items-center gap-2"
					>
						{children}
					</motion.div>
				)}
			</AnimatePresence>
		</motion.button>
	);
}
