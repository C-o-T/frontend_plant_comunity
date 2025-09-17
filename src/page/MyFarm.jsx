import axios from 'axios';
import React, { useEffect, useState } from 'react'
import styles from './MyFarm.module.css'
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const MyFarm = () => {
  //센서를 통해 받은 데이터를 변경할 state변수
  const [sensorData, setSensorData] = useState([]);

  console.log(sensorData)

  // 시간 단위 객체
  const TIME = {
    SECOND: 1000,
    MINUTE: 60 * 1000,
    HOUR: 60 * 60 * 1000,
    DAY: 24 * 60 * 60 * 1000
  };

  // 데이터 가져오는 함수
  const fetchSensorData = () => {
    axios.get('/api/sensor')
      .then(res => setSensorData(res.data))
      .catch(e => console.log(e));
  };

  useEffect(() => {
    // 처음 마운트될 때 데이터 가져오기
    fetchSensorData();

    // 10분(600000ms)마다 데이터 갱신
    const interval = setInterval(fetchSensorData, TIME.HOUR);

    // 언마운트 시 interval 제거
    return () => clearInterval(interval);
  }, []);

  // 데이터를 최신순으로 정렬
  const sortedData = [...sensorData].sort((b, a) => 
    new Date(b.sensorTime) - new Date(a.sensorTime)
  );

  // 차트 데이터 구성할 때 정렬된 데이터 사용
  const chartData = {
    labels: sortedData.map(d => new Date(d.sensorTime).toLocaleTimeString()),
    datasets: [
      {
        label: '온도 (℃)',
        data: sortedData.map(d => d.temperature),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4
      },
      {
        label: '습도 (%)',
        data: sortedData.map(d => d.humidity),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        tension: 0.4
      },
      {
        label: '조도',
        data: sortedData.map(d => d.illuminance),
        borderColor: 'rgb(255, 206, 86)',
        backgroundColor: 'rgba(255, 206, 86, 0.2)',
        tension: 0.4
      },
      {
        label: '토양습도',
        data: sortedData.map(d => d.soilMoisture),
        borderColor: 'rgba(70, 62, 41, 1)',
        backgroundColor: 'rgba(255, 206, 86, 0.2)',
        tension: 0.4
      }
    ]
  };
  

  return (
    <div className="container">
      <h2>Sensor Data (실시간 1시간 간격)</h2>
      <div className={styles.graph_div}><Line data={chartData} className={styles.graph}/></div>
    </div>
  );
};

export default MyFarm