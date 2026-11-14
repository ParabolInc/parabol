import type {CommandTitle} from './slashCommands'

const PAGE_SLASH_COMMANDS: Record<CommandTitle, boolean> = {
  Text: true,
  'To-do list': true,
  'Heading 1': true,
  'Heading 2': true,
  'Heading 3': true,
  'Bullet list': true,
  'Numbered list': true,
  Quote: true,
  Callout: true,
  Code: true,
  'Table of contents': true,
  Details: true,
  Table: true,
  Divider: true,
  Embed: true,
  'Link to page': true,
  'Create page': true,
  'Synced block': false,
  Database: false,
  Insights: true,
  Image: true,
  File: true
}

export const getPageSlashCommands = (options: {
  hasDatabases: boolean
  hasSyncedBlocks: boolean
  nested: boolean
}): Record<CommandTitle, boolean> => {
  const {hasDatabases, hasSyncedBlocks, nested} = options
  return {
    ...PAGE_SLASH_COMMANDS,
    'Create page': !nested,
    'Synced block': hasSyncedBlocks && !nested,
    Database: hasDatabases && !nested
  }
}
