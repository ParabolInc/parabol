import {GraphQLBoolean, GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql'
import getSAMLURLFromEmail from '../../utils/getSAMLURLFromEmail'
import rateLimit from '../rateLimit'

export interface SSOParams {
  RelayState: string
}

export interface SSORelayState {
  isInvited?: boolean
}

const SAMLIdP = {
  args: {
    email: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'the email associated with a SAML login'
    },
    isInvited: {
      type: GraphQLBoolean,
      description: 'true if the user was invited, else false'
    }
  },
  type: GraphQLString,
  resolve: rateLimit({perMinute: 120, perHour: 3600})(
    async (_source: unknown, {email, isInvited}) => {
      return getSAMLURLFromEmail(email, isInvited)
    }
  )
}

export default SAMLIdP
