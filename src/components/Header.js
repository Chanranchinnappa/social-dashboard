import React from 'react';
import { Menu, Bell, Sun, Moon, LogOut, ChevronDown } from 'lucide-react';
import { Avatar } from './Avatar';
import { Button } from './Button';

export const Header = React.forwardRef(function Header(
  {
    title = '',
    subtitle = '',
    showBack = false,
    onBack,
    onMenuClick,
    onNotificationClick,
    onThemeToggle,
    onLogout,
    userProfile,
    theme = 'light',
    notificationCount = 0,
    actions = [],
    className = '',
  },
  ref
) {
  return (
    <header ref={ref} className={['header', className].filter(Boolean).join(' ')}>
      <div className="header-left">
        {showBack && (
          <button
            type="button"
            className="header-back-btn"
            onClick={onBack}
            aria-label="Go back"
          >
            <ChevronDown size={20} style={{ transform: 'rotate(90deg)' }} />
          </button>
        )}
        {onMenuClick && (
          <button
            type="button"
            className="header-menu-btn"
            onClick={onMenuClick}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
        )}
        <div className="header-title-group">
          {title && <h1 className="header-title">{title}</h1>}
          {subtitle && <p className="header-subtitle">{subtitle}</p>}
        </div>
      </div>

      {actions.length > 0 && (
        <div className="header-actions">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || 'outline'}
              size={action.size || 'sm'}
              icon={action.icon}
              onClick={action.onClick}
              disabled={action.disabled}
            >
              {action.label}
            </Button>
          ))}
        </div>
      )}

      <div className="header-right">
        <button
          type="button"
          className="header-icon-btn"
          onClick={onNotificationClick}
          aria-label="Notifications"
        >
          <Bell size={20} />
          {notificationCount > 0 && (
            <span className="header-badge">{notificationCount}</span>
          )}
        </button>

        <button
          type="button"
          className="header-icon-btn"
          onClick={onThemeToggle}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {userProfile && (
          <div className="header-user">
            <Avatar
              src={userProfile.avatar}
              name={userProfile.name}
              size="sm"
            />
            <span className="header-user-name">{userProfile.name}</span>
          </div>
        )}

        {onLogout && (
          <button
            type="button"
            className="header-logout-btn"
            onClick={onLogout}
            aria-label="Log out"
          >
            <LogOut size={20} />
          </button>
        )}
      </div>
    </header>
  );
});
