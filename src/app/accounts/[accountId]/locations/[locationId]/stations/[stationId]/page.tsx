// 'use client';

// import { getAccountsForUser } from '@/app/api/accountApi';
// import {
// 	deleteItem,
// 	getItemsByStation,
// 	toggleItemActive,
// } from '@/app/api/item.Api';
// import { getUserLocationAccess } from '@/app/api/locationApi';
// import { getStationsByLocation } from '@/app/api/stationApi';
// import { AppRole, Item, Locations, Station, User } from '@/app/types';
// import LocationNav from '@/components/navBar/LocationNav';
// import Spinner from '@/components/spinner/Spinner';
// import CreateItemDialog from '@/components/tableComponents/CreateItemDialog';
// import { DeleteConfirmButton } from '@/components/tableComponents/DeleteConfirmButton';
// import { EditItemDialog } from '@/components/tableComponents/EditItemDialog';
// import { Pagination } from '@/components/tableComponents/Pagination';
// import { ReusableTable } from '@/components/tableComponents/ReusableTableProps';
// import { StatusSwitchOrBadge } from '@/components/tableComponents/StatusSwitchOrBadge';
// import { UserControls } from '@/components/tableComponents/UserControls';
// import { Button } from '@/components/ui/button';
// import { useSession } from 'next-auth/react';
// import { useParams, useRouter } from 'next/navigation';
// import React, { useEffect, useState } from 'react';
// import { toast } from 'sonner';


// const StationPage = () => {
// 	const { data: session, status } = useSession();
// 	const router = useRouter();
// 	const params = useParams<{
// 		accountId: string;
// 		locationId: string;
// 		stationId: string;
// 	}>();
// 	const accountIdParam = params.accountId;
// 	const locationIdParam = params.locationId;
// 	const stationIdParam = params.stationId;

// 	//set state
// 	const [loadingAccess, setLoadingAccess] = useState(true);
// 	const [hasAccess, setHasAccess] = useState(false);
// 	const [accountName, setAccountName] = useState<string | null>(null);
// 	const [accountImage, setAccountImage] = useState<string | null>(null);
// 	const [locationName, setLocationName] = useState<string | null>(null);
// 	const [locations, setLocations] = useState<Locations[]>([]);
// 	const [stations, setStations] = useState<Station[]>([]);
// 	const [items, setItems] = useState<Item[]>([]);
// 	const [stationName, setStationName] = useState<string | null>(null);
// 	const [currentLocation, setCurrentLocation] = useState<Locations | null>(
// 		null
// 	);
// 	const [showActiveOnly, setShowActiveOnly] = useState(false);
// 	const [searchTerm, setSearchTerm] = useState('');
// 	const [currentPage, setCurrentPage] = useState(1);
// 	const [pageSize, setPageSize] = useState(10);

// 	const currentUser = session?.user as User | undefined;
// 	const sessionUserRole = session?.user?.appRole;
// 	const canToggle = currentUser?.appRole === AppRole.MANAGER;

// 	useEffect(() => {
// 		if (
// 			status !== 'authenticated' ||
// 			!session?.user?.id ||
// 			!accountIdParam ||
// 			!locationIdParam ||
// 			!stationIdParam
// 		)
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
// 				const locationRes = await getUserLocationAccess(session.user.id);
// 				const fetchedLocations = locationRes.data ?? [];
// 				setLocations(fetchedLocations);

// 				const location = fetchedLocations.find(
// 					(loc) => loc.id?.toString() === locationIdParam
// 				);
// 				if (!location) {
// 					toast.error('You do not have access to this location.');
// 					router.push(`/accounts/${accountIdParam}/locations`);
// 					return;
// 				}

// 				//fetch stations
// 				const stationRes = await getStationsByLocation(locationIdParam);
// 				const fetchedStations = stationRes.data ?? [];
// 				setStations(fetchedStations);

// 				const station = fetchedStations.find(
// 					(sta) => sta.id?.toString() === stationIdParam
// 				);
// 				if (!station) return;

// 				//fetch items
// 				const itemsRes = await getItemsByStation(stationIdParam);
// 				const fetchedItems = itemsRes.data ?? [];
// 				setItems(fetchedItems);

