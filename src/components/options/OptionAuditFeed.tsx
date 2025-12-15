'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { getUsersForAccount } from '@/app/api/userApI';
import { OptionHistory, User } from '@/app/types';
import Spinner from '@/components/spinner/Spinner';
import { getOptionHistory } from '@/app/api/optionsApi';
import {
	Accordion,
	AccordionItem,
	AccordionTrigger,
	AccordionContent,
} from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Icons } from '@/lib/icon';


type Props = {
    accountId: string;
    currentUser?: User;
};

type UserMap = Record<string, string>;

export default function OptionAuditFeed({ accountId }: Props) {
	const [history, setHistory] = useState<OptionHistory[]>([]);
	const [usersMap, setUsersMap] = useState<UserMap>({});
	const [loading, setLoading] = useState(true);

	const LogIcon = Icons.log;

	const getUserName = (id: string) => usersMap[id] ?? id;

	useEffect(() => {
		const load = async () => {
			try {
				// Load users
				const usersRes = await getUsersForAccount(accountId);
				const users: User[] = usersRes.data ?? [];

				const map: UserMap = {};
				users.forEach((u) => {
					if (u.id) map[u.id] = u.userName ?? u.id;
				});
				setUsersMap(map);

				// Load history
				const h = await getOptionHistory(accountId);
				setHistory(h);
			} catch (err) {
				console.error(err);
				toast.error('Failed to load audit log');
			} finally {
				setLoading(false);
			}
		};
		load();
	}, [accountId]);

	if (loading) {
		return (
			<div className="flex justify-center items-center py-20">
				<Spinner />
				<span className="ml-4 text-lg">Loading audit feed…</span>
			</div>
		);
	}

	if (!history || history.length === 0) {
		return <p className="p-4 text-center">No audit logs found.</p>;
	}

const formatHistory = (h: OptionHistory): React.ReactNode => {
	const who = h.changedByName || usersMap[h.changedBy] || h.changedBy;
	const when = new Date(h.changeAt).toLocaleString();

	switch (h.changeType) {
		case 'CREATED':
			return (
				<div className="text-xl">
					{who} created option "<strong>{h.optionName}</strong>" at {when}
				</div>
			);

		case 'UPDATED': {
			const changes = Object.entries(h.oldValues || {});

			return (
				<div className="flex flex-wrap gap-2 items-center text-xl">
					<span>
						{who} updated "<strong>{h.optionName}</strong>" at {when}
					</span>

					{changes.length > 0 && (
						<span className="flex flex-wrap gap-2">
							(
							{changes.map(([key, oldVal], i) => {
								const newVal = (h as any)[key];
								return (
									<span key={key} className="flex gap-1">
										<span className="font-medium">{key}:</span>
										<span className="text-red-600 line-through">
											{String(oldVal)}
										</span>
										→<span className="text-green-600">{String(newVal)}</span>
										{i < changes.length - 1 ? ',' : ''}
									</span>
								);
							})}
							)
						</span>
					)}
				</div>
			);
		}

		case 'DELETED':
			return (
				<div className="text-xl">
					{who} deleted option "<strong>{h.optionName}</strong>" at {when}
				</div>
			);

		default:
			return null;
	}
};





	return (
		<div className="w-3/4">
			<Accordion type="single" collapsible>
				<AccordionItem value="audit-feed">
					<AccordionTrigger className="text-lg font-semibold text-destructive text-center">
						<div className='flex gap-2'>
							<LogIcon className="w-6 h-6" />
							Show Audit Log
						</div>
					</AccordionTrigger>

					<AccordionContent>
						<Card>
							<CardHeader>
								<CardTitle className="text-3xl">Audit Feed</CardTitle>
								<CardDescription className="text-lg">
									Review the history of changes made to options in this account.
								</CardDescription>
							</CardHeader>

							<CardContent className="space-y-4">
								{history.map((h) => (
									<div key={h.id} className="space-y-2">
										<div className="flex justify-between items-start">
											<span>{formatHistory(h)}</span>

											<Badge
												variant={
													h.changeType === 'CREATED'
														? 'default'
														: h.changeType === 'UPDATED'
														? 'secondary'
														: 'destructive'
												}
											>
												{h.changeType}
											</Badge>
										</div>

										<Separator />
									</div>
								))}
							</CardContent>
						</Card>
					</AccordionContent>
				</AccordionItem>
			</Accordion>
		</div>
		// <div>
		// 	<Card className="flex w-3/4 mx-auto">
		// 		<CardHeader>
		// 			<CardTitle>Audit Feed</CardTitle>
		// 			<CardDescription>
		// 				Review the history of changes made to options in this account.
		// 			</CardDescription>
		// 		</CardHeader>
		// 		<CardContent className="space-y-4">
		// 			{history.map((h) => (
		// 				<div key={h.id} className="space-y-2">
		// 					<div className="flex justify-between items-start">
		// 						<span>{formatHistory(h)}</span>

		// 						<Badge
		// 							variant={
		// 								h.changeType === 'CREATED'
		// 									? 'default'
		// 									: h.changeType === 'UPDATED'
		// 									? 'secondary'
		// 									: 'destructive'
		// 							}
		// 						>
		// 							{h.changeType}
		// 						</Badge>
		// 					</div>

		// 					<Separator />
		// 				</div>
		// 			))}
		// 		</CardContent>
		// 		<CardFooter></CardFooter>
		// 	</Card>
		// </div>
	);
}