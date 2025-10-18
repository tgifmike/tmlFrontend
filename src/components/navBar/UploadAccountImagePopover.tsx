'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { updateAccountImage } from '@/app/api/accountApi';
import { toast } from 'sonner';

interface Props {
	accountId: string;
	onUploadSuccess?: (uploadedBase64:string) => void;
}

const UploadAccountImagePopover: React.FC<Props> = ({
	accountId,
	onUploadSuccess,
}) => {
	const [file, setFile] = useState<File | null>(null);
	const [loading, setLoading] = useState(false);
	const [open, setOpen] = useState(false); // to programmatically close modal

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			setFile(e.target.files[0]);
		}
	};

	const handleUpload = async () => {
		if (!file) return;

		setLoading(true);
		const reader = new FileReader();

		reader.onloadend = async () => {
			const base64 = (reader.result as string).split(',')[1];

			try {
				await updateAccountImage(accountId, base64);
				toast.success('Image uploaded successfully');
				onUploadSuccess?.(base64);
				setOpen(false); // close the dialog
			} catch (err) {
				console.error('Upload failed:', err);
				toast.error('Failed to upload image');
			} finally {
				setLoading(false);
			}
		};

		reader.readAsDataURL(file);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="secondary">Upload Image</Button>
			</DialogTrigger>
			<DialogContent className="flex flex-col gap-4">
				<DialogTitle>Upload Account Image</DialogTitle>
				<DialogDescription>
					Select an image file to associate with this account.
				</DialogDescription>

				<Input type="file" accept="image/*" onChange={handleFileChange} />
				<Button onClick={handleUpload} disabled={loading || !file}>
					{loading ? 'Uploading...' : 'Upload'}
				</Button>
			</DialogContent>
		</Dialog>
	);
};

export default UploadAccountImagePopover;
