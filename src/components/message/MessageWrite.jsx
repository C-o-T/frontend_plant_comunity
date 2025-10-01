import React, { useState, useEffect } from 'react'
import styles from './MessageWrite.module.css'
import axios from 'axios'
import { useNavigate, useLocation } from 'react-router-dom'

const MessageWrite = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    receiverId: '',
    title: '',
    content: ''
  });

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
      await axios.post('/messages', formData);
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
          <input
            type="text"
            id="receiverId"
            name="receiverId"
            value={formData.receiverId}
            onChange={handleChange}
            placeholder="받는 사람의 ID를 입력하세요"
            readOnly={!!location.state?.receiverId}
          />
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