import React from 'react';
import { UserRole } from '../types/addon';
import { Crown, Wrench, User } from 'lucide-react';

interface UserRoleBadgeProps {
  role: UserRole;
  tagText?: string;
  tagColor?: string;
  customLogoUrl?: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const UserRoleBadge: React.FC<UserRoleBadgeProps> = ({
  role,
  tagText,
  tagColor,
  customLogoUrl,
  size = 'md',
  showIcon = true,
}) => {
  const displayTag = tagText || (role === 'owner' ? 'Owner' : role === 'admin' ? 'Admin' : 'Visitor');
  const color = tagColor || (role === 'owner' ? '#10b981' : role === 'admin' ? '#38bdf8' : '#64748b');

  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5 gap-1',
    md: 'text-xs px-2 py-0.5 gap-1.5',
    lg: 'text-sm px-3 py-1 gap-2',
  }[size];

  const iconSize = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  }[size];

  const renderIcon = () => {
    if (!showIcon) return null;

    if (role === 'owner') {
      if (customLogoUrl) {
        return (
          <img
            src={customLogoUrl}
            alt="Owner Logo"
            className={`${iconSize} aspect-square object-cover rounded-sm`}
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        );
      }
      return <Crown className={`${iconSize} text-emerald-400 drop-shadow`} />;
    }

    if (role === 'admin') {
      return <Wrench className={`${iconSize}`} />;
    }

    return <User className={`${iconSize}`} />;
  };

  return (
    <span
      className={`inline-flex items-center font-bold rounded-lg border shadow-sm transition ${sizeClasses}`}
      style={{
        backgroundColor: `${color}20`,
        borderColor: `${color}60`,
        color: color,
      }}
    >
      {renderIcon()}
      <span>{displayTag}</span>
    </span>
  );
};
