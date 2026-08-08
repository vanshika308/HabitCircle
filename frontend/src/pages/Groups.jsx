import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchGroups, addGroup, joinGroup } from '../redux/slices/groupSlice';
import { showToast } from '../redux/slices/uiSlice';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import LoadingSpinner from '../components/feedback/LoadingSpinner';
import { Users, Plus, Search, HelpCircle, ArrowRight, Check, X } from 'lucide-react';

const Groups = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { groups, loading } = useSelector((state) => state.groups);
  const { user } = useSelector((state) => state.auth);

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newGroupData, setNewGroupData] = useState({
    name: '',
    description: '',
    maxMembers: 10,
  });
  const [createLoading, setCreateLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchGroups());
  }, [dispatch]);

  const handleJoinGroup = (groupId) => {
    dispatch(joinGroup(groupId))
      .unwrap()
      .then(() => {
        dispatch(showToast({ message: 'Successfully joined accountability circle! 🎉', type: 'success' }));
        dispatch(fetchGroups());
        navigate(`/groups/${groupId}`);
      })
      .catch((err) => {
        dispatch(showToast({ message: err || 'Failed to join group', type: 'error' }));
      });
  };

  const handleCreateGroup = (e) => {
    e.preventDefault();
    if (!newGroupData.name.trim()) {
      dispatch(showToast({ message: 'Group name is required', type: 'error' }));
      return;
    }

    setCreateLoading(true);
    dispatch(addGroup(newGroupData))
      .unwrap()
      .then((res) => {
        dispatch(showToast({ message: `Circle "${res.name}" established!`, type: 'success' }));
        setCreateLoading(false);
        setIsModalOpen(false);
        setNewGroupData({ name: '', description: '', maxMembers: 10 });
        dispatch(fetchGroups());
        navigate(`/groups/${res._id}`);
      })
      .catch((err) => {
        dispatch(showToast({ message: err || 'Failed to create group', type: 'error' }));
        setCreateLoading(false);
      });
  };

  const filteredGroups = groups.filter((g) =>
    g.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header and Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight font-sans">
            Accountability Circles
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
            Join small social circles to share habit check-ins and support peers
          </p>
        </div>

        <Button
          onClick={() => setIsModalOpen(true)}
          variant="primary"
          icon={Plus}
          className="w-full sm:w-auto"
        >
          Create Circle
        </Button>
      </div>

      {/* Search Filter bar */}
      <div className="glass-card p-4 flex gap-4 items-center">
        <div className="relative flex-grow rounded-xl shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Search active circles by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full rounded-xl transition-all duration-200 text-sm py-3 pl-11 pr-4
              bg-white/80 dark:bg-zinc-900/80 text-zinc-950 dark:text-zinc-50
              border border-zinc-200 dark:border-zinc-800
              focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
          />
        </div>
      </div>

      {/* Groups Grid */}
      {loading && groups.length === 0 ? (
        <div className="flex items-center justify-center min-h-[30vh]">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredGroups.length === 0 ? (
        <div className="glass-card p-12 text-center max-w-md mx-auto rounded-3xl mt-8">
          <HelpCircle size={40} className="text-zinc-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white font-sans">No circles found</h3>
          <p className="text-zinc-500 text-xs mt-2 font-sans">
            We couldn't find any circles matching "{searchTerm}". Create a new one to invite your friends!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map((group) => {
            const isUserMember = group.members.includes(user?._id);

            return (
              <div key={group._id} className="glass-card p-6 flex flex-col justify-between hover:translate-y-[-2px] transition-all duration-200">
                <div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white font-sans tracking-tight">
                    {group.name}
                  </h3>
                  <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-2 line-clamp-2 leading-relaxed font-sans min-h-[36px]">
                    {group.description || 'No description provided.'}
                  </p>
                  
                  {/* Capacity Indicator */}
                  <div className="mt-4 flex items-center justify-between text-xs font-semibold text-zinc-500 dark:text-zinc-400 border-t border-zinc-200/40 dark:border-zinc-800/40 pt-4">
                    <span className="flex items-center gap-1.5">
                      <Users size={14} className="text-zinc-400" />
                      Members Size
                    </span>
                    <span className="font-extrabold text-zinc-800 dark:text-zinc-200">
                      {group.members.length} / {group.maxMembers}
                    </span>
                  </div>
                </div>

                <div className="mt-6">
                  {isUserMember ? (
                    <Button
                      onClick={() => navigate(`/groups/${group._id}`)}
                      variant="primary"
                      fullWidth
                      icon={ArrowRight}
                    >
                      Enter Workspace
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleJoinGroup(group._id)}
                      variant="secondary"
                      fullWidth
                      disabled={group.members.length >= group.maxMembers}
                      className={group.members.length >= group.maxMembers ? 'opacity-40' : ''}
                    >
                      {group.members.length >= group.maxMembers ? 'Group Full' : 'Join Circle'}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Group Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm transition-all duration-300">
          <div className="w-full max-w-md glass-card p-6 md:p-8 rounded-3xl relative bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/80 shadow-2xl">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="mb-6">
              <h2 className="text-xl font-bold text-zinc-950 dark:text-white font-sans tracking-tight">
                Establish New Circle
              </h2>
              <p className="text-xs text-zinc-500 mt-1">
                Bring peer accountability to your daily routines.
              </p>
            </div>

            <form onSubmit={handleCreateGroup} className="space-y-4">
              <Input
                label="Circle Name"
                type="text"
                name="name"
                placeholder="e.g. 5AM Club, Leetcode Grind"
                value={newGroupData.name}
                onChange={(e) => setNewGroupData({ ...newGroupData, name: e.target.value })}
                required
              />

              <div className="mb-4">
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 font-sans">
                  Description
                </label>
                <textarea
                  placeholder="e.g. Small group dedicated to maintaining consistent daily schedules."
                  value={newGroupData.description}
                  onChange={(e) => setNewGroupData({ ...newGroupData, description: e.target.value })}
                  rows={3}
                  className="block w-full rounded-xl transition-all duration-200 text-sm py-3 px-4
                    bg-white/80 dark:bg-zinc-900/80 text-zinc-950 dark:text-zinc-50
                    border border-zinc-200 dark:border-zinc-800
                    focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                />
              </div>

              <Input
                label="Max Allowed Members"
                type="number"
                name="maxMembers"
                placeholder="10"
                min="2"
                max="25"
                value={newGroupData.maxMembers}
                onChange={(e) => setNewGroupData({ ...newGroupData, maxMembers: parseInt(e.target.value) || 10 })}
              />

              <div className="flex gap-4 pt-4 border-t border-zinc-200/40 dark:border-zinc-800/40 mt-6">
                <Button
                  type="button"
                  variant="secondary"
                  fullWidth
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  loading={createLoading}
                >
                  Establish Circle
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Groups;
