/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, Discussion } from '../types';
import { store } from '../services/storage';
import { useToast } from './Toast';
import {
  X,
  User as UserIcon,
  Calendar,
  MessageSquare,
  Bookmark,
  Edit3,
  Check,
  Heart,
  Eye,
} from 'lucide-react';

interface UserProfileModalProps {
  user: User;
  onClose: () => void;
  onSelectDiscussion: (discussionId: string) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  user,
  onClose,
  onSelectDiscussion,
}) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'my_discussions' | 'following' | 'edit'>('my_discussions');

  // Edit states
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio || '');
  const [avatar, setAvatar] = useState(user.avatar);

  const allDiscussions = store.getDiscussions();
  const myDiscussions = allDiscussions.filter((d) => d.authorId === user.id);
  const followedDiscussions = allDiscussions.filter((d) => d.followers.includes(user.id));

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    store.updateUserProfile(user.id, { name, bio, avatar });
    showToast('تم تحديث ملفك الشخصي بنجاح', 'success');
    setActiveTab('my_discussions');
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#E0D8CB] overflow-hidden text-right">
        {/* Header Profile Hero */}
        <div className="relative p-6 bg-gradient-to-l from-[#FAF8F5] to-[#F2ECE3] border-b border-[#E3DBD0]">
          <button
            onClick={onClose}
            className="absolute left-4 top-4 p-1.5 text-stone-400 hover:text-stone-700 hover:bg-white/80 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-20 h-20 rounded-full object-cover border-2 border-white shadow-md"
            />
            <div className="text-center sm:text-right space-y-1">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <h2 className="text-xl font-extrabold text-stone-900">{user.name}</h2>
                <span className="text-[11px] font-bold text-[#268F0C] bg-[#268F0C]/10 px-2 py-0.5 rounded-full">
                  {user.role === 'admin'
                    ? 'المشرف العام'
                    : user.role === 'moderator'
                    ? 'مشرف مجتمع'
                    : 'قارئ مشارك'}
                </span>
              </div>
              <p className="text-xs text-stone-500">@{user.username}</p>
              <p className="text-xs text-stone-700 max-w-md pt-1 leading-relaxed">
                {user.bio || 'عضو مهتم بمستقبل المدن الإنسانية وبناء مجتمعات خضراء قابلة للمشي.'}
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-stone-400 pt-1 justify-center sm:justify-start">
                <Calendar className="w-3.5 h-3.5" />
                <span>انضم في {formatDate(user.joinedAt)}</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-3 mt-6 pt-4 border-t border-[#E5DDD0] text-center">
            <div className="bg-white/70 p-2.5 rounded-xl border border-[#E0D8CB]">
              <span className="block text-lg font-bold text-stone-900 tabular-nums">
                {myDiscussions.length}
              </span>
              <span className="text-[11px] text-stone-500">نقاشات منشورة</span>
            </div>
            <div className="bg-white/70 p-2.5 rounded-xl border border-[#E0D8CB]">
              <span className="block text-lg font-bold text-stone-900 tabular-nums">
                {followedDiscussions.length}
              </span>
              <span className="text-[11px] text-stone-500">نقاشات أتابعها</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-between px-6 pt-3 border-b border-[#F0EAE1] bg-white">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('my_discussions')}
              className={`pb-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                activeTab === 'my_discussions'
                  ? 'border-[#268F0C] text-[#268F0C]'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              نقاشاتي ({myDiscussions.length})
            </button>
            <button
              onClick={() => setActiveTab('following')}
              className={`pb-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                activeTab === 'following'
                  ? 'border-[#268F0C] text-[#268F0C]'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              المتابعات ({followedDiscussions.length})
            </button>
            <button
              onClick={() => setActiveTab('edit')}
              className={`pb-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                activeTab === 'edit'
                  ? 'border-[#268F0C] text-[#268F0C]'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              تعديل بياناتي
            </button>
          </div>
        </div>

        {/* Tab Body */}
        <div className="p-6 max-h-[50vh] overflow-y-auto">
          {activeTab === 'my_discussions' && (
            <div className="space-y-3">
              {myDiscussions.length === 0 ? (
                <p className="text-center text-xs text-stone-400 py-8">لم تقم بإنشاء أي موضوع نقاش بعد.</p>
              ) : (
                myDiscussions.map((d) => (
                  <div
                    key={d.id}
                    onClick={() => {
                      onClose();
                      onSelectDiscussion(d.id);
                    }}
                    className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E5DDD0] hover:border-[#268F0C] cursor-pointer transition-all"
                  >
                    <span className="text-[10px] font-bold text-[#268F0C]">الفصل {d.chapterId}</span>
                    <h4 className="text-xs sm:text-sm font-bold text-stone-900 mt-0.5">{d.title}</h4>
                    <div className="flex items-center gap-3 text-[11px] text-stone-400 mt-2 tabular-nums">
                      <span>{d.commentsCount} ردود</span>
                      <span>·</span>
                      <span>{d.likes.length} إعجاب</span>
                      <span>·</span>
                      <span>{d.views} مشاهدة</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'following' && (
            <div className="space-y-3">
              {followedDiscussions.length === 0 ? (
                <p className="text-center text-xs text-stone-400 py-8">لا تتابع أي نقاش حالياً.</p>
              ) : (
                followedDiscussions.map((d) => (
                  <div
                    key={d.id}
                    onClick={() => {
                      onClose();
                      onSelectDiscussion(d.id);
                    }}
                    className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E5DDD0] hover:border-[#268F0C] cursor-pointer transition-all"
                  >
                    <span className="text-[10px] font-bold text-stone-500">
                      بواسطة {d.authorName} · الفصل {d.chapterId}
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-stone-900 mt-0.5">{d.title}</h4>
                    <div className="flex items-center gap-3 text-[11px] text-stone-400 mt-2 tabular-nums">
                      <span>{d.commentsCount} ردود</span>
                      <span>·</span>
                      <span>{d.likes.length} إعجاب</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'edit' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">الاسم الظاهر</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 bg-[#FAF8F5] border border-[#DDD5C7] rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-[#268F0C]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">النبذة التعريفية (Bio)</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 bg-[#FAF8F5] border border-[#DDD5C7] rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-[#268F0C]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">رابط الصورة الشخصية (URL)</label>
                <input
                  type="url"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="w-full p-2.5 bg-[#FAF8F5] border border-[#DDD5C7] rounded-xl text-xs text-stone-900 focus:outline-none focus:border-[#268F0C]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#268F0C] text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs"
              >
                حفظ التغييرات
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
