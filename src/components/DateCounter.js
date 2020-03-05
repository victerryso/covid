import React from 'react';
import Typography from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
  container: {
    margin: theme.spacing(2),
    position: 'absolute',
    top: 0,
    left: 0,
  },
}));

const DateCounter = function (props) {
  const classes = useStyles();
console.log(props.mapData[0])
  const day = props.mapData[0].data.filter(({ date }) => date <= props.date).length

  return (
    <div className={classes.container}>
      <Typography variant='h3'>
        Day {day}
      </Typography>
    </div>
  )
}

export default DateCounter