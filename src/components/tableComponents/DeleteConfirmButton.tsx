'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Icons } from '../../lib/icon';

type DeleteConfirmButtonProps<T extends { id: string; name?: string }> = {
	item: T;
	entityLabel?: string; // e.g., "user", "account", "location"
	onDelete: (id: string) => Promise<void> | void;
	icon?: keyof typeof Icons;
	getItemName?: (item: T) => string; // optional function to extract display name
};

export const DeleteConfirmButton = <T extends { id: string }>({
	item,
	entityLabel = 'item',
	onDelete,
	icon = 'trash',
	getItemName,
}: DeleteConfirmButtonProps<T>) => {
	const DeleteIcon = Icons[icon];
	const [loading, setLoading] = useState(false);

	const itemName = getItemName
		? getItemName(item)
		: (item as any).name || 'this item';

	const handleDelete = async () => {
		try {
			setLoading(true);
			await onDelete(item.id);
			toast.success(`${entityLabel} "${itemName}" deleted successfully`);
		} catch (error: any) {
			toast.error(`Failed to delete ${entityLabel}: ${error.message}`);
		} finally {
			setLoading(false);
		}
	};

	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button
					variant="ghost"
					disabled={loading}
					className="text-destructive p-0 flex items-center justify-center !w-[50px] !h-[50px]"
				>
					<DeleteIcon className="!w-[30px] !h-[30px]" />
				</Button>
			</AlertDialogTrigger>

			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>
						Delete {entityLabel} "{itemName}"?
					</AlertDialogTitle>
					<AlertDialogDescription>
						This action cannot be undone. The {entityLabel} will be permanently
						removed.
					</AlertDialogDescription>
				</AlertDialogHeader>

				<AlertDialogFooter>
					<AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
					<AlertDialogAction
						onClick={handleDelete}
						disabled={loading}
						className="bg-destructive/70 text-background hover:bg-destructive focus:ring-destructive"
					>
						{loading ? 'Deleting...' : 'Delete'}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};
