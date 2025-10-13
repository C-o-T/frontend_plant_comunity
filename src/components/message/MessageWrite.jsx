import React, { useState, useEffect } from 'react'
import styles from './MessageWrite.module.css'
import axios from 'axios'
import { useNavigate, useLocation } from 'react-router-dom'

const MessageWrite = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 로그인 정보 가져오기
  const loginInfo = JSON.parse(sessionStorage.getItem('loginInfo'));
  const senderId = loginInfo?.memId;

  const [formData, setFormData] = useState({
    receiverId: '',
    title: '',
    content: ''
  });

  // 다중 발송 관련 상태
  const [sendMode, setSendMode] = useState('single'); // 'single', 'multiple', 'all'
  const [selectedReceivers, setSelectedReceivers] = useState([]);

  // 자동완성 관련 상태
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // 로그인 체크
  useEffect(() => {
    if (!senderId) {
      alert('로그인이 필요합니다.');
      navigate('/');
    }
  }, [senderId, navigate]);

  // 답장인 경우 초기값 설정
  useEffect(() => {
    if (location.state) {
      setFormData({
        receiverId: location.state.receiverId || '',
        title: location.state.title || '',
        content: ''
      });
      setSendMode('single');
    }
  }, [location]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // receiverId 입력 시 자동완성
    if (name === 'receiverId' && sendMode !== 'all') {
      if (value.trim().length > 0) {
        searchMembers(value.trim());
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
      setSelectedIndex(-1);
    }
  };

  // 발송 모드 변경
  const handleSendModeChange = (mode) => {
    setSendMode(mode);
    if (mode === 'all') {
      setSelectedReceivers([]);
      setFormData(prev => ({ ...prev, receiverId: '' }));
      setShowSuggestions(false);
    } else if (mode === 'single') {
      setSelectedReceivers([]);
    }
  };

  // 회원 검색
  const searchMembers = async (keyword) => {
    try {
      const response = await axios.get(`/api/members/search`, {
        params: { keyword }
      });
      setSuggestions(response.data || []);
      setShowSuggestions(true);
    } catch (error) {
      console.error('회원 검색 실패:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // 추천 항목 선택
  const handleSelectSuggestion = (member) => {
    if (sendMode === 'single') {
      setFormData(prev => ({
        ...prev,
        receiverId: member.memId
      }));
    } else if (sendMode === 'multiple') {
      // 이미 선택된 사람인지 확인
      if (!selectedReceivers.find(r => r.memId === member.memId)) {
        setSelectedReceivers(prev => [...prev, member]);
      }
      setFormData(prev => ({ ...prev, receiverId: '' }));
    }
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  // 선택된 수신자 제거
  const handleRemoveReceiver = (memId) => {
    setSelectedReceivers(prev => prev.filter(r => r.memId !== memId));
  };

  // 키보드 네비게이션
  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleSelectSuggestion(suggestions[selectedIndex]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 유효성 검사
    if (sendMode === 'single' && !formData.receiverId.trim()) {
      alert('받는 사람 ID를 입력해주세요.');
      return;
    }

    if (sendMode === 'multiple' && selectedReceivers.length === 0) {
      alert('받는 사람을 선택해주세요.');
      return;
    }

    if (!formData.title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }

    if (!formData.content.trim()) {
      alert('내용을 입력해주세요.');
      return;
    }

    try {
      const requestData = {
        title: formData.title,
        content: formData.content
      };

      if (sendMode === 'all') {
        requestData.sendToAll = true;
        if (!window.confirm('전체 회원에게 쪽지를 발송하시겠습니까?')) {
          return;
        }
      } else if (sendMode === 'multiple') {
        requestData.receiverIds = selectedReceivers.map(r => r.memId);
        if (!window.confirm(`${selectedReceivers.length}명에게 쪽지를 발송하시겠습니까?`)) {
          return;
        }
      } else {
        requestData.receiverId = formData.receiverId;
      }

      await axios.post(`/api/messages/${senderId}`, requestData);
      alert('쪽지가 전송되었습니다.');
      navigate('/messages');
    } catch (error) {
      console.error('쪽지 전송 실패:', error);
      if (error.response?.status === 401) {
        alert('로그인이 필요합니다.');
        navigate('/');
      } else {
        alert(error.response?.data || '쪽지 전송에 실패했습니다.');
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>쪽지 쓰기</h1>
        <button onClick={() => navigate('/messages')} className={styles.cancel_btn}>
          취소
        </button>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* 발송 모드 선택 */}
        <div className={styles.form_group}>
          <label>발송 모드</label>
          <div className={styles.send_mode_buttons}>
            <button
              type="button"
              className={`${styles.mode_btn} ${sendMode === 'single' ? styles.active : ''}`}
              onClick={() => handleSendModeChange('single')}
            >
              개별 발송
            </button>
            <button
              type="button"
              className={`${styles.mode_btn} ${sendMode === 'multiple' ? styles.active : ''}`}
              onClick={() => handleSendModeChange('multiple')}
            >
              다중 발송
            </button>
            <button
              type="button"
              className={`${styles.mode_btn} ${sendMode === 'all' ? styles.active : ''}`}
              onClick={() => handleSendModeChange('all')}
            >
              전체 발송
            </button>
          </div>
        </div>

        {/* 받는 사람 입력 (전체 발송이 아닐 때만 표시) */}
        {sendMode !== 'all' && (
          <div className={styles.form_group}>
            <label htmlFor="receiverId">
              받는 사람 ID * {sendMode === 'multiple' && '(검색 후 선택)'}
            </label>
            <div className={styles.autocomplete_wrapper}>
            <input
              type="text"
              id="receiverId"
              name="receiverId"
              value={formData.receiverId}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (formData.receiverId.trim() && suggestions.length > 0) {
                  setShowSuggestions(true);
                }
              }}
              placeholder="받는 사람의 ID를 입력하세요"
              readOnly={!!location.state?.receiverId}
              autoComplete="off"
            />
            {showSuggestions && suggestions.length > 0 && (
              <ul className={styles.suggestions}>
                {suggestions.map((member, index) => (
                  <li
                    key={member.memId}
                    className={index === selectedIndex ? styles.selected : ''}
                    onClick={() => handleSelectSuggestion(member)}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <span className={styles.suggestion_id}>{member.memId}</span>
                    <span className={styles.suggestion_name}>({member.memName})</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {location.state?.receiverName && (
            <span className={styles.receiver_name}>
              ({location.state.receiverName})
            </span>
          )}
        </div>
        )}

        {/* 다중 발송 시 선택된 수신자 목록 */}
        {sendMode === 'multiple' && selectedReceivers.length > 0 && (
          <div className={styles.form_group}>
            <label>선택된 수신자 ({selectedReceivers.length}명)</label>
            <div className={styles.selected_receivers}>
              {selectedReceivers.map(receiver => (
                <div key={receiver.memId} className={styles.receiver_tag}>
                  <span>{receiver.memId} ({receiver.memName})</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveReceiver(receiver.memId)}
                    className={styles.remove_btn}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 전체 발송 안내 메시지 */}
        {sendMode === 'all' && (
          <div className={styles.form_group}>
            <div className={styles.all_send_notice}>
              ⚠️ 전체 회원에게 쪽지가 발송됩니다.
            </div>
          </div>
        )}

        <div className={styles.form_group}>
          <label htmlFor="title">제목 *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="제목을 입력하세요"
          />
        </div>

        <div className={styles.form_group}>
          <label htmlFor="content">내용 *</label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="내용을 입력하세요"
            rows="12"
          />
        </div>

        <div className={styles.actions}>
          <button type="submit" className={styles.submit_btn}>
            ✉️ 전송
          </button>
          <button
            type="button"
            onClick={() => navigate('/messages')}
            className={styles.cancel_action_btn}
          >
            취소
          </button>
        </div>
      </form>
    </div>
  )
}

export default MessageWrite
