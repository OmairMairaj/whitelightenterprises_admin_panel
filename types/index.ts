import { Icons } from '@/components/icons';

export interface NavItem {
  title: string;
  href: string;
  icon: string;
  label: string;
  Role: 'partners' | 'User';
  disabled?: boolean;
  type: string;
}

export interface NavItemWithChildren extends NavItem {
  items: NavItemWithChildren[];
}

export interface NavItemWithOptionalChildren extends NavItem {
  items?: NavItemWithChildren[];
}

export interface FooterItem {
  title: string;
  items: {
    title: string;
    href: string;
    external?: boolean;
  }[];
}

export type MainNavItem = NavItemWithOptionalChildren;

export type SidebarNavItem = NavItemWithChildren;
