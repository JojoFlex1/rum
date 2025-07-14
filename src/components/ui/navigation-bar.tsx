import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, History, Import as Passport, CreditCard, Gift } from "lucide-react";

interface NavItem {
  path: string;
  icon: React.ComponentType<{ size: number; className?: string; "aria-hidden"?: boolean }>;
  label: string;
  ariaLabel: string;
}

const navItems: NavItem[] = [
  { 
    path: "/payments", 
    icon: CreditCard, 
    label: "Wallet",
    ariaLabel: "Navigate to wallet and payment methods"
  },
  { 
    path: "/offers", 
    icon: Gift, 
    label: "Offers",
    ariaLabel: "View special offers and rewards"
  },
  { 
    path: "/home", 
    icon: Home, 
    label: "Home",
    ariaLabel: "Navigate to home screen"
  },
  { 
    path: "/history", 
    icon: History, 
    label: "History",
    ariaLabel: "View transaction history"
  },
  { 
    path: "/passport", 
    icon: Passport, 
    label: "Passport",
    ariaLabel: "View travel passport and collectibles"
  }
];

export const NavigationBar = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleKeyDown = (event: React.KeyboardEvent, path: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      navigate(path);
    }
  };

  return (
    <nav 
      className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-[393px] h-[83px] bg-[#1F2024]/90 backdrop-blur-lg border-t border-white/10 z-50"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex justify-around items-center h-full px-4">
        {navItems.map(({ path, icon: Icon, label, ariaLabel }) => {
          const isActive = location.pathname === path;
          
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              onKeyDown={(e) => handleKeyDown(e, path)}
              className={`
                flex flex-col items-center p-3 rounded-xl transition-all duration-200 min-w-[60px]
                focus:outline-none focus:ring-2 focus:ring-[#CBAB58] focus:ring-offset-2 focus:ring-offset-[#1F2024]
                hover:bg-white/10 active:scale-95
                ${isActive ? 'bg-[#CBAB58]/20 shadow-lg' : ''}
              `}
              aria-label={ariaLabel}
              aria-current={isActive ? 'page' : undefined}
              tabIndex={0}
            >
              <Icon 
                size={24} 
                className={`transition-colors duration-200 ${
                  isActive ? "text-[#CBAB58]" : "text-white/80"
                }`}
                aria-hidden="true"
              />
              <span 
                className={`text-xs mt-1 transition-colors duration-200 font-medium ${
                  isActive ? "text-[#CBAB58]" : "text-white/80"
                }`}
              >
                {label}
              </span>
              {isActive && (
                <div 
                  className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-[#CBAB58] rounded-full"
                  aria-hidden="true"
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};