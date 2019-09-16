'use strict';

const rp = require('request-promise')

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
}
