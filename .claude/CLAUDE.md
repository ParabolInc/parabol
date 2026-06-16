Never cast a type `as any`
Only 1 React component per file, typically <100 LOCs
Tailwind color classes (e.g. `text-slate-700`, `bg-sky-500`) are defined in paletteV3, NOT in the default Tailwind palette. Always check paletteV3 for available colors — never use inline `style={{color: ...}}` when a Tailwind class exists