// 				setHasAccess(true);
// 				setAccountName(account.accountName);
// 				setAccountImage(account.imageBase64 || null);
// 				setStationName(station.stationName);
// 				setCurrentLocation(location);
// 			} catch (err) {
// 				toast.error('You do not have access to this location.');
// 				router.push('/accounts');
// 			} finally {
// 				setLoadingAccess(false);
// 			}
// 		};

// 		verifyAccess();
// 	}, [status, session, accountIdParam, locationIdParam, hasAccess, router]);

// 	//toggle  active
// 	const handleToggleActive = async (itemId: string, checked: boolean) => {
// 		setItems((prev) =>
// 			prev.map(
// 				(item): Item =>
// 					item.id === itemId ? { ...item, itemActive: checked } : item
// 			)
// 		);

// 		try {
// 			await toggleItemActive(stationIdParam, itemId, checked);
// 		} catch (error: any) {
// 			setItems((prev) =>
// 				prev.map(
// 					(item): Item =>
// 						item.id === itemId ? { ...item, itemActive: !checked } : item
// 				)
// 			);
// 			toast.error(`Failed to update item status: ` + (error?.message || error));
// 		}
// 	};

// 	//pagination
// 	// Load pagination settings from localStorage safely
// 	useEffect(() => {
// 		if (typeof window !== 'undefined') {
// 			const storedPage =
// 				Number(localStorage.getItem('stationCurrentPage')) || 1;
// 			const storedPageSize =
// 				Number(localStorage.getItem('stationPageSize')) || 10;
// 			setCurrentPage(storedPage);
// 			setPageSize(storedPageSize);
// 		}
// 	}, []);

// 	// Persist pagination to localStorage
// 	useEffect(() => {
// 		if (typeof window !== 'undefined') {
// 			localStorage.setItem('stationCurrentPage', String(currentPage));
// 		}
// 	}, [currentPage]);

// 	useEffect(() => {
// 		if (typeof window !== 'undefined') {
// 			localStorage.setItem('itemPageSize', String(pageSize));
// 		}
// 	}, [pageSize]);

// 	//pagination
// 	useEffect(() => {
// 		localStorage.setItem('itemCurrentPage', String(currentPage));
// 	}, [currentPage]);

// 	useEffect(() => {
// 		localStorage.setItem('itemPageSize', String(pageSize));
// 		setCurrentPage(1); // reset to first page when pageSize changes
// 	}, [pageSize]);

// 	//handel creaet item
// 	const handleItemCreated = (newItem: Item) => {
// 		setItems((prev) => [...prev, newItem]);
// 	};

// 	//toggle showing only active users and search
// 	const filteredItems = items.filter((item) => {
// 		const itemName = item.itemName ?? '';

// 		const matchesSearch = itemName
// 			.toLowerCase()
// 			.includes(searchTerm.toLowerCase());

// 		const matchesActive = showActiveOnly ? item.itemActive : true;

// 		return matchesActive && matchesSearch;
// 	});

// 	// slice for current page
// 	const paginatedItems = filteredItems.slice(
// 		(currentPage - 1) * pageSize,
// 		currentPage * pageSize
// 	);

// 	if (status === 'loading' || loadingAccess) {
// 		return (
// 			<div className="flex justify-center items-center py-40 text-chart-3 text-xl">
// 				<Spinner />
// 				<span className="ml-4">Loading items…</span>
// 			</div>
// 		);
// 	}

