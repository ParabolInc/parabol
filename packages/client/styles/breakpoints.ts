// [0] = 480 (narrowest)
// [1] = 800 (narrower)
// [2] = 1280 (narrow)
// [3] = 1440 (wide)
// [4] = 1600 (wider)
// [5] = 1920 (widest)

// export breakpoints for JS width hackery
export const breakpoints = [480, 800, 1280, 1440, 1600, 1920]

// keeping it simple for now, mobile first = screen and (min-width)
export const minWidthMediaQueries = breakpoints.map(
  (breakpoint) => `@media screen and (min-width: ${breakpoint}px)`
) as [string, string, string, string, string, string]
