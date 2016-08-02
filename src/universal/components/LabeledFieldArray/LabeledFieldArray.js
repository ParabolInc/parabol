import React, {PropTypes, Component} from 'react';
import look, {StyleSheet} from 'react-look';
import {FieldArray} from 'redux-form';
import {textOverflow} from 'universal/styles/helpers';
import theme from 'universal/styles/theme';
import Field from 'universal/components/Field/Field';
import IconButton from 'universal/components/IconButton/IconButton';

const combineStyles = StyleSheet.combineStyles;
let styles = {};

/*
 * Why are we defining this here?
 * See: https://github.com/erikras/redux-form/releases/tag/v6.0.0-alpha.14
 */
const FieldsBlock = props => {
  const {
    labelGetter,
    labelHeader,
    fields,
    hoverRow,
    nestedFieldHeader,
    nestedFieldName,
    onHoverRow,
    onLeaveRow
  } = props;

  const columnLeftStyles = combineStyles(styles.fieldGroupColumn, styles.fieldGroupColumnLeft);
  const columnRightStyles = combineStyles(styles.fieldGroupColumn, styles.fieldGroupColumnRight);
  const fieldLabelStyles = combineStyles(styles.fieldGroupLabel, styles.fieldGroupLabelForFields);

  return (
    <div className={styles.fieldGroup}>
      <div className={styles.fieldGroupRow}>
        <div className={columnLeftStyles}>
          <div className={styles.fieldGroupLabel}>
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
          className={styles.fieldGroupRow}
          key={index}
          onMouseEnter={() => onHoverRow(index)}
          onMouseLeave={() => onLeaveRow()}
        >
          <div className={columnLeftStyles}>
            <div className={styles.fieldRemovalBlock}>
              {(hoverRow === index) && <IconButton
                iconName="times-circle"
                iconSize="2x"
                onClick={() => fields.remove(index)}
                title="Remove"
              />}
            </div>
            <div className={styles.fieldLabel}>
              {labelGetter(index)}
            </div>
          </div>
          <div className={columnRightStyles}>
            <Field
              autoFocus={index === 0}
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

FieldsBlock.propTypes = {
  labelGetter: PropTypes.func.isRequired,
  labelHeader: PropTypes.string.isRequired,
  fields: PropTypes.object.isRequired,
  hoverRow: PropTypes.number,
  nestedFieldHeader: PropTypes.string.isRequired,
  nestedFieldName: PropTypes.string.isRequired,
  onHoverRow: PropTypes.func.isRequired,
  onLeaveRow: PropTypes.func.isRequired
};


@look
export default class LabeledFieldArray extends Component {
  static propTypes = {
    labelGetter: PropTypes.func.isRequired,
    labelHeader: PropTypes.string.isRequired,
    labelSource: PropTypes.string.isRequired,
    nestedFieldHeader: PropTypes.string.isRequired,
    nestedFieldName: PropTypes.string.isRequired
  };

  constructor(props) {
    super(props);
    this.onHoverRow = this.onHoverRow.bind(this);
    this.onLeaveRow = this.onLeaveRow.bind(this);
    this.state = {
      hoverRow: null
    };
  }

  onHoverRow(index) { this.setState({ hoverRow: index }); }
  onLeaveRow() { this.setState({ hoverRow: null }); }

  render() {
    const {
      labelSource,
    } = this.props;

    const {hoverRow} = this.state;


    return (
      <FieldArray
        name={labelSource}
        component={FieldsBlock}
        hoverRow={hoverRow}
        onHoverRow={this.onHoverRow}
        onLeaveRow={this.onLeaveRow}
        {...this.props}
      />
    );
  }
}


styles = StyleSheet.create({
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
    color: theme.palette.dark,
    fontSize: theme.typography.s2,
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
    color: theme.palette.dark,
    fontSize: theme.typography.s4,
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
