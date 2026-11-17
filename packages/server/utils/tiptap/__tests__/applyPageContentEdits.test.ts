import {TiptapTransformer} from '@hocuspocus/transformer'
import type {JSONContent} from '@tiptap/core'
import {GraphQLError} from 'graphql'
import * as Y from 'yjs'
import {serverTipTapExtensions} from '../../../../client/shared/tiptap/serverTipTapExtensions'
import {tipTapToMarkdown} from '../../../../client/shared/tiptap/tipTapToMarkdown'
import type {PageContentEditInput} from '../../../graphql/public/resolverTypes'
import {
  applyPageContentEdits as applyEdits,
  validatePageContentEdits
} from '../applyPageContentEdits'

const text = (value: string, marks?: JSONContent['marks']): JSONContent => ({
  type: 'text',
  text: value,
  ...(marks ? {marks} : {})
})
const paragraph = (...content: JSONContent[]): JSONContent => ({type: 'paragraph', content})
const heading = (value: string): JSONContent => ({
  type: 'heading',
  attrs: {level: 1},
  content: [text(value)]
})

const makeDoc = (...blocks: JSONContent[]) =>
  TiptapTransformer.toYdoc({type: 'doc', content: blocks}, 'default', serverTipTapExtensions)

const markdownOf = (doc: Y.Doc) =>
  tipTapToMarkdown(TiptapTransformer.fromYdoc(doc, 'default') as JSONContent)

const applyPageContentEdits = (
  doc: Y.Doc,
  edits: PageContentEditInput[],
  canChangePageLinks = true
) => {
  try {
    applyEdits(doc, edits, {canChangePageLinks})
    return null
  } catch (e) {
    if (!(e instanceof GraphQLError)) throw e
    return {code: e.extensions.code, message: e.message}
  }
}

const blocksOf = (doc: Y.Doc) => doc.getXmlFragment('default').toArray()

const makePage = () =>
  makeDoc(
    heading('Plan'),
    paragraph(text('First paragraph')),
    paragraph(text('Second paragraph')),
    paragraph(text('Third paragraph'))
  )

