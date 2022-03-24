import {GraphQLBoolean, GraphQLNonNull} from 'graphql'
import GraphQLISO8601Type from '../../types/GraphQLISO8601Type'
import LoginsPayload from '../types/LoginsPayload'

const logins = {
  type: new GraphQLNonNull(LoginsPayload),
  args: {
    after: {
      type: GraphQLISO8601Type,
      description: 'only include users whose accounts were created after this date'
    },
    isActive: {
      type: GraphQLBoolean,
      description: 'if true, only include active users, else count all users',
      defaultValue: false
    }
  },
  description: 'Get the number of logins, optionally broken down by domain',
  resolve: (_source: unknown, args: unknown) => args
}

export default logins
