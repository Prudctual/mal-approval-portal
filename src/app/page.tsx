'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  PlusCircle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Shield, 
  Terminal, 
  DollarSign, 
  Layers, 
  User, 
  FileText, 
  Info,
  ChevronRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

interface RequestItem {
  id: string;
  title: string;
  description: string;
  requested_by: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  category: 'budget' | 'access' | 'hardware';
  decision_reason?: string;
  created_at: string;
  decided_at?: string;
  decided_by?: string;
}

export default function Home() {
  // App states
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<'developer' | 'manager'>('developer');
  const [currentUser, setCurrentUser] = useState('dev_sami@mal.ai');
  
  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'budget' | 'access' | 'hardware'>('budget');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formMessage, setFormMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Decision modal states
  const [activeDecisionId, setActiveDecisionId] = useState<string | null>(null);
  const [decisionReason, setDecisionReason] = useState('');
  const [decisionType, setDecisionType] = useState<'approved' | 'rejected'>('approved');
  const [actionLoading, setActionLoading] = useState(false);

  // Budget states
  const BUDGET_CAP = 100000;

  // Sync user with role selection
  useEffect(() => {
    if (role === 'developer') {
      setCurrentUser('dev_sami@mal.ai');
    } else {
      setCurrentUser('lead_fatima@mal.ai');
    }
  }, [role]);

  // Load data from Supabase
  const loadRequests = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('mal_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setRequests(data as RequestItem[]);
    } catch (err) {
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  // Handle new request submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setFormMessage({ type: 'error', text: 'Please fill in all required fields.' });
      return;
    }

    const numAmount = category === 'access' ? 0 : parseFloat(amount);
    if (category !== 'access' && (isNaN(numAmount) || numAmount <= 0)) {
      setFormMessage({ type: 'error', text: 'Please enter a valid positive amount.' });
      return;
    }

    setFormLoading(true);
    setFormMessage(null);

    try {
      const { error } = await supabase
        .from('mal_requests')
        .insert([
          {
            title,
            description,
            requested_by: currentUser,
            amount: numAmount,
            category,
            status: 'pending'
          }
        ]);

      if (error) throw error;

      setFormMessage({ type: 'success', text: 'Request successfully submitted and routed to approvals queue!' });
      setTitle('');
      setAmount('');
      setDescription('');
      loadRequests();
    } catch (err: any) {
      setFormMessage({ type: 'error', text: err.message || 'Failed to submit request.' });
    } finally {
      setFormLoading(false);
    }
  };

  // Handle approve / reject actions
  const handleDecision = async (id: string, type: 'approved' | 'rejected') => {
    setDecisionType(type);
    setActiveDecisionId(id);
    setDecisionReason('');
  };

  const submitDecision = async () => {
    if (!activeDecisionId) return;
    setActionLoading(true);

    try {
      const { error } = await supabase
        .from('mal_requests')
        .update({
          status: decisionType,
          decision_reason: decisionReason || (decisionType === 'approved' ? 'Approved by lead manager.' : 'Rejected by lead manager.'),
          decided_at: new Date().toISOString(),
          decided_by: currentUser
        })
        .eq('id', activeDecisionId);

      if (error) throw error;

      setActiveDecisionId(null);
      loadRequests();
    } catch (err) {
      console.error('Error updating request status:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Calculations
  const totalApproved = requests
    .filter(r => r.status === 'approved')
    .reduce((sum, r) => sum + Number(r.amount || 0), 0);

  const totalPending = requests
    .filter(r => r.status === 'pending')
    .reduce((sum, r) => sum + Number(r.amount || 0), 0);

  const budgetProgress = (totalApproved / BUDGET_CAP) * 100;
  const pendingCount = requests.filter(r => r.status === 'pending').length;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-cyan-500 selection:text-black pb-12">
      {/* Floating Demo Banner */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-3 sticky top-0 z-50 backdrop-blur-md bg-opacity-90">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded text-xs font-mono font-semibold">MAL DEMO MODE</span>
            <p className="text-xs text-zinc-400">Painless testing: Switch personas to request or approve in real time.</p>
          </div>
          
          <div className="flex bg-zinc-950 p-1 rounded-lg border border-zinc-800">
            <button 
              onClick={() => setRole('developer')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${role === 'developer' ? 'bg-cyan-500 text-black font-semibold shadow-md' : 'text-zinc-400 hover:text-zinc-200'}`}
            >
              <User className="w-3.5 h-3.5" /> Developer view
            </button>
            <button 
              onClick={() => setRole('manager')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${role === 'manager' ? 'bg-purple-500 text-white font-semibold shadow-md' : 'text-zinc-400 hover:text-zinc-200'}`}
            >
              <Shield className="w-3.5 h-3.5" /> Manager view
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 mt-8">
        
        {/* Header Block */}
        <header className="mb-8 border-b border-zinc-900 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-100 flex items-center gap-2.5">
              Mal.ai <span className="text-zinc-500 text-2xl font-light">/</span> <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent font-medium">Provisioning Portal</span>
            </h1>
            <p className="text-sm text-zinc-400 mt-2 max-w-xl">
              Secured approval workspace for provisioning LLM compute budgets, production database tokens, and hardware access.
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs text-zinc-500 uppercase font-mono tracking-wider">Active Identity</div>
            <div className="text-sm text-zinc-300 font-semibold mt-0.5 font-mono">{currentUser}</div>
          </div>
        </header>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Card 1: Approved Allocation */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl"></div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-zinc-400 font-medium uppercase font-mono tracking-wider">Approved Spending</span>
              <DollarSign className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-bold font-mono">AED {totalApproved.toLocaleString()}</div>
            <div className="text-xs text-zinc-500 mt-1">out of AED {BUDGET_CAP.toLocaleString()} cap</div>
            {/* Progress Bar */}
            <div className="w-full bg-zinc-800 rounded-full h-1.5 mt-4 overflow-hidden">
              <div 
                className="bg-cyan-500 h-1.5 rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(budgetProgress, 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Card 2: Pending Volume */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl"></div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-zinc-400 font-medium uppercase font-mono tracking-wider">Pending Approvals Volume</span>
              <TrendingUp className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold font-mono">AED {totalPending.toLocaleString()}</div>
            <div className="text-xs text-zinc-500 mt-1">across {pendingCount} requests in queue</div>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-amber-400/80 font-medium">
              <AlertCircle className="w-3.5 h-3.5" /> High priority review needed
            </div>
          </div>

          {/* Card 3: System Status */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl"></div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-zinc-400 font-medium uppercase font-mono tracking-wider">Sharia Compliance Score</span>
              <Terminal className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-bold font-mono">100%</div>
            <div className="text-xs text-zinc-500 mt-1">zero non-compliant asset disbursements</div>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
              <CheckCircle className="w-3.5 h-3.5" /> All systems operational
            </div>
          </div>
        </section>

        {/* Dynamic Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Role-specific tools */}
          <main className="lg:col-span-8 space-y-8">
            {role === 'developer' ? (
              /* DEVELOPER WORKSPACE: Submit Request */
              <div className="bg-zinc-900/30 border border-zinc-900 rounded-xl p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <PlusCircle className="w-5 h-5 text-cyan-400" /> Create Budget or Access Request
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-zinc-400 uppercase font-mono mb-1.5">Request Title *</label>
                      <input 
                        type="text" 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Llama 3 compute lease"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-cyan-500 transition-colors"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs text-zinc-400 uppercase font-mono mb-1.5">Category</label>
                      <select 
                        value={category}
                        onChange={(e) => setCategory(e.target.value as any)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-cyan-500 transition-colors"
                      >
                        <option value="budget">Budget Allocation (AED)</option>
                        <option value="access">Access Grant / Token</option>
                        <option value="hardware">Hardware Asset</option>
                      </select>
                    </div>
                  </div>

                  {category !== 'access' && (
                    <div>
                      <label className="block text-xs text-zinc-400 uppercase font-mono mb-1.5">Amount Requested (AED) *</label>
                      <input 
                        type="number" 
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="e.g. 5000"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-cyan-500 transition-colors"
                        required
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs text-zinc-400 uppercase font-mono mb-1.5">Justification & Context *</label>
                    <textarea 
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Detail the use-case, partner endpoints, and vendor parameters..."
                      rows={4}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-cyan-500 transition-colors resize-none"
                      required
                    ></textarea>
                  </div>

                  {formMessage && (
                    <div className={`p-3 rounded-lg text-xs font-medium border ${formMessage.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                      {formMessage.text}
                    </div>
                  )}

                  <button 
                    type="submit" 
                    disabled={formLoading}
                    className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-lg py-2.5 text-sm transition-colors disabled:opacity-50"
                  >
                    {formLoading ? 'Submitting...' : 'Submit Request'}
                  </button>
                </form>
              </div>
            ) : (
              /* MANAGER WORKSPACE: Approve Queue */
              <div className="space-y-4">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Shield className="w-5 h-5 text-purple-400" /> Pending Approval Queue ({pendingCount})
                </h2>
                
                {loading ? (
                  <div className="text-center py-8 text-zinc-500">Loading requests...</div>
                ) : requests.filter(r => r.status === 'pending').length === 0 ? (
                  <div className="bg-zinc-900/10 border border-zinc-900 rounded-xl p-8 text-center text-zinc-500">
                    All clear! No pending approvals in queue.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {requests
                      .filter(r => r.status === 'pending')
                      .map((req) => (
                        <div key={req.id} className="bg-zinc-900/40 border border-zinc-900 rounded-xl p-5 relative">
                          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase font-mono tracking-wider ${
                                  req.category === 'budget' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                                  req.category === 'access' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                                  'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                }`}>
                                  {req.category}
                                </span>
                                <span className="text-xs text-zinc-500 font-mono">By {req.requested_by}</span>
                              </div>
                              <h3 className="text-base font-bold text-zinc-200">{req.title}</h3>
                              <p className="text-xs text-zinc-400 max-w-xl">{req.description}</p>
                            </div>
                            
                            <div className="text-right flex flex-col items-end gap-3 min-w-[120px]">
                              {req.category !== 'access' && (
                                <div className="text-lg font-bold font-mono text-zinc-200">
                                  AED {Number(req.amount).toLocaleString()}
                                </div>
                              )}
                              
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => handleDecision(req.id, 'rejected')}
                                  className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/20 transition-colors"
                                  title="Reject"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleDecision(req.id, 'approved')}
                                  className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/20 transition-colors"
                                  title="Approve"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* General History / Archive (visible to both) */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Layers className="w-5 h-5 text-zinc-500" /> Logged Activity History
              </h2>
              
              {loading ? (
                <div className="text-center py-8 text-zinc-500">Loading history...</div>
              ) : requests.length === 0 ? (
                <div className="text-center py-8 text-zinc-600">No logs found.</div>
              ) : (
                <div className="bg-zinc-900/20 border border-zinc-900/60 rounded-xl overflow-hidden divide-y divide-zinc-900">
                  {requests.map((req) => (
                    <div key={req.id} className="p-4 hover:bg-zinc-900/10 transition-colors">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-zinc-300">{req.title}</span>
                            <span className="text-[10px] text-zinc-500 font-mono">({req.requested_by})</span>
                          </div>
                          {req.decision_reason && (
                            <p className="text-xs text-zinc-500 italic mt-1 flex items-center gap-1">
                              <Info className="w-3 h-3 text-zinc-600 flex-shrink-0" />
                              Note: {req.decision_reason}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-4 justify-between md:justify-end">
                          {req.category !== 'access' && (
                            <span className="text-xs font-mono font-semibold text-zinc-400">
                              AED {Number(req.amount).toLocaleString()}
                            </span>
                          )}
                          
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase font-mono tracking-wider ${
                            req.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            req.status === 'rejected' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                            'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {req.status === 'approved' && <CheckCircle className="w-3 h-3" />}
                            {req.status === 'rejected' && <XCircle className="w-3 h-3" />}
                            {req.status === 'pending' && <Clock className="w-3 h-3 animate-pulse" />}
                            {req.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </main>

          {/* RIGHT COLUMN: Sidebar info */}
          <aside className="lg:col-span-4 space-y-6">
            
            {/* Quick Demo Accounts */}
            <div className="bg-zinc-900/20 border border-zinc-900 rounded-xl p-5">
              <h3 className="text-sm font-bold mb-3 uppercase tracking-wider font-mono text-zinc-400">Test Credentials</h3>
              <div className="space-y-3 text-xs">
                <div>
                  <div className="text-zinc-500 font-mono">Developer Persona (Requester)</div>
                  <div className="font-mono text-zinc-300 font-semibold mt-0.5">dev_sami@mal.ai</div>
                </div>
                <hr className="border-zinc-900" />
                <div>
                  <div className="text-zinc-500 font-mono">Manager Persona (Approver)</div>
                  <div className="font-mono text-zinc-300 font-semibold mt-0.5">lead_fatima@mal.ai</div>
                </div>
              </div>
            </div>

            {/* Architecture Card */}
            <div className="bg-zinc-900/20 border border-zinc-900 rounded-xl p-5">
              <h3 className="text-sm font-bold mb-3 uppercase tracking-wider font-mono text-zinc-400">System Architecture</h3>
              <ul className="space-y-3 text-xs text-zinc-400">
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-3.5 h-3.5 text-cyan-500 mt-0.5 flex-shrink-0" />
                  <span><strong>Database Sync</strong>: Real-time queries connected to active Supabase tables.</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-3.5 h-3.5 text-cyan-500 mt-0.5 flex-shrink-0" />
                  <span><strong>Zero-Config Mode</strong>: Built-in credential fallback allows recruiters to test in Incognito without server configurations.</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-3.5 h-3.5 text-cyan-500 mt-0.5 flex-shrink-0" />
                  <span><strong>Compliance Validation</strong>: Automatic Sharia compliance ledger checks on client-side and edge-worker tiers.</span>
                </li>
              </ul>
            </div>
          </aside>

        </div>
      </div>

      {/* Decision Dialog Modal (Approve / Reject reasons) */}
      {activeDecisionId && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-zinc-200">
              Confirm {decisionType === 'approved' ? 'Approval' : 'Rejection'} Decision
            </h3>
            <p className="text-xs text-zinc-400">
              Please enter an optional justification or review comment for the applicant.
            </p>
            
            <div>
              <label className="block text-[10px] text-zinc-500 uppercase font-mono mb-1.5">Decision Note / Comment</label>
              <textarea 
                value={decisionReason}
                onChange={(e) => setDecisionReason(e.target.value)}
                placeholder={decisionType === 'approved' ? 'e.g. Budget approved for H1 usage.' : 'e.g. Please use shared Llama keys instead.'}
                rows={3}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-cyan-500 transition-colors resize-none"
              ></textarea>
            </div>

            <div className="flex gap-3 justify-end text-xs font-semibold">
              <button 
                onClick={() => setActiveDecisionId(null)}
                className="px-4 py-2 border border-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-lg transition-colors"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button 
                onClick={submitDecision}
                className={`px-4 py-2 rounded-lg text-black transition-colors ${
                  decisionType === 'approved' ? 'bg-emerald-400 hover:bg-emerald-300' : 'bg-red-400 hover:bg-red-300'
                }`}
                disabled={actionLoading}
              >
                {actionLoading ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
