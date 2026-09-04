'use client';

import {
	CheckCircle2,
	Copy,
	Eye,
	EyeOff,
	KeyRound,
	Loader2,
	ShieldCheck,
	Sparkles,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import {
	generateUniqueUserPin,
	revokeUserPin,
	setUserPin,
	type UserPinLength,
} from '@/app/api/userApI';
import type { User } from '@/app/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

type PinMode = 'manual' | 'generate';

type UserPinDialogProps = {
	accountId?: string;
	user: User;
	onPinConfigured?: (userId: string) => void;
	onPinRevoked?: (userId: string) => void;
};

export function UserPinDialog({ accountId, user, onPinConfigured, onPinRevoked }: UserPinDialogProps) {
	const [open, setOpen] = useState(false);
	const [mode, setMode] = useState<PinMode>('manual');
	const [pinLength, setPinLength] = useState<UserPinLength>(6);
	const [pin, setPin] = useState('');
	const [assignedPin, setAssignedPin] = useState<string | null>(null);
	const [showPin, setShowPin] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const userName = user.userName || user.userEmail || 'this user';
	const pinIsValid = pin.length === pinLength && /^\d+$/.test(pin);

	const resetDialog = () => {
		setMode('manual');
		setPinLength(6);
		setPin('');
		setAssignedPin(null);
		setShowPin(false);
		setSubmitting(false);
		setError(null);
	};

	const handleOpenChange = (nextOpen: boolean) => {
		setOpen(nextOpen);
		if (!nextOpen) resetDialog();
	};

	const selectLength = (length: UserPinLength) => {
		setPinLength(length);
		setPin('');
		setAssignedPin(null);
		setError(null);
	};

	const handlePinChange = (value: string) => {
		setPin(value.replace(/\D/g, '').slice(0, pinLength));
		setError(null);
	};

	const handleManualSave = async () => {
		if (!user.id || !accountId || !pinIsValid) return;
		setSubmitting(true);
		setError(null);

		try {
			const response = await setUserPin(accountId, user.id, pin);
			if (response.error) throw new Error(response.error);

			setAssignedPin(pin);
			setShowPin(true);
			onPinConfigured?.(user.id);
			toast.success(`PIN created for ${userName}.`);
		} catch (caughtError) {
			const message = caughtError instanceof Error
				? caughtError.message
				: 'Failed to create the PIN.';
			setError(message);
			toast.error(message);
		} finally {
			setSubmitting(false);
		}
	};

	const handleGenerate = async () => {
		if (!user.id || !accountId) return;
		setSubmitting(true);
		setError(null);

		try {
			const response = await generateUniqueUserPin(accountId, user.id, pinLength);
			if (response.error) throw new Error(response.error);
			const generatedPin = response.data?.pin;

			if (!generatedPin || generatedPin.length !== pinLength) {
				throw new Error('The server did not return a valid generated PIN.');
			}

			setPin(generatedPin);
			setAssignedPin(generatedPin);
			setShowPin(true);
			onPinConfigured?.(user.id);
			toast.success(`A unique PIN was generated for ${userName}.`);
		} catch (caughtError) {
			const message = caughtError instanceof Error
				? caughtError.message
				: 'Failed to generate a unique PIN.';
			setError(message);
			toast.error(message);
		} finally {
			setSubmitting(false);
		}
	};

	const copyPin = async () => {
		if (!assignedPin) return;
		try {
			await navigator.clipboard.writeText(assignedPin);
			toast.success('PIN copied to clipboard.');
		} catch {
			toast.error('Unable to copy the PIN.');
		}
	};

	const handleRevoke = async () => {
		if (!accountId || !user.id || !window.confirm(`Revoke the PIN for ${userName}?`)) return;
		setSubmitting(true);
		try {
			const response = await revokeUserPin(accountId, user.id);
			if (response.error) throw new Error(response.error);
			onPinRevoked?.(user.id);
			toast.success(`PIN revoked for ${userName}.`);
			handleOpenChange(false);
		} catch (caughtError) {
			const message = caughtError instanceof Error ? caughtError.message : 'Failed to revoke the PIN.';
			setError(message);
			toast.error(message);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className={`relative ${user.pinConfigured === true ? 'text-green-600 dark:text-green-400' : 'text-black dark:text-white'}`}
					aria-label={user.pinConfigured === true ? `Manage PIN for ${userName}` : `Create PIN for ${userName}`}
					title={!accountId ? 'Select an account to manage this PIN' : user.pinConfigured === true ? `Manage PIN for ${userName}` : `Create PIN for ${userName}`}
					disabled={!accountId}
				>
					<KeyRound className="!h-[30px] !w-[30px]" aria-hidden="true" />
					{user.pinConfigured === true && (
						<span className="absolute right-0.5 top-0.5 size-2.5 rounded-full border-2 border-background bg-green-500" />
					)}
				</Button>
			</DialogTrigger>

			<DialogContent className="overflow-hidden p-0 sm:max-w-md">
				<div className="border-b bg-muted/35 px-6 py-5">
					<DialogHeader>
						<div className="flex items-center gap-3">
							<span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
								<KeyRound className="size-5" aria-hidden="true" />
							</span>
							<div>
								<DialogTitle>Manage user PIN</DialogTitle>
								<DialogDescription className="mt-1">
									Create or replace the sign-in PIN for {userName}.
								</DialogDescription>
							</div>
						</div>
					</DialogHeader>
				</div>

				{assignedPin ? (
					<div className="space-y-5 px-6 pb-6">
						<div className="flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 text-green-900 dark:border-green-900 dark:bg-green-950/40 dark:text-green-200">
							<CheckCircle2 className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
							<div>
								<p className="font-semibold">PIN ready</p>
								<p className="mt-1 text-sm leading-6 opacity-80">
									Copy it now and give it directly to the user. It will not be shown
									again after this dialog closes.
								</p>
							</div>
						</div>

						<div className="flex items-center justify-between gap-3 rounded-2xl border bg-muted/30 p-4">
							<p className="font-mono text-2xl font-bold tracking-[0.35em] sm:text-3xl">
								{showPin ? assignedPin : '•'.repeat(assignedPin.length)}
							</p>
							<div className="flex shrink-0 items-center gap-1">
								<Button
									type="button"
									variant="ghost"
									size="icon"
									onClick={() => setShowPin((visible) => !visible)}
									aria-label={showPin ? 'Hide PIN' : 'Show PIN'}
								>
									{showPin ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
								</Button>
								<Button
									type="button"
									variant="outline"
									size="icon"
									onClick={copyPin}
									aria-label="Copy PIN"
								>
									<Copy aria-hidden="true" />
								</Button>
							</div>
						</div>

						<DialogFooter>
							<Button type="button" variant="destructive" onClick={handleRevoke} disabled={submitting}>
								Revoke PIN
							</Button>
							<Button type="button" onClick={() => handleOpenChange(false)}>
								Done
							</Button>
						</DialogFooter>
					</div>
				) : (
					<div className="space-y-5 px-6 pb-6">
						{user.pinConfigured === true && (
							<div className="flex items-center justify-between rounded-xl border bg-muted/25 px-4 py-3 text-sm">
								<span className="text-muted-foreground">Current status</span>
								<Badge variant="outline" className="border-green-200 text-green-700 dark:border-green-900 dark:text-green-300">
									PIN configured
								</Badge>
							</div>
						)}
						{user.pinConfigured === true && (
							<Button type="button" variant="destructive" onClick={handleRevoke} disabled={submitting}>
								Revoke PIN
							</Button>
						)}

						<div className="grid grid-cols-2 gap-2 rounded-xl bg-muted p-1">
							<Button
								type="button"
								variant={mode === 'manual' ? 'secondary' : 'ghost'}
								onClick={() => {
									setMode('manual');
									setError(null);
								}}
								className={mode === 'manual' ? 'bg-background shadow-sm hover:bg-background' : ''}
							>
								Enter PIN
							</Button>
							<Button
								type="button"
								variant={mode === 'generate' ? 'secondary' : 'ghost'}
								onClick={() => {
									setMode('generate');
									setError(null);
								}}
								className={mode === 'generate' ? 'bg-background shadow-sm hover:bg-background' : ''}
							>
								Generate PIN
							</Button>
						</div>

						<div>
							<p className="text-sm font-medium">PIN length</p>
							<div className="mt-2 grid grid-cols-2 gap-2">
								{([4, 6] as UserPinLength[]).map((length) => (
									<Button
										key={length}
										type="button"
										variant={pinLength === length ? 'default' : 'outline'}
										onClick={() => selectLength(length)}
									>
										{length} digits {length === 6 && <span className="text-xs opacity-70">Recommended</span>}
									</Button>
								))}
							</div>
						</div>

						{mode === 'manual' ? (
							<div>
								<label htmlFor={`user-pin-${user.id}`} className="text-sm font-medium">
									New PIN
								</label>
								<div className="relative mt-2">
									<Input
										id={`user-pin-${user.id}`}
										type={showPin ? 'text' : 'password'}
										value={pin}
										onChange={(event) => handlePinChange(event.target.value)}
										inputMode="numeric"
										autoComplete="new-password"
										maxLength={pinLength}
										placeholder={'•'.repeat(pinLength)}
										className="h-12 pr-12 text-center font-mono text-xl tracking-[0.45em]"
										aria-describedby={`user-pin-help-${user.id}`}
									/>
									<Button
										type="button"
										variant="ghost"
										size="icon"
										onClick={() => setShowPin((visible) => !visible)}
										className="absolute right-1.5 top-1.5"
										aria-label={showPin ? 'Hide PIN' : 'Show PIN'}
									>
										{showPin ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
									</Button>
								</div>
								<p id={`user-pin-help-${user.id}`} className="mt-2 text-xs leading-5 text-muted-foreground">
									Digits only. Availability is checked securely when you save.
								</p>
							</div>
						) : (
							<div className="rounded-2xl border border-primary/15 bg-primary/5 p-4">
								<div className="flex items-start gap-3">
									<span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
										<Sparkles className="size-4" aria-hidden="true" />
									</span>
									<div>
										<p className="font-semibold">Generate a unique PIN</p>
										<p className="mt-1 text-sm leading-6 text-muted-foreground">
											The server will generate, verify, and assign the PIN in one secure step.
										</p>
									</div>
								</div>
							</div>
						)}

						{error && (
							<p role="alert" className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
								{error}
							</p>
						)}

						<div className="flex items-start gap-2 text-xs leading-5 text-muted-foreground">
							<ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
							<span>PINs should be shared directly with the user and never displayed in user lists.</span>
						</div>

						<DialogFooter>
							<Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={submitting}>
								Cancel
							</Button>
							{mode === 'manual' ? (
								<Button type="button" onClick={handleManualSave} disabled={!pinIsValid || submitting}>
									{submitting && <Loader2 className="animate-spin" aria-hidden="true" />}
									{user.pinConfigured ? 'Replace PIN' : 'Save PIN'}
								</Button>
							) : (
								<Button type="button" onClick={handleGenerate} disabled={submitting}>
									{submitting ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Sparkles aria-hidden="true" />}
									Generate and assign
								</Button>
							)}
						</DialogFooter>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
