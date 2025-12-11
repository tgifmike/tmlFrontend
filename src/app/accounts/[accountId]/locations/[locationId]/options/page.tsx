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
import { OptionEntity, OptionType, AppRole, User } from '@/app/types';
import { Icons } from '@/lib/icon';
import { StatusSwitchOrBadge } from '@/components/tableComponents/StatusSwitchOrBadge';
import { EditOptionDialog } from '@/components/options/EditOptionDialog';
import { DeleteConfirmButton } from '@/components/tableComponents/DeleteConfirmButton';
import Spinner from '@/components/spinner/Spinner';
import { Pagination } from '@/components/tableComponents/Pagination';
import { CreateOptionDialog } from '@/components/options/CreateOptionDialog';
import { getAccountsForUser } from '@/app/api/accountApi';
import router from 'next/router';

const OptionsPage = () => {
	const { data: session, status } = useSession();
	const params = useParams<{ accountId: string }>();
	const accountIdParam = params.accountId;

	const [loadingAccess, setLoadingAccess] = useState(true);
	const [hasAccess, setHasAccess] = useState(false);
	const [accountName, setAccountName] = useState<string | null>(null);
	const [accountImage, setAccountImage] = useState<string | null>(null);
	const [options, setOptions] = useState<OptionEntity[]>([]);
	const [showActiveOnly, setShowActiveOnly] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');

	const currentUser = session?.user as User | undefined;
	const canToggle = currentUser?.appRole === AppRole.MANAGER;
	const UpDownIcon = Icons.sort;

	// Fetch options
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

				const res = await getOptions(accountIdParam);
				if (!res.data) {
					toast.error('Failed to load options.');
					return;
				}

				// Sort by type then by sortOrder
				const sorted = res.data.sort(
					(a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
				);
				setOptions(sorted);

				setHasAccess(true);
				setAccountName(account.accountName);
				setAccountImage(account.imageBase64 || null);
			} catch (err) {
				toast.error('You do not have access to this account.');
				router.push('/accounts');
			} finally {
				setLoadingAccess(false);
			}
		};

		verifyAccess();
	}, [status, session, accountIdParam, hasAccess, router]);

	// Toggle active
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
	const handleOptionDelete = (optionId: string) => {
		setOptions((prev) => prev.filter((o) => o.id !== optionId));
	};

	// Drag & drop reorder for a specific type
	const handleDragEnd =
		(optionType: OptionType) => async (result: DropResult) => {
			if (!result.destination) return;

			// Filter only options of this type
			const typeOptions = options.filter((o) => o.optionType === optionType);

			const updatedTypeOptions = [...typeOptions];
			const [moved] = updatedTypeOptions.splice(result.source.index, 1);
			updatedTypeOptions.splice(result.destination.index, 0, moved);

			// Merge back into main options
			const newOptions = [
				...options.filter((o) => o.optionType !== optionType),
				...updatedTypeOptions,
			].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

			setOptions(newOptions);

			try {
				if (!accountIdParam || !currentUser?.id)
					throw new Error('Missing parameters');

				const orderedIds = updatedTypeOptions.map((o) => o.id);
				await reorderOptions(
					accountIdParam,
					optionType,
					orderedIds,
					currentUser.id
				);
			} catch (err) {
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

	// Group options by type
	const optionTypes = Object.values(OptionType);
	const getOptionsByType = (type: OptionType) =>
		options.filter(
			(o) => o.optionType === type && (showActiveOnly ? o.optionActive : true)
		);

	return (
		<div className="p-4">
			<header className="flex justify-between items-center mb-4">
				<h1 className="text-3xl font-bold">Options</h1>
				{currentUser && (
					<CreateOptionDialog
						accountId={accountIdParam}
						currentUser={currentUser}
						onOptionCreated={handleOptionSave}
					/>
				)}
			</header>

			{optionTypes.map((type) => {
				const typeOptions = getOptionsByType(type);
				if (typeOptions.length === 0) return null;

				return (
					<div key={type} className="mb-8">
						<h2 className="text-xl font-semibold mb-2">{type}</h2>
						<DragDropContext onDragEnd={handleDragEnd(type)}>
							<Droppable droppableId={type}>
								{(provided) => (
									<div
										ref={provided.innerRef}
										{...provided.droppableProps}
										className="bg-accent p-4 rounded-2xl shadow-md w-full"
									>
										<div className="flex justify-between items-center font-bold text-lg px-2 py-1 border-b mb-2">
											<span className="flex items-center gap-2 w-1/2">
												<UpDownIcon className="w-5 h-5" />
												Option Name
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
														className="flex justify-between items-center p-2 mb-2 bg-background rounded-2xl"
													>
														<span className="w-1/2">{option.optionName}</span>
														<div className="w-1/4 text-center">
															<StatusSwitchOrBadge
																entity={{
																	id: option.id,
																	active: option.optionActive,
																}}
																getLabel={() => option.optionName}
																onToggle={handleToggleActive}
																canToggle={canToggle}
															/>
														</div>
														<div className="w-1/4 flex justify-center gap-2">
															<EditOptionDialog
																option={option}
																onOptionUpdated={handleOptionSave}
															/>
															<DeleteConfirmButton
																item={{ id: option.id }}
																entityLabel="Option"
																onDelete={handleOptionDelete}
																getItemName={() => option.optionName}
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
					</div>
				);
			})}
		</div>
	);
};

export default OptionsPage;
