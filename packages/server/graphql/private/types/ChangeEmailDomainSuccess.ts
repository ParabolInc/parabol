// import {ChangeEmailDomainSuccessResolvers} from '../../public/resolverTypes'

export type ChangeEmailDomainSuccessSource = {
  id: string
}

const ChangeEmailDomainSuccess = {
  users: async ({id}, _args, {dataLoader}) => {
    return dataLoader.get('').load(id)
  }
}

export default ChangeEmailDomainSuccess
