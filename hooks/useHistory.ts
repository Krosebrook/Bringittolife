
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState, useEffect, useCallback } from 'react';
import { Creation } from '../types';

const STORAGE_KEY = 'gemini_app_history';
const MAX_HISTORY_ITEMS = 15;

export const useHistory = () => {
  const [history, setHistory] = useState<Creation[]>([]);

  // Proactive storage health check
  const isStorageAvailable = () => {
    try {
      const x = '__storage_test__';
      localStorage.setItem(x, x);
      localStorage.removeItem(x);
      return true;
    } catch (e) {
      return false;
    }
  };

  useEffect(() => {
    const initHistory = async () => {
      if (!isStorageAvailable()) return;
      
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
          console.error("Archive corruption detected. Purging storage.", e);
          localStorage.removeItem(STORAGE_KEY);
        }
      }

      if (loadedHistory.length > 0) {
        setHistory(loadedHistory);
      } else {
        await fetchSeedExamples();
      }
    };

    const fetchSeedExamples = async () => {
        try {
           const exampleUrls = [
               'https://storage.googleapis.com/sideprojects-asronline/bringanythingtolife/vibecode-blog.json',
               'https://storage.googleapis.com/sideprojects-asronline/bringanythingtolife/cassette.json',
               'https://storage.googleapis.com/sideprojects-asronline/bringanythingtolife/chess.json'
           ];

           const results = await Promise.allSettled(exampleUrls.map(url => fetch(url).then(res => res.json())));
           const valid = results
             .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
             .map(r => ({
                 ...r.value,
                 timestamp: new Date(r.value.timestamp || Date.now()),
                 id: r.value.id || crypto.randomUUID()
             }));
           
           if (valid.length > 0) setHistory(valid);
        } catch (e) {
            console.warn("Could not sync remote seed examples:", e);
        }
    };

    initHistory();
  }, []);

  // Proactive Storage Management (Edge Case: Large Artifacts)
  useEffect(() => {
    if (history.length === 0 || !isStorageAvailable()) return;

    const tryPersist = (data: Creation[]): boolean => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        return true;
      } catch (e) {
        return false;
      }
    };

    // Attempt to save. If fails, prune oldest images first, then oldest items.
    let currentHistory = [...history].slice(0, MAX_HISTORY_ITEMS);
    let success = tryPersist(currentHistory);

    if (!success) {
      console.warn("Storage quota approaching. Stripping large binary assets from old history.");
      // Edge Case: Keep metadata but remove Base64 strings from items 5+
      currentHistory = currentHistory.map((item, idx) => (idx > 4 ? { ...item, originalImage: undefined } : item));
      success = tryPersist(currentHistory);
    }

    if (!success) {
      console.error("Storage critical failure. Reducing history to 3 items.");
      tryPersist(currentHistory.slice(0, 3));
    }
  }, [history]);

  const addCreation = useCallback((creation: Creation) => {
    setHistory(prev => {
        const filtered = prev.filter(c => c.id !== creation.id);
        return [creation, ...filtered].slice(0, MAX_HISTORY_ITEMS);
    });
  }, []);

  const clearHistory = useCallback(() => {
      setHistory([]);
      localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { history, setHistory, addCreation, clearHistory };
};
