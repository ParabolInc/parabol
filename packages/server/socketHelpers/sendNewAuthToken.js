import {NEW_AUTH_TOKEN} from '../../client/utils/constants'
import encodeAuthTokenObj from '../utils/encodeAuthTokenObj'
import sendMessage from './sendMessage'
import {ClientMessageTypes} from '@mattkrick/graphql-trebuchet-client'

const {GQL_DATA} = ClientMessageTypes
const sendNewAuthToken = (socket, authTokenObj) => {
  sendMessage(socket, GQL_DATA, {authToken: encodeAuthTokenObj(authTokenObj)}, NEW_AUTH_TOKEN)
}

export default sendNewAuthToken
