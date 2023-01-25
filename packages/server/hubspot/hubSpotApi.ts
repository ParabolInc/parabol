import fetch from 'node-fetch'
const accessToken = process.env.HUBSPOT_ACCESS_TOKEN

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

const SALES_PIPELINE_ID = '14fa7db3-cc82-4562-8603-90d792014b42'
const PQL_ACCEPTED_STAGE_ID = '2410510'
const PQL_REPLIED_STAGE_ID = 'd394bd39-f31c-4cac-afba-2d9b85b57e2b'
const SQL_STAGE_ID = '48c94b2b-1d51-47af-b563-cf490d799ec2'
const SQL_IN_PROCUREMENT_STAGE_ID = '611924'

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
            value: SALES_PIPELINE_ID
          },
          {
            operator: 'IN',
            propertyName: 'dealstage',
            values: [
              PQL_ACCEPTED_STAGE_ID,
              PQL_REPLIED_STAGE_ID,
              SQL_STAGE_ID,
              SQL_IN_PROCUREMENT_STAGE_ID
            ]
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
