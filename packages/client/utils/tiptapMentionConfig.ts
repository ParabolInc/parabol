import {MentionNodeAttrs, MentionOptions} from '@tiptap/extension-mention'
import {ReactRenderer} from '@tiptap/react'
import graphql from 'babel-plugin-relay/macro'
import stringScore from 'string-score'
import tippy, {Instance, Props} from 'tippy.js'
import {tiptapMentionConfigQuery} from '../__generated__/tiptapMentionConfigQuery.graphql'
import Atmosphere from '../Atmosphere'
import MentionDropdown from '../components/MentionDropdown'

const queryNode = graphql`
  query tiptapMentionConfigQuery($teamId: ID!) {
    viewer {
      team(teamId: $teamId) {
        teamMembers {
          id
          picture
          preferredName
        }
      }
    }
  }
`

export const tiptapMentionConfig = (atmosphere: Atmosphere, teamId: string) => {
  const config: Partial<MentionOptions<any, MentionNodeAttrs>> = {
    // renderText does not fire, bug in TipTap? Fallback to using more verbose renderHTML
    renderHTML({options, node}) {
      return ['span', options.HTMLAttributes, `${node.attrs.label ?? node.attrs.id}`]
    },
    suggestion: {
      // some users have first & last name
      allowSpaces: true,
      decorationClass: 'mention',
      items: async ({query}) => {
        const res = await atmosphere.fetchQuery<tiptapMentionConfigQuery>(queryNode, {teamId})
        if (!res) return []
        const {viewer} = res
        const {team} = viewer
        const {teamMembers} = team!
        return (
          teamMembers
            .map((teamMember) => {
              const score = query ? stringScore(teamMember.preferredName, query) : 1
              return {
                teamMember,
                score
              }
            })
            .sort((a, b) => (a.score < b.score ? 1 : -1))
            .slice(0, 6)
            // If you type "Foo" and the options are "Foo" and "Giraffe", remove "Giraffe"
            .filter((obj, _idx, arr) => obj.score > 0 && arr[0]!.score - obj.score < 0.3)
            .map((s) => ({...s.teamMember, query}))
        )
      },

      // Using radix-ui isn't possible here because radix-ui will steal focus from the editor when it opens the portal
      // radix-ui also requires a trigger/anchor, which is why we use tippy
      render: () => {
        type GetReferenceClientRect = () => DOMRect
        let component: ReactRenderer<any, any> | undefined
        let popup: Instance<Props>[]

        return {
          onStart: (props) => {
            component = new ReactRenderer(MentionDropdown, {
              props,
              editor: props.editor
            })
            if (!props.clientRect) return

            popup = tippy('body', {
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
            popup?.[0]?.setProps({
              getReferenceClientRect: props.clientRect as GetReferenceClientRect
            })
          },

          onKeyDown(props) {
            if (props.event.key === 'Escape') {
              popup?.[0]?.hide()
              return true
            }
            return component?.ref?.onKeyDown(props)
          },

          onExit() {
            popup?.[0]?.destroy()
            component?.destroy()
          }
        }
      }
    }
  }
  return config
}
