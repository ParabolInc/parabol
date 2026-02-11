import type {Editor} from '@tiptap/core'
import type {MentionOptions} from '@tiptap/extension-mention'
import {PluginKey} from '@tiptap/pm/state'
import graphql from 'babel-plugin-relay/macro'
import stringScore from 'string-score'
import type {pageUserSuggestionQuery} from '../../../__generated__/pageUserSuggestionQuery.graphql'
import MentionDropdown from '../../../components/MentionDropdown'
import renderSuggestion from '../renderSuggestion'
import type {PageUserMentionOptions} from './PageUserMention'

const queryNode = graphql`
  query pageUserSuggestionQuery {
    viewer {
      organizations {
        organizationUsers(first: 1000) {
          edges {
            node {
              user {
                id
                picture
                preferredName
              }
            }
          }
        }
      }
    }
  }
`

export const pageUserSuggestion: MentionOptions['suggestion'] = {
  allowSpaces: true,
  char: '@',
  decorationClass: 'page-user-mentioning',
  pluginKey: new PluginKey('pageUserMention'),
  items: async ({query, editor}: {query: string; editor: Editor}) => {
    const extension = editor.extensionManager.extensions.find((e) => e.name === 'pageUserMention')
    const options = extension?.options as PageUserMentionOptions
    const {atmosphere} = options
    if (!atmosphere) return []

    const res = await atmosphere.fetchQuery<pageUserSuggestionQuery>(queryNode, {
      fetchPolicy: 'store-or-network'
    })
    if (!res || res instanceof Error) return []

    const {viewer} = res
    const {organizations} = viewer
    if (!organizations) return []

    const allUsers = new Map<string, {id: string; picture?: string; preferredName: string}>()

    organizations.forEach((org: any) => {
      org?.organizationUsers?.edges.forEach((edge: any) => {
        const user = edge.node.user
        if (!allUsers.has(user.id)) {
          allUsers.set(user.id, {
            id: user.id,
            picture: user.picture,
            preferredName: user.preferredName
          })
        }
      })
    })

    return Array.from(allUsers.values())
      .map((user) => {
        const score = query ? stringScore(user.preferredName, query) : 1
        return {
          ...user,
          userId: user.id,
          score
        }
      })
      .sort((a, b) => (a.score < b.score ? 1 : -1))
      .filter((obj, _idx, arr) => obj.score > 0 && arr[0]!.score - obj.score < 0.3)
      .slice(0, 6)
  },
  render: renderSuggestion(MentionDropdown)
}
