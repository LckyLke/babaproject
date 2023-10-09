'use client';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import Erzeuger from '@/components/Erzeuger';
import * as XLSX from 'xlsx';
import Link from 'next/link';
import { useErzeugerContext } from '@/context/erzeuger';
import { useImportDataContext } from '@/context/importdata';
import ErzeugerObj from '@/classes/erzeuger';
import LineChart from '@/components/LineChart';

export default function Home() {
  const [numDivs, setNumDivs] = useState(0);
  const MAX_VALUE = 99;
  const [erzeugerValues, setErzeugerValues] = useErzeugerContext();
  const [importData, setImportData] = useImportDataContext();
  const [showGraph, setShowGraph] = useState(false);
  const [dataValid, setDataValid] = useState(false);

  const handleInputChange = (e) => {
    var value = parseInt(e.target.value);
    if (value >= MAX_VALUE) {
      value = MAX_VALUE;
    }
    setNumDivs(value);
    const newErzeugerValues = Array.from(
      { length: value },
      () => new ErzeugerObj()
    );
    setErzeugerValues(newErzeugerValues);
  };

  useEffect(() => {
    const isErzeugerValid =
      erzeugerValues.length > 0 &&
      erzeugerValues.every(
        (erzeuger) =>
          erzeuger.maximalleistung !== '' &&
          erzeuger.minimalleistung !== '' &&
          erzeuger.benutzungsstunden !== ''
      );

    const isImportDataValid = importData.length === 8760;

    setDataValid(isErzeugerValid && isImportDataValid);
  }, [erzeugerValues, importData]);

  const hanleFileUpload = (e) => {
    console.log(e);
    const reader = new FileReader();
    reader.readAsBinaryString(e.target.files[0]);
    reader.onload = (e) => {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const parsedData = XLSX.utils.sheet_to_json(sheet);
      console.log(typeof parsedData[0]);
      console.log(parsedData.map((val) => Math.ceil(val[0])));
      setImportData(parsedData.map((val) => Math.ceil(val[0])));
    };
  };
  return (
    <div className="flex justify-between px-2">
      <div className=" h-screen flex flex-col justify-around items-start">
        <div>
          <div>Anzahl Wärmeerzeuger</div>
          <input
            type="number"
            className="border rounded-md p-2"
            placeholder="Enter a number"
            value={numDivs}
            max={99}
            onChange={handleInputChange}
          />
        </div>
        <input
          title="Import"
          className="bg-blue-500 text-white p-2 rounded-md"
          type="file"
          accept=".xlsx, .xls"
          onChange={(e) => {
            hanleFileUpload(e);
          }}
        />
        <div className="mt-4 h-96 overflow-y-auto border border-gray-300 rounded-md p-4 text-sm">
          {erzeugerValues.map((_, index) => (
            <Erzeuger
              key={index}
              num={index + 1}
              values={erzeugerValues}
              setValues={setErzeugerValues}
            />
          ))}
        </div>
        <div>
          <button
            className=" border-2 rounded-md border-black p-2"
            onClick={() => setShowGraph((prev) => !prev)}
          >
            Ergebnis Graph ein/-ausblenden
          </button>
          <div className=" text-red-800">
            Bei Änderung an den Daten sollte der Graph aus perfomance Gründen
            ausgeblendet sein!
          </div>
        </div>
      </div>
      {showGraph && <LineChart />}
    </div>
  );
}
