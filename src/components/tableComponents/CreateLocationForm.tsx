// 'use client';

import { useState, useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';

import { createLocation } from '@/app/api/locationApi';
import { Locations } from '@/app/types';
import { Button } from '../ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { US_STATES, US_TIME_ZONES } from '@/lib/constants/usConstants';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Icons } from '@/lib/icon';

type CreateLocationDialogProps = {
  onLocationCreated: (location: Locations) => void;
  existingLocations?: Locations[];
  accountId: string;
  userId: string;
};

const getSchema = (locations: Locations[] = []) =>
  z.object({
    locationName: z
      .string()
      .min(1, 'Location name cannot be empty')
      .refine(
        (name) => !locations.some((l) => l.locationName.toLowerCase() === name.toLowerCase()),
        { message: 'Location name already exists' }
      ),
    street: z.string().min(1, 'Street is required'),
    town: z.string().min(1, 'Town is required'),
    state: z.string().min(1, 'State is required').refine((val) => US_STATES.includes(val), {
      message: 'Select a valid state',
    }),
    zipCode: z.string().min(5, 'ZIP code must be 5 digits').max(10),
    timeZone: z
      .string()
      .min(1, 'Time zone is required')
      .refine((val) => US_TIME_ZONES.includes(val), { message: 'Select a valid time zone' }),
  });

export default function CreateLocationDialog({
  onLocationCreated,
  existingLocations = [],
  accountId,
  userId,
}: CreateLocationDialogProps) {
  const [open, setOpen] = useState(false);
  const AddLocationIcon = Icons.addLocation;

  const schema = useMemo(() => getSchema(existingLocations), [existingLocations]);
  type FormValues = z.infer<typeof schema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      locationName: '',
      street: '',
      town: '',
      state: '',
      zipCode: '',
      timeZone: '',
    },
    mode: 'onChange',
  });

  const onSubmit = async (values: FormValues) => {
    if (!userId) {
      toast.error('You must be logged in to create a location.');
      return;
    }

    try {
      // Trim name before sending
      const payload = {
        ...values,
        locationName: values.locationName.trim(),
      };

      const { data, error } = await createLocation(accountId, userId, payload);

      if (error || !data) {
        if (error?.includes('409') || error?.toLowerCase().includes('exists')) {
          toast.error('Location name already exists.');
        } else {
          toast.error('Failed to create location.');
        }
        return;
      }

      // Only update parent state
      onLocationCreated(data);

      toast.success(`Location ${data.locationName} created successfully.`);
      form.reset();
      setOpen(false);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create location.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <AddLocationIcon className="w-5 h-5" />
          <span>Create Location</span>
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
				  <DialogTitle>Create New Location</DialogTitle>
				  <DialogDescription>Fill out the form below to create a new location.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="locationName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter location name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="street"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Street" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="town"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Town</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Town" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a state" />
                      </SelectTrigger>
                      <SelectContent>
                        {US_STATES.map((state) => (
                          <SelectItem key={state} value={state}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="zipCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ZIP Code</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="ZIP code" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="timeZone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Time Zone</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a time zone" />
                      </SelectTrigger>
                      <SelectContent>
                        {US_TIME_ZONES.map((tz) => (
                          <SelectItem key={tz} value={tz}>
                            {tz}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={!form.formState.isValid || form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Creating...' : 'Create Location'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
