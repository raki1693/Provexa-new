import { Outlet } from 'react-router-dom';
import SidebarLayout from '../../components/SidebarLayout';
import { MagnifyingGlassIcon, QrCodeIcon, TableCellsIcon, ClockIcon, ExclamationTriangleIcon, ChatBubbleBottomCenterTextIcon, UserCircleIcon } from '@heroicons/react/24/outline';

const navItems = [
  { label: 'Verify by ID', icon: MagnifyingGlassIcon, path: '/employer/dashboard' },
  { label: 'Verify by QR', icon: QrCodeIcon, path: '/employer/verify-qr' },
  { label: 'Bulk Verify', icon: TableCellsIcon, path: '/employer/bulk-verify' },
  { label: 'Verification History', icon: ClockIcon, path: '/employer/history' },
  { label: 'Raise Complaint', icon: ExclamationTriangleIcon, path: '/employer/complaints/new' },
  { label: 'My Complaints', icon: ChatBubbleBottomCenterTextIcon, path: '/employer/complaints' },
  { label: 'Profile', icon: UserCircleIcon, path: '/employer/profile' },
];

export default function EmployerDashboard() {
  return (
    <SidebarLayout role="employer" navItems={navItems}>
      <Outlet />
    </SidebarLayout>
  );
}
