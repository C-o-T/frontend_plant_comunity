import React from 'react'
import styles from './Header.module.css'

const Header = () => {
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
          <li>My Farm</li>
          <li>Community</li>
          <li>My Page</li>
        </ul>
      </div>
    </div>
  )
}

export default Header