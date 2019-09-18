const typography = {
  // #deprecated use fontFamily and fontSize constants instead of typography

  // Font stacks
  sansSerif: '"IBM Plex Sans", "Helvetica Neue", Helvetica, Arial, sans-serif',
  monospace: '"IBM Plex Mono", Menlo, Monaco, Consolas, "Courier New", monospace',

  // Typography scale (matches a subset of Sketch defaults)
  sBase: '1rem', // 16px
  s1: '.75rem', // 12px
  s2: '.8125rem', // 13px
  s3: '.875rem', // 14px
  s4: '1.125rem', // 18px
  s5: '1.25rem', // 20px
  s6: '1.5rem', // 24px
  s7: '2.125rem', // 34px
  s8: '3rem' // 48px
}

export default typography

export const fontFamily = {
  sansSerif: '"IBM Plex Sans", "Helvetica Neue", Helvetica, Arial, sans-serif',
  monospace: '"IBM Plex Mono", Menlo, Monaco, Consolas, "Courier New", monospace'
}

// ---------------------
// Typography Scale
// ---------------------
// [0] .6875rem   (11px)
// [1] .75rem     (12px)
// [2] .8125rem   (13px)
// [3] .875rem    (14px)
// [4] 1rem       (16px)
// [5] 1.125rem   (18px)
// [6] 1.25rem    (20px)
// [7] 1.5rem     (24px)
// [8] 2.125rem   (34px)
// [9] 3rem'      (48px)

export const typeScale = [
  '.6875rem',
  '.75rem',
  '.8125rem',
  '.875rem',
  '1rem',
  '1.125rem',
  '1.25rem',
  '1.5rem',
  '2.125rem',
  '3rem'
]
