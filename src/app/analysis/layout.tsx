import { ReactNode } from 'react';
import DashboardLayout from '@/app/dashboard/layout';

export default function Layout({ children }: { children: ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
