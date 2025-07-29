import {useAutocomplete} from '@mui/base/useAutocomplete'
import graphql from 'babel-plugin-relay/macro'
import {useMemo, useState} from 'react'
import {readInlineData} from 'relay-runtime'
import type {usePageSharingAutocomplete_viewer$key} from '../../__generated__/usePageSharingAutocomplete_viewer.graphql'
import parseEmailAddressList from '../../utils/parseEmailAddressList'

export type Option =
  | {
      type: 'user'
      userId: string
      picture: string
      name: string
      email: string
    }
  | {
      type: 'team'
      teamId: string
      name: string
    }
  | {
      type: 'organization'
      orgId: string
      picture: string | null
      name: string
    }
  | {
      type: 'external'
      email: string
    }

const autocompleteEmail = (input: string, domain: string) => {
  // If the input already ends with the provided domain, or is just "@" then return it as-is.
  if (input.endsWith(`@${domain}`) || input === '@') {
    return input
  }

  // Split the input by "@" to separate the username and domain parts.
  const [username, potentialDomain] = input.split('@')

  // If there's a domain part and it's not empty, return the input as-is.
  if (potentialDomain && potentialDomain.length > 0) {
    return input
  }

  // If the input doesn't have a domain part, append the provided domain.
  return `${username}@${domain}`
}

export const getOptionLabel = (option: any) => option.name || option.email
export const getOptionValue = (option: any) =>
  option.userId || option.teamId || option.orgId || option.email

const isCaseAccentInsensitiveEqual = (a: string, b: string) => {
  return a.localeCompare(b, undefined, {sensitivity: 'base'}) === 0
}
const normalizeLowerNoAccents = (str: string) => {
  return str
    .normalize()
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

export const usePageSharingAutocomplete = (viewerRef: usePageSharingAutocomplete_viewer$key) => {
  const viewer = readInlineData(
    graphql`
      fragment usePageSharingAutocomplete_viewer on User @inline {
        id
        email
        organizations {
          id
          name
          picture
          organizationUsers {
            edges {
              node {
                user {
                  id
                  preferredName
                  picture
                  email
                }
              }
            }
          }
          teams {
            id
            name
          }
        }
        page(pageId: $pageId) {
          access {
            guests {
              email
            }
            users {
              user {
                id
              }
            }
            teams {
              team {
                id
              }
            }
            organizations {
              organization {
                id
              }
            }
          }
        }
      }
    `,
    viewerRef
  )
  const {email, organizations, page} = viewer
  const [value, setValue] = useState([] as Option[])
  const [error, setError] = useState<string | null>(null)
  const viewerDomain = email.slice(email.indexOf('@') + 1)
  const {access} = page
  const {guests} = access
  const options = useMemo(() => {
    const userIdSet = new Set(access.users.map((u) => u.user.id))
    const teamIdSet = new Set(access.teams.map((t) => t.team.id))
    const orgIdSet = new Set(access.organizations.map((o) => o.organization.id))
    const users = organizations
      .flatMap((org) => org.organizationUsers.edges)
      .map((user) => ({
        type: 'user' as const,
        userId: user.node.user.id,
        name: user.node.user.preferredName,
        picture: user.node.user.picture,
        email: user.node.user.email
      }))
      .filter(({userId}) => {
        if (userIdSet.has(userId)) return false
        userIdSet.add(userId)
        return true
      })
    const teams = organizations
      .flatMap((org) => org.teams)
      .map((team) => ({
        type: 'team' as const,
        teamId: team.id,
        name: team.name
      }))
      .filter(({teamId}) => {
        if (teamIdSet.has(teamId)) return false
        teamIdSet.add(teamId)
        return true
      })
    const orgs = organizations
      .map((org) => ({
        type: 'organization' as const,
        orgId: org.id,
        name: org.name,
        picture: org.picture || null
      }))
      .filter(({orgId}) => {
        if (orgIdSet.has(orgId)) return false
        orgIdSet.add(orgId)
        return true
      })
    return [...users, ...teams, ...orgs]
  }, [organizations, page])
  const controls = useAutocomplete<Option, true, true, true>({
    multiple: true,
    autoSelect: true,
    options,
    value,
    freeSolo: true,
    groupBy: ({type}) => type,
    getOptionLabel,
    isOptionEqualToValue: (option: any, value: any) => {
      return getOptionValue(option) === getOptionValue(value)
    },
    onChange: (_: any, value) => {
      const normalized = [] as Option[]
      // TODO: handle CSV
      for (const entry of value) {
        if (typeof entry !== 'string') {
          normalized.push(entry)
        } else {
          const res = parseEmailAddressList(entry)
          const {parsedInvitees, invalidEmailExists} = res
          parsedInvitees.forEach((goodEmail) => {
            normalized.push({
              type: 'external',
              email: (goodEmail as emailAddresses.ParsedMailbox).address
            })
          })
          if (invalidEmailExists) {
            const matchingName = options.find((opt) =>
              isCaseAccentInsensitiveEqual(opt.name, entry)
            )
            if (matchingName) {
              normalized.push(matchingName)
            } else {
              setError(`Invalid email: ${entry}`)
              return
            }
          }
        }
      }
      setError(null)
      setValue(normalized)
    },
    filterOptions: (options, params) => {
      const {getOptionLabel, inputValue} = params
      const filtered = options.filter((option) => {
        const label = getOptionLabel(option)
        return normalizeLowerNoAccents(label).includes(normalizeLowerNoAccents(inputValue))
      })
      const autocompletedEmail = autocompleteEmail(params.inputValue, viewerDomain)
      const isAlreadyInvited = guests.some((guest) => guest.email === autocompletedEmail)
      if (inputValue.length > 0 && !isAlreadyInvited) {
        filtered.unshift({
          type: 'external' as const,
          email: autocompletedEmail
        })
      }
      return filtered
    }
  })
  return {...controls, error, value, setValue}
}
