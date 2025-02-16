'use client';
import React, { useState, useContext, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import CheckloginContext from '@/app/context/auth/CheckloginContext';
import { Button } from '@/components/ui/button';
import { LuUserCircle2, LuLogOut } from 'react-icons/lu';
import { buttonVariants } from '@/components/ui/button';
import { LuLock } from 'react-icons/lu';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';

export function UserNav() {
  const Contextdata = useContext(CheckloginContext);

  const [session, setSession] = useState(false);

  useEffect(() => {
    if (Contextdata.UserData) {
    console.log('user data',Contextdata.UserData)
      setSession(true);
    }
  }, [Contextdata.UserData]);

  const handleLogout = () => {
    Contextdata.logout();
  };

  return (
    <div>
      {session ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={''}
                  alt={Contextdata.UserData && Contextdata.UserData?.username}
                />
                <AvatarFallback>
                  
                  {Contextdata.UserData &&
                    Contextdata.UserData?.username?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {Contextdata.UserData && Contextdata.UserData?.name}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {Contextdata.UserData && Contextdata.UserData?.username}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <Link
              href='/dashboard'
            >
              <DropdownMenuItem className="cursor-pointer">
                <LuUserCircle2 className="mr-2" /> Dashboard
              </DropdownMenuItem>
            </Link>

            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
              <LuLogOut className="mr-2" /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Link
          rel="noreferrer noopener"
          href="/auth/signin"
          className={`border ${buttonVariants({ variant: 'primary' })}`}
        >
          <LuLock className="mr-2 h-5 w-5" /> Login
        </Link>
      )}
    </div>
  );
}
