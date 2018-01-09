// @flow
import React from 'react';
import PlainButton from 'universal/components/PlainButton/PlainButton';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import FontAwesome from 'react-fontawesome';
import ui from 'universal/styles/ui';

const iconStyle = {
  fontSize: ui.iconSize2x,
  height: '1.5rem',
  lineHeight: '1.5rem',
  paddingTop: '1px'
};

const _styles = {
  addIcon: {
    ':hover': {
      cursor: 'pointer',
      opacity: '.5'
    },
    ':focus': {
      cursor: 'pointer',
      opacity: '.5'
    }
  }
};

type Props = {
  'aria-haspopup'?: bool | string,
  label: string,
  onClick: () => void,
  styles: typeof _styles,
};

const AddProjectButton = (props: Props) => {
  const {styles, label, onClick} = props;
  return (
    <PlainButton
      onClick={onClick}
      title={`Add a Project to "${label}"`}
      aria-haspopup={props['aria-haspopup']}
    >
      <FontAwesome
        className={css(styles.addIcon)}
        name="plus-square-o"
        style={iconStyle}
      />
    </PlainButton>
  );
};

const styleThunk = () => _styles;

export default withStyles(styleThunk)(AddProjectButton);
