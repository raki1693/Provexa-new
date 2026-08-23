import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

// Public pages
import Home from './pages/Home';
import PublicVerify from './pages/PublicVerify';
import ForgotPassword from './pages/ForgotPassword';

// Student pages
import StudentLogin from './pages/student/StudentLogin';
import StudentRegister from './pages/student/StudentRegister';
import StudentOTP from './pages/student/StudentOTP';
import StudentDashboard from './pages/student/StudentDashboard';
import MyCertificates from './pages/student/MyCertificates';
import CertificateView from './pages/student/CertificateView';
import SelfVerify from './pages/student/SelfVerify';
import StudentNotifications from './pages/student/StudentNotifications';
import StudentProfile from './pages/student/StudentProfile';

// Institution pages
import InstitutionLogin from './pages/institution/InstitutionLogin';
import InstitutionRegister from './pages/institution/InstitutionRegister';
import InstitutionDashboard from './pages/institution/InstitutionDashboard';
import InstitutionOverview from './pages/institution/InstitutionOverview';
import IssueCertificate from './pages/institution/IssueCertificate';
import BulkIssue from './pages/institution/BulkIssue';
import IssueHistory from './pages/institution/IssueHistory';
import RevokeCertificate from './pages/institution/RevokeCertificate';
import VerifyCertificate from './pages/institution/VerifyCertificate';
import BulkHistory from './pages/institution/BulkHistory';
import InstitutionNotifications from './pages/institution/InstitutionNotifications';
import InstitutionProfile from './pages/institution/InstitutionProfile';

// Employer pages
import EmployerLogin from './pages/employer/EmployerLogin';
import EmployerRegister from './pages/employer/EmployerRegister';
import EmployerOTP from './pages/employer/EmployerOTP';
import EmployerDashboard from './pages/employer/EmployerDashboard';
import VerifyByID from './pages/employer/VerifyByID';
import VerifyByQR from './pages/employer/VerifyByQR';
import BulkVerify from './pages/employer/BulkVerify';
import VerificationHistory from './pages/employer/VerificationHistory';
import RaiseComplaint from './pages/employer/RaiseComplaint';
import MyComplaints from './pages/employer/MyComplaints';
import EmployerProfile from './pages/employer/EmployerProfile';

// Admin pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminTOTP from './pages/admin/AdminTOTP';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOverview from './pages/admin/AdminOverview';
import InstitutionApprovals from './pages/admin/InstitutionApprovals';
import ManageStudents from './pages/admin/ManageStudents';
import ManageEmployers from './pages/admin/ManageEmployers';
import ComplaintsPanel from './pages/admin/ComplaintsPanel';
import AuditLogs from './pages/admin/AuditLogs';
import Reports from './pages/admin/Reports';
import SystemSettings from './pages/admin/SystemSettings';
import AdminProfile from './pages/admin/AdminProfile';

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/verify/:certId" element={<PublicVerify />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Student portal */}
      <Route path="/student/login" element={<StudentLogin />} />
      <Route path="/student/register" element={<StudentRegister />} />
      <Route path="/student/verify-otp" element={<StudentOTP />} />
      <Route
        path="/student/*"
        element={
          <ProtectedRoute allowedRole="student">
            <StudentDashboard />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<MyCertificates />} />
        <Route path="certificate/:certId" element={<CertificateView />} />
        <Route path="verify" element={<SelfVerify />} />
        <Route path="notifications" element={<StudentNotifications />} />
        <Route path="profile" element={<StudentProfile />} />
      </Route>

      {/* Institution portal */}
      <Route path="/institution/login" element={<InstitutionLogin />} />
      <Route path="/institution/register" element={<InstitutionRegister />} />
      <Route
        path="/institution/*"
        element={
          <ProtectedRoute allowedRole="institution">
            <InstitutionDashboard />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<InstitutionOverview />} />
        <Route path="issue" element={<IssueCertificate />} />
        <Route path="bulk-issue" element={<BulkIssue />} />
        <Route path="history" element={<IssueHistory />} />
        <Route path="revoke" element={<RevokeCertificate />} />
        <Route path="verify" element={<VerifyCertificate />} />
        <Route path="bulk-history" element={<BulkHistory />} />
        <Route path="notifications" element={<InstitutionNotifications />} />
        <Route path="profile" element={<InstitutionProfile />} />
      </Route>

      {/* Employer portal */}
      <Route path="/employer/login" element={<EmployerLogin />} />
      <Route path="/employer/register" element={<EmployerRegister />} />
      <Route path="/employer/verify-otp" element={<EmployerOTP />} />
      <Route
        path="/employer/*"
        element={
          <ProtectedRoute allowedRole="employer">
            <EmployerDashboard />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<VerifyByID />} />
        <Route path="verify-qr" element={<VerifyByQR />} />
        <Route path="bulk-verify" element={<BulkVerify />} />
        <Route path="history" element={<VerificationHistory />} />
        <Route path="complaints/new" element={<RaiseComplaint />} />
        <Route path="complaints" element={<MyComplaints />} />
        <Route path="profile" element={<EmployerProfile />} />
      </Route>

      {/* Admin portal */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/verify-totp" element={<AdminTOTP />} />
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminOverview />} />
        <Route path="institutions" element={<InstitutionApprovals />} />
        <Route path="students" element={<ManageStudents />} />
        <Route path="employers" element={<ManageEmployers />} />
        <Route path="complaints" element={<ComplaintsPanel />} />
        <Route path="audit-logs" element={<AuditLogs />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<SystemSettings />} />
        <Route path="profile" element={<AdminProfile />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
