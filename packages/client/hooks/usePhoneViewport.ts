import {Breakpoint} from '../types/constEnums'
import useBreakpoint from './useBreakpoint'

const usePhoneViewport = () => !useBreakpoint(Breakpoint.PHONE)

export default usePhoneViewport
