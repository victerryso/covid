import React from 'react';
import Typography from '@material-ui/core/Typography'

const DateCounter = function (props) {
  const day = props.mapData[0].data.filter(({ date }) => date <= props.date).length

  return (
    <Typography variant='h4'>
      Day {day}
    </Typography>
  )
}

export default DateCounter