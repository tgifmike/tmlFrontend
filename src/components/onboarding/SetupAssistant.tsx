'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
	Bot,
	Building2,
	CheckCircle2,
	ChefHat,
	Circle,
	ExternalLink,
	ListChecks,
	MapPin,
	Minimize2,
	SlidersHorizontal,
	Tablet,
	Target,
	Thermometer,
	Users,
} from 'lucide-react';

import { getItemsByStation } from '@/app/api/item.Api';
import { getLocationsByAccountId } from '@/app/api/locationApi';
import { getOptions } from '@/app/api/optionsApi';
import { getStationsByLocation } from '@/app/api/stationApi';
import { getUsersForAccount } from '@/app/api/userApI';
import {
	addDefaultTemperatureCategories,
	getTemperatureCategories,
} from '@/app/api/temperatureCategoryApi';
import { OptionType, OptionTypeLabels } from '@/app/types';
import type {
	Account,
	Item,
	Locations,
	OptionEntity,
	StationDto,
	TemperatureCategory,
	User,
} from '@/app/types';
import { CreateOptionDialog } from '@/components/options/CreateOptionDialog';
import { InviteUserDialog } from '@/components/invite/InviteUserDialog';
import LineCheckSettingsForm from '@/components/locaitons/LineCheckSettingsForm';
import LocationBlueprintBuilder, {
	type BlueprintApplyResult,
} from '@/components/onboarding/LocationBlueprintBuilder';
import TemperatureCategorySettings from '@/components/settings/TemperatureCategorySettings';
import CreateItemDialog from '@/components/tableComponents/CreateItemDialog';
import CreateLocationDialog from '@/components/tableComponents/CreateLocationForm';
import CreateStationDialog from '@/components/tableComponents/CreateStationForm';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from '@/components/ui/sheet';

type SetupAssistantProps = {
	accounts: Account[];
	userId: string;
	userName?: string;
	canManage: boolean;
};

const SETUP_OPTION_TYPES = [
	OptionType.TOOL,
	OptionType.SHELF_LIFE,
	OptionType.PAN_SIZE,
	OptionType.PORTION_SIZE,
] as const;

type SetupSelection = {
	accountId?: string;
	locationId?: string;
	stationId?: string;
};

type OperationalReadiness = {
	temperatureReviewed: boolean;
	goalsConfirmed: boolean;
	accessConfirmed: boolean;
};

const emptyOperationalReadiness: OperationalReadiness = {
	temperatureReviewed: false,
	goalsConfirmed: false,
	accessConfirmed: false,
};

const getSetupSelectionKey = (userId: string) =>
	`manager-life:setup-selection:${userId}`;

const getSetupMinimizedKey = (userId: string) =>
	`manager-life:setup-minimized:${userId}`;

const getOperationalReadinessKey = (
	userId: string,
	accountId: string,
	locationId: string,
) => `manager-life:operational-readiness:${userId}:${accountId}:${locationId}`;

function readSetupSelection(userId: string): SetupSelection {
	if (typeof window === 'undefined') return {};

	try {
		return JSON.parse(
			window.localStorage.getItem(getSetupSelectionKey(userId)) ?? '{}',
		) as SetupSelection;
	} catch {
		return {};
	}
}

function writeSetupSelection(userId: string, selection: SetupSelection) {
	if (typeof window === 'undefined') return;
	window.localStorage.setItem(
		getSetupSelectionKey(userId),
		JSON.stringify(selection),
	);
}

function readOperationalReadiness(
	userId: string,
	accountId: string,
	locationId: string,
): OperationalReadiness {
	if (typeof window === 'undefined') return emptyOperationalReadiness;

	try {
		return {
			...emptyOperationalReadiness,
			...(JSON.parse(
				window.localStorage.getItem(
					getOperationalReadinessKey(userId, accountId, locationId),
				) ?? '{}',
			) as Partial<OperationalReadiness>),
		};
	} catch {
		return emptyOperationalReadiness;
	}
}

