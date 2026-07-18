'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/supabase';
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
  Info,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Lock,
  LogOut,
  ArrowRight,
  Key
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
  // Auth states
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<'developer' | 'manager'>('developer');
  const [currentUser, setCurrentUser] = useState('');
  
  // App states
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  
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

  // Load data
  const loadRequests = async () => {
    try {
      setLoading(true);
      const { data, error } = await db.fetchAll();

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

  // Quick Login
  const handleLogin = (selectedRole: 'developer' | 'manager') => {
    setRole(selectedRole);
    if (selectedRole === 'developer') {
      setCurrentUser('dev_sami@mal.ai');
    } else {
      setCurrentUser('lead_fatima@mal.ai');
    }
    setIsLoggedIn(true);
  };

  // Logout
  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser('');
  };

  // Handle submit
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
      const { error } = await db.insert({
        title,
        description,
        requested_by: currentUser,
        amount: numAmount,
        category,
        status: 'pending'
      });

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
      const { error } = await db.update(activeDecisionId, {
        status: decisionType,
        decision_reason: decisionReason || (decisionType === 'approved' ? 'Approved by lead manager.' : 'Rejected by lead manager.'),
        decided_at: new Date().toISOString(),
        decided_by: currentUser
      });

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

  // COMMON CLASSES
  const inputClass = "w-full bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-xs text-zinc-800 transition-[border-color,box-shadow] duration-150 focus-visible:ring-1 focus-visible:ring-black outline-none focus:border-zinc-400";
  const labelClass = "block text-[10px] text-zinc-400 uppercase font-mono mb-1 font-semibold tracking-wider";

  // LOGIN PAGE COMPONENT
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#fafafa] text-[#111111] font-sans flex flex-col justify-center items-center p-4 selection:bg-black selection:text-white antialiased">
        
        {/* Decorative background grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e5e5_1px,transparent_1px),linear-gradient(to_bottom,#e5e5e5_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" aria-hidden="true"></div>

        <div className="w-full max-w-md relative z-10 space-y-6">
          
          {/* Logo & Headline */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center p-2 bg-white border border-zinc-200 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] mb-1">
              <Lock className="w-5 h-5 text-zinc-900" aria-hidden="true" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-black text-balance">
              Mal.ai <span className="text-zinc-300 font-light" aria-hidden="true">/</span> Gatekeeper
            </h1>
            <p className="text-xs text-zinc-400 max-w-xs mx-auto">
              Secured single-sign-on provisioning portal for retail banking tools.
            </p>
          </div>

          {/* Cards for Roles (Compact & Sleek) */}
          <div className="space-y-4">
            
            {/* Developer Box */}
            <div className="bg-white border border-zinc-200/80 rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:border-zinc-300 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-[border-color,box-shadow] duration-200 group">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-zinc-50 border border-zinc-200 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Terminal className="w-4 h-4 text-zinc-600" aria-hidden="true" />
                </div>
                <div className="space-y-1.5 flex-1 min-w-0">
                  <h2 className="text-xs font-bold text-zinc-950 flex items-center gap-1">
                    Developer Workspace
                    <ArrowRight className="w-3 h-3 text-zinc-400 group-hover:translate-x-0.5 transition-transform duration-200 motion-reduce:transition-none motion-reduce:transform-none" aria-hidden="true" />
                  </h2>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Submit resource requests, verify API access codes, and monitor approvals.
                  </p>
                  <div className="bg-zinc-50 border border-zinc-200/50 rounded-lg p-2 flex items-center justify-between text-[11px]">
                    <span className="font-mono text-zinc-400">dev_sami@mal.ai</span>
                    <button 
                      onClick={() => handleLogin('developer')}
                      className="bg-black text-white hover:bg-zinc-900 active:scale-[0.96] font-semibold px-3 py-1 rounded-md transition-[background-color,transform] duration-150 text-[10px] flex items-center gap-1 focus-visible:ring-1 focus-visible:ring-black outline-none"
                    >
                      <Key className="w-3 h-3" aria-hidden="true" /> Enter Portal
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Manager Box */}
            <div className="bg-white border border-zinc-200/80 rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:border-zinc-300 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-[border-color,box-shadow] duration-200 group">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-zinc-50 border border-zinc-200 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-4 h-4 text-zinc-600" aria-hidden="true" />
                </div>
                <div className="space-y-1.5 flex-1 min-w-0">
                  <h2 className="text-xs font-bold text-zinc-950 flex items-center gap-1">
                    Approver Console
                    <ArrowRight className="w-3 h-3 text-zinc-400 group-hover:translate-x-0.5 transition-transform duration-200 motion-reduce:transition-none motion-reduce:transform-none" aria-hidden="true" />
                  </h2>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Review pending developer requests, check department DBR limits, and authorize allocations.
                  </p>
                  <div className="bg-zinc-50 border border-zinc-200/50 rounded-lg p-2 flex items-center justify-between text-[11px]">
                    <span className="font-mono text-zinc-400">lead_fatima@mal.ai</span>
                    <button 
                      onClick={() => handleLogin('manager')}
                      className="bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-200 active:scale-[0.96] font-semibold px-3 py-1 rounded-md transition-[background-color,border-color,transform] duration-150 text-[10px] flex items-center gap-1 focus-visible:ring-1 focus-visible:ring-zinc-400 outline-none"
                    >
                      <Key className="w-3 h-3" aria-hidden="true" /> Enter Portal
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <div className="text-center text-[10px] text-zinc-400">
            Secure client link: <span className="text-emerald-600 font-semibold">Active &amp; Connected</span>
          </div>

        </div>
      </div>
    );
  }

  // PORTAL WORKSPACE COMPONENT
  return (
    <div className="min-h-screen bg-[#fafafa] text-[#111111] font-sans selection:bg-black selection:text-white pb-12 antialiased">
      
      {/* Skip Link for A11y */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 bg-black text-white px-3 py-1.5 rounded-lg text-xs font-semibold z-50">
        Skip to main content
      </a>

      {/* Top Navigation Bar with Logout */}
      <div className="bg-white border-b border-zinc-200/80 px-4 py-2 sticky top-0 z-50 backdrop-blur-md bg-opacity-95 shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase font-mono tracking-wider border ${
              role === 'developer' ? 'bg-zinc-100 text-zinc-800 border-zinc-200' : 'bg-purple-50 text-purple-800 border-purple-200'
            }`}>
              {role === 'developer' ? 'Developer' : 'Manager'}
            </span>
            <span className="text-[11px] text-zinc-400 font-mono hidden sm:inline" aria-label={`Logged in as ${currentUser}`}>
              | {currentUser}
            </span>
          </div>
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-1 px-2.5 py-1 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50 active:scale-[0.96] rounded-md text-xs font-medium transition-[background-color,color,transform] duration-150 focus-visible:ring-1 focus-visible:ring-black outline-none"
          >
            <LogOut className="w-3 h-3" aria-hidden="true" /> Sign Out
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-5xl mx-auto px-4 mt-6 animate-fade-in" id="main-content">
        
        {/* Header Block (Compact & Professional) */}
        <header className="mb-6 border-b border-zinc-200/60 pb-4">
          <h1 className="text-xl font-bold tracking-tight text-zinc-950 flex items-center gap-2 text-balance">
            Mal.ai <span className="text-zinc-300 text-lg font-light" aria-hidden="true">/</span> <span className="font-semibold text-zinc-700">Provisioning Portal</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1 max-w-xl text-balance">
            Departmental budget orchestration, API tokens, and hardware provisioning.
          </p>
        </header>

        {/* Stats Grid (Extremely clean, smaller cards) */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6" aria-label="Department Metrics">
          {/* Card 1: Approved Allocation */}
          <div className="bg-white border border-zinc-200/80 rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-zinc-400 font-bold uppercase font-mono tracking-wider">Approved Funding</span>
              <DollarSign className="w-3.5 h-3.5 text-zinc-400" aria-hidden="true" />
            </div>
            <div className="text-lg font-bold font-mono text-zinc-900 font-variant-numeric-tabular-nums">AED {totalApproved.toLocaleString()}</div>
            <div className="text-[10px] text-zinc-500 mt-0.5">Limit: AED {BUDGET_CAP.toLocaleString()}</div>
            {/* Progress Bar */}
            <div className="w-full bg-zinc-50 rounded-full h-1 mt-3 overflow-hidden border border-zinc-100" aria-hidden="true">
              <div 
                className="bg-black h-1 rounded-full transition-[width] duration-500 ease-out" 
                style={{ width: `${Math.min(budgetProgress, 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Card 2: Pending Volume */}
          <div className="bg-white border border-zinc-200/80 rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-zinc-400 font-bold uppercase font-mono tracking-wider">Pending Volume</span>
              <TrendingUp className="w-3.5 h-3.5 text-zinc-400" aria-hidden="true" />
            </div>
            <div className="text-lg font-bold font-mono text-zinc-900 font-variant-numeric-tabular-nums">AED {totalPending.toLocaleString()}</div>
            <div className="text-[10px] text-zinc-500 mt-0.5">Queue items: {pendingCount}</div>
            <div className="mt-3 flex items-center gap-1 text-[10px] text-zinc-500 font-semibold" aria-hidden="true">
              <AlertCircle className="w-3 h-3 text-zinc-400" /> System active
            </div>
          </div>

          {/* Card 3: Compliance */}
          <div className="bg-white border border-zinc-200/80 rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-zinc-400 font-bold uppercase font-mono tracking-wider">Sharia Score</span>
              <Terminal className="w-3.5 h-3.5 text-zinc-400" aria-hidden="true" />
            </div>
            <div className="text-lg font-bold font-mono text-zinc-900">100%</div>
            <div className="text-[10px] text-zinc-500 mt-0.5">Ledger audit active</div>
            <div className="mt-3 flex items-center gap-1 text-[10px] text-emerald-700 font-semibold" aria-hidden="true">
              <CheckCircle className="w-3 h-3 text-emerald-500" /> Certified
            </div>
          </div>
        </section>

        {/* Dynamic Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN: Role-specific actions */}
          <main className="lg:col-span-8 space-y-6">
            {role === 'developer' ? (
              /* DEVELOPER: Create Request Form */
              <div className="bg-white border border-zinc-200/80 rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                <h2 className="text-sm font-bold mb-4 flex items-center gap-2 text-zinc-950">
                  <PlusCircle className="w-4 h-4 text-zinc-500" aria-hidden="true" /> File Allocation Request
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label htmlFor="request-title" className={labelClass}>Request Title *</label>
                      <input 
                        id="request-title"
                        type="text" 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Llama 3 compute lease…"
                        className={inputClass}
                        required
                        spellCheck={false}
                        autoComplete="off"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="request-category" className={labelClass}>Category</label>
                      <select 
                        id="request-category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value as any)}
                        className={inputClass}
                      >
                        <option value="budget">Budget Allocation (AED)</option>
                        <option value="access">Access Grant / Token</option>
                        <option value="hardware">Hardware Asset</option>
                      </select>
                    </div>
                  </div>

                  {category !== 'access' && (
                    <div>
                      <label htmlFor="request-amount" className={labelClass}>Amount Requested (AED) *</label>
                      <input 
                        id="request-amount"
                        type="number" 
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="e.g. 5000…"
                        className={inputClass}
                        required
                        inputMode="numeric"
                      />
                    </div>
                  )}

                  <div>
                    <label htmlFor="request-description" className={labelClass}>Justification &amp; Context *</label>
                    <textarea 
                      id="request-description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Detail the use-case, partner endpoints, and vendor parameters…"
                      rows={3}
                      className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-800 transition-[border-color,box-shadow] duration-150 focus-visible:ring-1 focus-visible:ring-black outline-none focus:border-zinc-400 resize-none"
                      required
                      spellCheck={true}
                      autoComplete="off"
                    ></textarea>
                  </div>

                  {formMessage && (
                    <div 
                      className={`p-2.5 rounded-lg text-xs font-medium border ${formMessage.type === 'success' ? 'bg-emerald-50/50 text-emerald-800 border-emerald-200' : 'bg-red-50/50 text-red-800 border-red-200'}`}
                      aria-live="polite"
                    >
                      {formMessage.text}
                    </div>
                  )}

                  <button 
                    type="submit" 
                    disabled={formLoading}
                    className="w-full bg-black hover:bg-zinc-900 active:scale-[0.96] text-white font-semibold rounded-lg py-2 text-xs transition-[background-color,transform] duration-150 disabled:opacity-50 focus-visible:ring-1 focus-visible:ring-black outline-none"
                  >
                    {formLoading ? 'Submitting…' : 'Submit Request'}
                  </button>
                </form>
              </div>
            ) : (
              /* MANAGER: Active Review Queue */
              <div className="space-y-3">
                <h2 className="text-sm font-bold flex items-center gap-2 text-zinc-950">
                  <Shield className="w-4 h-4 text-zinc-500" aria-hidden="true" /> Pending Approval Queue ({pendingCount})
                </h2>
                
                {loading ? (
                  <div className="text-center py-6 text-xs text-zinc-400" aria-live="polite">Loading requests…</div>
                ) : requests.filter(r => r.status === 'pending').length === 0 ? (
                  <div className="bg-white border border-zinc-200/80 rounded-xl p-8 text-center text-xs text-zinc-400 shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
                    All clear! No pending approvals in queue.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {requests
                      .filter(r => r.status === 'pending')
                      .map((req) => (
                        <div key={req.id} className="bg-white border border-zinc-200/80 rounded-xl p-4 shadow-[0_1px_2px_rgba(0,0,0,0.01)] hover:border-zinc-300 transition-[border-color] duration-150">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                            <div className="space-y-1.5 flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase font-mono tracking-wider border ${
                                  req.category === 'budget' ? 'bg-zinc-50 text-zinc-800 border-zinc-200' :
                                  req.category === 'access' ? 'bg-purple-50 text-purple-800 border-purple-200' :
                                  'bg-amber-50 text-amber-800 border-amber-200'
                                }`}>
                                  {req.category}
                                </span>
                                <span className="text-[10px] text-zinc-400 font-mono">By {req.requested_by}</span>
                              </div>
                              <h3 className="text-xs font-bold text-zinc-900 truncate">{req.title}</h3>
                              <p className="text-[11px] text-zinc-400 leading-relaxed break-words">{req.description}</p>
                            </div>
                            
                            <div className="text-left sm:text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2.5 min-w-[120px] pt-1">
                              {req.category !== 'access' && (
                                <div className="text-sm font-bold font-mono text-zinc-950 font-variant-numeric-tabular-nums">
                                  AED {Number(req.amount).toLocaleString()}
                                </div>
                              )}
                              
                              <div className="flex gap-1.5">
                                <button 
                                  onClick={() => handleDecision(req.id, 'rejected')}
                                  className="w-8 h-8 flex items-center justify-center hover:bg-zinc-50 text-red-600 rounded-lg border border-zinc-200/80 active:scale-[0.96] transition-[background-color,transform] duration-150 focus-visible:ring-1 focus-visible:ring-red-600 outline-none"
                                  aria-label={`Reject request: ${req.title}`}
                                  title="Reject"
                                >
                                  <XCircle className="w-3.5 h-3.5" aria-hidden="true" />
                                </button>
                                <button 
                                  onClick={() => handleDecision(req.id, 'approved')}
                                  className="w-8 h-8 flex items-center justify-center hover:bg-zinc-50 text-emerald-600 rounded-lg border border-zinc-200/80 active:scale-[0.96] transition-[background-color,transform] duration-150 focus-visible:ring-1 focus-visible:ring-emerald-600 outline-none"
                                  aria-label={`Approve request: ${req.title}`}
                                  title="Approve"
                                >
                                  <CheckCircle className="w-3.5 h-3.5" aria-hidden="true" />
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

            {/* General Log / List (Visible to all, compact row design) */}
            <div className="space-y-3">
              <h2 className="text-sm font-bold flex items-center gap-2 text-zinc-950">
                <Layers className="w-4 h-4 text-zinc-500" aria-hidden="true" /> Ledger History &amp; Decisions
              </h2>
              
              {loading ? (
                <div className="text-center py-6 text-xs text-zinc-400" aria-live="polite">Loading history…</div>
              ) : requests.length === 0 ? (
                <div className="text-center py-6 text-xs text-zinc-400">No records found.</div>
              ) : (
                <div className="bg-white border border-zinc-200/80 rounded-xl overflow-hidden divide-y divide-zinc-100 shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
                  {requests.map((req) => (
                    <div key={req.id} className="p-3.5 hover:bg-zinc-50/40 transition-colors duration-150">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[11px] font-bold text-zinc-800 truncate">{req.title}</span>
                            <span className="text-[9px] text-zinc-400 font-mono">({req.requested_by})</span>
                          </div>
                          {req.decision_reason && (
                            <p className="text-[11px] text-zinc-400 italic flex items-center gap-1.5 break-words">
                              <Info className="w-3 h-3 text-zinc-300 flex-shrink-0" aria-hidden="true" />
                              Note: {req.decision_reason}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-3.5 justify-between sm:justify-end">
                          {req.category !== 'access' && (
                            <span className="text-[11px] font-mono font-semibold text-zinc-500 font-variant-numeric-tabular-nums">
                              AED {Number(req.amount).toLocaleString()}
                            </span>
                          )}
                          
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[8px] font-bold uppercase font-mono tracking-wider border ${
                            req.status === 'approved' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                            req.status === 'rejected' ? 'bg-red-50 text-red-800 border-red-200' :
                            'bg-amber-50 text-amber-800 border-amber-200'
                          }`}>
                            {req.status === 'approved' && <CheckCircle className="w-2.5 h-2.5" aria-hidden="true" />}
                            {req.status === 'rejected' && <XCircle className="w-2.5 h-2.5" aria-hidden="true" />}
                            {req.status === 'pending' && <Clock className="w-2.5 h-2.5" aria-hidden="true" />}
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

          {/* RIGHT COLUMN: Sidebar info (Highly minimal & elegant) */}
          <aside className="lg:col-span-4 space-y-4">
            
            {/* Quick Session Details */}
            <div className="bg-white border border-zinc-200/80 rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-3">
              <h3 className="text-[10px] font-bold uppercase tracking-wider font-mono text-zinc-400">Environment Details</h3>
              <div className="space-y-2 text-xs">
                <div>
                  <div className="text-[10px] text-zinc-400 font-medium">Session Role</div>
                  <div className="font-mono text-zinc-800 font-bold mt-0.5 capitalize text-[11px]">{role}</div>
                </div>
                <hr className="border-zinc-100" />
                <div>
                  <div className="text-[10px] text-zinc-400 font-medium">Active Email</div>
                  <div className="font-mono text-zinc-800 font-bold mt-0.5 text-[11px] select-all">{currentUser}</div>
                </div>
              </div>
            </div>

            {/* Micro Architecture Metadata */}
            <div className="bg-white border border-zinc-200/80 rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-2.5">
              <h3 className="text-[10px] font-bold uppercase tracking-wider font-mono text-zinc-400">System Parameters</h3>
              <ul className="space-y-2 text-[11px] text-zinc-400">
                <li className="flex items-start gap-1.5">
                  <ChevronRight className="w-3 h-3 text-zinc-300 mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <span><strong>Next.js 14 Engine</strong>: React state engine client.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <ChevronRight className="w-3 h-3 text-zinc-300 mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <span><strong>Local Failover</strong>: Auto-activates on egress failures.</span>
                </li>
              </ul>
            </div>
          </aside>

        </div>
      </div>

      {/* Decision Dialog Modal */}
      {activeDecisionId && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px] flex items-center justify-center p-4 z-50 animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div className="bg-white border border-zinc-200/90 rounded-xl max-w-sm w-full p-5 space-y-3.5 shadow-xl">
            <h3 id="modal-title" className="text-sm font-bold text-zinc-950">
              Confirm {decisionType === 'approved' ? 'Approval' : 'Rejection'}
            </h3>
            <p className="text-[11px] text-zinc-400">
              Provide an optional comment or justification note for the applicant.
            </p>
            
            <div>
              <label htmlFor="decision-note" className="block text-[9px] text-zinc-400 uppercase font-mono mb-1 font-semibold tracking-wider">Decision Note</label>
              <textarea 
                id="decision-note"
                value={decisionReason}
                onChange={(e) => setDecisionReason(e.target.value)}
                placeholder={decisionType === 'approved' ? 'e.g. Budget approved for H1 usage…' : 'e.g. Please use shared Llama keys instead…'}
                rows={2}
                className="w-full bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs text-zinc-800 transition-[border-color,box-shadow] duration-150 focus-visible:ring-1 focus-visible:ring-black outline-none focus:border-zinc-400 resize-none"
              ></textarea>
            </div>

            <div className="flex gap-2 justify-end text-xs font-semibold">
              <button 
                onClick={() => setActiveDecisionId(null)}
                className="px-3.5 py-1.5 border border-zinc-200 text-zinc-500 hover:text-zinc-800 rounded-lg transition-colors duration-150 active:scale-[0.96]"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button 
                onClick={submitDecision}
                className={`px-3.5 py-1.5 rounded-lg text-white transition-[background-color,transform] duration-150 active:scale-[0.96] ${
                  decisionType === 'approved' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-red-600 hover:bg-red-500'
                }`}
                disabled={actionLoading}
              >
                {actionLoading ? 'Confirming…' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
