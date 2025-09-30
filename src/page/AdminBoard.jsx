import React, { useEffect, useState } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import styles from './AdminBoard.module.css';
import Button from '../common/Button';
import Modal from '../common/Modal';
import axios from 'axios';

const AdminBoard = () => {
  const nav = useNavigate();
  // 1. 기본 상태 관리
  const [posts, setPosts] = useState([]); // 게시글 목록
  const [selected, setSelected] = useState(null); // 선택된 게시글
  const [showModal, setShowModal] = useState(false); // 모달 상태
  const [searchText, setSearchText] = useState(''); // 검색어

  // 2. 관리자 권한 체크
  useEffect(() => {
    const loginInfo = sessionStorage.getItem('loginInfo');
    if(!loginInfo) {
      alert('로그인이 필요합니다');
      nav('/');
      return;
    }

    const { memGrade } = JSON.parse(loginInfo);
    if(memGrade !== 'ADMIN') {
      alert('관리자만 접근 가능합니다');
      nav('/');
    }
  }, []);

  // 3. 게시글 목록 조회
  const getPosts = () => {
    axios.get('/api/boards')
      .then(res => {
        setPosts(res.data);
      })
      .catch(error => {
        alert('게시글 목록 조회에 실패했습니다');
      });
  };

  useEffect(() => {
    getPosts();
  }, []);

  // 4. 게시글 삭제 처리
  const handlePostDelete = (id) => {
    if(!window.confirm('게시글을 삭제하시겠습니까?')) return;

    axios.delete(`/api/board/${id}`)
      .then(() => {
        alert('삭제되었습니다');
        getPosts();
      })
      .catch(() => {
        alert('삭제 실패');
      });
  };

  // 5. 검색 기능
  const filteredPosts = posts.filter(post => 
    post.title?.toLowerCase().includes(searchText.toLowerCase()) ||
    post.content?.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className={styles.container}>
      {/* Outlet 추가 - 중첩 라우팅을 위한 영역 */}
      <Outlet />
      
      <h2>게시글 관리</h2>

      {/* 6. 검색 영역 */}
      <div className={styles.searchBox}>
        <input
          type="text"
          placeholder="제목 또는 내용 검색"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <Button title="새로고침" onClick={getPosts} />
      </div>

      {/* 7. 게시글 목록 테이블 */}
      <table className={styles.table}>
        <thead>
          <tr>
            <th>번호</th>
            <th>제목</th>
            <th>작성자</th>
            <th>작성일</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {filteredPosts.map((post, index) => (
            <tr key={post.id || index}>  {/* key prop 추가 */}
              <td>{post.id}</td>
              <td>{post.title}</td>
              <td>{post.author}</td>
              <td>{new Date(post.createdAt).toLocaleDateString()}</td>
              <td>
                <Button 
                  title="상세보기" 
                  onClick={() => {
                    setSelected(post);
                    setShowModal(true);
                  }}
                />
                <Button 
                  title="삭제" 
                  onClick={() => handlePostDelete(post.id)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 8. 상세 정보 모달 */}
      {showModal && selected && (
        <Modal 
          title="게시글 상세정보" 
          onClose={() => setShowModal(false)}
        >
          <div className={styles.modalContent}>
            <h3>{selected.title}</h3>
            <p>작성자: {selected.author}</p>
            <p>작성일: {new Date(selected.createdAt).toLocaleDateString()}</p>
            <div className={styles.content}>{selected.content}</div>
            <Button 
              title="닫기" 
              onClick={() => setShowModal(false)} 
            />
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminBoard;