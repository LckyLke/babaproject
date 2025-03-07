'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useErzeugerContext } from '@/context/erzeuger';
import { useImportDataContext } from '@/context/importdata';
import { useDownloadExcel } from 'react-export-table-to-excel';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale, // x axis
  LinearScale, // y axis
  PointElement,
  Legend,
  Filler,
  Title,
} from 'chart.js';
import Erzeuger from './Erzeuger';
import * as XLSX from 'xlsx';
import { useTheme } from '@/context/theme';

ChartJS.register(
  LineElement,
  CategoryScale, // x axis
  LinearScale, // y axis
  PointElement,
  Legend,
  Filler,
  Title
);
var ran = false;
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

export default function LineChart({ usageMatrix }) {
  const [erzeugerValues] = useErzeugerContext();
  const [importData] = useImportDataContext();
  const tableRef = useRef(null);
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

  const onDownload = () => {
    const wb = XLSX.utils.table_to_book(tableRef.current);
    XLSX.writeFile(wb, 'Erzeuger_Daten.xlsx');
  };

  if (!importData.length) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center max-w-md">
          <svg className="w-16 h-16 mx-auto text-slate-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="text-xl font-medium mb-2 text-slate-700 dark:text-slate-200">Keine Daten verfügbar</h3>
          <p className="text-slate-600 dark:text-slate-400">
            Bitte laden Sie zuerst einen Lastgang hoch und fügen Sie mindestens einen Erzeuger hinzu, um die Jahresdauerlinie zu sehen.
          </p>
        </div>
      </div>
    );
  }

  // Create datasets with proper labels that will respect the theme color
  const datasets = [
    ...erzeugerValues.map((erzeuger, index) => ({
      label: erzeuger.name || `Erzeuger ${index + 1}`,
      data: usageMatrix
        .filter((_, i) => i % 24 === 0)
        .map((row) => row[index]?.genutzteleistung || 0),
      backgroundColor: graphColors[(index + 1) % 8],
      borderColor: graphColors[(index + 1) % 8],
      tension: 0.4,
      fill: 'stack',
      tooltip: {
        callbacks: {
          label: function(context) {
            const dataPoint = usageMatrix
              .filter((_, i) => i % 24 === 0)[context.dataIndex][index];
            return [
              `${erzeuger.name || `Erzeuger ${index + 1}`}: ${context.raw.toFixed(2)} kW`,
              `Verbleibende Stunden: ${dataPoint?.remstunden || 0}`
            ];
          }
        }
      }
    })),
    {
      label: 'Bedarfslastgang',
      data: importData.filter((_, i) => i % 24 === 0),
      backgroundColor: graphColors[0],
      borderColor: graphColors[0],
      tension: 0.4,
      stack: 'bedarf',
    },
  ];

  return (
    <div className="w-full h-full">
      <Line
        className="lineChart"
        data={{
          labels: Array.from({ length: 365 }, (_, i) => i + 1).map(String),
          datasets: datasets,
        }}
        options={{
          responsive: true,
          maintainAspectRatio: true,
          aspectRatio: 1.75,
          devicePixelRatio: 2,
          interaction: {
            mode: 'index',
            intersect: false,
          },
          scales: {
            x: {
              title: {
                display: true,
                text: 'Tage',
                color: chartTextColor,
                font: {
                  size: 14,
                  weight: 'medium',
                },
              },
              grid: {
                color: theme === 'dark' ? 'rgba(71, 85, 105, 0.1)' : 'rgba(203, 213, 225, 0.1)',
              },
              ticks: {
                color: chartTextColor,
              },
            },
            y: {
              stacked: true,
              min: 0,
              max: Math.floor(Math.max(...importData) * 1.1),
              title: {
                display: true,
                text: 'Leistung',
                color: chartTextColor,
                font: {
                  size: 14,
                  weight: 'medium',
                },
              },
              grid: {
                color: theme === 'dark' ? 'rgba(71, 85, 105, 0.1)' : 'rgba(203, 213, 225, 0.1)',
              },
              ticks: {
                color: chartTextColor,
                callback: function(value) {
                  return value.toLocaleString('de-DE');
                }
              },
            },
          },
          plugins: {
            legend: {
              position: 'top',
              labels: {
                padding: 20,
                color: chartTextColor,
                usePointStyle: true,
                pointStyle: 'circle',
                font: {
                  size: 12,
                  weight: 'normal',
                },
              },
            },
            filler: {
              propagate: true,
            },
            title: {
              display: true,
              text: 'Geordnete Jahresdauerlinie Wärme',
              color: chartTextColor,
              font: {
                size: 18,
                weight: 'bold',
              },
              padding: {
                top: 10,
                bottom: 30,
              },
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
              boxPadding: 6,
              callbacks: {
                label: function(context) {
                  let label = context.dataset.label || '';
                  if (label) {
                    label += ': ';
                  }
                  if (context.parsed.y !== null) {
                    label += context.parsed.y.toLocaleString('de-DE') + ' kWh';
                  }
                  return label;
                }
              }
            },
          },
        }}
      />

      {/* Hidden table for export */}
      <table ref={tableRef} className="hidden">
        <tbody>
          {usageMatrix.map((row, rowIndex) => (
            <>
              {rowIndex == 0 && (
                <>
                  {row.map((obj, index) => (
                    <th>{erzeugerValues[index]?.name || `Erzeuger ${index + 1}`}</th>
                  ))}
                </>
              )}
              <tr key={rowIndex}>
                {row.map((erzeugerObj, colIndex) => (
                  <>
                    <td
                      key={colIndex}
                      className="border-black border-2 p-2"
                    >
                      {erzeugerObj.genutzteleistung}
                    </td>
                  </>
                ))}
              </tr>
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
}
