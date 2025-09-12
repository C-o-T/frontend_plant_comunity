import React from 'react'
import styles from './Button.module.css'
// title = 버튼 이름 
// size = 버튼 크기?
// props onclick 기타 등등

const Button = ({title, size = '100px', ...props}) => {
  return (
    <div>
      <button className = {styles.btn} type='button' style={{width : `${size}`}} {...props}>{title}</button>
    </div>
  )
}

export default Button