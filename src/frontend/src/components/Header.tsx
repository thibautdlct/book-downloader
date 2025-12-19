import { useState, useEffect, useRef } from 'react';
import { SearchBar } from './SearchBar';

interface StatusCounts {
  ongoing: number;
  completed: number;
  errored: number;
}

interface HeaderProps {
  calibreWebUrl?: string;
  logoUrl?: string;
  showSearch?: boolean;
  searchInput?: string;
  onSearchChange?: (value: string) => void;
  onSearch?: () => void;
  onAdvancedToggle?: () => void;
  isLoading?: boolean;
  onDownloadsClick?: () => void;
  onBooksClick?: () => void;
  statusCounts?: StatusCounts;
  onLogoClick?: () => void;
  authRequired?: boolean;
  isAuthenticated?: boolean;
  onLogout?: () => void;
}

export const Header = ({ 
  calibreWebUrl, 
  logoUrl,
  showSearch = false,
  searchInput = '',
  onSearchChange,
  onSearch,
  onAdvancedToggle,
  isLoading = false,
  onDownloadsClick,
  onBooksClick,
  statusCounts = { ongoing: 0, completed: 0, errored: 0 },
  onLogoClick,
  authRequired = false,
  isAuthenticated = false,
  onLogout,
}: HeaderProps) => {
  const [theme, setTheme] = useState<string>('auto');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [shouldAnimateIn, setShouldAnimateIn] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('preferred-theme') || 'auto';
    setTheme(saved);
    applyTheme(saved);
    
    // Remove preload class after initial theme is applied to enable transitions
    requestAnimationFrame(() => {
      document.documentElement.classList.remove('preload');
    });
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      if (localStorage.getItem('preferred-theme') === 'auto') {
        document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
      }
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Helper function to close dropdown with animation
  const closeDropdown = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsDropdownOpen(false);
      setIsClosing(false);
    }, 150); // Match the animation duration
  };

  // Close dropdown when clicking outside or pressing ESC
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        closeDropdown();
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeDropdown();
      }
    };

    if (isDropdownOpen && !isClosing) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isDropdownOpen, isClosing]);

  const applyTheme = (pref: string) => {
    if (pref === 'auto') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    } else {
      document.documentElement.setAttribute('data-theme', pref);
    }
  };

  const handleThemeChange = (newTheme: string) => {
    localStorage.setItem('preferred-theme', newTheme);
    setTheme(newTheme);
    applyTheme(newTheme);
  };

  const cycleTheme = () => {
    const themeOrder = ['light', 'dark', 'auto'];
    const currentIndex = themeOrder.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themeOrder.length;
    handleThemeChange(themeOrder[nextIndex]);
  };

  const handleLogout = () => {
    closeDropdown();
    onLogout?.();
  };

  const toggleDropdown = () => {
    if (isDropdownOpen) {
      closeDropdown();
    } else {
      setShouldAnimateIn(true);
      setIsDropdownOpen(true);
      // Reset animation flag after animation completes
      setTimeout(() => setShouldAnimateIn(false), 200);
    }
  };

  const handleHeaderSearch = () => {
    onSearch?.();
  };

  const handleSearchChange = (value: string) => {
    onSearchChange?.(value);
  };

  // Icon buttons component - reused for both states
  const IconButtons = () => (
    <div className="flex items-center gap-2">
      {/* Calibre-Web Button */}
      {calibreWebUrl && (
        <a
          href={calibreWebUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 rounded-full hover-action transition-all duration-200 text-gray-900 dark:text-gray-100"
          aria-label="Open Calibre-Web"
          title="Go To Library"
        >
          <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
          </svg>
          <span className="text-sm font-medium">Go To Library</span>
        </a>
      )}

      {/* Downloads Button */}
      {onDownloadsClick && (
        <button
          onClick={onDownloadsClick}
          className="relative flex items-center gap-2 px-3 py-2 rounded-full hover-action transition-all duration-200 text-gray-900 dark:text-gray-100"
          aria-label="View downloads"
          title="Downloads"
        >
          <div className="relative">
            <svg
              className="w-5 h-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
              />
            </svg>
            {/* Show badge with appropriate color based on status */}
            {(statusCounts.ongoing > 0 || statusCounts.completed > 0 || statusCounts.errored > 0) && (
            <span 
              className={`absolute -top-1 -right-1 text-white text-[0.55rem] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center ${
                  statusCounts.errored > 0 
                    ? 'bg-red-500' 
                    : statusCounts.ongoing > 0 
                    ? 'bg-blue-500' 
                    : 'bg-green-500'
                }`}
                title={`${statusCounts.ongoing} ongoing, ${statusCounts.completed} completed, ${statusCounts.errored} failed`}
              >
                {statusCounts.ongoing + statusCounts.completed + statusCounts.errored}
              </span>
            )}
          </div>
          <span className="hidden sm:inline text-sm font-medium">Downloads</span>
        </button>
      )}

      {/* Books Button */}
      {onBooksClick && (
        <button
          onClick={onBooksClick}
          className="relative flex items-center gap-2 px-3 py-2 rounded-full hover-action transition-all duration-200 text-gray-900 dark:text-gray-100"
          aria-label="View downloaded books"
          title="Livres"
        >
          <svg
            className="w-5 h-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
            />
          </svg>
          <span className="hidden sm:inline text-sm font-medium">Livres</span>
        </button>
      )}

      {/* User Menu Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={toggleDropdown}
          className={`relative p-2 rounded-full hover-action transition-colors ${
            isDropdownOpen ? 'bg-gray-100 dark:bg-gray-700' : ''
          }`}
          aria-label="User menu"
          aria-expanded={isDropdownOpen}
          aria-haspopup="true"
        >
          <svg
            className="w-5 h-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {(isDropdownOpen || isClosing) && (
          <div
            className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg border z-50 ${
              isClosing ? 'animate-fade-out-up' : shouldAnimateIn ? 'animate-fade-in-down' : ''
            }`}
            style={{
              background: 'var(--bg)',
              borderColor: 'var(--border-muted)',
            }}
          >
            <div className="py-1">
              {/* Theme Button */}
              <button
                type="button"
                onClick={cycleTheme}
                className="w-full text-left px-4 py-2 hover-surface transition-colors flex items-center gap-3"
              >
                {theme === 'light' && (
                  <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                  </svg>
                )}
                {theme === 'dark' && (
                  <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                  </svg>
                )}
                {theme === 'auto' && (
                  <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
                  </svg>
                )}
                <span>Theme: {theme.charAt(0).toUpperCase() + theme.slice(1)}</span>
              </button>


              {/* Logout Button */}
              {authRequired && isAuthenticated && onLogout && (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 hover-surface transition-colors flex items-center gap-3 text-red-600 dark:text-red-400"
                >
                  <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                  </svg>
                  <span>Sign Out</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <header
      className="w-full sticky top-0 z-40 backdrop-blur-sm header-with-fade"
      style={{ background: 'var(--bg)', paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className={`max-w-full mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-500 ${
        showSearch ? 'h-auto py-4' : 'h-24'
      }`}>
        {/* When search is active: stack on mobile, side-by-side on desktop */}
        {showSearch && (
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-3">
            {/* Logo + Icon buttons - appear first on mobile (above search), last on desktop (right side) */}
            <div className="flex items-center justify-between w-full lg:w-auto lg:justify-end lg:order-2">
              {/* Logo - visible on mobile only, aligned left */}
              {logoUrl && (
                <img 
                  src={logoUrl} 
                  onClick={onLogoClick} 
                  alt="Logo" 
                  className="h-10 w-10 flex-shrink-0 cursor-pointer lg:hidden" 
                />
              )}
              
              <IconButtons />
            </div>

            {/* Search bar - appear second on mobile (below logo+icons), first on desktop (left side) */}
            <div className="flex items-center gap-4 lg:order-1 flex-1">
              {/* Logo - visible on desktop only, aligned with search */}
              {logoUrl && (
                <img 
                  src={logoUrl} 
                  onClick={onLogoClick} 
                  alt="Logo" 
                  className="hidden lg:block h-12 w-12 flex-shrink-0 cursor-pointer" 
                />
              )}
              <SearchBar
                className="flex-1 lg:flex-initial"
                inputClassName="lg:w-[50vw]"
                value={searchInput}
                onChange={handleSearchChange}
                onSubmit={handleHeaderSearch}
                onAdvancedToggle={onAdvancedToggle}
                isLoading={isLoading}
              />
            </div>
          </div>
        )}

        {/* When search is NOT active: show icon buttons only on the right */}
        {!showSearch && (
          <div className="flex items-center justify-end h-full">
            <IconButtons />
          </div>
        )}
      </div>
    </header>
  );
};
