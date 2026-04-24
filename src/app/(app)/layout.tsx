'use client';

import AuthGuard from '@/lib/auth/AuthGuard';

export default function AppLayout({ children }: { children: React.ReactNode }) {
	return (
		<AuthGuard>
			<div className="min-h-screen flex flex-col">{children}</div>
		</AuthGuard>
	);
}
