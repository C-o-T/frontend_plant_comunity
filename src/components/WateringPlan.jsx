import React, { useState } from 'react'
import moment from 'moment'
import Modal from '../common/Modal'
import Input from '../common/Input'
import Select from '../common/Select'
import Button from '../common/Button'
import styles from './WateringPlan.module.css'

const WateringPlan = ({ isOpen, onClose, clickedDate, onAddSchedule }) => {
  const [plantName, setPlantName] = useState('');
  const [selectedCycle, setSelectedCycle] = useState({
    cycle: '0',
    repetition: '0'
  });
  const [customCycle, setCustomCycle] = useState('');
  const [customRepetition, setCustomRepetition] = useState('');
  const [selectedColor, setSelectedColor] = useState('#4CAF50');

  const handleCycleChange = (e) => {
    const value = e.target.value;
    setSelectedCycle(prev => ({ ...prev, cycle: value }));
    if (value !== '+') {
      setCustomCycle('');
    }
  };

  const handleRepetitionChange = (e) => {
    const value = e.target.value;
    setSelectedCycle(prev => ({ ...prev, repetition: value }));
    if (value !== '+') {
      setCustomRepetition('');
    }
  };

  const handleAdd = () => {
    let cycleValue = selectedCycle.cycle;
    if (cycleValue === '+') {
      cycleValue = customCycle;
    }
    const cycle = parseInt(cycleValue, 10);

    let repetitionValue = selectedCycle.repetition;
    if (repetitionValue === '+') {
      repetitionValue = customRepetition;
    }
    const numSchedules = parseInt(repetitionValue, 10);

    if (cycle <= 0 || isNaN(cycle)) {
      alert('유효한 물 주기 일수를 선택하거나 입력해주세요.');
      return;
    }
    if (numSchedules <= 0 || isNaN(numSchedules)) {
      alert('유효한 반복 횟수를 선택하거나 입력해주세요.');
      return;
    }
    if (!clickedDate || isNaN(clickedDate.getTime())) {
      alert('시작 날짜가 유효하지 않습니다.');
      return;
    }

    onAddSchedule({ plantName, cycle, numSchedules, color: selectedColor });

    // 상태 초기화
    setPlantName('');
    setSelectedCycle({ cycle: '0', repetition: '0' });
    setCustomCycle('');
    setCustomRepetition('');
    setSelectedColor('#4CAF50');
    onClose();
  };

  return (
    <Modal
        size=''
        isOpen={isOpen}
        title={'일정 추가'}
        onClose={onClose}
      >
        <div className={styles.input_div}>
          <div>
            <p>{`${moment(clickedDate).format('YYYY년 M월 D일')}부터 일정을 추가합니다.`}</p>
            <Input
              type='text'
              placeholder='식물 이름을 입력해주세요.'
              value={plantName}
              onChange={e=>setPlantName(e.target.value)}
            />
          </div>
          <div>
            <p>얼마나 자주 줄까요?</p>
            <Select
              size='186px'
              value={selectedCycle.cycle}
              onChange={handleCycleChange}
            >
              <option value='0'>주기 선택</option>
              <option value='3'>3일</option>
              <option value='5'>5일</option>
              <option value='7'>7일</option>
              <option value='10'>10일</option>
              <option value='14'>14일</option>
              <option value='+'>기타</option>
            </Select>
            {
              selectedCycle.cycle !== '+' &&
              <span style={{marginLeft: '8px'}}>일 마다</span>
            }
          </div>
          {
            selectedCycle.cycle === '+' && (
              <div className={styles.custom_input_div}>
                  <Input
                      type='number'
                      placeholder='일 수 (예: 21)'
                      value={customCycle}
                      onChange={e => setCustomCycle(e.target.value)}
                      min="1"
                  />
                  <span style={{marginLeft: '8px'}}>일 마다</span>
              </div>
            )
          }

          <div>
            <p>몇번 반복할까요?</p>
            <Select
              size='186px'
              value={selectedCycle.repetition}
              onChange={handleRepetitionChange}
            >
              <option value='0'>회수 선택</option>
                {[...Array(10)].map((_, i) => (
                    <option key={i + 1} value={String(i + 1)}>
                        {i + 1}번
                    </option>
                ))}
              <option value='+'>기타</option>
            </Select>
            {
              selectedCycle.repetition !== '+' &&
              <span style={{marginLeft: '8px'}}>번 반복</span>
            }
          </div>
          {
            selectedCycle.repetition === '+' && (
              <div className={styles.custom_input_div}>
                <Input
                    type='number'
                    placeholder='반복 횟수 (예: 50)'
                    value={customRepetition}
                    onChange={e => setCustomRepetition(e.target.value)}
                    min="1"
                />
                <span style={{marginLeft: '8px'}}>번 반복</span>
              </div>
            )
          }
          <div>
            <p>일정 색상</p>
            <div style={{display: 'flex', gap: '8px', marginTop: '8px'}}>
              {['#4CAF50', '#2196F3', '#FF9800', '#E91E63', '#9C27B0'].map(color => (
                <div
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: color,
                    borderRadius: '4px',
                    cursor: 'pointer',
                    border: selectedColor === color ? '3px solid #333' : '1px solid #ddd'
                  }}
                />
              ))}
            </div>
          </div>
          <div style={{textAlign:'center'}}>
            <Button
              title='추가'
              size='60px'
              onClick={handleAdd}
            />
          </div>
        </div>
    </Modal>
  )
}

export default WateringPlan
