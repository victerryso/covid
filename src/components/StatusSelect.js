import React from 'react';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

const StatusSelect = props => (
  <FormControl>
    <Select
      displayEmpty
      value={props.status}
      onChange={event => props.handleChange(event.target.value)}
    >
      <MenuItem value='confirmed'>Confirmed</MenuItem>
      <MenuItem value='deaths'>Deaths</MenuItem>
      <MenuItem value='recovered'>Recovered</MenuItem>
      <MenuItem value='existing'>Existing</MenuItem>
    </Select>
  </FormControl>
)

export default StatusSelect
