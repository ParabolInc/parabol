// 0 narrowest
// 1 narrower
// 2 narrow
// 3 wide
// 4 wider
// 5 widest

// export breakpoints for JS width hackery
export const breakpoints = [480, 800, 1280, 1440, 1600, 1920]

// keeping it simple for now, mobile first = screen and (min-width)
const makeMediaQueryArray = (array) => {
  const queries = []
  array.map((breakpoint) => queries.push(`@media screen and (min-width: ${breakpoint}px)`))
  return queries
}

export const minWidthMediaQueries = makeMediaQueryArray(breakpoints)
