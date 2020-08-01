import {useEffect} from 'react'
import SelectRetroTemplateMutation from '../mutations/SelectRetroTemplateMutation'
import useAtmosphere from './useAtmosphere'

const useSelectTopTemplate = (edges: readonly {node: {id: string}}[], selectedTemplateId: string, teamId: string, isActive: boolean) => {
  const atmosphere = useAtmosphere()
  useEffect(() => {
    if (edges.length === 0 || !isActive) return
    const orgTemplateIds = edges.map(({node}) => node.id)
    const isSelectedInView = orgTemplateIds.includes(selectedTemplateId)
    if (!isSelectedInView) {
      // use a setTimeout to remove animation jank while the tabs are transitioning
      setTimeout(() => {
        SelectRetroTemplateMutation(atmosphere, {selectedTemplateId: orgTemplateIds[0], teamId})
      }, 300)
    }
  }, [isActive])
}

export default useSelectTopTemplate
