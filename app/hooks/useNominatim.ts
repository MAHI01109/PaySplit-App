import { useState, useEffect, useRef, useCallback } from "react";

export interface LocationResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
}

export function useNominatim() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<LocationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Cache for the last 5 successful searches
  const [recentSearches, setRecentSearches] = useState<LocationResult[]>([]);
  
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load cache from localStorage
  useEffect(() => {
    const cached = localStorage.getItem("nominatim_cache");
    if (cached) {
      try {
        setRecentSearches(JSON.parse(cached));
      } catch (e) {
        console.error("Failed to parse nominatim cache", e);
      }
    }
  }, []);

  const search = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setIsLoading(true);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`,
        { signal: abortControllerRef.current.signal }
      );
      const data = await response.json();
      setResults(data || []);
    } catch (error: any) {
      if (error.name === "AbortError") {
        console.log("Request cancelled");
      } else {
        console.error("Nominatim search error:", error);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounce the search by 400ms
  useEffect(() => {
    const timerId = setTimeout(() => {
      search(query);
    }, 400);

    return () => clearTimeout(timerId);
  }, [query, search]);

  const addRecentSearch = (location: LocationResult) => {
    setRecentSearches((prev) => {
      // Remove if it already exists
      const filtered = prev.filter((p) => p.place_id !== location.place_id);
      // Add to front
      const updated = [location, ...filtered].slice(0, 5); // Keep last 5
      localStorage.setItem("nominatim_cache", JSON.stringify(updated));
      return updated;
    });
  };

  return {
    query,
    setQuery,
    results,
    isLoading,
    recentSearches,
    addRecentSearch,
  };
}
