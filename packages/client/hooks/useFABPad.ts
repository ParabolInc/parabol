import {RefObject, useEffect} from 'react'
import getBBox from '../components/RetroReflectPhase/getBBox'
import {commitLocalUpdate} from 'relay-runtime'
import useAtmosphere from './useAtmosphere'

const useFABPad = (ref: RefObject<HTMLElement>) => {
  const atmosphere = useAtmosphere()
  const el = ref.current
  useEffect(() => {
    const bbox = getBBox(el)
    const topOfFAB = bbox ? window.innerHeight - bbox.top : 48
    commitLocalUpdate(atmosphere, (store) => {
      const viewer = store.getRoot().getLinkedRecord('viewer')!
      viewer.setValue(topOfFAB, 'topOfFAB')
    })
  }, [el])
}

export default useFABPad
