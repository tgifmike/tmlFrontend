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
 }

export default function LineCheckSettingsForm({
	locationId,
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
			await updateLineCheckSettings(locationId, values);
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
		<Card className="w-1/3 ml-4 mt-1">
			<CardHeader>
				<CardTitle className="text-2xl">Line Check Settings</CardTitle>
			</CardHeader>

			<form onSubmit={handleSubmit(onSubmit)}>
				<CardContent className="flex-col gap-6">
					{/* Day of Week */}
					<div className="flex justify-between items-center py-2">
						<Label>Start Day of Week</Label>
						<Select
							value={watch('dayOfWeek')} // <-- use the current form value
							onValueChange={(value) =>
								setValue(
									'dayOfWeek',
									value as LineCheckFormValues['dayOfWeek'],
									{
										shouldDirty: true,
									}
								)
							}
							disabled={loading}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select a day" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="MONDAY">Monday</SelectItem>
								<SelectItem value="TUESDAY">Tuesday</SelectItem>
								<SelectItem value="WEDNESDAY">Wednesday</SelectItem>
								<SelectItem value="THURSDAY">Thursday</SelectItem>
								<SelectItem value="FRIDAY">Friday</SelectItem>
								<SelectItem value="SATURDAY">Saturday</SelectItem>
								<SelectItem value="SUNDAY">Sunday</SelectItem>
							</SelectContent>
						</Select>

						{errors.dayOfWeek && (
							<p className="text-sm text-destructive">
								{errors.dayOfWeek.message}
							</p>
						)}
					</div>

					{/* Daily Goal */}
					<div className="flex justify-between items-center py-2">
						<Label className="w-60">Daily Line Check Goal</Label>
						<Input
							type="number"
							min={1}
							{...register('dailyGoal', { valueAsNumber: true })}
							value={watch('dailyGoal')} // <-- make it controlled
							placeholder="Enter daily goal"
							className="flex-1"
							disabled={loading}
						/>
						{errors.dailyGoal && (
							<p className="text-sm text-destructive">
								{errors.dailyGoal.message}
							</p>
						)}
					</div>
				</CardContent>

				<CardFooter className="pt-3">
					<Button
						type="submit"
						className="w-full"
						disabled={!isDirty || loading}
					>
						{loading ? 'Saving...' : 'Save Settings'}
					</Button>
				</CardFooter>
			</form>
		</Card>
	);
}


