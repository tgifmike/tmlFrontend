import { SessionUser } from "@/app/types";


export async function fetchMe(): Promise<SessionUser> {
	const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/me`, {
		credentials: 'include', // ✅ KEY
	});

	if (!res.ok) throw new Error('Not authenticated');

	return res.json();
}
