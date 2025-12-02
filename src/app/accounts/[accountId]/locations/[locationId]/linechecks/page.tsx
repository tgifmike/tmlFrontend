'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { PDFDownloadLink } from '@react-pdf/renderer';

import { getAccountsForUser } from '@/app/api/accountApi';
import { getUserLocationAccess } from '@/app/api/locationApi';
import { getStationsByLocation } from '@/app/api/stationApi';
import {
	createLineCheckApi,
	getLineChecksApi,
	recordLineCheckApi,
} from '@/app/api/linecheckApi';

import {
	AppRole,
	LineCheck,
	Locations,
	Station,
	User,
	Item,
} from '@/app/types';

import LocationNav from '@/components/navBar/LocationNav';
import MobileDrawerNav from '@/components/navBar/MoibileDrawerNav';
import Spinner from '@/components/spinner/Spinner';
import LineCheckPdf from '@/components/locaitons/LineCheckPdf';

// ShadCN UI imports
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

const LocationLineChecksPage = () => {
	const { data: session, status } = useSession();
	const currentUser = session?.user as User | undefined;
	const sessionUserRole = currentUser?.appRole;
	const canToggle = currentUser?.appRole === AppRole.MANAGER;
	const params = useParams<{ accountId: string; locationId: string }>();
	const router = useRouter();

	const accountIdParam = params.accountId;
	const locationIdParam = params.locationId;

	// --- State ---
	const [loadingAccess, setLoadingAccess] = useState(true);
	const [hasAccess, setHasAccess] = useState(false);
	const [accountName, setAccountName] = useState<string | null>(null);
	const [accountImage, setAccountImage] = useState<string | null>(null);
	const [locations, setLocations] = useState<Locations[]>([]);
	const [currentLocation, setCurrentLocation] = useState<Locations | null>(
		null
	);
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [selectedStations, setSelectedStations] = useState<string[]>([]);
	const [loading, setLoading] = useState(false);
	const [stations, setStations] = useState<Station[]>([]);
	const [lineChecks, setLineChecks] = useState<LineCheck[]>([]);

	// --- Verify Access ---
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

	// --- Fetch Line Checks ---
	useEffect(() => {
		const fetchLineChecks = async () => {
			try {
				const res = await getLineChecksApi();
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
			} catch (err) {
				console.error(err);
				setLineChecks([]);
			}
		};
		fetchLineChecks();
	}, []);

	// --- Handlers ---
	const toggleSelectStation = (id: string) => {
		setSelectedStations((prev) =>
			prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
		);
	};

	const createLineCheck = async () => {
		if (!selectedStations.length) return;
		setLoading(true);
		try {
			await createLineCheckApi(session?.user.id!, selectedStations);
			setSelectedStations([]);
			toast.success('Line check created!');
		} catch {
			toast.error('Failed to create line check');
		} finally {
			setLoading(false);
		}
	};

	const handleItemChange = (
		lineCheckItemId: string,
		field: keyof Item,
		value: any
	) => {
		setLineChecks((prev) =>
			prev.map((lc) => ({
				...lc,
				stations: lc.stations.map((station) => ({
					...station,
					items: station.items.map((it) =>
						it.id === lineCheckItemId ? { ...it, [field]: value } : it
					),
				})),
			}))
		);
	};

	const recordLineCheck = async () => {
		try {
			const payload = lineChecks.map((lc) => ({
				id: lc.id,
				stations: lc.stations.map((st) => ({
					id: st.id,
					items: st.items.map((it) => ({
						id: it.id!,
						checked: it.isCheckMark,
						temperature: it.itemTemperature,
						lineCheckNotes: it.observations,
					})),
				})),
			}));
			await recordLineCheckApi(payload);
			toast.success('Line check recorded!');
		} catch (err) {
			console.error(err);
			toast.error('Failed to record line check');
		}
	};

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
					sessionUserRole={currentUser?.appRole ?? AppRole.MEMBER} // fallback
				/>
			</aside>

			{/* Main content */}
			<section className="flex-1 flex flex-col">
				<header className="flex justify-between items-center px-4 py-3 border-b bg-background/70 backdrop-blur-md sticky top-0 z-20">
					<div className="flex gap-8">
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
								sessionUserRole={currentUser?.appRole ?? AppRole.MEMBER} // fallback
							/>
						</MobileDrawerNav>
						<h1 className="text-3xl font-bold">
							{currentLocation?.locationName}
						</h1>
					</div>
				</header>

				<div className="p-4">
					<Link
						className="text-xl hover:underline"
						href={`/accounts/${accountIdParam}/locations/${locationIdParam}/stations`}
					>
						Manage Stations
					</Link>
				</div>

				{/* Create Line Check */}
				<div className="p-4">
					<h2 className="text-xl font-bold mb-4">Create New Line Check</h2>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-2">
						{stations.map((station) => (
							<Button
								variant={
									selectedStations.includes(station.id!) ? 'default' : 'outline'
								}
								key={station.id}
								onClick={() => toggleSelectStation(station.id!)}
							>
								{station.stationName}
							</Button>
						))}
					</div>
					<Button
						className="mt-4"
						onClick={createLineCheck}
						disabled={!selectedStations.length || loading}
					>
						{loading ? 'Creating...' : 'Create Line Check'}
					</Button>
				</div>

				{/* Line Checks */}
				<div className="p-4">
					<h2 className="text-2xl font-bold mb-4">Line Checks</h2>
					{lineChecks.length === 0 && <p>No line checks found.</p>}

					<Accordion type="multiple" className="space-y-2">
						{lineChecks.map((lc, index) => (
							<AccordionItem
								key={`${index}-${lc.id}`}
								value={`${index}-${lc.id}`}
							>
								<AccordionTrigger>
									<div className="flex justify-between w-full">
										<span>
											Check Time: {new Date(lc.checkTime).toLocaleString()}
										</span>
										<span>Created By: {lc.username || 'Unknown'}</span>
									</div>
								</AccordionTrigger>

								<AccordionContent>
									{lc.stations?.map((station) => (
										<Card
											key={station.id}
											id={`linecheck-${lc.id}`}
											className="mb-4"
										>
											<CardHeader>
												<CardTitle>Station: {station.stationName}</CardTitle>
											</CardHeader>
											<CardContent>
												<div className="overflow-x-auto">
													<Table>
														<TableHeader>
															<TableRow>
																<TableHead>Item Name</TableHead>
																<TableHead>Shelf Life</TableHead>
																<TableHead>Container</TableHead>
																<TableHead>Tool</TableHead>
																<TableHead>Portion Size</TableHead>
																<TableHead>Temp / Checked</TableHead>
																<TableHead>Notes</TableHead>
																<TableHead>Observations</TableHead>
															</TableRow>
														</TableHeader>
														<TableBody>
															{station.items
																?.slice()
																.sort((a, b) => a.sortOrder - b.sortOrder)
																.map((item: Item) => (
																	<TableRow key={item.id}>
																		<TableCell>{item.itemName}</TableCell>
																		<TableCell>
																			{item.shelfLife || '-'}
																		</TableCell>
																		<TableCell>{item.panSize || '-'}</TableCell>
																		<TableCell>
																			{item.tool ? item.toolName : '-'}
																		</TableCell>
																		<TableCell>
																			{item.portioned ? item.portionSize : '-'}
																		</TableCell>
																		<TableCell>
																			{item.tempTaken ? (
																				<div className="flex flex-col">
																					<span
																						className={`font-medium text-lg ${
																							item.temperature! >=
																								item.minTemp! &&
																							item.temperature! <= item.maxTemp!
																								? 'text-green-600'
																								: 'text-red-600'
																						}`}
																					>
																						{item.temperature ?? '-'}°
																					</span>
																					<span className="text-xs text-gray-500">
																						{item.minTemp}° - {item.maxTemp}°
																					</span>
																				</div>
																			) : (
																				<span
																					className={`text-xl font-bold ${
																						item.ischecked
																							? 'text-green-600'
																							: 'text-red-600'
																					}`}
																				>
																					{item.ischecked ? '✓' : '✘'}
																				</span>
																			)}
																		</TableCell>
																		<TableCell>
																			{item.templateNotes || '-'}
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

									<PDFDownloadLink
										document={
											<LineCheckPdf
												lineCheck={lc}
												accountName={accountName || undefined}
												accountImage={accountImage || undefined}
											/>
										}
										fileName={`linecheck-${lc.id}.pdf`}
										style={{
											textDecoration: 'none',
											padding: '8px 12px',
											border: '1px solid #2E5FFF',
											borderRadius: 4,
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
				</div>
			</section>
		</main>
	);
};

export default LocationLineChecksPage;
