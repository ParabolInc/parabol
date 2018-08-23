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

const withHelpMenu = (ComposedComponent) => (props) => (
  <LoadableMenu
    LoadableComponent={ComposedComponent}
    maxWidth={280}
    maxHeight={320}
    originAnchor={originAnchor}
    queryVars={props}
    targetAnchor={targetAnchor}
    toggle={<HelpMenuToggle />}
  />
)

export default withHelpMenu
