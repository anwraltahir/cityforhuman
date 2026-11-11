/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { NotificationItem } from '../types';
import { store } from '../services/storage';
import { X, Bell, CheckCheck, MessageSquare, Heart, Bookmark, AlertCircle, FileText } from 'lucide-react';

interface NotificationsDrawerProps {
  userId: string;
  onClose: () => void;
  onSelectDiscussion: (discussionId: string) => void;
  onSelectArticle: (articleId: string) => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  userId,
  onClose,
  onSelectDiscussion,
  onSelectArticle,
}) => {
  const notifications = store.getNotificationsForUser(userId);

  const handleItemClick = (notif: NotificationItem) => {
    store.markNotificationAsRead(notif.id);
    if (notif.targetType === 'discussion' && notif.targetId) {
      onSelectDiscussion(notif.targetId);
      onClose();
    } else if (notif.targetType === 'article' && notif.targetId) {
      onSelectArticle(notif.targetId);
      onClose();
    }
  };

  const handleMarkAllRead = () => {
    store.markAllNotificationsAsRead(userId);
  };

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'reply':
        return <MessageSquare className="w-4 h-4 text-[#268F0C]" />;
      case 'like':
        return <Heart className="w-4 h-4 text-[#E84200]" />;
      case 'follow':
        return <Bookmark className="w-4 h-4 text-stone-600" />;
      case 'article_status':
        return <FileText className="w-4 h-4 text-[#268F0C]" />;
      default:
        return <AlertCircle className="w-4 h-4 text-[#A99C8A]" />;
    }
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('ar-EG', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-2xs animate-in fade-in">
      <div className="relative w-full max-w-sm sm:max-w-md bg-white h-full shadow-2xl border-r border-[#E0D8CB] flex flex-col text-right">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#F0EAE1] bg-[#FAF8F5] flex items-center justify-between">
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-[#EFEAE2] rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-stone-900">مركز الإشعارات</h3>
            <Bell className="w-5 h-5 text-[#268F0C]" />
          </div>
        </div>

        {/* Mark All Read action */}
        {notifications.some((n) => !n.isRead) && (
          <div className="px-5 py-2.5 bg-[#F9F7F2] border-b border-[#EAE3D6] flex justify-between items-center text-xs">
            <button
              onClick={handleMarkAllRead}
              className="text-[#268F0C] font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>تحديد الكل كمقروء</span>
            </button>
            <span className="text-stone-400">
              {notifications.filter((n) => !n.isRead).length} غير مقروء
            </span>
          </div>
        )}

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {notifications.length === 0 ? (
            <div className="text-center py-20 text-stone-400">
              <Bell className="w-10 h-10 mx-auto mb-2 text-stone-300" />
              <p className="text-sm font-semibold">لا توجد إشعارات حالياً</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleItemClick(notif)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  notif.isRead
                    ? 'bg-white border-[#EBE3D6] hover:bg-[#FAF8F5]'
                    : 'bg-[#F2F9F0] border-[#C1E2B9] hover:bg-[#EBF6E8]'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="p-2 rounded-xl bg-white border border-[#E0D8CB] shadow-2xs shrink-0 mt-0.5">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-stone-900">{notif.title}</h4>
                      <span className="text-[10px] text-stone-400 tabular-nums shrink-0">
                        {formatDate(notif.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 mt-1 leading-relaxed">{notif.message}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
