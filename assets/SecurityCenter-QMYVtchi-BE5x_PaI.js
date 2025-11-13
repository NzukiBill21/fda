import { m as me, c as cs, v as vj, J as Jg, u as uN, a as v, n, W as WN, b as Ja, t as t5, O } from "./index-CjAxsb6E.js";
const k = [["path", { d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z", key: "oel41y" }], ["path", { d: "M12 8v4", key: "1got3b" }], ["path", { d: "M12 16h.01", key: "1drbdi" }]], S = me("shield-alert", k), L = { js_error: uN, unhandled_rejection: uN, auth_error: Jg, network_error: vj, devtools_open: cs }, A = (a) => a === "auth_error" ? { label: "High", color: "bg-red-100 text-red-700" } : a === "network_error" ? { label: "Medium", color: "bg-yellow-100 text-yellow-700" } : a === "devtools_open" ? { label: "Low", color: "bg-blue-100 text-blue-700" } : { label: "Medium", color: "bg-yellow-100 text-yellow-700" };
function E() {
  const [a, x] = v.useState([]), [c, m] = v.useState("all");
  v.useEffect(() => {
    let t = false;
    const n2 = async () => {
      try {
        const s = await fetch("http://localhost:5000/api/security/events");
        if (s.ok) {
          const r = await s.json();
          !t && Array.isArray(r == null ? void 0 : r.events) && x(r.events);
          return;
        }
      } catch {
      }
      try {
        const s = JSON.parse(localStorage.getItem("sec_events") || "[]");
        !t && Array.isArray(s) && x(s);
      } catch {
      }
    };
    n2();
    const o = setInterval(n2, 8e3);
    return () => {
      t = true, clearInterval(o);
    };
  }, []);
  const i = v.useMemo(() => c === "all" ? a : a.filter((t) => t.type === c), [a, c]), p = () => {
    const t = ["Time", "Type", "URL", "UserAgent", "Detail"], n2 = i.map((l) => [l.ts, l.type, l.url, l.ua, JSON.stringify(l.detail)]), o = [t.join(","), ...n2.map((l) => l.map((g) => `"${String(g).replace(/"/g, '""')}"`).join(","))].join(`
`), s = new Blob([o], { type: "text/csv;charset=utf-8;" }), r = document.createElement("a");
    r.href = URL.createObjectURL(s), r.download = `security_events_${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.csv`, r.click();
  }, u = ["all", "js_error", "unhandled_rejection", "auth_error", "network_error", "devtools_open"];
  return n.jsxs("div", { className: "bg-gradient-to-br from-red-900/40 to-yellow-900/40 backdrop-blur-xl rounded-3xl p-8 border-2 border-red-500/30 shadow-2xl", children: [n.jsxs("div", { className: "flex items-center gap-3 mb-6", children: [n.jsx(S, { className: "w-8 h-8 text-red-400" }), n.jsx("h2", { className: "text-3xl font-bold text-white", children: "Security Center" })] }), n.jsxs("div", { className: "flex flex-wrap items-center gap-3 mb-6", children: [n.jsxs("div", { className: "flex items-center gap-2", children: [n.jsx(WN, { className: "w-4 h-4 text-white" }), n.jsx("select", { value: c, onChange: (t) => m(t.target.value), className: "px-3 py-2 rounded-lg bg-white/90 text-gray-900 font-semibold", children: u.map((t) => n.jsx("option", { value: t, children: t.replace("_", " ") }, t)) })] }), n.jsxs("button", { onClick: p, className: "px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center gap-2", children: [n.jsx(Ja, { className: "w-4 h-4" }), " Export CSV"] }), n.jsxs("span", { className: "text-white/80", children: [i.length, " events"] })] }), n.jsxs("div", { className: "grid grid-cols-1 gap-3 max-h-[60vh] overflow-y-auto pr-2", children: [i.length === 0 && n.jsx("div", { className: "text-white/80", children: "No security events recorded." }), i.map((t, n$1) => {
    const o = L[t.type] || t5, s = A(t.type);
    return n.jsxs(O.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, className: "bg-white/95 rounded-xl p-4 shadow border border-white/40", children: [n.jsxs("div", { className: "flex items-center justify-between", children: [n.jsxs("div", { className: "flex items-center gap-3", children: [n.jsx("div", { className: "w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center", children: n.jsx(o, { className: "w-5 h-5" }) }), n.jsxs("div", { children: [n.jsx("div", { className: "font-bold text-gray-900", children: t.type.replace("_", " ") }), n.jsx("div", { className: "text-xs text-gray-500", children: new Date(t.ts).toLocaleString() })] })] }), n.jsx("span", { className: `px-2.5 py-1 rounded-full text-xs font-bold ${s.color}`, children: s.label })] }), n.jsxs("div", { className: "mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm", children: [n.jsxs("div", { className: "text-gray-700 break-all", children: [n.jsx("span", { className: "font-semibold", children: "URL:" }), " ", t.url] }), n.jsxs("div", { className: "text-gray-700 break-all md:col-span-2", children: [n.jsx("span", { className: "font-semibold", children: "Detail:" }), " ", JSON.stringify(t.detail)] })] }), n.jsxs("div", { className: "mt-2 text-xs text-gray-500 break-all", children: [n.jsx("span", { className: "font-semibold", children: "User Agent:" }), " ", t.ua] })] }, n$1);
  })] })] });
}
export {
  E as default
};
