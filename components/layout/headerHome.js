'use client';
import { useState, useEffect } from 'react';
import { buttonVariants } from '@/components/ui/button';

import { cn } from '@/lib/utils';


import { LuArrowRight } from "react-icons/lu";
import { Button } from "@/components/ui/button"

import Link from 'next/link';

const routeList = [
  {
    href: '/',
    label: 'Home'
  },
  {
    href: '/about',
    label: 'About us'
  },
  {
    href: '/contact-us',
    label: 'Contact us'
  }
];

const headerHome = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header className={cn("fixed top-0 z-40 w-full transition-all duration-300  text-white", isScrolled ? "backdrop-blur" : "")}>
      <div className="w-full lg:container mx-auto flex flex-row items-center justify-between gap-10 p-3">
        <div className="flex flex-row items-center gap-2">

          <div className="flex">
            <Link
              href="/"
              className="ml-2 flex flex-row items-center justify-center gap-1 text-xl "
            >
             Admin Panel
            </Link>
          </div>
        </div>
        <div>
          <nav className="hidden gap-2 md:flex">
            {routeList.map((route, i) => (
              <Link
                href={route.href}
                key={i}
                className={`text-[17px] ${buttonVariants({
                  variant: 'ghost'
                })}`}
              >
                {route.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">

            <Link href='/dashboard' >
              <Button className='rounded-full' variant={isScrolled?'default':'secondary'}>
                Get Started <LuArrowRight className='ml-2' />
              </Button>

            </Link>

          </div>
        </div>
      </div>
    </header>
  );
};

export default headerHome;
