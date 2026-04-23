'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth/useSession';
import Spinner from '@/components/spinner/Spinner';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
	const router = useRouter();
	const { status } = useSession();

	useEffect(() => {
		if (status === 'unauthenticated') {
			router.replace('/login');
		}
	}, [status, router]);

	if (status === 'loading') {
		return (
            <div className="flex items-center justify-center h-screen text-2xl text-chart-3 gap-3">
                <Spinner />
				Loading...
			</div>
		);
	}

	return <>{children}</>;
}
