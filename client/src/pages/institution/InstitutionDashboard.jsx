import { Outlet } from 'react-router-dom';
import SidebarLayout from '../../components/SidebarLayout';
import { HomeIcon, DocumentPlusIcon, TableCellsIcon, DocumentTextIcon, ArchiveBoxXMarkIcon, MagnifyingGlassIcon, ClockIcon, BellIcon, UserCircleIcon } from '@heroicons/react/24/outline';

const navItems = [
  { label: 'Dashboard', icon: HomeIcon, path: '/institution/dashboard' },
  { label: 'Issue Certificate', icon: DocumentPlusIcon, path: '/institution/issue' },
  { label: 'Bulk Issue', icon: TableCellsIcon, path: '/institution/bulk-issue' },
  { label: 'Issue History', icon: DocumentTextIcon, path: '/institution/history' },
  { label: 'Revoke Certificate', icon: ArchiveBoxXMarkIcon, path: '/institution/revoke' },
  { label: 'Verify Certificate', icon: MagnifyingGlassIcon, path: '/institution/verify' },
  { label: 'Bulk Upload History', icon: ClockIcon, path: '/institution/bulk-history' },
  { label: 'Notifications', icon: BellIcon, path: '/institution/notifications' },
  { label: 'Profile', icon: UserCircleIcon, path: '/institution/profile' },
];

export default function InstitutionDashboard() {
  return (
    <SidebarLayout role="institution" navItems={navItems}>
      <Outlet />
    </SidebarLayout>
  );
}
