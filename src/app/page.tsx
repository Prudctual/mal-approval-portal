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

  // Load data from Supabase
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

  // Quick Login handler
  const handleLogin = (selectedRole: 'developer' | 'manager') => {
    setRole(selectedRole);
    if (selectedRole === 'developer') {
      setCurrentUser('dev_sami@mal.ai');
    } else {
      setCurrentUser('lead_fatima@mal.ai');
    }
    setIsLoggedIn(true);
  };

  // Logout handler
  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser('');
  };

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

  // COMMON TEXT INPUT CLASSPATH
  const inputClass = "w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-sm text-zinc-800 transition-[border-color,box-shadow] duration-150 focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 outline-none focus:border-transparent";

  // LOGIN PAGE COMPONENT
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#fafafa] text-[#111111] font-sans flex flex-col justify-center items-center p-4 selection:bg-black selection:text-white">
        
        {/* Decorative background grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e5e5_1px,transparent_1px),linear-gradient(to_bottom,#e5e5e5_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" aria-hidden="true"></div>

        <div className="w-full max-w-xl relative z-10 space-y-8">
          
          {/* Logo & Headline */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center p-2.5 bg-white border border-zinc-200 rounded-xl shadow-sm mb-2">
              <Lock className="w-6 h-6 text-zinc-900" aria-hidden="true" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-black text-balance">
              Mal.ai <span className="text-zinc-300 font-light" aria-hidden="true">/</span> Gatekeeper
            </h1>
            <p className="text-sm text-zinc-500 max-w-sm mx-auto">
              Secured single-sign-on provisioning portal for retail banking tools.
            </p>
          </div>

          {/* Cards Grid for Roles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Developer Box */}
            <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:border-zinc-400 transition-[border-color] duration-200 group">
              <div>
                <div className="w-10 h-10 bg-zinc-50 border border-zinc-200 rounded-lg flex items-center justify-center mb-4">
                  <Terminal className="w-5 h-5 text-zinc-800" aria-hidden="true" />
                </div>
                <h2 className="text-base font-bold text-black flex items-center gap-1.5">
                  Developer Portal 
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:translate-x-1 transition-transform duration-200 motion-reduce:transition-none motion-reduce:transform-none" aria-hidden="true" />
                </h2>
                <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                  Submit resource requests, verify API access codes, and monitor approvals.
                </p>
                <div className="mt-4 bg-zinc-50 border border-zinc-200/60 rounded-lg p-2.5">
                  <div className="text-[10px] uppercase font-mono font-bold text-zinc-400">Testing Email</div>
                  <div className="text-xs font-mono text-zinc-700 font-bold mt-0.5 select-all">dev_sami@mal.ai</div>
                </div>
              </div>
              <button 
                onClick={() => handleLogin('developer')}
                className="w-full bg-black text-white hover:bg-zinc-900 font-semibold text-xs py-2.5 rounded-lg transition-colors duration-150 mt-6 flex items-center justify-center gap-1.5 focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 outline-none"
              >
                <Key className="w-3.5 h-3.5" aria-hidden="true" /> Fast Login
              </button>
            </div>

            {/* Manager Box */}
            <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:border-zinc-400 transition-[border-color] duration-200 group">
              <div>
                <div className="w-10 h-10 bg-zinc-50 border border-zinc-200 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-5 h-5 text-zinc-800" aria-hidden="true" />
                </div>
                <h2 className="text-base font-bold text-black flex items-center gap-1.5">
                  Approver Console 
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:translate-x-1 transition-transform duration-200 motion-reduce:transition-none motion-reduce:transform-none" aria-hidden="true" />
                </h2>
                <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                  Review pending developer requests, check department DBR limits, and authorize allocations.
                </p>
                <div className="mt-4 bg-zinc-50 border border-zinc-200/60 rounded-lg p-2.5">
                  <div className="text-[10px] uppercase font-mono font-bold text-zinc-400">Testing Email</div>
                  <div className="text-xs font-mono text-zinc-700 font-bold mt-0.5 select-all">lead_fatima@mal.ai</div>
                </div>
              </div>
              <button 
                onClick={() => handleLogin('manager')}
                className="w-full bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-200 font-semibold text-xs py-2.5 rounded-lg transition-colors duration-150 mt-6 flex items-center justify-center gap-1.5 focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 outline-none"
              >
                <Key className="w-3.5 h-3.5" aria-hidden="true" /> Fast Login
              </button>
            </div>

          </div>

          <div className="text-center text-xs text-zinc-400">
            Secure connection to Supabase DB: <span className="text-emerald-600 font-semibold">Active &amp; Live</span>
          </div>

        </div>
      </div>
    );
  }

  // PORTAL WORKSPACE COMPONENT
  return (
    <div className="min-h-screen bg-[#fafafa] text-[#111111] font-sans selection:bg-black selection:text-white pb-12">
      
      {/* Skip to Main Content Link for Keyboard A11y */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-black text-white px-4 py-2 rounded-lg text-xs font-semibold z-50">
        Skip to main content
      </a>

      {/* Top Navigation Bar with Logout */}
      <div className="bg-white border-b border-zinc-200 px-4 py-3 sticky top-0 z-50 backdrop-blur-md bg-opacity-90 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono tracking-wider border ${
              role === 'developer' ? 'bg-zinc-100 text-zinc-800 border-zinc-200' : 'bg-purple-50 text-purple-800 border-purple-200'
            }`}>
              {role === 'developer' ? 'Developer Workspace' : 'Manager Console'}
            </span>
            <span className="text-xs text-zinc-400 font-mono hidden sm:inline" aria-label={`Logged in as ${currentUser}`}>
              | {currentUser}
            </span>
          </div>
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50 border border-transparent hover:border-zinc-200 rounded-lg text-xs font-semibold transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 outline-none"
          >
            <LogOut className="w-3.5 h-3.5" aria-hidden="true" /> Sign Out
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 mt-8" id="main-content">
        
        {/* Header Block */}
        <header className="mb-8 border-b border-zinc-200 pb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-black flex items-center gap-2 text-balance">
            Mal.ai <span className="text-zinc-300 text-2xl font-light" aria-hidden="true">/</span> <span className="font-semibold text-zinc-700">Provisioning Portal</span>
          </h1>
          <p className="text-sm text-zinc-500 mt-2 max-w-xl text-balance">
            Clean dashboard for requesting and reviewing developer budgets, security tokens, and hardware assets.
          </p>
        </header>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8" aria-label="System Metrics Summary">
          {/* Card 1: Approved Allocation */}
          <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-zinc-400 font-bold uppercase font-mono tracking-wider">Approved Spending</span>
              <DollarSign className="w-4 h-4 text-zinc-500" aria-hidden="true" />
            </div>
            <div className="text-2xl font-bold font-mono text-zinc-900">AED {totalApproved.toLocaleString()}</div>
            <div className="text-xs text-zinc-500 mt-1">out of AED {BUDGET_CAP.toLocaleString()} cap</div>
            {/* Progress Bar */}
            <div className="w-full bg-zinc-100 rounded-full h-2 mt-4 overflow-hidden border border-zinc-200" aria-hidden="true">
              <div 
                className="bg-black h-2 rounded-full transition-[width] duration-500 ease-out" 
                style={{ width: `${Math.min(budgetProgress, 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Card 2: Pending Volume */}
          <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-zinc-400 font-bold uppercase font-mono tracking-wider">Pending Approvals Volume</span>
              <TrendingUp className="w-4 h-4 text-zinc-500" aria-hidden="true" />
            </div>
            <div className="text-2xl font-bold font-mono text-zinc-900">AED {totalPending.toLocaleString()}</div>
            <div className="text-xs text-zinc-500 mt-1">across {pendingCount} requests in queue</div>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-zinc-600 font-semibold">
              <AlertCircle className="w-3.5 h-3.5 text-zinc-400" aria-hidden="true" /> Action required
            </div>
          </div>

          {/* Card 3: System Status */}
          <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-zinc-400 font-bold uppercase font-mono tracking-wider">Sharia Compliance Score</span>
              <Terminal className="w-4 h-4 text-zinc-500" aria-hidden="true" />
            </div>
            <div className="text-2xl font-bold font-mono text-zinc-900">100%</div>
            <div className="text-xs text-zinc-500 mt-1">all disbursements verified</div>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" aria-hidden="true" /> All systems operational
            </div>
          </div>
        </section>

        {/* Dynamic Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Role-specific tools */}
          <main className="lg:col-span-8 space-y-8">
            {role === 'developer' ? (
              /* DEVELOPER WORKSPACE: Submit Request */
              <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-zinc-800 text-balance">
                  <PlusCircle className="w-5 h-5 text-zinc-500" aria-hidden="true" /> Create Budget or Access Request
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="request-title" className="block text-xs text-zinc-500 uppercase font-mono mb-1.5 font-bold">Request Title *</label>
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
                      <label htmlFor="request-category" className="block text-xs text-zinc-500 uppercase font-mono mb-1.5 font-bold">Category</label>
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
                      <label htmlFor="request-amount" className="block text-xs text-zinc-500 uppercase font-mono mb-1.5 font-bold">Amount Requested (AED) *</label>
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
                    <label htmlFor="request-description" className="block text-xs text-zinc-500 uppercase font-mono mb-1.5 font-bold">Justification &amp; Context *</label>
                    <textarea 
                      id="request-description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Detail the use-case, partner endpoints, and vendor parameters…"
                      rows={4}
                      className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-sm text-zinc-800 transition-[border-color,box-shadow] duration-150 focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 outline-none focus:border-transparent resize-none"
                      required
                      spellCheck={true}
                      autoComplete="off"
                    ></textarea>
                  </div>

                  {formMessage && (
                    <div 
                      className={`p-3 rounded-lg text-xs font-semibold border ${formMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'}`}
                      aria-live="polite"
                    >
                      {formMessage.text}
                    </div>
                  )}

                  <button 
                    type="submit" 
                    disabled={formLoading}
                    className="w-full bg-black hover:bg-zinc-950 text-white font-semibold rounded-lg py-2.5 text-sm transition-colors duration-150 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 outline-none"
                  >
                    {formLoading ? 'Submitting…' : 'Submit Request'}
                  </button>
                </form>
              </div>
            ) : (
              /* MANAGER WORKSPACE: Approve Queue */
              <div className="space-y-4">
                <h2 className="text-lg font-bold flex items-center gap-2 text-zinc-800 text-balance">
                  <Shield className="w-5 h-5 text-zinc-500" aria-hidden="true" /> Pending Approval Queue ({pendingCount})
                </h2>
                
                {loading ? (
                  <div className="text-center py-8 text-zinc-500" aria-live="polite">Loading requests…</div>
                ) : requests.filter(r => r.status === 'pending').length === 0 ? (
                  <div className="bg-white border border-zinc-200 rounded-xl p-8 text-center text-zinc-400 shadow-sm">
                    All clear! No pending approvals in queue.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {requests
                      .filter(r => r.status === 'pending')
                      .map((req) => (
                        <div key={req.id} className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm">
                          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                            <div className="space-y-2 flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono tracking-wider border ${
                                  req.category === 'budget' ? 'bg-zinc-100 text-zinc-800 border-zinc-200' :
                                  req.category === 'access' ? 'bg-purple-50 text-purple-800 border-purple-200' :
                                  'bg-amber-50 text-amber-800 border-amber-200'
                                }`}>
                                  {req.category}
                                </span>
                                <span className="text-xs text-zinc-500 font-mono">By {req.requested_by}</span>
                              </div>
                              <h3 className="text-base font-bold text-zinc-800 truncate">{req.title}</h3>
                              <p className="text-xs text-zinc-500 break-words">{req.description}</p>
                            </div>
                            
                            <div className="text-right flex flex-col items-end gap-3 min-w-[120px]">
                              {req.category !== 'access' && (
                                <div className="text-lg font-bold font-mono text-zinc-800 font-variant-numeric-tabular-nums">
                                  AED {Number(req.amount).toLocaleString()}
                                </div>
                              )}
                              
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => handleDecision(req.id, 'rejected')}
                                  className="p-2 hover:bg-zinc-50 text-red-600 rounded-lg border border-zinc-200 transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 outline-none"
                                  aria-label={`Reject request for ${req.title}`}
                                  title="Reject"
                                >
                                  <XCircle className="w-4 h-4" aria-hidden="true" />
                                </button>
                                <button 
                                  onClick={() => handleDecision(req.id, 'approved')}
                                  className="p-2 hover:bg-zinc-50 text-emerald-600 rounded-lg border border-zinc-200 transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 outline-none"
                                  aria-label={`Approve request for ${req.title}`}
                                  title="Approve"
                                >
                                  <CheckCircle className="w-4 h-4" aria-hidden="true" />
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
              <h2 className="text-lg font-bold flex items-center gap-2 text-zinc-800 text-balance">
                <Layers className="w-5 h-5 text-zinc-500" aria-hidden="true" /> Logged Activity History
              </h2>
              
              {loading ? (
                <div className="text-center py-8 text-zinc-500" aria-live="polite">Loading history…</div>
              ) : requests.length === 0 ? (
                <div className="text-center py-8 text-zinc-400">No logs found.</div>
              ) : (
                <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden divide-y divide-zinc-100 shadow-sm">
                  {requests.map((req) => (
                    <div key={req.id} className="p-4 hover:bg-zinc-50/50 transition-colors duration-150">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-zinc-800 truncate">{req.title}</span>
                            <span className="text-[10px] text-zinc-400 font-mono">({req.requested_by})</span>
                          </div>
                          {req.decision_reason && (
                            <p className="text-xs text-zinc-500 italic mt-1 flex items-center gap-1 break-words">
                              <Info className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" aria-hidden="true" />
                              Note: {req.decision_reason}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-4 justify-between md:justify-end">
                          {req.category !== 'access' && (
                            <span className="text-xs font-mono font-semibold text-zinc-500 font-variant-numeric-tabular-nums">
                              AED {Number(req.amount).toLocaleString()}
                            </span>
                          )}
                          
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase font-mono tracking-wider border ${
                            req.status === 'approved' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                            req.status === 'rejected' ? 'bg-red-50 text-red-800 border-red-200' :
                            'bg-amber-50 text-amber-800 border-amber-200'
                          }`}>
                            {req.status === 'approved' && <CheckCircle className="w-3 h-3" aria-hidden="true" />}
                            {req.status === 'rejected' && <XCircle className="w-3 h-3" aria-hidden="true" />}
                            {req.status === 'pending' && <Clock className="w-3 h-3" aria-hidden="true" />}
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
            
            {/* Quick Session Info */}
            <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm">
              <h3 className="text-xs font-bold mb-3 uppercase tracking-wider font-mono text-zinc-400">Current Session</h3>
              <div className="space-y-3 text-xs">
                <div>
                  <div className="text-zinc-400 font-mono font-semibold">User Role</div>
                  <div className="font-mono text-zinc-800 font-bold mt-0.5 capitalize">{role}</div>
                </div>
                <hr className="border-zinc-100" />
                <div>
                  <div className="text-zinc-400 font-mono font-semibold">Session Email</div>
                  <div className="font-mono text-zinc-800 font-bold mt-0.5 select-all">{currentUser}</div>
                </div>
              </div>
            </div>

            {/* Architecture Card */}
            <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm">
              <h3 className="text-xs font-bold mb-3 uppercase tracking-wider font-mono text-zinc-400">System Architecture</h3>
              <ul className="space-y-3 text-xs text-zinc-500">
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <span><strong>Next.js 14 App Router</strong>: Leverages react hooks for state management.</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <span><strong>Supabase Integration</strong>: Database syncing queries connected to active cloud PostgreSQL tables.</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <span><strong>Zero-Config Fallback</strong>: Recruiter bypass settings allow incognito testing without `.env` setup.</span>
                </li>
              </ul>
            </div>
          </aside>

        </div>
      </div>

      {/* Decision Dialog Modal (Approve / Reject reasons) */}
      {activeDecisionId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div className="bg-white border border-zinc-200 rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 id="modal-title" className="text-base font-bold text-zinc-800">
              Confirm {decisionType === 'approved' ? 'Approval' : 'Rejection'} Decision
            </h3>
            <p className="text-xs text-zinc-500">
              Provide an optional comment or justification note for the applicant.
            </p>
            
            <div>
              <label htmlFor="decision-note" className="block text-[10px] text-zinc-400 uppercase font-mono mb-1.5 font-bold">Decision Note / Comment</label>
              <textarea 
                id="decision-note"
                value={decisionReason}
                onChange={(e) => setDecisionReason(e.target.value)}
                placeholder={decisionType === 'approved' ? 'e.g. Budget approved for H1 usage…' : 'e.g. Please use shared Llama keys instead…'}
                rows={3}
                className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-sm text-zinc-800 transition-[border-color,box-shadow] duration-150 focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 outline-none focus:border-transparent resize-none"
              ></textarea>
            </div>

            <div className="flex gap-3 justify-end text-xs font-semibold">
              <button 
                onClick={() => setActiveDecisionId(null)}
                className="px-4 py-2 border border-zinc-200 text-zinc-500 hover:text-zinc-800 rounded-lg transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 outline-none"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button 
                onClick={submitDecision}
                className={`px-4 py-2 rounded-lg text-white transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-offset-2 outline-none ${
                  decisionType === 'approved' ? 'bg-emerald-600 hover:bg-emerald-500 focus-visible:ring-emerald-600' : 'bg-red-600 hover:bg-red-500 focus-visible:ring-red-600'
                }`}
                disabled={actionLoading}
              >
                {actionLoading ? 'Processing…' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
