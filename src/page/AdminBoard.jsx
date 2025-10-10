import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AdminBoard.module.css';
import Button from '../common/Button';
import Modal from '../common/Modal';
import axios from 'axios';
import Input from '../common/Input';
import Select from '../common/Select';

const AdminBoard = () => {
  const nav = useNavigate();

  //게시글 목록 저장할 state 변수
  const [boards, setBoards] = useState([]);

  //모달 열림 여부 저장할 state 변수
  const [showModal, setShowModal] = useState(false);

  //선택한 게시글 정보를 저장할 state 변수
  const [selectedBoard, setSelectedBoard] = useState(null);

  //필터 옵션 저장할 state 변수
  const [filter, setFilter] = useState({
    searchType: '',
    searchText: '',
    pageSize: '10',
    sortOrder: 'desc'
  });

  //현재 페이지 번호
  const [currentPage, setCurrentPage] = useState(1);

  //마운트 될 때마다 게시글 목록 조회
  useEffect(() => {
    getBoardList();
  }, []);

  //게시글 목록 조회 함수
  const getBoardList = () => {
    axios.get('/api/boards/boardList')
    .then(res => {
      setBoards(res.data);
      console.log('게시글 목록:', res.data);
    })
    .catch(e => {
      console.log(e);
      alert('게시글 목록 조회에 실패했습니다.');
    });
  };

  //필터 조건 변경 함수
  const handleFilterChange = (e) => {
    setFilter(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    
    // 페이지 크기가 변경되면 첫 페이지로 이동
    if (e.target.name === 'pageSize') {
      setCurrentPage(1);
    }
  };

  //필터 초기화 함수
  const handleFilterReset = () => {
    setFilter({
      searchType: '',
      searchText: '',
      pageSize: '10',
      sortOrder: 'desc'
    });
    setCurrentPage(1);
  };

  //새로고침 함수
  const handleRefresh = () => {
    getBoardList();
    setCurrentPage(1);
  };

  //정렬된 게시글 목록
  const getSortedBoards = (boards) => {
    return [...boards].sort((a, b) => {
      const dateA = new Date(a.createDate);
      const dateB = new Date(b.createDate);
      
      if (filter.sortOrder === 'desc') {
        return dateB - dateA; // 최신순 (큰 날짜가 위로)
      } else {
        return dateA - dateB; // 오래된순 (작은 날짜가 위로)
      }
    });
  };

  //필터링된 게시글 목록
  const filteredBoards = getSortedBoards(
    boards.filter(board => {
      // 검색어가 없으면 모든 게시글 표시
      if (!filter.searchText.trim()) {
        return true;
      }

      const searchQuery = filter.searchText.toLowerCase();

      // 검색 타입에 따른 필터링
      if (filter.searchType === '' || filter.searchType === 'all') {
        // 전체 검색
        return (
          board.title?.toLowerCase().includes(searchQuery) ||
          board.content?.toLowerCase().includes(searchQuery) ||
          board.memId?.toLowerCase().includes(searchQuery)
        );
      } else if (filter.searchType === 'title') {
        return board.title?.toLowerCase().includes(searchQuery);
      } else if (filter.searchType === 'content') {
        return board.content?.toLowerCase().includes(searchQuery);
      } else if (filter.searchType === 'writer') {
        return board.memId?.toLowerCase().includes(searchQuery);
      }

      return true;
    })
  );

  //페이지네이션 계산
  const pageSize = parseInt(filter.pageSize);
  const totalPages = Math.ceil(filteredBoards.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentBoards = filteredBoards.slice(startIndex, endIndex);

  //페이지 변경 함수
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  //게시글 삭제 함수
  const handleDeleteBoard = (boardNum) => {
    if(!window.confirm('정말로 삭제하시겠습니까?')) return;

    axios.delete(`/api/boards/${boardNum}`)
    .then(() => {
      alert('삭제되었습니다.');
      getBoardList();
      
      // 현재 페이지에 게시글이 없으면 이전 페이지로 이동
      const remainingBoards = filteredBoards.length - 1;
      const maxPage = Math.ceil(remainingBoards / pageSize);
      if (currentPage > maxPage && maxPage > 0) {
        setCurrentPage(maxPage);
      }
    })
    .catch(e => {
      console.log(e);
      alert('삭제에 실패했습니다.');
    });
  };

  // 게시글 상세 조회 함수 수정
  const handleOpenModal = (board) => {
    // boardDetail 엔드포인트 사용
    axios.get(`/api/boards/boardDetail/${board.boardNum}`)
      .then(res => {
        console.log('게시글 상세 정보:', res.data);
        setSelectedBoard(res.data);
        
        // 작성자 상태 확인
        return axios.get(`/api/members/status/${res.data.memId}`);
      })
      .then(statusRes => {
        if (statusRes.data && statusRes.data.success) {
          setSelectedBoard(prev => ({
            ...prev,
            memberStatus: statusRes.data.status
          }));
        }
        setShowModal(true);
      })
      .catch(err => {
        console.log('상세 조회 에러:', err);
        console.log('에러 응답:', err.response);
        
        // 에러가 나도 모달은 열고 목록 데이터 사용
        alert('상세 정보를 불러올 수 없어 목록 정보를 표시합니다.');
        setSelectedBoard(board);
        setShowModal(true);
      });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedBoard(null);
  };

  //페이지 번호 생성
  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          className={`${styles.pageButton} ${i === currentPage ? styles.active : ''}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }
    
    return pageNumbers;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>게시글 관리</h2>
        <div className={styles.boardCount}>
          검색 결과: {filteredBoards.length}개 / 전체: {boards.length}개
        </div>
      </div>
      
      {/* 검색 및 필터 영역 */}
      <div className={styles.filterSection}>
        <div className={styles.searchBox}>
          <Select 
            name="searchType"
            value={filter.searchType}
            onChange={handleFilterChange}
          >
            <option value="">전체</option>
            <option value="title">제목</option>
            <option value="content">내용</option>
            <option value="writer">작성자</option>
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
        
        <div className={styles.optionBox}>
          <div className={styles.sortBox}>
            <label>정렬 순서:</label>
            <Select 
              name="sortOrder"
              value={filter.sortOrder}
              onChange={handleFilterChange}
            >
              <option value="desc">최신순</option>
              <option value="asc">오래된순</option>
            </Select>
          </div>
          
          <div className={styles.pageSizeBox}>
            <label>페이지당 게시글 수:</label>
            <Select 
              name="pageSize"
              value={filter.pageSize}
              onChange={handleFilterChange}
            >
              <option value="10">10개</option>
              <option value="20">20개</option>
              <option value="30">30개</option>
              <option value="50">50개</option>
              <option value="100">100개</option>
            </Select>
          </div>
        </div>
      </div>

      {/* 게시글 목록 테이블 */}
      <table className={styles.table}>
        <thead>
          <tr>
            <th>번호</th>
            <th>제목</th>
            <th>작성자</th>
            <th>
              작성일 
              <span className={styles.sortIndicator}>
                {filter.sortOrder === 'desc' ? ' ↓' : ' ↑'}
              </span>
            </th>
            <th>조회수</th>
            <th>좋아요</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {currentBoards.length > 0 ? (
            currentBoards.map((board, i) => (
              <tr key={i}>
                <td>{board.boardNum}</td>
                <td>
                  <span 
                    className={styles.titleLink}
                    onClick={() => handleOpenModal(board)}
                  >
                    {board.title}
                  </span>
                </td>
                <td>{board.memId}</td>
                <td>{new Date(board.createDate).toLocaleDateString()}</td>
                <td>{board.readCnt}</td>
                <td>{board.likeCnt}</td>
                <td>
                  <div className={styles.actionButtons}>
                    <Button 
                      title="상세보기" 
                      onClick={() => handleOpenModal(board)}
                      size="small"
                    />
                    <Button 
                      title="삭제" 
                      onClick={() => handleDeleteBoard(board.boardNum)}
                      color="danger"
                      size="small"
                    />
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" style={{textAlign: 'center', padding: '20px'}}>
                조회된 게시글이 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.pageButton}
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
          >
            처음
          </button>
          <button
            className={styles.pageButton}
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            이전
          </button>
          
          {renderPageNumbers()}
          
          <button
            className={styles.pageButton}
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            다음
          </button>
          <button
            className={styles.pageButton}
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
          >
            마지막
          </button>
        </div>
      )}

      <div className={styles.pageInfo}>
        {currentPage} / {totalPages} 페이지 (총 {filteredBoards.length}개 게시글)
      </div>

      {/* 상세 정보 모달 */}
      <Modal 
        title="게시글 상세정보" 
        isOpen={showModal}
        onClose={handleCloseModal}
        size="700px"
      >
        <div className={styles.modalContent}>
          <table className={styles.detailTable}>
            <tbody>
              <tr>
                <td className={styles.labelCell}>번호:</td>
                <td className={styles.valueCell}>{selectedBoard?.boardNum || '-'}</td>
              </tr>
              <tr>
                <td className={styles.labelCell}>제목:</td>
                <td className={styles.valueCell}>{selectedBoard?.title || '-'}</td>
              </tr>
              <tr>
                <td className={styles.labelCell}>작성자:</td>
                <td className={styles.valueCell}>
                  {selectedBoard?.memId || '-'} 
                  {selectedBoard?.memberStatus === 'DELETED' && (
                    <span className={styles.deletedTag}>(회원 삭제됨)</span>
                  )}
                </td>
              </tr>
              <tr>
                <td className={styles.labelCell}>카테고리:</td>
                <td className={styles.valueCell}>
                  {selectedBoard?.cateNum 
                    ? getCategoryName(selectedBoard.cateNum)
                    : '카테고리 없음'
                  }
                </td>
              </tr>
              <tr>
                <td className={styles.labelCell}>작성일:</td>
                <td className={styles.valueCell}>
                  {selectedBoard?.createDate 
                    ? new Date(selectedBoard.createDate).toLocaleDateString()
                    : '-'
                  }
                </td>
              </tr>
              <tr>
                <td className={styles.labelCell}>조회수:</td>
                <td className={styles.valueCell}>{selectedBoard?.readCnt || 0}</td>
              </tr>
              <tr>
                <td className={styles.labelCell}>좋아요:</td>
                <td className={styles.valueCell}>{selectedBoard?.likeCnt || 0}</td>
              </tr>
              <tr>
                <td className={styles.labelCell}>싫어요:</td>
                <td className={styles.valueCell}>{selectedBoard?.dislikeCnt || 0}</td>
              </tr>
              <tr>
                <td className={styles.labelCell} style={{verticalAlign: 'top'}}>내용:</td>
                <td className={styles.valueCell}>
                  {selectedBoard?.content ? (
                    <div 
                      className={styles.content}
                      dangerouslySetInnerHTML={{ __html: selectedBoard.content }}
                    />
                  ) : (
                    <div className={styles.noContent}>내용이 없습니다.</div>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
          <div className={styles.modalButtons}>
            <Button title="닫기" onClick={handleCloseModal} />
            <Button 
              title="삭제" 
              onClick={() => {
                handleDeleteBoard(selectedBoard?.boardNum);
                handleCloseModal();
              }}
              color="danger"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

// 카테고리 번호를 카테고리명으로 변환하는 함수 추가
const getCategoryName = (cateNum) => {
  const categoryMap = {
    1: '자유게시판',
    2: '질문게시판',
    3: '정보공유',
    4: '후기/리뷰'
  };
  return categoryMap[cateNum] || `카테고리 ${cateNum}`;
};

export default AdminBoard;