import type {JSONContent} from '@tiptap/core'
import {escapeCdata, escapeXml} from './escapeXhtml'
import type {ExportAsset, StorageConversionCtx, StorageConversionResult} from './types'

type Census = Map<string, {count: number; treatment: string}>

type EmitState = {
  ctx: StorageConversionCtx
  assets: ExportAsset[]
  census: Census
}

const TREATMENTS = {
  mention: 'exported as plain text',
  popoverMention: 'hover document exported as its plain-text label',
  textStyle: 'text color exported as plain text',
  highlight: 'highlight exported as plain text',
  taskBlock: 'exported as static content — not a Confluence task',
  pageLinkBlock: 'linked to the Parabol page',
  fileUpload: 'in-progress upload skipped',
  database: 'exported as a static table snapshot',
  unknown: 'exported as plain text'
} as const

const TASK_STATUS_LOZENGE: Record<string, {colour: string; title: string}> = {
  done: {colour: 'Green', title: 'Done'},
  active: {colour: 'Blue', title: 'In Progress'},
  stuck: {colour: 'Red', title: 'Stuck'},
  future: {colour: 'Grey', title: 'Future'}
}

const addCensus = (state: EmitState, blockType: string, treatment: string) => {
  const entry = state.census.get(blockType)
  if (entry) {
    entry.count += 1
  } else {
    state.census.set(blockType, {count: 1, treatment})
  }
}

const getNodeText = (node: JSONContent): string => {
  if (node.text) return node.text
  return (node.content ?? []).map(getNodeText).join('')
}

export const statusMacro = (colour: string, title: string) =>
  `<ac:structured-macro ac:name="status"><ac:parameter ac:name="colour">${escapeXml(colour)}</ac:parameter><ac:parameter ac:name="title">${escapeXml(title)}</ac:parameter></ac:structured-macro>`