export default function SetupAssistant({
	accounts,
	userId,
	userName,
	canManage,
}: SetupAssistantProps) {
	const [open, setOpen] = useState(false);
	const [selectedAccountId, setSelectedAccountId] = useState('');
	const [selectedLocationId, setSelectedLocationId] = useState('');
	const [selectedStationId, setSelectedStationId] = useState('');
	const [locations, setLocations] = useState<Locations[]>([]);
	const [stations, setStations] = useState<StationDto[]>([]);
	const [items, setItems] = useState<Item[]>([]);
	const [options, setOptions] = useState<OptionEntity[]>([]);
	const [temperatureCategories, setTemperatureCategories] = useState<
		TemperatureCategory[]
	>([]);
	const [accountUsers, setAccountUsers] = useState<User[]>([]);
	const [loadingLocations, setLoadingLocations] = useState(false);
	const [loadingStations, setLoadingStations] = useState(false);
	const [loadingItems, setLoadingItems] = useState(false);
	const [loadingAccountUsers, setLoadingAccountUsers] = useState(false);
	const [selectionRestored, setSelectionRestored] = useState(false);
	const [minimized, setMinimized] = useState(false);
	const [operationalReadiness, setOperationalReadiness] =
		useState<OperationalReadiness>(emptyOperationalReadiness);
	const savedSelection = useRef<SetupSelection>({});

	useEffect(() => {
		const restored = readSetupSelection(userId);
		savedSelection.current = restored;
		setSelectedAccountId(restored.accountId ?? '');
		setMinimized(
			window.localStorage.getItem(getSetupMinimizedKey(userId)) === 'true',
		);
		setSelectionRestored(true);
	}, [userId]);

	useEffect(() => {
		if (!selectionRestored || accounts.length === 0) return;

		const selectedAccountStillExists = accounts.some(
			(account) => account.id === selectedAccountId,
		);
		if (selectedAccountStillExists) return;

		const restoredAccount = accounts.find(
			(account) => account.id === savedSelection.current.accountId,
		);
		const nextAccountId =
			restoredAccount?.id ??
			(accounts.length === 1 ? accounts[0].id : '') ??
			'';

		setSelectedAccountId(nextAccountId);
		savedSelection.current = nextAccountId ? { accountId: nextAccountId } : {};
		writeSetupSelection(userId, savedSelection.current);
	}, [accounts, selectedAccountId, selectionRestored, userId]);

	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		if (params.get('welcome') === '1') {
			setOpen(true);
			params.delete('welcome');
			const query = params.toString();
			window.history.replaceState(
				{},
				'',
				`${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`,
			);
		}
	}, []);

	useEffect(() => {
		if (!selectionRestored) return;

		if (!selectedAccountId) {
			setLocations([]);
			setOptions([]);
			setSelectedLocationId('');
			return;
		}

		let cancelled = false;
		setLoadingLocations(true);
		setSelectedLocationId('');
		setSelectedStationId('');

		Promise.all([
			getLocationsByAccountId(selectedAccountId),
			getOptions(selectedAccountId),
		])
			.then(([locationResponse, optionResponse]) => {
				if (cancelled) return;
				const nextLocations = locationResponse.data ?? [];
				const restoredLocation = nextLocations.find(
					(location) =>
						savedSelection.current.accountId === selectedAccountId &&
						location.id === savedSelection.current.locationId,
				);
				const nextLocationId =
					restoredLocation?.id ??
					(nextLocations.length === 1 ? nextLocations[0].id : '') ??
					'';

				setLocations(nextLocations);
				setOptions(optionResponse.data ?? []);
				setSelectedLocationId(nextLocationId);
				savedSelection.current = {
					accountId: selectedAccountId,
					...(nextLocationId ? { locationId: nextLocationId } : {}),
					...(nextLocationId === savedSelection.current.locationId &&
					savedSelection.current.stationId
						? { stationId: savedSelection.current.stationId }
						: {}),
				};
				writeSetupSelection(userId, savedSelection.current);
			})
			.finally(() => {
				if (!cancelled) setLoadingLocations(false);
			});

		return () => {
			cancelled = true;
		};
	}, [selectedAccountId, selectionRestored, userId]);

	useEffect(() => {
		if (!selectedAccountId) {
			setAccountUsers([]);
			return;
		}

		let cancelled = false;
		setLoadingAccountUsers(true);
		getUsersForAccount(selectedAccountId)
			.then((response) => {
				if (!cancelled) setAccountUsers(response.data ?? []);
			})
			.finally(() => {
				if (!cancelled) setLoadingAccountUsers(false);
			});

		return () => {
			cancelled = true;
		};
	}, [selectedAccountId]);

	useEffect(() => {
		if (!selectedAccountId || !selectedLocationId) {
			setOperationalReadiness(emptyOperationalReadiness);
			return;
		}

		setOperationalReadiness(
			readOperationalReadiness(
				userId,
				selectedAccountId,
				selectedLocationId,
			),
		);
	}, [selectedAccountId, selectedLocationId, userId]);

	useEffect(() => {
		if (!selectedLocationId) {
			setStations([]);
			setTemperatureCategories([]);
			setSelectedStationId('');
			return;
		}

		let cancelled = false;
		setLoadingStations(true);
		setSelectedStationId('');

		Promise.all([
			getStationsByLocation(selectedLocationId),
			getTemperatureCategories(selectedLocationId),
		])
			.then(async ([stationResponse, categoryResponse]) => {
				if (cancelled) return;
				const nextStations = stationResponse.data ?? [];
				let nextCategories = categoryResponse.data ?? [];

				if (nextCategories.length === 0 && canManage) {
					try {
						nextCategories = await addDefaultTemperatureCategories(
							selectedLocationId,
							userId,
						);
					} catch (error) {
						toast.error(
							error instanceof Error
								? error.message
								: 'Failed to prepare default temperature categories.',
						);
					}
				}

				if (cancelled) return;
				setStations(nextStations);
				// Only pass categories that the backend returned/persisted. Frontend-only
				// fallback categories have no database identity and can cause a 404 when
				// ItemServiceImpl resolves the selected temperature category.
				setTemperatureCategories(nextCategories);
				const restoredStation = nextStations.find(
					(station) =>
						savedSelection.current.locationId === selectedLocationId &&
						station.id === savedSelection.current.stationId,
				);
				const nextStationId =
					restoredStation?.id ??
					(nextStations.length === 1 ? nextStations[0].id : '') ??
					'';
				setSelectedStationId(nextStationId);
				savedSelection.current = {
					accountId: selectedAccountId,
					locationId: selectedLocationId,
					...(nextStationId ? { stationId: nextStationId } : {}),
				};
				writeSetupSelection(userId, savedSelection.current);
			})
			.finally(() => {
				if (!cancelled) setLoadingStations(false);
			});

		return () => {
			cancelled = true;
		};
	}, [canManage, selectedAccountId, selectedLocationId, userId]);

	useEffect(() => {
		if (!selectedStationId) {
			setItems([]);
			return;
		}

		let cancelled = false;
		setLoadingItems(true);
		getItemsByStation(selectedStationId)
			.then((response) => {
				if (!cancelled) setItems(response.data ?? []);
			})
			.finally(() => {
				if (!cancelled) setLoadingItems(false);
			});

		return () => {
			cancelled = true;
		};
	}, [selectedStationId]);

	const selectedAccount = accounts.find(
		(account) => account.id === selectedAccountId,
	);
	const selectedLocation = locations.find(
		(location) => location.id === selectedLocationId,
	);
	const selectedStation = stations.find(
		(station) => station.id === selectedStationId,
	);

	const optionsByType = useMemo(
		() =>
			options.reduce<Record<string, OptionEntity[]>>((grouped, option) => {
				(grouped[option.optionType] ??= []).push(option);
				return grouped;
			}, {}),
		[options],
	);

	const activeOptionsByType = useMemo(
		() =>
			Object.fromEntries(
				Object.entries(optionsByType).map(([type, values]) => [
					type,
					values.filter((option) => option.optionActive),
				]),
			) as Record<string, OptionEntity[]>,
		[optionsByType],
	);
	const optionsConfigured = SETUP_OPTION_TYPES.every(
		(type) => (activeOptionsByType[type]?.length ?? 0) > 0,
	);
	const initialStructureComplete =
		Boolean(selectedAccountId) &&
		Boolean(selectedLocationId) &&
		optionsConfigured &&
		Boolean(selectedStationId) &&
		items.length > 0;
	const completedSteps =
		Number(Boolean(selectedAccountId)) +
		Number(Boolean(selectedLocationId)) +
		Number(optionsConfigured) +
		Number(Boolean(selectedStationId)) +
		Number(items.length > 0) +
		Number(operationalReadiness.temperatureReviewed) +
		Number(operationalReadiness.goalsConfirmed) +
		Number(operationalReadiness.accessConfirmed);
	const progress = Math.round((completedSteps / 8) * 100);
	const setupUser: User = {
		id: userId,
		userName,
		appRole: 'MANAGER',
	};

	const handleAccountChange = (accountId: string) => {
		savedSelection.current = { accountId };
		writeSetupSelection(userId, savedSelection.current);
		setSelectedAccountId(accountId);
		setSelectedLocationId('');
		setSelectedStationId('');
	};

	const handleLocationChange = (locationId: string) => {
		savedSelection.current = { accountId: selectedAccountId, locationId };
		writeSetupSelection(userId, savedSelection.current);
		setSelectedLocationId(locationId);
		setSelectedStationId('');
	};

	const handleStationChange = (stationId: string) => {
		savedSelection.current = {
			accountId: selectedAccountId,
			locationId: selectedLocationId,
			stationId,
		};
		writeSetupSelection(userId, savedSelection.current);
		setSelectedStationId(stationId);
	};

	const handleLocationCreated = (location: Locations) => {
		setLocations((current) => [...current, location]);
		const locationId = location.id ?? '';
		if (locationId) {
			savedSelection.current = {
				accountId: selectedAccountId,
				locationId,
			};
			writeSetupSelection(userId, savedSelection.current);
		}
		setSelectedLocationId(locationId);
	};

	const handleStationCreated = async (station: StationDto) => {
		if (!selectedLocationId) {
			toast.error('Create or select a location before creating a station.');
			return;
		}

		const response = await getStationsByLocation(selectedLocationId);
		const persistedStations = response.data ?? [];
		const persistedStation = persistedStations.find(
			(candidate) =>
				(candidate.id && candidate.id === station.id) ||
				candidate.stationName.toLowerCase() ===
					station.stationName.toLowerCase(),
		);

		if (!persistedStation?.id) {
			setStations(persistedStations);
			setSelectedStationId('');
			toast.error(
				'The station response was not found in the persisted station list. Please try creating it again.',
			);
			return;
		}

		setStations(persistedStations);
		setSelectedStationId(persistedStation.id);
		savedSelection.current = {
			accountId: selectedAccountId,
			locationId: selectedLocationId,
			stationId: persistedStation.id,
		};
		writeSetupSelection(userId, savedSelection.current);
		toast.success(
			`Station ${persistedStation.stationName} is ready for items.`,
		);
	};

	const handleItemCreated = (item: Item) => {
		setItems((current) => [...current, item]);
	};

	const handleBlueprintApplied = useCallback(
		async (result: BlueprintApplyResult) => {
			if (!selectedAccountId || !selectedLocationId) return;

			const [optionResponse, stationResponse] = await Promise.all([
				getOptions(selectedAccountId),
				getStationsByLocation(selectedLocationId),
			]);
			if (optionResponse.error || stationResponse.error) {
				toast.error(
					optionResponse.error ||
						stationResponse.error ||
						'Blueprint was applied, but setup progress could not be refreshed.',
				);
				return;
			}

			const refreshedStations = stationResponse.data ?? [];
			setOptions(optionResponse.data ?? []);
			setStations(refreshedStations);

			const nextStationId =
				(result.primaryStationId &&
					refreshedStations.some(
						(station) => station.id === result.primaryStationId,
					) &&
					result.primaryStationId) ||
				selectedStationId ||
				refreshedStations[0]?.id ||
				'';

			setSelectedStationId(nextStationId);
			savedSelection.current = {
				accountId: selectedAccountId,
				locationId: selectedLocationId,
				...(nextStationId ? { stationId: nextStationId } : {}),
			};
			writeSetupSelection(userId, savedSelection.current);

			if (nextStationId) {
				const itemResponse = await getItemsByStation(nextStationId);
				if (!itemResponse.error) setItems(itemResponse.data ?? []);
			}
		},
		[
			selectedAccountId,
			selectedLocationId,
			selectedStationId,
			userId,
		],
	);

	const handleOptionCreated = (option: OptionEntity) => {
		setOptions((current) =>
			current.some((existing) => existing.id === option.id)
				? current.map((existing) =>
						existing.id === option.id ? option : existing,
					)
				: [...current, option],
		);
	};

	const handleUserInvited = (invitedUser: User) => {
		setAccountUsers((current) =>
			current.some((existing) => existing.id === invitedUser.id)
				? current.map((existing) =>
						existing.id === invitedUser.id ? invitedUser : existing,
					)
				: [...current, invitedUser],
		);
	};

	const refreshTemperatureCategories = useCallback(async () => {
		if (!selectedLocationId) return;
		const response = await getTemperatureCategories(selectedLocationId);
		if (!response.error) setTemperatureCategories(response.data ?? []);
	}, [selectedLocationId]);

	const confirmOperationalStep = (
		step: keyof OperationalReadiness,
		confirmed = true,
	) => {
		if (!selectedAccountId || !selectedLocationId) return;

		setOperationalReadiness((current) => {
			const next = { ...current, [step]: confirmed };
			window.localStorage.setItem(
				getOperationalReadinessKey(
					userId,
					selectedAccountId,
					selectedLocationId,
				),
				JSON.stringify(next),
			);
			return next;
		});
	};

	const handleMinimizedChange = (nextMinimized: boolean) => {
		setMinimized(nextMinimized);
		window.localStorage.setItem(
			getSetupMinimizedKey(userId),
			String(nextMinimized),
		);
	};

	if (minimized) {
		return (
			<Card className="border-primary/20 shadow-sm">
				<CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex items-center gap-3">
						<span
							className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
								progress === 100
									? 'bg-emerald-100 text-emerald-700'
									: 'bg-primary/10 text-primary'
							}`}
						>
							{progress === 100 ? (
								<CheckCircle2 className="size-5" aria-hidden="true" />
							) : (
								<Bot className="size-5" aria-hidden="true" />
							)}
						</span>
						<div>
							<p className="font-semibold">
								{progress === 100
									? 'Initial setup complete'
									: 'Setup assistant'}
							</p>
							<p className="text-sm text-muted-foreground">
								{progress === 100
									? 'Reopen anytime to review or expand your location setup.'
									: `${completedSteps} of 8 setup steps complete.`}
							</p>
						</div>
					</div>
					<Button
						variant="outline"
						onClick={() => handleMinimizedChange(false)}
					>
						Open assistant
					</Button>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background shadow-sm">
			<CardHeader className="gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-start gap-3">
					<span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
						<Bot className="size-5" aria-hidden="true" />
					</span>
					<div>
						<CardTitle>Setup assistant</CardTitle>
						<p className="mt-1 text-sm text-muted-foreground">
							Create your first location, station, and line-check item.
						</p>
					</div>
				</div>

				<div className="flex flex-wrap items-center gap-2">
					<Sheet open={open} onOpenChange={setOpen}>
						<SheetTrigger asChild>
							<Button>
								{progress === 100
									? 'Review setup'
									: completedSteps > 0
										? 'Continue setup'
										: 'Start setup'}
							</Button>
						</SheetTrigger>
						<SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
							<SheetHeader className="border-b pb-4 pr-10">
								<div className="flex items-center gap-2 text-primary">
									<Bot className="size-5" aria-hidden="true" />
									<SheetTitle>Manager Life setup assistant</SheetTitle>
								</div>
								<SheetDescription>
									Hi {userName?.split(' ')[0] || 'there'}! I’ll guide you
									through the structure used by every line check.
								</SheetDescription>
								<div className="space-y-1.5 pt-2">
									<div className="flex justify-between text-xs text-muted-foreground">
										<span>Setup progress</span>
										<span>{progress}%</span>
									</div>
									<Progress value={progress} />
								</div>
							</SheetHeader>

							<div className="space-y-4 px-4 pb-8">
								<WizardStep
									complete={Boolean(selectedAccountId)}
									icon={<Building2 className="size-4" />}
									title="Choose an account"
									description="Locations and setup options belong to an account."
								>
									{accounts.length ? (
										<Select
											value={selectedAccountId}
											onValueChange={handleAccountChange}
										>
											<SelectTrigger className="w-full">
												<SelectValue placeholder="Select an account" />
											</SelectTrigger>
											<SelectContent>
												{accounts.map((account) => (
													<SelectItem key={account.id} value={account.id!}>
														{account.accountName}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									) : (
										<p className="text-sm text-muted-foreground">
											No accounts are assigned to you yet.
										</p>
									)}
								</WizardStep>

								<WizardStep
									complete={Boolean(selectedLocationId)}
									disabled={!selectedAccountId}
									icon={<MapPin className="size-4" />}
									title="Create a location"
									description="Add the restaurant or retail site you want to set up."
								>
									{loadingLocations ? (
										<p className="text-sm text-muted-foreground">
											Preparing location setup…
										</p>
									) : (
										<div className="space-y-3">
											{locations.length > 1 && (
												<Select
													value={selectedLocationId}
													onValueChange={handleLocationChange}
												>
													<SelectTrigger className="w-full">
														<SelectValue placeholder="Continue setup for a location" />
													</SelectTrigger>
													<SelectContent>
														{locations.map((location) => (
															<SelectItem
																key={location.id}
																value={location.id!}
															>
																{location.locationName}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
											)}
											{selectedLocation && (
												<Badge variant="secondary">
													Created: {selectedLocation.locationName}
												</Badge>
											)}
											{canManage && selectedAccountId && (
												<CreateLocationDialog
													accountId={selectedAccountId}
													userId={userId}
													existingLocations={locations}
													onLocationCreated={handleLocationCreated}
													trigger={
														<Button className="w-full sm:w-auto">
															<MapPin className="size-4" />
															Create location and continue
														</Button>
													}
												/>
											)}
											{!canManage && (
												<Alert>
													<AlertTitle>Manager role required</AlertTitle>
													<AlertDescription>
														Your invitation currently has the Member role. Ask
														an account manager to change your App Role to
														Manager, then refresh this page.
													</AlertDescription>
												</Alert>
											)}
										</div>
									)}
								</WizardStep>

								{canManage && selectedAccountId && selectedLocationId && (
									<LocationBlueprintBuilder
										accountId={selectedAccountId}
										accountName={selectedAccount?.accountName}
										locationId={selectedLocationId}
										locationName={selectedLocation?.locationName}
										userId={userId}
										existingOptions={options}
										existingStations={stations}
										temperatureCategories={temperatureCategories}
										onApplied={handleBlueprintApplied}
									/>
								)}

								<WizardStep
									complete={optionsConfigured}
									disabled={!selectedLocationId}
									icon={<SlidersHorizontal className="size-4" />}
									title="Configure item options"
									description="Add the choices managers will use when creating line-check items."
								>
									<div className="space-y-2">
										{SETUP_OPTION_TYPES.map((type) => {
											const typeOptions = optionsByType[type] ?? [];
											const count = activeOptionsByType[type]?.length ?? 0;

											return (
												<div
													key={type}
													className="flex items-center justify-between gap-3 rounded-lg border bg-background p-3"
												>
													<div className="min-w-0">
														<p className="text-sm font-medium">
															{OptionTypeLabels[type]}
														</p>
														<p className="text-xs text-muted-foreground">
															{count} active{' '}
															{count === 1 ? 'option' : 'options'}
														</p>
														<div className="mt-2 flex flex-wrap gap-1.5">
															{typeOptions.length > 0 ? (
																<>
																	{typeOptions.slice(0, 5).map((option) => (
																		<Badge
																			key={option.id}
																			variant="outline"
																			className={
																				!option.optionActive
																					? 'opacity-50'
																					: undefined
																			}
																		>
																			{option.optionName}
																			{!option.optionActive && ' (inactive)'}
																		</Badge>
																	))}
																	{typeOptions.length > 5 && (
																		<span className="text-xs text-muted-foreground">
																			+{typeOptions.length - 5} more
																		</span>
																	)}
																</>
															) : (
																<span className="text-xs text-muted-foreground">
																	None configured
																</span>
															)}
														</div>
													</div>
													<CreateOptionDialog
														accountId={selectedAccountId}
														currentUser={setupUser}
														existingOptions={options}
														defaultOptionType={type}
														onOptionCreated={handleOptionCreated}
														trigger={
															<Button
																size="sm"
																variant={count ? 'outline' : 'default'}
															>
																{count ? 'Add another' : 'Add option'}
															</Button>
														}
													/>
												</div>
											);
										})}

										{selectedAccountId && selectedLocationId && (
											<Button variant="link" asChild className="h-auto px-0">
												<Link
													href={`/accounts/${selectedAccountId}/locations/${selectedLocationId}/options`}
												>
													Open the full Options page
													<ExternalLink className="size-3.5" />
												</Link>
											</Button>
										)}
									</div>
								</WizardStep>

								<WizardStep
									complete={Boolean(selectedStationId)}
									disabled={!selectedLocationId || !optionsConfigured}
									icon={<ChefHat className="size-4" />}
									title="Choose or create a station"
									description="Stations group related items, such as Prep, Grill, or Restrooms."
								>
									{loadingStations ? (
										<p className="text-sm text-muted-foreground">
											Loading stations…
										</p>
									) : (
										<div className="space-y-3">
											{stations.length > 0 && (
												<Select
													value={selectedStationId}
													onValueChange={handleStationChange}
												>
													<SelectTrigger className="w-full">
														<SelectValue placeholder="Select a station" />
													</SelectTrigger>
													<SelectContent>
														{stations.map((station) => (
															<SelectItem key={station.id} value={station.id!}>
																{station.stationName}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
											)}
											{canManage && selectedLocationId && (
												<CreateStationDialog
													locationId={selectedLocationId}
													currentUserId={userId}
													existingStations={stations}
													onStationCreated={handleStationCreated}
												/>
											)}
										</div>
									)}
								</WizardStep>

								<WizardStep
									complete={items.length > 0}
									disabled={!selectedStationId || !optionsConfigured}
									icon={<ListChecks className="size-4" />}
									title="Create the first item"
									description="Items are the individual prep, cleanliness, or temperature checks."
								>
									{loadingItems ? (
										<p className="text-sm text-muted-foreground">
											Loading items…
										</p>
									) : (
										<div className="space-y-3">
											{items.length > 0 && (
												<Badge variant="secondary">
													{items.length} {items.length === 1 ? 'item' : 'items'}{' '}
													configured
												</Badge>
											)}
											{canManage && selectedStationId && optionsConfigured && (
												<CreateItemDialog
													stationId={selectedStationId}
													currentUserId={userId}
													existingItems={items}
													tools={activeOptionsByType.TOOL ?? []}
													panSizes={activeOptionsByType.PAN_SIZE ?? []}
													portionSizes={activeOptionsByType.PORTION_SIZE ?? []}
													shelfLifes={activeOptionsByType.SHELF_LIFE ?? []}
													temperatureCategories={temperatureCategories}
													onItemCreated={handleItemCreated}
												/>
											)}
											{canManage && selectedAccountId && !optionsConfigured && (
												<Alert>
													<AlertTitle>
														Complete the options step first
													</AlertTitle>
													<AlertDescription className="space-y-2">
														<p>
															Add at least one active option in each category.
														</p>
														{selectedLocationId && (
															<Link
																href={`/accounts/${selectedAccountId}/locations/${selectedLocationId}/options`}
																className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
															>
																Open options{' '}
																<ExternalLink className="size-3.5" />
															</Link>
														)}
													</AlertDescription>
												</Alert>
											)}
										</div>
									)}
								</WizardStep>

								{!canManage && (
									<Alert>
										<AlertTitle>Manager access required for setup</AlertTitle>
										<AlertDescription>
											You can review assigned locations, but a manager must
											create or change locations, stations, and items.
										</AlertDescription>
									</Alert>
								)}

								{initialStructureComplete && selectedAccount && selectedLocation && (
									<Alert className="border-primary/20 bg-primary/5">
										<CheckCircle2 className="size-4 text-emerald-700" />
										<AlertTitle>Initial structure complete</AlertTitle>
										<AlertDescription>
											Complete steps 6–8 to prepare the location for its first live
											line check on the iPad.
										</AlertDescription>
									</Alert>
								)}

								<WizardStep
									complete={operationalReadiness.temperatureReviewed}
									disabled={!initialStructureComplete}
									icon={<Thermometer className="size-4" />}
									title="Step 6: Review temperature thresholds"
									description="Confirm the safe ranges used by temperature-check items."
								>
									<Accordion type="single" collapsible className="rounded-xl border px-3">
										<AccordionItem value="temperature">
											<AccordionTrigger className="hover:no-underline">
												Open temperature settings
											</AccordionTrigger>
											<AccordionContent className="space-y-3">
												{selectedLocation && (
													<TemperatureCategorySettings
														locationId={selectedLocation.id!}
														userId={userId}
														canManage={canManage}
														onHistoryChange={refreshTemperatureCategories}
													/>
												)}
												<Button
													onClick={() =>
														confirmOperationalStep('temperatureReviewed')
													}
													disabled={!temperatureCategories.some((category) => category.active)}
												>
													Confirm temperature thresholds
												</Button>
											</AccordionContent>
										</AccordionItem>
									</Accordion>
								</WizardStep>

								<WizardStep
									complete={operationalReadiness.goalsConfirmed}
									disabled={!operationalReadiness.temperatureReviewed}
									icon={<Target className="size-4" />}
									title="Step 7: Confirm daily goals"
									description="Set the reporting week and expected line checks per day."
								>
									<Accordion type="single" collapsible className="rounded-xl border px-3">
										<AccordionItem value="goals">
											<AccordionTrigger className="hover:no-underline">
												Open line-check goal settings
											</AccordionTrigger>
											<AccordionContent>
												{selectedLocation && (
													<LineCheckSettingsForm
														locationId={selectedLocation.id!}
														userId={userId}
														allowConfirmUnchanged
														submitLabel="Save and confirm goals"
														onSaved={() => confirmOperationalStep('goalsConfirmed')}
													/>
												)}
											</AccordionContent>
										</AccordionItem>
									</Accordion>
								</WizardStep>

								<WizardStep
									complete={operationalReadiness.accessConfirmed}
									disabled={!operationalReadiness.goalsConfirmed}
									icon={<Users className="size-4" />}
									title="Step 8: Confirm team access"
									description="Review assigned users and send any needed invitations."
								>
									<Accordion type="single" collapsible className="rounded-xl border px-3">
										<AccordionItem value="access">
											<AccordionTrigger className="hover:no-underline">
												Open team access
											</AccordionTrigger>
											<AccordionContent className="space-y-3">
												{loadingAccountUsers ? (
													<p className="text-sm text-muted-foreground">
														Loading team access…
													</p>
												) : (
													<div className="space-y-2">
														{accountUsers.map((accountUser) => (
															<div
																key={accountUser.id ?? accountUser.userEmail}
																className="flex items-center justify-between gap-3 rounded-lg border p-3"
															>
																<span className="min-w-0">
																	<span className="block truncate text-sm font-medium">
																		{accountUser.userName ||
																			accountUser.userEmail ||
																			'Invited user'}
																	</span>
																	{accountUser.userName && accountUser.userEmail && (
																		<span className="block truncate text-xs text-muted-foreground">
																			{accountUser.userEmail}
																		</span>
																	)}
																</span>
																<div className="flex shrink-0 gap-1.5">
																	{(accountUser.firstLogin || accountUser.invited) && (
																		<Badge variant="outline">Pending</Badge>
																	)}
																	<Badge variant="secondary">
																		{accountUser.appRole || 'MEMBER'}
																	</Badge>
																</div>
															</div>
														))}
														{accountUsers.length === 0 && (
															<p className="text-sm text-muted-foreground">
																No users are assigned to this account yet.
															</p>
														)}
													</div>
												)}
												<div className="flex flex-wrap gap-2">
													<InviteUserDialog
														accountId={selectedAccount?.id ?? selectedAccountId}
														onUserCreated={handleUserInvited}
													/>
													<Button
														onClick={() => confirmOperationalStep('accessConfirmed')}
													>
														Confirm team access
													</Button>
												</div>
											</AccordionContent>
										</AccordionItem>
									</Accordion>
								</WizardStep>

								{progress === 100 && selectedAccount && selectedLocation && (
									<Alert className="border-emerald-200 bg-emerald-50/70 text-emerald-950">
										<Tablet className="size-4 text-emerald-700" />
										<AlertTitle>Web setup complete</AlertTitle>
										<AlertDescription className="space-y-3">
											<p>
												The location is ready. Sign in at the location and perform
												the first live line check on the iPad.
											</p>
											<Button asChild size="sm">
												<Link
													href={`/accounts/${selectedAccount.id}/locations/${selectedLocation.id}`}
												>
													Open location dashboard
													<ExternalLink className="size-3.5" />
												</Link>
											</Button>
										</AlertDescription>
									</Alert>
								)}

								{!initialStructureComplete &&
									selectedAccount &&
									selectedLocation &&
									selectedStation && (
										<Button asChild className="w-full">
											<Link
												href={`/accounts/${selectedAccount.id}/locations/${selectedLocation.id}/stations/${selectedStation.id}`}
											>
												Open {selectedStation.stationName}
												<ExternalLink className="size-4" />
											</Link>
										</Button>
									)}
							</div>
						</SheetContent>
					</Sheet>
					<Button
						variant="ghost"
						size="sm"
						onClick={() => handleMinimizedChange(true)}
					>
						<Minimize2 className="size-4" />
						Minimize
					</Button>
				</div>
			</CardHeader>
			<CardContent>
				<div className="flex items-center gap-3 text-sm text-muted-foreground">
					<Progress value={progress} className="max-w-64" />
					<span className="whitespace-nowrap">{completedSteps} of 8 steps</span>
				</div>
			</CardContent>
		</Card>
	);
}

type WizardStepProps = {
	complete: boolean;
	disabled?: boolean;
	icon: React.ReactNode;
	title: string;
	description: string;
	children: React.ReactNode;
};

function WizardStep({
	complete,
	disabled = false,
	icon,
	title,
	description,
	children,
}: WizardStepProps) {
	return (
		<section
			className={`rounded-xl border p-4 transition-colors ${
				disabled ? 'bg-muted/20 opacity-60' : 'bg-card'
			}`}
		>
			<div className="flex items-start gap-3">
				{complete ? (
					<CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" />
				) : (
					<Circle className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
				)}
				<div className="min-w-0 flex-1">
					<div className="flex items-center gap-2">
						<span className="text-primary">{icon}</span>
						<h3 className="font-semibold">{title}</h3>
					</div>
					<p className="mt-1 text-sm text-muted-foreground">{description}</p>
					{!disabled && <div className="mt-3">{children}</div>}
				</div>
			</div>
		</section>
	);
}
