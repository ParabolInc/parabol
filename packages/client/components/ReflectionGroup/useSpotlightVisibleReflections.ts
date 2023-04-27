import {useMemo} from 'react'
import {ReflectionGroup_reflectionGroup$data} from '~/__generated__/ReflectionGroup_reflectionGroup.graphql'

const useSpotlightVisibleReflections = (
  reflections: ReflectionGroup_reflectionGroup$data['reflections'],
  spotlightSearchQuery?: string | null,
  reflectionIdsToHide?: string[] | null
) => {
  return useMemo(() => {
    const visibleReflections = reflections.filter(({id}) => !reflectionIdsToHide?.includes(id))

    if (spotlightSearchQuery && visibleReflections.length > 1) {
      const spotlightSearchQueryLower = spotlightSearchQuery.toLowerCase()
      const matchIndex = visibleReflections.findIndex((reflection) => {
        const textLower = reflection.plaintextContent.toLowerCase()
        return textLower.indexOf(spotlightSearchQueryLower) !== -1
      })

      if (matchIndex > 0) {
        const matchingReflection = visibleReflections.splice(matchIndex, 1)[0]!
        visibleReflections.unshift(matchingReflection)
      }
    }

    return visibleReflections
  }, [reflections, reflectionIdsToHide, spotlightSearchQuery])
}

export default useSpotlightVisibleReflections
