import {useLayoutEffect} from 'react'
import {commitLocalUpdate} from 'react-relay'
import {Breakpoint, SubColumn} from '~/types/constEnums'
import useAtmosphere from './useAtmosphere'
import useBreakpoint from './useBreakpoint'

const useExpandColumnsWidth = (reflectPrompts, reflectionGroups) => {
  const atmosphere = useAtmosphere()
  const reflectPromptsCount = reflectPrompts.length
  const isDesktop = useBreakpoint(Breakpoint.SIDEBAR_LEFT)
  const isWiderScreen = useBreakpoint(Breakpoint.WIDER_SCREEN)
  useLayoutEffect(() => {
    commitLocalUpdate(atmosphere, (store) => {
      const isWidthExpanded =
        (reflectPromptsCount === 1 && isDesktop) || (reflectPromptsCount === 2 && isWiderScreen)
      reflectPrompts.forEach((prompt) => {
        const reflectPrompt = store.get(prompt.id)
        reflectPrompt?.setValue(isWidthExpanded, 'isWidthExpanded')
      })

      // TODO: if is init
      if (!reflectionGroups) return
      reflectionGroups.forEach((group, index) => {
        const reflectionGroup = store.get(group.id)
        const subColumn = index % 2 === 0 ? SubColumn.LEFT : SubColumn.RIGHT
        reflectionGroup?.setValue(subColumn, 'subColumn')
      })
    })
  }, [isDesktop, isWiderScreen])
}

export default useExpandColumnsWidth
