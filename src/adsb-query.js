'use strict';

const rp = require('request-promise');

exports.Filter = {
  Helicopters: 'helicopter',
  Jets: 'jet',
  Military: 'military'
}

exports.query = function(location, options) {
  var url = 'http://public-api.adsbexchange.com/VirtualRadar/AircraftList.json?';
  url += 'lat=' + location['lat'] + '&'
  url += 'lng=' + location['lng'] + '&'
  url += 'fDstL=0&fDstU=' + options['radius'] + '&'

  if (options['helicopter']) { url += 'fSpcQ=4&' }
  if (options['jet']) { url += 'fEgtQ=3&' }
  if (options['military']) { url += 'fMilQ=1&' }

  url = url.slice(0, -1); // strip trailing ampersand

  const reqOptions = {
    url: url,
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Accept-Charset': 'utf-8',
      'User-Agent': 'alexa-aircraft-radar'
    },
    json: 'true'
  };

  console.log('[ADSB] Aircraft List query:', url)

  return rp(reqOptions).then(function(data) {
    return data['acList']
  });
};

exports.preprocessAircraftList = function(acList, groundElev) {
  acList = acList.filter(function(ac) {
    // filter out ground vehicles (7) and towers (8)
    return ac.Species != 7 && ac.Species != 8
  })

  acList.forEach(function(ac, idx, list) {
    const altAgl = ac.GAlt - groundElev
    const altAglKm = (altAgl) / 3280.84
    ac['cdz_altAgl'] = altAgl
    ac['cdz_hypot'] = Math.hypot(altAglKm, ac.Dst)
    ac['cdz_DstMi'] = ac.Dst * 0.62
  });

  acList.sort(function(a,b) {return (a.cdz_hypot > b.cdz_hypot) ? 1 : ((b.cdz_hypot > a.cdz_hypot) ? -1 : 0);} )

  return acList
}

exports.thumbnailURL = function(aircraft) {
  if (!aircraft.Icao && !aircraft.Reg) {
    return Promise.resolve(null)
  }

  var url = "https://images.radarskill.cdzombak.net/api/image?"
  if (aircraft.Icao) { url += 'icao=' + aircraft.Icao + '&' }
  if (aircraft.Reg) { url += 'reg=' + aircraft.Reg + '&' }
  url += 'key=' + encodeURIComponent(process.env.IMAGE_API_KEY)

  const reqOptions = {
    url: url,
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Accept-Charset': 'utf-8',
      'User-Agent': 'alexa-aircraft-radar'
    },
    json: 'true'
  };

  console.log('[ADSB] Image API request:', url)

  return rp(reqOptions).then(function(response) {
    console.log('[ADSB] Image API response:', response)

    const thumbnailURL = response.thumbnailURL
    if (!thumbnailURL) {
      return null
    }
    return thumbnailURL
  });
}
