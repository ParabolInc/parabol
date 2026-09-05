import type {Extensions} from '@tiptap/core'
import {Details, DetailsContent, DetailsSummary} from '@tiptap/extension-details'
import Highlight from '@tiptap/extension-highlight'
import {TaskItem, TaskList} from '@tiptap/extension-list'
import {TableRow} from '@tiptap/extension-table'
import {TextStyleKit} from '@tiptap/extension-text-style'
import {Focus} from '@tiptap/extensions'
import type Atmosphere from '../../Atmosphere'
import type {useUploadUserAsset} from '../../mutations/useUploadUserAsset'
import FileBlock from '../../tiptap/extensions/fileBlock/FileBlock'
import {FileUpload} from '../../tiptap/extensions/fileUpload/FileUpload'
import ImageBlock from '../../tiptap/extensions/imageBlock/ImageBlock'
import type {CommandTitle} from '../../tiptap/extensions/slashCommand/slashCommands'
import {Table} from '../../tiptap/extensions/table/Table'
import {TableCell} from '../../tiptap/extensions/table/TableCell'
import {TableHeader} from '../../tiptap/extensions/table/TableHeader'

export const STANDUP_SLASH_COMMANDS: Record<CommandTitle, boolean> = {
  Text: true,
  'To-do list': true,
  'Heading 1': true,
  'Heading 2': true,
  'Heading 3': true,
  'Bullet list': true,
  'Numbered list': true,
  Quote: true,
  Code: true,
  'Table of contents': false,
  Details: true,
  Table: true,
  Divider: true,
  'Link to page': false,
  'Create page': false,
  Database: false,
  Insights: false,
  Image: true,
  File: true
}

export const BLOCKED_STANDUP_SLASH_COMMANDS = (
  Object.keys(STANDUP_SLASH_COMMANDS) as CommandTitle[]
).filter((title) => !STANDUP_SLASH_COMMANDS[title])

interface BlockExtensionOptions {
  teamId?: string
  atmosphere: Atmosphere
  commit: ReturnType<typeof useUploadUserAsset>[0]
  editorWidth: number
}

export const standupBlockExtensions = ({
  teamId,
  atmosphere,
  commit,
  editorWidth
}: BlockExtensionOptions): Extensions => [
  TaskList,
  TaskItem.configure({nested: true}),
  TextStyleKit,
  Highlight,
  Details.configure({
    persist: true,
    HTMLAttributes: {class: 'details'}
  }),
  DetailsSummary,
  DetailsContent,
  Table.configure({allowTableNodeSelection: true}),
  TableRow,
  TableHeader,
  TableCell,
  Focus,
  ImageBlock.configure({editorWidth, editorHeight: 88}),
  FileBlock,
  FileUpload.configure({
    scopeKey: teamId ?? '',
    assetScope: 'Team',
    atmosphere,
    highestTier: 'starter',
    commit
  })
]
