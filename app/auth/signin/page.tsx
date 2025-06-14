import { Metadata } from 'next';
import Link from 'next/link';
import LoginForm from './Comp/LoginForm';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'Login : Admin Dashboard',
};


export default function AuthenticationPage() {
  return (
    <div className="relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">

      <div className="relative hidden overflow-hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-cover bg-center bg-[url('https://storage.googleapis.com/bigi-wedding-video/media/H0HKmEdfm-2024-12-27T15-35-05-608Z.jpg')]">
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black opacity-50"></div>
        </div>
        <div className="relative z-20 flex items-center text-lg font-medium">
          Admin Panel
        </div>
        <div className="relative z-20 mt-auto">
          <div className="flex flex-row gap-2 items-center">
            <span>Developed and Design by</span>
            <a href="/" target="_blank" className="underline font-semibold">
              Sa analytics
            </a>
          </div>
        </div>
      </div>
      <div className="flex h-full items-center p-4 lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Log in
            </h1>
            <p className="text-sm text-muted-foreground">
              Log in as Admin !
            </p>
          </div>
          <LoginForm />

        </div>
      </div>
    </div>
  );
}
