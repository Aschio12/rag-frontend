"use client";

/**
 * VirtualList — tiny, dependency-free windowed list.
 *
 * Renders only items in a viewport range with row/col layout. Best used for
 * uniform-height rows; the library uses it in column-counts of 2/3/4.
 */

import * as React from "react";

interface VirtualListProps<T> {
  items: T[];
  columns: number;
  estimateRowHeight: number;
  overscan?: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  empty?: React.ReactNode;
  gap?: number;
}

export function VirtualList<T>({
  items,
  columns,
  estimateRowHeight,
  overscan = 6,
  renderItem,
  empty,
  gap = 16,
}: VirtualListProps<T>) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = React.useState(0);
  const [height, setHeight] = React.useState(0);

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const onScroll = () => setScrollTop(node.scrollTop);
    const ro = new ResizeObserver(() => setHeight(node.clientHeight));
    ro.observe(node);
    node.addEventListener("scroll", onScroll, { passive: true });
    setHeight(node.clientHeight);
    return () => {
      ro.disconnect();
      node.removeEventListener("scroll", onScroll);
    };
  }, []);

  if (items.length === 0) return <>{empty}</>;

  const rowH = estimateRowHeight + gap;
  const start = Math.max(0, Math.floor(scrollTop / rowH) - overscan);
  const visibleCount = Math.ceil(height / rowH) + overscan * 2;
  const end = Math.min(items.length, start + visibleCount);

  const padding = start * rowH;

  return (
    <div
      ref={ref}
      style={{
        position: "relative",
        overflow: "auto",
        height: "100%",
      }}
    >
      <div style={{ height: items.length * rowH, position: "relative" }}>
        <div
          style={{
            position: "absolute",
            top: padding,
            left: 0,
            right: 0,
            display: "grid",
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            gap,
          }}
        >
          {items.slice(start, end).map((item, i) => (
            <div key={(item as { id?: string }).id ?? start + i}>
              {renderItem(item, start + i)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
