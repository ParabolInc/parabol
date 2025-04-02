import {useAutocomplete} from '@mui/base/useAutocomplete'
import CheckIcon from '@mui/icons-material/Check'
import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useFragment} from 'react-relay'

import {Send as SendIcon} from '@mui/icons-material'
import {AdhocTeamMultiSelect_viewer$key} from '../../__generated__/AdhocTeamMultiSelect_viewer.graphql'
import {Chip} from '../../ui/Chip/Chip'
import {emailRegex} from '../../validation/regex'

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
  multiple?: boolean
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
  const {viewerRef, onChange, value, multiple = true} = props
  const [error, setError] = useState<string | null>(null)

  const viewer = useFragment(
    graphql`
      fragment AdhocTeamMultiSelect_viewer on User {
        id
        email
        organization(orgId: $orgId) {
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

  const {email, organization} = viewer
  const viewerDomain = email.slice(email.indexOf('@') + 1)

  const usersMap: {[key: string]: Option} = {}

  if (organization) {
    organization.organizationUsers.edges.forEach((edge) => {
      const user = edge.node.user
      if (user.id === viewer.id) {
        return
      }
      if (!usersMap[user.id]) {
        usersMap[user.id] = {
          id: user.id,
          label: user.preferredName,
          email: user.email,
          picture: user.picture,
          organizationIds: [organization.id]
        }
      }
    })
  }

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

  const {
    getRootProps,
    getInputProps,
    getTagProps,
    getListboxProps,
    getOptionProps,
    groupedOptions,
    setAnchorEl
  } = useAutocomplete<Option, true, true, true>({
    multiple: true,
    autoSelect: true,
    options,
    value,
    freeSolo: true,
    isOptionEqualToValue: (option, value) => {
      return !!(option.id && value.id && option.id === value.id)
    },
    onChange: (_: any, newValue: (Option | string)[]) => {
      // We manually handle multiple = false, as we want chips and multiple behaviour but just limit items to 1
      const valueArray = multiple ? newValue : newValue[0] ? [newValue[1] ?? newValue[0]] : []

      const normalizedNewValue = valueArray.map((value) =>
        typeof value === 'string' ? createCustomOption(value) : value
      )

      const isValid =
        !normalizedNewValue.length ||
        normalizedNewValue.some((value) => emailRegex.test(value.email))
      if (!isValid) {
        setError('Please enter a valid email')
        return
      }

      setError(null)
      onChange(normalizedNewValue)
    },
    filterOptions: (options, params) => {
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
    }
  })

  return (
    <div>
      <div {...getRootProps()}>
        <div
          ref={setAnchorEl}
          className='align-center flex min-h-[44px] w-full flex-wrap rounded-sm border border-slate-500 bg-white px-1 py-0.5 text-sm'
        >
          {value.map((option, index: number) => (
            <Chip
              label={option.label}
              picture={option.picture}
              icon={!option.id ? <SendIcon className='text-base' /> : null}
              {...getTagProps({index})}
              key={option.id ?? option.email}
              className='m-0.5'
            />
          ))}
          <input
            {...getInputProps()}
            placeholder={!value.length ? 'ex. Traci or traci@example.com' : ''}
            className='m-0 box-border min-h-[36px] w-0 min-w-[30px] grow border-0 bg-white pl-1 text-black outline-hidden'
          />
        </div>
        {error && <div className='mt-2 text-sm font-semibold text-tomato-500'>{error}</div>}
      </div>
      {groupedOptions.length > 0 ? (
        <ul
          {...getListboxProps()}
          className='absolute z-50 mt-0.5 h-auto max-h-64 w-[300px] list-none overflow-y-auto rounded-sm bg-white p-0 shadow-card-1'
        >
          {(groupedOptions as Option[]).map((option, index) => {
            const optionProps = getOptionProps({option, index})
            const isSelected = optionProps['aria-selected']
            return (
              <li
                {...optionProps}
                key={option.id ?? option.email}
                className={`[&.Mui-focused]:bg-slate-100 ${
                  isSelected ? 'bg-slate-100' : ''
                } flex h-10 w-full cursor-pointer items-center justify-between rounded px-3 text-sm outline-hidden select-none hover:bg-slate-100 focus:bg-slate-100 data-disabled:pointer-events-none data-disabled:opacity-50`}
              >
                {!option.id && <SendIcon className='mr-2 text-base' />}
                {option.id && (
                  <div className='relative mr-2 h-6 w-6 rounded-sm border border-slate-100'>
                    <div
                      className='h-6 w-6 rounded-full bg-cover bg-center bg-no-repeat'
                      style={{backgroundImage: `url('${option.picture}')`}}
                    />
                  </div>
                )}
                <span className={'grow'}>{option.label}</span>

                {isSelected && <CheckIcon className='h-5 w-5' />}
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}
