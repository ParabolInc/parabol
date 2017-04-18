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
  constructor(props) {
    super(props);
    const {dropdownText} = props;
    this.state = {
      dropdownText
    };
  }

  render() {
    const {accessToken, dropdownMapper, handleItemClick, input: {name, onChange, value}, itemClick, label, options, styles} = this.props;
    const toggle = <FontAwesome className={css(styles.downButton)} name="chevron-down" onClick={dropdownMapper}/>;
    const handleClick = (e) => {
      this.setState({

      })
    }
    return (
      <FieldBlock>
        {label && <FieldLabel label={label} htmlFor={name}/>}
        <div className={css(styles.inputBlock)}>
          <span>{this.state.dropdownText}</span>
          <Menu
            menuWidth="20rem"
            originAnchor={originAnchor}
            targetAnchor={targetAnchor}
            toggle={toggle}
          >
            {options.map((option) => {
              const onClick = (e) => {
                this.setState({
                  dropdownText: option.label
                });
                handleItemClick(option)(e);
              };
              return (
                <MenuItem
                  isActive={false}
                  key={`serviceDropdownMenuItem${option.id}`}
                  label={option.label}
                  onClick={onClick}
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
    position: 'relative'
  },

  menuButtonBlock: {
    backgroundColor: '#fff',
    borderTop: `1px solid ${ui.menuBorderColor}`,
    padding: '.5rem .5rem 0',
    width: '100%'
  }
});

export default withStyles(styleThunk)(ServiceDropdownInput);
