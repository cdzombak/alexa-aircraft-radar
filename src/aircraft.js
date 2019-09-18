'use strict'

const Location = require('./location')
const AircraftTypes = require('./AircraftTypes.json')
// const AircraftManufacturers = require('./AircraftManufacturers.json')

function toBool(val) {
  if (val === undefined) {
    return false
  }
  if (typeof val === 'boolean') {
    return val
  }
  if (typeof val === 'number') {
    return Math.round(val) !== 0
  }
  if (typeof val === 'string') {
    val = val.toLowerCase()
    return val === '1' || val === 'true' || val === 't'
  }
  return Boolean(val)
}

function toTitleCase(str) {
  return str.split(' ')
    .map(w => w[0].toUpperCase() + w.substr(1).toLowerCase())
    .join(' ')
}

const ManufacturerBlacklist = ['AVIONES COLOMBIA']

// const ManufacturerNameFixups = {
//   "AIRBUS": "Airbus",
//   "BOEING": "Boeing"
// }
//
// TODO(cdzombak): the manufacturer & model name cleanup in here needs a lot of work, and probably better data sources.

class Aircraft {

  // Construct a new Aircraft instance based on the given API representation of an aircraft.
  //
  // The resulting instance works when given either a new or old style API response.
  constructor(apiDict) {
    this._apiDict = apiDict
    this._memoizedTypeMetadata = undefined
  }

  static fromJSON(json) {
    return new Aircraft(json['apiDict'])
  }

  toJSON() {
    return { apiDict: this._apiDict }
  }

  _numberFromApiDict(key1, key2) {
    if (key1 in this._apiDict) {
      return Number(this._apiDict[key1])
    } else if (key2 in this._apiDict) {
      return Number(this._apiDict[key2])
    }
    return undefined
  }

  _stringFromApiDict(key1, key2) {
    let retv = undefined
    if (key1 in this._apiDict) {
      retv = String(this._apiDict[key1])
    } else if (key2 in this._apiDict) {
      retv = String(this._apiDict[key2])
    }
    if (retv === '') {
      retv = undefined
    }
    return retv
  }

  // The altitude in feet at standard pressure.
  get altitude() {
    return this._numberFromApiDict('Alt', 'alt')
  }

  // The altitude adjusted for local air pressure, should be roughly the height above mean sea level.
  get altitudeMsl() {
    return this._numberFromApiDict('GAlt', 'galt')
  }

  // The location over the ground
  get location() {
    const lat = this._numberFromApiDict('Lat', 'lat')
    const lon = this._numberFromApiDict('Long', 'lon')
    return new Location(lat, lon)
  }

  // Calculate the bearing in degrees of the aircraft from the given location.
  bearingFrom(location) {
    return this.location.bearingFrom(location)
  }

  // The callsign. May be missing or undefined.
  get callsign() {
    return this._stringFromApiDict('Call', 'call')
  }

  // True if the callsign may not be correct.
  // Missing in the new API.
  get callSus() {
    if ('CallSus' in this._apiDict) {
      return toBool(this._apiDict.CallSus)
    }
    return false
  }

  // Calculate the distance in miles between the aircraft and the given location.
  distanceMi(location) {
    return this.location.distanceMi(location)
  }

  // Calculate the distance in kilometers between the aircraft and the given location.
  distanceKm(location) {
    return this.location.distanceKm(location)
  }

  // The code and name of the departure airport.
  get from() {
    return this._stringFromApiDict('From', 'from')
  }

  // The code and name of the arrival airport.
  get to() {
    return this._stringFromApiDict('To', 'to')
  }

  // The ICAO of the aircraft.
  get icao() {
    return this._stringFromApiDict('Icao', 'icao')
  }

  // True if the aircraft appears to be operated by the military.
  get isMilitary() {
    return toBool(this._stringFromApiDict('Mil', 'mil'))
  }

  // The registration.
  get registration() {
    return this._stringFromApiDict('Reg', 'reg')
  }

  // Aircraft's track angle across the ground clockwise from 0° north.
  get trak() {
    return this._numberFromApiDict('Trak', 'trak')
  }

  // The aircraft model's ICAO type code.
  //
  // See:
  // - https://www.icao.int/publications/DOC8643/Pages/Search.aspx
  // - https://www.icao.int/publications/DOC8643/Pages/SpecialDesignators.aspx
  get icaoType() {
    return this._stringFromApiDict('Type', 'type')
  }

  // Returns metadata about this aircraft's type, or undefined if it's unknown.
  get typeMetadata() {
    if (this.icaoType === 'ZZZZ') {
      return undefined
    }
    if (this._memoizedTypeMetadata === null) {
      return undefined
    }
    if (this._memoizedTypeMetadata !== undefined) {
      return this._memoizedTypeMetadata
    }
    const metadata = AircraftTypes
      .find(t => t.Designator === this.icaoType
        && ManufacturerBlacklist.find(c => c === t.ManufacturerCode) === undefined)
    if (metadata === undefined) {
      this._memoizedTypeMetadata = null
      return undefined
    }
    // let manufacturer = ManufacturerNameFixups[metadata.ManufacturerCode]
    // if (manufacturer === undefined) {
    //   const mDict = AircraftManufacturers.find(m => m.Code === metadata.ManufacturerCode)
    //   if (mDict !== undefined) {
    //     manufacturer = mDict.Names[0]
    //   }
    // }
    const manufacturer = toTitleCase(metadata.ManufacturerCode)
    if (manufacturer !== undefined) {
      metadata.Manufacturer = manufacturer.replace(/\(.*?\)/g, '').replace(/ {2}/g, ' ').trim()
    }
    this._memoizedTypeMetadata = metadata
    return metadata
  }

  // True if we know this is a jet; false otherwise.
  get isJet() {
    if (!this.typeMetadata) {
      return false
    }
    return this.typeMetadata.EngineType === 'Jet'
  }

  // True if we know this is a helicopter-like thing; false otherwise.
  get isHelicopter() {
    if (this.icaoType === 'GYRO' || this.icaoType === 'UHEL') {
      return true
    }
    if (!this.typeMetadata) {
      return false
    }
    return this.typeMetadata.AircraftDescription === 'Helicopter'
      || this.typeMetadata.AircraftDescription === 'Gyrocopter'
      || this.typeMetadata.AircraftDescription === 'Tiltrotor'
  }

  // Return a human-meaningful, English description for this aircraft.
  get modelDescription() {
    if (this.icaoType === 'SHIP') {
      return 'airship'
    }
    if (this.icaoType === 'BALL') {
      return 'balloon'
    }
    if (this.icaoType === 'GLID') {
      return 'glider'
    }
    if (this.icaoType === 'ULAC') {
      return 'ultralight aircraft'
    }
    if (this.icaoType === 'GYRO') {
      return 'ultralight autogyro'
    }
    if (this.icaoType === 'UHEL') {
      return 'ultralight helicopter'
    }
    if (this.icaoType === 'PARA') {
      return 'paraglider'
    }
    if (this.icaoType === 'ZZZZ' || !this.typeMetadata) {
      return 'unknown aircraft'
    }
    const manufacturer = this.typeMetadata.Manufacturer
    const modelName = this.typeMetadata.ModelFullName
    if (manufacturer !== undefined && modelName !== undefined && manufacturer.length > 0 && modelName.length > 0) {
      return `${manufacturer} ${modelName}`
    }
    if (manufacturer === undefined || manufacturer.length === 0) {
      return modelName
    }
    if (modelName === undefined || modelName.length === 0) {
      return `${manufacturer} aircraft`
    }
    return 'unknown aircraft'
  }

}

module.exports = Aircraft
