import React from 'react';

function Erzeuger({ num, values, setValues }) {
  const handleInputChange = (e, field) => {
    const newValue = parseInt(e.target.value);
    setValues((prevValues) => {
      const updatedValues = [...prevValues];
      updatedValues[num - 1].set(field, newValue);
      return updatedValues;
    });
  };

  return (
    <div key={num} className="mb-2 border-2 border-black p-1 rounded-md">
      <span>Erzeuger {num}</span>
      <div className="flex justify-around">
        <span>Maximale Leistung</span>
        <span>Minimale Leistung</span>
        <span>Benutzungsstunden</span>
      </div>
      <div>
        <input
          placeholder="Maximalleistung in KW"
          type="number"
          className="border rounded-md p-2 mr-1"
          value={values[num - 1].maximalleistung}
          onChange={(e) => handleInputChange(e, 'max')}
        />
        <input
          placeholder="Minimalleistung in KW"
          type="number"
          className="border rounded-md p-2 mr-1"
          value={values[num - 1].minimalleistung}
          onChange={(e) => handleInputChange(e, 'min')}
        />
        <input
          placeholder="Maximal Benutzungsstunden"
          type="number"
          className="border rounded-md p-2"
          value={values[num - 1].benutzungsstunden}
          onChange={(e) => handleInputChange(e, 'stunden')}
        />
      </div>
    </div>
  );
}

export default Erzeuger;
