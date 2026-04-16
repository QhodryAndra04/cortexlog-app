import Header from '../components/Header';
import ProtectedRoute from '../components/ProtectedRoute';

export default function UserManagementLayout({ children }) {
  return (
    <ProtectedRoute>
      <div className="flex flex-col h-screen w-screen m-0 p-0 overflow-hidden bg-[#151719]">
        <Header />
        <main id="main-content" className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
