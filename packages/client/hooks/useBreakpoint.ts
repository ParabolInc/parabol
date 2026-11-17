import useMediaQuery from './useMediaQuery'

const useBreakpoint = (breakpoint: number) => useMediaQuery(`(min-width: ${breakpoint}px)`)

export default useBreakpoint
