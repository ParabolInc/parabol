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
  if (input.endsWith(`@${domain}`) || input === '@') {
    return input
  }
  const parts = input.split('@')

  if (parts.length > 1 && (parts[1] ?? '').length > 0) {
    return input
  }

  return `${parts[0]}@${domain}`
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
      defaultValue={undefined}
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

        if (params.inputValue) {
          filtered.unshift(createCustomOption(autocompleteEmail(params.inputValue, viewerDomain)))
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
