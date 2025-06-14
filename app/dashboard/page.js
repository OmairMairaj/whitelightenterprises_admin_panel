'use client';
import React, { useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import CheckloginContext from '@/app/context/auth/CheckloginContext';
import PageContainer from '@/components/layout/page-container';
import DbCounter from './Comp/DbCounter'
export default function page() {
  const router = useRouter();
  const Contextdata = useContext(CheckloginContext);

  return (
    <PageContainer scrollable={true}>

   <DbCounter/>
    </PageContainer>
  );
}
