'use client';

import { pdf } from '@react-pdf/renderer';
import { CalendarDays, Clock3, Download, Search, UserRound } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { getAccountsForUser } from '@/app/api/accountApi';
import {
	getCompletedLineChecksByLocationApi,
	getLineCheckItemPhotosApi,
} from '@/app/api/linecheckApi';
import { getUserLocationAccess } from '@/app/api/locationApi';
import {
	AppRole,
	type Item,
	type LineCheck,
	type LineCheckPhoto,
	type Locations,
	type User,
} from '@/app/types';
import LineCheckPdf from '@/components/locaitons/LineCheckPdf';
import LocationNav from '@/components/navBar/LocationNav';
import LocationPageHeader from '@/components/navBar/LocationPageHeader';
import Spinner from '@/components/spinner/Spinner';
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { useSession } from '@/lib/auth/session-context';

type SortMode = 'dateDesc' | 'dateAsc' | 'userAsc' | 'userDesc';

const LocationLineChecksPage = () => {
	const { user, loading } = useSession();
	const currentUser = user as User | undefined;
	const params = useParams<{ accountId: string; locationId: string }>();
	const accountId = params.accountId;
	const locationId = params.locationId;
	const router = useRouter();

	const [loadingPage, setLoadingPage] = useState(true);
	const [accountName, setAccountName] = useState<string | null>(null);
	const [accountImage, setAccountImage] = useState<string | null>(null);
	const [currentLocation, setCurrentLocation] = useState<Locations | null>(null);
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [lineChecks, setLineChecks] = useState<LineCheck[]>([]);
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedDate, setSelectedDate] = useState<Date | undefined>();
	const [sortMode, setSortMode] = useState<SortMode>('dateDesc');

	useEffect(() => {
		if (loading || !user?.id || !accountId || !locationId) return;

		let cancelled = false;
		const loadPage = async () => {
			setLoadingPage(true);
			try {
				const [accountsRes, locationsRes] = await Promise.all([
					getAccountsForUser(user.id),
					getUserLocationAccess(user.id),
				]);
				if (cancelled) return;

				const account = accountsRes.data?.find(
					(candidate) => candidate.id?.toString() === accountId,
				);
				if (!account) {
					toast.error('You do not have access to this account.');
					router.push('/accounts');
					return;
				}

				const location = (locationsRes.data ?? []).find(
					(candidate) => candidate.id?.toString() === locationId,
				);
				if (!location) {
					toast.error('You do not have access to this location.');
					router.push(`/accounts/${accountId}`);
					return;
				}

				const response = await getCompletedLineChecksByLocationApi(locationId);
				if (cancelled) return;
				if (response.error) throw new Error(response.error);

				const rawData: unknown = response.data;
				const parsedData = Array.isArray(rawData)
					? (rawData as LineCheck[])
					: typeof rawData === 'string'
						? (JSON.parse(rawData) as LineCheck[])
						: [];

				setLineChecks(normalizeLineChecks(parsedData));
				setAccountName(account.accountName ?? null);
				setAccountImage(account.imageBase64 || account.accountImage || null);
				setCurrentLocation(location);
			} catch (error) {
				if (!cancelled) {
					toast.error(
						error instanceof Error
							? error.message
							: 'Failed to load completed line checks.',
					);
					setLineChecks([]);
				}
			} finally {
				if (!cancelled) setLoadingPage(false);
			}
		};

		loadPage();
		return () => {
			cancelled = true;
		};
	}, [loading, user?.id, accountId, locationId, router]);

	const filteredLineChecks = useMemo(() => {
		const normalizedSearch = searchQuery.trim().toLowerCase();
		const filtered = lineChecks.filter((lineCheck) => {
			const matchesDate = selectedDate
				? isSameDay(new Date(lineCheck.checkTime), selectedDate)
				: true;
			const matchesUser = normalizedSearch
				? (lineCheck.username ?? '').toLowerCase().includes(normalizedSearch)
				: true;
			return matchesDate && matchesUser;
		});

		return filtered.sort((first, second) => {
			switch (sortMode) {
				case 'dateAsc':
					return dateValue(first.checkTime) - dateValue(second.checkTime);
				case 'userAsc':
					return (first.username ?? '').localeCompare(second.username ?? '');
				case 'userDesc':
					return (second.username ?? '').localeCompare(first.username ?? '');
				default:
					return dateValue(second.checkTime) - dateValue(first.checkTime);
			}
		});
	}, [lineChecks, searchQuery, selectedDate, sortMode]);

	const lineChecksByDay = useMemo(
		() =>
			filteredLineChecks.reduce<Record<string, LineCheck[]>>(
				(grouped, lineCheck) => {
					const dayKey = new Date(lineCheck.checkTime).toDateString();
					(grouped[dayKey] ??= []).push(lineCheck);
					return grouped;
				},
				{},
			),
		[filteredLineChecks],
	);

	const hasFilters = Boolean(searchQuery.trim() || selectedDate);
	const resetFilters = () => {
		setSearchQuery('');
		setSelectedDate(undefined);
		setSortMode('dateDesc');
	};

	if (loadingPage) {
		return (
			<div className="flex items-center justify-center py-40 text-xl text-chart-3">
				<Spinner />
				<span className="ml-4">Loading line checks…</span>
			</div>
		);
	}

	return (
		<main className="flex min-h-screen overflow-hidden">
			<aside className="hidden w-1/6 shrink-0 self-stretch border-r bg-ring md:block">
				<LocationNav
					accountName={accountName}
					accountImage={accountImage}
					accountId={accountId}
					locationId={locationId}
					sessionUserRole={currentUser?.appRole ?? AppRole.MEMBER}
				/>
			</aside>

			<section className="flex min-w-0 flex-1 flex-col">
				<LocationPageHeader
					accountId={accountId}
					locationId={locationId}
					accountName={accountName}
					accountImage={accountImage}
					locationName={currentLocation?.locationName}
					pageName="Line Checks"
					sessionUserRole={currentUser?.appRole ?? AppRole.MEMBER}
					drawerOpen={drawerOpen}
					setDrawerOpen={setDrawerOpen}
				/>

				<div className="flex-1 overflow-y-auto p-4 sm:p-6">
					<div className="mx-auto w-full max-w-7xl space-y-6">
						<FilterBar
							searchQuery={searchQuery}
							setSearchQuery={setSearchQuery}
							selectedDate={selectedDate}
							setSelectedDate={setSelectedDate}
							sortMode={sortMode}
							setSortMode={setSortMode}
							disableReset={!hasFilters && sortMode === 'dateDesc'}
							onReset={resetFilters}
						/>

						<div className="flex flex-col gap-1 px-1 sm:flex-row sm:items-end sm:justify-between">
							<div>
								<h2 className="text-xl font-semibold tracking-tight">Completed line checks</h2>
								<p className="text-sm text-muted-foreground">
									Review results, notes, observations, and submitted photos.
								</p>
							</div>
							<span className="text-sm font-medium text-muted-foreground">
								{filteredLineChecks.length} result{filteredLineChecks.length === 1 ? '' : 's'}
							</span>
						</div>

						{filteredLineChecks.length === 0 ? (
							<EmptyState hasFilters={hasFilters} onReset={resetFilters} />
						) : (
							<Accordion type="multiple" className="space-y-4">
								{Object.entries(lineChecksByDay).map(([day, checks]) => (
									<DayGroup
										key={day}
										day={day}
										lineChecks={checks}
										accountName={accountName}
										accountImage={accountImage}
										locationName={currentLocation?.locationName ?? ''}
									/>
								))}
							</Accordion>
						)}
					</div>
				</div>
			</section>
		</main>
	);
};

