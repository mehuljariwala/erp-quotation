import { useState, useMemo, useCallback, useRef, useEffect } from 'react';

export const useSearchFilter = (items, searchFields, options = {}) => {
  const {
    debounceMs = 100,
    fuzzy = false,
    maxResults = 50
  } = options;

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const debounceTimer = useRef(null);

  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query, debounceMs]);

  const filteredItems = useMemo(() => {
    if (!debouncedQuery.trim()) {
      return items.slice(0, maxResults);
    }

    const lowerQuery = debouncedQuery.toLowerCase().trim();
    const queryParts = lowerQuery.split(/\s+/);

    const scored = items.map(item => {
      let score = 0;
      let matched = false;

      for (const field of searchFields) {
        const value = getNestedValue(item, field);
        if (!value) continue;

        const lowerValue = String(value).toLowerCase();

        if (lowerValue === lowerQuery) {
          score += 100;
          matched = true;
        }
        else if (lowerValue.startsWith(lowerQuery)) {
          score += 75;
          matched = true;
        }
        else if (lowerValue.includes(lowerQuery)) {
          score += 50;
          matched = true;
        }
        else if (queryParts.every(part => lowerValue.includes(part))) {
          score += 25;
          matched = true;
        }
        else if (fuzzy && fuzzyMatch(lowerQuery, lowerValue)) {
          score += 10;
          matched = true;
        }
      }

      return { item, score, matched };
    });

    return scored
      .filter(s => s.matched)
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults)
      .map(s => s.item);
  }, [items, debouncedQuery, searchFields, fuzzy, maxResults]);

  const clearQuery = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
  }, []);

  return {
    query,
    setQuery,
    filteredItems,
    clearQuery,
    isFiltering: debouncedQuery.length > 0
  };
};

const getNestedValue = (obj, path) => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

const fuzzyMatch = (query, text) => {
  let queryIndex = 0;
  for (let i = 0; i < text.length && queryIndex < query.length; i++) {
    if (text[i] === query[queryIndex]) {
      queryIndex++;
    }
  }
  return queryIndex === query.length;
};

export const useHighlightMatch = (text, query) => {
  if (!query || !text) return text;

  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const index = lowerText.indexOf(lowerQuery);

  if (index === -1) return text;

  return {
    before: text.slice(0, index),
    match: text.slice(index, index + query.length),
    after: text.slice(index + query.length)
  };
};

export default useSearchFilter;
