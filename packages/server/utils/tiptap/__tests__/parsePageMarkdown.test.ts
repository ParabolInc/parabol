import {Editor} from '@tiptap/core'
import {GraphQLError} from 'graphql'
import {serverTipTapExtensions} from '../../../../client/shared/tiptap/serverTipTapExtensions'
import appOrigin from '../../../appOrigin'
import {parsePageMarkdown} from '../parsePageMarkdown'
import {validatePageDoc} from '../validatePageDoc'

const assetUrl = `${appOrigin}/assets/a.png`
const outsideUrl = 'https://x.test/a.png'

const withEditor = <T>(fn: (editor: Editor) => T) => {
  const editor = new Editor({
    element: undefined,
    content: {type: 'doc', content: [{type: 'paragraph'}]},
    extensions: serverTipTapExtensions
  })
  try {
    return fn(editor)
  } finally {
    editor.destroy()
  }
}

const catchError = (fn: () => unknown) => {
  try {
    fn()
  } catch (e) {
    return e
  }
  return null
}

describe('parsePageMarkdown', () => {
  it('returns the blocks of valid markdown', () => {
    const blocks = withEditor((editor) => parsePageMarkdown(editor, '# Title\n\nHello', new Set()))
    expect(blocks.map(({type}) => type)).toEqual(['heading', 'paragraph'])
  })

  it('returns no blocks for empty markdown', () => {
    expect(withEditor((editor) => parsePageMarkdown(editor, '  \n', new Set()))).toEqual([])
  })

  it('rejects an image block without a src', () => {
    const error = withEditor((editor) =>
      catchError(() => parsePageMarkdown(editor, ':::imageBlock {}\n\n:::', new Set()))
    )
    expect(error).toBeInstanceOf(GraphQLError)
    expect((error as GraphQLError).extensions.code).toBe('BAD_USER_INPUT')
    expect((error as GraphQLError).message).toContain('src')
  })

  it('rejects a text node directly under doc', () => {
    const error = withEditor((editor) =>
      catchError(() =>
        validatePageDoc(editor, {type: 'doc', content: [{type: 'text', text: 'loose'}]}, new Set())
      )
    )
    expect(error).toBeInstanceOf(GraphQLError)
    expect((error as GraphQLError).extensions.code).toBe('BAD_USER_INPUT')
  })

  it('accepts an image hosted by Parabol', () => {
    const blocks = withEditor((editor) => parsePageMarkdown(editor, `![a](${assetUrl})`, new Set()))
    expect(blocks.map(({type}) => type)).toEqual(['imageBlock'])
  })

  it('rejects an outside image unless the page already has it', () => {
    const error = withEditor((editor) =>
      catchError(() => parsePageMarkdown(editor, `![a](${outsideUrl})`, new Set()))
    )
    expect(error).toBeInstanceOf(GraphQLError)
    expect((error as GraphQLError).extensions.code).toBe('BAD_USER_INPUT')
    expect((error as GraphQLError).message).toContain('upload_image')
    const blocks = withEditor((editor) =>
      parsePageMarkdown(editor, `![a](${outsideUrl})`, new Set([outsideUrl]))
    )
    expect(blocks.map(({type}) => type)).toEqual(['imageBlock'])
  })

  it('returns a valid ordered list for an image in a list item', () => {
    const blocks = withEditor((editor) =>
      parsePageMarkdown(editor, `1. ![x](${assetUrl})`, new Set())
    )
    expect(blocks.map(({type}) => type)).toEqual(['orderedList'])
    expect(blocks[0]!.content![0]!.content!.map(({type}) => type)).toEqual([
      'paragraph',
      'imageBlock'
    ])
  })
})
