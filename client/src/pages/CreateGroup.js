import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import Navbar from '../components/Navbar';
import PremiumCard from '../components/PremiumCard';
import StatsCard from '../components/StatsCard';
import GradientButton from '../components/GradientButton';
import GlassContainer from '../components/GlassContainer';
import { FiUsers, FiLayers, FiCheckCircle } from 'react-icons/fi';

function CreateGroup() {
  const [groupName, setGroupName] = useState('');
  const [members, setMembers] = useState('');
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!groupName.trim() || !members.trim()) {
      setError('Please provide group name and members.');
      return;
    }

    const groupData = {
      groupName: groupName.trim(),
      members: members.split(',').map((member) => member.trim()).filter(Boolean)
    };

    try {
      await api.post('/groups/create', groupData);
      setFeedback('Group created successfully. Redirecting to dashboard...');
      setError('');
      setTimeout(() => navigate('/dashboard'), 900);
    } catch (error) {
      console.error(error);
      setError('Unable to create group. Please try again.');
    }
  };

  const memberCount = members.split(',').map((member) => member.trim()).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 py-10 sm:px-8">
        <section className="grid gap-8 xl:grid-cols-[1.3fr_0.95fr]">
          <div className="space-y-6 fade-in">
            <div className="inline-flex rounded-full bg-cyan-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-cyan-700 shadow-sm">
              Group setup
            </div>
            <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-slate-950">
              Create premium groups for effortless expense sharing.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-600">
              Set up a group, invite members, and manage shared spending using a modern dashboard experience designed for travel groups, roommates, and events.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <StatsCard
                title="Group readiness"
                value="Fast setup"
                description="Name your group and add members in one step."
                icon={<FiLayers className="h-5 w-5" />}
              />
              <StatsCard
                title="Members"
                value={memberCount > 0 ? memberCount : '3+'}
                description="Add everyone who will share costs."
                icon={<FiUsers className="h-5 w-5" />}
              />
            </div>
          </div>

          <PremiumCard className="p-8 fade-in">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-cyan-300">Group analytics</p>
                <h2 className="mt-4 text-3xl font-semibold text-white">A premium launchpad for your crew.</h2>
              </div>
              <div className="rounded-3xl bg-slate-900/80 px-4 py-3 text-sm font-semibold text-cyan-200">
                Live preview
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[28px] bg-white/5 p-5 ring-1 ring-white/10">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Group name</p>
                <p className="mt-3 text-2xl font-semibold text-white">{groupName || 'Weekend Trip'}</p>
              </div>
              <div className="rounded-[28px] bg-white/5 p-5 ring-1 ring-white/10">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Member count</p>
                <p className="mt-3 text-2xl font-semibold text-white">{memberCount || 3} people</p>
              </div>
            </div>

            <div className="mt-8 rounded-[28px] bg-slate-900/85 p-6 ring-1 ring-slate-700/40">
              <div className="flex items-center gap-3 text-slate-300">
                <FiCheckCircle className="h-5 w-5 text-cyan-300" />
                <p className="text-sm">Soft glowing cards with elegant spacing and premium depth.</p>
              </div>
            </div>
          </PremiumCard>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <GlassContainer className="p-8 fade-in">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Create Group</p>
                <h2 className="mt-3 text-3xl font-semibold text-slate-950">Build your new expense group</h2>
              </div>
              <div className="rounded-full bg-cyan-50 px-4 py-2 text-sm font-semibold text-cyan-700">
                Premium form
              </div>
            </div>

            <p className="mt-4 text-sm leading-7 text-slate-600">
              Deliver an exceptional experience for every member by starting with a strong group setup.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-700">Group Name</label>
                <input
                  type="text"
                  placeholder="Weekend Trip"
                  className="w-full rounded-[28px] border border-slate-300 bg-white/90 px-5 py-4 text-slate-950 shadow-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                />
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-700">Members</label>
                <input
                  type="text"
                  placeholder="Alice, Bob, Charlie"
                  className="w-full rounded-[28px] border border-slate-300 bg-white/90 px-5 py-4 text-slate-950 shadow-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                  value={members}
                  onChange={(e) => setMembers(e.target.value)}
                />
                <p className="text-sm text-slate-500">Separate each member with a comma for instant team creation.</p>
              </div>

              {error && (
                <div className="rounded-[28px] bg-rose-50 px-5 py-4 text-sm text-rose-700 ring-1 ring-rose-100">
                  {error}
                </div>
              )}

              {feedback && (
                <div className="rounded-[28px] bg-emerald-50 px-5 py-4 text-sm text-emerald-700 ring-1 ring-emerald-100">
                  {feedback}
                </div>
              )}

              <GradientButton type="submit" className="w-full">
                Create Group
              </GradientButton>
            </form>
          </GlassContainer>

          <PremiumCard className="p-8 fade-in">
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Why this matters</p>
            <h2 className="mt-4 text-3xl font-semibold text-white">A polished group creation experience</h2>
            <p className="mt-4 text-slate-300 leading-7">
              Modern spacing, refined input states, and a calm visual hierarchy help your team create groups faster, with fewer distractions.
            </p>

            <div className="mt-8 space-y-4">
              <div className="rounded-[28px] bg-white/5 p-5 ring-1 ring-white/10">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Speed</p>
                <p className="mt-2 text-lg font-semibold text-white">Instant group creation.</p>
              </div>
              <div className="rounded-[28px] bg-white/5 p-5 ring-1 ring-white/10">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Clarity</p>
                <p className="mt-2 text-lg font-semibold text-white">Easy member onboarding.</p>
              </div>
            </div>
          </PremiumCard>
        </section>
      </main>
    </div>
  );
}

export default CreateGroup;
