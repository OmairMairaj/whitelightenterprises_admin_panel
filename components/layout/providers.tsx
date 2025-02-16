'use client';
import React from 'react';
import ThemeProvider from './ThemeToggle/theme-provider';
import CheckloginStates from '@/app/context/auth/CheckloginStates';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CheckloginStates>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
      </ThemeProvider>
    </CheckloginStates>
  );
}
