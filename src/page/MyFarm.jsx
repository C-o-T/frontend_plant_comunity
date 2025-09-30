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
import { Outlet, useNavigate } from 'react-router-dom';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const MyFarm = () => {

  return (
    <div>
      <Outlet />
    </div>
  )
};

export default MyFarm