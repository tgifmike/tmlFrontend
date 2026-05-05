// 'use client';

// import Image from 'next/image';
// import { useEffect, useState } from 'react';
// import { useTheme } from 'next-themes';
// import { FcGoogle } from 'react-icons/fc';
// import { BsApple } from 'react-icons/bs';
// import { Fingerprint } from 'lucide-react';
// import { motion } from 'framer-motion';

// import {
// 	Card,
// 	CardContent,
// 	CardFooter,
// 	CardHeader,
// 	CardTitle,
// } from '@/components/ui/card';
// import { Separator } from '@/components/ui/separator';
// import { Alert, AlertDescription } from '@/components/ui/alert';

// import { useAuthLogin } from '@/lib/auth/useOAuthLogin';
// import { OAuthButton } from './OAuthButton';

// interface TimeOfDayGreetingProps {
// 	name?: string;
// }


// export default function LoginCard() {
//     const {
//         loginGoogle,
// 		loginApple,
// 		loginPasskey,
// 		loading,
// 		errors,
// 		userPreview,
// 	} = useAuthLogin();

// 	const { resolvedTheme } = useTheme();
// 	const isDark = resolvedTheme === 'dark';

// 	const [currentHour, setCurrentHour] = useState(new Date().getHours());

// 	const lastUser = userPreview; // 👈 biometric-first hook

// 	useEffect(() => {
// 			const interval = setInterval(() => {
// 				setCurrentHour(new Date().getHours());
// 			}, 60 * 1000); // update every minute
// 			return () => clearInterval(interval);
// 		}, []);

	
// 	let timeOfDayText = '';
	
// 	if (currentHour < 5) {
// 		timeOfDayText = "It's the middle of the night";
// 	} else if (currentHour < 12) {
// 		timeOfDayText = 'Good morning';
// 	} else if (currentHour < 17) {
// 		timeOfDayText = 'Good afternoon';
// 	} else if (currentHour < 20) {
// 		timeOfDayText = 'Good evening';
// 	} else {
// 		timeOfDayText = "It's getting late";
// 	}

	
	
// 	return (
// 		<div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-accent/40 px-4">
// 			<div className="absolute w-[420px] h-[420px] bg-primary/20 blur-3xl rounded-full opacity-30" />

// 			<Card className="relative w-full max-w-md shadow-2xl border rounded-2xl">
// 				{/* HEADER */}
// 				<CardHeader className="flex flex-col items-center text-center space-y-3">
// 					<Image
// 						src="/newLogo.png"
// 						alt="logo"
// 						width={90}
// 						height={90}
// 						className="rounded-full"
// 					/>

// 					<CardTitle className="text-2xl font-semibold tracking-tight">
// 						{timeOfDayText}
// 					</CardTitle>
					

				

// 					{/* 🧠 LAST USER (BIOMETRIC-FIRST PATTERN) */}
// 					{lastUser && (
// 						<motion.div
// 							initial={{ opacity: 0, y: 5 }}
// 							animate={{ opacity: 1, y: 0 }}
// 							className="flex items-center gap-2 pt-2 px-3 py-1 rounded-full bg-muted/50"
// 						>
// 							<Image
// 								src={lastUser.image || '/avatar.png'}
// 								alt="user"
// 								width={26}
// 								height={26}
// 								className="rounded-full"
// 							/>
// 							<span className="text-xs text-muted-foreground">
// 								Continue as {lastUser.email}
// 							</span>
// 						</motion.div>
// 					)}
// 				</CardHeader>

// 				<CardContent className="space-y-5">
// 					{/* GOOGLE ERROR */}
// 					{errors.google && (
// 						<Alert variant="destructive">
// 							<AlertDescription>{errors.google}</AlertDescription>
// 						</Alert>
// 					)}

// 					<OAuthButton onClick={loginGoogle}>
// 						<FcGoogle className="text-2xl" />
// 						Continue with Google
// 					</OAuthButton>

// 					{/* DIVIDER */}
// 					<div className="flex items-center gap-3">
// 						<Separator className="flex-1" />
// 						<span className="text-xs text-muted-foreground">or</span>
// 						<Separator className="flex-1" />
// 					</div>

// 					{/* APPLE */}
// 					<OAuthButton
// 						variant={isDark ? 'light' : 'dark'}
// 						onClick={loginApple}
// 						loading={loading === 'apple'}
// 					>
// 						<BsApple className="text-2xl" />
// 						Continue with Apple
// 					</OAuthButton>

// 				</CardContent>

// 				{/* FOOTER */}
// 				<CardFooter className="flex flex-col items-center text-center gap-1 pt-2">
// 					<p className="text-xs text-muted-foreground">
// 						Secure login powered by OAuth + biometrics
// 					</p>