function FilterBar({
	searchQuery,
	setSearchQuery,
	selectedDate,
	setSelectedDate,
	sortMode,
	setSortMode,
	disableReset,
	onReset,
}: {
	searchQuery: string;
	setSearchQuery: (value: string) => void;
	selectedDate?: Date;
	setSelectedDate: (value?: Date) => void;
	sortMode: SortMode;
	setSortMode: (value: SortMode) => void;
	disableReset: boolean;
	onReset: () => void;
}) {
	return (
		<Card className="gap-0 py-0 shadow-sm">
			<CardContent className="p-4 sm:p-5">
				<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(240px,1fr)_auto_190px_auto] xl:items-center">
					<div className="relative sm:col-span-2 xl:col-span-1">
						<Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
						<Input
							value={searchQuery}
							onChange={(event) => setSearchQuery(event.target.value)}
							placeholder="Search by team member"
							className="pl-9"
						/>
					</div>
					<Popover>
						<PopoverTrigger asChild>
							<Button variant="outline" className="justify-start">
								<CalendarDays className="size-4" aria-hidden="true" />
								{selectedDate ? selectedDate.toLocaleDateString() : 'Any date'}
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-auto p-0" align="start">
							<Calendar
								mode="single"
								selected={selectedDate}
								onSelect={setSelectedDate}
							/>
						</PopoverContent>
					</Popover>
					<Select value={sortMode} onValueChange={(value) => setSortMode(value as SortMode)}>
						<SelectTrigger className="w-full">
							<SelectValue placeholder="Sort line checks" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="dateDesc">Newest first</SelectItem>
							<SelectItem value="dateAsc">Oldest first</SelectItem>
							<SelectItem value="userAsc">Team member A–Z</SelectItem>
							<SelectItem value="userDesc">Team member Z–A</SelectItem>
						</SelectContent>
					</Select>
					<Button variant="ghost" onClick={onReset} disabled={disableReset}>
						Reset
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}

