import styled from '@emotion/styled'
import React, {useEffect, useRef} from 'react'
import {commitLocalUpdate} from 'relay-runtime'
import useAtmosphere from '../../hooks/useAtmosphere'
import {ElementWidth} from '../../types/constEnums'
import {RefCallbackInstance} from '../../types/generics'
import {OpenSpotlight} from '../GroupingKanbanColumn'
import DraggableReflectionCard from '../ReflectionGroup/DraggableReflectionCard'

const ModalReflectionWrapper = styled('div')({
  padding: ElementWidth.REFLECTION_CARD_PADDING
})

interface Props {
  idx: number
  reflection: any
  meeting: any
  openSpotlight?: OpenSpotlight
  setItemsRef: (idx: number) => (c: RefCallbackInstance) => void
  staticReflections: readonly any[]
}

// this isEditing logic is a little verbose, could use a rewrite
const ExpandedReflection = (props: Props) => {
  const {reflection, meeting, openSpotlight, setItemsRef, idx, staticReflections} = props
  const {id: reflectionId} = reflection
  const staticIdx = staticReflections.indexOf(reflection)
  const atmosphere = useAtmosphere()
  const setIsEditing = (reflectionId: string) => () => {
    const watchForClick = (e) => {
      const isClickOnCard = e.composedPath().find((el) => el === cardRef.current)
      if (!isClickOnCard) {
        document.removeEventListener('click', watchForClick)
        commitLocalUpdate(atmosphere, (store) => {
          const reflection = store.get(reflectionId)
          if (!reflection) return
          reflection.setValue(false, 'isEditing')
        })
      }
    }
    document.addEventListener('click', watchForClick)
    commitLocalUpdate(atmosphere, (store) => {
      const reflection = store.get(reflectionId)
      if (!reflection) return
      reflection.setValue(true, 'isEditing')
    })
  }
  const cardRef = useRef<HTMLDivElement>()
  const setRef = (c: HTMLDivElement) => {
    setItemsRef(idx)(c)
    cardRef.current = c
  }
  useEffect(() => {
    return () => {
      commitLocalUpdate(atmosphere, (store) => {
        const reflection = store.get(reflectionId)
        if (!reflection) return
        reflection.setValue(false, 'isEditing')
      })
    }
  }, [])
  if (staticIdx === -1) return null
  return (
    <ModalReflectionWrapper
      style={{zIndex: staticReflections.length - staticIdx - 1}}
      id={reflection.id}
      ref={setRef}
      onClick={setIsEditing(reflection.id)}
    >
      <DraggableReflectionCard
        isDraggable
        meeting={meeting}
        openSpotlight={openSpotlight}
        reflection={reflection}
        staticIdx={staticIdx}
        staticReflections={staticReflections}
      />
    </ModalReflectionWrapper>
  )
}

export default ExpandedReflection
