import getPg from '../getPg'
import {changeEmailDomainQuery} from './generated/changeEmailDomainQuery'

const changeEmailDomainToPG = async () => {
  return changeEmailDomainQuery.run({} as any, getPg())
}
export default changeEmailDomainToPG
