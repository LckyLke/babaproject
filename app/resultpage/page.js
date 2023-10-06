'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useErzeugerContext } from '@/context/erzeuger';
import { useImportDataContext } from '@/context/importdata';
import { useDownloadExcel } from 'react-export-table-to-excel';

var ran = false;
const resultpage = () => {
  //excel export
  const tableRef = useRef(null);
  const { onDownload } = useDownloadExcel({
    currentTableRef: tableRef.current,
    filename: 'test',
    sheet: 'test',
  });
  //excel export end
  const [erzeugerValues, setErzeugerValues] = useErzeugerContext();
  const [importData, setImportData] = useImportDataContext();
  const [usageMatrix, setUsageMatrix] = useState([[]]);
  const [erzeugerSums, setErzeugerSums] = useState([]);
  const calculateUsage = () => {
    const generatedMatrix = Array.from({ length: 8760 }, () => []);
    console.log('cal usage ran');
    for (let i = 0; i < importData.length; i++) {
      const kw = importData[i];
      let curKwSum = 0;
      for (let y = 0; y < erzeugerValues.length; y++) {
        const erzeuger = erzeugerValues[y];
        //wenn erzeuger noch studen hat
        //+ die min leistung des erzeugers übersteigt nicht die fehlenden kw.
        //+ kws noch nicht erreicht
        const curDiff = kw - curKwSum;
        if (
          erzeuger.available() &&
          erzeuger.minimalleistung < curDiff &&
          curKwSum < kw
        ) {
          //erzeuger wird benutzt
          erzeuger.decreaseRemStunden();
          if (curDiff >= erzeuger.maximalleistung) {
            erzeuger.setGenutzteLeistung(erzeuger.maximalleistung);
          } else {
            erzeuger.setGenutzteLeistung(curDiff);
          }
          curKwSum += erzeuger.genutzteleistung;
          console.log(erzeuger);
          generatedMatrix[i].push(erzeuger.copy());
        } else {
          erzeuger.setGenutzteLeistung(0);
          generatedMatrix[i].push(erzeuger.copy());
        }
      }
    }
    console.log(generatedMatrix);
    let newSums = [];
    for (let p = 0; p < erzeugerValues.length; p++) {
      let curSum = 0;
      for (let x = 0; x < generatedMatrix.length; x++) {
        curSum += generatedMatrix[x][p]?.genutzteleistung;
      }
      newSums.push(curSum);
    }
    setErzeugerSums(newSums);
    setUsageMatrix(generatedMatrix);
  };

  useEffect(() => {
    if (ran == false) {
      calculateUsage();
      ran = true;
    }
  }, []);

  return (
    <div className="">
      <button
        onClick={() => {
          console.log(usageMatrix);
          console.log(erzeugerValues);
          onDownload();
        }}
      >
        Debug
      </button>
      {usageMatrix[0].length == 0 && (
        <div class="loading-container">
          <div class="loading-text">
            <span>Loading</span>
            <span class="dot1">.</span>
            <span class="dot2">.</span>
            <span class="dot3">.</span>
          </div>
        </div>
      )}
      <table>
        <tbody>
          {usageMatrix.map((row, rowIndex) => (
            <>
              {rowIndex == 0 && (
                <>
                  {row.map((obj, index) => (
                    <td>
                      <th>{'Erzeuger ' + (index + 1)}</th>
                      <span>{'Leistungssumme: ' + erzeugerSums[index]}</span>
                    </td>
                  ))}
                </>
              )}
              <tr key={rowIndex}>
                {row.map((erzeugerObj, colIndex) => (
                  <>
                    <td key={colIndex} className="  border-black border-2 p-2">
                      {/* Render the properties or values of the ErzeugerObj */}
                      Max Leistung: {erzeugerObj.maximalleistung}
                      <br />
                      Min Leistung: {erzeugerObj.minimalleistung}
                      <br />
                      Genutzte Leistung: {erzeugerObj.genutzteleistung}
                      <br />
                      Verbleibende Stunden: {erzeugerObj.remstunden}
                      {/* Add more properties as needed */}
                    </td>
                  </>
                ))}
              </tr>
            </>
          ))}
        </tbody>
      </table>
      {/*just for export*/}
      {
        <table ref={tableRef} className=" hidden">
          <tbody>
            {usageMatrix.map((row, rowIndex) => (
              <>
                {rowIndex == 0 && (
                  <>
                    {row.map((obj, index) => (
                      <th>{'Erzeuger ' + (index + 1)}</th>
                    ))}
                  </>
                )}
                <tr key={rowIndex}>
                  {row.map((erzeugerObj, colIndex) => (
                    <>
                      <td
                        key={colIndex}
                        className="  border-black border-2 p-2"
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
      }
    </div>
  );
};

export default resultpage;
