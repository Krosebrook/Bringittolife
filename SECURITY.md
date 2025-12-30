# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 3.0.x   | :white_check_mark: |
| < 3.0   | :x:                |

---

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability, please report it responsibly.

### How to Report

1. **DO NOT** open a public GitHub issue
2. Email the maintainers privately (create an issue requesting contact information)
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### What to Expect

- **Acknowledgment**: Within 48 hours
- **Initial Assessment**: Within 7 days
- **Status Updates**: Every 7-14 days
- **Resolution Timeline**: Varies by severity

### Disclosure Policy

- We will work with you to understand and resolve the issue
- We will credit you (unless you prefer to remain anonymous)
- We will coordinate disclosure timing with you
- We will release a security advisory when appropriate

---

## Security Best Practices

### For Users

#### API Key Management

**⚠️ CRITICAL**: Never commit API keys to version control

```bash
# ✅ GOOD: Use environment variables
GEMINI_API_KEY=your_key_here

# ❌ BAD: Hardcoded in code
const apiKey = "AIzaSyC...";
```

**Current Limitation**: API keys are currently bundled in client code. This is a known security issue being addressed in v3.1.

**Recommended Workaround**: Use a backend proxy:

```typescript
// Instead of calling Gemini directly from browser:
const response = await geminiService.generateArtifact(prompt);

// Call your own backend:
const response = await fetch('/api/generate', {
  method: 'POST',
  body: JSON.stringify({ prompt })
});
```

#### Content Security Policy

Ensure your deployment includes CSP headers:

```
Content-Security-Policy: 
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com;
  style-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com;
  connect-src 'self' https://generativelanguage.googleapis.com;
  img-src 'self' data: https:;
  frame-src 'self';
```

#### Input Sanitization

User-provided content is sanitized before preview:

```typescript
// HTML injection prevention
const cleanHtml = rawHtml.replace(/<script[^>]*>.*?<\/script>/gi, '');

// Preview in isolated iframe
<iframe sandbox="allow-scripts allow-same-origin" />
```

### For Contributors

#### Code Review Checklist

Before submitting PRs, verify:

- [ ] No hardcoded secrets or API keys
- [ ] User input is validated and sanitized
- [ ] No SQL injection vectors (not applicable currently)
- [ ] No XSS vulnerabilities
- [ ] Dependencies are up-to-date
- [ ] Error messages don't leak sensitive info
- [ ] Proper authentication/authorization (future)

#### Dependency Management

```bash
# Check for vulnerabilities
npm audit

# Fix automatically (when possible)
npm audit fix

# Review and update dependencies
npm outdated
```

---

## Known Security Issues

### High Priority

1. **Client-side API Keys** (v3.0)
   - **Issue**: API keys bundled in client JavaScript
   - **Risk**: Keys can be extracted by users
   - **Mitigation**: Rate limiting on API provider side
   - **Fix**: Backend proxy (planned v3.1)

### Medium Priority

2. **LocalStorage Persistence**
   - **Issue**: Sensitive data in browser storage
   - **Risk**: Accessible to any script on same origin
   - **Mitigation**: No truly sensitive data stored
   - **Fix**: Encryption layer (planned v3.2)

3. **Iframe Sandbox**
   - **Issue**: Generated code runs in iframe
   - **Risk**: Potential XSS if sanitization fails
   - **Mitigation**: Sandbox attribute limits capabilities
   - **Fix**: Enhanced sanitization (v3.1)

### Low Priority

4. **CSRF Protection**
   - **Issue**: No CSRF tokens (no auth currently)
   - **Risk**: Low (no authenticated endpoints)
   - **Mitigation**: Not applicable without auth
   - **Fix**: Add when auth implemented (v3.5)

---

## Security Features

### Implemented

- ✅ **Input Sanitization**: HTML/JS sanitization before preview
- ✅ **Iframe Isolation**: Generated code runs in isolated context
- ✅ **Sandbox Attributes**: Restricts iframe capabilities
- ✅ **HTTPS Enforcement**: (deployment-dependent)
- ✅ **Dependency Scanning**: Automated via Dependabot (when enabled)

### Planned

- 🚧 **Backend API Proxy** (v3.1): Hide API keys from client
- 🚧 **Rate Limiting** (v3.1): Prevent abuse
- 🚧 **Content Validation** (v3.1): Stricter output validation
- 🚧 **User Authentication** (v3.5): Secure user accounts
- 🚧 **Audit Logging** (v4.0): Security event logging

---

## Security Guidelines by Feature

### AI Code Generation

**Risks:**
- Malicious prompt injection
- Generated code with vulnerabilities
- Prompt leakage

**Mitigations:**
- Prompt sanitization
- Output validation
- Sandbox execution
- No server-side execution

