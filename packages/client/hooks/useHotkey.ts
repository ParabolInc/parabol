import Mousetrap from 'mousetrap'
import {useEffect} from 'react'
import useDeepEqual from '~/hooks/useDeepEqual'
import useEventCallback from '~/hooks/useEventCallback'

type Binding = string | string[]
const useHotkey = (
  inKeys: Binding,
  callback: (e: KeyboardEvent, combo: string) => any,
  action?: string
) => {
  const cb = useEventCallback(callback)
  const keyArr = Array.isArray(inKeys) ? inKeys : [inKeys]
  const keys = useDeepEqual(keyArr)
  useEffect(() => {
    Mousetrap.bind(keys, cb, action)
    return () => {
      Mousetrap.unbind(keys)
    }
  }, [keys, cb, action])
}

export default useHotkey
