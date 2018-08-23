import React from 'react'
import LoadableMenu from 'universal/components/LoadableMenu'
import HelpMenuToggle from 'universal/components/MeetingHelp/HelpMenuToggle'

const originAnchor = {
  vertical: 'bottom',
  horizontal: 'right'
}

const targetAnchor = {
  vertical: 'bottom',
  horizontal: 'right'
}

const withHelpMenu = (ComposedComponent) => (props) => {
  const {isFacilitating, ...queryVars} = props
  return (
    <LoadableMenu
      LoadableComponent={ComposedComponent}
      maxWidth={280}
      maxHeight={320}
      originAnchor={originAnchor}
      queryVars={queryVars}
      targetAnchor={targetAnchor}
      toggle={<HelpMenuToggle isFacilitating={isFacilitating} />}
    />
  )
}

export default withHelpMenu
