'use client';
import React, { useState } from 'react';
import { DashboardNav } from '@/components/dashboard-nav';
import { navItems } from '@/constants/data';
import { cn } from '@/lib/utils';
import { ChevronLeft } from 'lucide-react';
import { useSidebar } from '@/hooks/useSidebar';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';

type SidebarProps = {
  className?: string;
};

export default function Sidebar({ className }: SidebarProps) {
  const { isMinimized, toggle } = useSidebar();

  const handleToggle = () => {
    toggle();
  };

  return (
    <aside
      className={cn(
        `relative hidden h-screen flex-none border-r bg-card transition-[width] duration-500 md:block`,
        !isMinimized ? 'w-72' : 'w-[72px]',
        className
      )}
    >
      {/* Sidebar Content */}
      <div className="flex h-full flex-col">
        <div className="hidden w-full lg:block">
          <div>
            <div className="p-5">
              <Link
                href="/"
                className="flex flex-row items-center justify-center gap-1 text-xl font-bold"
              >
                Admin Panel
               
              </Link>
            </div>
          </div>
          <Separator className="mt-2" />
        </div>

        {/* Sidebar Toggle Button */}
        <ChevronLeft
          className={cn(
            'absolute -right-3 top-10 z-50 cursor-pointer rounded-full border bg-background text-3xl text-foreground',
            isMinimized && 'rotate-180'
          )}
          onClick={handleToggle}
        />

        {/* Navigation */}
        <div className="flex-grow space-y-4 py-4">
          <div className="px-3 py-2">
            <div className="mt-3 space-y-1">
              <DashboardNav items={navItems} />
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <div className="px-3 py-4">
          <div className="flex flex-col gap-1 text-xs">
            
            <div className="flex flex-row gap-2 items-center">
              <span>Developed and Design by</span>
              <a href="/" target="_blank" className="underline font-semibold">
              Sa analytics
              </a>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
