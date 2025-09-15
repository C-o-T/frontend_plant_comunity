import React, { useState } from 'react'
import styles from './Header.module.css'
import Join from '../components/Join'

const Header = () => {
  const [isOpenJoin, setIsOpenJoin] = useState(false);
  return (
    <div className={styles.container}>
      <div className={styles.login_div}>
        <p>login</p>
        <p
          onClick={()=>{setIsOpenJoin(true)}}
        >
          join
        </p>
        <Join 
          isOpenJoin={isOpenJoin}
          onClose={()=>setIsOpenJoin(false)}
        />
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