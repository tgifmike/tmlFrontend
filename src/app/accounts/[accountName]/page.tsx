'use client';

import { useParams } from 'next/navigation';
import React from 'react';
import Image from 'next/image';
import { Icons } from '@/components/icon';

const AccountPage = () => {
	//temp
	const accountImage = null;
	//const accountImage = '/newLogo.png';

	//icon
	const AddImageIcon = Icons.addPicture;

	//get account name from url
	const params = useParams<{ accountName: string }>();
	const decodedAccountName = decodeURIComponent(params.accountName);

	return (
		<main className="flex">
			{/* leftnav */}
			<div className="w-1/6 boarder-r-2 bg-ring h-screen">
				<div>
					{accountImage ? (
						<Image
							src={accountImage}
							alt="logo"
							className="mx-auto mt-4 rounded-full"
							width={200}
							height={200}
							style={{ maxWidth: '100%', height: 'auto' }}
						/>
					) : (
						<div
							className="mx-auto mt-4 rounded-full bg-ring flex items-center justify-center 
                    w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-52 lg:h-52"
						>
							<AddImageIcon className="text-background h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 lg:h-24 lg:w-24" />
						</div>
					)}
				</div>
			</div>

			{/* main content */}
			<div className="p-4">
				<h1 className="text-4xl">{decodedAccountName}</h1>
			</div>
		</main>
	);
};

export default AccountPage;
