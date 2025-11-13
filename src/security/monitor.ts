/* Runtime security monitor: captures JS errors, promise rejections, rapid failed auths,
   naive devtools/tamper signals, and suspicious network errors. Sends a beacon to
   a backend endpoint and can optionally show a toast. */

type MonitorOptions = {
  reportUrl: string;
  showToast?: boolean;
  email?: {
    // Optional EmailJS configuration (set via Vite envs)
    serviceId?: string;
    templateId?: string;
    publicKey?: string;
    to?: string;
  }
};

let initialized = false;
let networkDisabled = false;
let authBurst = 0;
let lastAuthTs = 0;

export function initSecurityMonitor(options: MonitorOptions) {
  if (initialized) return;
  initialized = true;
  const { reportUrl, showToast } = options;

  const pushLocal = (event: any) => {
    try {
      const key = 'sec_events';
      const arr = JSON.parse(localStorage.getItem(key) || '[]');
      arr.unshift(event);
      if (arr.length > 200) arr.length = 200;
      localStorage.setItem(key, JSON.stringify(arr));
    } catch {}
  };

  const send = (type: string, detail: Record<string, any>) => {
    try {
      const event = {
        type,
        ts: new Date().toISOString(),
        detail,
        url: location.href,
        ua: navigator.userAgent,
      };
      pushLocal(event);
      if (!networkDisabled) {
        const payload = JSON.stringify(event);
        if (navigator.sendBeacon) {
          const blob = new Blob([payload], { type: 'application/json' });
          navigator.sendBeacon(reportUrl, blob);
        } else {
          fetch(reportUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload }).catch(() => {});
        }
      }
      if (showToast) {
        // Lazy import to avoid bundling sonner on first paint if not used
        import('../components/ui/sonner').then(m => m.toast?.warning?.(`Security event: ${type}`)).catch(() => {});
      }

      // If configured, send critical notifications by email
      if (options.email && shouldEmail(type, detail)) {
        emailNotify(event, options.email).catch(() => {});
      }
    } catch {
      // ignore
    }
  };

  function shouldEmail(type: string, detail: any) {
    if (type === 'auth_error') {
      const now = Date.now();
      if (now - lastAuthTs > 20000) { authBurst = 0; }
      lastAuthTs = now;
      authBurst++;
      if (authBurst >= 5) { authBurst = 0; return true; }
    }
    if (type === 'network_error') return true;
    return false;
  }

  async function emailNotify(event: any, cfg: NonNullable<MonitorOptions['email']>) {
    // Uses EmailJS when envs are provided; no-ops otherwise
    const serviceId = cfg.serviceId || import.meta.env.VITE_EMAILJS_SERVICE;
    const templateId = cfg.templateId || import.meta.env.VITE_EMAILJS_TEMPLATE;
    const publicKey = cfg.publicKey || import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
    const to = cfg.to || import.meta.env.VITE_ALERT_EMAIL;
    if (!serviceId || !templateId || !publicKey || !to) return;
    // load emailjs from CDN dynamically
    await new Promise<void>((resolve, reject) => {
      if ((window as any).emailjs) return resolve();
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/emailjs-com@3/dist/email.min.js';
      s.onload = () => resolve();
      s.onerror = () => resolve();
      document.head.appendChild(s);
    });
    try {
      const ej = (window as any).emailjs as any;
      ej.init(publicKey);
      await ej.send(serviceId, templateId, {
        to_email: to,
        subject: `[Mondas] Security event: ${event.type}`,
        message: `Type: ${event.type}\nTime: ${event.ts}\nURL: ${event.url}\nDetail: ${JSON.stringify(event.detail)}\nUA: ${event.ua}`,
      });
    } catch {}
  }

  // JS errors
  window.addEventListener('error', (e) => {
    send('js_error', { message: e.message, source: (e as any).filename, line: (e as any).lineno, col: (e as any).colno });
  });

  // Unhandled promise rejections
  window.addEventListener('unhandledrejection', (e) => {
    send('unhandled_rejection', { reason: String((e as any).reason) });
  });

  // Simple devtools open signal (heuristic and not security) – can be disabled later
  let devtoolsOpen = false;
  const threshold = 160;
  setInterval(() => {
    const widthThreshold = window.outerWidth - window.innerWidth > threshold;
    const heightThreshold = window.outerHeight - window.innerHeight > threshold;
    const isOpen = widthThreshold || heightThreshold;
    if (isOpen && !devtoolsOpen) {
      devtoolsOpen = true;
      send('devtools_open', {});
    } else if (!isOpen && devtoolsOpen) {
      devtoolsOpen = false;
    }
  }, 2000);

  // Fetch wrapper to catch 401/403 bursts and CORS/Network errors
  const origFetch = window.fetch;
  (window as any).fetch = async (...args: any[]) => {
    try {
      const res = await origFetch(...args as any);
      if (res.status === 401 || res.status === 403) {
        send('auth_error', { status: res.status, url: (args[0] as RequestInfo) });
      }
      return res;
    } catch (err: any) {
      // Don't report connection refused errors (backend not running)
      const url = String(args[0] || '');
      if (!err.message?.includes('ERR_CONNECTION_REFUSED') && 
          !err.message?.includes('Failed to fetch') &&
          !url.includes('/api/security/log')) {
        send('network_error', { error: String(err), url });
      }
      throw err;
    }
  };

  // Probe reporting endpoint once; if missing, disable network reporting to avoid noisy 404s in dev
  try {
    fetch(options.reportUrl, { method: 'HEAD', mode: 'no-cors' })
      .then(() => {})
      .catch(() => { 
        networkDisabled = true; 
      });
  } catch { 
    networkDisabled = true; 
  }
  
  // Disable network reporting if endpoint is blocked
  setTimeout(() => {
    if (networkDisabled) {
      // Silently disable to avoid console spam
    }
  }, 2000);
}


