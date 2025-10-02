import React, { useState, useEffect } from 'react'
import styles from './MessageList.module.css'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const MessageList = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState('received'); // 'received' or 'sent'
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  // 로그인 정보 가져오기
  const loginInfo = JSON.parse(sessionStorage.getItem('loginInfo'));
  const memberId = loginInfo?.memId;

  // 로그인 체크
  useEffect(() => {
    if (!memberId) {
      alert('로그인이 필요합니다.');
      navigate('/');
    }
  }, [memberId, navigate]);

  // 쪽지 목록 조회
  useEffect(() => {
    if (memberId) {
      fetchMessages();
    }
  }, [tab, memberId]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const endpoint = tab === 'received'
        ? `/api/messages/box/received/${memberId}`
        : `/api/messages/box/sent/${memberId}`;
      const response = await axios.get(endpoint);
      // 응답이 배열인지 확인
      if (Array.isArray(response.data)) {
        setMessages(response.data);
      } else {
        console.error('응답이 배열이 아닙니다:', response.data);
        setMessages([]);
      }
    } catch (error) {
      console.error('쪽지 목록 조회 실패:', error);
      setMessages([]);
      if (error.response?.status === 401) {
        alert('로그인이 필요합니다.');
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  // 쪽지 삭제
  const handleDelete = async (msgNum, e) => {
    e.stopPropagation();
    if (!window.confirm('쪽지를 삭제하시겠습니까?')) return;

    try {
      await axios.delete(`/api/messages/${msgNum}/${memberId}`);
      alert('쪽지가 삭제되었습니다.');
      fetchMessages();
    } catch (error) {
      console.error('쪽지 삭제 실패:', error);
      alert('쪽지 삭제에 실패했습니다.');
    }
  };

  // 쪽지 상세 보기
  const handleMessageClick = (msgNum) => {
    navigate(`/messages/${msgNum}`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>쪽지함</h1>
        <button
          className={styles.write_btn}
          onClick={() => navigate('/messages/write')}
        >
          ✉️ 쪽지 쓰기
        </button>
      </div>

      {/* 탭 */}
      <div className={styles.tabs}>
        <button
          className={tab === 'received' ? styles.active : ''}
          onClick={() => setTab('received')}
        >
          받은 쪽지함
        </button>
        <button
          className={tab === 'sent' ? styles.active : ''}
          onClick={() => setTab('sent')}
        >
          보낸 쪽지함
        </button>
      </div>

      {/* 쪽지 목록 */}
      <div className={styles.message_list}>
        {loading ? (
          <div className={styles.loading}>로딩 중...</div>
        ) : messages.length === 0 ? (
          <div className={styles.empty}>
            {tab === 'received' ? '받은 쪽지가 없습니다.' : '보낸 쪽지가 없습니다.'}
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.msgNum}
              className={`${styles.message_item} ${!message.isRead && tab === 'received' ? styles.unread : ''}`}
              onClick={() => handleMessageClick(message.msgNum)}
            >
              <div className={styles.message_header}>
                <div className={styles.left}>
                  {!message.isRead && tab === 'received' && (
                    <span className={styles.new_badge}>N</span>
                  )}
                  <span className={styles.name}>
                    {tab === 'received' ? message.senderName : message.receiverName}
                  </span>
                  <span className={styles.id}>
                    ({tab === 'received' ? message.senderId : message.receiverId})
                  </span>
                </div>
                <div className={styles.right}>
                  <span className={styles.date}>{message.createdAt}</span>
                  <button
                    className={styles.delete_btn}
                    onClick={(e) => handleDelete(message.msgNum, e)}
                  >
                    삭제
                  </button>
                </div>
              </div>
              <div className={styles.message_content}>
                <h3>{message.title}</h3>
                <p>{message.content}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default MessageList
