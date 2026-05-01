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
		<Card className="w-full flex mx-auto rounded-2xl border border-border/40 bg-accent shadow-xl">
			<CardHeader>
				<CardTitle className="text-lg font-semibold">
					Line Check Settings
				</CardTitle>
			</CardHeader>

			<form onSubmit={handleSubmit(onSubmit)}>
				<CardContent className="space-y-2">
					{/* DAY OF WEEK */}
					<div className="grid grid-cols-[1fr_auto] items-center gap-6 py-4 border-b border-border/20">
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
						<div className="flex justify-end">
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
								<SelectTrigger className="w-56 border-0 bg-transparent shadow-none justify-end">
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
					<div className="grid grid-cols-[1fr_auto] items-center gap-6 py-4">
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
						<div className="flex justify-end">
							<Input
								type="number"
								min={1}
								{...register('dailyGoal', { valueAsNumber: true })}
								value={watch('dailyGoal')}
								disabled={loading}
								className="w-56 border-0 bg-transparent shadow-none text-right focus-visible:ring-0"
							/>
						</div>

						{errors.dailyGoal && (
							<p className="col-span-2 text-xs text-destructive pt-1">
								{errors.dailyGoal.message}
							</p>
						)}
					</div>
				</CardContent>

				<CardFooter>
					<Button
						type="submit"
						className="w-full rounded-xl"
						disabled={!isDirty || loading}
					>
						{loading ? 'Saving...' : 'Save Settings'}
					</Button>
				</CardFooter>
			</form>
		</Card>
	);
}


