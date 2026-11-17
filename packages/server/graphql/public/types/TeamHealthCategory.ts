import {CipherId} from '../../../utils/CipherId'
import type {TeamHealthCategoryResolvers} from '../resolverTypes'

const TeamHealthCategory: TeamHealthCategoryResolvers = {
  id: ({id}) => CipherId.toClient(id, 'teamHealthCategory')
}

export default TeamHealthCategory
