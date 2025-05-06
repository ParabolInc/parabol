import {feistelCipher} from '../../../utils/feistelCipher'
import {PageResolvers} from '../resolverTypes'

const Page: PageResolvers = {
  id: ({id}) => `page:${feistelCipher.encrypt(id)}`,
  access: ({id}) => id
}

export default Page
