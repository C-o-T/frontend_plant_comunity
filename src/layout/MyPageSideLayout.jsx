import React from 'react'
import styles from './MypageSideLayout.module.css'
import { NavLink } from 'react-router-dom'

const MyPageSideLayout = () => {
  return (
    <div>
      <div className={styles.menuCategory}>
        <p>
          <span><i className="bi bi-bag-fill"></i></span>
          마이페이지
        </p>
        <ul className={styles.sideMenu}>
          <li className={styles.menu_li}>
            <NavLink 
              to={'/mypage/my-info'}
              className={({isActive}) => isActive ? styles.active : null}
            >회원 정보 수정</NavLink>
          </li>
          <li className={styles.menu_li}>
            <NavLink
              to={'/mypage/my-board-list'}
              className={({isActive}) => isActive ? styles.active : null}
            >게시글 관리</NavLink>
          </li>
          <li className={styles.menu_li}>
            <NavLink
              to={'/mypage/my-calendar'}
              className={({isActive}) => isActive ? styles.active : null}
            >내 식물 관리</NavLink>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default MyPageSideLayout