import {createContext, useContext} from 'react'
import type {OrganizationQuery} from '../../../../__generated__/OrganizationQuery.graphql'

interface OrganizationOutlet {
  organization: NonNullable<OrganizationQuery['response']['viewer']['organization']>
  orgId: string
}

export const OrganizationOutletContext = createContext<OrganizationOutlet | null>(null)

const useOrganizationOutlet = () => {
  const outlet = useContext(OrganizationOutletContext)
  if (!outlet) throw new Error('useOrganizationOutlet must be used under the organization route')
  return outlet
}

export default useOrganizationOutlet
