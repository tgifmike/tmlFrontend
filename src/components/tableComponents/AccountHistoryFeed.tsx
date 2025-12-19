'use client';

import { useEffect, useState, useMemo } from 'react';
import { toast } from 'sonner';

import { User, AccountHistory } from '@/app/types';
import Spinner from '@/components/spinner/Spinner';
import {
	Accordion,
	AccordionItem,
	AccordionTrigger,
	AccordionContent,
} from '@/components/ui/accordion';
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Icons } from '@/lib/icon';
import { getAllAccountHistory } from '@/app/api/accountApi';
import { getUsersForAccounts } from '@/app/api/userApI';
import { Input } from '../ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '../ui/select';

type UserMap = Record<string, string>;

export default function GlobalAccountHistoryFeed({
	currentUser,
}: {
	currentUser?: User;
}) {
	const [history, setHistory] = useState<AccountHistory[]>([]);
	const [usersMap, setUsersMap] = useState<UserMap>({});
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState('');
	const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
	const [changeTypeFilter, setChangeTypeFilter] = useState<
		'ALL' | 'CREATED' | 'UPDATED' | 'DELETED'
	>('ALL');

	const LogIcon = Icons.log;
	const getUserName = (id: string) => usersMap[id] ?? id;

	useEffect(() => {
		const load = async () => {
			try {
				const h = await getAllAccountHistory();
				setHistory(h);

				const userIds = Array.from(new Set(h.map((item) => item.changedBy)));
				const usersRes = await getUsersForAccounts(userIds);
				const users: User[] = usersRes.data ?? [];
				const map: UserMap = {};
				users.forEach((u) => {
					if (u.id) map[u.id] = u.userName ?? u.id;
				});
				setUsersMap(map);
			} catch (err) {
				console.error(err);
				toast.error('Failed to load account history');
			} finally {
				setLoading(false);
			}
		};
		load();
	}, []);

	const filteredHistory = useMemo(() => {
		let sorted = [...history];

		// Sort by date
		sorted.sort((a, b) =>
			sortOrder === 'newest'
				? new Date(b.changeAt).getTime() - new Date(a.changeAt).getTime()
				: new Date(a.changeAt).getTime() - new Date(b.changeAt).getTime()
		);

		// Filter by search and changeType
		return sorted.filter((h) => {
			const who = h.changedByName || getUserName(h.changedBy) || '';
			const matchesSearch =
				h.accountName?.toLowerCase().includes(search.toLowerCase()) ||
				who.toLowerCase().includes(search.toLowerCase());
			const matchesType =
				changeTypeFilter === 'ALL' || h.changeType === changeTypeFilter;
			return matchesSearch && matchesType;
		});
	}, [history, search, sortOrder, changeTypeFilter]);

	if (loading) {
		return (
			<div className="flex justify-center items-center py-20">
				<Spinner />
				<span className="ml-4 text-lg">Loading account history…</span>
			</div>
		);
	}

	if (!history || history.length === 0) {
		return <p className="p-4 text-center">No account history found.</p>;
	}

	const formatHistory = (h: AccountHistory) => {
		const who = h.changedByName || getUserName(h.changedBy) || h.changedBy;
		const when = new Date(h.changeAt).toLocaleString();

		switch (h.changeType) {
			case 'CREATED':
				return (
					<span>
						{who} created account "<strong>{h.accountName}</strong>" at {when}
					</span>
				);
			case 'UPDATED': {
				const changes = Object.entries(h.oldValues || {});
				return (
					<div className="flex flex-wrap gap-2 items-center">
						<span>
							{who} updated "<strong>{h.accountName}</strong>" at {when}
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
					<span>
						{who} deleted account "<strong>{h.accountName}</strong>" at {when}
					</span>
				);
			default:
				return null;
		}
	};

	return (
		<div className="flex flex-col items-center w-full py-8">
			<div className="w-1/2">
				<Accordion type="single" collapsible>
					<AccordionItem value="global-account-history">
						<AccordionTrigger className="text-lg font-semibold text-destructive text-center">
							<div className="flex gap-2 justify-center items-center">
								<LogIcon className="w-6 h-6" />
								Show Account History
							</div>
						</AccordionTrigger>

						<AccordionContent>
							<Card>
								<CardHeader className="flex flex-col gap-4">
									<CardTitle className="flex justify-between items-center w-full text-3xl">
										<div>Account History</div>

										<div className="w-1/3">
											<Input
												type="text"
												placeholder="Search by account or user..."
												value={search}
												onChange={(e) => setSearch(e.target.value)}
												className="text-xl rounded-full"
                                            />
                                            </div>

											{/* Sort Order Dropdown */}
											<div className="flex gap-2">
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
												{/* Change Type Filter Dropdown */}
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
										Review changes made to all accounts over time.
									</CardDescription>
								</CardHeader>

								<CardContent className="space-y-4">
									{filteredHistory.length === 0 && (
										<p className="text-center text-gray-500">
											No matching results.
										</p>
									)}

									{filteredHistory.map((h) => (
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
		</div>
	);
}
