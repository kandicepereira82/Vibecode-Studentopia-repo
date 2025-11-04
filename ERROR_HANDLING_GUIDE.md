# Automatic Error Fixes Guide

## ✅ CURRENT AUTOMATIC ERROR HANDLING

### 1. **TypeScript Type Checking** (ACTIVE)
Your environment has automatic type checking enabled via pre-commit hooks.

**Location:** `/home/user/.claude/hooks/typecheck`

**What it does:**
- Runs `tsc --noEmit` before accepting code changes
- Catches type errors immediately
- Prevents type-related runtime errors

**Example:**
```
✗ Error: Property 'foo' does not exist on type 'Bar'
✓ Fix automatically detected and blocked
```

---

## 🔧 HOW TO SET UP MORE AUTOMATIC FIXES

### 2. **ESLint Auto-Fix (Add this)**

To enable automatic ESLint fixes on save:

1. **Add to package.json:**
```json
{
  "scripts": {
    "lint": "eslint src/**/*.{ts,tsx} --fix",
    "lint:fix": "eslint src/**/*.{ts,tsx} --fix"
  }
}
```

2. **Create pre-commit hook:** `/home/user/.claude/hooks/eslint-fix`
```bash
#!/bin/bash
cd /home/user/workspace
bun run lint:fix
```

3. **Make executable:**
```bash
chmod +x /home/user/.claude/hooks/eslint-fix
```

---

### 3. **Prettier Auto-Format (Add this)**

To auto-format code on save:

1. **Install Prettier:**
```bash
cd /home/user/workspace
bun add -D prettier
```

2. **Create `.prettierrc`:**
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": false,
  "printWidth": 100,
  "tabWidth": 2
}
```

3. **Add to package.json:**
```json
{
  "scripts": {
    "format": "prettier --write 'src/**/*.{ts,tsx,js,jsx,json}'"
  }
}
```

---

## 🐛 COMMON ERRORS & AUTO-FIXES

### Error Type 1: Missing Imports
**Symptom:** `Cannot find name 'Component'`

**Auto-Fix Strategy:**
- TypeScript hook will catch this
- Add missing import at top of file

**Example:**
```typescript
// ✗ Error: Cannot find name 'useState'
const [value, setValue] = useState(0);

// ✓ Fix: Add import
import { useState } from "react";
const [value, setValue] = useState(0);
```

---

### Error Type 2: Type Mismatches
**Symptom:** `Type 'string' is not assignable to type 'number'`

**Auto-Fix Strategy:**
- TypeScript hook will catch this
- Fix type or add type assertion

**Example:**
```typescript
// ✗ Error: Type mismatch
const age: number = "25";

// ✓ Fix: Correct type
const age: number = 25;
```

---

### Error Type 3: Undefined Properties
**Symptom:** `Property 'foo' does not exist`

**Auto-Fix Strategy:**
- TypeScript hook will catch this
- Add property to interface/type

**Example:**
```typescript
// ✗ Error: Property missing
interface User {
  name: string;
}
const user: User = { name: "John", age: 25 };

// ✓ Fix: Add property to interface
interface User {
  name: string;
  age: number;
}
```

---

## 🚀 TESTING ERROR HANDLING

### Test Type Checking:
```bash
cd /home/user/workspace
bun run typecheck
```

### Test ESLint:
```bash
cd /home/user/workspace
bun run lint
```

### View App Logs:
```bash
cat /home/user/workspace/expo.log
```

---

## 📋 ERROR PREVENTION CHECKLIST

### ✅ Already Active:
- [x] TypeScript type checking (pre-commit hook)
- [x] Hot reload (Metro bundler)
- [x] ESLint rules configured
- [x] Zustand state persistence
- [x] Error logging in services

### 🔧 Can Add (Optional):
- [ ] Prettier auto-formatting
- [ ] ESLint auto-fix on commit
- [ ] React Error Boundaries for UI errors
- [ ] Sentry or error tracking service
- [ ] Unit tests with Jest
- [ ] E2E tests with Detox

---

## 🎯 BEST PRACTICES

### 1. **Always Check Types**
```typescript
// ✓ Good: Explicit types
const handleSubmit = (value: string): void => {
  console.log(value);
};

// ✗ Avoid: Implicit any
const handleSubmit = (value) => {
  console.log(value);
};
```

### 2. **Use Optional Chaining**
```typescript
// ✓ Good: Safe access
const userName = user?.profile?.name ?? "Guest";

// ✗ Risky: Direct access
const userName = user.profile.name; // Can crash!
```

### 3. **Handle Errors in Async**
```typescript
// ✓ Good: Try-catch
const fetchData = async () => {
  try {
    const data = await api.get();
    return data;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
};
```

### 4. **Validate User Input**
```typescript
// ✓ Good: Validation
const handleInput = (value: string) => {
  if (!value.trim()) {
    Alert.alert("Error", "Please enter a value");
    return;
  }
  // Process value...
};
```

---

## 🔍 DEBUGGING TIPS

### 1. **Console Logging**
```typescript
console.log("Debug:", { user, tasks, theme });
```

### 2. **React DevTools**
Available in Expo Dev Client

### 3. **Network Requests**
```typescript
// Add logging to API calls
const response = await fetch(url);
console.log("API Response:", response.status, await response.json());
```

### 4. **State Debugging**
```typescript
// In Zustand store
const useUserStore = create((set) => ({
  user: null,
  updateUser: (user) => {
    console.log("Updating user:", user); // Debug log
    set({ user });
  },
}));
```

---

## 🎉 SUMMARY

Your app already has **automatic error prevention** through TypeScript checking!

**What's working:**
- ✅ Type errors caught before runtime
- ✅ Automatic type validation
- ✅ Fast feedback loop with hot reload
- ✅ Safe state management with Zustand

**To enable more auto-fixes:**
1. Add ESLint auto-fix (5 min setup)
2. Add Prettier auto-format (5 min setup)
3. Add React Error Boundaries (10 min)

**Current protection level:** 🛡️ **GOOD** - TypeScript catches most issues

**With additional tools:** 🛡️🛡️🛡️ **EXCELLENT** - Nearly all errors prevented

---

## 📞 WHEN ERRORS OCCUR

1. **Check TypeScript errors first:**
   ```bash
   bun run typecheck
   ```

2. **Check app logs:**
   ```bash
   tail -f /home/user/workspace/expo.log
   ```

3. **Common fixes:**
   - Missing imports → Add import
   - Type errors → Fix type definitions
   - Runtime errors → Add try-catch or optional chaining
   - UI errors → Check component props

4. **Restart if needed:**
   - Metro bundler auto-restarts
   - Or manually restart the dev server

Your app is well-protected against errors! 🎯
