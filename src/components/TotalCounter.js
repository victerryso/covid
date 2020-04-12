import React from 'react';
import Typography from '@material-ui/core/Typography'

const TotalCounter = function (props) {
  const total = props.mapData.reduce((memo, { value }) => memo + (value || 0), 0)

  return (
    <Typography variant='h4'>
      {total.toLocaleString()}
    </Typography>
  )
}

export default TotalCounter