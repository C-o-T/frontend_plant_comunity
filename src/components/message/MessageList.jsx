import React, { useState, useEffect } from 'react'
import styles from './MessageList.module.css'
import axios from 'axios'
import { useNavigate, useLocation } from 'react-router-dom'
import dayjs from 'dayjs'

const MessageList = () => {
  const navigate = useNavigate();
  const location = useLocation();
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

  // 쪽지 목록 조회 (페이지 이동 시마다 새로 조회)
  useEffect(() => {
    if (memberId) {
      fetchMessages();
    }
  }, [tab, memberId, location.pathname]);

  // 쪽지 읽음/삭제 이벤트 감지하여 목록 갱신 + 1초마다 자동 갱신
  useEffect(() => {
    const handleMessageUpdate = () => {
      if (memberId) {
        fetchMessages();
      }
    };
    window.addEventListener('messageUpdated', handleMessageUpdate);

    // 1초마다 쪽지 목록 자동 갱신
    const interval = setInterval(() => {
      if (memberId) {
        fetchMessages();
      }
    }, 100000);

    return () => {
      clearInterval(interval);
      window.removeEventListener('messageUpdated', handleMessageUpdate);
    };
  }, [memberId, tab]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const endpoint = tab === 'received'
        ? `/api/messages/box/received/${memberId}`
        : `/api/messages/box/sent/${memberId}`;
      const response = await axios.get(endpoint);
      // 응답이 배열인지 확인
      if (Array.isArray(response.data)) {
        // 논리적 삭제된 쪽지 필터링
        const filteredMessages = response.data.filter(msg => {
          // 받은 쪽지함: deletedByReceiver가 false인 것만
          if (tab === 'received') {
            return msg.deletedByReceiver === false;
          }
          // 보낸 쪽지함: deletedBySender가 false인 것만
          else {
            return msg.deletedBySender === false;
          }
        });

        setMessages(filteredMessages);
      } else {
        setMessages([]);
      }
    } catch (error) {
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
      // 탭에 따라 다른 API 엔드포인트 사용
      const deleteType = tab === 'received' ? 'receiver' : 'sender';
      await axios.delete(`/api/messages/${msgNum}/${memberId}?deleteType=${deleteType}`);

      // 쪽지 삭제 후 알람 업데이트 이벤트 발생
      window.dispatchEvent(new Event('messageUpdated'));

      alert('쪽지가 삭제되었습니다.');
      fetchMessages();
    } catch (error) {
      console.error('쪽지 삭제 실패:', error);
      alert('쪽지 삭제에 실패했습니다.');
    }
  };

  // 쪽지 상세 보기
  const handleMessageClick = async (msgNum, read) => {
    // 안 읽은 쪽지를 클릭한 경우, 읽음 처리 후 알람 업데이트
    if (tab === 'received' && !read) {
      // 읽음 처리는 MessageDetail에서 하지만, 여기서 미리 이벤트 발생
      // (사용자가 바로 목록으로 돌아올 경우를 대비)
      window.dispatchEvent(new Event('messageUpdated'));
    }
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
              className={`${styles.message_item} ${!message.read && tab === 'received' ? styles.unread : ''}`}
              onClick={() => handleMessageClick(message.msgNum, message.read)}
            >
              <div className={styles.message_header}>
                <div className={styles.left}>
                  {!message.read && tab === 'received' && (
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
                  <span className={styles.date}>{dayjs(message.createdAt).format('YYYY-MM-DD HH:MM:ss')}</span>
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
