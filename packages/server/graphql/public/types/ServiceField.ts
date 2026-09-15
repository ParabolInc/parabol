import type {ServiceFieldResolvers} from '../resolverTypes'

const ServiceField: ServiceFieldResolvers = {
  name: ({fieldId}) => fieldId
}

export default ServiceField