const lastPathSegment = (url: string) => {
  const withoutQuery = url.split(/[?#]/)[0]!
  const segment = withoutQuery.split('/').pop() ?? ''
  return decodeURIComponent(segment)
}

const isAppAsset = (state: EmitState, src: string) =>
  src.startsWith(`${state.ctx.appOrigin}/assets/`) || src.startsWith('/assets/')

const claimAssetFilename = (state: EmitState, srcUrl: string, preferredName?: string | null) => {
  const hashName = lastPathSegment(srcUrl)
  const wanted = preferredName || hashName
  const collision = state.assets.find((a) => a.filename === wanted && a.srcUrl !== srcUrl)
  const filename = collision ? hashName : wanted
  if (!state.assets.some((a) => a.srcUrl === srcUrl && a.filename === filename)) {
    state.assets.push({srcUrl, filename})
  }
  return filename
}

const MARK_TAGS: Record<string, [string, string]> = {
  bold: ['<strong>', '</strong>'],
  italic: ['<em>', '</em>'],
  underline: ['<u>', '</u>'],
  strike: ['<s>', '</s>'],
  code: ['<code>', '</code>']
}

const emitText = (node: JSONContent, state: EmitState): string => {
  let out = escapeXml(node.text ?? '')
  const marks = node.marks ?? []
  for (let i = marks.length - 1; i >= 0; i--) {
    const mark = marks[i]!
    const {type, attrs} = mark
    if (type === 'link') {
      const href = escapeXml(String(attrs?.href ?? ''))
      out = `<a href="${href}">${out}</a>`
    } else if (MARK_TAGS[type]) {
      const [open, close] = MARK_TAGS[type]!
      out = `${open}${out}${close}`
    } else if (type === 'textStyle') {
      if (attrs?.color) addCensus(state, 'textStyle', TREATMENTS.textStyle)
    } else if (type === 'highlight') {
      addCensus(state, 'highlight', TREATMENTS.highlight)
    }
    // any other mark: keep the text, drop the styling
  }
  return out
}

const emitInline = (node: JSONContent, state: EmitState): string => {
  const {type, attrs} = node
  switch (type) {
    case 'text':
      return emitText(node, state)
    case 'hardBreak':
      return '<br />'
    case 'mention':
    case 'pageUserMention':
      addCensus(state, 'mention', TREATMENTS.mention)
      return escapeXml(`@${attrs?.label ?? attrs?.id ?? ''}`)
    case 'taskTag':
      return escapeXml(`#${attrs?.id ?? ''}`)
    case 'popoverMention':
      addCensus(state, 'popoverMention', TREATMENTS.popoverMention)
      return escapeXml(String(attrs?.label ?? ''))
    default: {
      if (node.text) return emitText(node, state)
      if (node.content) return emitInlineContent(node.content, state)
      addCensus(state, `unknown:${type}`, TREATMENTS.unknown)
      return ''
    }
  }
}

const emitInlineContent = (content: JSONContent[] | undefined, state: EmitState): string =>
  (content ?? []).map((node) => emitInline(node, state)).join('')

const emitBlocks = (content: JSONContent[] | undefined, state: EmitState): string =>
  (content ?? []).map((node) => emitBlock(node, state)).join('')

const parseNestedDoc = (raw: unknown): JSONContent | null => {
  if (typeof raw !== 'string' || !raw) return null
  try {
    const doc = JSON.parse(raw) as JSONContent
    return doc && typeof doc === 'object' ? doc : null
  } catch {
    return null
  }
}

const emitTaskItem = (node: JSONContent, state: EmitState): string => {
  const status = node.attrs?.checked ? 'complete' : 'incomplete'
  const children = node.content ?? []
  const inlineParts: string[] = []
  const nestedLists: string[] = []
  children.forEach((child) => {
    if (child.type === 'paragraph') {
      inlineParts.push(emitInlineContent(child.content, state))
    } else if (child.type === 'taskList') {
      nestedLists.push(emitBlock(child, state))
    } else {
      inlineParts.push(escapeXml(getNodeText(child)))
    }
  })
  return `<ac:task><ac:task-status>${status}</ac:task-status><ac:task-body>${inlineParts.join(' ')}${nestedLists.join('')}</ac:task-body></ac:task>`
}

const emitCell = (node: JSONContent, state: EmitState): string => {
  const tag = node.type === 'tableHeader' ? 'th' : 'td'
  const colspan = Number(node.attrs?.colspan ?? 1)
  const rowspan = Number(node.attrs?.rowspan ?? 1)
  const attrs = `${colspan > 1 ? ` colspan="${colspan}"` : ''}${rowspan > 1 ? ` rowspan="${rowspan}"` : ''}`
  return `<${tag}${attrs}>${emitBlocks(node.content, state)}</${tag}>`
}

const emitImage = (node: JSONContent, state: EmitState): string => {
  const {attrs} = node
  const src = String(attrs?.src ?? '')
  if (!src) return ''
  const align = attrs?.align ? ` ac:align="${escapeXml(String(attrs.align))}"` : ''
  const width = attrs?.width ? ` ac:width="${escapeXml(String(attrs.width))}"` : ''
  const alt = attrs?.alt ? ` ac:alt="${escapeXml(String(attrs.alt))}"` : ''
  if (isAppAsset(state, src)) {
    const filename = claimAssetFilename(state, src)
    return `<ac:image${align}${width}${alt}><ri:attachment ri:filename="${escapeXml(filename)}" /></ac:image>`
  }
  return `<ac:image${align}${width}${alt}><ri:url ri:value="${escapeXml(src)}" /></ac:image>`
}

const emitFile = (node: JSONContent, state: EmitState): string => {
  const {attrs} = node
  const src = String(attrs?.src ?? '')
  if (!src) return ''
  if (isAppAsset(state, src)) {
    const filename = claimAssetFilename(state, src, attrs?.name ? String(attrs.name) : null)
    return `<ac:structured-macro ac:name="view-file"><ac:parameter ac:name="name"><ri:attachment ri:filename="${escapeXml(filename)}" /></ac:parameter></ac:structured-macro>`
  }
  const name = escapeXml(String(attrs?.name ?? src))
  return `<p><a href="${escapeXml(src)}">${name}</a></p>`
}

const emitPageLink = (node: JSONContent, state: EmitState): string => {
  const {attrs} = node
  const pageCode = Number(attrs?.pageCode)
  const title = String(attrs?.title ?? 'Untitled page')
  const resolved = Number.isFinite(pageCode) ? state.ctx.resolvePageLink?.(pageCode) : null
  if (resolved?.confluenceTitle) {
    return `<p><ac:link><ri:page ri:content-title="${escapeXml(resolved.confluenceTitle)}" /><ac:plain-text-link-body><![CDATA[${escapeCdata(title)}]]></ac:plain-text-link-body></ac:link></p>`
  }
  addCensus(state, 'pageLinkBlock', TREATMENTS.pageLinkBlock)
  const href =
    resolved?.href ?? `${state.ctx.appOrigin}/pages/${Number.isFinite(pageCode) ? pageCode : ''}`
  return `<p><a href="${escapeXml(href)}">${escapeXml(title)}</a></p>`
}

const emitTaskBlock = (node: JSONContent, state: EmitState): string => {
  addCensus(state, 'taskBlock', TREATMENTS.taskBlock)
  const {attrs} = node
  const status = String(attrs?.status ?? '')
  const lozenge = TASK_STATUS_LOZENGE[status] ?? {colour: 'Grey', title: status || 'Task'}
  const owner = attrs?.preferredName
    ? ` <strong>${escapeXml(String(attrs.preferredName))}</strong>`
    : ''
  const nested = parseNestedDoc(attrs?.content)
  const body = nested ? emitBlocks(nested.content, state) : ''
  return `<p>${statusMacro(lozenge.colour, lozenge.title)}${owner}</p>${body}`
}

const emitBlock = (node: JSONContent, state: EmitState): string => {
  const {type, attrs} = node
  switch (type) {
    case 'paragraph': {
      const inline = emitInlineContent(node.content, state)
      return inline ? `<p>${inline}</p>` : '<p />'
    }
    case 'heading': {
      const level = Math.min(Math.max(Number(attrs?.level ?? 1), 1), 6)
      return `<h${level}>${emitInlineContent(node.content, state)}</h${level}>`
    }
    case 'bulletList':
      return `<ul>${emitBlocks(node.content, state)}</ul>`
    case 'orderedList':
      return `<ol>${emitBlocks(node.content, state)}</ol>`
    case 'listItem':
      return `<li>${emitBlocks(node.content, state)}</li>`
    case 'taskList':
      return `<ac:task-list>${(node.content ?? []).map((item) => emitTaskItem(item, state)).join('')}</ac:task-list>`
    case 'blockquote':
      return `<blockquote>${emitBlocks(node.content, state)}</blockquote>`
    case 'codeBlock': {
      const language = attrs?.language
        ? `<ac:parameter ac:name="language">${escapeXml(String(attrs.language))}</ac:parameter>`
        : ''
      return `<ac:structured-macro ac:name="code">${language}<ac:plain-text-body><![CDATA[${escapeCdata(getNodeText(node))}]]></ac:plain-text-body></ac:structured-macro>`
    }
    case 'horizontalRule':
      return '<hr />'
    case 'table':
      return `<table><tbody>${emitBlocks(node.content, state)}</tbody></table>`
    case 'tableRow':
      return `<tr>${(node.content ?? []).map((cell) => emitCell(cell, state)).join('')}</tr>`
    case 'details': {
      const summary = node.content?.find((child) => child.type === 'detailsSummary')
      const body = node.content?.find((child) => child.type === 'detailsContent')
      const title = summary
        ? `<ac:parameter ac:name="title">${escapeXml(getNodeText(summary))}</ac:parameter>`
        : ''
      return `<ac:structured-macro ac:name="expand">${title}<ac:rich-text-body>${emitBlocks(body?.content, state)}</ac:rich-text-body></ac:structured-macro>`
    }
    case 'imageBlock':
      return emitImage(node, state)
    case 'fileBlock':
      return emitFile(node, state)
    case 'loom': {
      const src = escapeXml(String(attrs?.src ?? ''))
      return src ? `<p><a href="${src}" data-card-appearance="embed">${src}</a></p>` : ''
    }
    case 'pageLinkBlock':
      return emitPageLink(node, state)
    case 'insightsBlock': {
      const title = attrs?.title
        ? `<ac:parameter ac:name="title">${escapeXml(String(attrs.title))}</ac:parameter>`
        : ''
      return `<ac:structured-macro ac:name="info">${title}<ac:rich-text-body>${emitBlocks(node.content, state)}</ac:rich-text-body></ac:structured-macro>`
    }
    case 'taskBlock':
      return emitTaskBlock(node, state)
    case 'responseBlock': {
      const author = attrs?.preferredName
        ? `<h3>${escapeXml(String(attrs.preferredName))}</h3>`
        : ''
      const nested = parseNestedDoc(attrs?.content)
      return `${author}${nested ? emitBlocks(nested.content, state) : ''}`
    }
    case 'thinkingBlock':
      return ''
    case 'fileUpload':
      addCensus(state, 'fileUpload', TREATMENTS.fileUpload)
      return ''
    default: {
      if (node.content) {
        addCensus(state, `unknown:${type}`, TREATMENTS.unknown)
        return emitBlocks(node.content, state)
      }
      const text = getNodeText(node)
      addCensus(state, `unknown:${type}`, TREATMENTS.unknown)
      return text ? `<p>${escapeXml(text)}</p>` : ''
    }
  }
}

export const convertTipTapToConfluenceStorage = (
  doc: JSONContent,
  ctx: StorageConversionCtx
): StorageConversionResult => {
  const state: EmitState = {ctx, assets: [], census: new Map()}
  const content = doc.content ?? []
  const titleNode = content[0]
  const title = titleNode ? getNodeText(titleNode).trim() : ''
  const body = content
    .slice(1)
    .map((node) => emitBlock(node, state))
    .join('')
  const footer = `<p><em>Exported from Parabol · <a href="${escapeXml(ctx.parabolPageUrl)}">Open the live page</a></em></p>`
  const degraded = [...state.census.entries()]
    .map(([blockType, {count, treatment}]) => ({blockType, count, treatment}))
    .sort((a, b) => a.blockType.localeCompare(b.blockType))
  return {title, xhtml: `${body}${footer}`, assets: state.assets, degraded}
}
