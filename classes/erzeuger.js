class ErzeugerObj {
  constructor(max, min, stunden, remstunden, genutzteleistung) {
    if (
      max == undefined &&
      min == undefined &&
      stunden == undefined &&
      remstunden == undefined &&
      genutzteleistung == undefined
    ) {
      this.maximalleistung = '0';
      this.minimalleistung = '0';
      this.benutzungsstunden = '8760';
      //verbleibende Stunden bei Nutzung
      this.remstunden = '8760';
      //tatsächlich genutzte Leistung (cond: minimalleistung =< genutzteleistung =< maximalleistung)
      this.genutzteleistung = 0;
    } else {
      this.maximalleistung = max;
      this.minimalleistung = min;
      this.benutzungsstunden = stunden;
      this.remstunden = remstunden;
      this.genutzteleistung = genutzteleistung;
    }
  }
  // Copy function to create a new instance with the same property values
  copy() {
    return new ErzeugerObj(
      this.maximalleistung,
      this.minimalleistung,
      this.benutzungsstunden,
      this.remstunden,
      this.genutzteleistung
    );
  }
  setMaximalLeistung(val) {
    this.maximalleistung = val;
  }
  setMinimalLeistung(val) {
    this.minimalleistung = val;
  }
  setBenutzungsStunden(val) {
    this.benutzungsstunden = val;
    this.remstunden = val;
  }
  decreaseRemStunden() {
    const current = parseFloat(this.remstunden) || 0;
    this.remstunden = (current - 1).toString();
  }
  setGenutzteLeistung(val) {
    this.genutzteleistung = val;
  }

  getMaximalLeistung() {
    return parseFloat(this.maximalleistung) || 0;
  }

  getMinimalLeistung() {
    return parseFloat(this.minimalleistung) || 0;
  }

  getBenutzungsStunden() {
    return parseFloat(this.benutzungsstunden) || 0;
  }

  available() {
    return (parseFloat(this.remstunden) || 0) > 0;
  }
  
  resetRemHours() {
    this.remstunden = this.benutzungsstunden;
  }

  set(name, val) {
    if (name == 'max') {
      this.setMaximalLeistung(val);
      return;
    }
    if (name == 'min') {
      this.setMinimalLeistung(val);
      return;
    }
    if (name == 'stunden') {
      this.setBenutzungsStunden(val);
      return;
    }
    throw new Error(
      'the provide name does not correspond to a variable of the Erzeuger class Object!'
    );
  }
}

module.exports = ErzeugerObj;
