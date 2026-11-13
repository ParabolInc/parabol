import {sendPublic, signUp} from './common'

const ADD_TEAM_HEALTH_TEMPLATE = `
  mutation AddTeamHealthTemplate($teamId: ID!) {
    addTeamHealthTemplate(teamId: $teamId) {
      teamHealthTemplate {
        id
        availableQuestionPacks {
          userId
          questions {
            id
          }
        }
      }
    }
  }
`

const ADD_TEAM_HEALTH_QUESTION = `
  mutation AddTeamHealthQuestion($question: String!) {
    addTeamHealthQuestion(question: $question) {
      question {
        id
      }
    }
  }
`

const ADD_TEAM_HEALTH_TEMPLATE_QUESTION = `
  mutation AddTeamHealthTemplateQuestion($templateId: ID!, $questionIds: [ID!]!) {
    addTeamHealthTemplateQuestion(templateId: $templateId, questionIds: $questionIds) {
      template {
        questions {
          id
        }
      }
    }
  }
`

type Viewer = {teamId: string; cookie: string}
type QuestionPack = {userId: string; questions: {id: string}[]}

const addTeamHealthTemplate = async ({teamId, cookie}: Viewer) => {
  const res = await sendPublic({query: ADD_TEAM_HEALTH_TEMPLATE, variables: {teamId}, cookie})
  const {id, availableQuestionPacks} = res.data.addTeamHealthTemplate.teamHealthTemplate
  const builtInPack = (availableQuestionPacks as QuestionPack[]).find(
    ({userId}) => userId === 'aGhostUser'
  )!
  return {templateId: id as string, builtInQuestionId: builtInPack.questions[0]!.id}
}

const addTeamHealthQuestion = async ({cookie}: Viewer) => {
  const res = await sendPublic({
    query: ADD_TEAM_HEALTH_QUESTION,
    variables: {question: 'We can disagree with the roadmap out loud'},
    cookie
  })
  return res.data.addTeamHealthQuestion.question.id as string
}

const addTemplateQuestions = (templateId: string, questionIds: string[], cookie: string) =>
  sendPublic({
    query: ADD_TEAM_HEALTH_TEMPLATE_QUESTION,
    variables: {templateId, questionIds},
    cookie
  })

test('a question from another user’s personal pack cannot be added to a template', async () => {
  const [outsider, author] = await Promise.all([signUp(), signUp()])
  const [{templateId}, personalQuestionId] = await Promise.all([
    addTeamHealthTemplate(outsider),
    addTeamHealthQuestion(author)
  ])

  const res = await addTemplateQuestions(templateId, [personalQuestionId], outsider.cookie)

  expect(res.errors).toEqual([expect.objectContaining({message: 'No valid questions provided'})])
})

test('built-in questions and the viewer’s own questions are added to a template', async () => {
  const viewer = await signUp()
  const [{templateId, builtInQuestionId}, personalQuestionId] = await Promise.all([
    addTeamHealthTemplate(viewer),
    addTeamHealthQuestion(viewer)
  ])

  const res = await addTemplateQuestions(
    templateId,
    [builtInQuestionId, personalQuestionId],
    viewer.cookie
  )

  expect(res.errors).toBeUndefined()
  expect(res.data.addTeamHealthTemplateQuestion.template.questions).toEqual(
    expect.arrayContaining([{id: builtInQuestionId}, {id: personalQuestionId}])
  )
  expect(res.data.addTeamHealthTemplateQuestion.template.questions).toHaveLength(2)
})
