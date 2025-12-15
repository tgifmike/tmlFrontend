'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import {
	DragDropContext,
	Droppable,
	Draggable,
	DropResult,
} from '@hello-pangea/dnd';
import {
	createOption,
	deleteOption,
	getOptions,
	reorderOptions,
	toggleOptionActive,
} from '@/app/api/optionsApi';
import {
	OptionEntity,
	OptionType,
	AppRole,
	User,
	Locations,
	OptionTypeLabels,
} from '@/app/types';
import { Icons } from '@/lib/icon';
import { EditOptionDialog } from '@/components/options/EditOptionDialog';
import { DeleteConfirmButton } from '@/components/tableComponents/DeleteConfirmButton';
import Spinner from '@/components/spinner/Spinner';
import { CreateOptionDialog } from '@/components/options/CreateOptionDialog';
import { getAccountsForUser } from '@/app/api/accountApi';
import router from 'next/router';
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '@/components/ui/accordion';
import { Switch } from '@/components/ui/switch';
import LocationNav from '@/components/navBar/LocationNav';
import MobileDrawerNav from '@/components/navBar/MoibileDrawerNav';
import { getUserLocationAccess } from '@/app/api/locationApi';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import clsx from 'clsx';

import OptionAuditFeed from '@/components/options/OptionAuditFeed';

// const OptionTypeLabels: Record<OptionType, string> = {
// 	[OptionType.TOOL]: 'Tool',
// 	[OptionType.SHELF_LIFE]: 'Shelf Life',
// 	[OptionType.PAN_SIZE]: 'Pan Size',
// 	[OptionType.PORTION_SIZE]: 'Portion Size',
// };

