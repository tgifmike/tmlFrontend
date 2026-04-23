import LoginCard from '@/components/login/LoginCard';
import { Suspense } from 'react';


export default function Page() {
	return (
		<Suspense fallback={null}>
			<LoginCard />
		</Suspense>
	);
}