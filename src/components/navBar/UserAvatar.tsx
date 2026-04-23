import React, { FC } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { User as UserIcon } from 'lucide-react';

type User = {
	id?: string;
	name?: string | null;
	email?: string | null;
	image?: string | null;
};

type UserAvatarProps = {
	user: User | null;
};

const UserAvatar: FC<UserAvatarProps> = ({ user }) => {
	return (
		<Avatar>
			{user?.image ? (
				<AvatarImage src={user.image} alt="User Avatar" />
			) : (
				<AvatarFallback>
					<UserIcon className="h-8 w-8" />
				</AvatarFallback>
			)}
		</Avatar>
	);
};

export default UserAvatar;
