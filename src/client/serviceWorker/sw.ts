
// This file must have worker types, but not DOM types.
// The global should be that of a service worker.

// This fixes `self`'s type.
declare var self: ServiceWorkerGlobalScope;
export {};

console.log(self.clients);

self.addEventListener('fetch', (event) => {
  console.log(event.request);
});
