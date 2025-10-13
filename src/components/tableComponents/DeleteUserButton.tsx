'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { deleteUser } from '@/app/api/userApI';
import { User } from '@/app/types';

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

type Props = {
	user: User;
	onDelete: (id: string) => void;
};

export const DeleteUserButton = ({ user, onDelete }: Props) => {

	const DeleteIcon = Icons.trash;
	const [loading, setLoading] = useState(false);

	const handleDelete = async () => {
		if (!user.id) return;
		try {
			setLoading(true);
			await deleteUser(user.id);
			onDelete(user.id);
			toast.success(`User "${user.userName}" deleted successfully`);
		} catch (error: any) {
			toast.error('Failed to delete user: ' + error.message);
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
					<AlertDialogTitle>Delete user {user.userName}?</AlertDialogTitle>
					<AlertDialogDescription>
						This action cannot be undone. The user account will be permanently
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
