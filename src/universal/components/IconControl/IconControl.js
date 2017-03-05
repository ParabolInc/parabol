import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import FontAwesome from 'react-fontawesome';

//    TODO:
//  • Add disabled state (TA)

const IconControl = (props) => {
  const {
    icon,
    iconSize,
    label,
    onClick,
    styles,
    title
  } = props;

  const iconStyles = {
    display: 'inline-block',
    fontSize: iconSize,
    lineHeight: 'inherit',
    marginRight: '.5rem',
    verticalAlign: 'middle'
  };

  const titleString = title || label;

  return (
    <button className={css(styles.control)} onClick={onClick} title={titleString}>
      <FontAwesome name={icon} style={iconStyles} />
      <div className={css(styles.label)}>
        {label}
      </div>
    </button>
  );
};

IconControl.propTypes = {
  fontSize: PropTypes.string,
  icon: PropTypes.string,
  iconSize: PropTypes.string,
  label: PropTypes.string,
  lineHeight: PropTypes.string,
  padding: PropTypes.string,
  onClick: PropTypes.func,
  styles: PropTypes.object,
  title: PropTypes.string
};

IconControl.defaultProps = {
  label: 'Icon Control'
};

const styleThunk = (customTheme, props) => ({
  control: {
    appearance: 'none',
    background: 'transparent',
    border: 0,
    borderRadius: 0,
    boxShadow: 'none',
    color: appTheme.palette.cool,
    cursor: 'pointer',
    fontFamily: appTheme.typography.sansSerif,
    fontSize: 0,
    padding: props.padding || 0,
    userSelect: 'none',

    ':hover': {
      opacity: '.5'
    },
    ':focus': {
      opacity: '.5'
    }
  },

  label: {
    display: 'inline-block',
    fontSize: props.fontSize || appTheme.typography.s3,
    fontWeight: 700,
    lineHeight: props.lineHeight || appTheme.typography.s5,
    verticalAlign: 'middle'
  }
});

export default withStyles(styleThunk)(IconControl);
