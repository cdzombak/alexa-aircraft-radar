'use strict'

const rp = require('request-promise')
const Location = require('./location')

// Extends the Location class with an elevation, assumed to be in feet.
class Location3D extends Location {
  constructor(lat, lon, elevation) {
    super(lat, lon)
    this.elevation = elevation
  }

  static fromJSON(json) {
    return new Location3D(json['latitude'], json['longitude'], json['elevation'])
  }

  toJSON() {
    let json = super.toJSON()
    json['elevation'] = this.elevation
    return json
  }
}

exports.Location3D = Location3D

// A geocode service which returns lat/lng _and_ elevation (in feet) for a given string address.
// https://github.com/cdzombak/geocode-service
exports.geocode = function(addressStr) {
  const url = "https://location.radarskill.cdzombak.net/api/geocode?"
    + 'address=' + encodeURIComponent(addressStr) + '&'
    + 'key=' + encodeURIComponent(process.env.GEOCODE_API_KEY)

  const reqOptions = {
    url: url,
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Accept-Charset': 'utf-8',
      'User-Agent': 'alexa-aircraft-radar'
    },
    json: 'true'
  }

  return rp(reqOptions)
    .then(respData => {
      if (!respData.location) {
        throw new Error("Response did not include a location.")
      }
      return new Location3D(respData.location.lat, respData.location.lng, respData.elevation)
    })
}
