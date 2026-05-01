'use client';

import { useEffect, useState, useMemo } from 'react';
import { toast } from 'sonner';

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
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';

import { UserHistory } from '@/app/types';
import { getAllUserHistory } from '@/app/api/userApI';

const USER_FIELD_LABELS: Record<string, string> = {
	userName: 'Name',
	userEmail: 'Email',
	userActive: 'Status',
	accessRole: 'Access Role',
	appRole: 'App Role',
};

const toBoolean = (val: any): boolean => {
	if (typeof val === 'boolean') return val;
	if (typeof val === 'string') return val.toLowerCase() === 'true';
	if (typeof val === 'number') return val === 1;
	return false;
};

const formatUserValue = (key: string, value: any) => {
	if (value === null || value === undefined) return '—';

	switch (key) {
		case 'userActive':
			return toBoolean(value) ? 'Active' : 'Inactive';
		default:
			return String(value);
	}
};

export default function GlobalUserHistoryFeed() {
	const [history, setHistory] = useState<UserHistory[]>([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState('');
	const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

	const [changeTypeFilter, setChangeTypeFilter] = useState<
		| 'ALL'
		| 'CREATED'
		| 'UPDATED'
		| 'DELETED'
		| 'ROLE_CHANGED'
		| 'ACTIVATED'
		| 'DEACTIVATED'
		| 'INVITED'
	>('ALL');

	useEffect(() => {
		const load = async () => {
			try {
				const res = await getAllUserHistory();
				setHistory(res);
			} catch (err) {
				console.error(err);
				toast.error('Failed to load user history');
			} finally {
				setLoading(false);
			}
		};

		load();
	}, []);

	const filtered = useMemo(() => {
		const sorted = [...history].sort((a, b) =>
			sortOrder === 'newest'
				? new Date(b.changeAt).getTime() - new Date(a.changeAt).getTime()
				: new Date(a.changeAt).getTime() - new Date(b.changeAt).getTime(),
		);

		return sorted.filter((h) => {
			const who = h.changedByName || h.changedBy || '';

			const matchesSearch =
				h.userName?.toLowerCase().includes(search.toLowerCase()) ||
				h.userEmail?.toLowerCase().includes(search.toLowerCase()) ||
				who.toLowerCase().includes(search.toLowerCase());

			const matchesType =
				changeTypeFilter === 'ALL' || h.changeType === changeTypeFilter;

			return matchesSearch && matchesType;
		});
	}, [history, search, sortOrder, changeTypeFilter]);

	const formatHistory = (h: UserHistory) => {
		const who = h.changedByName || h.changedBy;
		const when = new Date(h.changeAt).toLocaleString();

		switch (h.changeType) {
			case 'CREATED':
				return (
					<span>
						{who} created <strong>{h.userName}</strong> at {when}
					</span>
				);

			case 'UPDATED': {
				const changes = Object.entries(h.oldValues || {});

				return (
					<div className="flex flex-col gap-2">
						<span>
							{who} updated <strong>{h.userName}</strong> at {when}
						</span>

						{changes.length > 0 && (
							<div className="flex flex-wrap gap-3 justify-center">
								{changes.map(([key, oldVal]) => {
									const newVal = (h as any)[key];

									return (
										<div
											key={key}
											className="rounded-xl border px-3 py-2 text-sm"
										>
											<span className="font-semibold mr-1">
												{USER_FIELD_LABELS[key] ?? key}:
											</span>
											<span className="text-red-600 line-through mr-1">
												{formatUserValue(key, oldVal)}
											</span>
											→
											<span className="text-green-600 ml-1">
												{formatUserValue(key, newVal)}
											</span>
										</div>
									);
								})}
							</div>
						)}
					</div>
				);
			}

			case 'DELETED':
				return (
					<span>
						{who} deleted <strong>{h.userName}</strong> at {when}
					</span>
				);

			case 'ROLE_CHANGED':
				return (
					<span>
						{who} changed role for <strong>{h.userName}</strong> at {when}
					</span>
				);

			case 'ACTIVATED':
				return (
					<span>
						{who} activated <strong>{h.userName}</strong> at {when}
					</span>
				);

			case 'DEACTIVATED':
				return (
					<span>
						{who} deactivated <strong>{h.userName}</strong> at {when}
					</span>
				);

			case 'INVITED':
				return (
					<span>
						{who} invited <strong>{h.userEmail}</strong> at {when}
					</span>
				);

			default:
				return null;
		}
	};

	if (loading) {
		return (
			<div className="flex justify-center items-center py-20">
				<Spinner />
				<span className="ml-4 text-lg">Loading user history...</span>
			</div>
		);
	}

	return (
		<div className="flex flex-col items-center w-full py-8">
			<div className="w-3/4">
				<Accordion type="single" collapsible>
					<AccordionItem value="user-history">
						<AccordionTrigger className="text-xl text-destructive font-semibold">
							User History
						</AccordionTrigger>

						<AccordionContent>
							<Card>
								<CardHeader className="space-y-4">
									<CardTitle className="text-2xl text-center">
										User History Feed
									</CardTitle>

									<CardDescription className="text-center">
										Track all user changes across the system.
									</CardDescription>

									<div className="flex flex-wrap justify-center gap-3">
										<Input
											placeholder="Search users..."
											value={search}
											onChange={(e) => setSearch(e.target.value)}
											className="w-72"
										/>

										<Select
											value={sortOrder}
											onValueChange={(v) =>
												setSortOrder(v as 'newest' | 'oldest')
											}
										>
											<SelectTrigger className="w-40">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="newest">Newest</SelectItem>
												<SelectItem value="oldest">Oldest</SelectItem>
											</SelectContent>
										</Select>

										<Select
											value={changeTypeFilter}
											onValueChange={(v) => setChangeTypeFilter(v as any)}
										>
											<SelectTrigger className="w-44">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="ALL">All</SelectItem>
												<SelectItem value="CREATED">Created</SelectItem>
												<SelectItem value="UPDATED">Updated</SelectItem>
												<SelectItem value="DELETED">Deleted</SelectItem>
												<SelectItem value="ROLE_CHANGED">
													Role Changed
												</SelectItem>
												<SelectItem value="ACTIVATED">Activated</SelectItem>
												<SelectItem value="DEACTIVATED">Deactivated</SelectItem>
												<SelectItem value="INVITED">Invited</SelectItem>
											</SelectContent>
										</Select>
									</div>
								</CardHeader>

								<CardContent className="space-y-5">
									{filtered.length === 0 && (
										<p className="text-center text-muted-foreground py-8">
											No history found.
										</p>
									)}

									{filtered.map((h) => (
										<div key={h.id} className="rounded-xl border p-5 space-y-4">
											<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-center md:text-left">
												<div className="flex-1 text-lg leading-relaxed">
													{formatHistory(h)}
												</div>

												<div className="flex justify-center">
													<Badge
														className="px-3 py-1 text-sm"
														variant={
															h.changeType === 'DELETED' ||
															h.changeType === 'DEACTIVATED'
																? 'destructive'
																: h.changeType === 'CREATED' ||
																	  h.changeType === 'ACTIVATED' ||
																	  h.changeType === 'INVITED'
																	? 'default'
																	: 'secondary'
														}
													>
														{h.changeType}
													</Badge>
												</div>
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
