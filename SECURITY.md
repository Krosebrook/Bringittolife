# Security Policy

## Supported Versions

We release security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 3.0.x   | :white_check_mark: |
| < 3.0   | :x:                |

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability in Manifestation Lab, please report it responsibly.

### How to Report

**Please DO NOT** report security vulnerabilities through public GitHub issues.

Instead, please report vulnerabilities by:

1. **Email**: Send details to security@manifestation-lab.dev (if available)
2. **GitHub Security Advisories**: Use the [Security Advisory](https://github.com/Krosebrook/Bringittolife/security/advisories/new) page

### What to Include

When reporting a vulnerability, please include:

- **Type of vulnerability** (e.g., XSS, API key exposure, injection)
- **Full paths** of affected source files
- **Location** of the vulnerable code (tag/branch/commit)
- **Step-by-step instructions** to reproduce the issue
- **Proof-of-concept** or exploit code (if possible)
- **Impact** of the vulnerability
- **Suggested fix** (if you have one)

### Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Fix Timeline**: Depends on severity
  - Critical: 1-3 days
  - High: 7-14 days
  - Medium: 14-30 days
  - Low: 30-60 days

### Disclosure Policy

- We will coordinate with you on the disclosure timeline
- We request that you do not publicly disclose the vulnerability until we've addressed it
- Once fixed, we will:
  - Credit you in the security advisory (if desired)
  - Publish a security advisory on GitHub
  - Release a patch version

## Known Security Considerations

### API Key Management

**Current State**: 
- API keys are configured client-side via environment variables
- This is **NOT production-ready** for public deployments

**Recommendation for Production**:
- Implement a backend proxy server to handle Gemini API calls
- Store API keys server-side in secure environment variables
- Never expose API keys in client-side code or browser console
- Use API key rotation and rate limiting

**Example Backend Proxy**:
```typescript
// Server-side endpoint (Node.js/Express example)
app.post('/api/generate', authenticateUser, async (req, res) => {
  const { prompt, image } = req.body;
  
  // Validate input
  if (!prompt || prompt.length > 5000) {
    return res.status(400).json({ error: 'Invalid prompt' });
  }
  
  try {
    const result = await geminiService.generateArtifact(
      prompt,
      image,
      process.env.GEMINI_API_KEY // Server-side key
    );
    res.json(result);
  } catch (error) {
    console.error('Generation error:', error);
    res.status(500).json({ error: 'Generation failed' });
  }
});
```

### Content Security Policy (CSP)

**Recommendation**:
Implement CSP headers in production:

```html
<meta http-equiv="Content-Security-Policy" 
  content="
    default-src 'self';
    script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com;
    style-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com;
    img-src 'self' data: blob:;
    connect-src 'self' https://generativelanguage.googleapis.com;
    frame-src 'self' blob:;
  "
>
```

### Iframe Sandboxing

The application uses iframes for artifact preview. Current implementation includes:
- Content sanitization
- Isolated execution context
- `postMessage` communication

**Security Measures**:
- HTML content is sanitized before injection
- External scripts are not allowed in generated code
- Iframe has limited permissions via sandbox attributes

### Input Validation

**Current State**:
- Basic file type validation for uploads
- Size limits on file uploads

**Recommendations**:
- Implement server-side validation for all inputs
- Sanitize all user-generated content
- Validate file types and sizes on backend
- Implement rate limiting to prevent abuse

### XSS Prevention

**Measures in Place**:
- React's built-in XSS protection (JSX escaping)
- Content sanitization in iframe injection
- No `dangerouslySetInnerHTML` usage in main app

**Recommendations**:
- Regular security audits of generated HTML
- Content Security Policy headers
- Input sanitization for all user data

### Dependency Security

**Current Practice**:
- Dependencies are pinned in `package.json`
- Regular updates recommended

**Recommendations**:
- Enable Dependabot for automated security updates
- Run `npm audit` regularly
- Update dependencies monthly
- Review security advisories for critical dependencies

### LocalStorage Security

**Current Usage**:
- Artifacts stored in browser LocalStorage
- No sensitive data should be stored

**Security Notes**:
- LocalStorage is accessible via JavaScript (XSS risk)
- Data is not encrypted
- Shared across same-origin pages

**Recommendations**:
- Never store passwords or tokens in LocalStorage
- Consider IndexedDB for larger datasets
- Implement data encryption for sensitive artifacts

### API Rate Limiting

**Recommendation**:
Implement rate limiting to prevent:
- API quota exhaustion
- Denial of service attacks
- Cost overruns

**Example Implementation**:
```typescript
// Simple rate limiter (server-side)
const rateLimiter = new Map();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userRequests = rateLimiter.get(userId) || [];
  
  // Remove requests older than 1 hour
  const recentRequests = userRequests.filter(
    time => now - time < 3600000
  );
  
  if (recentRequests.length >= 100) {
    return false; // Rate limit exceeded
  }
  
  recentRequests.push(now);
  rateLimiter.set(userId, recentRequests);
  return true;
}
```

## Security Best Practices for Contributors

### Code Review Checklist

When reviewing code, check for:

- [ ] No hardcoded secrets or API keys
- [ ] Input validation for all user inputs
- [ ] Output encoding/escaping for dynamic content
- [ ] Proper error handling (no sensitive info in errors)
- [ ] Authentication/authorization where needed
- [ ] Secure communication (HTTPS only)
- [ ] No SQL/NoSQL injection vulnerabilities
- [ ] No command injection vulnerabilities
- [ ] No path traversal vulnerabilities
- [ ] Dependencies are up to date

### Secure Coding Guidelines

1. **Never commit secrets**:
   ```bash
   # ✅ Good - use environment variables
   const apiKey = process.env.API_KEY;
   
   # ❌ Bad - hardcoded secret
   const apiKey = "AIzaSyC...";
   ```

2. **Validate all inputs**:
   ```typescript
   // ✅ Good - validation
   if (!prompt || typeof prompt !== 'string' || prompt.length > 5000) {
     throw new Error('Invalid prompt');
   }
   
   // ❌ Bad - no validation
   await generateArtifact(prompt);
   ```

3. **Sanitize outputs**:
   ```typescript
   // ✅ Good - sanitization
   const sanitized = DOMPurify.sanitize(userHtml);
   
   // ❌ Bad - direct injection
   element.innerHTML = userHtml;
   ```

4. **Use secure dependencies**:
   ```bash
   # Check for vulnerabilities
   npm audit
   
   # Fix vulnerabilities
   npm audit fix
   ```

5. **Implement proper error handling**:
   ```typescript
   // ✅ Good - generic error message
   catch (error) {
     console.error('[Internal]', error); // Log details server-side
     throw new Error('Operation failed'); // Generic to user
   }
   
   // ❌ Bad - exposes internals
   catch (error) {
     throw error; // Exposes stack trace to user
   }
   ```

## Security Tools

### Recommended Tools

- **npm audit**: Check for known vulnerabilities
- **Dependabot**: Automated dependency updates
- **ESLint security plugin**: Static analysis
- **OWASP ZAP**: Web application security scanner
- **Snyk**: Continuous security monitoring

### Running Security Checks

```bash
# Check dependencies
npm audit

# Fix auto-fixable issues
npm audit fix

# Check for outdated packages
npm outdated

# Run TypeScript type checking
npx tsc --noEmit
```

## Contact

For security-related inquiries:
- **Email**: security@manifestation-lab.dev
- **GitHub**: [Security Advisories](https://github.com/Krosebrook/Bringittolife/security/advisories)

## Acknowledgments

We appreciate the security research community and thank all researchers who responsibly disclose vulnerabilities.

### Hall of Fame

Security researchers who have helped make Manifestation Lab more secure:

- (Your name could be here!)

---

**Note**: This security policy is subject to change. Please check back regularly for updates.

Last Updated: 2024-12-30
