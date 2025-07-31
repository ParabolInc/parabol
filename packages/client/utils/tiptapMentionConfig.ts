import type {MentionNodeAttrs, MentionOptions} from '@tiptap/extension-mention'
import graphql from 'babel-plugin-relay/macro'
import stringScore from 'string-score'
import type {tiptapMentionConfigQuery} from '../__generated__/tiptapMentionConfigQuery.graphql'
import type Atmosphere from '../Atmosphere'
import MentionDropdown from '../components/MentionDropdown'
import {mentionConfig} from '../shared/tiptap/serverTipTapExtensions'
import renderSuggestion from '../tiptap/extensions/renderSuggestion'

const queryNode = graphql`
  query tiptapMentionConfigQuery($teamId: ID!) {
    viewer {
      team(teamId: $teamId) {
        teamMembers {
          user {
            id
            picture
            preferredName
          }
        }
      }
    }
  }
`

export const tiptapMentionConfig = (
  atmosphere: Atmosphere,
  teamId: string
): Partial<MentionOptions<any, MentionNodeAttrs>> => ({
  ...mentionConfig,
  suggestion: {
    // some users have first & last name
    allowSpaces: true,
    decorationClass: 'mention',
    items: async ({query}) => {
      const res = await atmosphere.fetchQuery<tiptapMentionConfigQuery>(queryNode, {teamId})
      if (!res || res instanceof Error) return []
      const {viewer} = res
      const {team} = viewer
      const {teamMembers} = team!
      return (
        teamMembers
          .map((teamMember) => {
            const {user} = teamMember
            const {id, picture, preferredName} = user
            const score = query ? stringScore(preferredName, query) : 1
            return {
              id,
              picture,
              preferredName,
              score
            }
          })
          .sort((a, b) => (a.score < b.score ? 1 : -1))
          .slice(0, 6)
          // If you type "Foo" and the options are "Foo" and "Giraffe", remove "Giraffe"
          .filter((obj, _idx, arr) => obj.score > 0 && arr[0]!.score - obj.score < 0.3)
          .map((s) => ({
            userId: s.id,
            picture: s.picture,
            preferredName: s.preferredName
          }))
      )
    },

    // Using radix-ui isn't possible here because radix-ui will steal focus from the editor when it opens the portal
    // radix-ui also requires a trigger/anchor
    render: renderSuggestion(MentionDropdown)
  }
})
