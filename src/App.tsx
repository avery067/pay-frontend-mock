import { Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "@/pages/landing";
import LoginPage from "@/pages/login";
import { ConsoleLayout } from "@/components/layout/console-layout";
import OverviewPage from "@/pages/console/overview";
import SettlementPage from "@/pages/console/settlement";
import IssuingPage from "@/pages/console/issuing";
import AcquiringPage from "@/pages/console/acquiring";
import PlaceholderPage from "@/pages/console/placeholder";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/app" element={<ConsoleLayout />}>
        <Route index element={<OverviewPage />} />
        <Route path="settlement" element={<SettlementPage />} />
        <Route path="issuing" element={<IssuingPage />} />
        <Route path="acquiring" element={<AcquiringPage />} />
        <Route path="settings" element={<PlaceholderPage sectionKey="nav.settings" />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
