import React, {useContext, useEffect, useState} from 'react'
import {PortalContext} from '../components/AtmosphereProvider/PortalProvider'
import RemoteReflection from '../components/ReflectionGroup/RemoteReflection'
import useAtmosphere from './useAtmosphere'
import updateClonePosition from '../utils/retroGroup/updateClonePosition'
import {commitLocalUpdate} from 'relay-runtime'
import {Times} from '../types/constEnums'
import useEventCallback from './useEventCallback'
import isNativeTouch from '../utils/isNativeTouch'
import getTargetGroupId from '../utils/retroGroup/getTargetGroupId'
import {DragReflectionDropTargetTypeEnum} from '../types/graphql'
import handleDrop from '../utils/retroGroup/handleDrop'
import getTargetReference from '../utils/multiplayerMasonry/getTargetReference'
import UpdateDragLocationMutation from '../mutations/UpdateDragLocationMutation'
import getIsDrag from '../utils/retroGroup/getIsDrag'
import cloneReflection from '../utils/retroGroup/cloneReflection'
import getBBox from '../components/RetroReflectPhase/getBBox'
import shortid from 'shortid'
import StartDraggingReflectionMutation from '../mutations/StartDraggingReflectionMutation'
import isReactTouch from '../utils/isReactTouch'
import {ReflectionDragState} from '../components/ReflectionGroup/DraggableReflectionCard'
import {DraggableReflectionCard_reflection} from '__generated__/DraggableReflectionCard_reflection.graphql'


const windowDims = {
  clientHeight: window.innerHeight,
  clientWidth: window.innerWidth
}

const useRemoteDrag = (reflection: DraggableReflectionCard_reflection, drag: ReflectionDragState, staticIdx: number) => {
  const setPortal = useContext(PortalContext)
  const {remoteDrag, isDropping} = reflection
  const setRemoteCard = () => {
    if (!drag.ref) return
    const bbox = drag.ref.getBoundingClientRect()
    const {left, top} = bbox
    setPortal(`clone-${reflection.id}`, <RemoteReflection initialTransform={`translate(${left}px,${top}px)`}
                                                          reflection={reflection} />)
  }
  // is opening
  useEffect(() => {
    if (remoteDrag) {
      setRemoteCard()
    }
  }, [remoteDrag])

  // is closing
  useEffect(() => {
    if (isDropping && staticIdx !== -1 && remoteDrag) {
      setRemoteCard()
    }
  }, [isDropping, staticIdx, remoteDrag])
}

const useLocalDrag = (reflection: DraggableReflectionCard_reflection, drag: ReflectionDragState, staticIdx: number, onMouseMove: any, onMouseUp: any) => {
  const {remoteDrag, isDropping, id: reflectionId, isViewerDragging} = reflection
  const atmosphere = useAtmosphere()
  useEffect(() => {
    if (drag.ref && isDropping && staticIdx !== -1 && !remoteDrag) {
      updateClonePosition(drag.ref, reflectionId)
    }
  }, [isDropping, staticIdx, drag, remoteDrag, reflectionId])
  useEffect(() => {
    if (!isViewerDragging && !isDropping && drag.clone) {
      document.body.removeChild(drag.clone)
      drag.clone = null
      document.removeEventListener('touchmove', onMouseMove)
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('touchend', onMouseUp)
      document.removeEventListener('mouseup', onMouseUp)
      drag.isDrag = false
      atmosphere.eventEmitter.emit('addSnackbar', {
        key: `reflectionInterception:${reflectionId}`,
        autoDismiss: 5,
        message: `Oh no! ${remoteDrag!.dragUserName} stole your reflection!`
      })
    }
  }, [isViewerDragging, isDropping])
}

const useDroppingDrag = (drag: ReflectionDragState, reflection: DraggableReflectionCard_reflection) => {
  const setPortal = useContext(PortalContext)
  const {remoteDrag, id: reflectionId, isDropping} = reflection
  const atmosphere = useAtmosphere()
  useEffect(() => {
    if (isDropping !== drag.wasDropping) {
      drag.wasDropping = isDropping || false
      if (isDropping) {
        drag.timeout = window.setTimeout(() => {
          if (drag.clone) {
            // local
            document.body.removeChild(drag.clone!)
            drag.clone = null
          } else {
            //remote
            setPortal(`clone-${reflectionId}`, null)
          }
          commitLocalUpdate(atmosphere, (store) => {
            store.get(reflectionId)!
              .setValue(false, 'isDropping')
              .setValue(null, 'remoteDrag')
          })
        }, remoteDrag ? Times.REFLECTION_REMOTE_DROP_DURATION : Times.REFLECTION_DROP_DURATION)
      } else {
        // a new drag overrode the old one
        window.clearTimeout(drag.timeout!)
      }
    }
  }, [isDropping])
}

