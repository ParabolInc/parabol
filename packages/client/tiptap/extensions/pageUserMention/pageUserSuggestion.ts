import type {Editor} from '@tiptap/core'
import type {MentionOptions} from '@tiptap/extension-mention'
import {PluginKey} from '@tiptap/pm/state'
import stringScore from 'string-score'
import MentionDropdown from '../../../components/MentionDropdown'
import renderSuggestion from '../renderSuggestion'
import {fetchAllOrgUsers} from './fetchAllOrgUsers'
import type {PageUserMentionOptions} from './PageUserMention'

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

    const allUsers = await fetchAllOrgUsers(atmosphere)
    if (allUsers.size === 0) return []

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
