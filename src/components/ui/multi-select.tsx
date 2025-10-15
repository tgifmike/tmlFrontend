
'use client';

import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from '@/components/ui/command';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';

interface Option {
	label: string;
	value: string;
}

interface MultiSelectProps {
	options: Option[];
	value: string[];
	onChange: (value: string[]) => void;
	placeholder?: string;
}

export function MultiSelect({
	options,
	value,
	onChange,
	placeholder = 'Select options...',
}: MultiSelectProps) {
	const [open, setOpen] = React.useState(false);

	const handleSelect = (val: string) => {
		if (value.includes(val)) {
			onChange(value.filter((v) => v !== val));
		} else {
			onChange([...value, val]);
		}
	};

	const selectedLabels = options
		.filter((o) => value.includes(o.value))
		.map((o) => o.label);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					className="w-full justify-between"
				>
					<div className="flex flex-wrap gap-1 truncate">
						{selectedLabels.length > 0 ? (
							selectedLabels.map((label) => (
								<Badge
									key={label}
									variant="secondary"
									className="rounded-md text-xs font-normal px-2"
								>
									{label}
								</Badge>
							))
						) : (
							<span className="text-muted-foreground">{placeholder}</span>
						)}
					</div>
					<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[300px] p-0">
				<Command>
					<CommandInput placeholder="Search..." />
					<CommandList>
						<CommandEmpty>No options found.</CommandEmpty>
						<CommandGroup>
							{options.map((option) => (
								<CommandItem
									key={option.value}
									onSelect={() => handleSelect(option.value)}
								>
									<div
										className={cn(
											'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
											value.includes(option.value)
												? 'bg-primary text-primary-foreground'
												: 'opacity-50'
										)}
									>
										{value.includes(option.value) && (
											<Check className="h-3 w-3" />
										)}
									</div>
									{option.label}
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
