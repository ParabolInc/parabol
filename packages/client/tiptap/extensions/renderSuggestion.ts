import {computePosition, flip, shift} from '@floating-ui/dom'
import {posToDOMRect, ReactRenderer, type Editor} from '@tiptap/react'
import type {SuggestionOptions} from '@tiptap/suggestion'
import type {ForwardRefExoticComponent} from 'react'
interface Options {
  // TODO fix onHide
  onHide?: () => void
  isPopupFixed?: boolean
}

export const updatePosition = (editor: Editor, element: HTMLElement) => {
  const virtualElement = {
    getBoundingClientRect: () =>
      posToDOMRect(editor.view, editor.state.selection.from, editor.state.selection.to)
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
    return {
      onStart: (props) => {
        component = new ReactRenderer(Component, {
          props,
          editor: props.editor
        }) as typeof component
        if (!props.clientRect) return
        component.element.style.position = 'absolute'
        document.body.appendChild(component.element)
        updatePosition(props.editor, component.element)
      },

      onUpdate(props) {
        component?.updateProps(props)
        if (!props.clientRect) return
        if (!options?.isPopupFixed) {
          updatePosition(props.editor, component.element)
        }
      },

      onKeyDown(props) {
        if (props.event.key === 'Escape') {
          component.destroy()
          return true
        }
        return component?.ref?.onKeyDown(props)
      },

      onExit() {
        component.element.remove()
        component?.destroy()
      }
    }
  }

export default renderSuggestion
