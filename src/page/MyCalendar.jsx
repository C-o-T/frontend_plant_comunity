import React, { useEffect, useState } from 'react'
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/ko';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import styles from './MyCalendar.module.css'
import Select from '../common/Select'
import Button from '../common/Button';
import Input from '../common/Input';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import Modal from '../common/Modal';

//moment 로컬라이저 설정
moment.locale("ko"); //한국어로 설정
const localizer = momentLocalizer(moment);
//한국어 메시지 설정
const messages = {
  allDay:'종일',
  previous:'이전',
  next:'다음',
  today:'오늘',
  month:'월',
  week:'주',
  day:'일',
  agenda:'일정',
  data:'날짜',
  time:'시간',
  event:'일정'
}


const MyCalendar = () => {

  const [isInputOpen, setIsInputOpen] = useState(false);


  const loginInfo = JSON.parse(sessionStorage.getItem('loginInfo') || '{}');
  //현재 로그인된 사용자 ID 가져오기
  const memId = loginInfo.memId;
  //memId를 기반으로 고유 키 생성
  const storageKey = `wateringEvents_${memId}`

  //localStorage에서 해당 사용자의 데이터를 불러와 상태를 초기화
  const [events, setEvents] = useState(() => {
    const savedEventsString = localStorage.getItem(storageKey);
    if (savedEventsString && savedEventsString !== 'undefined') {
      // JSON 문자열을 객체로 변환
      const parsedEvents = JSON.parse(savedEventsString);

      // start와 end 필드를 Date 객체로 변환
      return parsedEvents.map(event => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end),
      }));
    }
    return [];
  });

  
  // console.log(memId)
  // console.log(sessionStorage);
  // console.log(JSON.parse(sessionStorage.getItem('loginInfo')).memId);

  //선택된 관수 주기를 관리할 상태 추가
  const [selectedCycle, setSelectedCycle] = useState({
    cycle : 0,
    repetition : 0
  });
  //기타 선택 시 직접 입력할 값 (관수주기)
  const [customCycle, setCustomCycle] = useState(''); 
  //기타 선택 시 직접 입력할 값 (스케쥴 반복 주기)
  const [customRepetition, setCustomRepetition] = useState(''); 
  
  //식물 이름을 입력받을 상태 추가(이벤트 제목)
  const [plantName, setPlantName] = useState('');

  // 주기 (cycle) Select 변경 핸들러
    const handleCycleChange = (e) => {
        const value = e.target.value;
        setSelectedCycle(prev => ({ ...prev, cycle: value }));
        if (value !== '+') {
            setCustomCycle(''); // 기타가 아니면 직접입력값 초기화
        }
    };

    // 반복 횟수 (repetition) Select 변경 핸들러
    const handleRepetitionChange = (e) => {
        const value = e.target.value;
        setSelectedCycle(prev => ({ ...prev, repetition: value }));
        if (value !== '+') {
            setCustomRepetition(''); // 기타가 아니면 직접입력값 초기화
        }
    };

  //console.log(selectedCycle)
  //console.log(plantName)

  //이벤트 생성 함수
  const addWateringSchedule = () => {
    const groupId = uuidv4(); // 이 그룹의 모든 이벤트에 동일하게 부여될 고유 ID
    const start = clickedDate;
    const newEvents = [];
    // 주기(Cycle) 결정
    let cycleValue = selectedCycle.cycle;
    if (cycleValue === '+') {
        cycleValue = customCycle;
    }
    const cycle = parseInt(cycleValue, 10);

    // 반복 횟수(Repetition) 결정
    let repetitionValue = selectedCycle.repetition;
    if (repetitionValue === '+') {
        repetitionValue = customRepetition;
    }
    const numSchedules = parseInt(repetitionValue, 10);

    if (cycle <= 0 || isNaN(cycle)) {
        alert('유효한 물 주기 일수를 선택하거나 입력해주세요.');
        return false;
    }
    if (numSchedules <= 0 || isNaN(numSchedules)) {
        alert('유효한 반복 횟수를 선택하거나 입력해주세요.');
        return false;
    }
    if (!clickedDate || isNaN(clickedDate.getTime())) {
        alert('시작 날짜가 유효하지 않습니다.');
        return false;
    }

    for (let i = 0 ; i < numSchedules; i++ ) { 
      const startDate = moment(start).add(i * cycle, 'days').toDate();
      

      newEvents.push({
        id:uuidv4(), //각 이벤트의 고유 ID
        groupId : groupId, //그룹의 모든 이벤트에 동일하게 부여될 고유 ID
        memId:'',
        title:`${plantName} 물 주기`,
        start : startDate,
        end : startDate,
        allDay: true
      })
    }

    setEvents((prevEvents) => {
      // prevEvents가 배열이 아니면 빈 배열로 초기화
      const safePrevEvents = Array.isArray(prevEvents) ? prevEvents : [];
      return [...safePrevEvents, ...newEvents];
    });

    setPlantName('');
    setSelectedCycle({
      cycle:'0',
      repetition:'0'
    });
    setCustomCycle(''); 
    setCustomRepetition(''); 
    return true;
  }

  // 클릭된 날짜 정보를 저장할 상태
  const [clickedDate, setClickedDate] = useState(null);

  //캘린더 슬롯 선택 핸들러 함수 (날짜 클릭시 호출)
  const handleSelectSlot = (slotInfo) => {
    setClickedDate(slotInfo.start);
    setIsInputOpen(true);
  }
  

  //개별 이벤트 삭제 로직
  const deleteSingleEvent = (eventId) => {
    setEvents((prevEvents)=>{return prevEvents.filter((e)=>e.id !== eventId)})
  };

  //그룹 이벤트 삭제 로직
  const deleteEventGroup = (groupId) => {
    setEvents((prevEvents) => prevEvents.filter((event) => event.groupId !== groupId));
  };

  // 클릭된 이벤트 정보를 상태에 저장
  const [selectedEvent, setSelectedEvent] = useState('');

  //이벤트 선택 핸들러 (삭제 옵션)
  const handleSelectEvent = (event) => {
    setSelectedEvent(event); // 클릭된 이벤트 정보를 상태에 저장
  };
  

  // events 상태가 변경될 때마다 localStorage에 저장
  useEffect(() => {
    if(events) {
      localStorage.setItem(storageKey, JSON.stringify(events))
    } else {
      localStorage.setItem(storageKey, JSON.stringify([]))
    }
  }, [events,storageKey]);
  

  return (
    <div className={styles.container}>
      
      {/* 캘린더 */}
      <div className={styles.calendar_div}>
        <Calendar 
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{height:500, width:1280}}
          messages={messages}
          onSelectEvent={handleSelectEvent}
          selectable={true}
          onSelectSlot={handleSelectSlot}
          views={['month', 'agenda']} 
          longPressThreshold={1}
        />
      </div>

      {/* 일정 추가 모달 */}
      {
        isInputOpen&&
        <Modal
          size=''
          isOpen={isInputOpen}
          title={'일정 추가'}
          onClose={(e)=>{
            setIsInputOpen(false);
            setClickedDate(null);
            setPlantName('');
            setSelectedCycle({ cycle: '0', repetition: '0' }); // 객체 초기화
            setCustomCycle('');
            setCustomRepetition('');
          }}
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
                onChange={e=>handleCycleChange(e)}
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
            <div style={{textAlign:'center'}}>
              <Button 
                title='추가'
                size='60px'
                onClick={e=>{
                  if (addWateringSchedule(e)) {
                    setIsInputOpen(false);
                    setClickedDate(null);
                  }
                }}
              />
            </div>
          </div>
      </Modal>
      }
      
      {/* 일정 삭제 모달 */}
      {
        selectedEvent && (
          <Modal
            isOpen={!!selectedEvent}
            title='일정 삭제'
            event={selectedEvent}
            onClose={()=>{
              setSelectedEvent(null);
            }}
          >
            <div>일정을 삭제하시겠습니까?</div>
            <Button
              color='secondary'
              title='이 일정만 삭제'
              onClick={()=>{
                deleteSingleEvent(selectedEvent.id)
                setSelectedEvent(null)
              }}
            />
            <Button
              title='모든 일정을 삭제'
              onClick={()=>{
                deleteEventGroup(selectedEvent.groupId)
                setSelectedEvent(null)
              }}
            />
          </Modal>
        )
      }
      
    </div>
  )
}

export default MyCalendar



