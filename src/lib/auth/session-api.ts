import { SessionUser } from "@/app/types";


export async function fetchMe(): Promise<SessionUser> {
	const token = localStorage.getItem('jwt');

	if (!token) throw new Error('No token');

	const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/me`, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});

	if (!res.ok) throw new Error('Failed to fetch session');

	return res.json();
}
