import {useState} from 'react'

const useLastNonNull = <T>(value: T | null | undefined) => {
  const [lastValue, setLastValue] = useState(value)
  if (value != null && value !== lastValue) setLastValue(value)
  return value ?? lastValue
}

export default useLastNonNull
