import Header from "@/app/components/Header";
import ProtectedRoute from "@/app/components/ProtectedRoute";

export const metadata = {
  title: "Threat Hunting - CortexLog",
  description: "Live detection logs and threat hunting interface",
};

export default function ThreatHuntingLayout({ children }) {
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
