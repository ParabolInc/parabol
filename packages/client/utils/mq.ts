import {Breakpoint} from '../types/constEnums'

const mq = (breakpoint: Breakpoint) => `@media (min-width: ${breakpoint}px)`

export default mq