function DayGroup({ day, lineChecks, accountName, accountImage, locationName }: {
	day: string;
	lineChecks: LineCheck[];
	accountName: string | null;
	accountImage: string | null;
	locationName: string;
}) {
	return (
		<AccordionItem value={`day-${day}`} className="overflow-hidden rounded-2xl border bg-card px-0 shadow-sm">
			<AccordionTrigger className="px-5 py-4 hover:no-underline sm:px-6">
				<div className="flex min-w-0 flex-1 flex-col gap-1 text-left sm:flex-row sm:items-center sm:justify-between sm:pr-4">
					<span className="font-semibold">{formatDay(day)}</span>
					<span className="text-sm font-medium text-muted-foreground">
						{lineChecks.length} line check{lineChecks.length === 1 ? '' : 's'}
					</span>
				</div>
			</AccordionTrigger>
			<AccordionContent className="border-t bg-muted/15 px-3 pb-3 pt-4 sm:px-5 sm:pb-5">
				<Accordion type="multiple" className="space-y-3">
					{lineChecks.map((lineCheck) => (
						<LineCheckDetails
							key={lineCheck.id}
							lineCheck={lineCheck}
							accountName={accountName}
							accountImage={accountImage}
							locationName={locationName}
						/>
					))}
				</Accordion>
			</AccordionContent>
		</AccordionItem>
	);
}

