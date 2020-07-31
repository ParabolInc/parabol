import {useEffect} from 'react'
import SelectRetroTemplateMutation from '../mutations/SelectRetroTemplateMutation'
import useAtmosphere from './useAtmosphere'

const useSelectTopTemplate = (edges: readonly {node: {id: string}}[], selectedTemplateId: string, teamId: string) => {
  const atmosphere = useAtmosphere()
  useEffect(() => {
    if (edges.length === 0) return
    const orgTemplateIds = edges.map(({node}) => node.id)
    const isSelectedInView = orgTemplateIds.includes(selectedTemplateId)
    if (!isSelectedInView) {
      SelectRetroTemplateMutation(atmosphere, {selectedTemplateId: orgTemplateIds[0], teamId})
    }
  }, [])
}

export default useSelectTopTemplate
