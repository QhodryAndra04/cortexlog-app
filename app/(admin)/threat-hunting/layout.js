import Header from "@/app/components/Header";
import ProtectedRoute from "@/app/components/ProtectedRoute";

export const metadata = {
  title: "Threat Hunting - CortexLog",
  description: "Live detection logs and threat hunting interface",
};

export default function ThreatHuntingLayout({ children }) {
  return children;
}
