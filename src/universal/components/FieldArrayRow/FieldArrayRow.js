import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import {textOverflow} from 'universal/styles/helpers';
import {Field} from 'redux-form';
import IconButton from 'universal/components/IconButton/IconButton';
import InputField from 'universal/components/InputField/InputField';
import appTheme from 'universal/styles/theme/appTheme';

const FieldArrayRow = props => {
  const {
    labelGetter,
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
  const fieldLabelStyles = css(styles.fieldGroupLabel, styles.fieldGroupLabelForFields);

  return (
    <div className={css(styles.fieldGroup)}>
      <div className={css(styles.fieldGroupRow)}>
        <div className={columnLeftStyles}>
          <div className={css(styles.fieldGroupLabel)}>
            {labelHeader}
          </div>
        </div>
        <div className={columnRightStyles}>
          <div className={fieldLabelStyles}>
            {nestedFieldHeader}
          </div>
        </div>
      </div>
      {fields.map((item, index) =>
        <div
          className={css(styles.fieldGroupRow)}
          key={index}
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
            <div className={css(styles.fieldLabel)}>
              {labelGetter(index)}
            </div>
          </div>
          <div className={columnRightStyles}>
            <Field
              autoFocus={index === 0}
              component={InputField}
              name={`${item}.${nestedFieldName}`}
              placeholder="What’s their priority this week?"
              type="text"
            />
          </div>
        </div>
      )}
    </div>
  );
};

FieldArrayRow.propTypes = {
  labelGetter: PropTypes.func.isRequired,
  labelHeader: PropTypes.string.isRequired,
  fields: PropTypes.object.isRequired,
  hoverRow: PropTypes.number,
  nestedFieldHeader: PropTypes.string.isRequired,
  nestedFieldName: PropTypes.string.isRequired,
  onHoverRow: PropTypes.func.isRequired,
  onLeaveRow: PropTypes.func.isRequired,
  styles: PropTypes.object
};

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
    position: 'relative',
  },

  // NOTE: Modifies fieldGroupColumn
  fieldGroupColumnLeft: {
    width: '40%'
  },
  fieldGroupColumnRight: {
    width: '60%'
  },

  fieldGroupLabel: {
    color: appTheme.palette.dark,
    fontSize: appTheme.typography.s2,
    fontWeight: 700,
    margin: '0 0 .5rem',
    textTransform: 'uppercase'
  },

  // NOTE: Modifies fieldGroupLabel
  fieldGroupLabelForFields: {
    paddingLeft: '.5rem'
  },

  fieldLabel: {
    ...textOverflow,
    color: appTheme.palette.dark,
    fontSize: appTheme.typography.s4,
    lineHeight: 1.5,
    padding: '.125rem 1rem .125rem 0',
    width: '100%'
  },

  fieldRemovalBlock: {
    padding: '0 1rem 0 0',
    position: 'absolute',
    right: '100%',
    top: '.125rem'
  },
});

export default withStyles(styleThunk)(FieldArrayRow);