// 					<p className="text-[11px] text-muted-foreground/70">
// 						We never store passwords or expose credentials
// 					</p>
// 				</CardFooter>
// 			</Card>
// 		</div>
// 	);
// }

'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { FcGoogle } from 'react-icons/fc';
import { BsApple } from 'react-icons/bs';
import { Fingerprint } from 'lucide-react';
import { motion } from 'framer-motion';

import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { useAuthLogin } from '@/lib/auth/useOAuthLogin';
import { OAuthButton } from './OAuthButton';

interface TimeOfDayGreetingProps {
	name?: string;
}

type Props = {
	children: React.ReactNode;
	onClick?: () => void;
	loading?: boolean;
	variant?: 'default' | 'dark' | 'light';
	className?: string;
};


export default function LoginCard() {
    const {
        loginGoogle,
		loginApple,
		loginPasskey,
		loading,
		errors,
		userPreview,
	} = useAuthLogin();

	const { resolvedTheme } = useTheme();
	const isDark = resolvedTheme === 'dark';

	const [currentHour, setCurrentHour] = useState(new Date().getHours());

	const lastUser = userPreview; // 👈 biometric-first hook

	useEffect(() => {
			const interval = setInterval(() => {
				setCurrentHour(new Date().getHours());
			}, 60 * 1000); // update every minute
			return () => clearInterval(interval);
		}, []);

	
	let timeOfDayText = '';
	
	if (currentHour < 5) {
		timeOfDayText = "It's the middle of the night";
	} else if (currentHour < 12) {
		timeOfDayText = 'Good morning';
	} else if (currentHour < 17) {
		timeOfDayText = 'Good afternoon';
	} else if (currentHour < 20) {
		timeOfDayText = 'Good evening';
	} else {
		timeOfDayText = "It's getting late";
	}

	
	
	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-accent/40 px-4">
			<div className="absolute w-[420px] h-[420px] bg-primary/20 blur-3xl rounded-full opacity-30" />

			<Card className="relative w-full max-w-md shadow-xl border rounded-2xl backdrop-blur-sm bg-background/80">
				{/* HEADER */}
				<CardHeader className="flex flex-col items-center text-center space-y-4 pt-8">
					<Image
						src="/newLogo.png"
						alt="logo"
						width={72}
						height={72}
						className="rounded-full shadow-md"
					/>

					<div className="space-y-1">
						<CardTitle className="text-2xl font-semibold tracking-tight">
							{timeOfDayText},
						</CardTitle>
						<p className="text-sm text-muted-foreground">Sign in to continue</p>
					</div>

					{/* LAST USER */}
					{lastUser && (
						<motion.div
							initial={{ opacity: 0, y: 6 }}
							animate={{ opacity: 1, y: 0 }}
							className="flex items-center gap-2 px-3 py-2 rounded-full bg-muted/60 border"
						>
							<Image
								src={lastUser.image || '/avatar.png'}
								alt="user"
								width={28}
								height={28}
								className="rounded-full"
							/>
							<span className="text-xs text-muted-foreground">
								Continue as{' '}
								<span className="font-medium text-foreground">
									{lastUser.email}
								</span>
							</span>
						</motion.div>
					)}
				</CardHeader>

				{/* CONTENT */}
				<CardContent className="space-y-4 px-6 pb-6">
					{/* ERROR */}
					{errors.google && (
						<Alert variant="destructive">
							<AlertDescription>{errors.google}</AlertDescription>
						</Alert>
					)}

					{/* GOOGLE */}
					<OAuthButton
						onClick={loginGoogle}
						className="h-11 text-sm font-medium"
					>
						<FcGoogle className="text-xl" />
						Continue with Google
					</OAuthButton>

					{/* DIVIDER */}
					<div className="flex items-center gap-3 py-1">
						<Separator className="flex-1" />
						<span className="text-[11px] uppercase tracking-wide text-muted-foreground">
							or
						</span>
						<Separator className="flex-1" />
					</div>

					{/* APPLE */}
					<OAuthButton
						variant={isDark ? 'light' : 'dark'}
						onClick={loginApple}
						loading={loading === 'apple'}
						className="h-11 text-sm font-medium"
					>
						<BsApple className="text-xl" />
						Continue with Apple
					</OAuthButton>
				</CardContent>

				{/* FOOTER */}
				<CardFooter className="flex flex-col items-center text-center gap-2 pb-6 px-6">
					<p className="text-xs text-muted-foreground">
						Secure authentication powered by OAuth & biometrics
					</p>

					<p className="text-[11px] text-muted-foreground/70 leading-relaxed">
						By continuing, you agree to our{' '}
						<span className="underline cursor-pointer">Terms</span> and{' '}
						<span className="underline cursor-pointer">Privacy Policy</span>.
					</p>
				</CardFooter>
			</Card>
		</div>
	);
}