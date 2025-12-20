
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState, useEffect, useCallback } from 'react';
import { Creation } from '../types';

const STORAGE_KEY = 'gemini_app_history';
const MAX_HISTORY_ITEMS = 12;

export const useHistory = () => {
  const [history, setHistory] = useState<Creation[]>([]);

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
          console.error("Archive sync fault. Purging history.", e);
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
                 id: r.value.id || (typeof crypto?.randomUUID === 'function' ? crypto.randomUUID() : Math.random().toString(36).substring(2))
             }));
           
           if (valid.length > 0) setHistory(valid);
        } catch (e) {
            console.warn("Seed data unreachable:", e);
        }
    };

    initHistory();
  }, []);

  /**
   * PROACTIVE PERSISTENCE ENGINE
   * Handles QuotaExceededError by pruning binary assets from older items.
   */
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

    let currentHistory = [...history].slice(0, MAX_HISTORY_ITEMS);
    let success = tryPersist(currentHistory);

    if (!success) {
      // Step 1: Prune images from all but the last 3 items
      currentHistory = currentHistory.map((item, idx) => 
        idx > 2 ? { ...item, originalImage: undefined } : item
      );
      success = tryPersist(currentHistory);
    }

    if (!success) {
      // Step 2: Critical Pruning - save metadata only
      currentHistory = currentHistory.map(item => ({ ...item, html: "<!-- Pruned due to storage limits -->", originalImage: undefined }));
      tryPersist(currentHistory.slice(0, 5));
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
