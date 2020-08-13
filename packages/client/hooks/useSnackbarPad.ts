import {RefObject, useEffect} from 'react'
import {commitLocalUpdate} from 'relay-runtime'
import getBBox from '../components/RetroReflectPhase/getBBox'
import useAtmosphere from './useAtmosphere'

const useSnackbarPad = (ref: RefObject<HTMLElement>) => {
  const atmosphere = useAtmosphere()
  const el = ref.current
  useEffect(() => {
    const bbox = getBBox(el)
    const snackbarOffset = bbox ? Math.max(window.innerHeight - bbox.top, 96) : 48

    commitLocalUpdate(atmosphere, (store) => {
      const viewer = store.getRoot().getLinkedRecord('viewer')!
      viewer.setValue(snackbarOffset, 'snackbarOffset')
    })
    return () => {
      commitLocalUpdate(atmosphere, (store) => {
        const viewer = store.getRoot().getLinkedRecord('viewer')!
        viewer.setValue(0, 'snackbarOffset')
      })
    }
  }, [atmosphere, el])
}

export default useSnackbarPad
