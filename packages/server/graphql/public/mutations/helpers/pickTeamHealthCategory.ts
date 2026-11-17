import getKysely from '../../../../postgres/getKysely'
import OpenAIServerManager from '../../../../utils/OpenAIServerManager'
import type {DataLoaderWorker} from '../../../graphql'
import isValid from '../../../isValid'

const DEFAULT_CATEGORY = 'Psychological Safety'

/**
 * Picks the category for a brand-new question. When one of the viewer's orgs has AI enabled (and
 * the instance has an OpenAI key), OpenAI chooses among the categories the viewer can see (built-ins plus their own).
 * Otherwise, or if the model fails, it falls back to the built-in Psychological Safety category.
 */
const pickTeamHealthCategory = async (
  question: string,
  viewerId: string,
  dataLoader: DataLoaderWorker
) => {
  const categories = await getKysely()
    .selectFrom('TeamHealthCategory')
    .select(['id', 'name', 'description', 'userId'])
    .where('userId', 'in', [viewerId, 'aGhostUser'])
    .where('removedAt', 'is', null)
    .orderBy('sortOrder')
    .execute()
  const fallback = categories.find((c) => c.userId === 'aGhostUser' && c.name === DEFAULT_CATEGORY)
  if (!fallback) throw new Error(`Built-in ${DEFAULT_CATEGORY} category is missing`)

  const orgUsers = await dataLoader.get('organizationUsersByUserId').load(viewerId)
  const orgIds = [...new Set(orgUsers.map(({orgId}) => orgId))]
  const orgs = (await dataLoader.get('organizations').loadMany(orgIds)).filter(isValid)
  if (orgs.some((org) => org.useAI)) {
    const manager = new OpenAIServerManager()
    const picked = await manager.pickTeamHealthCategory(question, categories)
    if (picked) return picked.id
  }
  return fallback.id
}

export default pickTeamHealthCategory
