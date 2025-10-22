'use client';

import React, { useMemo } from 'react';
import * as Icon from '@phosphor-icons/react/dist/ssr';

export interface PasswordStrength {
  score: number; // 0-4 (0=weak, 4=very strong)
  label: string;
  color: string;
  bgColor: string;
  checks: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
  };
}

interface PasswordStrengthIndicatorProps {
  password: string;
  minLength?: number;
}

export const calculatePasswordStrength = (password: string, minLength: number = 8): PasswordStrength => {
  const checks = {
    minLength: password.length >= minLength,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
  };

  const passedChecks = Object.values(checks).filter(Boolean).length;

  let score = 0;
  let label = '';
  let color = '';
  let bgColor = '';

  if (password.length === 0) {
    score = 0;
    label = '';
    color = 'text-gray-400';
    bgColor = 'bg-gray-200';
  } else if (passedChecks <= 2) {
    score = 1;
    label = 'Weak';
    color = 'text-red-600';
    bgColor = 'bg-red-500';
  } else if (passedChecks === 3) {
    score = 2;
    label = 'Fair';
    color = 'text-orange-600';
    bgColor = 'bg-orange-500';
  } else if (passedChecks === 4) {
    score = 3;
    label = 'Good';
    color = 'text-yellow-600';
    bgColor = 'bg-yellow-500';
  } else {
    score = 4;
    label = 'Strong';
    color = 'text-green-600';
    bgColor = 'bg-green-500';
  }

  return { score, label, color, bgColor, checks };
};

export default function PasswordStrengthIndicator({ password, minLength = 8 }: PasswordStrengthIndicatorProps) {
  const strength = useMemo(() => calculatePasswordStrength(password, minLength), [password, minLength]);

  if (!password) return null;

  return (
    <div className="mt-3">
      {/* Strength Meter */}
      <div className="flex items-center gap-2 mb-2">
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${strength.bgColor}`}
            style={{ width: `${(strength.score / 4) * 100}%` }}
          />
        </div>
        {strength.label && (
          <span className={`text-xs font-medium ${strength.color}`}>
            {strength.label}
          </span>
        )}
      </div>

      {/* Requirements Checklist */}
      <div className="space-y-1">
        <RequirementItem
          met={strength.checks.minLength}
          text={`At least ${minLength} characters`}
        />
        <RequirementItem
          met={strength.checks.hasUppercase}
          text="One uppercase letter"
        />
        <RequirementItem
          met={strength.checks.hasLowercase}
          text="One lowercase letter"
        />
        <RequirementItem
          met={strength.checks.hasNumber}
          text="One number"
        />
        <RequirementItem
          met={strength.checks.hasSpecialChar}
          text="One special character (!@#$%^&*...)"
        />
      </div>
    </div>
  );
}

function RequirementItem({ met, text }: { met: boolean; text: string }) {
  return (
    <div className={`flex items-center gap-2 text-xs ${met ? 'text-green-600' : 'text-gray-500'}`}>
      {met ? (
        <Icon.CheckCircle size={14} weight="fill" />
      ) : (
        <Icon.Circle size={14} />
      )}
      <span>{text}</span>
    </div>
  );
}
