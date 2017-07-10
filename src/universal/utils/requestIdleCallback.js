const shimRIC = (cb) => {
  const start = Date.now();
  return setTimeout(function () {
    cb({
      didTimeout: false,
      timeRemaining: () => Math.max(0, 50 - (Date.now() - start))
    });
  // google shim default is 1, i like 100 to ensure the render tree got done
  }, 100);
};

const shimCancel = (id) => clearTimeout(id);

export const requestIdleCallback = typeof window !== 'undefined' && window.requestIdleCallback || shimRIC;
export const cancelIdleCallback = typeof window !== 'undefined' && window.cancelIdleCallback || shimCancel;

