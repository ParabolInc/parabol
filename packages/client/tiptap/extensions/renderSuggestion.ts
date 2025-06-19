import {ReactRenderer, type Editor} from '@tiptap/react'
import type {SuggestionOptions} from '@tiptap/suggestion'
import type {ForwardRefExoticComponent} from 'react'
import tippy, {type Instance, type LifecycleHooks, type Props} from 'tippy.js'

interface Options {
  onHide?: LifecycleHooks['onHide']
  isPopupFixed?: boolean
}

const renderSuggestion =
  (Component: ForwardRefExoticComponent<any>, options?: Options): SuggestionOptions['render'] =>
  () => {
    type GetReferenceClientRect = () => DOMRect
    let component: ReactRenderer<any, any> | undefined
    let popup: Instance<Props>
    const defaultGetClientRect = (editor: Editor) => () => {
      // if the character is 0-space, then the decorationId attribute can't be applied to the node
      // which means clientRect won't be provided
      const box = editor.view.coordsAtPos(editor.state.selection.from)
      return {
        left: box.left,
        top: box.top,
        width: box.right - box.left,
        height: box.bottom - box.top
      }
    }
    return {
      onStart: (props) => {
        component = new ReactRenderer(Component, {
          props,
          editor: props.editor
        })

        const clientRect = props.clientRect || defaultGetClientRect(props.editor)
        popup = tippy(document.body, {
          animation: false,
          getReferenceClientRect: clientRect as GetReferenceClientRect,
          appendTo: () => document.body,
          content: component.element,
          onHide: options?.onHide,
          showOnCreate: true,
          interactive: true,
          trigger: 'manual',
          placement: 'bottom-start'
        })
      },

      onUpdate(props) {
        component?.updateProps(props)
        if (!options?.isPopupFixed) {
          const clientRect = props.clientRect || defaultGetClientRect(props.editor)
          popup?.setProps({
            getReferenceClientRect: clientRect as GetReferenceClientRect
          })
        }
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
