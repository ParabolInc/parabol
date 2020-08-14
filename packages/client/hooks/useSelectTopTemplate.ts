import {useEffect, useRef} from 'react'
import SelectRetroTemplateMutation from '../mutations/SelectRetroTemplateMutation'
import isTempId from '../utils/relay/isTempId'
import useAtmosphere from './useAtmosphere'

const useSelectTopTemplate = (edges: readonly {node: {id: string}}[], selectedTemplateId: string, teamId: string, isActive: boolean) => {
  const atmosphere = useAtmosphere()
  const timer = useRef<number | undefined>()
  useEffect(() => {
    window.clearTimeout(timer.current)
    timer.current = undefined
    // use a setTimeout to remove animation jank while the tabs are transitioning
    timer.current = window.setTimeout(() => {
      if (edges.length === 0 || !isActive || isTempId(selectedTemplateId)) return
      const listTemplateIds = edges.map(({node}) => node.id)
      const isSelectedInView = listTemplateIds.includes(selectedTemplateId)
      if (!isSelectedInView) {
        SelectRetroTemplateMutation(atmosphere, {selectedTemplateId: listTemplateIds[0], teamId})
      }
    }, 300)
  }, [isActive, selectedTemplateId])
}

export default useSelectTopTemplate
