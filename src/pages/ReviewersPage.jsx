import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  Plus,
  Mail,
  Phone,
  BookOpen,
  CheckCircle2,
  Clock,
  Shield,
  Key,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';
import { DOMAINS } from '../constants/initialData';

export function ReviewersPage() {
  const { data, registerReviewer, showToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('ALL');
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  // New reviewer modal form
  const [newRev, setNewRev] = useState({
    name: '',
    email: '',
    phone: '',
    domain: DOMAINS[0],
  });

  const reviewers = data?.reviewers || [];
  const papers = data?.papers || [];

  // Count active assignments for each reviewer
  const reviewerStats = useMemo(() => {
    const map = {};
    reviewers.forEach((r) => {
      const assignedPapers = papers.filter((p) => (p.reviewers || []).includes(r.id));
      const activePapers = assignedPapers.filter(
        (p) => p.status === 'Sent to Reviewers' || p.status === 'Re-review'
      );
      map[r.id] = {
        total: assignedPapers.length,
        active: activePapers.length,
      };
    });
    return map;
  }, [reviewers, papers]);

  // Filter reviewers
  const filteredReviewers = useMemo(() => {
    return reviewers.filter((r) => {
      if (selectedDomain !== 'ALL' && r.domain !== selectedDomain) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          r.name.toLowerCase().includes(q) ||
          r.email.toLowerCase().includes(q) ||
          r.domain.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [reviewers, selectedDomain, searchQuery]);

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (!newRev.name.trim() || !newRev.email.trim() || !newRev.phone.trim()) {
      showToast('Please fill all mandatory reviewer details');
      return;
    }
    if (reviewers.some((r) => r.email.toLowerCase() === newRev.email.toLowerCase().trim())) {
      showToast('A reviewer with this email is already registered');
      return;
    }

    registerReviewer({
      name: newRev.name.trim(),
      email: newRev.email.trim(),
      phone: newRev.phone.trim(),
      domain: newRev.domain,
    });

    setIsRegisterOpen(false);
    setNewRev({ name: '', email: '', phone: '', domain: DOMAINS[0] });
    showToast(`Reviewer ${newRev.name} successfully added to database`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Peer Reviewers Directory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Maintain the roster of qualified faculty peer reviewers across all academic disciplines.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsRegisterOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Reviewer</span>
        </button>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Total Reviewers
          </span>
          <p className="text-2xl font-extrabold text-slate-900">{reviewers.length}</p>
          <p className="text-xs text-slate-500 font-medium">Enrolled expert reviewers</p>
        </div>

        <div className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Active Assignments
          </span>
          <p className="text-2xl font-extrabold text-indigo-700">
            {Object.values(reviewerStats).reduce((sum, s) => sum + s.active, 0)}
          </p>
          <p className="text-xs text-slate-500 font-medium">Currently evaluating submissions</p>
        </div>

        <div className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Academic Domains
          </span>
          <p className="text-2xl font-extrabold text-slate-900">{DOMAINS.length}</p>
          <p className="text-xs text-slate-500 font-medium">Subject disciplines supported</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search reviewers by name, email, or domain..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-indigo-500 focus:bg-white transition-all"
          />
        </div>

        <div className="w-full md:w-auto">
          <select
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
            className="w-full md:w-auto text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium cursor-pointer focus:outline-indigo-500"
          >
            <option value="ALL">All Subject Domains</option>
            {DOMAINS.map((dom) => (
              <option key={dom} value={dom}>
                {dom}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Reviewers List */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
        {filteredReviewers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No reviewers match your query"
            description="Try modifying your search or domain filter criteria."
            actionLabel="Register Reviewer"
            onAction={() => setIsRegisterOpen(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                  <th className="py-3 px-4">Reviewer ID</th>
                  <th className="py-3 px-4">Expert Name</th>
                  <th className="py-3 px-4">Academic Domain</th>
                  <th className="py-3 px-4">Contact Info</th>
                  <th className="py-3 px-4">Assigned Papers</th>
                  <th className="py-3 px-4">Simulated Login</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReviewers.map((rev) => {
                  const stats = reviewerStats[rev.id] || { total: 0, active: 0 };
                  return (
                    <tr key={rev.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-700">
                        {rev.id}
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">{rev.name}</p>
                        <p className="text-[11px] text-slate-400 font-mono">ID: {rev.id}</p>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-800 font-medium border border-indigo-100 text-xs inline-block">
                          {rev.domain}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 space-y-0.5">
                        <p className="flex items-center gap-1.5 text-slate-700 font-mono text-[11px]">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{rev.email}</span>
                        </p>
                        <p className="flex items-center gap-1.5 text-slate-500 font-mono text-[11px]">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{rev.phone}</span>
                        </p>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                              stats.active > 0
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {stats.active} Active Now
                          </span>
                          <p className="text-[10px] text-slate-400">{stats.total} Lifetime Assigned</p>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px]">
                        <span className="bg-slate-100 px-2 py-1 rounded text-slate-700 border border-slate-200">
                          {rev.pw || 'Rv@demo'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Register Reviewer Modal */}
      <Modal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        title="Register New Peer Reviewer"
        subtitle="Credentials will be securely issued and stored in the reviewer database"
        size="md"
      >
        <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Full Name &amp; Academic Title *</label>
            <input
              type="text"
              required
              value={newRev.name}
              onChange={(e) => setNewRev({ ...newRev, name: e.target.value })}
              placeholder="e.g. Dr. Harish Chandra"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Institutional Email Address *</label>
            <input
              type="email"
              required
              value={newRev.email}
              onChange={(e) => setNewRev({ ...newRev, email: e.target.value })}
              placeholder="reviewer@university.edu"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Mobile Phone (with country code) *</label>
            <input
              type="text"
              required
              value={newRev.phone}
              onChange={(e) => setNewRev({ ...newRev, phone: e.target.value })}
              placeholder="+91 98100 55555"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Primary Subject Domain *</label>
            <select
              value={newRev.domain}
              onChange={(e) => setNewRev({ ...newRev, domain: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
            >
              {DOMAINS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsRegisterOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs"
            >
              Save &amp; Enroll Reviewer
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
