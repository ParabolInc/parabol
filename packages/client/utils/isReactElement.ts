import {REACT_ELEMENT} from './constants'

export const isReactElement = (child: any) => child && child.$$typeof === REACT_ELEMENT
