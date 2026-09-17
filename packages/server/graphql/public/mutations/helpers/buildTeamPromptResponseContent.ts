import {getSchema, type JSONContent} from '@tiptap/core'
import {serverTipTapExtensions} from '../../../../../client/shared/tiptap/serverTipTapExtensions'

export const EMPTY_TIPTAP_DOC: Readonly<JSONContent> = Object.freeze({type: 'doc', content: []})

const NON_CONTENT_ATOM_TYPES = new Set(['hardBreak', 'fileUpload'])

const CONTENT_ATOM_TYPES = new Set(
  Object.values(getSchema(serverTipTapExtensions).nodes)
    .filter(
      (nodeType) =>
        nodeType.isAtom && !nodeType.isText && !NON_CONTENT_ATOM_TYPES.has(nodeType.name)
    )
    .map((nodeType) => nodeType.name)
)

const hasText = (node: JSONContent): boolean =>
  !!node.text?.trim() || (node.content ?? []).some(hasText)

const hasContentAtom = (node: JSONContent): boolean =>
  (!!node.type && CONTENT_ATOM_TYPES.has(node.type)) || (node.content ?? []).some(hasContentAtom)

export const isEmptyAnswerDoc = (doc: JSONContent) => !hasText(doc) && !hasContentAtom(doc)

export const hasSharedContent = (response: {isShared: boolean; content: JSONContent}) =>
  response.isShared && !isEmptyAnswerDoc(response.content)

type Prompt = {id: string; question: string}
type Answer = {promptId: string; content: JSONContent; plaintextContent: string}

const buildTeamPromptResponseContent = (prompts: Prompt[], answers: Answer[]) => {
  const answerByPromptId = new Map(answers.map((answer) => [answer.promptId, answer]))
  const sections = prompts.flatMap((prompt) => {
    const answer = answerByPromptId.get(prompt.id)
    return answer ? [{prompt, answer}] : []
  })
  const content: JSONContent = {
    type: 'doc',
    content: sections.flatMap(({prompt, answer}) => [
      {type: 'heading', attrs: {level: 3}, content: [{type: 'text', text: prompt.question}]},
      ...(answer.content.content ?? [])
    ])
  }
  const plaintextContent = sections
    .map(({prompt, answer}) => `${prompt.question}\n${answer.plaintextContent}`)
    .join('\n\n')
  return {content, plaintextContent}
}

export default buildTeamPromptResponseContent
