import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);
import styles from './EnvironmentInfo.module.css'
import Select from '../common/Select';

const EnvironmentInfo = () => {
  const nav = useNavigate();

  //센서를 통해 받은 데이터를 변경할 state변수
  const [sensorData, setSensorData] = useState([]);
  const [timeRange, setTimeRange] = useState('1day'); // 기본값: 최근 1일

  // 시간 단위 객체
  const TIME = {
    SECOND: 1000,
    MINUTE: 60 * 1000,
    HOUR: 60 * 60 * 1000,
    DAY: 24 * 60 * 60 * 1000
  };

  // 센서 데이터 가져오는 함수
  const fetchSensorData = () => {
    axios.get('/api/sensor')
      .then(res => setSensorData(res.data))
      .catch(e => console.log(e));
  };

  useEffect(() => {
    //마이팜 페이지를 들어갔는데 로그인이 되어있지 않으면
    //홈 화면으로 강제로 리턴
    const loginInfo = sessionStorage.getItem('loginInfo')
    if(loginInfo === null){
      alert('로그인을 해주세요')
      nav('/')
      return;
    }

    // 처음 마운트될 때 데이터 가져오기
    fetchSensorData();

    // 1초마다 데이터 갱신
    const interval = setInterval(fetchSensorData, TIME.SECOND);

    //sessionStorage 에서 받아온 memId 객체로 변환
    const memId = JSON.parse(loginInfo).memId
    
    // 언마운트 시 interval 제거
    return () => clearInterval(interval);
  }, []);

  // 선택된 기간에 따라 데이터 필터링
  const getFilteredData = () => {
    const now = new Date();
    let filterTime;

    switch(timeRange) {
      case '1day':
        // 오늘 00시 00분 00초 기준
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        filterTime = today.getTime();
        break;
      case '1week':
        filterTime = now.getTime() - (TIME.DAY * 7);
        break;
      case '1month':
        filterTime = now.getTime() - (TIME.DAY * 30);
        break;
      default:
        const defaultToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        filterTime = defaultToday.getTime();
    }

    return sensorData.filter(d => new Date(d.sensorTime).getTime() >= filterTime);
  };

  // 데이터를 최신순으로 정렬
  const sortedData = [...getFilteredData()].sort((b, a) =>
    new Date(b.sensorTime) - new Date(a.sensorTime)
  );

  // 기간별 데이터 그룹화 및 평균 계산 함수 (원본 데이터도 함께 저장)
  const getAggregatedData = () => {
    if (sortedData.length === 0) return [];

    // 1일: 1시간 단위 평균
    if (timeRange === '1day') {
      const hourlyData = {};

      sortedData.forEach(d => {
        const date = new Date(d.sensorTime);
        const hourKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}`;

        if (!hourlyData[hourKey]) {
          hourlyData[hourKey] = {
            sensorTime: new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), 0, 0),
            temperature: [],
            humidity: [],
            illuminance: [],
            soilMoisture: []
          };
        }

        hourlyData[hourKey].temperature.push(d.temperature);
        hourlyData[hourKey].humidity.push(d.humidity);
        hourlyData[hourKey].illuminance.push(d.illuminance);
        hourlyData[hourKey].soilMoisture.push(d.soilMoisture);
      });

      // 평균 계산 + 원본 데이터 저장
      return Object.values(hourlyData).map(group => ({
        sensorTime: group.sensorTime,
        temperature: group.temperature.reduce((a, b) => a + b, 0) / group.temperature.length,
        humidity: group.humidity.reduce((a, b) => a + b, 0) / group.humidity.length,
        illuminance: group.illuminance.reduce((a, b) => a + b, 0) / group.illuminance.length,
        soilMoisture: group.soilMoisture.reduce((a, b) => a + b, 0) / group.soilMoisture.length,
        // 원본 데이터 배열도 함께 저장
        rawData: {
          temperature: group.temperature,
          humidity: group.humidity,
          illuminance: group.illuminance,
          soilMoisture: group.soilMoisture
        }
      }));
    }

    // 1주일 또는 1달: 1일 단위 평균
    else if (timeRange === '1week' || timeRange === '1month') {
      const dailyData = {};

      sortedData.forEach(d => {
        const date = new Date(d.sensorTime);
        const dayKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

        if (!dailyData[dayKey]) {
          dailyData[dayKey] = {
            sensorTime: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0),
            temperature: [],
            humidity: [],
            illuminance: [],
            soilMoisture: []
          };
        }

        dailyData[dayKey].temperature.push(d.temperature);
        dailyData[dayKey].humidity.push(d.humidity);
        dailyData[dayKey].illuminance.push(d.illuminance);
        dailyData[dayKey].soilMoisture.push(d.soilMoisture);
      });

      // 평균 계산 + 원본 데이터 저장
      return Object.values(dailyData).map(group => ({
        sensorTime: group.sensorTime,
        temperature: group.temperature.reduce((a, b) => a + b, 0) / group.temperature.length,
        humidity: group.humidity.reduce((a, b) => a + b, 0) / group.humidity.length,
        illuminance: group.illuminance.reduce((a, b) => a + b, 0) / group.illuminance.length,
        soilMoisture: group.soilMoisture.reduce((a, b) => a + b, 0) / group.soilMoisture.length,
        // 원본 데이터 배열도 함께 저장
        rawData: {
          temperature: group.temperature,
          humidity: group.humidity,
          illuminance: group.illuminance,
          soilMoisture: group.soilMoisture
        }
      }));
    }

    return sortedData;
  };

  // 집계된 데이터 사용
  const aggregatedData = getAggregatedData();

  // 각 센서별 차트 데이터 구성
  const labels = aggregatedData.map(d => {
    const date = new Date(d.sensorTime);
    // 기간에 따라 다른 포맷 사용
    if (timeRange === '1day') {
      return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    } else if (timeRange === '1week') {
      return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric'});
    } else {
      return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
    }
  });

  // 온도 - Area Chart (영역 차트): 온도 변화 추세를 부드럽게 표현
  const temperatureData = {
    labels,
    datasets: [{
      label: '온도 (℃)',
      data: aggregatedData.map(d => d.temperature),
      borderColor: 'rgb(255, 99, 132)',
      backgroundColor: 'rgba(255, 99, 132, 0.3)',
      fill: true,
      tension: 0.4
    }]
  };

  // 습도 - Area Chart (영역 차트): 습도 변화를 시각적으로 표현
  const humidityData = {
    labels,
    datasets: [{
      label: '습도 (%)',
      data: aggregatedData.map(d => d.humidity),
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: 'rgba(75, 192, 192, 0.3)',
      fill: true,
      tension: 0.4
    }]
  };

  // 조도 - Bar Chart (막대 차트): 시간대별 밝기를 명확하게 비교
  const illuminanceData = {
    labels,
    datasets: [{
      label: '조도 (Lux)',
      data: aggregatedData.map(d => d.illuminance),
      backgroundColor: 'rgba(255, 206, 86, 0.7)',
      borderColor: 'rgb(255, 206, 86)',
      borderWidth: 1
    }]
  };

  // 토양습도 - Area Chart (영역 차트): 토양의 수분 변화를 강조
  const soilMoistureData = {
    labels,
    datasets: [{
      label: '토양습도 (%)',
      data: aggregatedData.map(d => d.soilMoisture),
      borderColor: 'rgba(139, 69, 19, 1)',
      backgroundColor: 'rgba(139, 69, 19, 0.3)',
      fill: true,
      tension: 0.4
    }]
  };

  // 차트 옵션 설정
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    interaction: {
      mode: 'index',  // 마우스 X축 위치의 모든 데이터셋 표시
      intersect: false,  // 점에 정확히 안 올려도 표시
      axis: 'x'  // X축 기준으로 가장 가까운 데이터 찾기
    },
    scales: {
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          autoSkip: true,
          maxTicksLimit: timeRange === '1day' ? 12 : timeRange === '1week' ? 14 : 15
        }
      }
    }
  };

  return (
    <div className={styles.graph_div}>
      <div className={styles.header}>
        <h2>환경 데이터(평균값)</h2>
        <Select
          size="150px"
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
        >
          <option value="1day">금일</option>
          <option value="1week">최근 1주일</option>
          <option value="1month">최근 1달</option>
        </Select>
      </div>

      <div className={styles.graphs_container}>
        {/* 온도 */}
        <div className={styles.graph_item}>
          <h3>온도</h3>
          <Line
            data={temperatureData}
            options={{
              ...chartOptions,
              scales: {
                ...chartOptions.scales,
                y: {
                  beginAtZero: true,
                  min: 0,
                  max: 50, // ✅ 온도는 0~50℃
                }
              }
            }}
          />
        </div>

        {/* 습도 */}
        <div className={styles.graph_item}>
          <h3>습도</h3>
          <Line
            data={humidityData}
            options={{
              ...chartOptions,
              scales: {
                ...chartOptions.scales,
                y: {
                  beginAtZero: true,
                  min: 0,
                  max: 100, // ✅ 습도는 0~100%
                }
              }
            }}
          />
        </div>

        {/* 조도 */}
        <div className={styles.graph_item}>
          <h3>조도</h3>
          <Bar
            data={illuminanceData}
            options={{
              ...chartOptions,
              scales: {
                ...chartOptions.scales,
                y: {
                  beginAtZero: true,
                  min: 0, // ✅ 조도는 0부터, 최대는 자동
                }
              }
            }}
          />
        </div>

        {/* 토양습도 */}
        <div className={styles.graph_item}>
          <h3>토양습도</h3>
          <Line
            data={soilMoistureData}
            options={{
              ...chartOptions,
              scales: {
                ...chartOptions.scales,
                y: {
                  beginAtZero: true,
                  min: 0,
                  max: 100, // ✅ 토양습도는 0~100%
                }
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default EnvironmentInfo