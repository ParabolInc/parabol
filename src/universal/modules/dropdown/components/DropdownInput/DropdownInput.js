import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import FontAwesome from 'react-fontawesome';
import FieldBlock from 'universal/components/FieldBlock/FieldBlock';
import FieldLabel from 'universal/components/FieldLabel/FieldLabel';
import ui from 'universal/styles/ui';
import makeFieldColorPalette from 'universal/styles/helpers/makeFieldColorPalette';
import makeHoverFocus from 'universal/styles/helpers/makeHoverFocus';
import {Menu, MenuItem} from 'universal/modules/menu';
import Button from 'universal/components/Button/Button';

const originAnchor = {
  vertical: 'bottom',
  horizontal: 'right'
};

const targetAnchor = {
  vertical: 'top',
  horizontal: 'right'
};

const DropdownInput = (props) => {
  const {handleCreateNew, input: {name, onChange, value}, label, organizations = [], styles} = props;
  const org = organizations.find((anOrg) => anOrg.id === value);
  const orgName = org && org.name || 'Loading...';
  const toggle = <FontAwesome className={css(styles.downButton)} name="chevron-down"/>;
  const itemFactory = () => {
    return organizations.map((anOrg, idx) => {
      return (
        <MenuItem
          isActive={value === anOrg.id}
          key={`orgDropdownMenuItem${idx}`}
          label={anOrg.name}
          onClick={() => {
            onChange(anOrg.id);
          }}
        />
      );
    })
      .concat(<MenuItem
        key={'newOrg'}
        label={
          <div className={css(styles.menuButtonBlock)}>
            <Button colorPalette="mid" isBlock label="Create New Organization" size="smallest" onClick={handleCreateNew}/>
          </div>
        }
      />);
  };
  return (
    <FieldBlock>
      {label && <FieldLabel label={label} htmlFor={name}/>}
      <div className={css(styles.inputBlock)}>
        <span>{orgName}</span>
        <Menu
          originAnchor={originAnchor}
          menuWidth="13rem"
          targetAnchor={targetAnchor}
          toggle={toggle}
          itemFactory={itemFactory}
          label="Select Organization:"
        />
      </div>
    </FieldBlock>
  );
};

DropdownInput.propTypes = {
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

export default withStyles(styleThunk)(DropdownInput);
