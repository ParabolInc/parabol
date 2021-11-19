import useSpotlightResults from '~/hooks/useSpotlightResults'
import {useMemo} from 'react'
import {ReflectionGroup_reflectionGroup} from '~/__generated__/ReflectionGroup_reflectionGroup.graphql'

const useSpotlightReflectionGroup = (
  visibleReflections: ReflectionGroup_reflectionGroup['reflections'],
  spotlightGroupId: string | undefined,
  reflectionGroupId: string,
  isBehindSpotlight: boolean
) => {
  const isSpotlightSrcGroup = spotlightGroupId === reflectionGroupId
  const isSpotlightOpen = !!spotlightGroupId
  const spotlightResultGroups = useSpotlightResults(spotlightGroupId, '', true) // TODO: add search query
  const isRemoteSpotlightSrc = useMemo(
    () => !!visibleReflections.find(({remoteDrag}) => remoteDrag?.isSpotlight),
    [visibleReflections]
  )
  const disableDrop = useMemo(() => {
    const isViewerDraggingResult = !!spotlightResultGroups?.find(({reflections}) =>
      reflections?.find(({isViewerDragging}) => isViewerDragging)
    )
    return isSpotlightOpen
      ? (isViewerDraggingResult && !isSpotlightSrcGroup) || isBehindSpotlight // prevent grouping results into results
      : isRemoteSpotlightSrc // prevent dropping onto animating remote source
  }, [spotlightResultGroups, isSpotlightSrcGroup, isBehindSpotlight, isRemoteSpotlightSrc])
  return [isRemoteSpotlightSrc, disableDrop]
}

export default useSpotlightReflectionGroup
