import React, { FC } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Icons } from '../icon';
import { User } from 'lucide-react';

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
    const UserIcon = Icons.user;

  return (
      <main>
          
          <Avatar>
              {user?.image ? (
                  <AvatarImage src={user.image} alt="User Avatar" />
              ) : (
                  <AvatarFallback>
                      <UserIcon className='h-8 w-8'/>
                  </AvatarFallback>
              )}
          </Avatar>
    </main>
  )
}

export default UserAvatar