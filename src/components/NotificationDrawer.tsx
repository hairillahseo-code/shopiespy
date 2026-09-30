import React from 'react';

interface Notification {
  id: string;
  title: string;
  desc: string;
  time: string;
  type: 'system' | 'sync' | 'credit';
  read: boolean;
}

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkAllAsRead: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
}) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute right-4 sm:right-8 top-18 w-80 sm:w-96 bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
        <div className="px-4 py-3 border-b border-outline-variant/60 flex items-center justify-between bg-surface-container-low/40">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[18px]">notifications</span>
            <span className="font-bold text-sm text-on-surface">Notifications</span>
          </div>
          <button
            onClick={onMarkAllAsRead}
            className="text-[11px] text-primary hover:underline font-semibold cursor-pointer"
          >
            Mark all read
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto divide-y divide-outline-variant/40">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-3.5 flex gap-3 transition-colors ${
                n.read ? 'bg-surface-container-lowest' : 'bg-primary/5'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                  n.type === 'sync'
                    ? 'bg-emerald-100 text-emerald-700'
                    : n.type === 'credit'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-blue-100 text-blue-700'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {n.type === 'sync' ? 'storefront' : n.type === 'credit' ? 'bolt' : 'verified'}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-on-surface">{n.title}</h4>
                  <span className="text-[10px] text-on-surface-variant">{n.time}</span>
                </div>
                <p className="text-xs text-on-surface-variant/90 mt-0.5 leading-snug">{n.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
