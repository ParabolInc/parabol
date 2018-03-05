import PropTypes from 'prop-types';
import React from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import ui from 'universal/styles/ui';
import appTheme from 'universal/styles/theme/appTheme';

const Panel = (props) => {
  const {
    children,
    controls,
    hasHeader,
    hideFirstRowBorder,
    label,
    styles
  } = props;

  return (
    <div className={css(styles.panel, styles.depth)}>
      {hasHeader &&
        <div className={css(styles.header)}>
          <div className={css(styles.label)}>
            {label}
          </div>
          <div className={css(styles.controls)}>
            {controls}
          </div>
        </div>
      }
      {/*
          NOTE: “hideFirstRowBorder”
          children may only be a set of rows,
          and in the absense of a panel header,
          we may want to avoid fuzzies by hiding
          the first row’s top border
      */}
      <div className={css(styles.children, hideFirstRowBorder && styles.hideFirstRowBorder)}>
        {children}
      </div>
    </div>
  );
};

Panel.propTypes = {
  bgTheme: PropTypes.oneOf([
    'light',
    'white'
  ]),
  children: PropTypes.any,
  compact: PropTypes.bool,
  controls: PropTypes.any,
  hasHeader: PropTypes.bool,
  hideFirstRowBorder: PropTypes.bool,
  label: PropTypes.any,
  styles: PropTypes.object
};

Panel.defaultProps = {
  hasHeader: true,
  label: 'Panel'
};

const bgThemeValues = {
  light: appTheme.palette.light40l,
  white: '#fff'
};

const styleThunk = (theme, {bgTheme, compact}) => ({
  panel: {
    backgroundColor: bgTheme ? bgThemeValues[bgTheme] : bgThemeValues.white,
    boxShadow: ui.panelBoxShadow,
    borderRadius: ui.cardBorderRadius,
    display: 'flex',
    flexDirection: 'column',
    fontSize: appTheme.typography.s3,
    lineHeight: appTheme.typography.s5,
    margin: `${ui.panelMarginVertical} 0`,
    position: 'relative',
    width: '100%'
  },

  header: {
    alignItems: 'center',
    display: 'flex'
  },

  label: {
    color: ui.labelHeadingColor,
    fontSize: ui.labelHeadingFontSize,
    fontWeight: ui.labelHeadingFontWeight,
    letterSpacing: ui.labelHeadingLetterSpacing,
    lineHeight: ui.labelHeadingLineHeight,
    padding: `.75rem ${compact ? ui.panelCompactGutter : ui.panelGutter}`,
    textTransform: 'uppercase'
  },

  controls: {
    display: 'flex',
    flex: 1,
    height: '2.75rem',
    justifyContent: 'flex-end',
    lineHeight: '2.75rem',
    paddingRight: compact ? ui.panelCompactGutter : ui.panelGutter
  },

  children: {
    display: 'block',
    width: '100%'
  },

  hideFirstRowBorder: {
    marginTop: '-.0625rem'
  }
});

export default withStyles(styleThunk)(Panel);