describe('applyPageContentEdits', () => {
  test('separates top-level blocks with a blank line', () => {
    expect(markdownOf(makePage())).toBe(
      '# Plan\n\nFirst paragraph\n\nSecond paragraph\n\nThird paragraph'
    )
  })

  test('rewrites only the block an edit touches', () => {
    const doc = makePage()
    const [title, first, , third] = blocksOf(doc)
    const error = applyPageContentEdits(doc, [{oldText: 'Second', newText: '**Next**'}])
    expect(error).toBeNull()
    expect(markdownOf(doc)).toBe(
      '# Plan\n\nFirst paragraph\n\n**Next** paragraph\n\nThird paragraph'
    )
    const after = blocksOf(doc)
    expect(after[0]).toBe(title)
    expect(after[1]).toBe(first)
    expect(after[3]).toBe(third)
  })

  test('inserts blocks after an anchor and keeps the anchor block', () => {
    const doc = makePage()
    const [, first] = blocksOf(doc)
    const error = applyPageContentEdits(doc, [
      {oldText: 'First paragraph', newText: 'First paragraph\n\n- one\n- two'}
    ])
    expect(error).toBeNull()
    expect(markdownOf(doc)).toBe(
      '# Plan\n\nFirst paragraph\n\n- one\n- two\n\nSecond paragraph\n\nThird paragraph'
    )
    expect(blocksOf(doc)[1]).toBe(first)
  })

  test('deletes a block, including the separator in oldText', () => {
    const doc = makePage()
    const error = applyPageContentEdits(doc, [{oldText: '\n\nSecond paragraph', newText: ''}])
    expect(error).toBeNull()
    expect(markdownOf(doc)).toBe('# Plan\n\nFirst paragraph\n\nThird paragraph')
  })

  test('an edit spanning blocks keeps the blocks it leaves unchanged', () => {
    const doc = makePage()
    const [, first, second] = blocksOf(doc)
    const error = applyPageContentEdits(doc, [
      {
        oldText: 'First paragraph\n\nSecond paragraph\n\nThird',
        newText: 'First paragraph\n\nSecond paragraph\n\nLast'
      }
    ])
    expect(error).toBeNull()
    expect(markdownOf(doc)).toBe('# Plan\n\nFirst paragraph\n\nSecond paragraph\n\nLast paragraph')
    expect(blocksOf(doc)[1]).toBe(first)
    expect(blocksOf(doc)[2]).toBe(second)
  })

  test('applies edits in order', () => {
    const doc = makePage()
    const error = applyPageContentEdits(doc, [
      {oldText: 'First', newText: 'Opening'},
      {oldText: 'Opening paragraph', newText: 'Opening line'}
    ])
    expect(error).toBeNull()
    expect(markdownOf(doc)).toContain('Opening line\n\nSecond paragraph')
  })

  test('applies nothing when a later edit fails', () => {
    const doc = makePage()
    const before = markdownOf(doc)
    const error = applyPageContentEdits(doc, [
      {oldText: 'First', newText: 'Opening'},
      {oldText: 'Missing', newText: 'Anything'}
    ])
    expect(error).toEqual({
      code: 'CONFLICT',
      message: 'Edit 2: oldText was not found in the page. Read the page content again and retry'
    })
    expect(markdownOf(doc)).toBe(before)
  })

  test('refuses an oldText that appears more than once unless replaceAll is set', () => {
    const doc = makePage()
    expect(applyPageContentEdits(doc, [{oldText: 'paragraph', newText: 'line'}])?.code).toBe(
      'BAD_USER_INPUT'
    )
    const [title] = blocksOf(doc)
    expect(
      applyPageContentEdits(doc, [{oldText: 'paragraph', newText: 'line', replaceAll: true}])
    ).toBeNull()
    expect(markdownOf(doc)).toBe('# Plan\n\nFirst line\n\nSecond line\n\nThird line')
    expect(blocksOf(doc)[0]).toBe(title)
  })

  test('refuses an empty oldText', () => {
    expect(applyPageContentEdits(makePage(), [{oldText: '', newText: 'x'}])?.code).toBe(
      'BAD_USER_INPUT'
    )
  })

  test('keeps replacement patterns in newText literal', () => {
    const doc = makePage()
    expect(applyPageContentEdits(doc, [{oldText: 'Third', newText: "Costs $1 and $'"}])).toBeNull()
    expect(markdownOf(doc)).toContain("Costs $1 and $' paragraph")
  })

  test('refuses to rewrite a block that Markdown cannot represent', () => {
    const doc = makeDoc(
      heading('Plan'),
      paragraph(text('Red text', [{type: 'textStyle', attrs: {color: '#ff0000'}}]))
    )
    const before = Y.encodeStateAsUpdate(doc)
    const error = applyPageContentEdits(doc, [{oldText: 'Red text', newText: 'Blue text'}])
    expect(error?.code).toBe('BAD_USER_INPUT')
    expect(error?.message).toContain('a paragraph block')
    expect(Y.encodeStateAsUpdate(doc)).toEqual(before)
  })

  test('deletes a block that Markdown cannot represent', () => {
    const doc = makeDoc(
      heading('Plan'),
      paragraph(text('Red text', [{type: 'textStyle', attrs: {color: '#ff0000'}}]))
    )
    expect(applyPageContentEdits(doc, [{oldText: '\n\nRed text', newText: ''}])).toBeNull()
    expect(markdownOf(doc)).toBe('# Plan')
  })

  test('keeps an unrepresentable block that an edit spans without changing', () => {
    const doc = makeDoc(
      heading('Plan'),
      paragraph(text('Red text', [{type: 'textStyle', attrs: {color: '#ff0000'}}])),
      paragraph(text('Plain text'))
    )
    const [, red] = blocksOf(doc)
    expect(
      applyPageContentEdits(doc, [{oldText: 'Red text\n\nPlain', newText: 'Red text\n\nSimple'}])
    ).toBeNull()
    expect(blocksOf(doc)[1]).toBe(red)
    expect(markdownOf(doc)).toBe('# Plan\n\nRed text\n\nSimple text')
  })

  test('refuses to remove the title heading', () => {
    expect(applyPageContentEdits(makePage(), [{oldText: '# Plan\n\n', newText: ''}])?.code).toBe(
      'BAD_USER_INPUT'
    )
    expect(
      applyPageContentEdits(makePage(), [{oldText: '# Plan', newText: 'Intro\n\n# Plan'}])?.code
    ).toBe('BAD_USER_INPUT')
  })

  test('keeps a block that serializes to nothing next to a deleted block', () => {
    const doc = makeDoc(
      heading('Plan'),
      paragraph(text('One')),
      {type: 'tableOfContents'},
      paragraph(text('Two'))
    )
    expect(applyPageContentEdits(doc, [{oldText: '\n\nTwo', newText: ''}])).toBeNull()
    expect(blocksOf(doc).map((block) => (block as Y.XmlElement).nodeName)).toEqual([
      'heading',
      'paragraph',
      'tableOfContents'
    ])
  })

  test('refuses an edit that would remove a block that serializes to nothing', () => {
    const doc = makeDoc(
      heading('Plan'),
      paragraph(text('One')),
      {type: 'tableOfContents'},
      paragraph(text('Two'))
    )
    expect(
      applyPageContentEdits(doc, [{oldText: 'One\n\n\n\nTwo', newText: 'One\n\nTwo'}])?.code
    ).toBe('BAD_USER_INPUT')
  })

  test('keeps adjacent lists apart when editing one of them', () => {
    const list = (value: string): JSONContent => ({
      type: 'bulletList',
      content: [{type: 'listItem', content: [paragraph(text(value))]}]
    })
    const doc = makeDoc(heading('Plan'), list('a'), list('b'))
    const [, , second] = blocksOf(doc)
    expect(applyPageContentEdits(doc, [{oldText: '- a', newText: '- A'}])).toBeNull()
    expect(blocksOf(doc)).toHaveLength(3)
    expect(blocksOf(doc)[2]).toBe(second)
  })

  test('refuses to rewrite adjacent lists into one', () => {
    const list = (value: string): JSONContent => ({
      type: 'bulletList',
      content: [{type: 'listItem', content: [paragraph(text(value))]}]
    })
    const doc = makeDoc(heading('Plan'), list('a'), list('b'))
    expect(applyPageContentEdits(doc, [{oldText: '- a\n\n- b', newText: '- A\n\n- B'}])?.code).toBe(
      'BAD_USER_INPUT'
    )
  })

  test('replaceAll leaves blocks between its matches alone', () => {
    const doc = makeDoc(
      heading('Plan'),
      paragraph(text('Ship it')),
      paragraph(text('Red', [{type: 'textStyle', attrs: {color: '#ff0000'}}])),
      paragraph(text('Ship again'))
    )
    const [, , red] = blocksOf(doc)
    expect(
      applyPageContentEdits(doc, [{oldText: 'Ship', newText: 'Launch', replaceAll: true}])
    ).toBeNull()
    expect(markdownOf(doc)).toBe('# Plan\n\nLaunch it\n\nRed\n\nLaunch again')
    expect(blocksOf(doc)[2]).toBe(red)
  })

  test('inserts blocks when oldText covers only a separator', () => {
    const doc = makeDoc(heading('Plan'), paragraph(text('One')), paragraph(text('Two')))
    expect(
      applyPageContentEdits(doc, [{oldText: 'One\n\n', newText: 'One\n\nMiddle\n\n'}])
    ).toBeNull()
    expect(markdownOf(doc)).toBe('# Plan\n\nOne\n\nMiddle\n\nTwo')
  })

  test('refuses edits that grow the page past the limit', () => {
    const doc = makeDoc(heading('Plan'), paragraph(text('a')))
    const grow = {oldText: 'a', newText: 'a'.repeat(1000), replaceAll: true}
    expect(applyPageContentEdits(doc, [grow, grow])?.code).toBe('BAD_USER_INPUT')
    expect(markdownOf(doc)).toBe('# Plan\n\na')
  })

  test('refuses edits that change too many places at once', () => {
    const doc = makeDoc(
      heading('Plan'),
      ...Array.from({length: 501}, (_, idx) => paragraph(text(`Step ${idx}`)))
    )
    expect(
      applyPageContentEdits(doc, [{oldText: 'Step', newText: 'Stage', replaceAll: true}])?.code
    ).toBe('BAD_USER_INPUT')
  })

  test('a token limited to specific pages cannot add or remove sub-page links', () => {
    const pageLink = {
      type: 'pageLinkBlock',
      attrs: {pageCode: 42, title: 'Runbook', canonical: true}
    }
    const doc = makeDoc(heading('Plan'), paragraph(text('Intro')), pageLink)
    const pageLinkMarkdown = markdownOf(makeDoc(pageLink))
    expect(
      applyPageContentEdits(doc, [{oldText: `\n\n${pageLinkMarkdown}`, newText: ''}], false)?.code
    ).toBe('FORBIDDEN')
    expect(applyPageContentEdits(doc, [{oldText: 'Intro', newText: 'Overview'}], false)).toBeNull()
  })

  test('page markdown is the blocks serialized one at a time', () => {
    const doc = makeDoc(
      heading('Plan'),
      {type: 'paragraph'},
      {type: 'tableOfContents'},
      paragraph(text('Tom & Jerry')),
      {type: 'codeBlock', attrs: {language: 'ts'}, content: [text('a\n\nb')]}
    )
    expect(applyPageContentEdits(doc, [{oldText: 'Jerry', newText: 'Spike'}])).toBeNull()
    expect(markdownOf(doc)).toContain('Tom &amp; Spike')
    expect(applyPageContentEdits(doc, [{oldText: 'a\n\nb', newText: 'a\nb'}])).toBeNull()
    expect(markdownOf(doc)).toContain('```ts\na\nb\n```')
  })

  test('writes nothing when the edits change nothing', () => {
    const doc = makePage()
    const before = Y.encodeStateAsUpdate(doc)
    expect(applyPageContentEdits(doc, [{oldText: 'Second', newText: 'Second'}])).toBeNull()
    expect(Y.encodeStateAsUpdate(doc)).toEqual(before)
  })

  test('a concurrent edit to another block survives the patch', () => {
    const serverDoc = makePage()
    const clientDoc = new Y.Doc()
    Y.applyUpdate(clientDoc, Y.encodeStateAsUpdate(serverDoc))
    const clientThird = clientDoc.getXmlFragment('default').get(3) as Y.XmlElement
    ;(clientThird.get(0) as Y.XmlText).insert(0, 'Edited ')
    expect(applyPageContentEdits(serverDoc, [{oldText: 'First', newText: 'Opening'}])).toBeNull()
    Y.applyUpdate(serverDoc, Y.encodeStateAsUpdate(clientDoc))
    Y.applyUpdate(clientDoc, Y.encodeStateAsUpdate(serverDoc))
    const expected = '# Plan\n\nOpening paragraph\n\nSecond paragraph\n\nEdited Third paragraph'
    expect(markdownOf(serverDoc)).toBe(expected)
    expect(markdownOf(clientDoc)).toBe(expected)
  })

  test('keeps custom blocks that round-trip through Markdown', () => {
    const doc = makeDoc(heading('Plan'), paragraph(text('Intro')), {
      type: 'pageLinkBlock',
      attrs: {pageCode: 42, title: 'Runbook', canonical: true}
    })
    const [, , pageLink] = blocksOf(doc)
    expect(applyPageContentEdits(doc, [{oldText: 'Intro', newText: 'Overview'}])).toBeNull()
    expect(blocksOf(doc)[2]).toBe(pageLink)
  })
})

describe('validatePageContentEdits', () => {
  const edit = {oldText: 'a', newText: 'b'}
  const codeOf = (edits: PageContentEditInput[]) => {
    try {
      validatePageContentEdits(edits)
      return null
    } catch (e) {
      return e instanceof GraphQLError ? e.extensions.code : e
    }
  }

  test('accepts between 1 and 20 edits', () => {
    expect(codeOf([edit])).toBeNull()
    expect(codeOf(Array(20).fill(edit))).toBeNull()
    expect(codeOf([])).toBe('BAD_USER_INPUT')
    expect(codeOf(Array(21).fill(edit))).toBe('BAD_USER_INPUT')
  })

  test('refuses oldText or newText over 50,000 characters', () => {
    const long = 'x'.repeat(50_001)
    expect(codeOf([{oldText: 'x'.repeat(50_000), newText: 'b'}])).toBeNull()
    expect(codeOf([{oldText: long, newText: 'b'}])).toBe('BAD_USER_INPUT')
    expect(codeOf([edit, {oldText: 'a', newText: long}])).toBe('BAD_USER_INPUT')
  })
})
