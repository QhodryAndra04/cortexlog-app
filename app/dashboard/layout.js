import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import ProtectedRoute from '@/app/components/ProtectedRoute';

export const metadata = {
  title: 'Dashboard - CortexLog',
  description: 'Dashboard untuk monitoring website',
};

export default function DashboardLayout({ children }) {
  return (
    <ProtectedRoute>
      <div className="flex flex-col h-screen w-screen m-0 p-0 overflow-hidden" style={{ backgroundColor: '#151719' }}>
        <Header />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
