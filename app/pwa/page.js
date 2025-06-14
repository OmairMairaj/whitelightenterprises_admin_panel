'use client';
import React from 'react';
import { useState, useEffect } from 'react';
import { LuCircleDashed } from "react-icons/lu";
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
const Page = () => {
  const router = useRouter();

  const CheckLogin = async () => {
    const token = Cookies.get('token');
    const userDataCookie = Cookies.get('userData');

    if (!token && !userDataCookie) {
      
      router.push(`/`);
    } else {
      const UserData = JSON.parse(userDataCookie);
      const Role = UserData.Role;
      if (Role == 'User') {
        router.push(`/user`);
      }
      if (Role == 'Admin') {
        router.push(`/dashboard`);
      }
      if (!Role) {
        router.push(`/`);
      }
    }
  };

  useEffect(() => {
    CheckLogin();
  }, []);

  return (
    <div className="m-auto flex h-screen w-full flex-col items-center justify-center">
      <img src="/512logo.png" width="100px" alt="logo" />
      <LuCircleDashed className="m-8 h-10 w-8 animate-spin" />
    </div>
  );
};

export default Page;
