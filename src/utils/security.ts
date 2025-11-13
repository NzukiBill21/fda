// Enterprise security hardening
export class SecurityManager {
  private static instance: SecurityManager;
  private csrfToken: string | null = null;
  private rateLimitMap = new Map<string, { count: number; resetTime: number }>();

  private constructor() {
    this.initializeSecurity();
  }

  public static getInstance(): SecurityManager {
    if (!SecurityManager.instance) {
      SecurityManager.instance = new SecurityManager();
    }
    return SecurityManager.instance;
  }

  private initializeSecurity(): void {
    // Generate CSRF token
    this.csrfToken = this.generateCSRFToken();
    
    // Set security headers
    this.setSecurityHeaders();
    
    // Initialize content security policy
    this.setContentSecurityPolicy();
  }

  private generateCSRFToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  private setSecurityHeaders(): void {
    // Add security headers to meta tags
    const metaTags = [
      { name: 'referrer', content: 'strict-origin-when-cross-origin' },
      { name: 'x-frame-options', content: 'DENY' },
      { name: 'x-content-type-options', content: 'nosniff' },
      { name: 'x-xss-protection', content: '1; mode=block' }
    ];

    metaTags.forEach(tag => {
      let meta = document.querySelector(`meta[name="${tag.name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', tag.name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', tag.content);
    });
  }

  private setContentSecurityPolicy(): void {
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; ');

    let meta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('http-equiv', 'Content-Security-Policy');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', csp);
  }

  // Input validation and sanitization
  public sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }

  public validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  public validatePassword(password: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Rate limiting
  public checkRateLimit(identifier: string, limit: number = 10, windowMs: number = 60000): boolean {
    const now = Date.now();
    const record = this.rateLimitMap.get(identifier);
    
    if (!record || now > record.resetTime) {
      this.rateLimitMap.set(identifier, {
        count: 1,
        resetTime: now + windowMs
      });
      return true;
    }
    
    if (record.count >= limit) {
      return false;
    }
    
    record.count++;
    return true;
  }

  // XSS Protection
  public escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // SQL Injection Protection (for client-side validation)
  public sanitizeForDatabase(input: string): string {
    return input
      .replace(/['"]/g, '') // Remove quotes
      .replace(/;/, '') // Remove semicolons
      .replace(/--/, '') // Remove SQL comments
      .replace(/\/\*/, '') // Remove block comments
      .replace(/\*\//, '')
      .trim();
  }

  // Token validation
  public validateToken(token: string): boolean {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return false;
      }
      
      const payload = JSON.parse(atob(parts[1]));
      const now = Math.floor(Date.now() / 1000);
      
      return payload.exp > now;
    } catch {
      return false;
    }
  }

  // Secure storage
  public setSecureItem(key: string, value: string): void {
    try {
      const encrypted = this.encrypt(value);
      localStorage.setItem(key, encrypted);
    } catch (error) {
      console.error('Failed to store secure item:', error);
    }
  }

  public getSecureItem(key: string): string | null {
    try {
      const encrypted = localStorage.getItem(key);
      if (!encrypted) {
        return null;
      }
      return this.decrypt(encrypted);
    } catch (error) {
      console.error('Failed to retrieve secure item:', error);
      return null;
    }
  }

  private encrypt(text: string): string {
    // Simple encryption for demo - use proper encryption in production
    return btoa(text);
  }

  private decrypt(encrypted: string): string {
    // Simple decryption for demo - use proper decryption in production
    return atob(encrypted);
  }

  // Security monitoring
  public logSecurityEvent(event: string, details: any): void {
    console.warn('🔒 Security Event:', {
      event,
      details,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });
    
    // Send to security monitoring service
    this.sendToSecurityService(event, details);
  }

  private async sendToSecurityService(event: string, details: any): Promise<void> {
    try {
      const { createApiUrl } = await import('../config/api');
      await fetch(createApiUrl('api/security/events'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': this.csrfToken || ''
        },
        body: JSON.stringify({
          event,
          details,
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Failed to send security event:', error);
    }
  }

  // Session management
  public startSecureSession(): void {
    const sessionId = this.generateSessionId();
    sessionStorage.setItem('sessionId', sessionId);
    
    // Set session timeout
    setTimeout(() => {
      this.endSession();
    }, 30 * 60 * 1000); // 30 minutes
  }

  public endSession(): void {
    sessionStorage.removeItem('sessionId');
    localStorage.removeItem('token');
    
    // Redirect to login
    window.location.href = '/login';
  }

  private generateSessionId(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Device fingerprinting for security
  public generateDeviceFingerprint(): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx?.fillText('Device fingerprint', 10, 10);
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL()
    ].join('|');
    
    return btoa(fingerprint);
  }
}

export const securityManager = SecurityManager.getInstance();

// Request interceptor for security
export const secureRequest = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  // Add security headers
  const secureOptions: RequestInit = {
    ...options,
    headers: {
      ...options.headers,
      'X-CSRF-Token': securityManager['csrfToken'] || '',
      'X-Requested-With': 'XMLHttpRequest'
    }
  };

  // Check rate limit
  const clientId = securityManager.generateDeviceFingerprint();
  if (!securityManager.checkRateLimit(clientId)) {
    throw new Error('Rate limit exceeded');
  }

  try {
    const response = await fetch(url, secureOptions);
    
    // Check for security headers in response
    const cspHeader = response.headers.get('Content-Security-Policy');
    if (!cspHeader) {
      securityManager.logSecurityEvent('missing_csp_header', { url });
    }
    
    return response;
  } catch (error) {
    securityManager.logSecurityEvent('request_failed', { url, error: error.message });
    throw error;
  }
};

