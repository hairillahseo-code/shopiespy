import React, { useState } from 'react';

interface CreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCredits: number;
  onAddCredits: (amount: number) => void;
}

export const CreditsModal: React.FC<CreditsModalProps> = ({
  isOpen,
  onClose,
  currentCredits,
  onAddCredits,
}) => {
  const [selectedPack, setSelectedPack] = useState<number>(50);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleRefill = () => {
    setIsProcessing(true);
    setTimeout(() => {
      onAddCredits(selectedPack);
      setIsProcessing(false);
      onClose();
    }, 600);
  };

  const packages = [
    { credits: 25, price: '$12', perCredit: '$0.48/credit', popular: false },
    { credits: 50, price: '$19', perCredit: '$0.38/credit', popular: true },
    { credits: 150, price: '$45', perCredit: '$0.30/credit', popular: false },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-outline-variant flex items-center justify-between bg-surface-container-low/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary-container/20 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">bolt</span>
            </div>
            <div>
              <h3 className="font-bold text-base text-on-surface">Refill Copywriting Credits</h3>
              <p className="text-xs text-on-surface-variant">Instant top-up for product generation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          <div className="bg-secondary-container/20 border border-secondary-container/60 rounded-xl p-3 flex items-center justify-between text-xs">
            <span className="text-on-surface font-medium">Current Credit Balance</span>
            <span className="font-mono font-bold text-primary text-sm">{currentCredits} Credits</span>
          </div>

          <p className="text-xs text-on-surface-variant">Select a credit pack to refill your account:</p>

          <div className="flex flex-col gap-2.5">
            {packages.map((pkg) => (
              <div
                key={pkg.credits}
                onClick={() => setSelectedPack(pkg.credits)}
                className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  selectedPack === pkg.credits
                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                    : 'border-outline-variant hover:border-outline bg-surface-container-lowest'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      selectedPack === pkg.credits ? 'border-primary bg-primary' : 'border-slate-300'
                    }`}
                  >
                    {selectedPack === pkg.credits && (
                      <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-on-surface">+{pkg.credits} Credits</span>
                      {pkg.popular && (
                        <span className="text-[10px] uppercase font-bold bg-primary-container text-white px-2 py-0.5 rounded-full">
                          Best Value
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-on-surface-variant">{pkg.perCredit}</span>
                  </div>
                </div>
                <span className="text-base font-bold text-on-surface">{pkg.price}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-outline-variant bg-surface-container-low/30 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleRefill}
            disabled={isProcessing}
            className="px-5 py-2 text-xs font-semibold bg-primary hover:bg-on-primary-container text-white rounded-lg flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            {isProcessing ? 'Processing...' : `Add +${selectedPack} Credits`}
          </button>
        </div>
      </div>
    </div>
  );
};