// 	return (
// 		<main className="flex">
// 			<div className="w-1/6 border-r-2 bg-ring h-screen">
// 				<LocationNav
// 					accountName={accountName}
// 					accountImage={accountImage}
// 					accountId={accountIdParam}
// 					locationId={locationIdParam}
// 					sessionUserRole={sessionUserRole}
// 				/>
// 			</div>
// 			<div className="p-4 flex-1">
// 				<div className="flex justify-between items-center">
// 					<div>
// 						<h1 className="text-3xl font-bold mb-4">
// 							{currentLocation?.locationName}
// 						</h1>
// 					</div>
// 					<div>
// 						<p className="text-2xl">Items on Station {stationName}:</p>
// 					</div>
// 					<div>
// 						<CreateItemDialog
// 							onItemCreated={handleItemCreated}
// 							stationId={stationIdParam}
// 						/>
// 					</div>
// 				</div>
// 				{items.length === 0 ? (
// 					<div>
// 						<p className="text-destructive text-2xl">No items found.</p>
// 					</div>
// 				) : (
// 					<div>
// 						<div className="w-full md:w-3/4 mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 mt-4">
// 							<UserControls
// 								showActiveOnly={showActiveOnly}
// 								setShowActiveOnly={setShowActiveOnly}
// 								searchTerm={searchTerm}
// 								setSearchTerm={setSearchTerm}
// 							/>
// 						</div>
// 						<div className="hidden md:block bg-accent p-4 rounded-2xl text-chart-3 shadow-md w-full md:w-3/4 mx-auto mt-8">
// 							<ReusableTable<Item>
// 								data={paginatedItems}
// 								rowKey={(item) => item.id!}
// 								columns={[
// 									{
// 										header: 'Item Name',
// 										render: (item) => item.itemName,
// 									},
// 									{
// 										header: 'Status',
// 										className: 'text-center',
// 										render: (item) => (
// 											<StatusSwitchOrBadge
// 												entity={{
// 													id: item.id!,
// 													active: item.itemActive,
// 												}}
// 												getLabel={() => `item: ${item.itemName}`}
// 												onToggle={handleToggleActive}
// 												canToggle={canToggle}
// 											/>
// 										),
// 									},
// 									{
// 										header: 'Actions',
// 										className: 'text-center',
// 										render: (item) =>
// 											sessionUserRole === 'MANAGER' ? (
// 												<div className="flex justify-center gap-4 items-center">
// 													<EditItemDialog
													
// 														item={item}
// 														items={items}
// 														stationId={stationIdParam}
// 														onUpdate={(id, itemName, isTempTaken, isCheckMark, notes) => {
// 															setItems((prev) =>
// 																prev.map((item) =>
// 																	item.id === id ?
// 																		{
// 																			...item,
// 																			itemName,
// 																			isTempTaken,
// 																			isCheckMark,
// 																			notes
// 																		} : item
// 																)
// 															);
// 														}}
// 													/>

// 													{item.id && (
// 														<DeleteConfirmButton
// 															item={{
// 																id: item.id,
// 																stationId: stationIdParam,
// 															}}
// 															entityLabel="Station"
// 															onDelete={async (id) => {
// 																await deleteItem(stationIdParam, id);
// 																setItems((prev) =>
// 																	prev.filter((item) => item.id !== id)
// 																);
// 															}}
// 															getItemName={() => item.itemName}
// 														/>
// 													)}
// 												</div>
// 											) : (
// 												<span className="text-ring">No Actions</span>
// 											),
// 									},
// 								]}
// 							/>
// 						</div>
// 					</div>
// 				)}
// 				{/* pagination page size selector */}
// 				<div className="w-full md:w-3/4 mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 mt-4">
// 					<Pagination
// 						currentPage={currentPage}
// 						setCurrentPage={setCurrentPage}
// 						pageSize={pageSize}
// 						setPageSize={setPageSize}
// 						totalItems={locations.length}
// 					/>
// 				</div>
// 			</div>
// 		</main>
// 	);
// };

// export default StationPage;

'use client';

import { getAccountsForUser } from '@/app/api/accountApi';
import {
	deleteItem,
	getItemsByStation,
	toggleItemActive,
	reorderItems,
} from '@/app/api/item.Api';
import {
	DragDropContext,
	Droppable,
	Draggable,
	DropResult,
} from '@hello-pangea/dnd';
import { getUserLocationAccess } from '@/app/api/locationApi';
import { getStationsByLocation } from '@/app/api/stationApi';
import { AppRole, Item, Locations, Station, User } from '@/app/types';
import LocationNav from '@/components/navBar/LocationNav';
import Spinner from '@/components/spinner/Spinner';
import CreateItemDialog from '@/components/tableComponents/CreateItemDialog';
import { DeleteConfirmButton } from '@/components/tableComponents/DeleteConfirmButton';
import { EditItemDialog } from '@/components/tableComponents/EditItemDialog';
import { Pagination } from '@/components/tableComponents/Pagination';
import { StatusSwitchOrBadge } from '@/components/tableComponents/StatusSwitchOrBadge';
import { UserControls } from '@/components/tableComponents/UserControls';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Icons } from '@/lib/icon';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';


