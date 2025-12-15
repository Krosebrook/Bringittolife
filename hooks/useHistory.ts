/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState, useEffect } from 'react';
import { Creation } from '../types';

const STORAGE_KEY = 'gemini_app_history';

export const useHistory = () => {
  const [history, setHistory] = useState<Creation[]>([]);

  // Load history from local storage or fetch examples on mount
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
          console.error("Failed to load history", e);
        }
      }

      if (loadedHistory.length > 0) {
        setHistory(loadedHistory);
      } else {
        // If no history (new user or cleared), load examples
        try {
           const exampleUrls = [
               'https://storage.googleapis.com/sideprojects-asronline/bringanythingtolife/vibecode-blog.json',
               'https://storage.googleapis.com/sideprojects-asronline/bringanythingtolife/cassette.json',
               'https://storage.googleapis.com/sideprojects-asronline/bringanythingtolife/chess.json'
           ];

           const examples = await Promise.all(exampleUrls.map(async (url) => {
               const res = await fetch(url);
               if (!res.ok) return null;
               const data = await res.json();
               return {
                   ...data,
                   timestamp: new Date(data.timestamp || Date.now()),
                   id: data.id || crypto.randomUUID()
               };
           }));
           
           const validExamples = examples.filter((e): e is Creation => e !== null);
           setHistory(validExamples);
        } catch (e) {
            console.error("Failed to load examples", e);
        }
      }
    };

    initHistory();
  }, []);

  // Save history when it changes
  useEffect(() => {
    if (history.length > 0) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
        } catch (e) {
            console.warn("Local storage full or error saving history", e);
        }
    }
  }, [history]);

  const addCreation = (creation: Creation) => {
    setHistory(prev => {
        // Avoid duplicates if manually adding an existing ID
        if (prev.some(c => c.id === creation.id)) return prev;
        return [creation, ...prev];
    });
  };

  return { history, setHistory, addCreation };
};
