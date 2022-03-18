import {GraphQLBoolean, GraphQLNonNull} from 'graphql'
import GraphQLISO8601Type from '../../types/GraphQLISO8601Type'
import SignupsPayload from "../../intranetSchema/types/SignupsPayload"
import {QueryResolvers} from '../resolverTypes'

const signups: QueryResolvers['signups'] = (_source, args) => args

export default signups