import Header from '../components/Header';
import ProtectedRoute from '../components/ProtectedRoute';

export default function UserManagementLayout({ children }) {
  return (
    <ProtectedRoute>
      <Header />
      {children}
    </ProtectedRoute>
  );
}
