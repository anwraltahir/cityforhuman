/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { store } from '../services/storage';
import { useToast } from './Toast';
import { X, LogIn, UserPlus, Sparkles, Check, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  initialTab?: 'login' | 'register';
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  initialTab = 'login',
  onClose,
  onSuccess,
}) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'forgot'>(initialTab);

  // Form states
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');

  // Register states
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPasswordConfirm, setRegPasswordConfirm] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrUsername.trim()) {
      showToast('يرجى كتابة البريد الإلكتروني أو اسم المستخدم', 'error');
      return;
    }
    const res = store.login(emailOrUsername);
    if (res.success) {
      showToast(`أهلاً بك مجدداً يا ${res.user?.name}!`, 'success');
      onSuccess();
      onClose();
    } else {
      showToast(res.error || 'فشل تسجيل الدخول', 'error');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !username.trim() || !email.trim() || !regPassword) {
      showToast('يرجى ملء كافة الحقول الإلزامية', 'error');
      return;
    }
    if (regPassword !== regPasswordConfirm) {
      showToast('كلمتا المرور غير متطابقتين', 'error');
      return;
    }
    if (!agreeTerms) {
      showToast('يجب الموافقة على شروط الاستخدام', 'error');
      return;
    }

    const res = store.register(name, username, email);
    if (res.success) {
      showToast(`تم إنشاء حسابك بنجاح! مرحباً بك في مجتمع مدن الإنسان`, 'success');
      onSuccess();
      onClose();
    } else {
      showToast(res.error || 'تعذر إنشاء الحساب', 'error');
    }
  };

  const handleQuickLogin = (emailTarget: string) => {
    const res = store.login(emailTarget);
    if (res.success) {
      showToast(`تم الدخول بنجاح بحساب ${res.user?.name}`, 'success');
      onSuccess();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#E0D8CB] overflow-hidden text-right">
        {/* Header Tabs */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-[#F0EAE1] bg-[#FAF8F5]">
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-[#EFEAE2] rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 p-1 bg-white rounded-xl border border-[#DDD5C7]">
            <button
              onClick={() => setActiveTab('login')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                activeTab === 'login' ? 'bg-[#268F0C] text-white shadow-xs' : 'text-stone-600'
              }`}
            >
              تسجيل الدخول
            </button>
            <button
              onClick={() => setActiveTab('register')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                activeTab === 'register' ? 'bg-[#268F0C] text-white shadow-xs' : 'text-stone-600'
              }`}
            >
              حساب جديد
            </button>
          </div>
        </div>

        {/* Quick Demo Switcher Strip */}
        <div className="bg-[#FAF7F0] px-6 py-2.5 border-b border-[#EAE3D6]">
          <p className="text-[11px] font-bold text-stone-600 flex items-center gap-1.5 mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#E84200]" />
            <span>تجربة المنصة الفورية بصلاحيات مختلفة:</span>
          </p>
          <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
            <button
              type="button"
              onClick={() => handleQuickLogin('osman7777@gmail.com')}
              className="text-[10px] font-bold px-2 py-1 bg-white border border-[#DDD5C7] rounded-lg text-stone-700 hover:border-[#268F0C] hover:text-[#268F0C] whitespace-nowrap cursor-pointer"
            >
              المؤلف عثمان (المدير)
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('sara@example.com')}
              className="text-[10px] font-bold px-2 py-1 bg-white border border-[#DDD5C7] rounded-lg text-stone-700 hover:border-[#268F0C] hover:text-[#268F0C] whitespace-nowrap cursor-pointer"
            >
              د. سارة (مشرف)
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('tariq@example.com')}
              className="text-[10px] font-bold px-2 py-1 bg-white border border-[#DDD5C7] rounded-lg text-stone-700 hover:border-[#268F0C] hover:text-[#268F0C] whitespace-nowrap cursor-pointer"
            >
              م. طارق (عضو)
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  البريد الإلكتروني أو اسم المستخدم
                </label>
                <input
                  type="text"
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  placeholder="osman7777@gmail.com"
                  className="w-full p-3 bg-[#FAF8F5] border border-[#DDD5C7] rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-[#268F0C]"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <button
                    type="button"
                    onClick={() => setActiveTab('forgot')}
                    className="text-[11px] text-[#268F0C] hover:underline"
                  >
                    نسيت كلمة المرور؟
                  </button>
                  <label className="block text-xs font-bold text-stone-700">كلمة المرور</label>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-3 bg-[#FAF8F5] border border-[#DDD5C7] rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-[#268F0C]"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#268F0C] hover:bg-[#1f7309] text-white font-bold text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <LogIn className="w-4 h-4 text-[#C1E2B9]" />
                <span>تسجيل الدخول</span>
              </button>
            </form>
          )}

          {activeTab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3.5 max-h-[60vh] overflow-y-auto pr-1">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">الاسم الكامل</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: أحمد عبد الله"
                  className="w-full p-2.5 bg-[#FAF8F5] border border-[#DDD5C7] rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-[#268F0C]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">اسم المستخدم (بالحروف الإنجليزية)</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                  placeholder="ahmed_urban"
                  className="w-full p-2.5 bg-[#FAF8F5] border border-[#DDD5C7] rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-[#268F0C]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">البريد الإلكتروني</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full p-2.5 bg-[#FAF8F5] border border-[#DDD5C7] rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-[#268F0C]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">كلمة المرور</label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-2.5 bg-[#FAF8F5] border border-[#DDD5C7] rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-[#268F0C]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">تأكيد كلمة المرور</label>
                <input
                  type="password"
                  value={regPasswordConfirm}
                  onChange={(e) => setRegPasswordConfirm(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-2.5 bg-[#FAF8F5] border border-[#DDD5C7] rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-[#268F0C]"
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="agree"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 rounded text-[#268F0C] focus:ring-[#268F0C]"
                />
                <label htmlFor="agree" className="text-xs text-stone-600">
                  أوافق على <span className="text-[#268F0C] font-semibold">شروط الاستخدام</span> وسياسة خصوصية المجتمع.
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#268F0C] hover:bg-[#1f7309] text-white font-bold text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <UserPlus className="w-4 h-4 text-[#C1E2B9]" />
                <span>إنشاء الحساب والانضمام</span>
              </button>
            </form>
          )}

          {activeTab === 'forgot' && (
            <div className="space-y-4">
              <p className="text-xs text-stone-600 leading-relaxed">
                أدخل بريدك الإلكتروني المسجل وسنرسل لك رابط استعادة وتعيين كلمة المرور.
              </p>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">البريد الإلكتروني</label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  className="w-full p-3 bg-[#FAF8F5] border border-[#DDD5C7] rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-[#268F0C]"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  showToast('تم إرسال تعليمات الاستعادة إلى بريدك الإلكتروني', 'success');
                  setActiveTab('login');
                }}
                className="w-full py-2.5 bg-[#268F0C] text-white font-bold text-xs sm:text-sm rounded-xl"
              >
                إرسال رابط الاستعادة
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('login')}
                className="w-full text-center text-xs text-stone-500 hover:underline pt-2 block"
              >
                العودة لتسجيل الدخول
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
