jest.mock('../../../tiptap/extensions/table/Table', () => ({
  Table: {name: 'table', configure: () => ({name: 'table'})}
}))
jest.mock('../../../tiptap/extensions/imageBlock/ImageBlock', () => ({
  __esModule: true,
  default: {name: 'imageBlock', configure: () => ({name: 'imageBlock'})}
}))
jest.mock('../../../tiptap/extensions/fileUpload/FileUpload', () => ({
  FileUpload: {name: 'fileUpload', configure: () => ({name: 'fileUpload'})}
}))
jest.mock('../../../tiptap/extensions/fileBlock/FileBlock', () => ({
  __esModule: true,
  default: {name: 'fileBlock'}
}))

import type Atmosphere from '../../../Atmosphere'
import {slashCommands} from '../../../tiptap/extensions/slashCommand/slashCommands'
import {
  BLOCKED_STANDUP_SLASH_COMMANDS,
  STANDUP_SLASH_COMMANDS,
  standupBlockExtensions
} from '../standupEditorExtensions'

test('every slash command catalogue title has a stand-up policy entry', () => {
  const allTitles = slashCommands.flatMap((group) => group.commands.map((command) => command.title))
  for (const title of allTitles) {
    expect(Object.hasOwn(STANDUP_SLASH_COMMANDS, title)).toBe(true)
  }
})

test('exactly the ruled-out titles are blocked', () => {
  expect(new Set(BLOCKED_STANDUP_SLASH_COMMANDS)).toEqual(
    new Set(['Table of contents', 'Link to page', 'Create page', 'Database', 'Insights'])
  )
})

test('standupBlockExtensions registers the stand-up block nodes and excludes page-only nodes', () => {
  const extensionNames = standupBlockExtensions({
    teamId: 't1',
    atmosphere: {} as Atmosphere,
    commit: jest.fn(),
    editorWidth: 568
  }).map((extension) => extension.name)

  expect(extensionNames).toEqual(
    expect.arrayContaining([
      'taskList',
      'taskItem',
      'textStyleKit',
      'highlight',
      'details',
      'detailsSummary',
      'detailsContent',
      'table',
      'tableRow',
      'tableHeader',
      'tableCell',
      'focus',
      'imageBlock',
      'fileBlock',
      'fileUpload'
    ])
  )
  expect(extensionNames).not.toEqual(
    expect.arrayContaining(['tableOfContents', 'pageLinkBlock', 'insightsBlock', 'database'])
  )
})
