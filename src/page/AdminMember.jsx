import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AdminMember.module.css';
import Button from '../common/Button';
import Modal from '../common/Modal';
import axios from 'axios';
import Input from '../common/Input';
import Select from '../common/Select';

const AdminMember = () => {
  const nav = useNavigate();

  //회원 목록 저장할 state 변수
  const [members, setMembers] = useState([]);
  //삭제된 회원 목록 저장할 state 변수
  const [deletedMembers, setDeletedMembers] = useState([]);
  //현재 보고 있는 회원 유형 (active 또는 deleted)
  const [viewType, setViewType] = useState('active');

  //모달 열림 여부 저장할 state 변수
  const [showModal, setShowModal] = useState(false);

  //선택한 회원 정보를 저장할 state 변수
  const [selectedMember, setSelectedMember] = useState(null);

  //필터 옵션 저장할 state 변수
  const [filter, setFilter] = useState({
    searchType: '', // 검색 타입 (이메일, 이름, 등급)
    searchText: ''  // 검색어
  });

  //마운트 될 때마다 회원 목록 조회
  useEffect(() => {
    fetchMembers();
  }, [viewType]);

  // 회원 목록 조회 함수
  const fetchMembers = () => {
    const url = viewType === 'active' 
      ? '/api/members/admin' 
      : '/api/members/admin/deleted';
    
    axios.get(url)
      .then(res => {
        console.log('회원 목록 조회 결과:', res.data);
        if (viewType === 'active') {
          setMembers(res.data);
        } else {
          setDeletedMembers(res.data);
        }
      })
      .catch(e => {
        console.error('회원 목록 조회 오류:', e);
        alert('회원 목록 조회에 실패했습니다.');
      });
  };

  //필터 조건 변경 함수
  const handleFilterChange = (e) => {
    setFilter(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  //필터 초기화 함수
  const handleFilterReset = () => {
    setFilter({
      searchType: '',
      searchText: ''
    });
  };

  //새로고침 함수
  const handleRefresh = () => {
    fetchMembers();
  };

  // 보기 유형 변경 함수
  const handleViewTypeChange = (type) => {
    setViewType(type);
  };

  //필터링된 회원 목록
  const filteredMembers = (viewType === 'active' ? members : deletedMembers).filter(member => {
    // 검색어가 없으면 모든 회원 표시
    if (!filter.searchText.trim()) {
      return true;
    }

    const searchQuery = filter.searchText.toLowerCase();

    // 검색 타입에 따른 필터링
    if (filter.searchType === '' || filter.searchType === 'all') {
      // 전체 검색
      return (
        member.memId?.toLowerCase().includes(searchQuery) ||
        member.memName?.toLowerCase().includes(searchQuery) ||
        member.memEmail?.toLowerCase().includes(searchQuery) ||
        member.memTell?.includes(filter.searchText)
      );
    } else if (filter.searchType === 'email') {
      return member.memEmail?.toLowerCase().includes(searchQuery);
    } else if (filter.searchType === 'name') {
      return member.memName?.toLowerCase().includes(searchQuery);
    } else if (filter.searchType === 'id') {
      return member.memId?.toLowerCase().includes(searchQuery);
    }

    return true;
  });

  // 회원 논리적 삭제 함수 (상태 변경)
  const handleDeleteMember = (memId) => {
    if(!window.confirm('정말로 삭제하시겠습니까?')) return;

    axios.put(`/api/members/admin/${memId}/delete`)
      .then(res => {
        if (res.data.success) {
          alert(res.data.message || '회원이 삭제되었습니다.');
          handleRefresh(); // 목록 새로고침
        } else {
          alert(res.data.message || '삭제에 실패했습니다.');
        }
      })
      .catch(e => {
        console.log(e);
        alert('삭제에 실패했습니다.');
      });
  };

  // 회원 복구 함수
  const handleRestoreMember = (memId) => {
    if(!window.confirm('이 회원을 복구하시겠습니까?')) return;

    axios.put(`/api/members/admin/${memId}/restore`)
      .then(res => {
        if (res.data.success) {
          alert(res.data.message || '회원이 복구되었습니다.');
          handleRefresh(); // 목록 새로고침
        } else {
          alert(res.data.message || '복구에 실패했습니다.');
        }
      })
      .catch(e => {
        console.log(e);
        alert('복구에 실패했습니다.');
      });
  };

  const handleOpenModal = (member) => {
    setSelectedMember(member);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedMember(null);
  };

  // 회원 상태 표시 함수
  const getStatusDisplay = (status) => {
    if (status === 'WITHDRAWN') {
      return <span className={styles.status_withdrawn}>회원 탈퇴</span>;
    } else if (status === 'DELETED') {
      return <span className={styles.status_deleted}>관리자 삭제</span>;
    } else if (status === 'SUSPENDED') {
      return <span className={styles.status_suspended}>정지됨</span>;
    } else {
      return <span className={styles.status_active}>활성</span>;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>회원 관리</h2>
        <div className={styles.memberCount}>
          검색 결과: {filteredMembers.length}명 / 전체: {(viewType === 'active' ? members : deletedMembers).length}명
        </div>
      </div>
      
      {/* 탭 메뉴 */}
      <div className={styles.tabMenu}>
        <button 
          className={`${styles.tabButton} ${viewType === 'active' ? styles.active : ''}`}
          onClick={() => handleViewTypeChange('active')}
        >
          활성 회원
        </button>
        <button 
          className={`${styles.tabButton} ${viewType === 'deleted' ? styles.active : ''}`}
          onClick={() => handleViewTypeChange('deleted')}
        >
          삭제/탈퇴 회원
        </button>
      </div>
      
      {/* 검색 영역 */}
      <div className={styles.searchBox}>
        <Select 
          name="searchType"
          value={filter.searchType}
          onChange={handleFilterChange}
        >
          <option value="">전체</option>
          <option value="id">아이디</option>
          <option value="name">이름</option>
          <option value="email">이메일</option>
        </Select>
        <Input
          type="text"
          name="searchText"
          placeholder="검색어를 입력하세요"
          value={filter.searchText}
          onChange={handleFilterChange}
        />
        <Button title="초기화" onClick={handleFilterReset} />
        <Button title="새로고침" onClick={handleRefresh} />
      </div>

      {/* 회원 목록 테이블 */}
      <table className={styles.table}>
        <thead>
          <tr>
            <th>아이디</th>
            <th>이름</th>
            <th>휴대폰 번호</th>
            <th>이메일</th>
            <th>가입일</th>
            <th>상태</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {filteredMembers.length > 0 ? (
            filteredMembers.map((member, i) => (
              <tr key={i}>
                <td>{member.memId}</td>
                <td>{member.memName}</td>
                <td>{member.memTell}</td>
                <td>{member.memEmail || '-'}</td>
                <td>{member.joinDate ? new Date(member.joinDate).toLocaleDateString() : '-'}</td>
                <td>
                  {getStatusDisplay(member.memStatus)}
                </td>
                <td>
                  <div className={styles.actionButtons}>
                    <Button
                      title="상세보기"
                      onClick={() => handleOpenModal(member)}
                      size="small"
                    />
                    {member.memStatus === 'ACTIVE' && (
                      <Button
                        title="삭제"
                        onClick={() => handleDeleteMember(member.memId)}
                        color="danger"
                        size="small"
                      />
                    )}
                    {(member.memStatus === 'DELETED' || member.memStatus === 'WITHDRAWN') && (
                      <Button
                        title="복구"
                        onClick={() => handleRestoreMember(member.memId)}
                        color="success"
                        size="small"
                      />
                    )}
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" style={{textAlign: 'center', padding: '20px'}}>
                {viewType === 'active' ? '조회된 회원이 없습니다.' : '삭제/탈퇴된 회원이 없습니다.'}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* 상세 정보 모달 */}
      <Modal
        title="회원 상세정보"
        isOpen={showModal}
        onClose={handleCloseModal}
        size="600px"
      >
        <div className={styles.modalContent}>
          <div className={styles.detailRow}>
            <p className={styles.detailLabel}>아이디</p>
            <p className={styles.detailValue}>{selectedMember?.memId}</p>
          </div>
          <div className={styles.detailRow}>
            <p className={styles.detailLabel}>이름</p>
            <p className={styles.detailValue}>{selectedMember?.memName}</p>
          </div>
          <div className={styles.detailRow}>
            <p className={styles.detailLabel}>이메일</p>
            <p className={styles.detailValue}>{selectedMember?.memEmail || '-'}</p>
          </div>
          <div className={styles.detailRow}>
            <p className={styles.detailLabel}>전화번호</p>
            <p className={styles.detailValue}>{selectedMember?.memTell}</p>
          </div>
          <div className={styles.detailRow}>
            <p className={styles.detailLabel}>주소</p>
            <p className={styles.detailValue}>{selectedMember?.memAddr || '-'}</p>
          </div>
          <div className={styles.detailRow}>
            <p className={styles.detailLabel}>사업자번호</p>
            <p className={styles.detailValue}>{selectedMember?.memBusinessNum || '-'}</p>
          </div>
          <div className={styles.detailRow}>
            <p className={styles.detailLabel}>상태</p>
            <p className={styles.detailValue}>
              {getStatusDisplay(selectedMember?.memStatus)}
            </p>
          </div>
          <div className={styles.detailRow}>
            <p className={styles.detailLabel}>가입일</p>
            <p className={styles.detailValue}>
              {selectedMember?.joinDate ? new Date(selectedMember.joinDate).toLocaleDateString() : '-'}
            </p>
          </div>

          <div className={styles.modalActions}>
            <Button title="닫기" onClick={handleCloseModal} />
            {selectedMember?.memStatus === 'ACTIVE' && (
              <Button
                title="삭제"
                onClick={() => {
                  handleCloseModal();
                  handleDeleteMember(selectedMember.memId);
                }}
                color="danger"
              />
            )}
            {(selectedMember?.memStatus === 'DELETED' || selectedMember?.memStatus === 'WITHDRAWN') && (
              <Button
                title="복구"
                onClick={() => {
                  handleCloseModal();
                  handleRestoreMember(selectedMember.memId);
                }}
                color="success"
              />
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminMember;