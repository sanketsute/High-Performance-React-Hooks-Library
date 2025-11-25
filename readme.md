# ⚡ High-Performance React Hooks Library

A collection of production-ready, type-safe React Hooks designed for enterprise applications. This library focuses on solving common frontend engineering problems: **API Race Conditions**, **Transactional Integrity (Idempotency)**, and **UI Performance bottlenecks**.

## 🚀 Features

- **🛡️ Race-Condition Proof Fetching:** Automatically cancels stale requests using `AbortController` when components unmount or dependencies change.
- **💳 Idempotency Support:** Automatically generates and attaches `Idempotency-Key` UUIDs to safe-guard POST requests against duplicate processing.
- **⚡ Performance Optimized:** Includes `useDebounce` and `useThrottle` to prevent render-thrashing on high-frequency events (Search, Resize, Scroll).
- **TypeScript First:** Built with strict typing for maximum developer experience.

---

## 📦 Hooks Documentation

### 1. `useFetch` - The Enterprise Data Fetcher

Unlike standard fetch hooks, this implementation handles **stale-while-revalidate** logic and cleaning up pending requests to prevent memory leaks.

**Key Engineering Decisions:**
- **AbortController:** Used to cancel the browser network request if the user navigates away or if a new request overwrites the old one (preventing "Stale UI" bugs).
- **Idempotency:** For `POST` requests, it automatically injects a UUID into the headers. This ensures that network retries don't result in double-charges or duplicate records on the backend.

```tsx
import { useFetch } from './hooks/useFetch';

const TransactionList = () => {
  // 1. Auto-fetch on mount (Race-condition safe)
  const { data, loading, error } = useFetch('/api/transactions', { page: 1 });

  // 2. Manual Trigger (for submitting forms)
  const { refetch: submitPayment, loading: paying } = useFetch('/api/pay', null, {
    method: 'POST',
    immediate: false, // Wait for manual trigger
  });

  return (
    <div>
      {loading ? <Spinner /> : <DataGrid data={data} />}
      
      <button 
        onClick={() => submitPayment()} 
        disabled={paying}
      >
        {paying ? 'Processing...' : 'Pay Now'}
      </button>
    </div>
  );
};
```

2. useDebounce - Search Optimization
Prevents API flooding by delaying the value update until the user stops typing. Essential for "Typeahead" or "Autocomplete" features.


```tsx
import { useState, useEffect } from 'react';
import { useDebounce } from './hooks/useDebounce';

const SearchBar = () => {
  const [text, setText] = useState('');
  // Only updates 500ms after the user STOPS typing
  const debouncedText = useDebounce(text, 500);

  useEffect(() => {
    if (debouncedText) {
      // API call happens once, not on every keystroke
      console.log('Searching for:', debouncedText);
    }
  }, [debouncedText]);

  return <input onChange={(e) => setText(e.target.value)} />;
};
```
3. useThrottle - Event Optimization
Limits the execution rate of a function. Critical for heavy events like window.resize or scroll listeners to maintain 60FPS.

```tsx
import { useThrottle } from './hooks/useThrottle';

const ResizeHandler = () => {
  const [width, setWidth] = useState(window.innerWidth);
  const throttledWidth = useThrottle(width, 1000); // Update max once per second

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return <div>Window width (Throttled): {throttledWidth}</div>;
};
```