function LineCheckDetails({ lineCheck, accountName, accountImage, locationName }: {
	lineCheck: LineCheck;
	accountName: string | null;
	accountImage: string | null;
	locationName: string;
}) {
	const itemCount = lineCheck.stations?.reduce(
		(total, station) => total + (station.items?.length ?? 0),
		0,
	);

	return (
		<AccordionItem value={`check-${lineCheck.id}`} className="overflow-hidden rounded-xl border bg-background px-0">
			<AccordionTrigger className="px-4 py-4 hover:no-underline sm:px-5">
				<div className="grid min-w-0 flex-1 gap-2 text-left sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:pr-4">
					<div className="flex min-w-0 items-center gap-3">
						<span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-chart-3/10 text-chart-3">
							<UserRound className="size-5" aria-hidden="true" />
						</span>
						<div className="min-w-0">
							<p className="truncate font-semibold">{lineCheck.username || 'Unknown team member'}</p>
							<p className="text-xs text-muted-foreground">
								{itemCount} item{itemCount === 1 ? '' : 's'} across {lineCheck.stations?.length ?? 0} station{lineCheck.stations?.length === 1 ? '' : 's'}
							</p>
						</div>
					</div>
					<div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium text-muted-foreground sm:justify-end">
						<span className="inline-flex items-center gap-1.5">
							<Clock3 className="size-3.5" aria-hidden="true" />
							Started {formatTime(lineCheck.checkTime)}
						</span>
						<span>Completed {formatTime(lineCheck.completedAt)}</span>
					</div>
				</div>
			</AccordionTrigger>
			<AccordionContent className="border-t px-3 pb-4 pt-4 sm:px-5 sm:pb-5">
				<div className="mb-4 flex justify-end">
					<LineCheckPdfButton
						lineCheck={lineCheck}
						accountName={accountName}
						accountImage={accountImage}
						locationName={locationName}
					/>
				</div>
				<div className="space-y-4">
					{lineCheck.stations?.map((station) => (
						<StationResults key={station.id} station={station} />
					))}
				</div>
			</AccordionContent>
		</AccordionItem>
	);
}

function LineCheckPdfButton({
	lineCheck,
	accountName,
	accountImage,
	locationName,
}: {
	lineCheck: LineCheck;
	accountName: string | null;
	accountImage: string | null;
	locationName: string;
}) {
	const [preparing, setPreparing] = useState(false);

	const handleDownload = async () => {
		setPreparing(true);
		try {
			const itemIds = lineCheck.stations
				.flatMap((station) => station.items ?? [])
				.flatMap((item) => (item.id ? [item.id] : []));
			let skippedPhotoCount = 0;
			const photoEntries = await Promise.all(
				itemIds.map(async (itemId) => {
					const photos = await loadItemPhotos(itemId);
					const preparedPhotos = await Promise.all(
						photos.map(async (photo) => ({
							...photo,
							url: await getEmbeddableImageSource(photo.url),
						})),
					);
					const embeddedPhotos = preparedPhotos.filter(
						(photo): photo is LineCheckPhoto => {
							if (photo.url) return true;
							skippedPhotoCount += 1;
							return false;
						},
					);
					return [itemId, embeddedPhotos] as const;
				}),
			);
			const photosByItemId = Object.fromEntries(photoEntries);
			const brandLogoUrl = await getEmbeddableImageSource(
				`${window.location.origin}/newLogo.png`,
			);
			const pdfAccountImage = accountImage
				? await getEmbeddableImageSource(accountImage)
				: undefined;
			const blob = await pdf(
				<LineCheckPdf
					lineCheck={lineCheck}
					accountName={accountName || undefined}
					accountImage={pdfAccountImage}
					locationName={locationName}
					brandLogoUrl={brandLogoUrl ?? undefined}
					photosByItemId={photosByItemId}
				/>,
			).toBlob();

			const downloadUrl = URL.createObjectURL(blob);
			const anchor = document.createElement('a');
			anchor.href = downloadUrl;
			anchor.download = `linecheck-${lineCheck.id}.pdf`;
			document.body.appendChild(anchor);
			anchor.click();
			anchor.remove();
			window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1_000);
			if (skippedPhotoCount > 0) {
				toast.warning(
					`${skippedPhotoCount} photo${skippedPhotoCount === 1 ? '' : 's'} could not be added to the PDF.`,
				);
			}
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : 'Failed to generate the PDF.',
			);
		} finally {
			setPreparing(false);
		}
	};

	return (
		<Button variant="outline" size="sm" onClick={handleDownload} disabled={preparing}>
			<Download className="size-4" aria-hidden="true" />
			{preparing ? 'Preparing photos and PDF…' : 'Download PDF'}
		</Button>
	);
}

