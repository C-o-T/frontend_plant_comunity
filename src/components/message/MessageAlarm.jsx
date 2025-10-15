import React, { useState, useEffect } from 'react'
import styles from './MessageAlarm.module.css'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const MessageAlarm = () => {
  const nav = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const loginInfo = sessionStorage.getItem('loginInfo');

  // 로그인하지 않았으면 렌더링하지 않음
  if (!loginInfo) {
    return null;
  }

  // 안 읽은 쪽지 개수 조회
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const loginData = JSON.parse(loginInfo);
        const memberId = loginData?.memId;
        if (!memberId) return;

        const response = await axios.get(`/api/messages/unread/count/${memberId}`);
        setUnreadCount(response.data);
      } catch (error) {
        console.error('안 읽은 쪽지 조회 실패:', error);
        setUnreadCount(0);
      }
    };

    fetchUnreadCount();

    // 커스텀 이벤트 리스너 등록 (쪽지 읽음/삭제 시 알림)
    const handleMessageUpdate = () => {
      fetchUnreadCount();
    };
    window.addEventListener('messageUpdated', handleMessageUpdate);

    // 1초마다 갱신
    const interval = setInterval(fetchUnreadCount, 1000);

    return () => {
      clearInterval(interval);
      window.removeEventListener('messageUpdated', handleMessageUpdate);
    };
  }, []);

  return (
    <div
      className={styles.message_alarm}
      onClick={() => nav('/messages')}
      title="쪽지함"
    >
      <span className={styles.icon}>✉️</span>
      {unreadCount > 0 && (
        <span className={styles.badge}>{unreadCount > 99 ? '99+' : unreadCount}</span>
      )}
    </div>
  )
}

export default MessageAlarm
