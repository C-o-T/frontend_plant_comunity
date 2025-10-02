import React, { useEffect, useState } from 'react'
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/ko';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import styles from './MyCalendar.module.css'
import { v4 as uuidv4 } from 'uuid';
import WateringPlan from '../components/WateringPlan';
import DeletePlan from '../components/DeletePlan';
import { useNavigate } from 'react-router-dom';
import Holidays from 'date-holidays';

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
  const nav = useNavigate();

  const [isInputOpen, setIsInputOpen] = useState(false);

  useEffect(() => {
    //마이 페이지를 들어갔는데 로그인이 되어있지 않으면
    //홈 화면으로 강제로 리턴
    //로그인한 회원의 아이디를 받을 변수
    const loginInfo = sessionStorage.getItem('loginInfo')
    if(loginInfo === null){
      alert('로그인을 해주세요')
      nav('/')
      return;
    }
  }, []);


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

  // 한국 공휴일 생성
  const [holidays, setHolidays] = useState([]);

  useEffect(() => {
    const hd = new Holidays('KR'); // 한국 공휴일
    const year = new Date().getFullYear();
    const holidayList = hd.getHolidays(year);

    const holidayEvents = holidayList.map(holiday => ({
      id: `holiday-${holiday.date}`,
      title: holiday.name,
      start: new Date(holiday.date),
      end: new Date(holiday.date),
      allDay: true,
      color: '#FF6B6B', // 공휴일은 빨간색으로 표시
      isHoliday: true // 공휴일 구분 플래그
    }));

    setHolidays(holidayEvents);
  }, []);

  
  // console.log(memId)
  // console.log(sessionStorage);
  // console.log(JSON.parse(sessionStorage.getItem('loginInfo')).memId);

  //이벤트 생성 함수
  const addWateringSchedule = ({ plantName, cycle, numSchedules, color }) => {
    const groupId = uuidv4();
    const start = clickedDate;
    const newEvents = [];

    for (let i = 0 ; i < numSchedules; i++ ) {
      const startDate = moment(start).add(i * cycle, 'days').toDate();

      newEvents.push({
        id:uuidv4(),
        groupId : groupId,
        memId:'',
        title:`${plantName} 물 주기`,
        start : startDate,
        end : startDate,
        allDay: true,
        color: color
      })
    }

    setEvents((prevEvents) => {
      const safePrevEvents = Array.isArray(prevEvents) ? prevEvents : [];
      return [...safePrevEvents, ...newEvents];
    });
  }

  // 이벤트 스타일 지정 함수
  const eventStyleGetter = (event) => {
    const style = {
      backgroundColor: event.color,
      borderRadius: '4px',
      opacity: 0.8,
      color: 'white',
      border: '0px',
      display: 'block'
    };
    return { style };
  };

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


  //이 일정 이후 모든 일정 삭제 로직
  const deleteEventsAfter = (event) => {
    const selectedDate = new Date(event.start);
      setEvents((prevEvents) =>
      prevEvents.filter((e) => {
        // 다른 그룹의 일정은 유지
        if (e.groupId !== event.groupId) 
          return true;
        // 같은 그룹이면서 선택된 일정보다 이전 날짜인 일정만 유지
        return new Date(e.start) < selectedDate;
      })
    );
  };
        

  // 클릭된 이벤트 정보를 상태에 저장
  const [selectedEvent, setSelectedEvent] = useState('');

  //이벤트 선택 핸들러 (삭제 옵션)
  const handleSelectEvent = (event) => {
    // 공휴일은 삭제 모달을 띄우지 않음
    if (event.isHoliday) return;
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
          events={[...events, ...holidays]}
          startAccessor="start"
          endAccessor="end"
          style={{height:500}}
          messages={messages}
          onSelectEvent={handleSelectEvent}
          selectable={true}
          onSelectSlot={handleSelectSlot}
          views={['month']}
          longPressThreshold={1}
          eventPropGetter={eventStyleGetter}
        />
      </div>

      {/* 일정 추가 모달 */}
      {
        isInputOpen&&
        <WateringPlan
          isOpen={isInputOpen}
          onClose={() => {
            setIsInputOpen(false);
            setClickedDate(null);
          }}
          clickedDate={clickedDate}
          onAddSchedule={addWateringSchedule}
        />
      }

      {/* 일정 삭제 모달 */}
      {
        selectedEvent && (
        <DeletePlan
          isOpen={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
          selectedEvent={selectedEvent}
          deleteSingleEvent={deleteSingleEvent}
          deleteEventsAfter={deleteEventsAfter}
          deleteEventGroup={deleteEventGroup}
        />
        )
      }
      
    </div>
  )
}

export default MyCalendar



