import PropTypes from 'prop-types';
import React from 'react';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import CreateCardRootStyles from './CreateCardRootStyles';
import styled, {css, cx} from 'react-emotion';

const CardBlock = css({
  ...CreateCardRootStyles,
  backgroundColor: 'transparent',
  border: `.0625rem dashed ${appTheme.palette.mid30l}`,
  boxShadow: 0,
  paddingLeft: 0,
  paddingRight: 0
});

const CardWithControls = css({
  ...CreateCardRootStyles,
  backgroundColor: appTheme.palette.mid10a,
  boxShadow: 'none',
  borderTop: 0,
  paddingLeft: 0,
  paddingRight: 0,
  transition: 'background-color 100ms ease-in, box-shadow 100ms ease-in',
  '&:hover': {
    backgroundColor: ui.palette.white,
    boxShadow: ui.shadow[2],
    cursor: 'pointer'
  }
});

const ControlBlock = styled('div')({
  alignContent: 'center',
  alignSelf: 'stretch',
  color: appTheme.palette.mid,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  lineHeight: '1.5',
  textAlign: 'center',
  width: '100%'
});

const ControlLabel = styled('div')({
  fontSize: ui.cardContentFontSize,
  fontWeight: 600
});

const ControlHint = styled('div')({
  fontSize: ui.hintFontSize,
  opacity: '.7'
});

const CreateCard = (props) => {
  const {handleAddTask, hasControls} = props;
  const cardStyles = cx(CardBlock, hasControls && CardWithControls);
  return (
    <div className={cardStyles}>
      {hasControls &&
        <ControlBlock onClick={handleAddTask} title="Add a Task (just press “t”)">
          <ControlLabel>
            {'Add a '}<u>{'T'}</u>{'ask'}
          </ControlLabel>
          <ControlHint>
            {'(tag '}<b>{'#private'}</b>{' for personal Tasks)'}
          </ControlHint>
        </ControlBlock>
      }
    </div>
  );
};

CreateCard.propTypes = {
  handleAddTask: PropTypes.func,
  hasControls: PropTypes.bool
};

export default CreateCard;
