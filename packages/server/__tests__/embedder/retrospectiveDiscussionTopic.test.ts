import {createEmbeddingTextFrom} from '../../../embedder/indexing/createEmbeddingTextFrom'
import type {DataLoaderInstance} from '../../dataloader/RootDataLoader'

const fixtures: Record<string, Record<string, unknown>> = {
  discussions: {
    d1: {
      id: 'd1',
      discussionTopicId: 'g1',
      meetingId: 'm1',
      summary: null
    }
  },
  newMeetings: {
    m1: {meetingType: 'retrospective', name: 'Retro 12', templateId: 't1', disableAnonymity: false}
  },
  retroReflectionGroups: {g1: {title: 'Flaky deploys'}},
  retroReflectionsByGroupId: {
    g1: [
      {promptId: 'p1', creatorId: 'u1', plaintextContent: 'the deploy pipeline fails twice a week'},
      {promptId: 'p2', creatorId: 'u2', plaintextContent: 'rollback saved us on Tuesday again'}
    ]
  },
  meetingTemplates: {t1: {name: 'Start Stop Continue'}},
  templatePrompts: {
    p1: {id: 'p1', question: 'Stop', description: 'What should we stop doing?'},
    p2: {id: 'p2', question: 'Continue', description: 'What should we keep doing?'}
  },
  commentsByDiscussionId: {
    d1: [
      {
        id: 'c1',
        createdBy: 'u1',
        threadParentId: null,
        threadSortOrder: 0,
        isAnonymous: false,
        plaintextContent: 'we should add a retry to the deploy step'
      },
      {
        id: 'c2',
        createdBy: 'parabolAIUser',
        threadParentId: null,
        threadSortOrder: 1,
        isAnonymous: false,
        plaintextContent: 'Related Discussions: Retro 11'
      },
      {
        id: 'c3',
        createdBy: 'u2',
        threadParentId: 'c1',
        threadSortOrder: 0,
        isAnonymous: false,
        plaintextContent: 'agreed, that one is on me'
      }
    ]
  },
  users: {u1: {preferredName: 'Priya'}, u2: {preferredName: 'Sam'}}
}

const dataLoader = {
  get: (name: string) => {
    const load = async (key: string) => fixtures[name]?.[key]
    return {load, loadNonNull: load}
  }
} as unknown as DataLoaderInstance

const metadata = {refId: 'd1', objectType: 'retrospectiveDiscussionTopic'} as Parameters<
  typeof createEmbeddingTextFrom
>[0]

describe('a retro topic', () => {
  it('reads as just its title, notes and comments in plain text', async () => {
    const {body} = await createEmbeddingTextFrom(metadata, dataLoader, {discussionText: 'plain'})
    expect(body).toBe(
      [
        'Flaky deploys',
        'the deploy pipeline fails twice a week',
        'rollback saved us on Tuesday again',
        'we should add a retry to the deploy step',
        'agreed, that one is on me'
      ].join('\n')
    )
  })

  it('uses the summary in place of comments when there is one', async () => {
    fixtures.discussions!.d1 = {...(fixtures.discussions!.d1 as object), summary: 'Add a retry.'}
    const {body} = await createEmbeddingTextFrom(metadata, dataLoader, {discussionText: 'plain'})
    fixtures.discussions!.d1 = {...(fixtures.discussions!.d1 as object), summary: null}
    expect(body).toBe(
      [
        'Flaky deploys',
        'the deploy pipeline fails twice a week',
        'rollback saved us on Tuesday again',
        'Add a retry.'
      ].join('\n')
    )
  })

  it('keeps the narrated text for models that use it', async () => {
    const {body} = await createEmbeddingTextFrom(metadata, dataLoader, {
      discussionText: 'narrated'
    })
    expect(body).toContain('A topic "Flaky deploys" was discussed during the meeting "Retro 12"')
    expect(body).toContain('Participants were prompted with, "Stop: What should we stop doing?"')
  })

  it('keeps only the notes and comments for reranking', async () => {
    const {body} = await createEmbeddingTextFrom(metadata, dataLoader, {isRerank: true})
    expect(body).not.toContain('A topic')
    expect(body).toContain('wrote, "the deploy pipeline fails twice a week"')
  })
})
