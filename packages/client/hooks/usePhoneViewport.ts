import {Breakpoint} from '../types/constEnums'
import useBreakpoint from './useBreakpoint'

export const isPhoneViewport = () =>
  !window.matchMedia(`(min-width: ${Breakpoint.PHONE}px)`).matches

const usePhoneViewport = () => !useBreakpoint(Breakpoint.PHONE)

export default usePhoneViewport
