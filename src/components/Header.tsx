import React, { useState } from 'react';

interface HeaderProps {
  activeTab: 'single' | 'bulk' | 'blog' | 'pricing';
  setActiveTab: (tab: 'single' | 'bulk' | 'blog' | 'pricing') => void;
  credits: number;
  onOpenCreditsModal: () => void;
  onToggleNotifications: () => void;
  hasUnreadNotifications: boolean;
  onOpenStoreModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  credits,
  onOpenCreditsModal,
  onToggleNotifications,
  hasUnreadNotifications,
  onOpenStoreModal,
}) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  return (
    <header className="w-full sticky top-0 z-40 bg-surface-container-lowest border-b border-outline-variant shadow-xs">
      <div className="w-full px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 max-w-[1600px] mx-auto">
        {/* Brand & Left Section */}
        <div className="flex items-center gap-8">
          <div
            onClick={() => setActiveTab('single')}
            className="flex items-center gap-2 cursor-pointer select-none group"
          >
            <div className="w-9 h-9 rounded-lg bg-primary-container flex items-center justify-center text-on-primary shadow-xs group-hover:bg-primary transition-colors">
              <span className="material-symbols-outlined text-[20px]">trending_up</span>
            </div>
            <span className="font-bold text-2xl text-primary tracking-tight">ShopieSpy</span>
            <span className="bg-secondary-fixed text-on-secondary-fixed text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ml-1">
              AI Pro
            </span>
          </div>

          {/* Center Nav items */}
          <nav className="hidden md:flex items-center gap-6">
            <button
              onClick={() => setActiveTab('single')}
              className={`font-semibold text-sm pb-1 flex items-center gap-1.5 transition-colors cursor-pointer border-b-2 ${
                activeTab === 'single'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">edit_note</span>
              Single Writer
            </button>
            <button
              onClick={() => setActiveTab('bulk')}
              className={`font-semibold text-sm pb-1 flex items-center gap-1.5 transition-colors cursor-pointer border-b-2 ${
                activeTab === 'bulk'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">table_chart</span>
              Bulk CSV
            </button>
            <button
              onClick={() => setActiveTab('blog')}
              className={`font-semibold text-sm pb-1 flex items-center gap-1.5 transition-colors cursor-pointer border-b-2 ${
                activeTab === 'blog'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">article</span>
              Blog &amp; Pins
            </button>
            <button
              onClick={() => setActiveTab('pricing')}
              className={`font-semibold text-sm pb-1 flex items-center gap-1.5 transition-colors cursor-pointer border-b-2 ${
                activeTab === 'pricing'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">payments</span>
              Pricing
            </button>
          </nav>
        </div>

        {/* Right Action Cluster */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Credit Counter Pill */}
          <div className="flex items-center bg-surface-container-low border border-outline-variant/60 rounded-full pl-3 pr-1.5 py-1 gap-2 shadow-xs">
            <span className="material-symbols-outlined text-primary text-[18px]">bolt</span>
            <span className="text-xs sm:text-sm text-on-surface font-semibold whitespace-nowrap">
              Credits: <span className="text-primary font-bold">{credits} remaining</span>
            </span>
            <button
              onClick={onOpenCreditsModal}
              className="w-6 h-6 rounded-full bg-primary-container text-on-primary flex items-center justify-center hover:bg-primary transition-colors focus:outline-hidden focus:ring-2 focus:ring-primary/40 cursor-pointer"
              title="Refill credits"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
            </button>
          </div>

          {/* Notification Icon */}
          <button
            onClick={onToggleNotifications}
            aria-label="Notifications"
            className="w-9 h-9 rounded-lg border border-outline-variant/60 flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors relative cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            {hasUnreadNotifications && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-primary-container rounded-full ring-2 ring-white"></span>
            )}
          </button>

          {/* User Dropdown & Profile */}
          <div className="relative">
            <div
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2 pl-2 border-l border-outline-variant cursor-pointer group select-none"
            >
              <img
                className="w-9 h-9 rounded-full object-cover ring-2 ring-primary-container/20 group-hover:ring-primary-container transition-all"
                alt="Sarah Jenkins profile"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB1CvSsmEcV-SuqoCa7PmDzdl_nh_AfZ09gw9AVaF5r_X7DYEiMfSdfWZTVG4N-2T5pgt6PYGH8s5N1-ArR55nkSoI70hUCGv2WlgauunZNJW6-aAeEJL2cZ4abp31JXzsLCyMchI_2HdIYRD7kP-SGGJ0hj-59C10ETvDr4JzeiRv78QgeGO2FwQ5GOikDVxqUoAhLqqmD3Z1L7WuhDji_bvGRdnbQFFi6Ki7oLyl3lXjtPEoD4PEsiw"
              />
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-xs text-on-surface font-semibold leading-tight">Sarah Jenkins</span>
                <span className="text-[11px] text-on-surface-variant leading-tight">Nordic Goods Store</span>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant text-[18px] group-hover:text-on-surface">
                arrow_drop_down
              </span>
            </div>

            {/* Profile Dropdown Menu */}
            {profileDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setProfileDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-64 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg py-2 z-40">
                  <div className="px-4 py-2.5 border-b border-outline-variant/60">
                    <p className="text-xs text-on-surface-variant">Connected Shopify Store</p>
                    <p className="text-sm font-bold text-on-surface flex items-center gap-1.5 mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      nordic-goods.myshopify.com
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onOpenStoreModal();
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-surface-container-low flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px] text-primary">storefront</span>
                    Manage Store Connection
                  </button>
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onOpenCreditsModal();
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-surface-container-low flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px] text-primary">bolt</span>
                    Subscription &amp; Credits ({credits})
                  </button>
                  <div className="border-t border-outline-variant/60 my-1"></div>
                  <div className="px-4 py-1.5 text-[11px] text-on-surface-variant flex justify-between items-center">
                    <span>API Bridge v2.4</span>
                    <span className="text-emerald-600 font-semibold">Active</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
