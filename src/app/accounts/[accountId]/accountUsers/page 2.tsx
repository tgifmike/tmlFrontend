// 'use client';

// import { getAccountsForUser } from '@/app/api/accountApi';
// import { getUsersForAccount } from '@/app/api/userApI';
// import { AppRole, User } from '@/app/types';
// import { useSession } from 'next-auth/react';
// import { useParams, useRouter } from 'next/navigation';
// import React, { useEffect, useState } from 'react';
// import { toast } from 'sonner';

// const AccountUsersPage = () => {
// 	//icons

// 	//session
// 	const { data: session, status } = useSession();
// 	const currentUser = session?.user as User | undefined;
// 	const sessionUserRole = session?.user?.appRole;
// 	const canToggle = currentUser?.appRole === AppRole.MANAGER;
// 	const router = useRouter();
// 	const params = useParams<{ accountId: string; locationId: string }>();
// 	const accountIdParam = params.accountId;

// 	//set state
// 	const [loadingAccess, setLoadingAccess] = useState(true);
// 	const [hasAccess, setHasAccess] = useState(false);
// 	const [accountName, setAccountName] = useState<string | null>(null);
//     const [accountImage, setAccountImage] = useState<string | null>(null);
//     const [accountUsers, setAccountUsers] = useState<User[]>([]);

// 	useEffect(() => {
// 		if (status !== 'authenticated' || !session?.user?.id || !accountIdParam)
// 			return;
// 		if (hasAccess) return; // prevent rerun

// 		const verifyAccess = async () => {
// 			try {
// 				// Fetch accounts for user
// 				const accountsRes = await getAccountsForUser(session.user.id);
// 				const account = accountsRes.data?.find(
// 					(acc) => acc.id?.toString() === accountIdParam
// 				);

// 				if (!account) {
// 					toast.error('You do not have access to this account.');
// 					router.push('/accounts');
// 					return;
// 				}

// 				// Fetch location access
// 				const userRes = await getUsersForAccount(accountIdParam);
// 				const fetchedUsers = userRes.data ?? [];
				


// 				setHasAccess(true);
// 				setAccountName(account.accountName);
//                 setAccountImage(account.imageBase64 || null);
//                 setAccountUsers(fetchedUsers)
// 			} catch (err) {
// 				toast.error('You do not have access to this location.');
// 				router.push('/accounts');
// 			} finally {
// 				setLoadingAccess(false);
// 			}
// 		};

// 		verifyAccess();
// 	}, [status, session, accountIdParam, hasAccess, router]);

//     return <main>
//         {accountUsers.map((user) => (
//             <div>
//                 {user.userName}
//             </div>
//         ))}

//     </main>;
// };

// export default AccountUsersPage;
