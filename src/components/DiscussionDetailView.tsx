/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Discussion, Chapter, Comment, User } from '../types';
import { store } from '../services/storage';
import { useToast } from './Toast';
import {
  ArrowRight,
  Heart,
  Share2,
  Bookmark,
  BookmarkCheck,
  Eye,
  MessageSquare,
  Reply,
  Edit3,
  Trash2,
  Flag,
  Pin,
  Lock,
  Send,
  Bold,
  Italic,
  Link as LinkIcon,
  Check,
  AlertTriangle,
} from 'lucide-react';

interface DiscussionDetailViewProps {
  discussionId: string;
  currentUser: User | null;
  chapters: Chapter[];
  onBack: () => void;
  onSelectChapter: (chapterId: number) => void;
  onOpenAuth: () => void;
  onOpenShare: (title: string, url: string) => void;
  onOpenReport: (targetType: 'discussion' | 'comment', targetId: string, title: string) => void;
}

export const DiscussionDetailView: React.FC<DiscussionDetailViewProps> = ({
  discussionId,
  currentUser,
  chapters,
  onBack,
  onSelectChapter,
  onOpenAuth,
  onOpenShare,
  onOpenReport,
}) => {
  const { showToast } = useToast();
  const [discussion, setDiscussion] = useState<Discussion | undefined>(() =>
    store.getDiscussionById(discussionId)
  );
  const [commentsTree, setCommentsTree] = useState<Comment[]>([]);
  const [commentSort, setCommentSort] = useState<'latest' | 'oldest' | 'active'>('latest');

  // Comment input state
  const [newCommentContent, setNewCommentContent] = useState('');
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  // Editing state
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');

  useEffect(() => {
    // Record view
    store.incrementDiscussionViews(discussionId);

    const refreshData = () => {
      const disc = store.getDiscussionById(discussionId);
      setDiscussion(disc ? { ...disc } : undefined);
      setCommentsTree(store.getCommentsTree(discussionId, commentSort));
    };

    refreshData();
    const unsub = store.subscribe(refreshData);
    return () => unsub();
  }, [discussionId, commentSort]);

  if (!discussion) {
    return (
      <div className="py-20 text-center text-stone-600 max-w-xl mx-auto">
        <p className="text-lg font-bold">عذراً، لم يتم العثور على هذا النقاش أو ربما تم حذفه.</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-[#268F0C] text-white rounded-xl text-xs font-bold"
        >
          العودة للقائمة
        </button>
      </div>
    );
  }

  const chapter = chapters.find((c) => c.id === discussion.chapterId);
  const isLikedByMe = currentUser ? discussion.likes.includes(currentUser.id) : false;
  const isFollowedByMe = currentUser ? discussion.followers.includes(currentUser.id) : false;

  const handleToggleLike = () => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    const liked = store.toggleLikeDiscussion(discussion.id);
    showToast(liked ? 'تم تسجيل إعجابك بالنقاش' : 'تم إلغاء الإعجاب', 'success');
  };

  const handleToggleFollow = () => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    const followed = store.toggleFollowDiscussion(discussion.id);
    showToast(
      followed ? 'أنت الآن تتابع هذا النقاش وستصلك إشعارات بالردود الجديدة' : 'تم إلغاء متابعة النقاش',
      'info'
    );
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    if (!newCommentContent.trim()) return;

    store.addComment({
      discussionId: discussion.id,
      content: newCommentContent,
    });
    setNewCommentContent('');
    showToast('تمت إضافة مشاركتك بنجاح', 'success');
  };

  const handleAddReply = (parentId: string) => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    if (!replyContent.trim()) return;

    store.addComment({
      discussionId: discussion.id,
      parentId,
      content: replyContent,
    });
    setReplyingToId(null);
    setReplyContent('');
    showToast('تم إرسال ردك بنجاح', 'success');
  };

  const handleSaveEdit = (commentId: string) => {
    if (!editingContent.trim()) return;
    store.editComment(commentId, editingContent);
    setEditingCommentId(null);
    showToast('تم تعديل التعليق', 'success');
  };

  const handleDeleteComment = (commentId: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا التعليق؟')) {
      store.deleteComment(commentId, currentUser?.name);
      showToast('تم حذف التعليق', 'info');
    }
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  // Recursive comment component
  const CommentNode: React.FC<{ comment: Comment; depth?: number }> = ({ comment, depth = 0 }) => {
    const isCommentLiked = currentUser ? comment.likes.includes(currentUser.id) : false;
    const isOwner = currentUser?.id === comment.authorId;
    const canModerate = currentUser?.role === 'admin' || currentUser?.role === 'moderator';

    return (
      <div
        className={`text-right group ${
          depth > 0
            ? 'mr-4 sm:mr-8 pr-4 sm:pr-6 border-r-2 border-[#E5DDD0] mt-3'
            : 'bg-white p-5 sm:p-6 rounded-2xl border border-[#E5DDD0] mt-4 shadow-2xs'
        }`}
      >
        {/* Comment Header */}
        <div className="flex items-center justify-between gap-3 pb-2 border-b border-[#F2ECE3]">
          <div className="flex items-center gap-2.5">
            <img
              src={comment.authorAvatar}
              alt={comment.authorName}
              className="w-7 h-7 rounded-full object-cover border border-[#D5CCBE]"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-stone-900">{comment.authorName}</span>
                {comment.authorRole === 'admin' && (
                  <span className="text-[10px] text-[#268F0C] font-semibold">المؤلف</span>
                )}
                {comment.authorRole === 'moderator' && (
                  <span className="text-[10px] text-stone-500 font-semibold">مشرف</span>
                )}
              </div>
              <span className="text-[10px] text-stone-400 tabular-nums">
                {formatDate(comment.createdAt)}
                {comment.isEdited && ' (تم التعديل)'}
              </span>
            </div>
          </div>

          {/* Action triggers */}
          <div className="flex items-center gap-1">
            {currentUser && (
              <button
                onClick={() => {
                  setReplyingToId(replyingToId === comment.id ? null : comment.id);
                  setReplyContent('');
                }}
                className="p-1.5 text-stone-500 hover:text-[#268F0C] hover:bg-[#FAF8F5] rounded-lg text-xs flex items-center gap-1 transition-colors cursor-pointer"
                title="الرد على هذا التعليق"
              >
                <Reply className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[11px] font-semibold">رد</span>
              </button>
            )}

            <button
              onClick={() => {
                if (!currentUser) {
                  onOpenAuth();
                  return;
                }
                store.toggleLikeComment(comment.id);
              }}
              className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors cursor-pointer ${
                isCommentLiked ? 'text-[#E84200] font-bold' : 'text-stone-500 hover:text-[#E84200]'
              }`}
              title="إعجاب بالتعليق"
            >
              <Heart className={`w-3.5 h-3.5 ${isCommentLiked ? 'fill-current' : ''}`} />
              <span className="text-[11px] tabular-nums">{comment.likes.length}</span>
            </button>

            {isOwner && (
              <button
                onClick={() => {
                  setEditingCommentId(comment.id);
                  setEditingContent(comment.content);
                }}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg text-xs transition-colors cursor-pointer"
                title="تعديل التعليق"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            )}

            {(isOwner || canModerate) && (
              <button
                onClick={() => handleDeleteComment(comment.id)}
                className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg text-xs transition-colors cursor-pointer"
                title="حذف التعليق"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}

            {!isOwner && (
              <button
                onClick={() => onOpenReport('comment', comment.id, `تعليق من ${comment.authorName}`)}
                className="p-1.5 text-stone-300 hover:text-red-600 rounded-lg text-xs transition-colors cursor-pointer"
                title="إبلاغ عن تعليق مخالف"
              >
                <Flag className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Comment Content / Edit Mode */}
        {editingCommentId === comment.id ? (
          <div className="mt-3 space-y-2">
            <textarea
              value={editingContent}
              onChange={(e) => setEditingContent(e.target.value)}
              className="w-full p-3 bg-[#FAF8F5] border border-[#D5CCBE] rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-[#268F0C]"
              rows={3}
            />
            <div className="flex items-center gap-2 justify-end">
              <button
                onClick={() => setEditingCommentId(null)}
                className="px-3 py-1 text-xs text-stone-600 hover:bg-stone-100 rounded-lg"
              >
                إلغاء
              </button>
              <button
                onClick={() => handleSaveEdit(comment.id)}
                className="px-3 py-1 bg-[#268F0C] text-white text-xs font-bold rounded-lg"
              >
                حفظ التعديل
              </button>
            </div>
          </div>
        ) : (
          <p className="mt-3 text-xs sm:text-sm text-stone-800 leading-relaxed whitespace-pre-line font-normal">
            {comment.content}
          </p>
        )}

        {/* Reply Box if open */}
        {replyingToId === comment.id && (
          <div className="mt-3 pt-3 border-t border-[#F2ECE3] bg-[#FAF8F5] p-3 rounded-xl border border-[#E5DDD0]">
            <p className="text-[11px] font-bold text-stone-600 mb-1.5">
              الرد على {comment.authorName}:
            </p>
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="اكتب ردك هنا بطريقة هادفة وثرية..."
              rows={2}
              className="w-full p-2.5 bg-white border border-[#DDD5C7] rounded-lg text-xs text-stone-900 focus:outline-none focus:border-[#268F0C]"
            />
            <div className="flex items-center gap-2 justify-end mt-2">
              <button
                onClick={() => setReplyingToId(null)}
                className="px-3 py-1 text-xs text-stone-500 hover:bg-stone-200 rounded-lg"
              >
                إلغاء
              </button>
              <button
                onClick={() => handleAddReply(comment.id)}
                className="px-3 py-1 bg-[#268F0C] text-white text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer"
              >
                <Send className="w-3 h-3 text-[#C1E2B9]" />
                <span>إرسال الرد</span>
              </button>
            </div>
          </div>
        )}

        {/* Nested Replies Recursion */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="space-y-2 mt-2">
            {comment.replies.map((reply) => (
              <CommentNode key={reply.id} comment={reply} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="py-8 sm:py-12 bg-[#FAF8F5] min-h-screen text-right">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-stone-600 hover:text-[#268F0C] mb-6 p-1 cursor-pointer transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة إلى النقاشات</span>
        </button>

        {/* Discussion Main Article Container */}
        <article className="p-6 sm:p-10 rounded-3xl bg-white border border-[#E3DBD0] shadow-sm">
          {/* Header Metadata */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F0EAE1]">
            <div className="flex items-center gap-3">
              <img
                src={discussion.authorAvatar}
                alt={discussion.authorName}
                className="w-11 h-11 rounded-full object-cover border border-[#D5CCBE]"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-stone-900">{discussion.authorName}</h3>
                  {discussion.authorRole === 'admin' && (
                    <span className="text-[10px] text-[#268F0C] font-semibold bg-[#268F0C]/10 px-2 py-0.5 rounded">
                      المؤلف / المشرف العام
                    </span>
                  )}
                  {discussion.authorRole === 'moderator' && (
                    <span className="text-[10px] text-stone-600 font-semibold bg-stone-100 px-2 py-0.5 rounded">
                      مشرف مجتمع
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-stone-400 mt-0.5">
                  <button
                    onClick={() => onSelectChapter(discussion.chapterId)}
                    className="font-bold text-[#268F0C] hover:underline"
                  >
                    الفصل {discussion.chapterId}: {chapter?.title}
                  </button>
                  <span>·</span>
                  <span className="tabular-nums">{formatDate(discussion.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Pins or Locks */}
            <div className="flex items-center gap-2">
              {discussion.isPinned && (
                <span className="text-xs font-bold text-[#E84200] flex items-center gap-1 bg-[#E84200]/10 px-2.5 py-1 rounded-lg">
                  <Pin className="w-3.5 h-3.5" />
                  <span>مثبت</span>
                </span>
              )}
              {discussion.isLocked && (
                <span className="text-xs font-bold text-stone-500 flex items-center gap-1 bg-stone-100 px-2.5 py-1 rounded-lg">
                  <Lock className="w-3.5 h-3.5" />
                  <span>مغلق للتعليقات</span>
                </span>
              )}
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-stone-900 mt-6 leading-snug tracking-tight">
            {discussion.title}
          </h1>

          {/* Optional Image */}
          {discussion.imageUrl && (
            <div className="my-6 rounded-2xl overflow-hidden border border-[#DDD5C7] max-h-96">
              <img
                src={discussion.imageUrl}
                alt={discussion.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          )}

          {/* Body Prose */}
          <div className="mt-6 text-stone-800 text-sm sm:text-base leading-loose whitespace-pre-line font-normal max-w-prose">
            {discussion.content}
          </div>

          {/* Interaction Bar */}
          <div className="mt-8 pt-6 border-t border-[#F0EAE1] flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Like Button */}
              <button
                onClick={handleToggleLike}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  isLikedByMe
                    ? 'bg-[#E84200] text-white shadow-xs'
                    : 'bg-[#FAF8F5] text-stone-700 hover:bg-[#F2ECE3] border border-[#DDD5C7]'
                }`}
              >
                <Heart className={`w-4 h-4 ${isLikedByMe ? 'fill-current text-white' : 'text-[#E84200]'}`} />
                <span>إعجاب</span>
                <span className="tabular-nums">({discussion.likes.length})</span>
              </button>

              {/* Follow Button */}
              <button
                onClick={handleToggleFollow}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  isFollowedByMe
                    ? 'bg-[#268F0C] text-white shadow-xs'
                    : 'bg-[#FAF8F5] text-stone-700 hover:bg-[#F2ECE3] border border-[#DDD5C7]'
                }`}
              >
                {isFollowedByMe ? <BookmarkCheck className="w-4 h-4 text-[#C1E2B9]" /> : <Bookmark className="w-4 h-4 text-stone-500" />}
                <span>{isFollowedByMe ? 'تتابع النقاش' : 'متابعة النقاش'}</span>
              </button>

              {/* Share Button */}
              <button
                onClick={() =>
                  onOpenShare(
                    discussion.title,
                    `https://cityforhuman.com/discussions/${discussion.id}`
                  )
                }
                className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#FAF8F5] text-stone-700 hover:bg-[#F2ECE3] border border-[#DDD5C7] flex items-center gap-1.5 transition-all cursor-pointer"
                title="مشاركة رابط النقاش"
              >
                <Share2 className="w-4 h-4 text-stone-500" />
                <span className="hidden sm:inline">مشاركة</span>
              </button>
            </div>

            <div className="flex items-center gap-3 text-xs text-stone-500">
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4 text-stone-400" />
                <span className="tabular-nums">{discussion.views} مشاهدة</span>
              </span>
              <span>·</span>
              <button
                onClick={() => onOpenReport('discussion', discussion.id, discussion.title)}
                className="text-stone-400 hover:text-red-600 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Flag className="w-3.5 h-3.5" />
                <span>إبلاغ</span>
              </button>
            </div>
          </div>
        </article>

        {/* Comments Section */}
        <section className="mt-12">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#268F0C]" />
              <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900">
                الردود والمشاركات ({discussion.commentsCount})
              </h2>
            </div>

            {/* Comment Sort Selector */}
            <div className="flex items-center gap-1 p-1 bg-white rounded-xl border border-[#E0D8CB] text-xs">
              <button
                onClick={() => setCommentSort('latest')}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                  commentSort === 'latest' ? 'bg-[#FAF8F5] text-stone-900 font-bold' : 'text-stone-500'
                }`}
              >
                الأحدث
              </button>
              <button
                onClick={() => setCommentSort('oldest')}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                  commentSort === 'oldest' ? 'bg-[#FAF8F5] text-stone-900 font-bold' : 'text-stone-500'
                }`}
              >
                الأقدم
              </button>
              <button
                onClick={() => setCommentSort('active')}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                  commentSort === 'active' ? 'bg-[#FAF8F5] text-stone-900 font-bold' : 'text-stone-500'
                }`}
              >
                الأكثر تفاعلاً
              </button>
            </div>
          </div>

          {/* New Comment Box */}
          {discussion.isLocked ? (
            <div className="p-4 rounded-2xl bg-stone-100 border border-stone-200 text-center text-xs text-stone-500 font-semibold flex items-center justify-center gap-2">
              <Lock className="w-4 h-4" />
              <span>هذا النقاش مغلق حالياً ولا يقبل ردوداً إضافية.</span>
            </div>
          ) : currentUser ? (
            <form onSubmit={handleAddComment} className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E5DDD0] shadow-2xs mb-8">
              <div className="flex items-center gap-2.5 mb-3">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover border border-[#D5CCBE]"
                />
                <span className="text-xs font-bold text-stone-900">أضف مشاركتك كـ {currentUser.name}</span>
              </div>

              {/* Simple editorial formatting tools */}
              <div className="flex items-center gap-1 pb-2 border-b border-[#F0EAE1] mb-2 text-stone-500">
                <button
                  type="button"
                  onClick={() => setNewCommentContent((prev) => prev + '**نص عريض**')}
                  className="p-1 hover:bg-[#FAF8F5] rounded text-xs"
                  title="نص عريض"
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setNewCommentContent((prev) => prev + '*نص مائل*')}
                  className="p-1 hover:bg-[#FAF8F5] rounded text-xs"
                  title="نص مائل"
                >
                  <Italic className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setNewCommentContent((prev) => prev + '\n> اقتباس فكرة من الكتاب...\n')}
                  className="p-1 hover:bg-[#FAF8F5] rounded text-xs text-[11px] font-bold"
                  title="اقتباس"
                >
                  «»
                </button>
              </div>

              <textarea
                value={newCommentContent}
                onChange={(e) => setNewCommentContent(e.target.value)}
                placeholder="اكتب تعليقك أو وجهة نظرك التحليلية حول هذا الفصل..."
                rows={3}
                className="w-full p-3 bg-[#FAF8F5] border border-[#DDD5C7] rounded-xl text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#268F0C]"
              />

              <div className="flex justify-end mt-3">
                <button
                  type="submit"
                  disabled={!newCommentContent.trim()}
                  className="px-5 py-2.5 bg-[#268F0C] hover:bg-[#1f7309] disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <Send className="w-3.5 h-3.5 text-[#C1E2B9]" />
                  <span>نشر التعليق</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="p-6 rounded-2xl bg-white border border-[#E5DDD0] text-center mb-8">
              <p className="text-sm text-stone-700 font-semibold mb-3">
                سجّل الدخول لتتمكن من إضافة رد أو التفاعل مع القراء في هذا النقاش.
              </p>
              <button
                onClick={onOpenAuth}
                className="px-5 py-2.5 bg-[#268F0C] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
              >
                تسجيل الدخول / إنشاء حساب
              </button>
            </div>
          )}

          {/* Comments Tree */}
          {commentsTree.length === 0 ? (
            <div className="p-10 bg-white rounded-2xl border border-dashed border-[#DDD5C7] text-center">
              <MessageSquare className="w-10 h-10 text-stone-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-stone-700">لا توجد ردود بعد على هذا الموضوع</p>
              <p className="text-xs text-stone-400 mt-1">كن صاحب أول تعليق ثري يثري هذا الحوار.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {commentsTree.map((comment) => (
                <CommentNode key={comment.id} comment={comment} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
