import type {Extensions} from '@tiptap/core'
import {Details, DetailsContent, DetailsSummary} from '@tiptap/extension-details'
import Highlight from '@tiptap/extension-highlight'
import {TaskItem, TaskList} from '@tiptap/extension-list'
import Mention, {type MentionNodeAttrs, type MentionOptions} from '@tiptap/extension-mention'
import {Table, TableCell, TableHeader, TableRow} from '@tiptap/extension-table'
import {Markdown} from '@tiptap/markdown'
import StarterKit from '@tiptap/starter-kit'
import {LoomExtension} from '../../components/TipTapEditor/LoomExtension'
import {Database} from '../../tiptap/extensions/database/Database'
import {UniqueID} from '../../tiptap/extensions/docWithID/UniqueID'
import {ImageBlockBase} from '../../tiptap/extensions/imageBlock/ImageBlockBase'
import {PageUserMention} from '../../tiptap/extensions/pageUserMention/PageUserMention'
import {MentionTaskTag} from '../../utils/MentionTaskTag'
import {EmbedBlockBase} from './extensions/EmbedBlockBase'
import {FileBlockBase} from './extensions/FileBlockBase'
import {FileUploadBase} from './extensions/FileUploadBase'
import {InsightsBlockBase} from './extensions/InsightsBlockBase'
import {PageLinkBlockBase} from './extensions/PageLinkBlockBase'
import {PopoverMentionBase} from './extensions/PopoverMentionBase'
import {ResponseBlockBase} from './extensions/ResponseBlockBase'
import {SafeTextStyleKit} from './extensions/SafeTextStyleKit'
import {TableOfContentsBase} from './extensions/TableOfContentsBase'
import {TaskBlockBase} from './extensions/TaskBlockBase'
import {ThinkingBlockBase} from './extensions/ThinkingBlockBase'
import {isAllowedLinkHref} from './isAllowedLinkHref'
export const mentionConfig: Partial<MentionOptions<any, MentionNodeAttrs>> = {
  renderText({node}) {
    return node.attrs.label
  },
  renderHTML({options, node}) {
    return ['span', options.HTMLAttributes, `${node.attrs.label ?? node.attrs.id}`]
  }
}
export const serverTipTapExtensions: Extensions = [
  StarterKit.configure({
    link: {
      isAllowedUri: isAllowedLinkHref
    }
  }),
  Details.configure({
    persist: true
  }),
  DetailsSummary,
  DetailsContent,
  Table,
  TableRow,
  TableHeader,
  TableCell,
  SafeTextStyleKit,
  Highlight,
  TaskList,
  TaskItem.configure({
    nested: true
  }),
  EmbedBlockBase,
  FileBlockBase,
  FileUploadBase,
  ImageBlockBase,
  LoomExtension,
  Mention.configure(mentionConfig),
  MentionTaskTag,
  PageUserMention,
  InsightsBlockBase,
  PopoverMentionBase,
  UniqueID,
  PageLinkBlockBase,
  TableOfContentsBase,
  Database,
  TaskBlockBase,
  ThinkingBlockBase,
  ResponseBlockBase,
  Markdown
]
