import PropTypes from 'prop-types';
import React from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import {textOverflow} from 'universal/styles/helpers';
import FieldLabel from 'universal/components/FieldLabel/FieldLabel';
import IconButton from 'universal/components/IconButton/IconButton';
import ui from 'universal/styles/ui';
import appTheme from 'universal/styles/theme/appTheme';

const FieldArrayRow = (props) => {
  const {
    existingInvites,
    invitees,
    labelHeader,
    fields,
    hoverRow,
    onHoverRow,
    onLeaveRow,
    styles
  } = props;

  return (
    <div className={css(styles.fieldGroup)}>
      <div className={css(styles.fieldGroupRow)}>
        <FieldLabel label={labelHeader} />
      </div>
      {fields.map((item, index) =>
        (<div
          className={css(styles.fieldGroupRow)}
          key={`inviteeRow${index}`} // eslint-disable-line react/no-array-index-key
          onMouseEnter={() => onHoverRow(index)}
          onMouseLeave={() => onLeaveRow()}
        >
          <div className={css(styles.relativeParent)}>
            <div className={css(styles.fieldRemovalBlock)}>
              {(hoverRow === index) && <IconButton
                iconName="times-circle"
                iconSize="2x"
                onClick={() => fields.remove(index)}
                title="Remove"
              />}
            </div>
            <div className={css(styles.fieldLabel, existingInvites.includes(index) && styles.highlighted)}>
              {invitees[index].label}
            </div>
          </div>
        </div>)
      )}
    </div>
  );
};

FieldArrayRow.propTypes = {
  invitees: PropTypes.array,
  existingInvites: PropTypes.array,
  labelHeader: PropTypes.string.isRequired,
  fields: PropTypes.object.isRequired,
  hoverRow: PropTypes.number,
  nestedFieldHeader: PropTypes.string.isRequired,
  nestedFieldName: PropTypes.string.isRequired,
  onHoverRow: PropTypes.func.isRequired,
  onLeaveRow: PropTypes.func.isRequired,
  styles: PropTypes.object
};

const highlightEmail = {
  '20%': {
    color: appTheme.palette.warm,
    fontSize: appTheme.typography.s4,
    fontWeight: 600
  },
  '100%': {
    color: appTheme.palette.dark,
    fontWeight: 'normal'
  }
};

const fieldSizeStyles = ui.fieldSizeStyles.medium;

const styleThunk = () => ({
  fieldGroup: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    width: '100%'
  },

  fieldGroupRow: {
    display: 'flex',
    maxWidth: '100%',
    paddingLeft: '22rem',
    paddingRight: '3.5rem',
    width: '47.5rem',
    margin: '0 0 1rem',
    position: 'relative'
  },

  fieldLabel: {
    ...textOverflow,
    color: appTheme.palette.dark,
    fontSize: fieldSizeStyles.fontSize,
    lineHeight: fieldSizeStyles.lineHeight,
    padding: `${ui.controlBlockPaddingVertical.medium} 0`,
    width: '100%'
  },

  fieldRemovalBlock: {
    padding: '0 1rem 0 0',
    position: 'absolute',
    left: '-2.5rem',
    top: '.375rem'
  },

  highlighted: {
    animationDuration: '1s',
    animationName: highlightEmail
  },

  relativeParent: {
    position: 'relative'
  }
});

export default withStyles(styleThunk)(FieldArrayRow);
