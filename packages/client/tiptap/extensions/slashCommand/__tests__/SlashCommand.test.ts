import {Editor, type Extensions} from '@tiptap/core'
import {Plugin} from '@tiptap/pm/state'
import StarterKit from '@tiptap/starter-kit'
import type {SuggestionOptions} from '@tiptap/suggestion'
import {EmbedBlock} from '../../embedBlock/EmbedBlock'
import {TableOfContents} from '../../tableOfContents/TableOfContents'
import {SlashCommand} from '../SlashCommand'
import type {SlashCommandGroup} from '../slashCommands'

const suggestionOptions: {current: SuggestionOptions<SlashCommandGroup> | null} = {current: null}

jest.mock('@tiptap/suggestion', () => ({
  __esModule: true,
  default: (options: SuggestionOptions<SlashCommandGroup>) => {
    suggestionOptions.current = options
    return new Plugin({key: options.pluginKey})
  }
}))
jest.mock('../SlashCommandMenu', () => ({SlashCommandMenu: () => null}))
jest.mock('../../renderSuggestion', () => ({__esModule: true, default: () => () => ({})}))
jest.mock('../../embedBlock/EmbedBlockView', () => ({EmbedBlockView: () => null}))
jest.mock('../../tableOfContents/TableOfContentsView', () => ({TableOfContentsView: () => null}))

const reflectionSlashCommands = SlashCommand.configure({
  'Heading 1': false,
  'Heading 2': false,
  'To-do list': false,
  Insights: false,
  Table: false,
  Details: false,
  'Create page': false,
  Database: false
})

const getMenuTitles = async (extensions: Extensions, query: string) => {
  const editor = new Editor({
    extensions: [StarterKit, reflectionSlashCommands, ...extensions],
    content: {type: 'doc', content: [{type: 'paragraph'}]}
  })
  editor.extensionManager.plugins
  const groups = await suggestionOptions.current!.items!({
    query,
    editor,
    signal: new AbortController().signal
  })
  editor.destroy()
  return groups.flatMap((group) => group.commands.map((command) => command.title))
}

describe('SlashCommand', () => {
  it('does not offer Embed in an editor without the embed block', async () => {
    expect(await getMenuTitles([], 'embed')).not.toContain('Embed')
  })

  it('offers Embed in an editor with the embed block', async () => {
    expect(await getMenuTitles([EmbedBlock], 'embed')).toContain('Embed')
  })

  it('does not offer a table of contents in an editor without one', async () => {
    expect(await getMenuTitles([], 'toc')).not.toContain('Table of contents')
  })

  it('offers a table of contents in an editor with one', async () => {
    expect(await getMenuTitles([TableOfContents], 'toc')).toContain('Table of contents')
  })
})
