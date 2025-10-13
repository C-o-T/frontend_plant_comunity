import { useState, useEffect } from 'react'
import moment from 'moment'
import Modal from '../common/Modal'
import Input from '../common/Input'
import Button from '../common/Button'
import styles from './CalendarDiary.module.css'

const CalendarDiary = ({
  isOpen,
  onClose,
  clickedDate,
  existingDiary,
  onSaveDiary,
  onUpdateDiary,
  onDeleteDiary
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  // 수정 모드일 때 기존 데이터 로드
  useEffect(() => {
    if (existingDiary) {
      setTitle(existingDiary.diaryTitle || '');
      setContent(existingDiary.diaryContent || '');
    } else {
      setTitle('');
      setContent('');
    }
  }, [existingDiary]);

  const handleSave = () => {
    if (!title.trim()) {
      alert('일기 제목을 입력해주세요.');
      return;
    }
    if (!content.trim()) {
      alert('일기 내용을 입력해주세요.');
      return;
    }

    if (existingDiary) {
      // 수정 모드
      onUpdateDiary(existingDiary.diaryId, { title, content });
    } else {
      // 새 일기 작성
      onSaveDiary({ title, content });
    }

    // 상태 초기화 및 모달 닫기
    setTitle('');
    setContent('');
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm('정말 이 일기를 삭제하시겠습니까?')) {
      onDeleteDiary(existingDiary.diaryId);
      setTitle('');
      setContent('');
      onClose();
    }
  };

  const handleClose = () => {
    setTitle('');
    setContent('');
    onClose();
  };

  return (
    <Modal
      size='500px'
      isOpen={isOpen}
      title={existingDiary ? '일기 수정' : '일기 쓰기'}
      onClose={handleClose}
    >
      <div className={styles.input_div}>
        <div>
          <p className={styles.date_text}>
            {moment(clickedDate).format('YYYY년 M월 D일')}
          </p>
        </div>

        <div>
          <Input
            type='text'
            placeholder='일기 제목을 입력해주세요.'
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </div>

        <div>
          <textarea
            className={styles.textarea}
            placeholder='오늘 하루는 어땠나요?'
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={10}
          />
        </div>

        <div className={styles.button_group}>
          {existingDiary && (
            <Button
              title='삭제'
              color='tertiary'
              size='80px'
              onClick={handleDelete}
            />
          )}
          <Button
            title={existingDiary ? '수정' : '저장'}
            size='80px'
            onClick={handleSave}
          />
        </div>
      </div>
    </Modal>
  )
}

export default CalendarDiary
