import {css} from 'aphrodite-local-styles/no-important'
import PropTypes from 'prop-types'
import React from 'react'
import ui from '../styles/ui'
import withStyles from '../styles/withStyles'

const dontTellDraft = (e) => {
  e.preventDefault()
}

const AsyncEditorSuggestions = (props) => {
  const {activeIdx, handleSelect, styles, suggestions, SuggestionItem} = props

  const menuStyles = css(styles.mentionMenu)
  return (
    <div className={menuStyles}>
      {suggestions &&
        suggestions.map((suggestion, idx) => {
          return (
            // eslint-disable-next-line
            <div key={idx} onMouseDown={dontTellDraft} onClick={handleSelect(idx)}>
              <SuggestionItem active={activeIdx === idx} {...suggestion} />
            </div>
          )
        })}
    </div>
  )
}

AsyncEditorSuggestions.propTypes = {
  activeIdx: PropTypes.number.isRequired,
  handleSelect: PropTypes.func.isRequired,
  styles: PropTypes.object,
  suggestions: PropTypes.array,
  SuggestionItem: PropTypes.any.isRequired
}

const styleThunk = () => ({
  mentionMenu: {
    color: ui.palette.dark
  }
})

export default withStyles(styleThunk)(AsyncEditorSuggestions)
