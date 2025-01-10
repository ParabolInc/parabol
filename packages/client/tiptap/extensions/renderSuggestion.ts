import {ReactRenderer} from '@tiptap/react'
import type {SuggestionOptions} from '@tiptap/suggestion'
import type {ForwardRefExoticComponent} from 'react'
import tippy, {type Instance, type Props} from 'tippy.js'

const renderSuggestion =
  (Component: ForwardRefExoticComponent<any>): SuggestionOptions['render'] =>
  () => {
    type GetReferenceClientRect = () => DOMRect
    let component: ReactRenderer<any, any> | undefined
    let popup: Instance<Props>

    return {
      onStart: (props) => {
        component = new ReactRenderer(Component, {
          props,
          editor: props.editor
        })
        if (!props.clientRect) return
        popup = tippy(document.body, {
          animation: false,
          getReferenceClientRect: props.clientRect as GetReferenceClientRect,
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: 'manual',
          placement: 'bottom-start'
        })
      },

      onUpdate(props) {
        component?.updateProps(props)
        if (!props.clientRect) return
        popup?.setProps({
          getReferenceClientRect: props.clientRect as GetReferenceClientRect
        })
      },

      onKeyDown(props) {
        if (props.event.key === 'Escape') {
          popup?.hide()
          return true
        }
        return component?.ref?.onKeyDown(props)
      },

      onExit() {
        popup?.destroy()
        component?.destroy()
      }
    }
  }

export default renderSuggestion
