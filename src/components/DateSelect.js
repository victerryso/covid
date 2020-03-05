import React from 'react';
import moment from 'moment'
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

const DateSelect = props => (
  <FormControl>
    <Select
      displayEmpty
      value={props.date}
      onChange={event => props.handleChange(event.target.value)}
    >
      {props.dates.map((value, index) => (
        <MenuItem value={value} key={index}>{moment.utc(value).format('MMMM Do')}</MenuItem>
      ))}
    </Select>
  </FormControl>
)

export default DateSelect
