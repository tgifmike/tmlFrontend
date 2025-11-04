'use client';

import React, { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import {
	Drawer,
	DrawerTrigger,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
	DrawerClose,
} from '@/components/ui/drawer';
import { Menu, X } from 'lucide-react';

interface MobileDrawerNavProps {
	open: boolean;
	setOpen: (open: boolean) => void;
	title?: string;
	children: ReactNode;
}

/**
 * A reusable left-side mobile drawer for navigation or menus.
 */
const MobileDrawerNav: React.FC<MobileDrawerNavProps> = ({
	open,
	setOpen,
	title = 'Navigation',
	children,
}) => {
	return (
		<Drawer open={open} onOpenChange={setOpen}>
			{/* Button that triggers the drawer */}
			<DrawerTrigger
				className='flex items-center'
				asChild>
				<Button
					variant="ghost"
					size="lg"
					className="md:hidden"
					aria-label="Open menu"
				>
					<Menu className="w-16 h-16" />
				</Button>
			</DrawerTrigger>

			{/* Drawer panel content */}
			<DrawerContent
				side="left"
				className="p-0 w-64 backdrop-blur-xl bg-background/80 shadow-lg"
			>
				<DrawerHeader className="flex justify-between items-center rounded-2xl pt-0">
					<div className="flex justify-between items-center w-full">
						<DrawerTitle>{title}</DrawerTitle>
						<DrawerClose asChild>
							<Button variant="ghost" size="icon" aria-label="Close menu">
								<X className="w-5 h-5" />
							</Button>
						</DrawerClose>
					</div>
				</DrawerHeader>

				{/* Drawer body */}
				<div className="pt-0">{children}</div>
			</DrawerContent>
		</Drawer>
	);
};

export default MobileDrawerNav;
