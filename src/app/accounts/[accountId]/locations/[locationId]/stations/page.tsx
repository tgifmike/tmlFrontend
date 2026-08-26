'use client';

import {
	DragDropContext,
	Draggable,
	Droppable,
	type DropResult,
} from '@hello-pangea/dnd';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { getAccountsForUser } from '@/app/api/accountApi';
import { getUserLocationAccess } from '@/app/api/locationApi';
import {
	deleteStation,
	getStationsByLocation,
	reorderStations,
	toggleStationActive,
} from '@/app/api/stationApi';
import { AppRole, Locations, StationDto, User } from '@/app/types';
import { Card } from '@/components/ui/card';
import { CloneStationDialog } from '@/components/cloneStation/CloneStationDialog';
import LocationNav from '@/components/navBar/LocationNav';
import LocationPageHeader from '@/components/navBar/LocationPageHeader';
import Spinner from '@/components/spinner/Spinner';
import CreateStationDialog from '@/components/tableComponents/CreateStationForm';
import { DeleteConfirmButton } from '@/components/tableComponents/DeleteConfirmButton';
import { EditStationDialog } from '@/components/tableComponents/EditStationDialog';
import { Pagination } from '@/components/tableComponents/Pagination';
import StationHistoryFeed from '@/components/tableComponents/StationHistoryFeed';
import { StatusSwitchOrBadge } from '@/components/tableComponents/StatusSwitchOrBadge';
import { UserControls } from '@/components/tableComponents/UserControls';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useSession } from '@/lib/auth/session-context';
import { Icons } from '@/lib/icon';

