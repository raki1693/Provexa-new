import { Outlet } from 'react-router-dom';
import SidebarLayout from '../../components/SidebarLayout';
import { HomeIcon, BuildingLibraryIcon, AcademicCapIcon, BriefcaseIcon, ExclamationTriangleIcon, ClipboardDocumentListIcon, ChartBarIcon, Cog6ToothIcon, UserCircleIcon, BellIcon } from '@heroicons/react/24/outline';

const navItems = [
  { label: 'Overview', icon: HomeIcon, path: '/admin/dashboard' },
  { label: 'Institutions', icon: BuildingLibraryIcon, path: '/admin/institutions' },
  { label: 'Students', icon: AcademicCapIcon, path: '/admin/students' },
  { label: 'Employers', icon: BriefcaseIcon, path: '/admin/employers' },
  { label: 'Complaints', icon: ExclamationTriangleIcon, path: '/admin/complaints' },
  { label: 'Audit Logs', icon: ClipboardDocumentListIcon, path: '/admin/audit-logs' },
  { label: 'Reports', icon: ChartBarIcon, path: '/admin/reports' },
  { label: 'Settings', icon: Cog6ToothIcon, path: '/admin/settings' },
  { label: 'Profile', icon: UserCircleIcon, path: '/admin/profile' },
];

export default function AdminDashboard() {
  return (
    <SidebarLayout role="admin" navItems={navItems}>
      <Outlet />
    </SidebarLayout>
  );
}
