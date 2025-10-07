import { signOut } from 'next-auth/react';
import { Button } from '../ui/button';

import React from 'react';

const SignOutButton = () => {
	return (
		<Button
			onClick={() => signOut()}
			className="text-sm text-destructive underline"
		>
			Sign out
		</Button>
	);
};

export default SignOutButton;
