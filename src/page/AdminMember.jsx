import React, { useEffect, useState } from 'react';
import styles from './AdminMember.module.css';
import Button from '../common/Button';
import Modal from '../common/Modal';

const AdminMember = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  // 회원 목록 조회
  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/members', {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (!res.ok) throw new Error('회원 목록을 불러오지 못했습니다.');
      const data = await res.json();
      setMembers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      alert('회원 목록 조회 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleView = (member) => {
    setSelected(member);
    setOpen(true);
  };

  const handleClose = () => {
    setSelected(null);
    setOpen(false);
  };

  const handleRemove = async (memberId) => {
    if (!window.confirm('선택한 회원을 삭제하시겠습니까?')) return;
    try {
      const res = await fetch(`/api/admin/members/${memberId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('삭제 실패');
      alert('회원이 삭제되었습니다.');
      fetchMembers();
    } catch (err) {
      console.error(err);
      alert('회원 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleToggleAdmin = async (member) => {
    const nextIsAdmin = !member.isAdmin;
    if (!window.confirm(`${member.email} 권한을 ${nextIsAdmin ? '관리자' : '일반'} 으로 변경하시겠습니까?`)) return;
    try {
      const res = await fetch(`/api/admin/members/${member.id}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isAdmin: nextIsAdmin }),
      });
      if (!res.ok) throw new Error('권한 변경 실패');
      alert('권한이 변경되었습니다.');
      fetchMembers();
    } catch (err) {
      console.error(err);
      alert('권한 변경 중 오류가 발생했습니다.');
    }
  };

  const filtered = members.filter((m) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return String(m.id).includes(q) || (m.email || '').toLowerCase().includes(q) || (m.name || '').toLowerCase().includes(q);
  });

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>회원 관리</h2>

      <div className={styles.controls}>
        <input
          className={styles.search}
          placeholder="ID / 이메일 / 이름 검색"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button onClick={fetchMembers} className={styles.refresh}>새로고침</Button>
      </div>

      {loading ? (
        <div className={styles.loading}>로딩 중...</div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>No</th>
                <th>이메일</th>
                <th>이름</th>
                <th>가입일</th>
                <th>권한</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className={styles.empty}>등록된 회원이 없습니다.</td>
                </tr>
              ) : (
                filtered.map((m, idx) => (
                  <tr key={m.id}>
                    <td>{m.id}</td>
                    <td className={styles.ellipsis}>{m.email}</td>
                    <td>{m.name || '-'}</td>
                    <td>{m.createdAt ? new Date(m.createdAt).toLocaleString() : '-'}</td>
                    <td>{m.isAdmin ? '관리자' : '일반'}</td>
                    <td className={styles.actions}>
                      <Button size="sm" onClick={() => handleView(m)}>상세</Button>
                      <Button size="sm" variant="danger" onClick={() => handleRemove(m.id)}>삭제</Button>
                      <Button size="sm" onClick={() => handleToggleAdmin(m)}>
                        {m.isAdmin ? '권한해제' : '관리자지정'}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {open && selected && (
        <Modal onClose={handleClose} title="회원 상세 정보">
          <div className={styles.detail}>
            <p><strong>ID:</strong> {selected.id}</p>
            <p><strong>이메일:</strong> {selected.email}</p>
            <p><strong>이름:</strong> {selected.name || '-'}</p>
            <p><strong>가입일:</strong> {selected.createdAt ? new Date(selected.createdAt).toLocaleString() : '-'}</p>
            <p><strong>전화번호:</strong> {selected.phone || '-'}</p>
            <p><strong>주소:</strong> {selected.address || '-'}</p>
            <div className={styles.modalActions}>
              <Button onClick={() => { handleToggleAdmin(selected); handleClose(); }}>
                {selected.isAdmin ? '권한해제' : '관리자지정'}
              </Button>
              <Button variant="secondary" onClick={handleClose}>닫기</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminMember;