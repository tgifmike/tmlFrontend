'use client';

import { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
	Select,
	SelectTrigger,
	SelectContent,
	SelectItem,
	SelectValue,
} from '@/components/ui/select';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '../ui/card';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getLineCheckSettings, updateLineCheckSettings } from '@/app/api/locationApi';
import { toast } from 'sonner';
import { DAYS } from '@/lib/constants/usConstants';
import { ClipboardCheck } from 'lucide-react';

export const lineCheckSchema = z.object({
	dayOfWeek: z.enum([
		'MONDAY',
		'TUESDAY',
		'WEDNESDAY',
		'THURSDAY',
		'FRIDAY',
		'SATURDAY',
		'SUNDAY',
	]),
	dailyGoal: z.number().min(1, 'Daily goal must be at least 1'),
	endOfDay: z
		.string()
		.regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Enter a valid end-of-day time'),
});


 export type LineCheckFormValues = z.infer<typeof lineCheckSchema>;

 interface LineCheckSettingsFormProps {
	 locationId: string;
	 userId?: string;
	 onSaved?: () => void;
	 allowConfirmUnchanged?: boolean;
	 submitLabel?: string;
 }

export default function LineCheckSettingsForm({
	locationId,
	userId,
	onSaved,
	allowConfirmUnchanged = false,
	submitLabel = 'Save Settings',
}: LineCheckSettingsFormProps) {
	const form = useForm<LineCheckFormValues>({
		resolver: zodResolver(lineCheckSchema),
		defaultValues: {
			dayOfWeek: 'MONDAY',
			dailyGoal: 1,
			endOfDay: '00:00',
		},
	});


	const {
		handleSubmit,
		register,
		setValue,
		watch,
		formState: { errors, isDirty },
	} = form;
	const [loading, setLoading] = useState(false);
	const [loaded, setLoaded] = useState(false);

	// Fetch current settings on mount
	useEffect(() => {
		const fetchSettings = async () => {
			setLoading(true);
			try {
				const settings = await getLineCheckSettings(locationId);
				const { data } = settings;

				if (data) {
					// Ensure dayOfWeek is a valid string and convert to uppercase
					const day: LineCheckFormValues['dayOfWeek'] =
						typeof data.dayOfWeek === 'string'
							? (data.dayOfWeek.toUpperCase() as LineCheckFormValues['dayOfWeek'])
							: 'MONDAY';

					// Ensure dailyGoal is a number, default to 1
					const goal: number =
						typeof data.dailyGoal === 'number' && data.dailyGoal > 0
							? data.dailyGoal
							: 1;
					const endOfDay = normalizeTime(data.endOfDay);

					setValue('dayOfWeek', day, { shouldDirty: false });
					setValue('dailyGoal', goal, { shouldDirty: false });
					setValue('endOfDay', endOfDay, { shouldDirty: false });
                   
				}
            } catch (err) {
                toast.error('Failed to load line check settings');
				console.error('Failed to fetch line check settings', err);
			} finally {
				setLoading(false);
				setLoaded(true);
			}
		};

		fetchSettings();
	}, [locationId, setValue]);



	const onSubmit = async (values: LineCheckFormValues) => {
		setLoading(true);
		try {
			if (!userId) {
				toast.error('You must be logged in to update settings.');
				return;
			}
			await updateLineCheckSettings(locationId, userId,  values);
            form.reset(values); // reset dirty state
            toast.success('Line check settings saved successfully');
			onSaved?.();
        } catch (err) {
            toast.error('Failed to save line check settings');
			console.error('Failed to save settings', err);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Card className="w-full rounded-2xl border-border/60 bg-card shadow-sm">
			<CardHeader className="border-b border-border/50">
				<CardTitle className="flex items-center gap-2 text-xl">
					<ClipboardCheck className="size-5 text-primary" aria-hidden="true" />
					Line check settings
				</CardTitle>
				<CardDescription>
					Set the weekly reporting cycle, operating-day cutoff, and daily completion target.
				</CardDescription>
			</CardHeader>

			<form onSubmit={handleSubmit(onSubmit)}>
				<CardContent className="space-y-2 pt-6">
					{/* DAY OF WEEK */}
					<div className="grid gap-4 border-b border-border/50 py-4 sm:grid-cols-[minmax(0,1fr)_minmax(14rem,1fr)] sm:items-center">
						{/* LEFT SIDE */}
						<div className="space-y-1">
							<Label className="text-sm font-medium text-muted-foreground">
								Start Day
							</Label>
							<p className="text-xs text-muted-foreground">
								Defines the starting day for line check tracking
							</p>
						</div>

						{/* RIGHT SIDE */}
						<div className="flex sm:justify-end">
							<Select
								value={watch('dayOfWeek')}
								onValueChange={(value) =>
									setValue(
										'dayOfWeek',
										value as LineCheckFormValues['dayOfWeek'],
										{
											shouldDirty: true,
										},
									)
								}
								disabled={loading}
							>
							<SelectTrigger className="w-full bg-background sm:max-w-64 sm:justify-end">
									<SelectValue placeholder="Select a day" />
								</SelectTrigger>

								<SelectContent>
									{DAYS.map((d) => (
										<SelectItem key={d} value={d}>
											{d}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						{errors.dayOfWeek && (
							<p className="col-span-2 text-xs text-destructive pt-1">
								{errors.dayOfWeek.message}
							</p>
						)}
					</div>

					{/* DAILY GOAL */}
					<div className="grid gap-4 border-b border-border/50 py-4 sm:grid-cols-[minmax(0,1fr)_minmax(14rem,1fr)] sm:items-center">
						{/* LEFT SIDE */}
						<div className="space-y-1">
							<Label className="text-sm font-medium text-muted-foreground">
								Daily Goal
							</Label>
							<p className="text-xs text-muted-foreground">
								Number of line checks required per day
							</p>
						</div>

						{/* RIGHT SIDE */}
						<div className="flex sm:justify-end">
							<Input
								type="number"
								min={1}
								{...register('dailyGoal', { valueAsNumber: true })}
								value={watch('dailyGoal')}
								disabled={loading}
								className="w-full bg-background sm:max-w-64 sm:text-right"
							/>
						</div>

						{errors.dailyGoal && (
							<p className="col-span-2 text-xs text-destructive pt-1">
								{errors.dailyGoal.message}
							</p>
						)}
					</div>

					{/* END OF DAY */}
					<div className="grid gap-4 py-4 sm:grid-cols-[minmax(0,1fr)_minmax(14rem,1fr)] sm:items-center">
						<div className="space-y-1">
							<Label htmlFor="line-check-end-of-day" className="text-sm font-medium text-muted-foreground">
								End of Day
							</Label>
							<p className="text-xs text-muted-foreground">
								Time when one operating day ends and the next begins
							</p>
						</div>

						<div className="flex sm:justify-end">
							<EndOfDayPicker
								value={watch('endOfDay')}
								onChange={(value) =>
									setValue('endOfDay', value, {
										shouldDirty: true,
										shouldValidate: true,
									})
								}
								disabled={loading}
							/>
						</div>

						{errors.endOfDay && (
							<p className="col-span-2 pt-1 text-xs text-destructive">
								{errors.endOfDay.message}
							</p>
						)}
					</div>
				</CardContent>

				<CardFooter className="justify-end border-t border-border/50 pt-6">
					<Button
						type="submit"
						disabled={loading || !loaded || (!isDirty && !allowConfirmUnchanged)}
					>
						{loading ? 'Saving...' : submitLabel}
					</Button>
				</CardFooter>
			</form>
		</Card>
	);
}

function normalizeTime(value?: string | null) {
	if (typeof value !== 'string') return '00:00';
	const match = value.match(/^([01]\d|2[0-3]):([0-5]\d)/);
	return match ? `${match[1]}:${match[2]}` : '00:00';
}

const HOURS = Array.from({ length: 12 }, (_, index) => String(index + 1));
const MINUTES = Array.from({ length: 60 }, (_, index) =>
	String(index).padStart(2, '0'),
);

function EndOfDayPicker({
	value,
	onChange,
	disabled,
}: {
	value: string;
	onChange: (value: string) => void;
	disabled: boolean;
}) {
	const { hour, minute, period } = toTwelveHourParts(value);
	const selectClassName =
		'h-10 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50';

	const update = (next: Partial<{ hour: string; minute: string; period: 'AM' | 'PM' }>) => {
		onChange(toTwentyFourHourTime(next.hour ?? hour, next.minute ?? minute, next.period ?? period));
	};

	return (
		<fieldset id="line-check-end-of-day" className="flex w-full items-center justify-end gap-2 sm:max-w-64">
			<legend className="sr-only">End of day time</legend>
			<select
				aria-label="End of day hour"
				value={hour}
				onChange={(event) => update({ hour: event.target.value })}
				disabled={disabled}
				className={`${selectClassName} min-w-16 flex-1`}
			>
				{HOURS.map((option) => <option key={option} value={option}>{option}</option>)}
			</select>
			<span aria-hidden="true" className="font-semibold text-muted-foreground">:</span>
			<select
				aria-label="End of day minute"
				value={minute}
				onChange={(event) => update({ minute: event.target.value })}
				disabled={disabled}
				className={`${selectClassName} min-w-16 flex-1`}
			>
				{MINUTES.map((option) => <option key={option} value={option}>{option}</option>)}
			</select>
			<select
				aria-label="End of day AM or PM"
				value={period}
				onChange={(event) => update({ period: event.target.value as 'AM' | 'PM' })}
				disabled={disabled}
				className={`${selectClassName} min-w-20`}
			>
				<option value="AM">AM</option>
				<option value="PM">PM</option>
			</select>
		</fieldset>
	);
}

function toTwelveHourParts(value: string) {
	const normalized = normalizeTime(value);
	const [hourValue, minute] = normalized.split(':');
	const hour24 = Number(hourValue);
	return {
		hour: String(hour24 % 12 || 12),
		minute,
		period: (hour24 >= 12 ? 'PM' : 'AM') as 'AM' | 'PM',
	};
}

function toTwentyFourHourTime(hour: string, minute: string, period: 'AM' | 'PM') {
	const hour12 = Number(hour);
	const hour24 = (hour12 % 12) + (period === 'PM' ? 12 : 0);
	return `${String(hour24).padStart(2, '0')}:${minute}`;
}
