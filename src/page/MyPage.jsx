import MyPageSideLayout from '../layout/MyPageSideLayout';
import { Outlet } from 'react-router-dom';
import styles from './MyPage.module.css'

const MyPage = () => {
  

  return (
    <div className={styles.container}>

      {/* 오른쪽 콘텐츠 영역 */}
      <div className={styles.size}>
        <Outlet />
      </div>
    </div>
  )
}

export default MyPage