**Best Practices:**
```typescript
// Validate user prompts
function validatePrompt(prompt: string): boolean {
  if (prompt.length > 10000) return false;
  if (containsMaliciousPatterns(prompt)) return false;
  return true;
}

// Sanitize AI output
function sanitizeOutput(html: string): string {
  return html
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
}
```

### Voice Input

**Risks:**
- Audio data leakage
- Unauthorized microphone access

**Mitigations:**
- Explicit user permission
- No audio recording/storage
- Real-time transcription only

**Best Practices:**
```typescript
// Request permission explicitly
async function requestMicrophoneAccess() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    return stream;
  } catch (error) {
    // Handle denied permission
    throw new Error('Microphone access denied');
  }
}
```

### File Upload

**Risks:**
- Malicious file upload
- Large file DoS

**Mitigations:**
- File type validation
- Size limits
- Base64 encoding
- No server storage

**Best Practices:**
```typescript
function validateFile(file: File): boolean {
  const validTypes = ['image/png', 'image/jpeg', 'image/gif', 'application/pdf'];
  const maxSize = 4 * 1024 * 1024; // 4MB
  
  if (!validTypes.includes(file.type)) return false;
  if (file.size > maxSize) return false;
  
  return true;
}
```

### LocalStorage

**Risks:**
- XSS can access localStorage
- No encryption at rest
- Quota limits

**Mitigations:**
- No sensitive data stored
- Quota handling
- Periodic cleanup

**Best Practices:**
```typescript
function safeStorageSet(key: string, value: any): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    if (e.name === 'QuotaExceededError') {
      // Handle quota exceeded
      pruneOldData();
      return false;
    }
    throw e;
  }
}
```

---

## Deployment Security

### Environment Variables

**Required:**
```bash
# Production
GEMINI_API_KEY=prod_key_here
NODE_ENV=production

# Optional Security Enhancements
RATE_LIMIT_MAX=15
RATE_LIMIT_WINDOW_MS=60000
ENABLE_CSP=true
```

**Never commit:**
- `.env`
- `.env.local`
- `.env.*.local`

### Production Checklist

Before deploying to production:

- [ ] API keys in environment variables (not code)
- [ ] HTTPS enabled and enforced
- [ ] CSP headers configured
- [ ] Rate limiting enabled
- [ ] Error reporting configured (no sensitive data in logs)
- [ ] Dependencies up-to-date
- [ ] Security audit passed
- [ ] Backup strategy in place
- [ ] Incident response plan documented

### Recommended Headers

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(self), camera=()
Content-Security-Policy: [see above]
```

---

## Security Monitoring

### Recommended Tools

**Dependency Scanning:**
- GitHub Dependabot
- npm audit
- Snyk

**Code Analysis:**
- ESLint with security plugins
- SonarQube
- CodeQL

**Runtime Monitoring:**
- Sentry (error tracking)
- LogRocket (session replay)
- Application Insights

### Metrics to Monitor

- Failed authentication attempts (future)
- Rate limit violations
- Error rates (especially input validation)
- Unusual API usage patterns
- Large file uploads

---

## Incident Response

### If You Detect a Security Issue

1. **Contain**: Disable affected feature/deployment
2. **Assess**: Determine scope and impact
3. **Notify**: Inform users if data exposed
4. **Fix**: Deploy patch ASAP
5. **Document**: Post-mortem analysis
6. **Learn**: Update security measures

### Emergency Contacts

- Create a GitHub issue with "SECURITY" prefix
- Tag maintainers
- Provide contact information for private discussion

---

## Security Roadmap

### v3.1 (Q1 2025) - Critical Security

- [ ] Backend API proxy
- [ ] Rate limiting
- [ ] Enhanced input validation
- [ ] Security headers enforcement
- [ ] Automated security testing

### v3.5 (Q2-Q3 2025) - Authentication & Authorization

- [ ] User authentication
- [ ] OAuth integration
- [ ] Role-based access control
- [ ] Session management
- [ ] CSRF protection

### v4.0 (Q4 2025+) - Enterprise Security

- [ ] SSO/SAML support
- [ ] Audit logging
- [ ] Compliance (SOC 2, GDPR)
- [ ] Penetration testing
- [ ] Security certifications

---

## Resources

### Security Tools

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CWE Top 25](https://cwe.mitre.org/top25/)
- [npm audit](https://docs.npmjs.com/cli/v8/commands/npm-audit)
- [Snyk](https://snyk.io/)

### Further Reading

- [React Security Best Practices](https://react.dev/learn/escape-hatches#security-pitfalls)
- [OWASP Cheat Sheets](https://cheatsheetseries.owasp.org/)
- [Web Security Academy](https://portswigger.net/web-security)

---

## Acknowledgments

We thank security researchers and contributors who help keep Manifestation Lab secure. Responsible disclosure is appreciated and will be credited.

---

**Last Updated:** December 29, 2024  
**Security Contact:** See GitHub Issues for contact method  
**PGP Key:** Not yet available (planned)
