import * as graphql from 'graphql'
import {sql} from 'kysely'
import {toSlug} from '../../../../client/shared/toSlug'
import getModelManager from '../../../../embedder/ai_models/ModelManager'
import numberVectorToString from '../../../../embedder/indexing/numberVectorToString'
import {PriorityLock} from '../../../../embedder/PriorityLock'
import getKysely from '../../../postgres/getKysely'
import {getUserId} from '../../../utils/authorization'
import {CipherId} from '../../../utils/CipherId'
import RedisInstance from '../../../utils/RedisInstance'
import {applyBusinessRules} from '../../../utils/reRank'
import {calculateRRF} from '../../../utils/rrf'
import type {QueryResolvers} from '../resolverTypes'

const search: QueryResolvers['search'] = async (
  _source,
  {query, limit: rawLimit = 20, offset: rawOffset = 0, filter, alpha = 0.75},
  context
) => {
  const userId = (context as any).userId || getUserId(context.authToken)

  const pg = getKysely()

  // Feature Flag Check:
  // User must belong to at least one organization with 'search' feature flag enabled
  if (userId) {
    const hasSearchEnabled = await pg
      .selectFrom('OrganizationUser as ou')
      .innerJoin('FeatureFlagOwner as ffo', 'ffo.orgId', 'ou.orgId')
      .innerJoin('FeatureFlag as ff', 'ff.id', 'ffo.featureFlagId')
      .where('ou.userId', '=', userId)
      .where('ff.featureName', '=', 'search')
      .where('ff.expiresAt', '>', new Date())
      .select('ff.id')
      .executeTakeFirst()

    if (!hasSearchEnabled) {
      return {results: [], totalCount: 0}
    }
  } else {
    // If no user, they can't belong to an org, so no search
    return {results: [], totalCount: 0}
  }

  const safeAlpha = alpha ?? 0.75

  // Validate alpha
  if (safeAlpha < 0 || safeAlpha > 1) {
    throw new graphql.GraphQLError('Alpha must be between 0 and 1')
  }

  const vectorWeight = safeAlpha
  const keywordWeight = 1.0 - safeAlpha

  const userTeamIds: string[] = []

  if (userId) {
    const userTeams = await pg
      .selectFrom('TeamMember')
      .select('teamId')
      .where('userId', '=', userId)
      .where('isNotRemoved', '=', true)
      .execute()
    userTeamIds.push(...userTeams.map((t) => t.teamId))
  }

  const modelManager = getModelManager()
  const model = modelManager.getEmbedder()
  if (!model) throw new Error('Embedding model not found')

  let vector: number[] | Error
  // Acquire high priority lock for Search
  const redis = new RedisInstance('search_priority_lock')
  const priorityLock = new PriorityLock(redis)
  // 3s TTL to be safe
  await priorityLock.acquireHighPriority(3000)

  try {
    vector = await model.getEmbedding(query)
  } finally {
    await priorityLock.releaseHighPriority()
  }

  if (vector instanceof Error) throw vector
  const vectorStr = numberVectorToString(vector)
  const k = 60 // RRF constant

  // Helper to build filtering conditions
  const buildFilters = (eb: any) => {
    const ors = []

    // 1. User is owner
    ors.push(eb('m.userId', '=', userId as any))

    // 2. User is in the team
    if (userTeamIds.length > 0) {
      ors.push(eb('m.teamId', 'in', userTeamIds))
    }

    // 3. Page specific sharing
    ors.push(
      eb.and([
        eb('m.objectType', '=', 'page' as any),
        eb.exists(
          eb
            .selectFrom('PageUserAccess as pua')
            .whereRef('pua.pageId', '=', sql<string>`cast("m"."refId" as integer)`)
            .where('pua.userId', '=', userId)
        )
      ])
    )

    // 4. Public Meeting Templates
    ors.push(
      eb.and([
        eb('m.objectType', '=', 'meetingTemplate' as any),
        eb.exists(
          eb
            .selectFrom('MeetingTemplate as mt_public')
            .whereRef('mt_public.id', '=', 'm.refId')
            .where('mt_public.scope', '=', 'PUBLIC' as any)
        )
      ])
    )

    return eb.and([
      eb.or(ors),
      // explicit filters
      filter?.teamIDs && filter.teamIDs.length > 0
        ? eb('m.teamId', 'in', filter.teamIDs)
        : filter?.teamId
          ? eb('m.teamId', '=', filter.teamId)
          : eb.val(true),
      filter?.objectType && filter.objectType.length > 0
        ? eb('m.objectType', 'in', filter.objectType)
        : eb.val(true),
      // date filters
      filter?.startDate ? eb('m.refUpdatedAt', '>=', filter.startDate) : eb.val(true),
      filter?.endDate ? eb('m.refUpdatedAt', '<=', filter.endDate) : eb.val(true),
      // Archived filters (exclude archived by default)
      eb.or([
        eb.and([
          eb('m.objectType', '=', 'page'),
          eb.exists(
            eb
              .selectFrom('Page as p_arch')
              .whereRef('p_arch.id', '=', sql<number>`cast("m"."refId" as integer)`)
              .where('p_arch.deletedAt', 'is', null)
          )
        ]),
        eb.and([
          eb('m.objectType', '=', 'meetingTemplate'),
          eb.exists(
            eb
              .selectFrom('MeetingTemplate as mt_arch')
              .whereRef('mt_arch.id', '=', 'm.refId')
              // isActive is boolean, true means active (not archived)
              .where('mt_arch.isActive', '=', true)
          )
        ]),
        eb.and([eb('m.objectType', '=', 'retrospectiveDiscussionTopic'), eb.val(true)])
      ])
    ])
  }

  // Define search limit (fetch more for RRF)
  const limit = rawLimit || 20
  const searchLimit = limit * 3

  // Lexical Search on CHUNKS
  const lexicalResults = await pg
    .selectFrom('Embeddings_ember_1 as e')
    .innerJoin('EmbeddingsMetadata as m', 'e.embeddingsMetadataId', 'm.id')
    .select([
      'm.id as metadataId',
      'e.id as chunkId',
      sql<number>`ts_rank_cd(e."tsv", plainto_tsquery('english', ${query}), 32)`.as('score'),
      'e.embedText'
    ])
    .where((eb) => buildFilters(eb))
    .where(sql<boolean>`e."tsv" @@ plainto_tsquery('english', ${query})`)
    .orderBy('score', 'desc')
    .limit(searchLimit)
    .execute()

  // Semantic Search on CHUNKS
  const semanticResults = await pg
    .selectFrom('Embeddings_ember_1 as e')
    .innerJoin('EmbeddingsMetadata as m', 'e.embeddingsMetadataId', 'm.id')
    .select([
      'm.id as metadataId',
      'e.id as chunkId',
      sql<number>`(1 - (e."embedding" <=> ${vectorStr}::vector))`.as('score'),
      'e.embedText'
    ])
    .where((eb) => buildFilters(eb))
    .orderBy('score', 'desc')
    .limit(searchLimit)
    .execute()

  // RRF Aggregation (Chunk -> Document)
  const lexicalMap = new Map<string, number>()
  const lexicalScore = new Map<string, number>()
  const lexicalSnippets = new Map<string, string[]>()

  lexicalResults.forEach((r, i) => {
    const id = String(r.metadataId)
    // Keep best rank for the document
    if (!lexicalMap.has(id)) {
      lexicalMap.set(id, i + 1)
      lexicalScore.set(id, r.score)
    }
    // Collect snippets
    const snippets = lexicalSnippets.get(id) || []
    if (snippets.length < 3) snippets.push(r.embedText || '')
    lexicalSnippets.set(id, snippets)
  })

  const semanticMap = new Map<string, number>()
  const semanticScore = new Map<string, number>()
  const semanticSnippets = new Map<string, string[]>()

  semanticResults.forEach((r, i) => {
    const id = String(r.metadataId)
    if (!semanticMap.has(id)) {
      semanticMap.set(id, i + 1)
      semanticScore.set(id, r.score)
    }
    const snippets = semanticSnippets.get(id) || []
    if (snippets.length < 3) snippets.push(r.embedText || '')
    semanticSnippets.set(id, snippets)
  })

  // Calculate RRF for Documents
  const rrfScores = calculateRRF([lexicalMap, semanticMap], k, [keywordWeight, vectorWeight])

  const offset = rawOffset || 0

  // Sort and Paginate
  const topIds = Array.from(rrfScores.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(offset, offset + limit)
    .map(([id]) => Number(id))

  if (topIds.length === 0) {
    return {results: [], totalCount: 0}
  }

  // Fetch Details
  const metadata = await pg
    .selectFrom('EmbeddingsMetadata as m')
    .select(['m.id', 'm.refId', 'm.objectType', 'm.refUpdatedAt', 'm.userId'])
    .where('m.id', 'in', topIds)
    .execute()

  // Load objects via DataLoaders
  const pageIds = metadata
    .filter((m) => m.objectType === 'page')
    .map((m) => Number(m.refId))
    .filter((id) => !isNaN(id))

  const templateIds = metadata.filter((m) => m.objectType === 'meetingTemplate').map((m) => m.refId)

  const discussionIds = metadata
    .filter((m) => m.objectType === 'retrospectiveDiscussionTopic')
    .map((m) => m.refId)

  const [pages, templates, discussions] = (await Promise.all([
    pageIds.length > 0
      ? (context as any).dataLoader.get('pages').loadMany(pageIds)
      : Promise.resolve([]),
    templateIds.length > 0
      ? (context as any).dataLoader.get('meetingTemplates').loadMany(templateIds)
      : Promise.resolve([]),
    discussionIds.length > 0
      ? (context as any).dataLoader.get('discussions').loadMany(discussionIds)
      : Promise.resolve([])
  ])) as [any[], any[], any[]]

  // Map for easy access
  const pageMap = new Map(
    pages.filter((p: any) => p && !(p instanceof Error)).map((p: any) => [String(p.id), p])
  )
  const templateMap = new Map(
    templates.filter((t: any) => t && !(t instanceof Error)).map((t: any) => [t.id, t])
  )
  const discussionMap = new Map(
    (discussions as any[]).filter((d: any) => d && !(d instanceof Error)).map((d: any) => [d.id, d])
  )

  const rrgIds = Array.from(discussionMap.values())
    .map((d: any) => d.discussionTopicId)
    .filter(Boolean)

  const rrgs =
    rrgIds.length > 0
      ? await (context as any).dataLoader.get('retroReflectionGroups').loadMany(rrgIds)
      : ([] as any[])

  const rrgMap = new Map(
    rrgs.filter((r: any) => r && !(r instanceof Error)).map((r: any) => [r.id, r])
  )

  const MAX_RRF_SCORE = (keywordWeight + vectorWeight) * (1 / (k + 1))

  const results = metadata
    .map((m) => {
      const id = String(m.id) // This is the metadataId for score lookups
      const rawScore = rrfScores.get(id) || 0
      const score = rawScore / MAX_RRF_SCORE

      let title = 'Untitled'
      let url: string | null = null
      let updatedAt = m.refUpdatedAt
      let node: any = null

      if (m.objectType === 'page') {
        const page = pageMap.get(m.refId)
        if (page) {
          node = {...page, __typename: 'Page'}
          title = page.title || 'Untitled'
          updatedAt = page.updatedAt
          const slug = toSlug(title)
          const encryptedId = CipherId.encrypt(page.id)
          url = `/pages/${slug}-${encryptedId}`
        } else {
          // Inconsistency or deleted?
          return null
        }
      } else if (m.objectType === 'meetingTemplate') {
        const template = templateMap.get(m.refId)
        if (template) {
          let typename = 'FixedActivity'
          if (template.type === 'retrospective') {
            typename = 'ReflectTemplate'
          } else if (template.type === 'poker') {
            typename = 'PokerTemplate'
          }
          node = {...template, __typename: typename}
          title = template.name || 'Untitled'
          url = `/templates/${m.refId}`
        } else {
          return null
        }
      } else if (m.objectType === 'retrospectiveDiscussionTopic') {
        const discussion = discussionMap.get(m.refId)
        if (discussion) {
          node = {...discussion, __typename: 'Discussion'}
          const rrg = rrgMap.get(discussion.discussionTopicId) as any
          title = rrg?.title || 'Discussion Topic'
        } else {
          return null
        }
      }

      // Combine snippets (Lexical preferred for highlights, then Semantic)
      const rawSnippets = lexicalSnippets.get(id) || semanticSnippets.get(id) || []
      const uniqueSnippets = Array.from(new Set(rawSnippets)).slice(0, 3)

      return {
        id: String(m.refId), // This is the refId for the final result
        score: {
          relevance: score,
          vector: semanticScore.get(id) || 0,
          keyword: lexicalScore.get(id) || 0
        },
        title,
        snippets: uniqueSnippets,
        node,
        updatedAt: updatedAt || m.refUpdatedAt,
        url
      }
    })
    .filter((r): r is NonNullable<typeof r> => r !== null)
    .filter((r) => {
      if (filter?.scoreCutoff != null) {
        return r.score.relevance >= filter.scoreCutoff
      }
      return true
    })

  results.sort((a, b) => b.score.relevance - a.score.relevance)

  // Re-rank (Business Rules)
  const reranked = applyBusinessRules(results as any, {query, currentUserId: userId || undefined})

  return {
    results: reranked as any,
    totalCount: rrfScores.size
  }
}

export default search
