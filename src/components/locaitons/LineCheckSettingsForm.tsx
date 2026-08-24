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
});


 export type LineCheckFormValues = z.infer<typeof lineCheckSchema>;

 interface LineCheckSettingsFormProps {
	 locationId: string;
	 userId?: string;
 }

export default function LineCheckSettingsForm({
	locationId,
	userId
}: LineCheckSettingsFormProps) {
	const form = useForm<LineCheckFormValues>({
		resolver: zodResolver(lineCheckSchema),
		defaultValues: {
			dayOfWeek: 'MONDAY',
			dailyGoal: 1,
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

					setValue('dayOfWeek', day, { shouldDirty: false });
                    setValue('dailyGoal', goal, { shouldDirty: false });
                   
				}
            } catch (err) {
                toast.error('Failed to load line check settings');
				console.error('Failed to fetch line check settings', err);
			} finally {
				setLoading(false);
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
					Set the weekly reporting cycle and daily completion target.
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
					<div className="grid gap-4 py-4 sm:grid-cols-[minmax(0,1fr)_minmax(14rem,1fr)] sm:items-center">
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
				</CardContent>

				<CardFooter className="justify-end border-t border-border/50 pt-6">
					<Button
						type="submit"
						disabled={!isDirty || loading}
					>
						{loading ? 'Saving...' : 'Save Settings'}
					</Button>
				</CardFooter>
			</form>
		</Card>
	);
}

