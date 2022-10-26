const REACT_ELEMENT = Symbol.for('react.element')
export const isReactElement = (child: any) => child && child.$$typeof === REACT_ELEMENT
