import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import ui from 'universal/styles/ui';
import appTheme from 'universal/styles/theme/appTheme';
import {cardBorderTop} from 'universal/styles/helpers';

//    TODO:
//  • To-do item (TA)

const Panel = (props) => {
  const {
    children,
    controls,
    hasHeader,
    label,
    styles
  } = props;

  return (
    <div className={css(styles.panel)}>
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
      <div className={css(styles.children)}>
        {children}
      </div>
    </div>
  );
};

Panel.propTypes = {
  children: PropTypes.any,
  controls: PropTypes.any,
  hasHeader: PropTypes.bool,
  label: PropTypes.any,
  styles: PropTypes.object
};

Panel.defaultProps = {
  hasHeader: true,
  label: 'Panel'
};

const styleThunk = () => ({
  panel: {
    display: 'flex',
    margin: '1.5rem 0',
    backgroundColor: '#fff',
    border: `1px solid ${ui.panelBorderColor}`,
    borderRadius: ui.cardBorderRadius,
    flexDirection: 'column',
    fontSize: appTheme.typography.s3,
    lineHeight: appTheme.typography.s5,
    paddingTop: '.1875rem',
    position: 'relative',
    width: '100%',

    '::after': {
      ...cardBorderTop,
      color: appTheme.palette.mid40l,
    }
  },

  header: {
    alignItems: 'center',
    display: 'flex'
  },

  label: {
    color: appTheme.palette.dark,
    fontWeight: 700,
    padding: `.75rem ${ui.panelGutter}`,
    textTransform: 'uppercase'
  },

  controls: {
    display: 'flex',
    flex: 1,
    height: '2.75rem',
    justifyContent: 'flex-end',
    lineHeight: '2.75rem',
    paddingRight: ui.panelGutter
  },

  children: {
    display: 'block',
    width: '100%'
  }
});

export default withStyles(styleThunk)(Panel);
