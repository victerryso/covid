import React from 'react'
import './Loader.css'

const Loader = props => (
  <div id="loader-wrapper" className={props.done ? 'loaded' : ''}>
    <div id="loader" />
    <div className="loader-section section-left" />
    <div className="loader-section section-right" />
  </div>
)

export default Loader