const useDragAndDrop = (drag: ReflectionDragState, reflection: DraggableReflectionCard_reflection, staticIdx: number, teamId: string, reflectionCount: number) => {
  const atmosphere = useAtmosphere()

  const [readOnly, setReadOnly] = useState(true)

  const onClick = () => {
    if (reflection.isDropping) return
    // setTimeout(() => {
    setReadOnly(false)
    // })
  }

  const onBlur = (e) => {
    if (e.currentTarget.contains(e.relatedTarget)) return
    setReadOnly(true)
  }

  const {id: reflectionId, reflectionGroupId, isDropping} = reflection

  const onMouseUp = useEventCallback((e: MouseEvent | TouchEvent) => {
    const eventType = isNativeTouch(e) ? 'touchmove' : 'mousemove'
    document.removeEventListener(eventType, onMouseMove)
    if (!drag.isDrag) return
    drag.isDrag = false
    const targetGroupId = getTargetGroupId(e)
    const targetType = targetGroupId && reflectionGroupId !== targetGroupId ?
      DragReflectionDropTargetTypeEnum.REFLECTION_GROUP : !targetGroupId && reflectionCount > 0 ?
        DragReflectionDropTargetTypeEnum.REFLECTION_GRID :
        null
    handleDrop(atmosphere, reflectionId, drag, targetType, targetGroupId)
  })

  const announceDragUpdate = (cursorX: number, cursorY: number) => {
    if (drag.isBroadcasting) return
    drag.isBroadcasting = true
    const {targetId, targetOffsetX, targetOffsetY} = getTargetReference(
      cursorX,
      cursorY,
      drag.cardOffsetX,
      drag.cardOffsetY,
      drag.targets,
      drag.prevTargetId
    )
    drag.prevTargetId = targetId
    const input = {
      ...windowDims,
      id: drag.id,
      clientX: cursorX - drag.cardOffsetX,
      clientY: cursorY - drag.cardOffsetY,
      sourceId: reflectionId,
      teamId,
      targetId,
      targetOffsetX,
      targetOffsetY
    }
    UpdateDragLocationMutation(atmosphere, {input})
    requestAnimationFrame(() => {
      drag.isBroadcasting = false
    })
  }
  const onMouseMove = useEventCallback((e: MouseEvent | TouchEvent) => {
    const isTouch = isNativeTouch(e)
    const {clientX, clientY} = isTouch ? (e as TouchEvent).touches[0] : e as MouseEvent
    if (!drag.isDrag) {
      drag.isDrag = getIsDrag(clientX, clientY, drag.startX, drag.startY)
      if (!drag.isDrag || !drag.ref) return
      const eventName = isTouch ? 'touchend' : 'mouseup'
      document.addEventListener(eventName, onMouseUp, {once: true})
      const bbox = drag.ref.getBoundingClientRect()!
      // clip quick drags so the cursor is guaranteed to be inside the card
      drag.cardOffsetX = Math.min(clientX - bbox.left, bbox.width)
      drag.cardOffsetY = Math.min(clientY - bbox.top, bbox.height)
      drag.clone = cloneReflection(drag.ref, reflectionId)
      // can improve performance by starting at the kanban instead of the doc
      const groupEls = document.querySelectorAll('div[data-droppable]')
      groupEls.forEach((el) => {
        const targetId = el.getAttribute('data-droppable')!
        const bbox = getBBox(el)!
        drag.targets.push({
          targetId,
          ...bbox
        })
      })
      drag.id = shortid.generate()
      StartDraggingReflectionMutation(atmosphere, {reflectionId, dragId: drag.id})
    }
    if (!drag.clone) return
    drag.clone.style.transform = `translate(${clientX - drag.cardOffsetX}px,${clientY - drag.cardOffsetY}px)`
    announceDragUpdate(clientX, clientY)
  })

  const onMouseDown = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (isDropping || staticIdx === -1 || !readOnly) return
    const isTouch = isReactTouch(e)
    const moveName = isTouch ? 'touchmove' : 'mousemove'
    const endName = isTouch ? 'touchend' : 'mouseup'
    document.addEventListener(moveName, onMouseMove)
    document.addEventListener(endName, onMouseUp)
    const {clientX, clientY} = isTouch ? (e as React.TouchEvent<HTMLDivElement>).touches[0] : e as React.MouseEvent<HTMLDivElement>
    drag.startX = clientX
    drag.startY = clientY
    drag.isDrag = false
  }

  return {onMouseDown, onMouseMove, onMouseUp, onClick, onBlur, readOnly, setReadOnly}
}

const useDraggableReflectionCard = (reflection: DraggableReflectionCard_reflection, drag: ReflectionDragState, staticIdx: number, teamId: string, staticReflectionCount: number) => {
  useRemoteDrag(reflection, drag, staticIdx)
  useDroppingDrag(drag, reflection)
  const {onMouseDown, onMouseUp, onMouseMove, readOnly, onBlur, onClick, setReadOnly} = useDragAndDrop(drag, reflection, staticIdx, teamId, staticReflectionCount)
  useLocalDrag(reflection, drag, staticIdx, onMouseMove, onMouseUp)
  return {onMouseDown, readOnly, onBlur, onClick, setReadOnly}
}

export default useDraggableReflectionCard
