/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState, useEffect, useCallback } from 'react';
import { Creation } from '../types';

const STORAGE_KEY = 'gemini_app_history';
const MAX_HISTORY_ITEMS = 15; // Keeping it tight to avoid quota issues with large base64 strings

export const useHistory = () => {
  const [history, setHistory] = useState<Creation[]>([]);

  useEffect(() => {
    const initHistory = async () => {
      const saved = localStorage.getItem(STORAGE_KEY);
      let loadedHistory: Creation[] = [];

      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          loadedHistory = parsed.map((item: any) => ({
              ...item,
              timestamp: new Date(item.timestamp)
          }));
        } catch (e) {
          console.error("Archive corruption detected:", e);
          localStorage.removeItem(STORAGE_KEY);
        }
      }

      if (loadedHistory.length > 0) {
        setHistory(loadedHistory);
      } else {
        // Fetch seed examples if empty
        try {
           const exampleUrls = [
               'https://storage.googleapis.com/sideprojects-asronline/bringanythingtolife/vibecode-blog.json',
               'https://storage.googleapis.com/sideprojects-asronline/bringanythingtolife/cassette.json',
               'https://storage.googleapis.com/sideprojects-asronline/bringanythingtolife/chess.json'
           ];

           const examples = await Promise.all(exampleUrls.map(async (url) => {
               try {
                 const res = await fetch(url);
                 if (!res.ok) return null;
                 const data = await res.json();
                 return {
                     ...data,
                     timestamp: new Date(data.timestamp || Date.now()),
                     id: data.id || crypto.randomUUID()
                 };
               } catch { return null; }
           }));
           
           const validExamples = examples.filter((e): e is Creation => e !== null);
           if (validExamples.length > 0) setHistory(validExamples);
        } catch (e) {
            console.error("Example sync failed:", e);
        }
      }
    };

    initHistory();
  }, []);

  // Persistence with LRU eviction strategy
  useEffect(() => {
    if (history.length === 0) return;

    const persistHistory = (items: Creation[]) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      } catch (e) {
        if (e instanceof DOMException && e.name === 'QuotaExceededError') {
          // Evict oldest item and retry recursively
          if (items.length > 1) {
            console.warn("Storage quota reached. Pruning oldest artifact.");
            persistHistory(items.slice(0, -1));
          } else {
            localStorage.removeItem(STORAGE_KEY);
          }
        }
      }
    };

    persistHistory(history.slice(0, MAX_HISTORY_ITEMS));
  }, [history]);

  const addCreation = useCallback((creation: Creation) => {
    setHistory(prev => {
        const filtered = prev.filter(c => c.id !== creation.id);
        return [creation, ...filtered].slice(0, MAX_HISTORY_ITEMS);
    });
  }, []);

  return { history, setHistory, addCreation };
};
