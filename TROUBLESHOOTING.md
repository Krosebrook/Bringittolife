# Troubleshooting Guide

Common issues and solutions for Manifestation Lab development and usage.

---

## Table of Contents

1. [Setup Issues](#setup-issues)
2. [Build Errors](#build-errors)
3. [Runtime Errors](#runtime-errors)
4. [API/Generation Issues](#apigeneration-issues)
5. [Performance Problems](#performance-problems)
6. [Browser Compatibility](#browser-compatibility)
7. [Development Tools](#development-tools)

---

## Setup Issues

### Node.js Version Mismatch

**Symptoms:**
```
Error: The engine "node" is incompatible with this module
```

**Solution:**
```bash
# Check your Node.js version
node -v

# Should be 18.0.0 or higher
# Download from: https://nodejs.org/

# Or use nvm to switch versions
nvm install 18
nvm use 18
```

### npm Install Fails

**Symptoms:**
```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install

# If still failing, try legacy peer deps
npm install --legacy-peer-deps
```

### Permission Errors

**Symptoms:**
```
EACCES: permission denied
```

**Solution:**
```bash
# On macOS/Linux, don't use sudo with npm
# Fix npm permissions instead:
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# On Windows, run terminal as Administrator
```

### Missing Environment Variables

**Symptoms:**
```
Error: API_KEY execution context missing
```

**Solution:**
```bash
# Copy example environment file
cp .env.example .env

# Edit .env and add your API key
# GEMINI_API_KEY=your_key_here

# Restart dev server
npm run dev
```

---

## Build Errors

### TypeScript Errors

**Symptoms:**
```
TS2322: Type 'X' is not assignable to type 'Y'
```

**Solution:**
```bash
# Check TypeScript version
npx tsc --version

# Run type check to see all errors
npm run type-check

# Common fixes:
# 1. Add proper type annotations
# 2. Use type guards
# 3. Fix incorrect types in types.ts
```

### Vite Build Fails

**Symptoms:**
```
Error: Build failed with X errors
```

**Solution:**
```bash
# Clear Vite cache
rm -rf node_modules/.vite

# Clear dist directory
rm -rf dist

# Rebuild
npm run build

# Check for syntax errors in code
npm run lint
```

### Out of Memory

**Symptoms:**
```
FATAL ERROR: Reached heap limit Allocation failed
```

**Solution:**
```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"

# Or add to package.json:
"build": "NODE_OPTIONS='--max-old-space-size=4096' vite build"

# Then rebuild
npm run build
```

### ESLint Errors Block Build

**Symptoms:**
```
Failed to compile due to eslint errors
```

**Solution:**
```bash
# Auto-fix issues
npm run lint:fix

# If that doesn't work, review errors manually
npm run lint

# Disable specific rules temporarily (not recommended)
# Add to .eslintrc.json rules:
"@typescript-eslint/no-explicit-any": "off"
```

---

## Runtime Errors

### White Screen / App Won't Load

**Symptoms:**
- Blank white page
- Console shows errors

**Solution:**
```bash
# Check browser console (F12)
# Common causes:

# 1. Missing API key
# Check .env file exists and has GEMINI_API_KEY

# 2. JavaScript errors
# Look for red errors in console
# Check if all imports are correct

# 3. Build issue
# Rebuild the app:
npm run build
npm run preview

# 4. Cache issue
# Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
# Or clear browser cache
```

### LocalStorage Quota Exceeded

**Symptoms:**
```
QuotaExceededError: Failed to execute 'setItem' on 'Storage'
```

**Solution:**
```javascript
// The app handles this automatically by pruning old data
// If issues persist, manually clear:

// Open browser console (F12)
localStorage.clear();

// Or clear specific key:
localStorage.removeItem('gemini_app_history');

// Then refresh page
```

### Service Worker Issues

**Symptoms:**
- Stale content after updates
- Offline mode not working

**Solution:**
```bash
# 1. Unregister service worker
# Open DevTools > Application > Service Workers
# Click "Unregister"

# 2. Clear site data
# Application > Storage > Clear site data

# 3. Hard refresh
# Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

# 4. Rebuild if developing
npm run build
```

### Component Not Updating

**Symptoms:**
- Changes don't reflect in UI
- Stale state

**Solution:**
```typescript
// Check React dependencies in useEffect/useMemo/useCallback
useEffect(() => {
  // Make sure all used variables are in dependency array
}, [dep1, dep2]); // ← Add missing dependencies

// Check if state update is correct
// BAD: Direct mutation
state.items.push(newItem);

// GOOD: Immutable update
setState(prev => ({
  ...prev,
  items: [...prev.items, newItem]
}));
```

---

## API/Generation Issues

### API Key Invalid

**Symptoms:**
```
Error: Invalid API key
401 Unauthorized
```

**Solution:**
```bash
# 1. Verify API key is correct
# Check .env file: GEMINI_API_KEY=...

# 2. Get new key from:
# https://makersuite.google.com/app/apikey

# 3. Restart dev server after changing .env
npm run dev

# 4. Check key has no extra spaces/newlines
# Should be: GEMINI_API_KEY=actual_key_here
# Not: GEMINI_API_KEY = " actual_key_here "
```

### Quota Exceeded

**Symptoms:**
```
Error: Quota exceeded for quota metric 'Generate Content API requests'
429 Too Many Requests
```

**Solution:**
```bash
# Free tier limits:
# - 15 requests per minute
# - 1,500 requests per day

# Solutions:
# 1. Wait a few minutes before retrying
# 2. Upgrade to paid tier
# 3. Implement rate limiting in your code

# Check quota usage:
# Visit https://console.cloud.google.com/apis/dashboard
```

### Generation Fails

**Symptoms:**
- Generation never completes
- Error message appears

**Solution:**
```bash
# Check browser console for errors
# Common causes:

# 1. Network issues
# Check internet connection
# Try again after a moment

# 2. Prompt too long
# Reduce prompt length (<10,000 chars)

# 3. Image too large
# Resize image to <4MB
# Use PNG or JPEG format

# 4. Content filtered
# Prompt may violate content policies
# Rephrase more neutrally
```

### Generated Code Not Working

**Symptoms:**
- Code generates but doesn't function
- JavaScript errors in preview

**Solution:**
```javascript
// Check the preview iframe console:
// 1. Right-click iframe
// 2. Select "Inspect"
// 3. Check console tab for errors

// Common issues:
// - Missing Tailwind classes
// - JavaScript syntax errors
// - Event handlers not attached

// Fix via refinement:
"Fix the JavaScript error: [error message]"
"Add proper event handlers to the button"
```

### Voice Input Not Working

**Symptoms:**
- Microphone icon does nothing
- Permission denied error

**Solution:**
```bash
# 1. Check browser permissions
# Chrome: Settings > Privacy > Site Settings > Microphone
# Allow access for localhost

# 2. Check if HTTPS (required for production)
# Microphone only works on HTTPS or localhost

# 3. Check browser compatibility
# Chrome, Edge, Safari supported
# Firefox may have issues

# 4. Check if microphone is working
# Try in other apps first

# 5. Look for console errors
# Open DevTools > Console
```

---

## Performance Problems

### Slow Generation

**Symptoms:**
- Generation takes 30+ seconds
- App seems frozen

**Solution:**
```typescript
// This is normal for complex prompts
// Gemini thinking budget is 4000 (high quality)

// To speed up:
// 1. Reduce thinking budget in gemini.ts:
thinkingBudget: 2000  // Instead of 4000

// 2. Use simpler prompts
"Create a button" instead of "Create a complex dashboard..."

// 3. Use Gemini Flash for simple tasks
model: 'gemini-3-flash-preview'

// 4. Be patient - complex generations take time
```

### Slow Page Load

**Symptoms:**
- App takes long to load
- Large bundle size

**Solution:**
```bash
# Check bundle size
npm run build
# Look at dist/ folder size

# Solutions:
# 1. Enable code splitting (future)
# 2. Lazy load components
# 3. Optimize images
# 4. Use CDN for Tailwind (already done)

# Analyze bundle
npm install -g vite-plugin-analyze
# Add to vite.config.ts and rebuild
```

### Memory Leaks

**Symptoms:**
- Browser slows down over time
- High memory usage in Task Manager

**Solution:**
```typescript
// Check for missing cleanup in useEffect
useEffect(() => {
  const listener = () => { /* ... */ };
  window.addEventListener('event', listener);
  
  // Must return cleanup function
  return () => {
    window.removeEventListener('event', listener);
  };
}, []);

// Check for unclosed connections
// In services/live.ts, ensure close() is called

// Force garbage collection (dev only)
// Chrome DevTools > Memory > Collect garbage
```

### Laggy UI

**Symptoms:**
- Animations stutter
- Input feels slow

**Solution:**
```typescript
// 1. Use React.memo for expensive components
export const ExpensiveComponent = React.memo(({ data }) => {
  // Component code
});

// 2. Debounce frequent updates
const debouncedUpdate = useMemo(
  () => debounce(updateFunction, 300),
  []
);

// 3. Use CSS transforms instead of position
// BAD: style={{ left: x, top: y }}
// GOOD: style={{ transform: `translate(${x}px, ${y}px)` }}

// 4. Reduce re-renders
// Check React DevTools Profiler
```

---

## Browser Compatibility

### Not Working in Firefox

**Symptoms:**
- Features missing
- Console errors

**Solution:**
```bash
# Known issues:
# 1. Voice input less stable
# 2. Some CSS features limited

# Recommended: Use Chrome/Edge for development

# To support Firefox:
# 1. Add polyfills if needed
# 2. Test all features
# 3. Report specific issues on GitHub
```

### Not Working in Safari

**Symptoms:**
- Layout issues
- JavaScript errors

**Solution:**
```bash
# Safari has some limitations:
# 1. Older versions don't support all modern features
# 2. Webkit rendering differences

# Solutions:
# 1. Update to latest Safari
# 2. Test on Safari regularly
# 3. Add webkit prefixes if needed:
-webkit-backdrop-filter: blur(10px);
backdrop-filter: blur(10px);
```

### Mobile Issues

**Symptoms:**
- Doesn't work on mobile
- Layout broken

**Solution:**
```bash
# Mobile support is limited in v3.0

# Known issues:
# 1. File upload may not work
# 2. Voice input unavailable
# 3. Performance limited

# Workarounds:
# 1. Use desktop for now
# 2. Mobile apps planned for v4.0 (see ROADMAP.md)
```

---

## Development Tools

### VS Code IntelliSense Not Working

**Symptoms:**
- No autocomplete
- Type errors not showing

**Solution:**
```bash
# 1. Restart TypeScript server
# Cmd+Shift+P > "TypeScript: Restart TS Server"

# 2. Check tsconfig.json is valid
npm run type-check

# 3. Reload VS Code window
# Cmd+Shift+P > "Reload Window"

# 4. Check workspace trust
# Ensure folder is trusted
```

### Git Issues

**Symptoms:**
- Can't commit
- Merge conflicts

**Solution:**
```bash
# Can't commit - pre-commit hook failing
# Fix linting issues first:
npm run lint:fix

# Merge conflicts
git status  # See conflicted files
# Manually resolve conflicts
git add .
git commit

# Accidentally committed node_modules
echo "node_modules/" >> .gitignore
git rm -r --cached node_modules
git commit -m "Remove node_modules from git"
```

### Hot Reload Not Working

**Symptoms:**
- Changes don't reflect
- Need to manually refresh

**Solution:**
```bash
# 1. Check file is saved
# 2. Check Vite dev server is running
# 3. Check no syntax errors in file
npm run lint

# 4. Restart dev server
# Ctrl+C to stop
npm run dev

# 5. Check Vite config
# Ensure vite.config.ts is correct
```

---

## Still Stuck?

If you can't resolve your issue:

1. **Check existing issues**: [GitHub Issues](https://github.com/Krosebrook/Bringittolife/issues)
2. **Search discussions**: [GitHub Discussions](https://github.com/Krosebrook/Bringittolife/discussions)
3. **Create new issue**: Include:
   - Clear description of problem
   - Steps to reproduce
   - Error messages (full text)
   - Environment (OS, Node version, browser)
   - Screenshots if applicable

### Useful Debug Information

When reporting issues, include:

```bash
# System info
node -v
npm -v
npx -v

# OS
# macOS: sw_vers
# Linux: lsb_release -a
# Windows: systeminfo

# Browser version
# Chrome: chrome://version
# Firefox: about:support

# Package versions
npm list --depth=0

# Console errors
# Copy from browser DevTools
```

---

**Last Updated:** December 29, 2024  
**Maintained by:** Project Maintainers  
**Contributing:** Found a solution not listed here? Submit a PR!
