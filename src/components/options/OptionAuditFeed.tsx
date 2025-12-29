'use client';

import { useEffect, useMemo, useState } from 'react';
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
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';


type Props = {
    accountId: string;
    currentUser?: User;
};

type UserMap = Record<string, string>;

export default function OptionAuditFeed({ accountId }: Props) {
	const [history, setHistory] = useState<OptionHistory[]>([]);
	// const [usersMap, setUsersMap] = useState<UserMap>({});
	const [search, setSearch] = useState('');
	const [loading, setLoading] = useState(true);
	const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
	const [changeTypeFilter, setChangeTypeFilter] = useState<
		'ALL' | 'CREATED' | 'UPDATED' | 'DELETED'
	>('ALL');

	const LogIcon = Icons.log;

	// const getUserName = (id: string) => usersMap[id] ?? id;

	useEffect(() => {
		const load = async () => {
			try {
				// // Load users
				// const usersRes = await getUsersForAccount(accountId);
				// const users: User[] = usersRes.data ?? [];

				// const map: UserMap = {};
				// users.forEach((u) => {
				// 	if (u.id) map[u.id] = u.userName ?? u.id;
				// });
				// setUsersMap(map);

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

	const filteredHistory = useMemo(() => {
				const arr = Array.isArray(history) ? history : []; // normalize
	
				let sorted = [...arr]; // safe now
	
				sorted.sort((a, b) =>
					sortOrder === 'newest'
						? new Date(b.changeAt).getTime() - new Date(a.changeAt).getTime()
						: new Date(a.changeAt).getTime() - new Date(b.changeAt).getTime()
				);
	
				return sorted.filter((h) => {
					const who = h.changedByName;
					const matchesSearch =
						who?.toLowerCase().includes(search.toLowerCase()) ||
						h.optionName?.toLowerCase().includes(search.toLowerCase());
	
					const matchesType =
						changeTypeFilter === 'ALL' || h.changeType === changeTypeFilter;
	
					return matchesSearch && matchesType;
				});
			}, [history, search, sortOrder, changeTypeFilter]);

	if (loading) {
		return (
			<div className="flex justify-center items-center py-20">
				<Spinner />
				<span className="ml-4 text-lg">Loading Option audit feed…</span>
			</div>
		);
	}

	if (!filteredHistory || filteredHistory.length === 0) {
		return <p className="p-4 text-center">No Option audit logs found.</p>;
	}

const formatHistory = (h: OptionHistory): React.ReactNode => {
	const who = h.changedByName;
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
		<div className="flex flex-col items-center w-full py-8">
			<div className="w-full p-2 ">
				<Accordion type="single" collapsible>
					<AccordionItem value="audit-feed">
						<AccordionTrigger className="text-lg font-semibold text-destructive text-center">
							<div className="flex gap-2">
								<LogIcon className="w-6 h-6" />
								Show Option History
							</div>
						</AccordionTrigger>

						<AccordionContent>
							<Card>
								<CardHeader>
									<CardTitle className="flex justify-between items-center w-full text-xl md:text-3xl">
										<div className="text-xl md:text-2xl">Option History</div>

										<div className="w-1/4 md:w-1/3">
											<Input
												type="text"
												placeholder="Search by option or user..."
												value={search}
												onChange={(e) => setSearch(e.target.value)}
												className="text-xl rounded-full"
											/>
										</div>

										<div className="flex flex-col md:flex-row gap-2">
											<Select
												value={sortOrder}
												onValueChange={(v) =>
													setSortOrder(v as 'newest' | 'oldest')
												}
											>
												<SelectTrigger className="w-36">
													<SelectValue>
														{sortOrder === 'newest'
															? 'Newest → Oldest'
															: 'Oldest → Newest'}
													</SelectValue>
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="newest">
														Newest → Oldest
													</SelectItem>
													<SelectItem value="oldest">
														Oldest → Newest
													</SelectItem>
												</SelectContent>
											</Select>

											<Select
												value={changeTypeFilter}
												onValueChange={(v) =>
													setChangeTypeFilter(
														v as 'ALL' | 'CREATED' | 'UPDATED' | 'DELETED'
													)
												}
											>
												<SelectTrigger className="w-36">
													<SelectValue>{changeTypeFilter}</SelectValue>
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="ALL">All</SelectItem>
													<SelectItem value="CREATED">Created</SelectItem>
													<SelectItem value="UPDATED">Updated</SelectItem>
													<SelectItem value="DELETED">Deleted</SelectItem>
												</SelectContent>
											</Select>
										</div>
									</CardTitle>
									<CardDescription className="text-lg">
										Review the history of changes made to options in this
										account.
									</CardDescription>
								</CardHeader>

								<CardContent className="space-y-4">
									{filteredHistory.map((h) => (
										<div key={h.id} className="space-y-2">
											<div className="flex justify-between items-start">
												<span>{formatHistory(h)}</span>

												<Badge
													className="p-2 font-bold text-lg"
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
		</div>
	);
}