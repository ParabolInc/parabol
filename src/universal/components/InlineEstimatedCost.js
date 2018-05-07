import React, {Component} from 'react';
import StyledFontAwesome from 'universal/components/StyledFontAwesome';
import {MONTHLY_PRICE} from 'universal/utils/constants';
import plural from 'universal/utils/plural';
import styled from 'react-emotion';
import ui from 'universal/styles/ui';

const InlineEstimatedCostBlock = styled('div')(({showCost}) => ({
  color: showCost ? ui.palette.green : ui.palette.mid,
  cursor: showCost ? 'default' : 'pointer',
  fontSize: '1rem',
  lineHeight: '2rem'
}));

const StyledIcon = styled(StyledFontAwesome)(({showCost}) => ({
  color: 'inherit',
  fontSize: ui.iconSize,
  marginRight: '.5rem',
  opacity: showCost ? 1 : 0.5,
  width: '1.125rem'
}));

const Copy = styled('span')(({showCost}) => ({
  ':hover': {
    textDecoration: !showCost && 'underline'
  }
}));

type Props = {|
  activeUserCount: Number
|};

class InlineEstimatedCost extends Component<Props> {
  state = {showCost: false}

  getCost = () => {
    this.setState({
      showCost: !this.state.showCost
    });
  };

  render() {
    const {activeUserCount} = this.props;
    const {showCost} = this.state;
    const estimatedCost = activeUserCount * MONTHLY_PRICE;
    const estimate = `${activeUserCount} Active ${plural(activeUserCount, 'User')} x $${MONTHLY_PRICE} = $${estimatedCost}/mo`;
    const question = 'How much will it cost'; // sans ? to avoid underlining punctuation on hover
    const copy = showCost ? estimate : question;
    return (
      <InlineEstimatedCostBlock onClick={!showCost && this.getCost} showCost={showCost} title={`${question}?`}>
        <StyledIcon name="question-circle" showCost={showCost} />
        <Copy showCost={showCost}>{copy}</Copy>{!showCost && <span>{'?'}</span>}
      </InlineEstimatedCostBlock>
    );
  }
}

export default InlineEstimatedCost;
