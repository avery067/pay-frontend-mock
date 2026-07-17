import { Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "@/pages/landing";
import LoginPage from "@/pages/login";
import OnboardingPage from "@/pages/onboarding";
import CheckoutPage from "@/pages/checkout";
import NotFoundPage from "@/pages/not-found";
import { ConsoleLayout } from "@/components/layout/console-layout";
import OverviewPage from "@/pages/console/overview";
import SettlementPage from "@/pages/console/settlement";
import ReceivingPage from "@/pages/console/receiving";
import BalancesPage from "@/pages/console/balances";
import TransactionsPage from "@/pages/console/transactions";
import ConvertPage from "@/pages/console/convert";
import TransfersPage from "@/pages/console/transfers";
import RecipientsPage from "@/pages/console/recipients";
import PaymentsPage from "@/pages/console/payments";
import PaymentMethodsPage from "@/pages/console/payment-methods";
import AcquiringChannelsPage from "@/pages/console/acquiring-channels";
import PaymentLinksPage from "@/pages/console/payment-links";
import RiskPage from "@/pages/console/risk";
import DisputesPage from "@/pages/console/disputes";
import CardsPage from "@/pages/console/cards";
import CardholdersPage from "@/pages/console/cardholders";
import ReportsPage from "@/pages/console/reports";
import StatementsPage from "@/pages/console/statements";
import ReconciliationPage from "@/pages/console/reconciliation";
import TeamPage from "@/pages/console/team";
import DevelopersPage from "@/pages/console/developers";
import SettingsPage from "@/pages/console/settings";
import AccountPage from "@/pages/console/account";
import NotificationsPage from "@/pages/console/notifications";
import PricingPage from "@/pages/console/pricing";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/app" element={<ConsoleLayout />}>
        <Route index element={<OverviewPage />} />
        <Route path="balances" element={<BalancesPage />} />
        <Route path="transactions" element={<TransactionsPage />} />
        <Route path="convert" element={<ConvertPage />} />
        <Route path="transfers" element={<TransfersPage />} />
        <Route path="recipients" element={<RecipientsPage />} />
        <Route path="payments" element={<PaymentsPage />} />
        <Route path="methods" element={<PaymentMethodsPage />} />
        <Route path="acquiring-channels" element={<AcquiringChannelsPage />} />
        <Route path="links" element={<PaymentLinksPage />} />
        <Route path="risk" element={<RiskPage />} />
        <Route path="disputes" element={<DisputesPage />} />
        <Route path="cards" element={<CardsPage />} />
        <Route path="cardholders" element={<CardholdersPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="statements" element={<StatementsPage />} />
        <Route path="reconciliation" element={<ReconciliationPage />} />
        <Route path="team" element={<TeamPage />} />
        <Route path="developers" element={<DevelopersPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="account" element={<AccountPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="settlement" element={<SettlementPage />} />
        <Route path="receiving" element={<ReceivingPage />} />
        <Route path="pricing" element={<PricingPage />} />
        {/* 旧业务线路径重定向到商户视角页面 */}
        <Route path="issuing" element={<Navigate to="/app/cards" replace />} />
        <Route path="acquiring" element={<Navigate to="/app/payments" replace />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
