/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  User as UserIcon,
  LogOut,
  ShieldAlert,
  Menu,
  X,
  BookOpen,
  ChevronDown,
} from 'lucide-react';
import { User } from '../types';
import { store } from '../services/storage';

interface HeaderProps {
  currentUser: User | null;
  onOpenAuth: (initialTab?: 'login' | 'register') => void;
  onOpenProfile: () => void;
  onOpenAdmin: () => void;
  onOpenNotifications: () => void;
  activeSection: string;
  onNavigate: (section: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onOpenAuth,
  onOpenProfile,
  onOpenAdmin,
  onOpenNotifications,
  activeSection,
  onNavigate,
}) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateCount = () => {
      if (currentUser) {
        setUnreadCount(store.getUnreadNotificationCount(currentUser.id));
      } else {
        setUnreadCount(0);
      }
    };
    updateCount();
    const unsub = store.subscribe(updateCount);
    return () => unsub();
  }, [currentUser]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { id: 'home', label: 'الرئيسية' },
    { id: 'about', label: 'عن الكتاب' },
    { id: 'chapters', label: 'فصول الكتاب' },
    { id: 'discussions', label: 'النقاشات' },
    { id: 'articles', label: 'مقالات القراء' },
    { id: 'author', label: 'عن المؤلف' },
  ];

  const handleNavClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E8E2D6] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-2 md:gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2.5 text-right group focus:outline-none"
          >
            {/* Official Car Line-Art Logo */}
            <div className="w-12 h-10 rounded-xl bg-[#C1E2B9]/50 border border-[#268F0C]/30 flex items-center justify-center p-1 shadow-2xs transition-transform group-hover:scale-105 overflow-hidden">
              <img
                src="/images/official_logo.png"
                alt="شعار مدن الإنسان"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-stone-900 leading-tight">
                مدن الإنسان
              </span>
              <span className="text-[11px] font-medium text-stone-500 tracking-wider">
                City for Human
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links (Clean single-line prose, zero-pills) */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold text-stone-700">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`whitespace-nowrap transition-colors pb-0.5 border-b-2 ${
                activeSection === item.id
                  ? 'text-[#268F0C] border-[#268F0C] font-bold'
                  : 'border-transparent hover:text-stone-950 hover:border-stone-400'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Zone 3: Actions & Auth */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {currentUser ? (
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Notification Bell */}
              <button
                onClick={onOpenNotifications}
                className="relative p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-[#EFE9DF] transition-colors"
                title="الإشعارات"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 left-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#E84200] text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                    {unreadCount > 9 ? '+9' : unreadCount}
                  </span>
                )}
              </button>

              {/* Admin Dashboard shortcut if admin/moderator */}
              {(currentUser.role === 'admin' || currentUser.role === 'moderator') && (
                <button
                  onClick={onOpenAdmin}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#268F0C]/10 text-[#268F0C] hover:bg-[#268F0C]/20 transition-colors"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>لوحة الإدارة</span>
                </button>
              )}

              {/* User Avatar & Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-[#EFE9DF] transition-colors focus:outline-none"
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-full object-cover border border-[#D5CCBE]"
                  />
                  <span className="hidden md:inline text-xs font-bold text-stone-800 max-w-[110px] truncate">
                    {currentUser.name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-500" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-[#E2DAD0] py-2 z-50 text-right animate-in fade-in-50 zoom-in-95">
                    <div className="px-4 py-2 border-b border-[#F0EAE1]">
                      <p className="text-xs font-bold text-stone-900">{currentUser.name}</p>
                      <p className="text-[11px] text-stone-500 mt-0.5">@{currentUser.username}</p>
                      <span className="inline-block mt-1 text-[10px] font-semibold text-[#268F0C]">
                        {currentUser.role === 'admin'
                          ? 'المشرف العام (المدير)'
                          : currentUser.role === 'moderator'
                          ? 'مشرف مجتمع'
                          : 'عضو مسجل'}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onOpenProfile();
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-stone-700 hover:bg-[#FAF8F5] transition-colors"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-stone-500" />
                      <span>الملف الشخصي ومشاركاتي</span>
                    </button>

                    {(currentUser.role === 'admin' || currentUser.role === 'moderator') && (
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onOpenAdmin();
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#268F0C] hover:bg-[#FAF8F5] transition-colors"
                      >
                        <ShieldAlert className="w-3.5 h-3.5 text-[#268F0C]" />
                        <span>لوحة تحكم الإدارة</span>
                      </button>
                    )}

                    <div className="border-t border-[#F0EAE1] mt-1 pt-1">
                      <button
                        onClick={() => {
                          store.logout();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>تسجيل الخروج</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth('login')}
                className="hidden sm:block px-3.5 py-2 text-xs font-semibold text-stone-700 hover:text-stone-950 hover:bg-[#EFE9DF] rounded-lg transition-colors whitespace-nowrap"
              >
                تسجيل الدخول
              </button>
              <button
                onClick={() => onOpenAuth('register')}
                className="px-3 sm:px-4 py-2 text-xs font-bold text-white bg-[#268F0C] hover:bg-[#1f7309] rounded-lg shadow-sm transition-all whitespace-nowrap"
              >
                إنشاء حساب
              </button>
            </div>
          )}

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-stone-700 hover:bg-[#EFE9DF] transition-colors"
            aria-label="القائمة الرئيسية"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#E8E2D6] bg-[#FAF8F5] px-4 pt-3 pb-5 space-y-2 text-right shadow-lg">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full text-right px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                activeSection === item.id
                  ? 'bg-[#C1E2B9]/40 text-[#268F0C]'
                  : 'text-stone-700 hover:bg-[#EFE9DF]'
              }`}
            >
              {item.label}
            </button>
          ))}
          {!currentUser && (
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E8E2D6]">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth('login');
                }}
                className="px-3 py-2.5 rounded-lg text-sm font-semibold text-stone-700 bg-white border border-[#DDD5C7]"
              >
                تسجيل الدخول
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth('register');
                }}
                className="px-3 py-2.5 rounded-lg text-sm font-bold text-white bg-[#268F0C]"
              >
                إنشاء حساب
              </button>
            </div>
          )}
          {currentUser && (currentUser.role === 'admin' || currentUser.role === 'moderator') && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAdmin();
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-bold bg-[#268F0C]/10 text-[#268F0C]"
            >
              <span>لوحة تحكم الإدارة</span>
              <ShieldAlert className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </header>
  );
};
