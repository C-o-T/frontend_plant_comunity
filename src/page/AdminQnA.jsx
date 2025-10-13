import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AdminQnA.module.css';
import Button from '../common/Button';
import Modal from '../common/Modal';
import axios from 'axios';
import Input from '../common/Input';
import Select from '../common/Select';

const AdminQnA = () => {
  const nav = useNavigate();

  //문의 목록 저장할 state 변수
  const [qnaList, setQnaList] = useState([]);

  //모달 열림 여부 저장할 state 변수
  const [showModal, setShowModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);

  //선택한 문의 정보를 저장할 state 변수
  const [selectedQna, setSelectedQna] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);

  //답변 내용 저장할 state 변수
  const [answerContent, setAnswerContent] = useState('');

  //필터 옵션 저장할 state 변수
  const [filter, setFilter] = useState({
    searchType: '', // 검색 타입
    searchText: '', // 검색어
    cateNum: '',    // 카테고리
    qnaStatus: ''   // 답변 상태
  });

  // 카테고리 목록 저장할 state 변수
  const [categories, setCategories] = useState([]);

  //마운트 될 때마다 카테고리 목록과 문의 목록 조회
  useEffect(() => {
    getCategories();
    getQnaList();
  }, []);

  //카테고리 목록 조회 함수
  const getCategories = () => {
    axios.get('/api/qna/categories')
      .then(res => {
        setCategories(res.data || []);
      })
      .catch(e => {
        console.log(e);
        alert('카테고리 목록 조회에 실패했습니다.');
        setCategories([]);
      });
  };

  //카테고리 번호로 카테고리 이름 찾는 함수
  const getCategoryName = (cateNum) => {
    const category = categories.find(cat => cat.cateNum === cateNum);
    return category ? category.cateName : '알 수 없음';
  };

  //마운트 될 때마다 문의 목록 조회
  useEffect(() => {
    getQnaList();
  }, []);

  //문의 목록 조회 함수
  const getQnaList = () => {
    const queryParams = new URLSearchParams();
    
    if (filter.cateNum) queryParams.append('cateNum', filter.cateNum);
    if (filter.qnaStatus) queryParams.append('qnaStatus', filter.qnaStatus);
    if (filter.searchText) {
      if (filter.searchType === 'memId') {
        queryParams.append('memId', filter.searchText);
      }
    }

    axios.get(`/api/qna/admin/list?${queryParams}`)
    .then(res => {
      if (res.data.success) {
        setQnaList(res.data.data || []);
      } else {
        console.log('문의 목록 조회 실패:', res.data.message);
        setQnaList([]);
      }
    })
    .catch(e => {
      console.log(e);
      alert('문의 목록 조회에 실패했습니다.');
      setQnaList([]);
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
      searchText: '',
      cateNum: '',
      qnaStatus: ''
    });
  };

  //검색 함수
  const handleSearch = () => {
    getQnaList();
  };

  //새로고침 함수
  const handleRefresh = () => {
    getQnaList();
  };

  //문의 상세 조회 함수
  const getQnaDetail = (qnaNum) => {
    axios.get(`/api/qna/detail/${qnaNum}`)
    .then(res => {
      setSelectedQna(res.data);
      setAnswerContent(res.data.answerContent || '');
      setShowModal(true);
    })
    .catch(e => {
      console.log(e);
      alert('문의 상세 조회에 실패했습니다.');
    });
  };

  //회원 상세 정보 조회 함수
  const getMemberDetail = (memId) => {
    // 먼저 회원 상태 확인
    axios.get(`/api/members/status/${memId}`)
      .then(statusRes => {
        if (statusRes.data.success) {
          const memberStatus = statusRes.data.status;
          
          if (memberStatus === 'DELETED') {
            // 삭제된 회원인 경우
            setSelectedMember({
              memId: memId,
              memName: "삭제된 회원",
              memStatus: "DELETED"
            });
            setShowMemberModal(true);
          } else {
            // 활성 회원인 경우 상세 정보 조회
            axios.get(`/api/members/${memId}`)
              .then(res => {
                setSelectedMember(res.data);
                setShowMemberModal(true);
              })
              .catch(e => {
                console.log(e);
                alert('회원 정보 조회에 실패했습니다.');
              });
          }
        } else {
          // 상태 확인 실패 시 기본 정보로 표시
          setSelectedMember({
            memId: memId,
            memName: "알 수 없는 회원",
            memStatus: "UNKNOWN"
          });
          setShowMemberModal(true);
        }
      })
      .catch(e => {
        console.log(e);
        alert('회원 상태 확인에 실패했습니다.');
      });
  };

  //관리자 답변 등록/수정 함수
  const handleSubmitAnswer = () => {
    if (!answerContent.trim()) {
      alert('답변 내용을 입력해주세요.');
      return;
    }

    axios.post(`/api/qna/admin/${selectedQna.qnaNum}/answer`, {
      answerContent: answerContent.trim()
    }, {
      headers: {
        'Admin-Id': 'admin' // 실제로는 로그인한 관리자 ID 사용
      }
    })
    .then(res => {
      if (res.data.success) {
        alert(res.data.message || '답변이 등록되었습니다.');
        setShowModal(false);
        getQnaList(); // 목록 새로고침
      } else {
        alert(res.data.message || '답변 등록에 실패했습니다.');
      }
    })
    .catch(e => {
      console.log(e);
      alert('답변 등록에 실패했습니다.');
    });
  };

  //상태 변경 함수
  const handleStatusChange = (qnaNum, newStatus) => {
    axios.put(`/api/qna/admin/${qnaNum}/status`, {
      qnaStatus: newStatus
    })
    .then(res => {
      if (res.data.success) {
        alert(res.data.message || '상태가 변경되었습니다.');
        getQnaList();
      } else {
        alert(res.data.message || '상태 변경에 실패했습니다.');
      }
    })
    .catch(e => {
      console.log(e);
      alert('상태 변경에 실패했습니다.');
    });
  };

  const handleOpenModal = (qna) => {
    getQnaDetail(qna.qnaNum);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedQna(null);
    setAnswerContent('');
  };

  const handleCloseMemberModal = () => {
    setShowMemberModal(false);
    setSelectedMember(null);
  };

  //필터링된 문의 목록 (클라이언트 사이드 필터링)
  const filteredQnaList = qnaList.filter(qna => {
    if (!filter.searchText.trim()) {
      return true;
    }

    const searchQuery = filter.searchText.toLowerCase();

    if (filter.searchType === '' || filter.searchType === 'all') {
      return (
        qna.title?.toLowerCase().includes(searchQuery) ||
        qna.content?.toLowerCase().includes(searchQuery) ||
        qna.memId?.toLowerCase().includes(searchQuery)
      );
    } else if (filter.searchType === 'title') {
      return qna.title?.toLowerCase().includes(searchQuery);
    } else if (filter.searchType === 'content') {
      return qna.content?.toLowerCase().includes(searchQuery);
    } else if (filter.searchType === 'memId') {
      return qna.memId?.toLowerCase().includes(searchQuery);
    }

    return true;
  });

  // 간단한 통계 계산 함수
  const getStatistics = () => {
    const total = qnaList.length;
    const waiting = qnaList.filter(qna => qna.qnaStatus === '답변대기').length;
    const processing = qnaList.filter(qna => qna.qnaStatus === '답변중').length;
    const completed = qnaList.filter(qna => qna.qnaStatus === '답변완료').length;

    // 카테고리별 통계 (동적)
    const categoryStats = categories.map(category => {
      const count = qnaList.filter(qna => qna.cateNum === category.cateNum).length;
      return {
        name: category.cateName,
        count: count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0
      };
    });

    // 오늘 문의 수
    const today = new Date().toDateString();
    const todayCount = qnaList.filter(qna => 
      new Date(qna.createDate).toDateString() === today
    ).length;

    return {
      total,
      waiting,
      processing,
      completed,
      categoryStats,
      todayCount,
      waitingPercentage: total > 0 ? Math.round((waiting / total) * 100) : 0,
      completedPercentage: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  };

  const stats = getStatistics();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>1:1 문의 관리</h2>
        <div className={styles.qnaCount}>
          검색 결과: {filteredQnaList.length}개 / 전체: {qnaList.length}개
        </div>
      </div>

      {/* 간단한 통계 영역 */}
      <div className={styles.statsContainer}>
        <div className={styles.statsCard}>
          <h4>전체 문의</h4>
          <div className={styles.statsNumber}>{stats.total}</div>
          <div className={styles.statsSubtext}>총 문의 수</div>
        </div>
        <div className={styles.statsCard}>
          <h4>답변 대기</h4>
          <div className={styles.statsNumber}>{stats.waiting}</div>
          <div className={styles.statsSubtext}>{stats.waitingPercentage}%</div>
        </div>
        <div className={styles.statsCard}>
          <h4>답변 완료</h4>
          <div className={styles.statsNumber}>{stats.completed}</div>
          <div className={styles.statsSubtext}>{stats.completedPercentage}%</div>
        </div>
        <div className={styles.statsCard}>
          <h4>오늘 문의</h4>
          <div className={styles.statsNumber}>{stats.todayCount}</div>
          <div className={styles.statsSubtext}>신규 문의</div>
        </div>
      </div>

      {/* 카테고리별 통계 */}
      <div className={styles.categoryStats}>
        <h4>카테고리별 현황</h4>
        <div className={styles.categoryList}>
          {stats.categoryStats.map((category, index) => (
            <div key={index} className={styles.categoryItem}>
              <span className={styles.categoryName}>{category.name}</span>
              <span className={styles.categoryCount}>
                {category.count}개 ({category.percentage}%)
              </span>
            </div>
          ))}
        </div>
      </div>
      
      {/* 검색 영역 */}
      <div className={styles.searchBox}>
        <Select 
          name="searchType"
          value={filter.searchType}
          onChange={handleFilterChange}
        >
          <option value="">전체</option>
          <option value="title">제목</option>
          <option value="content">내용</option>
          <option value="memId">작성자</option>
        </Select>
        <Input
          type="text"
          name="searchText"
          placeholder="검색어를 입력하세요"
          value={filter.searchText}
          onChange={handleFilterChange}
        />
        <Select 
          name="cateNum"
          value={filter.cateNum}
          onChange={handleFilterChange}
        >
          <option value="">전체 카테고리</option>
          {categories.map(category => (
            <option key={category.cateNum} value={category.cateNum}>
              {category.cateName}
            </option>
          ))}
        </Select>
        <Select 
          name="qnaStatus"
          value={filter.qnaStatus}
          onChange={handleFilterChange}
        >
          <option value="">전체 상태</option>
          <option value="답변대기">답변대기</option>
          <option value="답변중">답변중</option>
          <option value="답변완료">답변완료</option>
        </Select>
        <Button title="검색" onClick={handleSearch} />
        <Button title="초기화" onClick={handleFilterReset} />
        <Button title="새로고침" onClick={handleRefresh} />
      </div>

      {/* 문의 목록 테이블 */}
      <table className={styles.table}>
        <thead>
          <tr>
            <th>번호</th>
            <th>카테고리</th>
            <th>제목</th>
            <th>작성자</th>
            <th>작성일</th>
            <th>답변상태</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {filteredQnaList.length > 0 ? (
            filteredQnaList.map((qna, i) => (
              <tr key={i}>
                <td>{qna.qnaNum}</td>
                <td>{getCategoryName(qna.cateNum)}</td>
                <td>
                  <span 
                    className={styles.titleLink}
                    onClick={() => handleOpenModal(qna)}
                  >
                    {qna.title}
                  </span>
                </td>
                <td>
                  <span 
                    className={styles.memberLink}
                    onClick={() => getMemberDetail(qna.memId)}
                  >
                    {qna.memId}
                  </span>
                </td>
                <td>{new Date(qna.createDate).toLocaleDateString()}</td>
                <td>
                  <span className={`${styles.status} ${styles[`status${qna.qnaStatus}`]}`}>
                    {qna.qnaStatus}
                  </span>
                </td>
                <td>
                  <div className={styles.actionButtons}>
                    <Button
                      title="상세보기"
                      onClick={() => handleOpenModal(qna)}
                      size="small"
                    />
                    {qna.qnaStatus === '답변대기' && (
                      <Button
                        title="처리중"
                        onClick={() => handleStatusChange(qna.qnaNum, '답변중')}
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
                조회된 문의가 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* 문의 상세 정보 모달 */}
      <Modal 
        title="문의 상세정보" 
        isOpen={showModal}
        onClose={handleCloseModal}
        size="700px"
      >
        <div className={styles.modalContent}>
          <table className={styles.detailTable}>
            <tbody>
              <tr>
                <td className={styles.labelCell}>번호:</td>
                <td className={styles.valueCell}>{selectedQna?.qnaNum}</td>
              </tr>
              <tr>
                <td className={styles.labelCell}>카테고리:</td>
                <td className={styles.valueCell}>
                  {getCategoryName(selectedQna?.cateNum)}
                </td>
              </tr>
              <tr>
                <td className={styles.labelCell}>제목:</td>
                <td className={styles.valueCell}>{selectedQna?.title}</td>
              </tr>
              <tr>
                <td className={styles.labelCell}>작성자:</td>
                <td className={styles.valueCell}>
                  <span 
                    className={styles.memberLink}
                    onClick={() => getMemberDetail(selectedQna?.memId)}
                  >
                    {selectedQna?.memId}
                  </span>
                </td>
              </tr>
              <tr>
                <td className={styles.labelCell}>작성일:</td>
                <td className={styles.valueCell}>
                  {selectedQna && new Date(selectedQna.createDate).toLocaleDateString()}
                </td>
              </tr>
              <tr>
                <td className={styles.labelCell}>답변상태:</td>
                <td className={styles.valueCell}>
                  <span className={`${styles.status} ${styles[`status${selectedQna?.qnaStatus}`]}`}>
                    {selectedQna?.qnaStatus}
                  </span>
                </td>
              </tr>
              <tr>
                <td className={styles.labelCell} style={{verticalAlign: 'top'}}>문의내용:</td>
                <td className={styles.valueCell}>
                  <div className={styles.content}>
                    {selectedQna?.content}
                  </div>
                </td>
              </tr>
              <tr>
                <td className={styles.labelCell} style={{verticalAlign: 'top'}}>관리자 답변:</td>
                <td className={styles.valueCell}>
                  <textarea
                    value={answerContent}
                    onChange={(e) => setAnswerContent(e.target.value)}
                    placeholder="답변을 입력해주세요..."
                    className={styles.answerTextarea}
                    rows={6}
                  />
                  {selectedQna?.answerDate && (
                    <div className={styles.answerInfo}>
                      <p>답변일: {new Date(selectedQna.answerDate).toLocaleDateString()}</p>
                      <p>답변자: {selectedQna.adminId}</p>
                    </div>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
          <div className={styles.modalButtons}>
            <Button title="닫기" onClick={handleCloseModal} />
            <Button 
              title={selectedQna?.answerContent ? "답변 수정" : "답변 등록"} 
              onClick={handleSubmitAnswer} 
            />
          </div>
        </div>
      </Modal>

      {/* 회원 상세 정보 모달 */}
      <Modal
        title="회원 상세정보"
        isOpen={showMemberModal}
        onClose={handleCloseMemberModal}
        size="600px"
      >
        <div className={styles.memberModalContent}>
          {selectedMember?.memStatus === "DELETED" ? (
            <div className={styles.deletedMemberInfo}>
              <div className={styles.memberDetailRow}>
                <p className={styles.memberDetailLabel}>아이디</p>
                <p className={styles.memberDetailValue}>{selectedMember?.memId}</p>
              </div>
              <div className={styles.deletedMessageBox}>
                <p className={styles.deletedMessage}>
                  삭제된 회원입니다. 더 이상 상세 정보를 조회할 수 없습니다.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className={styles.memberDetailRow}>
                <p className={styles.memberDetailLabel}>아이디</p>
                <p className={styles.memberDetailValue}>{selectedMember?.memId}</p>
              </div>
              <div className={styles.memberDetailRow}>
                <p className={styles.memberDetailLabel}>이름</p>
                <p className={styles.memberDetailValue}>{selectedMember?.memName}</p>
              </div>
              <div className={styles.memberDetailRow}>
                <p className={styles.memberDetailLabel}>이메일</p>
                <p className={styles.memberDetailValue}>{selectedMember?.memEmail}</p>
              </div>
              <div className={styles.memberDetailRow}>
                <p className={styles.memberDetailLabel}>전화번호</p>
                <p className={styles.memberDetailValue}>{selectedMember?.memTell}</p>
              </div>
              <div className={styles.memberDetailRow}>
                <p className={styles.memberDetailLabel}>주소</p>
                <p className={styles.memberDetailValue}>{selectedMember?.memAddr}</p>
              </div>
              <div className={styles.memberDetailRow}>
                <p className={styles.memberDetailLabel}>등급</p>
                <p className={styles.memberDetailValue}>{selectedMember?.memGrade}</p>
              </div>
              <div className={styles.memberDetailRow}>
                <p className={styles.memberDetailLabel}>가입일</p>
                <p className={styles.memberDetailValue}>
                  {selectedMember && new Date(selectedMember.joinDate).toLocaleDateString()}
                </p>
              </div>
            </>
          )}
          <div className={styles.memberModalActions}>
            <Button title="닫기" onClick={handleCloseMemberModal} />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminQnA;