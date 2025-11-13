import React, { useEffect, useMemo, useState } from 'react';
import { createApiUrl } from '../config/api';;
import { ShieldAlert, Download, Filter, AlertTriangle, Bug, Network, Lock, Eye } from 'lucide-react';
import { motion } from 'motion/react';

type SecEvent = {
  type: string;
  ts: string;
  detail: any;
  url: string;
  ua: string;
};

const typeToIcon: Record<string, any> = {
  js_error: Bug,
  unhandled_rejection: Bug,
  auth_error: Lock,
  network_error: Network,
  devtools_open: Eye,
};

const severityOf = (t: string) => {
  if (t === 'auth_error') return { label: 'High', color: 'bg-red-100 text-red-700' };
  if (t === 'network_error') return { label: 'Medium', color: 'bg-yellow-100 text-yellow-700' };
  if (t === 'devtools_open') return { label: 'Low', color: 'bg-blue-100 text-blue-700' };
  return { label: 'Medium', color: 'bg-yellow-100 text-yellow-700' };
};

export default function SecurityCenter() {
  const [events, setEvents] = useState<SecEvent[]>([]);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const { createApiUrl } = await import('../config/api');
        const res = await fetch(createApiUrl('api/security/events'));
        if (res.ok) {
          const data = await res.json();
          if (!cancelled && Array.isArray(data?.events)) setEvents(data.events);
          return;
        }
      } catch {}
      try {
        const local = JSON.parse(localStorage.getItem('sec_events') || '[]');
        if (!cancelled && Array.isArray(local)) setEvents(local);
      } catch {}
    };
    load();
    const id = setInterval(load, 8000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  const filtered = useMemo(() => {
    if (filter === 'all') return events;
    return events.filter(e => e.type === filter);
  }, [events, filter]);

  const exportCSV = () => {
    const headers = ['Time', 'Type', 'URL', 'UserAgent', 'Detail'];
    const rows = filtered.map(e => [e.ts, e.type, e.url, e.ua, JSON.stringify(e.detail)]);
    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `security_events_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const types = ['all','js_error','unhandled_rejection','auth_error','network_error','devtools_open'];

  return (
    <div className="bg-gradient-to-br from-red-900/40 to-yellow-900/40 backdrop-blur-xl rounded-3xl p-8 border-2 border-red-500/30 shadow-2xl">
      <div className="flex items-center gap-3 mb-6">
        <ShieldAlert className="w-8 h-8 text-red-400" />
        <h2 className="text-3xl font-bold text-white">Security Center</h2>
      </div>
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-white" />
          <select value={filter} onChange={(e)=>setFilter(e.target.value)} className="px-3 py-2 rounded-lg bg-white/90 text-gray-900 font-semibold">
            {types.map(t => <option key={t} value={t}>{t.replace('_',' ')}</option>)}
          </select>
        </div>
        <button onClick={exportCSV} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center gap-2">
          <Download className="w-4 h-4" /> Export CSV
        </button>
        <span className="text-white/80">{filtered.length} events</span>
      </div>
      <div className="grid grid-cols-1 gap-3 max-h-[60vh] overflow-y-auto pr-2">
        {filtered.length === 0 && (
          <div className="text-white/80">No security events recorded.</div>
        )}
        {filtered.map((e, idx) => {
          const Icon = typeToIcon[e.type] || AlertTriangle;
          const sev = severityOf(e.type);
          return (
            <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white/95 rounded-xl p-4 shadow border border-white/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center"><Icon className="w-5 h-5" /></div>
                  <div>
                    <div className="font-bold text-gray-900">{e.type.replace('_',' ')}</div>
                    <div className="text-xs text-gray-500">{new Date(e.ts).toLocaleString()}</div>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${sev.color}`}>{sev.label}</span>
              </div>
              <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div className="text-gray-700 break-all"><span className="font-semibold">URL:</span> {e.url}</div>
                <div className="text-gray-700 break-all md:col-span-2"><span className="font-semibold">Detail:</span> {JSON.stringify(e.detail)}</div>
              </div>
              <div className="mt-2 text-xs text-gray-500 break-all"><span className="font-semibold">User Agent:</span> {e.ua}</div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}


