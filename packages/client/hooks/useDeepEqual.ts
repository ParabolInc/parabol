import areEqual from 'fbjs/lib/areEqual'
import {useRef} from 'react'

const useDeepEqual = (obj: object) => {
  const objRef = useRef(obj)
  if (!areEqual(obj, objRef.current)) {
    objRef.current = obj
  }
  return objRef.current
}

export default useDeepEqual
