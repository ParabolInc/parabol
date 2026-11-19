interface Props {
  organizationNames: readonly string[] | null
  hasPrivatePages: boolean
}

const getLabel = ({organizationNames, hasPrivatePages}: Props) => {
  const orgsLabel = organizationNames ? organizationNames.join(', ') : 'All my organizations'
  if (orgsLabel) return hasPrivatePages ? `${orgsLabel} + private pages` : orgsLabel
  return hasPrivatePages ? 'Private pages only' : 'No organizations'
}

const ConnectedAppOrganizations = (props: Props) => (
  <>
    <div className='font-medium text-fg-primary'>{getLabel(props)}</div>
    {!props.organizationNames && (
      <div className='text-fg-muted text-xs'>Including ones you join later</div>
    )}
  </>
)

export default ConnectedAppOrganizations
