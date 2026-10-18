import React, { useState } from 'react';
import { AddonComment, MemberUser } from '../types/addon';
import { 
  MessageSquare, Star, Trash2, Send, 
  LogIn, User, ShieldCheck, Heart, Flag, Check, AlertCircle 
} from 'lucide-react';
import { submitInappropriateReport } from '../utils/storage';
import { getMinecraftCharacterAvatar } from '../utils/minecraftAvatars';

interface CommentsSectionProps {
  addonId: string;
  comments: AddonComment[];
  currentMember: MemberUser | null;
  isDeveloper: boolean;
  onAddComment: (content: string, rating: number) => void;
  onDeleteComment: (commentId: string) => void;
  onOpenSignIn: () => void;
}

export const CommentsSection: React.FC<CommentsSectionProps> = ({
  addonId,
  comments,
  currentMember,
  isDeveloper,
  onAddComment,
  onDeleteComment,
  onOpenSignIn,
}) => {
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(5);
  const [error, setError] = useState('');
  const [reportSuccessId, setReportSuccessId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMember) {
      onOpenSignIn();
      return;
    }
    if (!content.trim()) {
      setError('Please type your review or comment.');
      return;
    }

    onAddComment(content.trim(), rating);
    setContent('');
    setError('');
  };

  return (
    <div className="space-y-4 pt-4 border-t border-slate-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Member Reviews & Comments ({comments.length})
          </h3>
        </div>

        {currentMember && (
          <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <img src={currentMember.avatar} alt="Avatar" className="w-4 h-4 rounded-full object-cover" />
            <span className="text-cyan-300 font-semibold">{currentMember.username}</span>
          </span>
        )}
      </div>

      {/* Input Form for signed in members */}
      {currentMember ? (
        <form onSubmit={handleSubmit} className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400">Your Rating:</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-110 transition"
                >
                  <Star
                    className={`w-4 h-4 ${
                      star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <textarea
            rows={2}
            placeholder="Share your experience, bug reports, or feedback about this mod..."
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              setError('');
            }}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400 resize-none"
          />

          {error && <div className="text-[11px] text-rose-400">{error}</div>}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!content.trim()}
              className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white text-xs font-bold transition flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Post Comment</span>
            </button>
          </div>
        </form>
      ) : (
        /* Sign in prompt banner */
        <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-300">
            <span className="font-semibold text-white">Join the discussion: </span>
            <span className="text-slate-400">Sign in to leave reviews and comments on this mod.</span>
          </div>
          <button
            type="button"
            onClick={onOpenSignIn}
            className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 shrink-0"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In to Comment</span>
          </button>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-2.5 pt-1">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5 text-xs group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img
                  src={comment.userAvatar || getMinecraftCharacterAvatar(comment.username)}
                  alt={comment.username}
                  className="w-5 h-5 rounded-full object-cover"
                />
                <span className="font-bold text-slate-200">{comment.username}</span>
                {comment.rating && (
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: comment.rating }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                
                {/* Report Inappropriate button */}
                <button
                  type="button"
                  onClick={() => {
                    submitInappropriateReport({
                      targetType: 'comment',
                      targetId: comment.id,
                      targetTitleOrSnippet: comment.content.slice(0, 80),
                      reportedUserId: comment.userId,
                      reportedUsername: comment.username,
                      reason: 'Inappropriate language or behavior in comment',
                    });
                    setReportSuccessId(comment.id);
                    setTimeout(() => setReportSuccessId(null), 3000);
                  }}
                  className={`p-1 rounded transition flex items-center gap-1 ${
                    reportSuccessId === comment.id
                      ? 'text-emerald-400 opacity-100'
                      : 'hover:text-rose-400 opacity-50 hover:opacity-100'
                  }`}
                  title="Report inappropriate comment to developer"
                >
                  {reportSuccessId === comment.id ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-[10px] text-emerald-400 font-bold">Reported to Owner</span>
                    </>
                  ) : (
                    <Flag className="w-3 h-3" />
                  )}
                </button>

                {/* Moderation delete button for developer or comment author */}
                {(isDeveloper || currentMember?.id === comment.userId) && (
                  <button
                    type="button"
                    onClick={() => onDeleteComment(comment.id)}
                    className="p-1 rounded hover:text-rose-400 opacity-60 hover:opacity-100 transition"
                    title="Delete Comment"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <p className="text-slate-300 leading-relaxed whitespace-pre-line pl-7">
              {comment.content}
            </p>
          </div>
        ))}

        {comments.length === 0 && (
          <div className="p-5 rounded-xl border border-dashed border-slate-800 text-center text-xs text-slate-500">
            No comments yet. Be the first member to review this mod!
          </div>
        )}
      </div>
    </div>
  );
};
