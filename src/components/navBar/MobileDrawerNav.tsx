'use client';

import React from 'react';
import {
	Drawer,
	DrawerTrigger,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
	DrawerClose,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

interface MobileDrawerNavProps {
	title?: string;
	children: React.ReactNode; // typically a navigation component
	open: boolean;
	setOpen: (open: boolean) => void;
}

export default function MobileDrawerNav({
	title = 'Navigation',
	children,
	open,
	setOpen,
}: MobileDrawerNavProps) {
	return (
		<Drawer open={open} onOpenChange={setOpen}>
			<DrawerTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className="md:hidden"
					aria-label="Open Menu"
				>
					<Menu className="w-6 h-6" />
				</Button>
			</DrawerTrigger>

			<DrawerContent
				side="left"
				className="p-0 w-64 backdrop-blur-xl bg-background/80 shadow-lg"
			>
				<DrawerHeader className="flex justify-between items-center rounded-2xl pt-0">
					<div className="flex justify-between items-center w-full">
						<DrawerTitle>{title}</DrawerTitle>
						<DrawerClose asChild>
							<Button variant="ghost" size="icon">
								<X className="w-5 h-5" />
							</Button>
						</DrawerClose>
					</div>
				</DrawerHeader>

				<div className="pt-0">{children}</div>
			</DrawerContent>
		</Drawer>
	);
}
