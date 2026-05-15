"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Loader2, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchComboboxProps<T> {
  placeholder?: string;
  onSearch: (query: string) => Promise<T[]>;
  getLabel: (item: T) => string;
  getValue: (item: T) => string;
  onChange: (value: string) => void;
  onSelectItem?: (item: T) => void;
  defaultLabel?: string;
  className?: string;
}

export function SearchCombobox<T>({
  placeholder = "Ketik untuk mencari...",
  onSearch,
  getLabel,
  getValue,
  onChange,
  onSelectItem,
  defaultLabel,
  className,
}: SearchComboboxProps<T>) {
  const [inputValue, setInputValue] = useState("");
  const [results, setResults] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const onSearchRef = useRef(onSearch);
  const defaultApplied = useRef(false);
  onSearchRef.current = onSearch;

  useEffect(() => {
    if (defaultLabel && !defaultApplied.current) {
      defaultApplied.current = true;
      setInputValue(defaultLabel);
      setIsSelected(true);
    }
  }, [defaultLabel]);

  useEffect(() => {
    if (isSelected) return;
    if (!inputValue.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await onSearchRef.current(inputValue);
        setResults(data);
        setOpen(true);
      } catch {
        setResults([]);
        setOpen(false);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [inputValue, isSelected]);

  useEffect(() => {
    function handleDown(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleDown);
    return () => document.removeEventListener("mousedown", handleDown);
  }, []);

  function select(item: T) {
    setIsSelected(true);
    setInputValue(getLabel(item));
    setOpen(false);
    onChange(getValue(item));
    onSelectItem?.(item);
  }

  function clear() {
    setIsSelected(false);
    setInputValue("");
    setResults([]);
    setOpen(false);
    onChange("");
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (isSelected) {
      setIsSelected(false);
      onChange("");
    }
    setInputValue(e.target.value);
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ams-black/30 pointer-events-none" />
        <input
          type="text"
          value={inputValue}
          onChange={handleChange}
          onFocus={() => {
            if (!isSelected && results.length > 0) setOpen(true);
          }}
          placeholder={placeholder}
          className="flex h-9 w-full rounded-md border border-ams-black/10 bg-white px-3 py-1 pl-9 pr-8 text-sm shadow-xs transition-colors placeholder:text-ams-black/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ams-red/30 focus-visible:border-ams-red/50"
        />
        {loading ? (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ams-red animate-spin" />
        ) : inputValue ? (
          <button
            type="button"
            onClick={clear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ams-black/30 hover:text-ams-black/60"
          >
            <X className="w-4 h-4" />
          </button>
        ) : null}
      </div>

      {open && !isSelected && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-ams-black/10 rounded-xl shadow-lg overflow-hidden max-h-56 overflow-y-auto">
          {results.length > 0 ? (
            results.map((item) => (
              <button
                key={getValue(item)}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => select(item)}
                className="w-full text-left px-4 py-2.5 text-sm text-ams-black hover:bg-ams-red/5 transition-colors border-b border-ams-black/5 last:border-0"
              >
                {getLabel(item)}
              </button>
            ))
          ) : (
            <div className="px-4 py-3 text-sm text-ams-black/40 text-center">
              Tidak ditemukan
            </div>
          )}
        </div>
      )}
    </div>
  );
}
