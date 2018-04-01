import PropTypes from 'prop-types';
import React from 'react';
import {textOverflow} from 'universal/styles/helpers';
import FieldLabel from 'universal/components/FieldLabel/FieldLabel';
import IconButton from 'universal/components/IconButton/IconButton';
import ui from 'universal/styles/ui';
import appTheme from 'universal/styles/theme/appTheme';
import styled, {css} from 'react-emotion';

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

const FieldGroup = styled('div')({
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  width: '100%'
});

const FieldGroupRow = styled('div')({
  display: 'flex',
  maxWidth: '100%',
  padding: '0 3.5rem',
  margin: '0 0 .5rem',
  position: 'relative'
});

const FieldRemovalBlock = styled('div')({
  padding: '0 1rem 0 0',
  position: 'absolute',
  left: '-2.5rem',
  top: '.375rem'
});

const FieldContent = styled('div')(({highlighted}) => ({
  ...textOverflow,
  animationDuration: highlighted && '1s',
  animationName: highlighted && highlightEmail,
  color: appTheme.palette.dark,
  fontSize: fieldSizeStyles.fontSize,
  lineHeight: fieldSizeStyles.lineHeight,
  padding: `${ui.controlBlockPaddingVertical.medium} 0`,
  width: '100%'
}));

const FieldArrayRow = (props) => {
  const {
    existingInvites,
    invitees,
    labelHeader,
    fields,
    hoverRow,
    onHoverRow,
    onLeaveRow
  } = props;
  const removalAriaLabel = `Tap to remove from ${labelHeader}`;
  return (
    <FieldGroup>
      <FieldGroupRow>
        <FieldLabel label={labelHeader} />
      </FieldGroupRow>
      {fields.map((item, index) =>
        (<FieldGroupRow
          key={`inviteeRow${index}`} // eslint-disable-line react/no-array-index-key
          onMouseEnter={() => onHoverRow(index)}
          onMouseLeave={() => onLeaveRow()}
        >
          <div className={css({position: 'relative'})}>
            <FieldRemovalBlock>
              {(hoverRow === index) && <IconButton
                aria-label={removalAriaLabel}
                iconName="times-circle"
                iconSize="2x"
                onClick={() => fields.remove(index)}
                title={removalAriaLabel}
              />}
            </FieldRemovalBlock>
            <FieldContent highlighted={existingInvites.includes(index)}>
              {invitees[index].label}
            </FieldContent>
          </div>
        </FieldGroupRow>)
      )}
    </FieldGroup>
  );
};

FieldArrayRow.propTypes = {
  invitees: PropTypes.array,
  existingInvites: PropTypes.array,
  labelHeader: PropTypes.string.isRequired,
  fields: PropTypes.object.isRequired,
  hoverRow: PropTypes.number,
  onHoverRow: PropTypes.func.isRequired,
  onLeaveRow: PropTypes.func.isRequired
};

export default FieldArrayRow;
