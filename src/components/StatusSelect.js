import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

const useStyles = makeStyles(theme => ({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 120,
    margin: theme.spacing(1)
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
}));

const StatusSelect = function (props) {
  const classes = useStyles()

  return (
    <div className={classes.container}>
      <FormControl variant="outlined" className={classes.formControl}>
        <Select
          value={props.status}
          onChange={event => props.handleChange(event.target.value)}
        >
          <MenuItem value='confirmed'>Confirmed</MenuItem>
          <MenuItem value='deaths'>Deaths</MenuItem>
          <MenuItem value='recovered'>Recovered</MenuItem>
          <MenuItem value='existing'>Existing</MenuItem>
        </Select>
      </FormControl>
    </div>
  )
}

export default StatusSelect
