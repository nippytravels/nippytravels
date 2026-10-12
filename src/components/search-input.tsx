"use client";

import { Autocomplete } from "@base-ui/react/autocomplete";
import * as React from "react";

export type SearchPage = {
  limit: number;
  offset: number;
  signal: AbortSignal;
};

export type SearchInputProps<T> = {
  /** Fetch one page. `signal` is aborted when a newer search supersedes this one. */
  search: (query: string, page: SearchPage) => Promise<ReadonlyArray<T>>;
  getKey: (item: T) => string | number;
  getLabel: (item: T) => string;
  renderItem?: (item: T) => React.ReactNode;
  onSelect?: (item: T) => void;
  label?: string;
  placeholder?: string;
  pageSize?: number;
  debounceMs?: number;
  minLength?: number;
  className?: string;
};

type Status = "idle" | "loading" | "loadingMore" | "error";

type PaginatedSearchOptions<T> = {
  search: SearchInputProps<T>["search"];
  getKey: SearchInputProps<T>["getKey"];
  pageSize: number;
  debounceMs: number;
  minLength: number;
};

function usePaginatedSearch<T>(
  term: string,
  { search, getKey, pageSize, debounceMs, minLength }: PaginatedSearchOptions<T>,
) {
  const [items, setItems] = React.useState<Array<T>>([]);
  const [status, setStatus] = React.useState<Status>("idle");
  const [hasMore, setHasMore] = React.useState(false);

  const controllerRef = React.useRef<AbortController | null>(null);
  // Raw rows consumed so far. Tracked separately from items.length because we dedupe.
  const offsetRef = React.useRef(0);

  // Keep the latest callbacks without re-triggering the search effect on every render.
  const searchRef = React.useRef(search);
  const getKeyRef = React.useRef(getKey);
  React.useLayoutEffect(() => {
    searchRef.current = search;
    getKeyRef.current = getKey;
  });

  const run = React.useCallback(
    async (query: string, offset: number) => {
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;

      setStatus(offset === 0 ? "loading" : "loadingMore");

      try {
        const rows = await searchRef.current(query, {
          limit: pageSize,
          offset,
          signal: controller.signal,
        });
        if (controller.signal.aborted) return;

        offsetRef.current = offset + rows.length;
        setHasMore(rows.length === pageSize);
        setItems((prev) => {
          if (offset === 0) return [...rows];
          const seen = new Set(prev.map((i) => getKeyRef.current(i)));
          return [...prev, ...rows.filter((r) => !seen.has(getKeyRef.current(r)))];
        });
        setStatus("idle");
      } catch {
        if (controller.signal.aborted) return;
        setStatus("error");
      }
    },
    [pageSize],
  );

  React.useEffect(() => {
    const query = term.trim();

    if (query.length < minLength) {
      controllerRef.current?.abort();
      offsetRef.current = 0;
      setItems([]);
      setHasMore(false);
      setStatus("idle");
      return;
    }

    const timeout = setTimeout(() => {
      offsetRef.current = 0;
      void run(query, 0);
    }, debounceMs);

    return () => clearTimeout(timeout);
  }, [term, minLength, debounceMs, run]);

  React.useEffect(() => () => controllerRef.current?.abort(), []);

  const loadMore = React.useCallback(() => {
    if (status !== "idle" || !hasMore) return;
    void run(term.trim(), offsetRef.current);
  }, [status, hasMore, term, run]);

  return { items, status, hasMore, loadMore };
}

function LoadMoreSentinel({
  onVisible,
  disabled,
}: {
  onVisible: () => void;
  disabled: boolean;
}) {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el || disabled) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) onVisible();
      },
      { rootMargin: "80px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [onVisible, disabled]);

  return <div ref={ref} aria-hidden className="h-px" />;
}

export function SearchInput<T>({
  search,
  getKey,
  getLabel,
  renderItem,
  onSelect,
  label = "Search",
  placeholder = "Search…",
  pageSize = 20,
  debounceMs = 200,
  minLength = 1,
  className,
}: SearchInputProps<T>) {
  // `inputValue` mirrors the field; `term` only changes on typing, so picking
  // a result (which rewrites the field to its label) doesn't trigger a new search.
  const [inputValue, setInputValue] = React.useState("");
  const [term, setTerm] = React.useState("");
  const [open, setOpen] = React.useState(false);

  const { items, status, hasMore, loadMore } = usePaginatedSearch<T>(term, {
    search,
    getKey,
    pageSize,
    debounceMs,
    minLength,
  });

  const canShow = term.trim().length >= minLength;

  const message =
    status === "error"
      ? "Search failed. Keep typing to try again."
      : status === "loading"
        ? "Searching…"
        : status === "loadingMore"
          ? "Loading more…"
          : items.length === 0 && canShow
            ? "No results"
            : null;

  return (
    <Autocomplete.Root
      items={items}
      filter={null}
      value={inputValue}
      onValueChange={(value, details) => {
        setInputValue(value);
        if (details.reason !== "item-press") setTerm(value);
      }}
      itemToStringValue={getLabel}
      open={open && canShow}
      onOpenChange={setOpen}
    >
      <Autocomplete.Input
        aria-label={label}
        placeholder={placeholder}
        className={
          className ??
          "h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-900 outline-none placeholder:text-neutral-500 focus-visible:ring-2 focus-visible:ring-neutral-900"
        }
      />

      <Autocomplete.Portal>
        <Autocomplete.Positioner sideOffset={6} className="z-50 outline-none">
          <Autocomplete.Popup className="max-h-[min(22rem,var(--available-height))] w-(--anchor-width) overflow-y-auto overscroll-contain rounded-md border border-neutral-200 bg-white py-1 text-sm shadow-lg">
            <Autocomplete.List>
              {(item: T) => (
                <Autocomplete.Item
                  key={getKey(item)}
                  value={item}
                  onClick={() => onSelect?.(item)}
                  className="flex cursor-default flex-col gap-0.5 px-3 py-2 outline-none select-none data-highlighted:bg-neutral-100"
                >
                  {renderItem ? renderItem(item) : getLabel(item)}
                </Autocomplete.Item>
              )}
            </Autocomplete.List>

            <LoadMoreSentinel
              onVisible={loadMore}
              disabled={!hasMore || status !== "idle"}
            />

            <Autocomplete.Status className="px-3 py-2 text-neutral-500 empty:hidden">
              {message}
            </Autocomplete.Status>
          </Autocomplete.Popup>
        </Autocomplete.Positioner>
      </Autocomplete.Portal>
    </Autocomplete.Root>
  );
}
