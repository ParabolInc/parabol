import {computePosition, flip, shift} from '@floating-ui/dom'
import {type Editor, posToDOMRect, ReactRenderer} from '@tiptap/react'
import type {SuggestionOptions} from '@tiptap/suggestion'
import type {ForwardRefExoticComponent} from 'react'

interface Options {
  // TODO fix onHide
  onHide?: () => void
  isPopupFixed?: boolean
}

const getSelectionRect = (editor: Editor) =>
  posToDOMRect(editor.view, editor.state.selection.from, editor.state.selection.to)

const updatePosition = (editor: Editor, element: HTMLElement, anchorRect?: DOMRect) => {
  const virtualElement = {
    getBoundingClientRect: () => anchorRect ?? getSelectionRect(editor)
  }

  computePosition(virtualElement, element, {
    placement: 'bottom-start',
    strategy: 'absolute',
    middleware: [shift(), flip()]
  }).then(({x, y, strategy}) => {
    element.style.width = 'max-content'
    element.style.position = strategy
    element.style.left = `${x}px`
    element.style.top = `${y}px`
  })
}

const renderSuggestion =
  (Component: ForwardRefExoticComponent<any>, options?: Options): SuggestionOptions['render'] =>
  () => {
    let component: ReactRenderer<any, any> & {element: HTMLElement}
    let anchorRect: DOMRect | undefined
    let resizeObserver: ResizeObserver | undefined
    const handlePointerDown = (event: PointerEvent) => {
      const element = component?.element
      // Skip if the element doesn't exist or the event target is inside it
      if (!element || element.contains(event.target as Node)) return
      options?.onHide?.()
    }
    return {
      onStart: (props) => {
        // A modal Radix dialog sets pointer-events: none on body, which this body-level popup inherits
        const isInDialog = !!props.editor.view.dom.closest('[role="dialog"]')
        component = new ReactRenderer(Component, {
          props,
          editor: props.editor,
          className: isInDialog ? 'pointer-events-auto z-40' : 'z-10'
        }) as typeof component
        component.element.style.position = 'absolute'
        component.element.dataset.suggestionPopup = ''
        document.body.appendChild(component.element)
        document.addEventListener('pointerdown', handlePointerDown)
        if (options?.isPopupFixed) anchorRect = getSelectionRect(props.editor)
        // Items arrive after onStart and React renders them async, so flip() needs the real height
        resizeObserver = new ResizeObserver(() =>
          updatePosition(props.editor, component.element, anchorRect)
        )
        resizeObserver.observe(component.element)
      },

      onUpdate(props) {
        component?.updateProps(props)
        updatePosition(props.editor, component.element, anchorRect)
      },

      onKeyDown(props) {
        if (props.event.key === 'Escape') {
          options?.onHide?.()
          component.destroy()
          return true
        }
        return component?.ref?.onKeyDown(props)
      },

      onExit() {
        resizeObserver?.disconnect()
        document.removeEventListener('pointerdown', handlePointerDown)
        component?.element?.remove()
        component?.destroy()
      }
    }
  }

export default renderSuggestion
