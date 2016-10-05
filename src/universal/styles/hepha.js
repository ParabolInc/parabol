export default function injectGlobals(injectStyleOnce, globalStyles) {
  const selectors = Object.keys(globalStyles);
  for (let i = 0; i < selectors.length; i++) {
    const name = selectors[i];
    const value = globalStyles[name];
    injectStyleOnce(name, name, [value], false);
  }
};
