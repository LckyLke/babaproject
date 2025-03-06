'use client';
import React from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

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

  const computedColor = getComputedStyle(document.documentElement).getPropertyValue('--foreground-rgb').trim();
const legendTextColor = `rgb(${computedColor})`;

const options = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: {
      position: 'right',
      labels: {
        color: legendTextColor,  // explicitly resolved CSS color
        usePointStyle: true,
        padding: 20,
        font: { size: 12 },
        generateLabels: (chart) => {
          const datasets = chart.data.datasets;
          return chart.data.labels.map((label, i) => {
            const value = datasets[0].data[i];
            const percentage = ((value / totalDemand) * 100).toFixed(1);
            return {
              text: `${label} (${percentage}%)`,
              fillStyle: datasets[0].backgroundColor[i],
              strokeStyle: datasets[0].borderColor[i],
              lineWidth: 1,
              hidden: false,
              index: i,
              fontColor: legendTextColor,
            };
          });
        }
      }
    },
    title: {
      display: true,
      text: 'Verteilung der Arbeit',
      color: legendTextColor,
      font: { size: 16, weight: 'bold' },
      padding: { top: 10, bottom: 20 }
    },
    tooltip: {
      callbacks: {
        label: function(context) {
          const value = context.raw;
          const percentage = ((value / totalDemand) * 100).toFixed(1);
          return `${context.label}: ${Math.round(value).toLocaleString('de-DE')} kWh (${percentage}%)`;
        }
      },
      backgroundColor: 'rgb(var(--background-end-rgb))',
      titleColor: legendTextColor,
      bodyColor: legendTextColor,
      borderColor: 'rgb(var(--border-color))',
      borderWidth: 1,
      padding: 12,
      displayColors: true,
      usePointStyle: true,
      boxPadding: 6
    }
  }
};




  return (
    <div className="w-full h-full flex items-center justify-center">
      <Pie data={data} options={options} />
    </div>
  );
} 