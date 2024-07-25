import {AuthIdentityTypeEnum} from '../../client/types/constEnums'
import AuthIdentityLocal from '../database/types/AuthIdentityLocal'
import User from '../database/types/User'
import generateUID from '../generateUID'
import {generateIdenticon} from '../graphql/private/mutations/helpers/generateIdenticon'

interface Props {
  email: string
  hashedPassword: string
  pseudoId?: string | null
  isEmailVerified: boolean
}

const createNewLocalUser = async (props: Props) => {
  const {email, hashedPassword, pseudoId, isEmailVerified} = props
  const nickname = email.split('@')[0]!
  const preferredName = nickname.length === 1 ? nickname.repeat(2) : nickname
  const userId = `local|${generateUID()}`
  const newUser = new User({
    id: userId,
    preferredName,
    email,
    picture: await generateIdenticon(userId, preferredName),
    identities: [],
    pseudoId
  })
  const identityId = `${userId}:${AuthIdentityTypeEnum.LOCAL}`
  newUser.identities.push(new AuthIdentityLocal({hashedPassword, id: identityId, isEmailVerified}))
  return newUser
}

export default createNewLocalUser
