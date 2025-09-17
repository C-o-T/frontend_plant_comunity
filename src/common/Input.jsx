import React from 'react'
import styles from './Input.module.css'
// size = input 크기?
// props onChange name value 기타 등등

const Input = ({size, ...props}) => {
  return (
    <input className = {styles.input} style={{width : `${size}`}} {...props}/>
  )
}

export default Input