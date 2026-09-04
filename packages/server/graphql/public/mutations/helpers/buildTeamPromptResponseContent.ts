import type {JSONContent} from '@tiptap/core'

export const EMPTY_TIPTAP_DOC: Readonly<JSONContent> = Object.freeze({type: 'doc', content: []})

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
