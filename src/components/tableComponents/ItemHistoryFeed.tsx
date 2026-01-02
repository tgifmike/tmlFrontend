import { ItemHistory } from "@/app/types";
import { Icons } from "@/lib/icon";
import { get } from "http";
import { use, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import Spinner from "../spinner/Spinner";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { getItemHistory } from "@/app/api/item.Api";
import { tempCategories } from "@/lib/constants/usConstants";



type Props = {
    stationId: string;
    
};

const FIELD_LABELS: Record<string, string> = {
	itemName: 'Name',
	itemActive: 'Status',
	shelfLife: 'Shelf Life',
	panSize: 'Pan Size',
	isTool: 'Item has a tool',
	toolName: 'Tool Name',
	isTempTaken: 'Temperature Taken',
	tempCategory: 'Temperature Category',
	isCheckMark: 'Item Checked Off',
	portionSize: 'Portion Size',
	isPortioned: 'Is Item Portioned',
	templateNotes: 'Item Notes',
	sortOrder: 'Display Order',
};

const toBoolean = (val: any): boolean => {
	if (typeof val === 'boolean') return val;
	if (typeof val === 'string') return val.toLowerCase() === 'true';
	if (typeof val === 'number') return val === 1;
	return false;
};

const formatValue = (key: string, value: any) => {
	if (value === null || value === undefined) return '—';

	switch (key) {
		case 'stationActive': {
			const bool = toBoolean(value);
			return bool ? 'Active' : 'Inactive';
		}

		case 'sortOrder':
			// stored zero-based, display one-based
			return Number(value) + 1;

		default:
			return String(value);
	}
};

export default function ItemHistoryFeed({ stationId }: Props) {

    const [history, setHistory] = useState<ItemHistory[]>([]);
    const [search, setSearch] = useState('');
        const [loading, setLoading] = useState(true);
        const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
        const [changeTypeFilter, setChangeTypeFilter] = useState<
            'ALL' | 'CREATED' | 'UPDATED' | 'DELETED'
        >('ALL');
    
    const LogIcon = Icons.log;
    
    useEffect(() => {
        const load = async () => {
            try {
                const itemHistory = await getItemHistory(stationId);
                setHistory(itemHistory);
            } catch (err) {
                console.error(err);
                toast.error('Failed to load item history log');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [stationId]);
    
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
					h.itemName?.toLowerCase().includes(search.toLowerCase());

				const matchesType =
					changeTypeFilter === 'ALL' || h.changeType === changeTypeFilter;

				return matchesSearch && matchesType;
			});
    }, [history, search, sortOrder, changeTypeFilter]);
    
        if (loading) {
            return (
                <div className="flex justify-center items-center py-20">
                    <Spinner />
                    <span className="ml-4 text-lg">Loading Item History Feed…</span>
                </div>
            );
        }
    
    if (!filteredHistory || filteredHistory.length === 0) {
			return <p className="p-4 text-center">No Item History Found.</p>;
    }
    
    const formatHistory = (h: ItemHistory): React.ReactNode => {
			const who = h.changedByName;
			const when = new Date(h.changeAt).toLocaleString();

			switch (h.changeType) {
				case 'CREATED':
					return (
						<div className="text-xl">
							{who} created option "<strong>{h.itemName}</strong>" at {when}
						</div>
					);
				case 'UPDATED': {
					const changes = Object.entries(h.oldValues || {});

					return (
						<div className="flex flex-wrap gap-2 items-center text-xl">
							<span>
								{who} updated "<strong>{h.itemName}</strong>" at {when}
							</span>

							{/* {changes.length > 0 && (
								<span className="flex flex-wrap gap-2">
									( */}
						{changes.length > 0 && (
							<span className="flex flex-wrap gap-2">
								(
								{changes.map(([key, oldVal], i) => {
									const newVal = (h as any)[key];
									return (
										<span key={key} className="flex gap-1">
											<span className="font-medium">
												{FIELD_LABELS[key] ?? key}:
											</span>
											<span className="text-red-600 line-through">
												{formatValue(key, oldVal)}
											</span>
											→
											<span className="text-green-600">
												{formatValue(key, newVal)}
											</span>
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
							{who} deleted option "<strong>{h.itemName}</strong>" at {when}
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
								Show Item History
							</div>
						</AccordionTrigger>

						<AccordionContent>
							<Card>
								<CardHeader>
									<CardTitle className="flex justify-between items-center w-full text-xl md:text-3xl">
										<div className="text-xl md:text-2xl">Item History</div>

										<div className="w-1/4 md:w-1/3">
											<Input
												type="text"
												placeholder="Search by item or user..."
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
										Review the history of changes made to items in this
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
