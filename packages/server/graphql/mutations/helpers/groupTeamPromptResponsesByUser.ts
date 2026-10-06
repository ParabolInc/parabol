import {generateText, type JSONContent} from '@tiptap/core'
import {serverTipTapExtensions} from '../../../../client/shared/tiptap/serverTipTapExtensions'
import type {TeamPromptResponse} from '../../../postgres/types'

type Prompt = {id: string; question: string}

type Answer = Pick<
  TeamPromptResponse,
  'id' | 'userId' | 'promptId' | 'content' | 'plaintextContent' | 'createdAt'
>

export type TeamPromptMemberResponse = Pick<
  TeamPromptResponse,
  'id' | 'userId' | 'content' | 'plaintextContent' | 'createdAt'
>

const groupTeamPromptResponsesByUser = (
  prompts: Prompt[],
  responses: Answer[]
): TeamPromptMemberResponse[] => {
  const promptIndexById = new Map(prompts.map(({id}, idx) => [id, idx]))
  const questionById = new Map(prompts.map(({id, question}) => [id, question]))
  const responsesByUserId = new Map<string, Answer[]>()
  responses.forEach((response) => {
    const userResponses = responsesByUserId.get(response.userId)
    if (userResponses) userResponses.push(response)
    else responsesByUserId.set(response.userId, [response])
  })
  return [...responsesByUserId.values()].map((userResponses) => {
    const answers = userResponses.toSorted(
      (a, b) =>
        (promptIndexById.get(a.promptId) ?? prompts.length) -
        (promptIndexById.get(b.promptId) ?? prompts.length)
    )
    const {id, userId, createdAt} = answers[0]!
    if (answers.length === 1 && prompts.length === 1) {
      const {content, plaintextContent} = answers[0]!
      return {id, userId, createdAt, content, plaintextContent}
    }
    const content: JSONContent = {
      type: 'doc',
      content: answers.flatMap((answer) => {
        const question = questionById.get(answer.promptId)
        const blocks = answer.content.content ?? []
        if (!question) return blocks
        return [
          {type: 'heading', attrs: {level: 3}, content: [{type: 'text', text: question}]},
          ...blocks
        ]
      })
    }
    return {
      id,
      userId,
      createdAt: answers.reduce(
        (earliest, answer) => (answer.createdAt < earliest ? answer.createdAt : earliest),
        createdAt
      ),
      content,
      plaintextContent: generateText(content, serverTipTapExtensions).trim()
    }
  })
}

export default groupTeamPromptResponsesByUser
