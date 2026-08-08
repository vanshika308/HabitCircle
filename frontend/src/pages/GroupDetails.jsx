import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchGroupDetails, leaveGroup, triggerNudge, triggerHighFive, resetCurrentGroup } from '../redux/slices/groupSlice';
import { showToast } from '../redux/slices/uiSlice';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/feedback/LoadingSpinner';
import { Flame, Award, ShieldAlert, Hand, Bell, LogOut, ArrowLeft, Users, Calendar, Activity } from 'lucide-react';

const GroupDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { currentGroup, detailsLoading } = useSelector((state) => state.groups);
  const { user: currentUser } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchGroupDetails(id));
    return () => {
      dispatch(resetCurrentGroup());
    };
  }, [id, dispatch]);

  const handleLeaveGroup = () => {
    if (window.confirm('Are you sure you want to leave this circle?')) {
      dispatch(leaveGroup(id))
        .unwrap()
        .then(() => {
          dispatch(showToast({ message: 'Left the circle successfully.', type: 'info' }));
          navigate('/groups');
        })
        .catch((err) => {
          dispatch(showToast({ message: err || 'Failed to leave circle', type: 'error' }));
        });
    }
  };

  const handleNudge = (recipientId, recipientName) => {
    dispatch(triggerNudge({ groupId: id, recipientId }))
      .unwrap()
      .then(() => {
        dispatch(showToast({ message: `You nudged ${recipientName} ⚡`, type: 'success' }));
      })
      .catch((err) => {
        dispatch(showToast({ message: err || 'Failed to send nudge', type: 'error' }));
      });
  };

  const handleHighFive = (recipientId, recipientName) => {
    dispatch(triggerHighFive({ groupId: id, recipientId }))
      .unwrap()
      .then(() => {
        dispatch(showToast({ message: `High-Five sent to ${recipientName} 🖐️`, type: 'success' }));
      })
      .catch((err) => {
        dispatch(showToast({ message: err || 'Failed to send high-five', type: 'error' }));
      });
  };

  const formatRelativeTime = (dateStr) => {
    const diffMs = new Date() - new Date(dateStr);
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'High Risk':
        return 'text-rose-500 border-rose-100 dark:border-rose-950/20 bg-rose-50/50 dark:bg-rose-950/10';
      case 'Medium Risk':
        return 'text-amber-500 border-amber-100 dark:border-amber-950/20 bg-amber-50/50 dark:bg-amber-950/10';
      default:
        return 'text-zinc-500 border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20';
    }
  };

  if (detailsLoading || !currentGroup) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const { details, standings, feed } = currentGroup;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Navigation Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/groups')}
          className="p-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
        >
          <ArrowLeft size={14} />
        </button>
        <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500">Back to Circles</span>
      </div>

      {/* Circle Meta header */}
      <div className="glass-card p-6 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-zinc-950 dark:text-white tracking-tight font-sans">
            {details.name}
          </h1>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 max-w-xl font-sans leading-relaxed">
            {details.description || 'Welcome to your accountability circle. Work with your peers to build lasting streaks.'}
          </p>
        </div>

        <Button
          onClick={handleLeaveGroup}
          variant="secondary"
          icon={LogOut}
          className="w-full md:w-auto hover:text-rose-500 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 border border-zinc-200 dark:border-zinc-800 text-xs py-2 px-4 rounded-xl"
        >
          Leave Circle
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sleek competitive standings leaderboard list */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-2 font-sans uppercase tracking-wider">
              <Award size={16} className="text-zinc-400" />
              Circle standings
            </h3>

            <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
              {standings.map((member, index) => {
                const isMe = member._id === currentUser._id;
                const memberStreak = member.streaks?.currentStreak || 0;
                const isMemberMediumHighRisk = member.riskScore?.level === 'Medium Risk' || member.riskScore?.level === 'High Risk';

                return (
                  <div
                    key={member._id}
                    className={`flex items-center justify-between py-4.5 transition-all duration-150
                      ${isMe ? 'bg-zinc-50/30 dark:bg-zinc-900/10 px-2 rounded-lg' : ''}
                    `}
                  >
                    {/* Rank & Identity */}
                    <div className="flex items-center gap-3.5">
                      <div className="text-xs font-bold text-zinc-400 dark:text-zinc-500 w-5">
                        #{index + 1}
                      </div>

                      <div className="h-10 w-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-750 flex items-center justify-center text-zinc-700 dark:text-zinc-300 shadow-sm flex-shrink-0">
                        {member.avatarUrl ? (
                          <img
                            src={member.avatarUrl}
                            alt={member.name}
                            className="h-full w-full rounded-lg object-cover"
                          />
                        ) : (
                          member.name.charAt(0).toUpperCase()
                        )}
                      </div>

                      <div>
                        <p className="text-xs font-bold text-zinc-900 dark:text-white font-sans flex items-center gap-1.5">
                          {member.name}
                          {isMe && (
                            <span className="text-[9px] font-bold uppercase px-1 py-0.2 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 rounded">
                              Me
                            </span>
                          )}
                        </p>
                        <span className={`inline-block text-[8px] font-bold px-1.5 py-0.2 rounded border mt-1 font-sans ${getRiskColor(member.riskScore?.level)}`}>
                          {member.riskScore?.level || 'Low Risk'}
                        </span>
                      </div>
                    </div>

                    {/* Streak & Low-Contrast Actions */}
                    <div className="flex items-center gap-5">
                      <div className="flex items-center gap-1">
                        <Flame
                          size={15}
                          className={`${memberStreak > 0 ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-400'}`}
                        />
                        <div className="text-right">
                          <p className="text-xs font-extrabold text-zinc-900 dark:text-white leading-none font-sans">
                            {memberStreak}d
                          </p>
                        </div>
                      </div>

                      {/* Social Actions (Muted Outline Style) */}
                      {!isMe && (
                        <div className="flex gap-1.5">
                          {/* Nudge */}
                          <button
                            onClick={() => handleNudge(member._id, member.name)}
                            disabled={!isMemberMediumHighRisk}
                            className={`p-1.5 rounded-lg border text-[10px] font-bold transition-all duration-150 flex items-center gap-1
                              ${isMemberMediumHighRisk
                                ? 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-rose-300 hover:text-rose-500'
                                : 'opacity-20 border-zinc-100 dark:border-zinc-900 text-zinc-300 pointer-events-none'
                              }
                            `}
                            title="Nudge user to check-in"
                          >
                            <Bell size={12} />
                            <span className="hidden sm:inline">Nudge</span>
                          </button>

                          {/* High-Five */}
                          <button
                            onClick={() => handleHighFive(member._id, member.name)}
                            disabled={memberStreak === 0}
                            className={`p-1.5 rounded-lg border text-[10px] font-bold transition-all duration-150 flex items-center gap-1
                              ${memberStreak > 0
                                ? 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-900 dark:hover:border-zinc-200 hover:text-zinc-900 dark:hover:text-white'
                                : 'opacity-20 border-zinc-100 dark:border-zinc-900 text-zinc-300 pointer-events-none'
                              }
                            `}
                            title="Send supportive High-Five"
                          >
                            <Hand size={12} />
                            <span className="hidden sm:inline">High-Five</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sleek Timeline Activity Log */}
        <div className="space-y-6">
          <div className="glass-card p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col h-full max-h-[600px]">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-2 font-sans uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-800 pb-4">
              <Activity size={15} className="text-zinc-400" />
              Circle activity
            </h3>

            {feed.length === 0 ? (
              <div className="flex-grow flex flex-col items-center justify-center py-12 text-center text-zinc-400">
                <p className="text-xs font-semibold font-sans">No recent activity.</p>
              </div>
            ) : (
              <div className="flex-grow overflow-y-auto space-y-4 pr-1 relative pl-3.5 border-l border-zinc-100 dark:border-zinc-800">
                {feed.map((act) => {
                  const isNudge = act.type === 'nudge';
                  const isHighFive = act.type === 'high_five';

                  return (
                    <div key={act._id} className="relative space-y-1.5 group">
                      {/* Timeline dot */}
                      <div className={`absolute -left-[19.5px] top-1.5 h-2.5 w-2.5 rounded-full border bg-white dark:bg-zinc-900 transition-colors
                        ${isNudge
                          ? 'border-rose-400 bg-rose-50'
                          : isHighFive
                            ? 'border-brand-300 bg-zinc-50'
                            : 'border-zinc-300 dark:border-zinc-700'
                        }
                      `} />

                      <div className="text-[11px] text-zinc-600 dark:text-zinc-400 font-sans leading-relaxed">
                        <span className="font-bold text-zinc-900 dark:text-white">
                          {act.sender ? act.sender.name : 'User'}
                        </span>
                        
                        {act.type === 'habit_completed' && (
                          <span> completed <code className="bg-zinc-50 dark:bg-zinc-850 px-1 py-0.2 rounded border border-zinc-200/50 dark:border-zinc-800/80 text-zinc-900 dark:text-zinc-200">{act.details?.habitName}</code></span>
                        )}
                        {act.type === 'streak_milestone' && (
                          <span> hit a streak milestone of <span className="font-bold text-amber-600 dark:text-amber-500">{act.details?.streakCount}d</span>! 🔥</span>
                        )}
                        {act.type === 'high_five' && (
                          <span> sent a High-Five to <span className="font-bold text-zinc-800 dark:text-zinc-200">{act.recipient ? act.recipient.name : 'User'}</span> 🖐️</span>
                        )}
                        {act.type === 'nudge' && (
                          <span> nudged <span className="font-bold text-rose-500">{act.recipient ? act.recipient.name : 'User'}</span> to check-in ⚡</span>
                        )}
                      </div>

                      <div className="text-[9px] text-zinc-400 dark:text-zinc-500 font-medium">
                        {formatRelativeTime(act.createdAt)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupDetails;
