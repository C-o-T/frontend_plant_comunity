import MyPageSideLayout from '../layout/MyPageSideLayout';
import { Outlet } from 'react-router-dom';

const MyPage = () => {
  

  return (
    <div>
      {/* 사이드 메뉴 */}
      <div>
        <MyPageSideLayout />
      </div>

      {/* 오른쪽 콘텐츠 영역 */}
      <div>
        <Outlet />
      </div>
    </div>
  )
}

export default MyPage