// @flow
import * as React from 'react';

import getDisplayName from 'universal/utils/getDisplayName';

export class DragCache {
  _cache: Map<string, any>;

  constructor() {
    this.clear();
  }

  update(dragData: {[string]: any}): void {
    Object.entries(dragData).forEach(([key, val]) => {
      this._cache.set(key, val);
    });
  }

  clear(): void {
    this._cache = new Map();
  }

  isSameDrag(dragData: {[string]: any}): boolean {
    return !(
      Object.entries(dragData).find(
        ([key, val]) => this._cache.get(key) !== val
      )
    );
  }
}

// A higher-order component to pass a cache through to your compnents useful for
// debouncng drag-and-drop operations.
//
// Usage: take the `dragCache` prop, and use the `update`/`clear`/`isSameDrag`
// methods in your react-dnd hover handler.
//
// NOTE: cache comparisons rely on a simple string / number / boolean type for
// value comparison, since we don't yet have a Comparable interface, so make
// sure your cache values are not objects.
export default function withDragCache<Props>(WrappedComponent: React.ComponentType<Props>) {
  type WrappedProps = { ...Props, dragCache: DragCache };

  const dragCache = new DragCache();

  function WithDragCache(props: WrappedProps) {
    return <WrappedComponent dragCache={dragCache} {...props} />;
  }

  WithDragCache.displayName = `WithDragCache(${getDisplayName(WrappedComponent)}`;

  return WithDragCache;
}
