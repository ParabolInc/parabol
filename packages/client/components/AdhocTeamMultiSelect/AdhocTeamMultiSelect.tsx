import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'

import {AdhocTeamMultiSelect_viewer$key} from '../../__generated__/AdhocTeamMultiSelect_viewer.graphql'
import {Send as SendIcon} from '@mui/icons-material'
import {Chip} from '../../ui/Chip/Chip'

export type Option = {
  id: string | null
  label: string
  email: string
  picture: string | null
  organizationIds: string[]
}

interface Props {
  viewerRef: AdhocTeamMultiSelect_viewer$key
  value: Option[]
  onChange: (values: Option[]) => void
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

export const AdhocTeamMultiSelect = (props: Props) => {
  const {viewerRef, onChange, value} = props
  const viewer = useFragment(
    graphql`
      fragment AdhocTeamMultiSelect_viewer on User {
        id
        email
        organizations {
          id
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
        }
      }
    `,
    viewerRef
  )

  const {email, organizations} = viewer
  const viewerDomain = email.slice(email.indexOf('@') + 1)

  const usersMap: {[key: string]: Option} = {}

  organizations.forEach((org) => {
    org.organizationUsers.edges.forEach((edge) => {
      const user = edge.node.user
      if (!usersMap[user.id]) {
        usersMap[user.id] = {
          id: user.id,
          label: user.preferredName,
          email: user.email,
          picture: user.picture,
          organizationIds: [org.id]
        }
      } else {
        usersMap[user.id]?.organizationIds.push(org.id)
      }
    })
  })

  const options = Object.values(usersMap)

  const createCustomOption = (option: string): Option => {
    return {
      label: `Invite ${option}`,
      email: option,
      organizationIds: [],
      picture: null,
      id: null
    }
  }

  return (
    <Autocomplete
      multiple
      options={options}
      value={value}
      freeSolo
      onChange={(_: any, newValue: (Option | string)[]) => {
        const normalizedNewValue = newValue.map((value) =>
          typeof value === 'string' ? createCustomOption(value) : value
        )
        onChange(normalizedNewValue)
      }}
      filterOptions={(options, params) => {
        const filtered = options.filter((option) => {
          const label = typeof option === 'string' ? option : option.label
          return label.toLowerCase().includes(params.inputValue.toLowerCase())
        })

        const autocompletedEmail = autocompleteEmail(params.inputValue, viewerDomain)
        const suggestedInvitationOption = createCustomOption(autocompletedEmail)

        if (params.inputValue) {
          filtered.unshift(suggestedInvitationOption)
        }

        return filtered
      }}
      renderTags={(value, getTagProps) =>
        value.map((option: Option, index: number) => {
          return (
            <Chip
              label={option.label}
              picture={option.picture}
              icon={!option.id ? <SendIcon className='text-base' /> : null}
              {...getTagProps({index})}
              key={index}
            />
          )
        })
      }
      renderOption={(props, option) => {
        return (
          <li {...props}>
            {!option.id && <SendIcon className='mr-2 text-base' />}
            {option.label}
          </li>
        )
      }}
      renderInput={(params) => (
        <TextField {...params} variant='filled' placeholder='ex. Traci or traci@company.com' />
      )}
    />
  )
}
