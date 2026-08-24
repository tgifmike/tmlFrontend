"use client"

import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
		<SwitchPrimitive.Root
			data-slot="switch"
			className={cn(
				'peer inline-flex h-7 w-12 shrink-0 items-center rounded-full border shadow-inner outline-none transition-colors data-[state=checked]:border-chart-3 data-[state=checked]:bg-chart-3 data-[state=unchecked]:border-muted-foreground/30 data-[state=unchecked]:bg-muted-foreground/35 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:data-[state=unchecked]:border-muted-foreground/40 dark:data-[state=unchecked]:bg-muted-foreground/45',
				className
			)}
			{...props}
		>
			<SwitchPrimitive.Thumb
				data-slot="switch-thumb"
				className={cn(
					'pointer-events-none block size-5 rounded-full border border-black/10 bg-white shadow-md ring-0 transition-transform data-[state=checked]:translate-x-6 data-[state=unchecked]:translate-x-1'
				)}
			/>
		</SwitchPrimitive.Root>
	);
}

export { Switch }
