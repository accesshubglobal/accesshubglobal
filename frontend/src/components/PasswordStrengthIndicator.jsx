import React from 'react';
import { Check, X } from 'lucide-react';

const rules = [
  { id: 'len',   label: '8 caractères minimum',   test: p => p.length >= 8 },
  { id: 'upper', label: '1 lettre majuscule',      test: p => /[A-Z]/.test(p) },
  { id: 'digit', label: '1 chiffre',               test: p => /\d/.test(p) },
];

export const validatePasswordClient = (password) =>
  rules.every(r => r.test(password));

const PasswordStrengthIndicator = ({ password }) => {
  if (!password) return null;
  const passed = rules.filter(r => r.test(password)).length;
  const colors = ['bg-red-400', 'bg-amber-400', 'bg-green-500'];
  const color = colors[Math.min(passed - 1, 2)] || 'bg-red-400';

  return (
    <div className="mt-2 space-y-1.5">
      {/* Bar */}
      <div className="flex gap-1">
        {rules.map((_, i) => (
          <div key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${i < passed ? color : 'bg-gray-200'}`} />
        ))}
      </div>
      {/* Rules */}
      <div className="space-y-0.5">
        {rules.map(r => {
          const ok = r.test(password);
          return (
            <div key={r.id} className={`flex items-center gap-1.5 text-xs ${ok ? 'text-green-600' : 'text-gray-400'}`}>
              {ok ? <Check size={10} /> : <X size={10} />} {r.label}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PasswordStrengthIndicator;
