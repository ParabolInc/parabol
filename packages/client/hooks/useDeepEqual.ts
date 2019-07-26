import areEqual from 'fbjs/lib/areEqual'
import {useRef} from 'react'

const useDeepEqual = <T>(obj: T) => {
  const objRef = useRef(obj)
  if (!areEqual(obj, objRef.current)) {
    objRef.current = obj
  }
  return objRef.current
}

export default useDeepEqual