function StationResults({ station }: { station: LineCheck['stations'][number] }) {
	return (
		<Card className="gap-0 overflow-hidden py-0 shadow-sm">
			<CardHeader className="border-b bg-muted/35 px-5 py-4">
				<CardTitle className="text-base">{station.stationName}</CardTitle>
			</CardHeader>
			<CardContent className="p-0">
				<div className="hidden overflow-x-auto lg:block">
					<Table className="min-w-[1080px]">
						<TableHeader>
							<TableRow className="bg-muted/15">
								<TableHead className="w-[16%] px-5">Item</TableHead>
								<TableHead className="w-[18%]">Setup</TableHead>
								<TableHead className="w-[14%]">Result</TableHead>
								<TableHead className="w-[13%]">Issues</TableHead>
								<TableHead className="w-[27%]">Notes &amp; correction</TableHead>
								<TableHead className="w-[12%] pr-5">Photos</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{station.items?.map((item) => (
								<TableRow key={item.id} className="align-top">
									<TableCell className="px-5 py-4 font-semibold">{item.itemName}</TableCell>
									<TableCell className="py-4"><ItemSetup item={item} /></TableCell>
									<TableCell className="py-4"><ItemResult item={item} /></TableCell>
									<TableCell className="py-4"><ItemIssues item={item} /></TableCell>
									<TableCell className="min-w-72 max-w-md py-4">
										<div className="space-y-4">
											<ItemNotes item={item} />
											{hasItemCorrection(item) && <ItemCorrection item={item} />}
										</div>
									</TableCell>
									<TableCell className="py-4 pr-5"><ItemPhotos itemId={item.id} itemName={item.itemName} /></TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
				<div className="divide-y lg:hidden">
					{station.items?.map((item) => (
						<div key={item.id} className="space-y-4 p-4 sm:p-5">
							<div className="flex flex-wrap items-start justify-between gap-3">
								<div>
									<p className="font-semibold">{item.itemName}</p>
									<ItemSetup item={item} compact />
								</div>
								<ItemResult item={item} />
							</div>
							<MobileDetail label="Issues"><ItemIssues item={item} /></MobileDetail>
							<MobileDetail label="Notes and observations"><ItemNotes item={item} /></MobileDetail>
							{hasItemCorrection(item) && (
								<MobileDetail label="Correction"><ItemCorrection item={item} /></MobileDetail>
							)}
							<MobileDetail label="Photos"><ItemPhotos itemId={item.id} itemName={item.itemName} /></MobileDetail>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}

function ItemSetup({ item, compact = false }: { item: Item; compact?: boolean }) {
	const details = [
		item.shelfLife && `Shelf life: ${item.shelfLife}`,
		item.panSize && `Container: ${item.panSize}`,
		item.tool && item.toolName && `Tool: ${item.toolName}`,
		item.isPortioned && item.portionSize && `Portion: ${item.portionSize}`,
	].filter(Boolean) as string[];

	if (details.length === 0) return <span className="text-sm text-muted-foreground">No setup details</span>;
	return (
		<div className={compact ? 'mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground' : 'space-y-1 text-sm text-muted-foreground'}>
			{details.map((detail) => <span key={detail} className={compact ? '' : 'block'}>{detail}</span>)}
		</div>
	);
}

function ItemResult({ item }: { item: Item }) {
	if (item.isMissing) return <StatusPill tone="danger">Item missing</StatusPill>;
	const temperatureExpected = Boolean(item.tempTaken || item.isTempTaken);
	if (temperatureExpected) {
		if (item.temperature == null) return <StatusPill tone="danger">No temperature</StatusPill>;
		const inRange = isTemperatureInRange(item);
		return (
			<div className="space-y-1">
				<StatusPill tone={inRange ? 'success' : 'danger'}>{item.temperature}°</StatusPill>
				{(item.minTemp != null || item.maxTemp != null) && (
					<p className="text-xs text-muted-foreground">Expected {formatTemperatureRange(item.minTemp, item.maxTemp)}</p>
				)}
			</div>
		);
	}
	return <StatusPill tone={item.itemChecked === true ? 'success' : 'danger'}>{item.itemChecked === true ? 'Passed' : 'Needs attention'}</StatusPill>;
}

function ItemIssues({ item }: { item: Item }) {
	const issues: string[] = [];
	const temperatureExpected = Boolean(item.tempTaken || item.isTempTaken);
	if (item.isMissing) issues.push('Missing');
	if (temperatureExpected && item.temperature == null) issues.push('Missing temp');
	else if (temperatureExpected && !isTemperatureInRange(item)) issues.push('Out of temp');
	if (!item.isMissing && !temperatureExpected && item.itemChecked !== true) issues.push('Prepped wrong');

	if (issues.length === 0) return <span className="text-sm text-muted-foreground">None</span>;
	return <div className="flex flex-wrap gap-1.5">{issues.map((issue) => <StatusPill key={issue} tone="danger">{issue}</StatusPill>)}</div>;
}

function ItemNotes({ item }: { item: Item }) {
	const templateNotes = item.templateNotes?.trim();
	const observations = item.observations?.trim();
	if (!templateNotes && !observations) return <span className="text-sm text-muted-foreground">None recorded</span>;

	return (
		<div className="min-w-0 space-y-3">
			{templateNotes && <LabeledNote label="Setup note" text={templateNotes} />}
			{observations && <LabeledNote label="Line-check observation" text={observations} />}
		</div>
	);
}

function ItemCorrection({ item }: { item: Item }) {
	const corrected = item.isCorrected ?? item.corrected ?? false;
	const correctiveNotes = item.correctiveNotes?.trim();

	return (
		<div
			className={`rounded-xl border p-3 ${
				corrected
					? 'border-green-200 bg-green-50/70 dark:border-green-900 dark:bg-green-950/35'
					: 'border-amber-200 bg-amber-50/70 dark:border-amber-900 dark:bg-amber-950/35'
			}`}
		>
			<div className="mb-2 flex flex-wrap items-center justify-between gap-2">
				<p
					className={`text-xs font-semibold ${
						corrected
							? 'text-green-800 dark:text-green-300'
							: 'text-amber-800 dark:text-amber-300'
					}`}
				>
					{corrected ? 'Corrected' : 'Correction note'}
				</p>
				{corrected && (
					<span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-green-800 dark:bg-green-950 dark:text-green-300">
						Resolved
					</span>
				)}
			</div>

			{correctiveNotes ? (
				<ExpandableText text={correctiveNotes} />
			) : (
				<p className="text-sm text-muted-foreground">No correction comments recorded.</p>
			)}

			{corrected && (
				<p className="mt-2 text-xs text-muted-foreground">
					Corrected by {item.correctedByName?.trim() || 'Unknown team member'}
					{' · '}
					{formatCorrectionDate(item.correctedAt)}
				</p>
			)}
		</div>
	);
}

const hasItemCorrection = (item: Item) => Boolean(
	(item.isCorrected ?? item.corrected ?? false) ||
	item.correctiveNotes?.trim() ||
	item.correctedAt ||
	item.correctedByName,
);

function LabeledNote({ label, text }: { label: string; text: string }) {
	return (
		<div>
			<p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
			<ExpandableText text={text} />
		</div>
	);
}

function ExpandableText({ text }: { text: string }) {
	const [expanded, setExpanded] = useState(false);
	const lines = text.split('\n');
	const canCollapse = text.length > 180 || lines.length > 3;
	const preview = text.length > 180
		? `${text.slice(0, 180).trimEnd()}…`
		: lines.length > 3
			? `${lines.slice(0, 3).join('\n').trimEnd()}…`
			: text;
	const visibleText = expanded ? text : preview;
	return (
		<div className="min-w-0 max-w-full">
			<p className="whitespace-pre-wrap break-words text-sm leading-6 [overflow-wrap:anywhere]">{visibleText}</p>
			{canCollapse && (
				<Button type="button" variant="link" size="sm" className="mt-1 h-auto p-0 text-xs" onClick={() => setExpanded((current) => !current)}>
					{expanded ? 'Show less' : 'Show full note'}
				</Button>
			)}
		</div>
	);
}

const photoCache = new Map<
	string,
	{ photos: LineCheckPhoto[]; cachedAt: number }
>();
const pendingPhotoRequests = new Map<string, Promise<LineCheckPhoto[]>>();
const PHOTO_CACHE_TTL_MS = 5 * 60 * 1_000;

const loadItemPhotos = (itemId: string) => {
	const cachedEntry = photoCache.get(itemId);
	if (
		cachedEntry &&
		Date.now() - cachedEntry.cachedAt < PHOTO_CACHE_TTL_MS
	) {
		return Promise.resolve(cachedEntry.photos);
	}

	const pendingRequest = pendingPhotoRequests.get(itemId);
	if (pendingRequest) return pendingRequest;

	const request = getLineCheckItemPhotosApi(itemId)
		.then((response) => response.data ?? [])
		.catch(() => [])
		.then((photos) => {
			photoCache.set(itemId, { photos, cachedAt: Date.now() });
			pendingPhotoRequests.delete(itemId);
			return photos;
		});
	pendingPhotoRequests.set(itemId, request);
	return request;
};

const getEmbeddableImageSource = async (source: string): Promise<string | null> => {
	const value = source.trim();
	if (!value || value.startsWith('data:image/')) return value;
	if (!/^(https?:\/\/|blob:|\/)/i.test(value)) return value;

	try {
		let response: Response;
		if (isSignedLineCheckImage(value)) {
			response = await fetch('/api/linecheck-image', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ url: value }),
			});
			if (!response.ok) return null;
		} else {
			response = await fetch(value, { cache: 'no-store' });
			if (!response.ok) return null;
		}
		const blob = await response.blob();
		if (!blob.type.toLowerCase().startsWith('image/')) return null;
		return await new Promise<string>((resolve, reject) => {
			const reader = new FileReader();
			reader.onloadend = () => resolve(String(reader.result));
			reader.onerror = () => reject(reader.error);
			reader.readAsDataURL(blob);
		});
	} catch {
		return null;
	}
};

const isSignedLineCheckImage = (source: string) => {
	try {
		const url = new URL(source);
		const parameterNames = new Set(
			[...url.searchParams.keys()].map((name) => name.toLowerCase()),
		);
		return (
			url.protocol === 'https:' &&
			(url.hostname === 's3.amazonaws.com' ||
				url.hostname.endsWith('.amazonaws.com')) &&
			url.pathname.includes('/line-check-items/') &&
			parameterNames.has('x-amz-signature')
		);
	} catch {
		return false;
	}
};

function ItemPhotos({ itemId, itemName }: { itemId?: string; itemName: string }) {
	const [photos, setPhotos] = useState<LineCheckPhoto[]>([]);
	const [loadingPhotos, setLoadingPhotos] = useState(false);

	useEffect(() => {
		if (!itemId) return;
		let cancelled = false;
		const fetchPhotos = async () => {
			setLoadingPhotos(true);
			try {
				const loadedPhotos = await loadItemPhotos(itemId);
				if (!cancelled) setPhotos(loadedPhotos);
			} catch {
				if (!cancelled) setPhotos([]);
			} finally {
				if (!cancelled) setLoadingPhotos(false);
			}
		};
		fetchPhotos();
		return () => { cancelled = true; };
	}, [itemId]);

	if (!itemId || (!loadingPhotos && photos.length === 0)) return <span className="text-sm text-muted-foreground">None</span>;
	if (loadingPhotos) return <span className="text-xs text-muted-foreground">Loading…</span>;

	return (
		<div className="flex flex-wrap gap-2">
			{photos.map((photo) => {
				const label = formatPhotoType(photo.photoType);
				return (
					<a key={photo.id} href={photo.url} target="_blank" rel="noreferrer" title={photo.notes || `View ${label} photo`} className="group block space-y-1 text-center">
						{/* Presigned S3 hosts are dynamic, so Next Image cannot whitelist them. */}
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img src={photo.url} alt={`${itemName} ${label} photo`} className="size-16 rounded-lg border object-cover transition-transform group-hover:scale-105" />
						<span className={`block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${photo.photoType.toUpperCase() === 'CORRECTED' ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'}`}>{label}</span>
					</a>
				);
			})}
		</div>
	);
}

function MobileDetail({ label, children }: { label: string; children: React.ReactNode }) {
	return (
		<div className="grid min-w-0 gap-1.5 sm:grid-cols-[150px_minmax(0,1fr)] sm:gap-4">
			<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
			<div className="min-w-0">{children}</div>
		</div>
	);
}

function StatusPill({ tone, children }: { tone: 'success' | 'danger'; children: React.ReactNode }) {
	return (
		<span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${tone === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'}`}>
			{children}
		</span>
	);
}

function EmptyState({ hasFilters, onReset }: { hasFilters: boolean; onReset: () => void }) {
	return (
		<Card className="border-dashed py-12 text-center shadow-none">
			<CardContent className="space-y-3">
				<p className="font-semibold">{hasFilters ? 'No line checks match these filters' : 'No completed line checks yet'}</p>
				<p className="text-sm text-muted-foreground">{hasFilters ? 'Try another team member or date.' : 'Completed iPad line checks will appear here.'}</p>
				{hasFilters && <Button variant="outline" size="sm" onClick={onReset}>Clear filters</Button>}
			</CardContent>
		</Card>
	);
}

const normalizeLineChecks = (lineChecks: LineCheck[]) =>
	lineChecks.map((lineCheck) => ({
		...lineCheck,
		stations: (lineCheck.stations ?? [])
			.map((station) => ({
				...station,
				sortOrder: Number(station.sortOrder) || 0,
				items: (station.items ?? [])
					.map((item) => ({ ...item, sortOrder: Number(item.sortOrder) || 0 }))
					.sort((first, second) => first.sortOrder - second.sortOrder),
			}))
			.sort((first, second) => first.sortOrder - second.sortOrder),
	}));

const isSameDay = (first: Date, second: Date) =>
	first.getFullYear() === second.getFullYear() &&
	first.getMonth() === second.getMonth() &&
	first.getDate() === second.getDate();

const dateValue = (value?: string | null) => {
	const timestamp = value ? new Date(value).getTime() : 0;
	return Number.isNaN(timestamp) ? 0 : timestamp;
};

const formatDay = (value: string) => {
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString(undefined, {
		weekday: 'long',
		month: 'long',
		day: 'numeric',
		year: 'numeric',
	});
};

const formatTime = (value?: string | null) => {
	if (!value) return 'Not recorded';
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? 'Not recorded' : date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
};

const formatCorrectionDate = (value?: string | null) => {
	if (!value) return 'Time not recorded';
	const date = new Date(value);
	return Number.isNaN(date.getTime())
		? 'Time not recorded'
		: date.toLocaleString([], {
				month: 'short',
				day: 'numeric',
				year: 'numeric',
				hour: 'numeric',
				minute: '2-digit',
			});
};

const isTemperatureInRange = (item: Item) => {
	if (item.temperature == null) return false;
	return (item.minTemp == null || item.temperature >= item.minTemp) &&
		(item.maxTemp == null || item.temperature <= item.maxTemp);
};

const formatTemperatureRange = (minimum?: number | null, maximum?: number | null) => {
	if (minimum != null && maximum != null) return `${minimum}°–${maximum}°`;
	if (minimum != null) return `${minimum}° or higher`;
	if (maximum != null) return `${maximum}° or lower`;
	return 'No range configured';
};

const formatPhotoType = (photoType: string) => photoType
	.toLowerCase()
	.replaceAll('_', ' ')
	.replace(/^\w/, (character) => character.toUpperCase());

export default LocationLineChecksPage;