const LocationStationsPage = () => {
	const SortIcon = Icons.sort;
	const StationIcon = Icons.stations;
	const { user, loading } = useSession();
	const params = useParams<{ accountId: string; locationId: string }>();
	const accountId = params.accountId;
	const locationId = params.locationId;
	const router = useRouter();

	const [loadingAccess, setLoadingAccess] = useState(true);
	const [accountName, setAccountName] = useState<string | null>(null);
	const [accountImage, setAccountImage] = useState<string | null>(null);
	const [locations, setLocations] = useState<Locations[]>([]);
	const [stations, setStations] = useState<StationDto[]>([]);
	const [currentLocation, setCurrentLocation] = useState<Locations | null>(null);
	const [showActiveOnly, setShowActiveOnly] = useState(true);
	const [searchTerm, setSearchTerm] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [drawerOpen, setDrawerOpen] = useState(false);

	const currentUser = user as User | undefined;
	const currentUserId = user?.id ?? '';
	const sessionUserRole = user?.appRole;
	const canManage = currentUser?.appRole === AppRole.MANAGER;

	useEffect(() => {
		if (loading || !user?.id || !accountId || !locationId) return;

		let cancelled = false;
		const loadPage = async () => {
			setLoadingAccess(true);
			try {
				const [accountsRes, locationRes, stationRes] = await Promise.all([
					getAccountsForUser(user.id),
					getUserLocationAccess(user.id),
					getStationsByLocation(locationId),
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

				const accessibleLocations = locationRes.data ?? [];
				const location = accessibleLocations.find(
					(candidate) => candidate.id?.toString() === locationId,
				);
				if (!location) {
					toast.error('You do not have access to this location.');
					router.push(`/accounts/${accountId}`);
					return;
				}

				if (stationRes.error) throw new Error(stationRes.error);
				setLocations(accessibleLocations);
				setStations(
					[...(stationRes.data ?? [])].sort(
						(a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
					),
				);
				setAccountName(account.accountName);
				setAccountImage(account.imageBase64 || account.accountImage || null);
				setCurrentLocation(location);
			} catch (error) {
				if (!cancelled) {
					toast.error(
						error instanceof Error ? error.message : 'Failed to load stations.',
					);
				}
			} finally {
				if (!cancelled) setLoadingAccess(false);
			}
		};

		loadPage();
		return () => {
			cancelled = true;
		};
	}, [loading, user?.id, accountId, locationId, router]);

	useEffect(() => {
		if (typeof window === 'undefined') return;
		setCurrentPage(Number(localStorage.getItem('stationCurrentPage')) || 1);
		setPageSize(Number(localStorage.getItem('stationPageSize')) || 10);
	}, []);

	useEffect(() => {
		if (typeof window !== 'undefined') {
			localStorage.setItem('stationCurrentPage', String(currentPage));
		}
	}, [currentPage]);

	useEffect(() => {
		if (typeof window !== 'undefined') {
			localStorage.setItem('stationPageSize', String(pageSize));
		}
		setCurrentPage(1);
	}, [pageSize]);

	const refreshStations = async () => {
		const response = await getStationsByLocation(locationId);
		if (response.error) throw new Error(response.error);
		setStations(
			[...(response.data ?? [])].sort(
				(a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
			),
		);
	};

	const handleToggleActive = async (stationId: string, checked: boolean) => {
		setStations((previous) =>
			previous.map((station) =>
				station.id === stationId
					? { ...station, stationActive: checked }
					: station,
			),
		);

		const response = await toggleStationActive(
			stationId,
			checked,
			currentUserId,
		);
		if (response.error) {
			setStations((previous) =>
				previous.map((station) =>
					station.id === stationId
						? { ...station, stationActive: !checked }
						: station,
				),
			);
			toast.error(response.error);
		}
	};

	const handleDeleteStation = async (stationId: string) => {
		const response = await deleteStation(stationId, currentUserId);
		if (response.error) throw new Error(response.error);
		setStations((previous) =>
			previous.filter((station) => station.id !== stationId),
		);
		toast.success('Station deleted successfully.');
	};

	const filteredStations = stations.filter((station) => {
		const matchesSearch = (station.stationName ?? '')
			.toLowerCase()
			.includes(searchTerm.toLowerCase());
		return matchesSearch && (!showActiveOnly || station.stationActive);
	});

	const paginatedStations = filteredStations.slice(
		(currentPage - 1) * pageSize,
		currentPage * pageSize,
	);

	useEffect(() => {
		const lastPage = Math.max(1, Math.ceil(filteredStations.length / pageSize));
		if (currentPage > lastPage) setCurrentPage(lastPage);
	}, [currentPage, filteredStations.length, pageSize]);

	const handleDragEnd = async (result: DropResult) => {
		if (!result.destination || result.source.index === result.destination.index) {
			return;
		}

		const reorderedPage = [...paginatedStations];
		const [moved] = reorderedPage.splice(result.source.index, 1);
		reorderedPage.splice(result.destination.index, 0, moved);

		const visibleIds = new Set(
			paginatedStations.flatMap((station) => (station.id ? [station.id] : [])),
		);
		const reorderedById = new Map(
			reorderedPage.flatMap((station) =>
				station.id ? ([[station.id, station]] as const) : [],
			),
		);
		const orderedVisibleIds = reorderedPage.flatMap((station) =>
			station.id ? [station.id] : [],
		);
		let visibleIndex = 0;
		const nextStations = stations.map((station) => {
			if (!station.id || !visibleIds.has(station.id)) return station;
			const replacement = reorderedById.get(orderedVisibleIds[visibleIndex]);
			visibleIndex += 1;
			return replacement ?? station;
		});

		setStations(nextStations);
		const response = await reorderStations(
			locationId,
			nextStations.flatMap((station) => (station.id ? [station.id] : [])),
			currentUserId,
		);
		if (response.error) {
			setStations(stations);
			toast.error(response.error);
		}
	};

	if (loadingAccess) {
		return (
			<div className="flex items-center justify-center py-40 text-xl text-chart-3">
				<Spinner />
				<span className="ml-4">Loading stations…</span>
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
					sessionUserRole={sessionUserRole}
				/>
			</aside>

			<section className="flex min-w-0 flex-1 flex-col">
				<LocationPageHeader
					accountId={accountId}
					locationId={locationId}
					accountName={accountName}
					accountImage={accountImage}
					locationName={currentLocation?.locationName}
					pageName="Stations"
					sessionUserRole={sessionUserRole}
					drawerOpen={drawerOpen}
					setDrawerOpen={setDrawerOpen}
				>
					<CreateStationDialog
						onStationCreated={(station) =>
							setStations((previous) => [...previous, station])
						}
						locationId={locationId}
						currentUserId={currentUserId}
					/>
				</LocationPageHeader>

				<div className="flex-1 overflow-y-auto p-4">
					<div className="mx-auto w-full max-w-6xl">
						<UserControls
							showActiveOnly={showActiveOnly}
							setShowActiveOnly={setShowActiveOnly}
							searchTerm={searchTerm}
							setSearchTerm={setSearchTerm}
							searchPlaceholder="Search stations"
						/>

						<div className="mt-4 flex items-center justify-between px-1 text-sm text-muted-foreground">
							<span>
								{filteredStations.length} station{filteredStations.length === 1 ? '' : 's'}
							</span>
							<span className="hidden sm:inline">Drag rows by the handle to set their order</span>
						</div>

						<DragDropContext onDragEnd={handleDragEnd}>
							<Droppable droppableId="stations">
								{(dropProvided) => (
									<div
										ref={dropProvided.innerRef}
										{...dropProvided.droppableProps}
										className="mt-6 hidden overflow-hidden rounded-2xl border bg-card shadow-sm md:block"
									>
										<div className="grid grid-cols-[minmax(0,3fr)_minmax(150px,1fr)_minmax(170px,1fr)] items-center bg-muted/60 px-6 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
											<span>Station name</span>
											<span className="text-center">Status</span>
											<span className="text-center">Actions</span>
										</div>

										{paginatedStations.map((station, index) => (
											<Draggable key={station.id} draggableId={station.id!} index={index}>
												{(dragProvided, snapshot) => (
													<div
														ref={dragProvided.innerRef}
														{...dragProvided.draggableProps}
														className={`grid min-h-20 grid-cols-[minmax(0,3fr)_minmax(150px,1fr)_minmax(170px,1fr)] items-center border-t px-6 text-base transition-colors ${
															snapshot.isDragging ? 'bg-card shadow-lg' : 'hover:bg-muted/40'
														}`}
													>
														<div className="flex min-w-0 items-center gap-3">
															<Tooltip>
																<TooltipTrigger asChild>
																	<button
																		type="button"
																		className="cursor-grab rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground active:cursor-grabbing"
																		aria-label={`Reorder ${station.stationName}`}
																		{...dragProvided.dragHandleProps}
																	>
																		<SortIcon className="size-5" aria-hidden="true" />
																	</button>
																</TooltipTrigger>
																<TooltipContent>Drag to reorder</TooltipContent>
															</Tooltip>
															<Link
																href={`/accounts/${accountId}/locations/${locationId}/stations/${station.id}`}
																className="group flex min-w-0 items-center gap-3 font-semibold text-foreground transition-colors hover:text-chart-3"
															>
																<span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-chart-3/10 text-chart-3 transition-colors group-hover:bg-chart-3 group-hover:text-white">
																	<StationIcon className="size-5" aria-hidden="true" />
																</span>
																<span className="min-w-0">
																	<span className="block truncate">{station.stationName}</span>
																	<span className="block text-xs font-normal text-muted-foreground">
																		Open to manage line-check items
																	</span>
																</span>
																<ChevronRight className="size-4 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" aria-hidden="true" />
															</Link>
														</div>

														<div className="flex flex-col items-center gap-1.5">
															<StatusSwitchOrBadge
																entity={{ id: station.id!, active: station.stationActive }}
																getLabel={() => `Station: ${station.stationName}`}
																onToggle={handleToggleActive}
																canToggle={canManage}
															/>
															{canManage && <span className="text-xs font-medium text-muted-foreground">{station.stationActive ? 'Active' : 'Inactive'}</span>}
														</div>

														<div className="flex items-center justify-center gap-1">
															{canManage ? (
																<StationActions
																	station={station}
																	stations={stations}
																	locations={locations}
																	accountId={accountId}
																	locationId={locationId}
																	userId={currentUserId}
																	onUpdate={setStations}
																	onClone={refreshStations}
																	onDelete={handleDeleteStation}
																/>
															) : (
																<span className="text-sm text-muted-foreground">View only</span>
															)}
														</div>
													</div>
												)}
											</Draggable>
										))}
										{dropProvided.placeholder}
										{paginatedStations.length === 0 && <EmptyState searchTerm={searchTerm} />}
									</div>
								)}
							</Droppable>
						</DragDropContext>

						<div className="mt-6 space-y-4 md:hidden">
							{paginatedStations.map((station) => (
								<Card key={station.id} className="gap-0 overflow-hidden py-0 shadow-sm">
									<Link
										href={`/accounts/${accountId}/locations/${locationId}/stations/${station.id}`}
										className="group flex items-center justify-between gap-4 p-5 transition-colors hover:bg-chart-3/10"
									>
										<div className="flex min-w-0 items-center gap-3">
											<span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-chart-3/10 text-chart-3 transition-colors group-hover:bg-chart-3 group-hover:text-white">
												<StationIcon className="size-5" aria-hidden="true" />
											</span>
											<div className="min-w-0">
												<p className="truncate font-semibold transition-colors group-hover:text-chart-3">{station.stationName}</p>
												<p className="mt-1 text-xs text-muted-foreground">
													Open to manage line-check items
												</p>
											</div>
										</div>
										<ChevronRight className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-chart-3" aria-hidden="true" />
									</Link>

									<div className="flex items-center justify-between border-t bg-muted/20 px-5 py-4">
										<span className="text-sm font-medium text-muted-foreground">Status</span>
										<div className="flex items-center gap-3">
											<StatusSwitchOrBadge
												entity={{ id: station.id!, active: station.stationActive }}
												getLabel={() => `Station: ${station.stationName}`}
												onToggle={handleToggleActive}
												canToggle={canManage}
											/>
											{canManage && <span className="text-sm font-medium">{station.stationActive ? 'Active' : 'Inactive'}</span>}
										</div>
									</div>

									{canManage && (
										<div className="flex items-center justify-between border-t px-5 py-2">
											<span className="text-sm font-medium text-muted-foreground">Manage station</span>
											<StationActions
												station={station}
												stations={stations}
												locations={locations}
												accountId={accountId}
												locationId={locationId}
												userId={currentUserId}
												onUpdate={setStations}
												onClone={refreshStations}
												onDelete={handleDeleteStation}
											/>
										</div>
									)}
								</Card>
							))}
							{paginatedStations.length === 0 && <EmptyState searchTerm={searchTerm} mobile />}
						</div>

						<Pagination
							currentPage={currentPage}
							setCurrentPage={setCurrentPage}
							pageSize={pageSize}
							setPageSize={setPageSize}
							totalItems={filteredStations.length}
						/>

						<StationHistoryFeed locationId={locationId} currentUser={currentUser} />
					</div>
				</div>
			</section>
		</main>
	);
};

type StationActionsProps = {
	station: StationDto;
	stations: StationDto[];
	locations: Locations[];
	accountId: string;
	locationId: string;
	userId: string;
	onUpdate: React.Dispatch<React.SetStateAction<StationDto[]>>;
	onClone: () => Promise<void>;
	onDelete: (stationId: string) => Promise<void>;
};

function StationActions({
	station,
	stations,
	locations,
	accountId,
	locationId,
	userId,
	onUpdate,
	onClone,
	onDelete,
}: StationActionsProps) {
	return (
		<div className="flex items-center gap-1">
			<EditStationDialog
				currentUserId={userId}
				station={station}
				stations={stations}
				onUpdate={(id, name) =>
					onUpdate((previous) =>
						previous.map((existing) =>
							existing.id === id ? { ...existing, stationName: name } : existing,
						),
					)
				}
			/>
			{station.id && (
				<CloneStationDialog
					stationId={station.id}
					currentLocationId={locationId}
					currentAccountId={accountId}
					userId={userId}
					locations={locations}
					onCloneSuccess={async () => {
						try {
							await onClone();
						} catch (error) {
							toast.error(error instanceof Error ? error.message : 'Failed to refresh stations.');
						}
					}}
				/>
			)}
			{station.id && (
				<DeleteConfirmButton
					item={{ id: station.id }}
					entityLabel="Station"
					onDelete={onDelete}
					getItemName={() => station.stationName}
				/>
			)}
		</div>
	);
}

function EmptyState({ searchTerm, mobile = false }: { searchTerm: string; mobile?: boolean }) {
	return (
		<div className={`${mobile ? '' : 'border-t'} px-6 py-14 text-center text-sm text-muted-foreground`}>
			{searchTerm ? `No stations match “${searchTerm}”.` : 'No stations have been created yet.'}
		</div>
	);
}

export default LocationStationsPage;
