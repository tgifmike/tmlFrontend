
'use client';

import SignOutButton from "@/components/login/SignOutButton";
import { ModeToggle } from "@/components/theme/ModeToggle";
import { useSession } from "next-auth/react";
import Link from "next/link";


export default function Home() {
	const { data: session, status } = useSession();
  return (
		<main>
			<div>
				<h1 className="text-4xl p-4">Welcome to the Manager Life!</h1>
			</div>

			<div className="flex gap-4 text-2xl">
				<Link href="/admin/users">users</Link>
				<ModeToggle />
			</div>

			<div className="p-28">
			  {session?.user ? (
				  <div>
					  {session.user.name} - {session.user.email}
					  <SignOutButton />
				</div>
				) : (
					<div>
						<Link href="/login">login</Link>
					</div>
				)}
			</div>
		</main>
	);
}