const StationPage = () => {

	//icon
	const UpDownIcon = Icons.sort;

	//session
	const { data: session, status } = useSession();
	const router = useRouter();
	const params = useParams<{
		accountId: string;
		locationId: string;
		stationId: string;
	}>();
	const accountIdParam = params.accountId;
	const locationIdParam = params.locationId;
	const stationIdParam = params.stationId;

	// state
	const [loadingAccess, setLoadingAccess] = useState(true);
	const [hasAccess, setHasAccess] = useState(false);
	const [accountName, setAccountName] = useState<string | null>(null);
	const [accountImage, setAccountImage] = useState<string | null>(null);
	const [locations, setLocations] = useState<Locations[]>([]);
	const [stations, setStations] = useState<Station[]>([]);
	const [items, setItems] = useState<Item[]>([]);
	const [stationName, setStationName] = useState<string | null>(null);
	const [currentLocation, setCurrentLocation] = useState<Locations | null>(
		null
	);
	const [showActiveOnly, setShowActiveOnly] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);

	const currentUser = session?.user as User | undefined;
	const sessionUserRole = session?.user?.appRole;
	const canToggle = currentUser?.appRole === AppRole.MANAGER;

	// verify access & fetch items
	useEffect(() => {
		if (
			status !== 'authenticated' ||
			!session?.user?.id ||
			!accountIdParam ||
			!locationIdParam ||
			!stationIdParam
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
				const fetchedLocations = locationRes.data ?? [];
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
				const fetchedStations = stationRes.data ?? [];
				setStations(fetchedStations);

				const station = fetchedStations.find(
					(sta) => sta.id?.toString() === stationIdParam
				);
				if (!station) return;

				const itemsRes = await getItemsByStation(stationIdParam);
				const fetchedItems = itemsRes.data ?? [];

				// sort by saved sortOrder
				fetchedItems.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

				setItems(fetchedItems);
				setHasAccess(true);
				setAccountName(account.accountName);
				setAccountImage(account.imageBase64 || null);
				setStationName(station.stationName);
				setCurrentLocation(location);
			} catch (err) {
				toast.error('You do not have access to this location.');
				router.push('/accounts');
			} finally {
				setLoadingAccess(false);
			}
		};

		verifyAccess();
	}, [status, session, accountIdParam, locationIdParam, hasAccess, router]);

	// toggle active
	const handleToggleActive = async (itemId: string, checked: boolean) => {
		setItems((prev) =>
			prev.map((item) =>
				item.id === itemId ? { ...item, itemActive: checked } : item
			)
		);

		try {
			await toggleItemActive(stationIdParam, itemId, checked);
		} catch (error: any) {
			setItems((prev) =>
				prev.map((item) =>
					item.id === itemId ? { ...item, itemActive: !checked } : item
				)
			);
			toast.error(`Failed to update item status: ${error?.message || error}`);
		}
	};

	// handle item created
	const handleItemCreated = (newItem: Item) => {
		setItems((prev) => [...prev, newItem]);
	};

	// filtered & paginated
	const filteredItems = items.filter((item) => {
		const itemName = item.itemName ?? '';
		const matchesSearch = itemName
			.toLowerCase()
			.includes(searchTerm.toLowerCase());
		const matchesActive = showActiveOnly ? item.itemActive : true;
		return matchesActive && matchesSearch;
	});

	const paginatedItems = filteredItems.slice(
		(currentPage - 1) * pageSize,
		currentPage * pageSize
	);

	// drag & drop
	const handleDragEnd = async (result: DropResult) => {
		if (!result.destination) return;
		const sourceIndex = result.source.index;
		const destIndex = result.destination.index;

		const updatedItems = Array.from(items);
		const [removed] = updatedItems.splice(sourceIndex, 1);
		updatedItems.splice(destIndex, 0, removed);

		setItems(updatedItems);

		try {
			const itemIdsInOrder = updatedItems.map((i) => i.id!) as string[];
			await reorderItems(stationIdParam, itemIdsInOrder);
		} catch (err) {
			toast.error('Failed to save new item order.');
		}
	};

	if (status === 'loading' || loadingAccess) {
		return (
			<div className="flex justify-center items-center py-40 text-chart-3 text-xl">
				<Spinner />
				<span className="ml-4">Loading items…</span>
			</div>
		);
	}

	return (
		<main className="flex">
			<div className="w-1/6 border-r-2 bg-ring h-screen">
				<LocationNav
					accountName={accountName}
					accountImage={accountImage}
					accountId={accountIdParam}
					locationId={locationIdParam}
					sessionUserRole={sessionUserRole}
				/>
			</div>
			<div className="p-4 flex-1">
				<div className="flex justify-between items-center">
					<h1 className="text-3xl font-bold mb-4">
						{currentLocation?.locationName}
					</h1>
					<p className="text-4xl">Items on <span className='text-chart-3 italic'>{ stationName}</span> Station</p>
					<CreateItemDialog
						onItemCreated={handleItemCreated}
						stationId={stationIdParam}
					/>
				</div>

				<div className="w-full md:w-3/4 mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 mt-4">
					<UserControls
						showActiveOnly={showActiveOnly}
						setShowActiveOnly={setShowActiveOnly}
						searchTerm={searchTerm}
						setSearchTerm={setSearchTerm}
					/>
				</div>

				<DragDropContext onDragEnd={handleDragEnd}>
					<Droppable droppableId="items">
						{(provided) => (
							<div
								className="hidden md:block bg-accent p-4 rounded-2xl text-chart-3 shadow-md w-full md:w-3/4 mx-auto mt-8"
								{...provided.droppableProps}
								ref={provided.innerRef}
							>
								{/* Table headers */}
								<div className="flex justify-between items-center font-bold text-lg px-2 py-1 border-b border-accent mb-2">
									<span className="flex items-center gap-2 w-1/2">
										<UpDownIcon className="w-5 h-5" />
										Item Name
									</span>
									<span className="w-1/4 text-center">Status</span>
									<span className="w-1/4 text-center">Actions</span>
								</div>

								{/* Draggable rows */}
								{paginatedItems.map((item, index) => (
									<Draggable key={item.id} draggableId={item.id!} index={index}>
										{(provided) => (
											<div
												className="flex justify-between items-center p-2 mb-2 bg-background rounded-2xl"
												ref={provided.innerRef}
												{...provided.draggableProps}
												{...provided.dragHandleProps}
											>
												{/* Icon + Name */}
												<div className="flex items-center gap-2 w-1/2">
													<Tooltip>
														<TooltipTrigger>
															<UpDownIcon className="w-5 h-5" />
														</TooltipTrigger>
														<TooltipContent>
															<p>Drag and Drop items to sort them.</p>
														</TooltipContent>
													</Tooltip>

													<span>{item.itemName}</span>
												</div>

												{/* Status */}
												<div className="w-1/4 text-center">
													<StatusSwitchOrBadge
														entity={{ id: item.id!, active: item.itemActive }}
														getLabel={() => `item: ${item.itemName}`}
														onToggle={handleToggleActive}
														canToggle={canToggle}
													/>
												</div>

												{/* Actions */}
												<div className="w-1/4 flex justify-center gap-2">
													{sessionUserRole === AppRole.MANAGER && (
														<>
															<EditItemDialog
																item={item}
																items={items}
																stationId={stationIdParam}
																onUpdate={(
																	id,
																	itemName,
																	isTempTaken,
																	isCheckMark,
																	notes
																) =>
																	setItems((prev) =>
																		prev.map((it) =>
																			it.id === id
																				? {
																						...it,
																						itemName,
																						isTempTaken,
																						isCheckMark,
																						notes,
																				  }
																				: it
																		)
																	)
																}
															/>
															<DeleteConfirmButton
																item={{
																	id: item.id,
																	stationId: stationIdParam,
																}}
																entityLabel="Station"
																onDelete={async (id) => {
																	await deleteItem(stationIdParam, id);
																	setItems((prev) =>
																		prev.filter((it) => it.id !== id)
																	);
																}}
																getItemName={() => item.itemName}
															/>
														</>
													)}
												</div>
											</div>
										)}
									</Draggable>
								))}

								{provided.placeholder}
							</div>
						)}
					</Droppable>
				</DragDropContext>

				<div className="w-full md:w-3/4 mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 mt-4">
					<Pagination
						currentPage={currentPage}
						setCurrentPage={setCurrentPage}
						pageSize={pageSize}
						setPageSize={setPageSize}
						totalItems={items.length}
					/>
				</div>
			</div>
		</main>
	);
};

export default StationPage;
