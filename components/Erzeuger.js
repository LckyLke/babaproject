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
      <div className=" border-b-2 border-black">Erzeuger {num}</div>
      <div>
        <div>Max Leistung</div>
        <input
          placeholder="Maximalleistung in KW"
          type="number"
          className="border rounded-md p-2 mr-1"
          value={values[num - 1].maximalleistung}
          onChange={(e) => handleInputChange(e, 'max')}
        />
        <div>Min Leistung</div>
        <input
          placeholder="Minimalleistung in KW"
          type="number"
          className="border rounded-md p-2 mr-1"
          value={values[num - 1].minimalleistung}
          onChange={(e) => handleInputChange(e, 'min')}
        />
        <div>Benutzungsstunden</div>
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
