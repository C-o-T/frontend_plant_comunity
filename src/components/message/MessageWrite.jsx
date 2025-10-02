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
    }
  }, [location]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // receiverId 입력 시 자동완성
    if (name === 'receiverId') {
      if (value.trim().length > 0) {
        searchMembers(value.trim());
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
      setSelectedIndex(-1);
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
    setFormData(prev => ({
      ...prev,
      receiverId: member.memId
    }));
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedIndex(-1);
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

    if (!formData.receiverId.trim()) {
      alert('받는 사람 ID를 입력해주세요.');
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
      await axios.post(`/api/messages/${senderId}`, formData);
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
        <div className={styles.form_group}>
          <label htmlFor="receiverId">받는 사람 ID *</label>
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
