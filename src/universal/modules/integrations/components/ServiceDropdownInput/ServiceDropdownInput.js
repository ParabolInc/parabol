import React, {Component, PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import FontAwesome from 'react-fontawesome';
import FieldBlock from 'universal/components/FieldBlock/FieldBlock';
import FieldLabel from 'universal/components/FieldLabel/FieldLabel';
import ui from 'universal/styles/ui';
import makeFieldColorPalette from 'universal/styles/helpers/makeFieldColorPalette';
import makeHoverFocus from 'universal/styles/helpers/makeHoverFocus';
import {Menu, MenuItem} from 'universal/modules/menu';
import ms from 'ms';
import ghFetch from "../../../../utils/ghFetch";

const originAnchor = {
  vertical: 'bottom',
  horizontal: 'right'
};

const targetAnchor = {
  vertical: 'top',
  horizontal: 'right'
};

let lastUpdated = 0;
class ServiceDropdownInput extends Component {
  constructor() {
    super();
    this.state = {
      options: []
    }
  }

  render() {
    const {accessToken, dropdownMapper, dropdownText, input: {name, onChange, value}, itemClick, label, organizations = [], styles} = this.props;
    const toggle = <FontAwesome className={css(styles.downButton)} name="chevron-down" onClick={dropdownMapper(accessToken, lastUpdated)}/>;
    return (
      <FieldBlock>
        {label && <FieldLabel label={label} htmlFor={name}/>}
        <div className={css(styles.inputBlock)}>
          <span>{dropdownText}</span>
          <Menu
            menuWidth="20rem"
            originAnchor={originAnchor}
            targetAnchor={targetAnchor}
            toggle={toggle}
          >
            {this.state.options.map((repo) => {
              return (
                <MenuItem
                  isActive={false}
                  key={`serviceDropdownMenuItem${repo.id}`}
                  label={repo.label}
                  onClick={itemClick(accessToken, repo)}
                />
              )
            })}
          </Menu>
        </div>
      </FieldBlock>
    )
      ;
  }
}
;

ServiceDropdownInput.propTypes = {
  handleCreateNew: PropTypes.func,
  input: PropTypes.shape({
    name: PropTypes.string,
    onChange: PropTypes.func,
    value: PropTypes.string
  }),
  label: PropTypes.string,
  organizations: PropTypes.array,
  styles: PropTypes.object
};

const styleThunk = () => ({
  downButton: {
    cursor: 'pointer',
    fontSize: `${ui.iconSize} !important`,
    height: '100% !important',
    lineHeight: '2.25rem !important',
    padding: '0 1rem 0 0',
    position: 'absolute',
    right: 0,
    textAlign: 'right',
    top: 0,
    width: '100%'
  },

  inputBlock: {
    ...ui.fieldBaseStyles,
    ...makeFieldColorPalette('gray'),
    ...makeHoverFocus({
      borderColor: ui.fieldColorPalettes.gray.focusBorderColor,
      boxShadow: ui.fieldBoxShadow
    }),
    position: 'relative',
    width: '20rem'
  },

  menuButtonBlock: {
    backgroundColor: '#fff',
    borderTop: `1px solid ${ui.menuBorderColor}`,
    padding: '.5rem .5rem 0',
    width: '100%'
  }
});

export default withStyles(styleThunk)(ServiceDropdownInput);
