import { Outlet } from 'react-router-dom';
import SidebarLayout from '../../components/SidebarLayout';
import { AcademicCapIcon, DocumentTextIcon, MagnifyingGlassIcon, BellIcon, UserCircleIcon } from '@heroicons/react/24/outline';

const navItems = [
  { label: 'My Certificates', icon: DocumentTextIcon, path: '/student/dashboard' },
  { label: 'Verify Certificate', icon: MagnifyingGlassIcon, path: '/student/verify' },
  { label: 'Notifications', icon: BellIcon, path: '/student/notifications' },
  { label: 'Profile', icon: UserCircleIcon, path: '/student/profile' },
];

export default function StudentDashboard() {
  return (
    <SidebarLayout role="student" navItems={navItems}>
      <Outlet />
    </SidebarLayout>
  );
}
