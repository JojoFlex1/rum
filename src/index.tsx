import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./components/AuthProvider";
import { WalletProvider } from "./components/WalletProvider";
import { MvpStartUpScreen } from "./screens/MvpStartUpScreen";
import { LoginScreen } from "./screens/LoginScreen";
import { VerificationScreen } from "./screens/VerificationScreen";
import { ProfileCreationScreen } from "./screens/ProfileCreationScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { HistoryScreen } from "./screens/HistoryScreen";
import { VoiceCommandScreen } from "./screens/VoiceCommandScreen";
import { PaymentsScreen } from "./screens/PaymentsScreen";
import { CashToPayScreen } from "./screens/CashToPayScreen";
import { PaymentSummaryScreen } from "./screens/PaymentSummaryScreen";
import { PaymentConfirmationScreen } from "./screens/PaymentConfirmationScreen";
import { ScanToPayScreen } from "./screens/ScanToPayScreen";
import { TapToPayScreen } from "./screens/TapToPayScreen";
import { CollectiblesScreen } from "./screens/CollectiblesScreen";
import { LeaderboardScreen } from "./screens/CollectiblesScreen/LeaderboardScreen";
import { OffersScreen } from "./screens/OffersScreen";
import { PassportScreen } from "./screens/PassportScreen";
import { ConnectScreen } from "./screens/ConnectScreen";

createRoot(document.getElementById("app") as HTMLElement).render(
  <StrictMode>
    <AuthProvider>
      <WalletProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MvpStartUpScreen />} />
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/verify" element={<VerificationScreen />} />
            <Route path="/create-profile" element={<ProfileCreationScreen />} />
            <Route path="/home" element={<HomeScreen />} />
            <Route path="/history" element={<HistoryScreen />} />
            <Route path="/voice-command" element={<VoiceCommandScreen />} />
            <Route path="/payments" element={<PaymentsScreen />} />
            <Route path="/cash-to-pay" element={<CashToPayScreen />} />
            <Route path="/payment-summary" element={<PaymentSummaryScreen />} />
            <Route path="/payment-confirmation" element={<PaymentConfirmationScreen />} />
            <Route path="/scan-to-pay" element={<ScanToPayScreen />} />
            <Route path="/tap-to-pay" element={<TapToPayScreen />} />
            <Route path="/collectibles" element={<CollectiblesScreen />} />
            <Route path="/collectibles/leaderboard" element={<LeaderboardScreen />} />
            <Route path="/offers" element={<OffersScreen />} />
            <Route path="/passport" element={<PassportScreen />} />
            <Route path="/connect" element={<ConnectScreen />} />
          </Routes>
        </BrowserRouter>
      </WalletProvider>
    </AuthProvider>
  </StrictMode>
);