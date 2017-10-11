import PropTypes from 'prop-types';
import React from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import {textOverflow} from 'universal/styles/helpers';
import {Field} from 'redux-form';
import FieldLabel from 'universal/components/FieldLabel/FieldLabel';
import IconButton from 'universal/components/IconButton/IconButton';
import InputField from 'universal/components/InputField/InputField';
import ui from 'universal/styles/ui';
import appTheme from 'universal/styles/theme/appTheme';

const FieldArrayRow = (props) => {
  const {
    existingInvites,
    invitees,
    labelHeader,
    fields,
    hoverRow,
    nestedFieldHeader,
    nestedFieldName,
    onHoverRow,
    onLeaveRow,
    styles
  } = props;

  const columnLeftStyles = css(styles.fieldGroupColumn, styles.fieldGroupColumnLeft);
  const columnRightStyles = css(styles.fieldGroupColumn, styles.fieldGroupColumnRight);

  return (
    <div className={css(styles.fieldGroup)}>
      <div className={css(styles.fieldGroupRow)}>
        <div className={columnLeftStyles}>
          <FieldLabel label={labelHeader} />
        </div>
        <div className={columnRightStyles}>
          <FieldLabel fieldSize="medium" indent label={nestedFieldHeader} />
        </div>
      </div>
      {fields.map((item, index) =>
        (<div
          className={css(styles.fieldGroupRow)}
          key={`inviteeRow${index}`} // eslint-disable-line react/no-array-index-key
          onMouseEnter={() => onHoverRow(index)}
          onMouseLeave={() => onLeaveRow()}
        >
          <div className={columnLeftStyles}>
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
          <div className={columnRightStyles}>
            <Field
              autoFocus={index === 0}
              component={InputField}
              fieldSize="medium"
              name={`${item}.${nestedFieldName}`}
              placeholder="What’s their priority this week?"
              type="text"
              underline
            />
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
    fontWeight: 800
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
    paddingLeft: '3.5rem',
    paddingRight: '3.5rem',
    width: '47.5rem'
  },

  fieldGroupColumn: {
    margin: '0 0 1rem',
    position: 'relative'
  },

  // NOTE: Modifies fieldGroupColumn
  fieldGroupColumnLeft: {
    width: '40%'
  },
  fieldGroupColumnRight: {
    width: '60%'
  },

  fieldLabel: {
    ...textOverflow,
    color: appTheme.palette.dark,
    fontSize: fieldSizeStyles.fontSize,
    lineHeight: fieldSizeStyles.lineHeight,
    padding: `${ui.controlBlockPaddingVertical.medium} 1rem ${ui.controlBlockPaddingVertical.medium} 0`,
    width: '100%'
  },

  fieldRemovalBlock: {
    padding: '0 1rem 0 0',
    position: 'absolute',
    right: '100%',
    top: '.375rem'
  },

  highlighted: {
    animationDuration: '1s',
    animationName: highlightEmail
  }
});

export default withStyles(styleThunk)(FieldArrayRow);
