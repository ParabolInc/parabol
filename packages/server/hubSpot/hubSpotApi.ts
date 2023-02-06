import fetch from 'node-fetch'
const accessToken = process.env.HUBSPOT_API_KEY

type Company = {
  id: string
  archived: boolean
}

type DealsResponse = {
  total: number
}

type CompaniesResponse = {
  results: Company[]
}

// TODO: we can can use https://github.com/HubSpot/hubspot-api-nodejs
const getCompaniesByDomain = async (domain: string): Promise<CompaniesResponse | Error> => {
  const body = JSON.stringify({
    properties: ['domain', 'hs_additional_domains'],
    filterGroups: [
      {
        filters: [
          {
            operator: 'EQ',
            propertyName: 'domain',
            value: domain
          }
        ]
      },
      {
        filters: [
          {
            operator: 'CONTAINS_TOKEN',
            propertyName: 'hs_additional_domains',
            value: domain
          }
        ]
      }
    ],
    limit: 100
  })

  const res = await fetch(`https://api.hubapi.com/crm/v3/objects/companies/search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`
    },
    body
  })

  const resJson = await res.json()

  if (resJson.status === 'error') {
    return new Error(resJson.message)
  }

  return resJson
}

const dealStages = process.env.HUBSPOT_SALES_PIPELINE_ACTIVE_STAGES?.split(',')

const getDealsByCompanyIds = async (companyIds: string[]): Promise<DealsResponse | Error> => {
  const body = JSON.stringify({
    properties: [''],
    limit: 1,
    filterGroups: [
      {
        filters: [
          {
            operator: 'EQ',
            propertyName: 'pipeline',
            value: process.env.HUBSPOT_SALES_PIPELINE_ID
          },
          {
            operator: 'IN',
            propertyName: 'dealstage',
            values: dealStages
          },
          {
            operator: 'IN',
            propertyName: 'associations.company',
            values: companyIds
          }
        ]
      }
    ]
  })

  const res = await fetch(`https://api.hubapi.com/crm/v3/objects/deals/search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`
    },
    body
  })

  const resJson = await res.json()

  if (resJson.status === 'error') {
    return new Error(resJson.message)
  }

  return resJson
}

export const domainHasActiveDeals = async (domain: string): Promise<boolean | Error> => {
  if (!accessToken || !accessToken.length) {
    return new Error('HubSpot access token is not provided')
  }

  const companies = await getCompaniesByDomain(domain)

  if (companies instanceof Error) {
    return companies
  }

  if (!companies.results.length) {
    return false
  }

  const companyIds = companies.results
    .filter((company: Company) => !company.archived)
    .map((company: Company) => company.id)

  const deals = await getDealsByCompanyIds(companyIds)

  if (deals instanceof Error) {
    return deals
  }

  return deals.total > 0
}
