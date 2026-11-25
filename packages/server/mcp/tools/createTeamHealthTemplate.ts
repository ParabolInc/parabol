import {z} from 'zod'
import type {SharingScopeEnum} from '../../graphql/public/resolverTypes'
import defineTool from '../defineTool'
import type {MCPContext} from '../MCPContext'
import runGraphQL from '../runGraphQL'
import runTemplateStep, {renameMeetingTemplate, TemplateStepFailedError} from '../runTemplateStep'
import {writeAnnotations} from '../toolAnnotations'
import toolResult from '../toolResult'

const MAX_QUESTIONS = 15

const ADD_TEAM_HEALTH_TEMPLATE = `
  mutation AddTeamHealthTemplate($teamId: ID!) {
    addTeamHealthTemplate(teamId: $teamId) {
      teamHealthTemplate {
        id
        scope
      }
    }
  }
`

const ADD_TEAM_HEALTH_QUESTION = `
  mutation AddTeamHealthQuestion($question: String!) {
    addTeamHealthQuestion(question: $question) {
      question {
        id
        category {
          name
        }
      }
    }
  }
`

const SET_QUESTION_CATEGORY = `
  mutation SetQuestionCategory($questionId: ID!, $category: String!) {
    upsertTeamHealthQuestionCategory(questionId: $questionId, category: $category) {
      category {
        name
      }
    }
  }
`

const ADD_TEMPLATE_QUESTIONS = `
  mutation AddTemplateQuestions($templateId: ID!, $questionIds: [ID!]!) {
    addTeamHealthTemplateQuestion(templateId: $templateId, questionIds: $questionIds) {
      template {
        id
      }
    }
  }
`

const DELETE_TEAM_HEALTH_QUESTION = `
  mutation DeleteTeamHealthQuestion($questionId: ID!) {
    deleteTeamHealthQuestion(questionId: $questionId) {
      questionId
    }
  }
`

const addQuestion = async (context: MCPContext, question: string) => {
  const {addTeamHealthQuestion} = await runTemplateStep<{
    addTeamHealthQuestion: {question: {id: string; category: {name: string}}}
  }>(context, ADD_TEAM_HEALTH_QUESTION, {question})
  return addTeamHealthQuestion.question
}

const categorize = async (
  context: MCPContext,
  questionId: string,
  pickedCategory: string,
  category: string | undefined
) => {
  if (!category || category.toLowerCase() === pickedCategory.toLowerCase()) return pickedCategory
  const {upsertTeamHealthQuestionCategory} = await runTemplateStep<{
    upsertTeamHealthQuestionCategory: {category: {name: string}}
  }>(context, SET_QUESTION_CATEGORY, {questionId, category})
  return upsertTeamHealthQuestionCategory.category.name
}

export default defineTool({
  name: 'create_team_health_template',
  title: 'Create a team health template',
  description: `Create a team health template on a team with up to ${MAX_QUESTIONS} questions, each a statement the team scores from 1 (strongly disagree) to 5 (strongly agree), such as "I can raise problems and tough issues with this team." Team health templates are always shared with the team's whole organization. Each check asks one question from each category and rotates through a category's questions from one check to the next, so give every question you want asked each time a category of its own. Then call start_team_health with the template's id. It refuses a name another team health template on the team has. Team health templates can't be removed, so an error with unfinishedTemplateId names the empty template the tool made before it failed. unfinishedQuestionIds, when present, names questions it made but couldn't delete, which stay in your My Questions list. After any retryAfter, delete those with deleteTeamHealthQuestion through graphql_mutate, then call again with another name. Needs templates:write.`,
  inputSchema: z.object({
    teamId: z.string().describe('The team that owns the template, from get_me'),
    name: z
      .string()
      .trim()
      .min(1)
      .max(100)
      .describe("The template's name, which no other team health template on the team may have"),
    questions: z
      .array(
        z.object({
          question: z.string().trim().min(1).max(500).describe('The statement the team scores'),
          category: z
            .string()
            .trim()
            .min(1)
            .max(100)
            .optional()
            .describe(
              'What the question measures: Psychological Safety, Dependability, Structure & Clarity, Meaning, Impact, or a name of your own. Omit to let Parabol pick one, with AI when one of your organizations has it on, else Psychological Safety'
            )
        })
      )
      .min(1)
      .max(MAX_QUESTIONS)
      .refine(
        (questions) => new Set(questions.map(({question}) => question)).size === questions.length,
        'Each question must be different'
      )
      .describe('The questions, in order')
  }),
  annotations: writeAnnotations,
  run: async (context, {teamId, name, questions}) => {
    const created = await runGraphQL<{
      addTeamHealthTemplate: {teamHealthTemplate: {id: string; scope: SharingScopeEnum}}
    }>(context, ADD_TEAM_HEALTH_TEMPLATE, {teamId})
    const createdTemplate = created.data?.addTeamHealthTemplate.teamHealthTemplate
    if (created.errors?.length || !createdTemplate) return toolResult(created)
    const {id: templateId, scope} = createdTemplate
    const questionIds: string[] = []
    try {
      await renameMeetingTemplate(context, templateId, name)
      const savedQuestions = []
      for (const {question, category} of questions) {
        const added = await addQuestion(context, question)
        questionIds.push(added.id)
        savedQuestions.push({
          id: added.id,
          question,
          category: await categorize(context, added.id, added.category.name, category)
        })
      }
      await runTemplateStep(context, ADD_TEMPLATE_QUESTIONS, {templateId, questionIds})
      return toolResult({
        data: {template: {id: templateId, name, scope, questions: savedQuestions}}
      })
    } catch (error) {
      const unfinishedQuestionIds: string[] = []
      for (const questionId of questionIds) {
        const deleted = await runGraphQL(context, DELETE_TEAM_HEALTH_QUESTION, {questionId})
        if (deleted.errors?.length) unfinishedQuestionIds.push(questionId)
      }
      if (!(error instanceof TemplateStepFailedError)) throw error
      return toolResult(error.result, {
        unfinishedTemplateId: templateId,
        ...(unfinishedQuestionIds.length > 0 && {unfinishedQuestionIds})
      })
    }
  }
})
