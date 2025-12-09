'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { PDFDownloadLink } from '@react-pdf/renderer';

import { getAccountsForUser } from '@/app/api/accountApi';
import { getUserLocationAccess } from '@/app/api/locationApi';
import { getStationsByLocation } from '@/app/api/stationApi';
import { getCompletedLineChecksByLocationApi } from '@/app/api/linecheckApi';

import {
	AppRole,
	LineCheck,
	Locations,
	Station,
	User,
	Item,
} from '@/app/types';

import LineCheckPdf from '@/components/locaitons/LineCheckPdf';
import LocationNav from '@/components/navBar/LocationNav';
import MobileDrawerNav from '@/components/navBar/MoibileDrawerNav';
import Spinner from '@/components/spinner/Spinner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '@/components/ui/accordion';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';

import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

type SortMode = 'dateDesc' | 'dateAsc' | 'userAsc' | 'userDesc';

const LocationLineChecksPage = () => {
	const { data: session, status } = useSession();
	const currentUser = session?.user as User | undefined;
	const params = useParams<{ accountId: string; locationId: string }>();
	const router = useRouter();

	const [loadingAccess, setLoadingAccess] = useState(true);
	const [hasAccess, setHasAccess] = useState(false);

	const [accountName, setAccountName] = useState<string | null>(null);
	const [accountImage, setAccountImage] = useState<string | null>(null);
	const [locations, setLocations] = useState<Locations[]>([]);
	const [currentLocation, setCurrentLocation] = useState<Locations | null>(
		null
	);
	const [drawerOpen, setDrawerOpen] = useState(false);

	const [stations, setStations] = useState<Station[]>([]);
	const [lineChecks, setLineChecks] = useState<LineCheck[]>([]);

	const [searchQuery, setSearchQuery] = useState('');
	const [selectedDate, setSelectedDate] = useState<Date | undefined>();
	const [sortMode, setSortMode] = useState<SortMode>('dateDesc');

	const accountIdParam = params.accountId;
	const locationIdParam = params.locationId;

	// --- Verify access ---
	useEffect(() => {
		if (
			!session?.user?.id ||
			!accountIdParam ||
			!locationIdParam ||
			status !== 'authenticated'
		)
			return;
		if (hasAccess) return;

		const verifyAccess = async () => {
			try {
				const accountsRes = await getAccountsForUser(session.user.id);
				const account = accountsRes.data?.find(
					(acc) => acc.id?.toString() === accountIdParam
				);
				if (!account) {
					toast.error('You do not have access to this account.');
					router.push('/accounts');
					return;
				}

				const locationRes = await getUserLocationAccess(session.user.id);
				const fetchedLocations: Locations[] = locationRes.data ?? [];
				setLocations(fetchedLocations);

				const location = fetchedLocations.find(
					(loc) => loc.id?.toString() === locationIdParam
				);
				if (!location) {
					toast.error('You do not have access to this location.');
					router.push(`/accounts/${accountIdParam}/locations`);
					return;
				}

				const stationRes = await getStationsByLocation(locationIdParam);
				const sortedStations: Station[] = (stationRes.data ?? [])
					.map((s) => ({ ...s, sortOrder: Number(s.sortOrder) || 0 }))
					.sort((a, b) => a.sortOrder - b.sortOrder);

				setStations(sortedStations);
				setCurrentLocation(location);
				setAccountName(account.accountName || null);
				setAccountImage(account.imageBase64 || null);
				setHasAccess(true);
			} catch {
				toast.error('You do not have access to this location.');
				router.push('/accounts');
			} finally {
				setLoadingAccess(false);
			}
		};

		verifyAccess();
	}, [status, session, accountIdParam, locationIdParam, hasAccess, router]);

	// --- Fetch line checks ---
	useEffect(() => {
		const fetchLineChecks = async () => {
			try {
				const res = await getCompletedLineChecksByLocationApi(locationIdParam);
				const data: LineCheck[] = Array.isArray(res.data)
					? res.data
					: JSON.parse(res.data ?? '[]');

				const sortedLineChecks = data.map((lc) => ({
					...lc,
					stations: (lc.stations ?? [])
						.map((s) => ({
							...s,
							sortOrder: Number(s.sortOrder) || 0,
							items: (s.items ?? [])
								.map((it) => ({ ...it, sortOrder: Number(it.sortOrder) || 0 }))
								.sort((a, b) => a.sortOrder - b.sortOrder),
						}))
						.sort((a, b) => a.sortOrder - b.sortOrder),
				}));

				setLineChecks(sortedLineChecks);
			} catch {
				setLineChecks([]);
			}
		};
		fetchLineChecks();
	}, [locationIdParam]);

	// --- Filter and sort ---
	const filteredAndSortedLineChecks = useMemo(() => {
		let filtered = [...lineChecks];

		// Filter by date
		if (selectedDate) {
			filtered = filtered.filter((lc) => {
				const lcDate = new Date(lc.checkTime);
				return (
					lcDate.getFullYear() === selectedDate.getFullYear() &&
					lcDate.getMonth() === selectedDate.getMonth() &&
					lcDate.getDate() === selectedDate.getDate()
				);
			});
		}

		// Filter by user search
		if (searchQuery.trim()) {
			filtered = filtered.filter((lc) =>
				lc.username?.toLowerCase().includes(searchQuery.toLowerCase())
			);
		}

		// Sort
		filtered.sort((a, b) => {
			if (sortMode === 'dateDesc')
				return (
					new Date(b.checkTime).getTime() - new Date(a.checkTime).getTime()
				);
			if (sortMode === 'dateAsc')
				return (
					new Date(a.checkTime).getTime() - new Date(b.checkTime).getTime()
				);
			if (sortMode === 'userAsc')
				return (a.username || '').localeCompare(b.username || '');
			if (sortMode === 'userDesc')
				return (b.username || '').localeCompare(a.username || '');
			return 0;
		});

		return filtered;
	}, [lineChecks, selectedDate, searchQuery, sortMode]);

	// --- Group by day ---
	const lineChecksByDay = useMemo(() => {
		const grouped: Record<string, LineCheck[]> = {};
		filteredAndSortedLineChecks.forEach((lc) => {
			const day = new Date(lc.checkTime).toLocaleDateString();
			if (!grouped[day]) grouped[day] = [];
			grouped[day].push(lc);
		});
		return grouped;
	}, [filteredAndSortedLineChecks]);

	if (loadingAccess) {
		return (
			<div className="flex justify-center items-center py-40 text-xl">
				<Spinner />
				<span className="ml-4">Loading Line Checks…</span>
			</div>
		);
	}

	return (
		<main className="flex min-h-screen overflow-hidden">
			{/* Sidebar */}
			<aside className="hidden md:block w-1/6 border-r h-screen bg-ring">
				<LocationNav
					accountName={accountName}
					accountImage={accountImage}
					accountId={accountIdParam}
					locationId={locationIdParam}
					sessionUserRole={currentUser?.appRole ?? AppRole.MEMBER}
				/>
			</aside>

			{/* Main content */}
			<section className="flex-1 flex flex-col">
				{/* Header */}
				<header className="flex flex-col md:flex-row justify-between items-center px-4 py-3 border-b bg-background/70 backdrop-blur-md sticky top-0 z-20 gap-2">
					<div className="flex items-center gap-4">
						<MobileDrawerNav
							open={drawerOpen}
							setOpen={setDrawerOpen}
							title="Menu"
						>
							<LocationNav
								accountName={accountName}
								accountImage={accountImage}
								accountId={accountIdParam}
								locationId={locationIdParam}
								sessionUserRole={currentUser?.appRole ?? AppRole.MEMBER}
							/>
						</MobileDrawerNav>
						<h1 className="text-3xl font-bold">
							{currentLocation?.locationName}
						</h1>
					</div>

					<div className="flex flex-wrap items-center gap-2">
						{/* Date Picker */}
						<Popover>
							<PopoverTrigger asChild>
								<Button variant="outline" size="sm">
									{selectedDate
										? selectedDate.toLocaleDateString()
										: 'Select Date'}
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-auto p-0">
								<Calendar
									mode="single"
									selected={selectedDate}
									onSelect={(d) => setSelectedDate(d as Date | undefined)}
								/>
							</PopoverContent>
						</Popover>

						{/* Search input */}
						<Input
							placeholder="Search by username"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-48"
						/>

						{/* Sort select */}
						<Select
							value={sortMode}
							onValueChange={(v) => setSortMode(v as SortMode)}
						>
							<SelectTrigger className="w-36">
								<SelectValue placeholder="Sort By" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="dateDesc">Date (Newest)</SelectItem>
								<SelectItem value="dateAsc">Date (Oldest)</SelectItem>
								<SelectItem value="userAsc">User (A → Z)</SelectItem>
								<SelectItem value="userDesc">User (Z → A)</SelectItem>
							</SelectContent>
						</Select>

						{/* Reset Filters */}
						<Button
							variant="ghost"
							size="sm"
							onClick={() => {
								setSelectedDate(undefined);
								setSearchQuery('');
							}}
						>
							Reset Filters
						</Button>
					</div>
				</header>

				{/* Line Checks */}
				<div className="p-4 flex-1 overflow-y-auto">
					{Object.keys(lineChecksByDay).length === 0 && (
						<p>No line checks found.</p>
					)}

					<Accordion type="multiple" className="space-y-2">
						{Object.entries(lineChecksByDay).map(([day, lineChecksForDay]) => (
							<AccordionItem key={day} value={day}>
								<AccordionTrigger>
									<div className="flex justify-between w-full text-lg font-semibold">
										<span>Line Checks for: {day}</span>
										<span>{lineChecksForDay.length} Line Checks</span>
									</div>
								</AccordionTrigger>
								<AccordionContent className="space-y-2">
									<Accordion type="multiple" className="space-y-2">
										{lineChecksForDay.map((lc) => (
											<AccordionItem key={lc.id} value={lc.id!}>
												<AccordionTrigger>
													<div className="flex justify-between w-full">
														<span>
															Performed by: {lc.username || 'Unknown'}
														</span>
														<div className="flex gap-4">
															<span>
																Started:{' '}
																{new Date(
																	lc.checkTime 
																).toLocaleTimeString()}
															</span>
															<span>
																Completed:{' '}
																{new Date(
																	lc.completedAt 
																).toLocaleTimeString()}
															</span>
														</div>
													</div>
												</AccordionTrigger>
												<AccordionContent className="space-y-2">
													{lc.stations?.map((station) => (
														<Card key={station.id} className="border mb-2">
															<CardHeader>
																<CardTitle>
																	Station: {station.stationName}
																</CardTitle>
															</CardHeader>
															<CardContent>
																<div className="overflow-x-auto">
																	<Table>
																		<TableHeader>
																			<TableRow>
																				<TableHead>Item</TableHead>
																				<TableHead>Shelf Life</TableHead>
																				<TableHead>Container</TableHead>
																				<TableHead>Tool</TableHead>
																				<TableHead>Portion Size</TableHead>
																				<TableHead>Notes</TableHead>
																				<TableHead>Temp / Checked</TableHead>
																				<TableHead>Observations</TableHead>
																			</TableRow>
																		</TableHeader>
																		<TableBody>
																			{station.items?.map((item: Item) => (
																				<TableRow key={item.id}>
																					<TableCell>{item.itemName}</TableCell>
																					<TableCell>
																						{item.shelfLife || '-'}
																					</TableCell>
																					<TableCell>
																						{item.panSize || '-'}
																					</TableCell>
																					<TableCell>
																						{item.tool ? item.toolName : '-'}
																					</TableCell>
																					<TableCell>
																						{item.portioned
																							? item.portionSize
																							: '-'}
																					</TableCell>
																					<TableCell>
																						{item.templateNotes || '-'}
																					</TableCell>
																					<TableCell>
																						{item.tempTaken ? (
																							<div className="flex flex-col">
																								<span
																									className={`font-medium text-lg ${
																										item.temperature! >=
																											item.minTemp! &&
																										item.temperature! <=
																											item.maxTemp!
																											? 'text-green-600'
																											: 'text-red-600'
																									}`}
																								>
																									{item.temperature ?? '-'}°
																								</span>
																								<span className="text-xs text-gray-500">
																									{item.minTemp}° -{' '}
																									{item.maxTemp}°
																								</span>
																							</div>
																						) : (
																							<span
																								className={`text-xl font-bold ${
																									item.itemChecked
																										? 'text-green-600'
																										: 'text-red-600'
																								}`}
																							>
																								{item.itemChecked ? '✓' : '✘'}
																							</span>
																						)}
																					</TableCell>
																					<TableCell>
																						{item.observations || '-'}
																					</TableCell>
																				</TableRow>
																			))}
																		</TableBody>
																	</Table>
																</div>
															</CardContent>
														</Card>
													))}

													{/* PDF Download */}
													<PDFDownloadLink
														document={
															<LineCheckPdf
																lineCheck={lc}
																accountName={accountName || undefined}
																accountImage={accountImage || undefined}
																locationName={
																	currentLocation?.locationName || ''
																}
															/>
														}
														fileName={`linecheck-${lc.id}.pdf`}
														style={{
															textDecoration: 'none',
															padding: '8px 12px',
															border: '1px solid #2E5FFF',
															borderRadius: 8,
															color: '#2E5FFF',
															fontWeight: 'bold',
														}}
													>
														{({ loading }) =>
															loading ? 'Generating PDF...' : 'Download PDF'
														}
													</PDFDownloadLink>
												</AccordionContent>
											</AccordionItem>
										))}
									</Accordion>
								</AccordionContent>
							</AccordionItem>
						))}
					</Accordion>
				</div>
			</section>
		</main>
	);
};

export default LocationLineChecksPage;


