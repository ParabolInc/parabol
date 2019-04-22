import PropTypes from 'prop-types'
import React from 'react'
import withStyles from 'universal/styles/withStyles'
import {css} from 'aphrodite-local-styles/no-important'
import {ROW_BORDER_COLOR, ROW_GUTTER} from 'universal/styles/rows'
import Panel from 'universal/components/Panel/Panel'
import Type from 'universal/components/Type/Type'

const CallOutPanel = (props) => {
  const {children, control, heading, panelLabel, styles} = props

  const panelBodyStyles = css(styles.panelBody, panelLabel && styles.panelBodyWithHeader)

  return (
    <Panel label={panelLabel}>
      <div className={panelBodyStyles}>
        <Type align='center' bold marginBottom='.5rem' scale='s6'>
          {heading}
        </Type>
        <Type align='center' marginBottom='1.5rem' scale='s4'>
          {children}
        </Type>
        {control}
      </div>
    </Panel>
  )
}

CallOutPanel.propTypes = {
  children: PropTypes.any,
  control: PropTypes.any,
  heading: PropTypes.any,
  panelLabel: PropTypes.any,
  styles: PropTypes.object
}

const styleThunk = () => ({
  panelBody: {
    padding: `32px ${ROW_GUTTER}px`,
    textAlign: 'center'
  },

  panelBodyWithHeader: {
    borderTop: `1px solid ${ROW_BORDER_COLOR}`
  }
})

export default withStyles(styleThunk)(CallOutPanel)
