import getReflectionEntities from '../../mutations/helpers/getReflectionEntities'
import {QueryResolvers} from '../resolverTypes'

const getDemoEntities: QueryResolvers['getDemoEntities'] = async (_source, {text}) => {
  const entities = await getReflectionEntities(text)
  return {entities}
}

export default getDemoEntities
