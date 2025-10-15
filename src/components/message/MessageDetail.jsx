import React, { useState, useEffect } from 'react'
import styles from './MessageDetail.module.css'
import axios from 'axios'
import { useNavigate, useParams } from 'react-router-dom'
import dayjs from 'dayjs'

const MessageDetail = () => {
  const navigate = useNavigate();
  const { messageId } = useParams();
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);

  // 로그인 정보 가져오기
  const loginInfo = JSON.parse(sessionStorage.getItem('loginInfo'));
  const memberId = loginInfo?.memId;

  useEffect(() => {
    if (!memberId) {
      alert('로그인이 필요합니다.');
      navigate('/');
      return;
    }
    fetchMessageDetail();
  }, [messageId, memberId]);

  const fetchMessageDetail = async () => {
    try {
      const response = await axios.get(`/api/messages/${messageId}`);
      const messageData = response.data;
      setMessage(messageData);

      // 백엔드에서 GET 요청 시 자동으로 읽음 처리됨 (read = true로 업데이트)
      // 받은 쪽지인 경우 알람 업데이트 이벤트 발생
      if (messageData.receiverId === memberId) {
        window.dispatchEvent(new Event('messageUpdated'));
      }
    } catch (error) {
      console.error('쪽지 조회 실패:', error);
      if (error.response?.status === 401) {
        alert('로그인이 필요합니다.');
        navigate('/');
      } else {
        alert('쪽지를 불러올 수 없습니다.');
        navigate('/messages');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('쪽지를 삭제하시겠습니까?')) return;

    try {
      // 현재 사용자가 보낸 사람인지 받은 사람인지 확인
      const deleteType = message.receiverId === memberId ? 'receiver' : 'sender';
      await axios.delete(`/api/messages/${messageId}/${memberId}?deleteType=${deleteType}`);

      // 쪽지 삭제 후 알람 업데이트 이벤트 발생
      window.dispatchEvent(new Event('messageUpdated'));

      alert('쪽지가 삭제되었습니다.');
      navigate('/messages');
    } catch (error) {
      console.error('쪽지 삭제 실패:', error);
      alert('쪽지 삭제에 실패했습니다.');
    }
  };

  const handleReply = () => {
    navigate('/messages/write', {
      state: {
        receiverId: message.senderId,
        receiverName: message.senderName,
        title: `RE: ${message.title}`
      }
    });
  };

  if (loading) {
    return <div className={styles.loading}>로딩 중...</div>;
  }

  if (!message) {
    return <div className={styles.error}>쪽지를 찾을 수 없습니다.</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>쪽지 상세</h1>
        <div className={styles.actions}>
          <button onClick={() => navigate('/messages')} className={styles.list_btn}>
            목록
          </button>
          <button onClick={handleReply} className={styles.reply_btn}>
            답장
          </button>
          <button onClick={handleDelete} className={styles.delete_btn}>
            삭제
          </button>
        </div>
      </div>

      <div className={styles.message_card}>
        <div className={styles.message_header}>
          <h2>{message.title}</h2>
          <div className={styles.info}>
            <span className={styles.sender}>
              보낸 사람: <strong>{message.senderName}</strong> ({message.senderId})
            </span>
            <span className={styles.date}>{dayjs(message.createdAt).format('YYYY-MM-DD HH:MM:ss')}</span>
          </div>
        </div>
        <div className={styles.message_body}>
          <p>{message.content}</p>
        </div>
      </div>
    </div>
  )
}

export default MessageDetail
