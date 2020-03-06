import React, { useState } from 'react';
import MomentUtils from '@date-io/moment'; // choose your lib
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';

const DateSelect = props => (
  <MuiPickersUtilsProvider utils={MomentUtils}>
    <KeyboardDatePicker
      style={{ width: 140 }}
      variant="dialog"
      format="DD/MM/YYYY"
      value={props.date}
      onChange={date => props.handleChange(+date)}
      minDate={props.dates[0]}
      maxDate={props.dates[props.dates.length - 1]}
    />
  </MuiPickersUtilsProvider>
)

export default DateSelect