const OptionsPage = () => {
	const { data: session, status } = useSession();
	
	const params = useParams<{ accountId: string; locationId: string }>();
	const accountIdParam = params.accountId;
	const locationIdParam = params.locationId;

	const [accountImage, setAccountImage] = useState<string | null>(null);
	const [loadingAccess, setLoadingAccess] = useState(true);
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [hasAccess, setHasAccess] = useState(false);
	const [locations, setLocations] = useState<Locations[]>([]);
	const [accountName, setAccountName] = useState<string | null>(null);
	const [currentLocation, setCurrentLocation] = useState<Locations | null>(
		null
	);
	const [options, setOptions] = useState<OptionEntity[]>([]);
	const [showActiveOnly, setShowActiveOnly] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');
	const [expandedTypes, setExpandedTypes] = useState<Set<OptionType>>(
		new Set()
	);
	const [deletingOptionIds, setDeletingOptionIds] = useState<Set<string>>(
		new Set()
	);

	const currentUser = session?.user as User | undefined;
	const canToggle = currentUser?.appRole === AppRole.MANAGER;
	const UpDownIcon = Icons.sort;
	const LogIcon = Icons.log;

	// Fetch options and verify access
	useEffect(() => {
		if (status !== 'authenticated' || !accountIdParam || !currentUser?.id)
			return;

		const verifyAccess = async () => {
			try {
				const accountsRes = await getAccountsForUser(session.user.id);
				const account = accountsRes.data?.find(
					(acc) => acc.id?.toString() === accountIdParam
				);
				if (!account) {
					toast.error('Access denied to this account.');
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

				const res = await getOptions(accountIdParam);
				if (!res.data) {
					toast.error('Failed to load options.');
					return;
				}

				const sorted = res.data.sort(
					(a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
				);
				setOptions(sorted);
				setCurrentLocation(location);
				setAccountImage(account.imageBase64 || null);
				setHasAccess(true);
				setAccountName(account.accountName);
			} catch (err) {
				toast.error('You do not have access to this account.');
				router.push('/accounts');
			} finally {
				setLoadingAccess(false);
			}
		};

		verifyAccess();
	}, [status, session, accountIdParam, router]);

	// Toggle active status
	const handleToggleActive = async (optionId: string, checked: boolean) => {
		setOptions((prev) =>
			prev.map((opt) =>
				opt.id === optionId ? { ...opt, optionActive: checked } : opt
			)
		);

		try {
			if (!currentUser?.id) throw new Error('User not authenticated');
			await toggleOptionActive(optionId, checked, currentUser.id);
		} catch (err: any) {
			setOptions((prev) =>
				prev.map((opt) =>
					opt.id === optionId ? { ...opt, optionActive: !checked } : opt
				)
			);
			toast.error(
				`Failed to update option status: ${
					err?.response?.data?.message || err.message
				}`
			);
		}
	};

	// Save or update option
	const handleOptionSave = (savedOption: OptionEntity) => {
		setOptions((prev) =>
			prev.some((o) => o.id === savedOption.id)
				? prev.map((o) => (o.id === savedOption.id ? savedOption : o))
				: [...prev, savedOption]
		);
	};

	// Delete option
	const handleOptionDelete = async (optionId: string) => {
		if (!currentUser?.id) return;

		try {
			setDeletingOptionIds((prev) => new Set(prev).add(optionId));
			await deleteOption(optionId, currentUser.id);
			setOptions((prev) => prev.filter((o) => o.id !== optionId));
			toast.success('Option deleted successfully.');
		} catch (err: any) {
			toast.error(
				`Failed to delete option: ${
					err?.response?.data?.message || err.message
				}`
			);
		} finally {
			setDeletingOptionIds((prev) => {
				const newSet = new Set(prev);
				newSet.delete(optionId);
				return newSet;
			});
		}
	};



	const handleDragEnd =
		(optionType: OptionType) => async (result: DropResult) => {
			if (!result.destination) return;

			const typeOptions = options.filter((o) => o.optionType === optionType);
			const updatedTypeOptions = [...typeOptions];
			const [moved] = updatedTypeOptions.splice(result.source.index, 1);
			updatedTypeOptions.splice(result.destination.index, 0, moved);

			// Update sortOrder according to new array order
			const updatedWithSortOrder = updatedTypeOptions.map((o, index) => ({
				...o,
				sortOrder: index,
			}));

			const newOptions = [
				...options.filter((o) => o.optionType !== optionType),
				...updatedWithSortOrder,
			].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

			setOptions(newOptions);

			try {
				if (!accountIdParam || !currentUser?.id)
					throw new Error('Missing params');
				const orderedIds = updatedWithSortOrder.map((o) => o.id);
				await reorderOptions(
					accountIdParam,
					optionType,
					orderedIds,
					currentUser.id
				);
			} catch {
				toast.error('Failed to save new order.');
			}
		};


	if (status === 'loading' || loadingAccess) {
		return (
			<div className="flex justify-center items-center py-40 text-xl">
				<Spinner />
				<span className="ml-4">Loading options…</span>
			</div>
		);
	}

	const filteredOptions = options.filter(
		(o) =>
			(!showActiveOnly || o.optionActive) &&
			(!searchTerm ||
				o.optionName.toLowerCase().includes(searchTerm.toLowerCase()))
	);

	const optionTypes = Object.values(OptionType);

	const expandAll = () => setExpandedTypes(new Set(optionTypes));
	const collapseAll = () => setExpandedTypes(new Set());

	const highlightText = (text: string) => {
		if (!searchTerm) return text;
		const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
		return parts.map((part, i) =>
			part.toLowerCase() === searchTerm.toLowerCase() ? (
				<span key={i} className="bg-yellow-200">
					{part}
				</span>
			) : (
				part
			)
		);
	};

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

					<h1 className="text-3xl font-bold">
						{accountName ? `${accountName} Options` : 'Options'}
					</h1>
					<div className="flex flex-wrap gap-2 items-center">
						{currentUser && (
							<CreateOptionDialog
								accountId={accountIdParam}
								currentUser={currentUser}
								onOptionCreated={handleOptionSave}
							/>
						)}
					</div>
				</header>

				{/* Controls */}
				<div className="flex flex-wrap items-center justify-between gap-4 w-full pt-4 pb-8 px-8">
					<div className="flex items-center gap-4">
						<Input
							type="text"
							placeholder="Search options..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="w-40 md:w-64"
						/>
						<Button onClick={() => setSearchTerm('')}>Clear</Button>
					</div>

					<div className="flex items-center gap-2">
						<Switch
							checked={showActiveOnly}
							onCheckedChange={(checked) => setShowActiveOnly(Boolean(checked))}
						/>
						<span className="text-sm">Show Active Only</span>
					</div>

					<div className="flex items-center gap-2">
						<Button variant="outline" onClick={expandAll}>
							Expand All
						</Button>
						<Button variant="outline" onClick={collapseAll}>
							Collapse All
						</Button>
					</div>
				</div>

				<Accordion
					type="multiple"
					value={[...expandedTypes]}
					onValueChange={(values) =>
						setExpandedTypes(new Set(values as OptionType[]))
					}
					className="space-y-4"
				>
					{optionTypes.map((type) => {
						const typeOptions = filteredOptions.filter(
							(o) => o.optionType === type
						);
						if (!typeOptions.length) return null;

						return (
							<AccordionItem key={type} value={type}>
								<AccordionTrigger className="text-2xl font-semibold px-7 [&>svg]:w-8 [&>svg]:h-8">
									{OptionTypeLabels[type]}
								</AccordionTrigger>
								<AccordionContent className="max-h-[400px] overflow-y-auto">
									<DragDropContext onDragEnd={handleDragEnd(type)}>
										<Droppable droppableId={type}>
											{(provided) => (
												<div
													ref={provided.innerRef}
													{...provided.droppableProps}
												>
													<div className="flex justify-between items-center font-bold text-lg px-2 py-1 border-b mb-2 sticky top-0 bg-accent z-10">
														<span className="flex items-center gap-2 w-1/2">
															<UpDownIcon className="w-5 h-5" /> Option Name
														</span>
														<span className="w-1/4 text-center">Status</span>
														<span className="w-1/4 text-center">Actions</span>
													</div>

													{typeOptions.map((option, index) => (
														<Draggable
															key={option.id}
															draggableId={option.id}
															index={index}
														>
															{(provided) => (
																<div
																	ref={provided.innerRef}
																	{...provided.draggableProps}
																	{...provided.dragHandleProps}
																	className={clsx(
																		'flex justify-between items-center p-2 mb-2 bg-background rounded-2xl transition-opacity',
																		deletingOptionIds.has(option.id) &&
																			'opacity-50'
																	)}
																>
																	<span className="w-1/2 flex items-center gap-2 text-chart-3 text-xl font-medium pl-4">
																		<UpDownIcon className="w-5 h-5" />
																		{highlightText(option.optionName)}
																	</span>
																	<div className="w-1/4 text-center">
																		<Switch
																			checked={option.optionActive}
																			onCheckedChange={(checked) =>
																				canToggle
																					? handleToggleActive(
																							option.id,
																							Boolean(checked)
																					  )
																					: undefined
																			}
																			disabled={
																				!canToggle ||
																				deletingOptionIds.has(option.id)
																			}
																		/>
																	</div>
																	<div className="w-1/4 flex justify-center items-center gap-2">
																		<EditOptionDialog
																			option={option}
																			onOptionUpdated={handleOptionSave}
																			currentUser={currentUser}
																		/>
																		<DeleteConfirmButton
																			item={{ id: option.id }}
																			entityLabel="Option"
																			onDelete={handleOptionDelete}
																			getItemName={() => option.optionName}
																			//loading={deletingOptionIds.has(option.id)}
																		/>
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
								</AccordionContent>
							</AccordionItem>
						);
					})}
				</Accordion>

				{/* Audit Table */}
				{canToggle && (
					<section className="mt-12 px-4 pb-8">
						{/* <h2 className="text-2xl font-bold mb-4">Option Audit Log</h2> */}
						{/* <OptionAuditTable accountId={accountIdParam} currentUser={currentUser} /> */}
						<OptionAuditFeed
							accountId={accountIdParam}
							currentUser={currentUser}
						/>
					</section>
				)}
			</section>
		</main>
	);
};

export default OptionsPage;

