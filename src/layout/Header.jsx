import React from 'react'
import styles from './Header.module.css'
import { useNavigate } from 'react-router-dom'

const Header = () => {
  const nav = useNavigate();

  return (
    <div className={styles.container}>
      <div className={styles.login_div}>
        <p>login</p>
        <p>join</p>
      </div>

      <div className={styles.banner_div}>
        <span>Git</span><span>Herb🍀</span>
      </div>

      <div className={styles.menu_div}>
        <ul>
          <li onClick={e => nav('/myfarm')}>My Farm</li>
          <li onClick={e => nav('/board')}>Community</li>
          <li onClick={e => nav('/mypage')}>My Page</li>
        </ul>
      </div>
    </div>
  )
}

export default Header