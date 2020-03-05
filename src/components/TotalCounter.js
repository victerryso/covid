import React from 'react';
import Typography from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
  container: {
    margin: theme.spacing(2),
    position: 'absolute',
    top: 0,
    right: 0,
  },
}));

const TotalCounter = function (props) {
  const classes = useStyles();

  const total = props.mapData.reduce((memo, { value }) => memo + value, 0)

  return (
    <div className={classes.container}>
      <Typography
        variant='h3'
      >
        {total}
      </Typography>
    </div>
  )
}

export default TotalCounter