'use client';
import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { useTheme } from '@/context/theme';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
);

const graphColors = [
  '#FF5733',
  '#33FF57',
  '#5733FF',
  '#FF33A1',
  '#33A1FF',
  '#A1FF33',
  '#FF3363',
  '#3363FF',
  '#63FF33',
];

export default function PieChart({ usageMatrix, importData }) {
  const { theme } = useTheme();
  const [chartTextColor, setChartTextColor] = useState('rgba(51, 65, 85, 1)');
  
  useEffect(() => {
    // Update text color based on theme
    if (typeof window !== 'undefined') {
      const isDarkMode = 
        theme === 'dark' || 
        (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      
      setChartTextColor(isDarkMode ? 'rgba(241, 245, 249, 1)' : 'rgba(51, 65, 85, 1)');
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

  // Prepare data for pie chart
  const data = {
    labels: [
      ...erzeugerSums.map((_, index) => `Erzeuger ${index + 1}`),
      'Fehlende Arbeit'
    ],
    datasets: [{
      data: [...erzeugerSums, missingEnergy],
      backgroundColor: [
        ...erzeugerSums.map((_, index) => graphColors[(index + 1) % graphColors.length]),
        '#808080' // Gray color for missing energy
      ],
      borderColor: [
        ...erzeugerSums.map((_, index) => graphColors[(index + 1) % graphColors.length]),
        '#808080'
      ],
      borderWidth: 1,
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: chartTextColor,
          usePointStyle: true,
          padding: 20,
          font: { size: 12 },
          generateLabels: function(chart) {
            const datasets = chart.data.datasets;
            return chart.data.labels.map(function(label, i) {
              const value = datasets[0].data[i];
              const percentage = ((value / totalDemand) * 100).toFixed(1);
              return {
                text: `${label} (${percentage}%)`,
                fillStyle: datasets[0].backgroundColor[i],
                strokeStyle: datasets[0].borderColor[i],
                lineWidth: 1,
                hidden: false,
                index: i,
                // Explicitly set the text color for the legend items
                fontColor: chartTextColor
              };
            });
          }
        }
      },
      title: {
        display: true,
        text: 'Verteilung der Arbeit',
        color: chartTextColor,
        font: { size: 16, weight: 'bold' },
        padding: { top: 10, bottom: 20 }
      },
      tooltip: {
        backgroundColor: theme === 'dark' ? 'rgba(30, 41, 59, 0.9)' : 'rgba(248, 250, 252, 0.9)',
        titleColor: chartTextColor,
        bodyColor: chartTextColor,
        borderColor: theme === 'dark' ? 'rgba(71, 85, 105, 0.5)' : 'rgba(203, 213, 225, 0.5)',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        usePointStyle: true,
        boxPadding: 6
      }
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center text-slate-700 dark:text-slate-200">
      <Pie data={data} options={options} />
    </div>
  );
} 