import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AdminMember.module.css';
import Button from '../common/Button';
import Modal from '../common/Modal';
import axios from 'axios';

const AdminMember = () => {
  const nav = useNavigate();
  // 1. 단순화된 상태 관리
  const [members, setMembers] = useState([]); // 회원 목록
  const [selected, setSelected] = useState(null); // 선택된 회원
  const [showModal, setShowModal] = useState(false); // 모달 표시 여부
  const [searchText, setSearchText] = useState(''); // 검색어

  // 2. 단순화된 관리자 체크
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

  // 3. 회원 목록 조회 - headers/token 제거
  const getMembers = () => {
    axios.get('/api/member')
      .then(res => {
        setMembers(res.data);
      })
      .catch(error => {
        alert('회원 목록 조회에 실패했습니다');
      });
  };

  useEffect(() => {
    getMembers();
  }, []);

  // 4. 회원 삭제 처리 - headers/token 제거
  const handleMemberDelete = (id) => {
    if(!window.confirm('회원을 삭제하시겠습니까?')) return;

    axios.delete(`/api/member/${id}`)
      .then(() => {
        alert('삭제되었습니다');
        getMembers();
      })
      .catch(() => {
        alert('삭제 실패');
      });
  };

  // 5. 검색 기능
  const filteredMembers = members.filter(member => 
    member.name?.toLowerCase().includes(searchText.toLowerCase()) ||
    member.email?.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <h2>회원 관리</h2>
      
      {/* 6. 검색 UI */}
      <div className={styles.searchBox}>
        <input
          type="text"
          placeholder="이름 또는 이메일 검색"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <Button title="새로고침" onClick={getMembers} />
      </div>

      {/* 7. 회원 목록 테이블 */}
      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>이메일</th>
            <th>이름</th>
            <th>가입일</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {filteredMembers.map(member => (
            <tr key={member.id}>
              <td>{member.id}</td>
              <td>{member.email}</td>
              <td>{member.name}</td>
              <td>{new Date(member.createdAt).toLocaleDateString()}</td>
              <td>
                <Button 
                  title="상세보기" 
                  onClick={() => {
                    setSelected(member);
                    setShowModal(true);
                  }}
                />
                <Button 
                  title="삭제" 
                  onClick={() => handleMemberDelete(member.id)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 8. 상세 정보 모달 */}
      {showModal && selected && (
        <Modal 
          title="회원 상세정보" 
          onClose={() => setShowModal(false)}
        >
          <div>
            <p>이메일: {selected.email}</p>
            <p>이름: {selected.name}</p>
            <p>가입일: {new Date(selected.createdAt).toLocaleDateString()}</p>
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

export default AdminMember;