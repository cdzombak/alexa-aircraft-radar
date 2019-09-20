'use strict'

const Aircraft = require('./aircraft')
const Geocode = require('./geocode')
const rp = require('request-promise')

// Extends the Aircraft model to include properties about the view of the aircraft from the user's location.
class AircraftView extends Aircraft {

  constructor(apiDict, location) {
    super(apiDict)
    this.userLocation = location
  }

  static fromJSON(json) {
    return new AircraftView(json['apiDict'], Geocode.Location3D.fromJSON(json['userLocation']))
  }

  toJSON() {
    const json = super.toJSON()
    json['userLocation'] = this.userLocation.toJSON()
    return json
  }

  // Return the apparent elevation of the aircraft from the user's ground elevation.
  get altitudeAgl() {
    return this.altitudeMsl - this.userLocation.elevation
  }

  // Return the actual distance in 3D between the user and the aircraft.
  // noinspection JSUnusedGlobalSymbols
  get user3DDistanceMi() {
    const altAglMi = this.altitudeAgl / 5280.0
    return Math.hypot(altAglMi, this.distanceMi(this.userLocation))
  }

  // Return the actual distance in 3D between the user and the aircraft.
  get user3DDistanceKm() {
    const altAglKm = this.altitudeAgl / 3280.84
    return Math.hypot(altAglKm, this.distanceKm(this.userLocation))
  }

  // Return the bearing from the user's location to the aircraft.
  get userBearing() {
    return this.bearingFrom(this.userLocation)
  }

  // Return the distance from the user, in a straight line across the ground.
  get userDistanceMi() {
    return this.location.distanceMi(this.userLocation)
  }

  // Return the distance from the user, in a straight line across the ground.
  get userDistanceKm() {
    return this.location.distanceKm(this.userLocation)
  }

}

exports.AircraftView = AircraftView

exports.Filter = {
  Helicopters: 'helicopter',
  Jets: 'jet',
  Military: 'military',
}

function aircraftFilter(acFilters) {
  return function acFilter(ac) {
    if (acFilters['helicopter'] && !ac.isHelicopter) {
      return false
    }
    if (acFilters['jet'] && !ac.isJet) {
      return false
    }
    // noinspection RedundantIfStatementJS
    if (acFilters['military'] && !ac.isMilitary) {
      return false
    }
    return true
  }
}

exports.query = function query(location, acFilters, skyviewFilter) {
  // 40km = 21.5983nm
  const url = `https://adsbexchange.com/api/aircraft/json/lat/${location.latitude}/lon/${location.longitude}/dist/22/`
  const reqOptions = {
    url,
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Accept-Charset': 'utf-8',
      'User-Agent': 'alexa-aircraft-radar',
      'api-auth': process.env.ADSBX_API_KEY,
    },
    json: 'true',
  }

  console.log('[ADSB] ADSBX request: ', url)
  console.time('adsbxRequest')

  return rp(reqOptions)
    .then((respData) => {
      console.timeEnd('adsbxRequest')
      if (respData['ac'] === undefined || respData['ac'] === null) {
        return []
      }
      return respData['ac']
        .map(acDict => new AircraftView(acDict, location))
        .filter(skyviewFilter)
        .filter(aircraftFilter(acFilters))
        .sort((a, b) => {
          if (a.user3DDistanceKm > b.user3DDistanceKm) return 1
          else if (b.user3DDistanceKm > a.user3DDistanceKm) return -1
          return 0
        })
    })
    .then((acList) => {
      console.log('[ADSB] Returning aircraft list: ', acList)
      return acList
    })
}

exports.thumbnailURL = function thumbnailURL(ac) {
  if (!ac.icao && !ac.registration) {
    return Promise.resolve(null)
  }

  let url = 'https://images.radarskill.cdzombak.net/api/image?'
  if (ac.icao) {
    url += `icao=${ac.icao}&`
  }
  if (ac.registration) {
    url += `reg=${ac.registration}&`
  }
  url += `key=${encodeURIComponent(process.env.IMAGE_API_KEY)}`

  const reqOptions = {
    url,
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Accept-Charset': 'utf-8',
      'User-Agent': 'alexa-aircraft-radar',
    },
    json: 'true',
  }

  console.log('[ADSB] Image API request:', url)
  console.time('imageApiRequest')

  return rp(reqOptions).then((response) => {
    console.timeEnd('imageApiRequest')
    console.log('[ADSB] Image API response:', response)

    const thumbnailURL = response.thumbnailURL
    if (!thumbnailURL) {
      return null
    }
    return thumbnailURL
  })
}
