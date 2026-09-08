/** biome-ignore-all lint/a11y/useFocusableInteractive: <explanation> */
/** biome-ignore-all lint/suspicious/noArrayIndexKey: <explanation> */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: <explanation> */
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type WheelColumnProps = {
  items: string[];
  selectedIndex: number;
  onChange: (index: number) => void;
  itemHeight: number;
  visibleCount: number;
  width: string;
  ariaLabel: string;
};

type DateWheelPickerProps = {
  value?: Date;
  minYear?: number;
  maxYear?: number;
  onChange?: (date: Date) => void;
  className?: string;
};

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function daysInMonth(month: number, year: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * A single iOS-style wheel column. Renders a scroll-snapping list where the
 * centered item is treated as "selected". Items are given a perspective
 * transform based on their distance from the center to mimic the curved
 * glass look of the native picker.
 */
function WheelColumn({
  items,
  selectedIndex,
  onChange,
  itemHeight,
  visibleCount,
  width,
  ariaLabel,
}: WheelColumnProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const scrollTimeoutRef = useRef<number | null>(null);
  const isProgrammaticScroll = useRef(false);
  const [scrollTop, setScrollTop] = useState(0);

  const padCount = Math.floor(visibleCount / 2);
  const containerHeight = itemHeight * visibleCount;

  // Keep the wheel in sync when `selectedIndex` changes from outside
  // (e.g. clamping the day when the month changes).
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const targetScrollTop = selectedIndex * itemHeight;
    if (Math.abs(el.scrollTop - targetScrollTop) > 1) {
      isProgrammaticScroll.current = true;
      el.scrollTo({ top: targetScrollTop, behavior: "smooth" });
    }
  }, [selectedIndex, itemHeight]);

  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      setScrollTop(el.scrollTop);
    });

    if (scrollTimeoutRef.current !== null) {
      window.clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = window.setTimeout(() => {
      if (isProgrammaticScroll.current) {
        isProgrammaticScroll.current = false;
        return;
      }
      const index = Math.round(el.scrollTop / itemHeight);
      const clamped = Math.max(0, Math.min(items.length - 1, index));
      onChange(clamped);
    }, 90);
  }, [itemHeight, items.length, onChange]);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      if (scrollTimeoutRef.current !== null) {
        window.clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  const centerOffset = scrollTop / itemHeight;

  return (
    <div
      className="relative select-none overflow-hidden"
      style={{ width, height: containerHeight }}
    >
      <div
        ref={containerRef}
        onScroll={handleScroll}
        role="listbox"
        aria-label={ariaLabel}
        tabIndex={0}
        className="h-full overflow-y-scroll dwp-scroll"
        style={{
          scrollSnapType: "y mandatory",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          maskImage:
            "linear-gradient(to bottom, transparent, black 30%, black 70%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent, black 30%, black 70%, transparent)",
        }}
      >
        <div style={{ height: itemHeight * padCount }} />
        {items.map((label, index) => {
          const distance = index - centerOffset;
          const absDistance = Math.min(Math.abs(distance), padCount + 1);
          const rotateX = distance * 22;
          const translateZ = -Math.abs(distance) * 14;
          const opacity = Math.max(0, 1 - absDistance * 0.28);
          const scale = Math.max(0.72, 1 - absDistance * 0.11);
          const isSelected = index === selectedIndex;

          return (
            <div
              key={label + index}
              role="option"
              aria-selected={isSelected}
              onClick={() => {
                const el = containerRef.current;
                if (!el) return;
                el.scrollTo({ top: index * itemHeight, behavior: "smooth" });
                onChange(index);
              }}
              className="flex items-center justify-center cursor-pointer font-medium tabular-nums"
              style={{
                height: itemHeight,
                scrollSnapAlign: "center",
                transform: `perspective(600px) translateZ(${translateZ}px) rotateX(${rotateX}deg) scale(${scale})`,
                opacity,
                color: isSelected ? "#000000" : "#525252",
                fontSize: isSelected ? 17 : 15,
                transition: "color 120ms ease",
              }}
            >
              {label}
            </div>
          );
        })}
        <div style={{ height: itemHeight * padCount }} />
      </div>
    </div>
  );
}

/**
 * iOS-style scrollable date picker with three momentum/snap wheels for
 * month, day, and year. Pure React + TypeScript, no external dependencies.
 */
export default function DateWheelPicker({
  value,
  minYear = 1950,
  maxYear = new Date().getFullYear() + 10,
  onChange,
  className = "",
}: DateWheelPickerProps) {
  const initial = value ?? new Date();

  const [month, setMonth] = useState(initial.getMonth());
  const [day, setDay] = useState(initial.getDate());
  const [year, setYear] = useState(initial.getFullYear());

  const itemHeight = 40;
  const visibleCount = 5;

  const years = useMemo(() => {
    const list: string[] = [];
    for (let y = minYear; y <= maxYear; y++) list.push(String(y));
    return list;
  }, [minYear, maxYear]);

  const days = useMemo(() => {
    const total = daysInMonth(month, year);
    return Array.from({ length: total }, (_, i) => String(i + 1));
  }, [month, year]);

  // Clamp the selected day when the month/year change produces a shorter month.
  useEffect(() => {
    const total = daysInMonth(month, year);
    if (day > total) setDay(total);
  }, [month, year, day]);

  useEffect(() => {
    onChange?.(new Date(year, month, Math.min(day, daysInMonth(month, year))));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, day, year]);

  return (
    <div
      className={`inline-block rounded-md corner-squircle shadow-lg bg-white px-2 ${className}`}
    >
      <style>{`.dwp-scroll::-webkit-scrollbar { display: none; }`}</style>
      <div
        className="relative flex"
        style={{ height: itemHeight * visibleCount }}
      >
        <div
          className="pointer-events-none absolute left-0 right-0 border-y border-neutral-300/50"
          style={{
            top: itemHeight * Math.floor(visibleCount / 2),
            height: itemHeight,
          }}
        />
        <WheelColumn
          items={MONTHS}
          selectedIndex={month}
          onChange={setMonth}
          itemHeight={itemHeight}
          visibleCount={visibleCount}
          width="140px"
          ariaLabel="Month"
        />
        <WheelColumn
          items={days}
          selectedIndex={day - 1}
          onChange={(i) => setDay(i + 1)}
          itemHeight={itemHeight}
          visibleCount={visibleCount}
          width="64px"
          ariaLabel="Day"
        />
        <WheelColumn
          items={years}
          selectedIndex={years.indexOf(String(year))}
          onChange={(i) => setYear(minYear + i)}
          itemHeight={itemHeight}
          visibleCount={visibleCount}
          width="88px"
          ariaLabel="Year"
        />
      </div>
    </div>
  );
}
