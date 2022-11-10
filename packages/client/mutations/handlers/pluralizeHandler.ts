import {FirstParam, SecondPlusParams} from '../../types/generics'

const pluralizeHandler =
  <T extends (...args: any[]) => any>(handler: T) =>
  (
    newNodeOrNodes: FirstParam<T> | FirstParam<T>[] | readonly FirstParam<T>[],
    ...args: SecondPlusParams<T>
  ) => {
    if (!newNodeOrNodes) return
    if (Array.isArray(newNodeOrNodes)) {
      for (let ii = 0; ii < newNodeOrNodes.length; ii++) {
        const newNode = newNodeOrNodes[ii]
        handler(newNode, ...args)
      }
    } else {
      handler(newNodeOrNodes, ...args)
    }
  }

export default pluralizeHandler
