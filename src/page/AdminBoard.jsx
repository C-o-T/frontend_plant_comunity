import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import Input from '../common/Input';
import Button from '../common/Button';
import { Outlet } from 'react-router-dom';
import styles from './AdminBoard.module.css';

// 말머리(카테고리) 매핑
const CATE_LABEL = {
  1: '지식인',
  2: '피드',
  3: '정보공유',
};

const SORT_OPTIONS = [
  { key: 'createDate', label: '작성일 최신순' },
  { key: 'readCnt', label: '조회수 내림차순' },
  { key: 'likeCnt', label: '좋아요 내림차순' },
  { key: 'dislikeCnt', label: '싫어요 내림차순' },
  { key: 'boardNum', label: '글번호 내림차순' },
];

const PAGE_SIZE = 10;

const AdminBoard = () => {
  // 원본 데이터
  const [boardList, setBoardList] = useState([]);
  const [error, setError] = useState('');

  // 필터
  const [filterTitle, setFilterTitle] = useState('');
  const [filterWriter, setFilterWriter] = useState('');
  const [filterCate, setFilterCate] = useState('');

  // 정렬
  const [sortField, setSortField] = useState('createDate');

  // 선택
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isAllSelected, setIsAllSelected] = useState(false);

  // 페이지
  const [currentPage, setCurrentPage] = useState(1);

  // 데이터 로딩
  const loadBoards = async () => {
    try {
      setError('');
      const resAll = await axios.get('/api/boards/boardList');
      setBoardList(resAll.data || []);
    } catch (e1) {
      try {
        const resPop = await axios.get('/api/boards');
        setBoardList(resPop.data || []);
      } catch (e2) {
        setError('게시글을 불러오는 중 오류가 발생했습니다.');
      }
    }
  };

  useEffect(() => {
    loadBoards();
  }, []);

  // 필터링
  const filteredBoards = useMemo(() => {
    return boardList.filter((row) => {
      const matchTitle =
        filterTitle.trim() === '' ||
        (row.title || '').toLowerCase().includes(filterTitle.toLowerCase());
      const matchWriter =
        filterWriter.trim() === '' ||
        (row.memId || '').toLowerCase().includes(filterWriter.toLowerCase());
      const matchCate =
        filterCate === '' || String(row.cateNum || '') === String(filterCate);
      return matchTitle && matchWriter && matchCate;
    });
  }, [boardList, filterTitle, filterWriter, filterCate]);

  // 정렬
  const sortedBoards = useMemo(() => {
    const arr = [...filteredBoards];
    arr.sort((a, b) => {
      if (sortField === 'createDate') {
        const da = new Date(a.createDate).getTime() || 0;
        const db = new Date(b.createDate).getTime() || 0;
        return db - da;
      }
      const va = Number(a[sortField] ?? 0);
      const vb = Number(b[sortField] ?? 0);
      return vb - va;
    });
    return arr;
  }, [filteredBoards, sortField]);

  // 페이지네이션
  const total = sortedBoards.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const validPage = Math.min(currentPage, totalPages);
  const pagedBoards = useMemo(() => {
    const start = (validPage - 1) * PAGE_SIZE;
    return sortedBoards.slice(start, start + PAGE_SIZE);
  }, [sortedBoards, validPage]);

  // 체크박스 제어
  useEffect(() => {
    setIsAllSelected(false);
    setSelectedIds(new Set());
  }, [validPage, sortField, filterTitle, filterWriter, filterCate]);

  const toggleAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set());
      setIsAllSelected(false);
    } else {
      const ids = new Set(pagedBoards.map((r) => r.boardNum));
      setSelectedIds(ids);
      setIsAllSelected(true);
    }
  };

  const toggleOne = (boardNum) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(boardNum)) next.delete(boardNum);
      else next.add(boardNum);
      return next;
    });
  };

  // 단건 삭제
  const removeOne = async (boardNum) => {
    if (!window.confirm(`글번호 ${boardNum}을(를) 삭제하시겠습니까?`)) return;
    try {
      await axios.delete(`/api/boards/${boardNum}`);
      setBoardList((prev) => prev.filter((r) => r.boardNum !== boardNum));
      alert('삭제되었습니다.');
    } catch (e) {
      console.log(e);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  // 선택 삭제
  const removeSelected = async () => {
    if (selectedIds.size === 0) {
      alert('선택된 항목이 없습니다.');
      return;
    }
    if (!window.confirm(`선택한 ${selectedIds.size}개 게시글을 삭제하시겠습니까?`)) return;

    const ids = Array.from(selectedIds);
    let success = 0;
    for (const id of ids) {
      try {
        await axios.delete(`/api/boards/${id}`);
        success += 1;
      } catch (e) {
        console.log('삭제 실패 id:', id, e);
      }
    }
    if (success > 0) {
      setBoardList((prev) => prev.filter((r) => !selectedIds.has(r.boardNum)));
      setSelectedIds(new Set());
      setIsAllSelected(false);
    }
    alert(`삭제 완료: ${success}건, 실패: ${ids.length - success}건`);
  };

  const resetFilters = () => {
    setFilterTitle('');
    setFilterWriter('');
    setFilterCate('');
    setSortField('createDate');
    setCurrentPage(1);
  };

  return (
    <div className={styles.adminWrap}>
      <h2>관리자 페이지</h2>
      {/* 사이드나 탭이 있다면 그 옆에 Outlet 배치 */}
      <div className={styles.adminContent}>
        <Outlet />
      </div>
    </div>
  );
};

export default AdminBoard;
