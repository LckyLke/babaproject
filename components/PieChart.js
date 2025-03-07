'use client';
import React, { useState, useEffect } from 'react';
import { Pie, Doughnut, Bar, PolarArea } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  RadialLinearScale,
} from 'chart.js';
import { useTheme } from '@/context/theme';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  RadialLinearScale,
);

// Light mode colors - brighter but not too saturated
const lightModeColors = [
  '#FF5733', // Coral
  '#33FF57', // Lime Green
  '#5733FF', // Purple
  '#FF33A1', // Pink
  '#33A1FF', // Sky Blue
  '#A1FF33', // Yellow-Green
  '#FF3363', // Crimson
  '#3363FF', // Royal Blue
  '#63FF33', // Bright Green
];

// Dark mode colors - more saturated and higher contrast for dark backgrounds
const darkModeColors = [
  '#FF7755', // Brighter Coral
  '#55FF77', // Brighter Lime
  '#7755FF', // Brighter Purple
  '#FF55B3', // Brighter Pink
  '#55B3FF', // Brighter Sky Blue
  '#B3FF55', // Brighter Yellow-Green
  '#FF5577', // Brighter Crimson
  '#5577FF', // Brighter Royal Blue
  '#77FF55', // Brighter Green
];

export default function PieChart({ usageMatrix, importData }) {
  const { theme } = useTheme();
  const [chartTextColor, setChartTextColor] = useState('rgba(51, 65, 85, 1)');
  const [chartType, setChartType] = useState('pie'); // Default chart type
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [graphColors, setGraphColors] = useState(lightModeColors);
  const [missingEnergyColor, setMissingEnergyColor] = useState('#808080');
  
  useEffect(() => {
    // Update colors based on theme
    if (typeof window !== 'undefined') {
      const darkMode = 
        theme === 'dark' || 
        (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      
      setIsDarkMode(darkMode);
      setChartTextColor(darkMode ? 'rgba(241, 245, 249, 1)' : 'rgba(51, 65, 85, 1)');
      setGraphColors(darkMode ? darkModeColors : lightModeColors);
      setMissingEnergyColor(darkMode ? '#a0a0a0' : '#808080'); // Lighter gray for dark mode
    }
  }, [theme]);

  // Calculate total demand
  const totalDemand = importData.reduce((a, b) => a + b, 0);

  // Calculate sum for each Erzeuger
  const erzeugerSums = usageMatrix.length > 0 ? Array(usageMatrix[0].length).fill(0).map((_, index) => {
    return usageMatrix.reduce((sum, row) => sum + (row[index]?.genutzteleistung || 0), 0);
  }) : [];

  // Calculate total supplied energy
  const totalSupplied = erzeugerSums.reduce((a, b) => a + b, 0);

  // Calculate missing energy
  const missingEnergy = Math.max(0, totalDemand - totalSupplied);

  // Prepare data for charts
  const data = {
    labels: [
      ...erzeugerSums.map((_, index) => `Erzeuger ${index + 1}`),
      'Fehlende Arbeit'
    ],
    datasets: [{
      data: [...erzeugerSums, missingEnergy],
      backgroundColor: [
        ...erzeugerSums.map((_, index) => graphColors[(index + 1) % graphColors.length]),
        missingEnergyColor
      ],
      borderColor: isDarkMode ? 
        [...erzeugerSums.map(() => 'rgba(30, 41, 59, 0.8)'), 'rgba(30, 41, 59, 0.8)'] : 
        [...erzeugerSums.map(() => 'rgba(255, 255, 255, 0.8)'), 'rgba(255, 255, 255, 0.8)'],
      borderWidth: isDarkMode ? 1.5 : 1,
    }]
  };

  // Common options for all chart types
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: chartTextColor,
          usePointStyle: true,
          padding: 10,
          font: { size: 11 },
          boxWidth: 10,
          generateLabels: function(chart) {
            const datasets = chart.data.datasets;
            return chart.data.labels.map(function(label, i) {
              const value = datasets[0].data[i];
              const percentage = ((value / totalDemand) * 100).toFixed(1);
              return {
                text: `${label} (${percentage}%)`,
                fillStyle: datasets[0].backgroundColor[i],
                strokeStyle: isDarkMode ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                lineWidth: isDarkMode ? 1.5 : 1,
                hidden: false,
                index: i,
                fontColor: chartTextColor
              };
            });
          }
        }
      },
      title: {
        display: true,
        text: getChartTitle(),
        color: chartTextColor,
        font: { size: 14, weight: 'bold' },
        padding: { top: 5, bottom: 10 }
      },
      tooltip: {
        backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.95)' : 'rgba(248, 250, 252, 0.95)',
        titleColor: chartTextColor,
        bodyColor: chartTextColor,
        borderColor: isDarkMode ? 'rgba(100, 116, 139, 0.5)' : 'rgba(203, 213, 225, 0.5)',
        borderWidth: 1,
        padding: 8,
        displayColors: true,
        usePointStyle: true,
        boxPadding: 4
      }
    }
  };

  // Specific options for bar chart
  const barOptions = {
    ...commonOptions,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: chartTextColor,
          font: { size: 10 }
        },
        grid: {
          color: isDarkMode ? 'rgba(100, 116, 139, 0.15)' : 'rgba(203, 213, 225, 0.15)',
        },
      },
      x: {
        ticks: {
          color: chartTextColor,
          font: { size: 10 }
        },
        grid: {
          color: isDarkMode ? 'rgba(100, 116, 139, 0.15)' : 'rgba(203, 213, 225, 0.15)',
        },
      }
    }
  };

  // Specific options for polar area chart
  const polarAreaOptions = {
    ...commonOptions,
    scales: {
      r: {
        beginAtZero: true,
        ticks: {
          color: chartTextColor,
          backdropColor: 'transparent',
          font: { size: 10 }
        },
        grid: {
          color: isDarkMode ? 'rgba(100, 116, 139, 0.2)' : 'rgba(203, 213, 225, 0.2)',
        },
        angleLines: {
          color: isDarkMode ? 'rgba(100, 116, 139, 0.2)' : 'rgba(203, 213, 225, 0.2)',
        },
        pointLabels: {
          color: chartTextColor,
          font: { size: 10 }
        }
      }
    }
  };

  // Function to get chart title based on chart type
  function getChartTitle() {
    switch(chartType) {
      case 'pie': return 'Verteilung der Arbeit (Kreisdiagramm)';
      case 'doughnut': return 'Verteilung der Arbeit (Ringdiagramm)';
      case 'bar': return 'Verteilung der Arbeit (Balkendiagramm)';
      case 'polarArea': return 'Verteilung der Arbeit (Polardiagramm)';
      default: return 'Verteilung der Arbeit';
    }
  }

  // Function to render the appropriate chart based on chartType
  const renderChart = () => {
    switch(chartType) {
      case 'pie':
        return <Pie data={data} options={commonOptions} />;
      case 'doughnut':
        return <Doughnut data={data} options={commonOptions} />;
      case 'bar':
        return <Bar data={data} options={barOptions} />;
      case 'polarArea':
        return <PolarArea data={data} options={polarAreaOptions} />;
      default:
        return <Pie data={data} options={commonOptions} />;
    }
  };

  return (
    <div className="w-full h-full flex flex-col text-slate-700 dark:text-slate-200">
      <div className="w-full mb-2 flex justify-center space-x-1">
        <button 
          onClick={() => setChartType('pie')}
          className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${
            chartType === 'pie' 
              ? 'bg-blue-600 text-white' 
              : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600'
          }`}
        >
          Kreisdiagramm
        </button>
        <button 
          onClick={() => setChartType('doughnut')}
          className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${
            chartType === 'doughnut' 
              ? 'bg-blue-600 text-white' 
              : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600'
          }`}
        >
          Ringdiagramm
        </button>
        <button 
          onClick={() => setChartType('bar')}
          className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${
            chartType === 'bar' 
              ? 'bg-blue-600 text-white' 
              : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600'
          }`}
        >
          Balkendiagramm
        </button>
        <button 
          onClick={() => setChartType('polarArea')}
          className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${
            chartType === 'polarArea' 
              ? 'bg-blue-600 text-white' 
              : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600'
          }`}
        >
          Polardiagramm
        </button>
      </div>
      <div className="w-full h-[calc(100%-40px)] overflow-hidden">
        {renderChart()}
      </div>
    </div>
  );
} 