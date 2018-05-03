import * as React from 'react';
import styled from 'react-emotion';
import StyledFontAwesome from 'universal/components/StyledFontAwesome';
import DayPicker from 'react-day-picker';
import 'react-day-picker/lib/style.css';

class DueDatePicker extends React.Component {
  handleDayClick = (day, {selected}) => {
    console.log('day', day)
  }
  render() {
    return (
      <DayPicker onDayClick={this.handleDayClick}/>
    )
  }
};

export default DueDatePicker;
