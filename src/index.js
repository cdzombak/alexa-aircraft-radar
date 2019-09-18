/* eslint-disable no-use-before-define */
'use strict'

const Alexa = require('alexa-sdk')
const ADSB = require('./adsb-query')
const AvFormat = require('./aviation-formatting')
const SkyView = require('./skyview')
const AlexaDeviceAddressClient = require('./AlexaDeviceAddressClient')
const GeocodeService = require('./geocode')
const Response = require('./alexa-response-builder')

const APP_ID = 'amzn1.ask.skill.aec65dec-e9f5-453e-934e-eb5e53c5de6e'
const ALL_ADDRESS_PERMISSION = 'read::alexa:device:all:address'
const PERMISSIONS = [ALL_ADDRESS_PERMISSION]

const HELP_MESSAGE = 'You can ask what aircraft, helicopters, or jets are nearby, like "what aircraft are around?" or "what helicopters are nearby?" Or you can ask just about aircraft that are overhead, like: "what jets are overhead?"'
const HELP_REPROMPT = 'What can I help you with?'
const ERROR_MESSAGE = "Sorry, I couldn't fetch aircraft information. Please try again later."
const NOTIFY_MISSING_PERMISSIONS = 'Please enable Device Address permissions for the Aircraft Radar skill, in the Amazon Alexa app.'
const NO_ADDRESS = "It looks like you don't have an address set. Please set an address for this Echo, in the Amazon Alexa app."
const LOCATION_FAILURE = 'There was an error finding your location. Please enable Device Address permissions for the Aircraft Radar skill, and set an address for this Echo, in the Amazon Alexa app.'

const MAX_NEARBY = 3
const MAX_CONTINUE = 4

function appendModelFromAircraft(response, ac, addMilitaryDesc) {
  let modelStr = ac.modelDescription

  modelStr = modelStr.replace(/^[0-9][0-9][0-9][0-9]/, '')

  modelStr = modelStr.replace(/aircraft company/i, '')
  modelStr = modelStr.replace(/aircraft co\.?/i, '')
  modelStr = modelStr.replace(/industries/i, '')
  modelStr = modelStr.replace(/industrie/i, '')
  modelStr = modelStr.replace(/aviation/i, '')
  modelStr = modelStr.replace(/aerospace/i, '')
  modelStr = modelStr.replace(/company/i, '')
  modelStr = modelStr.replace(/ inc/i, ' ')
  modelStr = modelStr.replace(/Embraer EMB-/i, 'Embraer ')

  modelStr = modelStr.replace('BOEING', 'Boeing')
  modelStr = modelStr.replace('AIRBUS', 'Airbus')
  modelStr = modelStr.replace('GULFSTREAM', 'Gulfstream')
  modelStr = modelStr.replace('BOMBARDIER', 'Bombardier')

  if (ac.isHelicopter && modelStr.indexOf('helicopter') === -1) {
    modelStr += ' helicopter'
  }

  modelStr = modelStr.trim()

  if (ac.isMilitary && addMilitaryDesc) {
    modelStr = `military ${modelStr}`
  }

  if ((/^[aeiou]/i).test(modelStr)) {
    modelStr = `an ${modelStr}`
  } else {
    modelStr = `a ${modelStr}`
  }

  response.append(modelStr, ssmlFromModel(modelStr))
}

function ssmlFromModel(modelStr) {
  modelStr = modelStr.replace(/(\d)([A-Z].)\b/, '$1 <say-as interpret-as="characters">$2</say-as>')

  modelStr = modelStr.replace('707', 'seven oh seven')
  modelStr = modelStr.replace('717', 'seven seventeen')
  modelStr = modelStr.replace('727', 'seven twenty-seven')
  modelStr = modelStr.replace('737', 'seven thirty-seven')
  modelStr = modelStr.replace('747', 'seven forty-seven')
  modelStr = modelStr.replace('757', 'seven fifty-seven')
  modelStr = modelStr.replace('767', 'seven sixty-seven')
  modelStr = modelStr.replace('777', 'seven seventy-seven')
  modelStr = modelStr.replace('787', 'seven eighty-seven')
  modelStr = modelStr.replace('797', 'seven ninety-seven')

  modelStr = modelStr.replace(/gulfstream g-?i\b/i, 'gulfstream <say-as interpret-as="characters">G1</say-as>')
  modelStr = modelStr.replace(/gulfstream g-?ii\b/i, 'gulfstream <say-as interpret-as="characters">G2</say-as>')
  modelStr = modelStr.replace(/gulfstream g-?iii\b/i, 'gulfstream <say-as interpret-as="characters">G3</say-as>')
  modelStr = modelStr.replace(/gulfstream g-?iv\b/i, 'gulfstream <say-as interpret-as="characters">G4</say-as>')
  modelStr = modelStr.replace(/gulfstream g-?v\b/i, 'gulfstream <say-as interpret-as="characters">G5</say-as>')
  modelStr = modelStr.replace(/gulfstream g-?vi\b/i, 'gulfstream <say-as interpret-as="characters">G6</say-as>')

  modelStr = modelStr.replace(/ g100/i, ' <say-as interpret-as="characters">G</say-as> one hundred ')
  modelStr = modelStr.replace(/ g150/i, ' <say-as interpret-as="characters">G</say-as> one fifty ')
  modelStr = modelStr.replace(/ g200/i, ' <say-as interpret-as="characters">G</say-as> two hundred ')
  modelStr = modelStr.replace(/ g280/i, ' <say-as interpret-as="characters">G</say-as> two eighty ')
  modelStr = modelStr.replace(/ g300/i, ' <say-as interpret-as="characters">G</say-as> three hundred ')
  modelStr = modelStr.replace(/ g350/i, ' <say-as interpret-as="characters">G</say-as> three fifty ')
  modelStr = modelStr.replace(/ g400/i, ' <say-as interpret-as="characters">G</say-as> four hundred ')
  modelStr = modelStr.replace(/ g450/i, ' <say-as interpret-as="characters">G</say-as> four fifty ')
  modelStr = modelStr.replace(/ g500/i, ' <say-as interpret-as="characters">G</say-as> five hundred ')
  modelStr = modelStr.replace(/ g550/i, ' <say-as interpret-as="characters">G</say-as> five fifty ')
  modelStr = modelStr.replace(/ g600/i, ' <say-as interpret-as="characters">G</say-as> six hundred ')
  modelStr = modelStr.replace(/ g650/i, ' <say-as interpret-as="characters">G</say-as> six fifty ')

  modelStr = modelStr.replace(/embraer 110/i, ' Embraer one ten ')
  modelStr = modelStr.replace(/embraer 120/i, ' Embraer one twenty ')
  modelStr = modelStr.replace(/embraer 170/i, ' Embraer one seventy ')
  modelStr = modelStr.replace(/embraer 175/i, ' Embraer one seventy five')
  modelStr = modelStr.replace(/embraer 190/i, ' Embraer one ninety ')
  modelStr = modelStr.replace(/embraer 195/i, ' Embraer one ninety five')
  modelStr = modelStr.replace(/-E2\b/, ' <say-as interpret-as="characters">E2</say-as>')

  return modelStr
}

function fmtAirport(airportStr) {
  // remove leading code, ie. "KDTW"
  let strings = airportStr.split(' ')
  strings.splice(0, 1)
  airportStr = strings.join(' ')

  strings = airportStr.split(',')
  if (strings.length === 2) {
    // Handle inputs like "Palm Beach, West Palm Beach"
    if (strings[1].toLowerCase().includes(strings[0].toLowerCase())) {
      airportStr = strings[1]
    }
    // Handle inputs like "Dallas Fort Worth, Dallas-Fort Worth"
    if (strings[1].toLowerCase().replace(/-/g, ' ').includes(strings[0].toLowerCase())) {
      airportStr = strings[1]
    }
  }

  return airportStr.trim()
}

function fmtDistance(distance) {
  const roundToDecimalPrecision = function(value, precision) {
    const multiplier = Math.pow(10, precision || 0)
    return Math.round(value * multiplier) / multiplier
  }

  if (distance < 5) {
    return roundToDecimalPrecision(distance, 1)
  }
  return Math.round(distance)
}

function appendAltFromAircraft(response, ac) {
  if (ac.altitude) {
    response.append('at ')
    response.append(`${ac.altitude} feet,`, `<say-as interpret-as="unit">${ac.altitude}ft</say-as>,`)
  }
}

function appendAircraftDetails(response, ac, addMilitaryDesc) {
  appendModelFromAircraft(response, ac, addMilitaryDesc)

  if (ac.from) {
    response.append(` from ${fmtAirport(ac.from)}`)
  }

  response.append(', ')
  response.append(`${fmtDistance(ac.userDistanceMi)} miles ${AvFormat.cardinal(ac.userBearing, 'away')},`)
  response.space()
  appendAltFromAircraft(response, ac)
  response.space()
  response.append(`heading ${AvFormat.cardinal(ac.trak, null)}`)

  if (ac.callsign && !ac.callSus) {
    response.append(`, with callsign ${ac.callsign}`)
  }
}

function singleAircraftOutput(response, ac, position, type) {
  // The nearest aircraft is a [model], Z miles A, at X feet, heading Y,
  // registration [reg], en route from [airport] to [airport] with [count] stops.

  response.setThumbnailPromise(ADSB.thumbnailURL(ac))

  response.append(`The ${position} ${type} is`)
  response.space()
  verboseAircraftOutput(response, ac)
}

function verboseAircraftOutput(response, ac) {
  appendModelFromAircraft(response, ac, true)
  response.append(', ')
  response.append(`${fmtDistance(ac.userDistanceMi)} miles ${AvFormat.cardinal(ac.userBearing, 'away')},`)
  response.space()
  appendAltFromAircraft(response, ac)
  response.space()
  response.append(`heading ${AvFormat.cardinal(ac.trak, null)}`)

  if (ac.from && ac.to) {
    response.append(`, en route from ${fmtAirport(ac.from)}`)

    if (ac.from !== ac.to) {
      response.append(`, to ${fmtAirport(ac.to)}`)
    }
  } else if (ac.from) {
    response.append(`, from ${fmtAirport(ac.from)}`)
  }

  if (ac.callsign && !ac.callSus) {
    response.append(`, with callsign ${ac.callsign} and registration`)
  } else {
    response.append(', with registration')
  }

  response.append(' ', ': ')
  console.log('[VERBOSE DEBUG] dealing with aircraft reg:', ac.registration)
  if (ac.registration !== null && ac.registration !== undefined) {
    response.append(ac.registration, `<prosody rate="slow">${AvFormat.icaoStr(ac.registration)}</prosody>`)
  } else {
    response.append('unknown')
  }
  response.append('.')
}

function multiAircraftOutput(response, acList, position, typeFilter, limit, addMilitaryDesc) {
  // N aircraft are nearby. [Here are the first M:] A [model] from
  // [airport], Z miles A, at X feet, heading Y; …

  if (!acList.length) {
    response.append(`No ${TypeFilter.string(typeFilter)} are ${position}.`)
    return []
  }

  if (acList.length === limit + 1) {
    limit += 1
  }

  response.append(`${acList.length} `)

  if (acList.length === 1) {
    response.append(`${TypeFilter.singularString(typeFilter)} is ${position}: `)
    verboseAircraftOutput(response, acList[0])
    return []
  }
  response.append(`${TypeFilter.string(typeFilter)} are ${position}`)

  if (acList.length > limit) {
    response.append('. The nearest are')
  }

  response.append(': ')
  const continuationAircraft = []

  acList.forEach((ac, idx) => {
    // A [model] from [airport] Z miles A at X feet heading Y; …
    if (idx >= limit) {
      continuationAircraft.push(ac)
      return
    }

    const atEnd = (idx === limit - 1 || idx === acList.length - 1)
    if (atEnd) {
      response.append(' and ')
    }
    appendAircraftDetails(response, ac, addMilitaryDesc)
    response.append(atEnd ? '.' : '; ')
  })

  return continuationAircraft
}

class SentLocationError extends Error {}
class SentPermissionsCardError extends Error {}
class SentNoAddressMessageError extends Error {}

class GeocodeError extends Error {

  ssmlMessage() {
    return "Sorry, I couldn't pinpoint your location. Please verify that this Echo's address is set correctly, then try again."
  }

}

function getDeviceLocation(ctx) {
  const permissions = ctx.event.context.System.user.permissions
  const consentToken = permissions ? permissions.consentToken : null

  // allow requesting a mock location with request.cdz_mockLocation in the JSON input payload
  // or via the MOCK_LOCATION environment var. may be set to either 'valid' or 'invalid'.
  // if both are set, the value from the JSON payload takes priority.
  // either bypasses the device location process.
  const requestMockLocation = ('cdz_mockLocation' in ctx.event.request) ? ctx.event.request.cdz_mockLocation : undefined
  const envMockLocation = process.env.MOCK_LOCATION

  // If we have not been provided with a consent token, this means that the user has not
  // authorized your skill to access this information. In this case, you should prompt them
  // that you don't have permissions to retrieve their address.
  if (!consentToken && !envMockLocation && !requestMockLocation) {
    ctx.emit(':tellWithPermissionCard', NOTIFY_MISSING_PERMISSIONS, PERMISSIONS)
    return Promise.reject(new SentPermissionsCardError())
  }

  let address = {}

  if (envMockLocation || requestMockLocation) {
    const MockLocations = require('./mock-locations')
    const mockLocation = requestMockLocation ? requestMockLocation : envMockLocation
    if (mockLocation === 'invalid') {
      address = Promise.resolve(MockLocations.INVALID_LOCATION)
    } else {
      address = Promise.resolve(MockLocations.VALID_LOCATION)
    }
  } else {
    const deviceId = ctx.event.context.System.device.deviceId
    const apiEndpoint = ctx.event.context.System.apiEndpoint
    const alexaDeviceAddressClient = new AlexaDeviceAddressClient(apiEndpoint, deviceId, consentToken)

    address = alexaDeviceAddressClient.getFullAddress().then((addressResponse) => {
      switch (addressResponse.statusCode) {
      case 200:
        return addressResponse.address
      case 204:
        // This likely means that the user didn't have their address set via the companion app.
        console.log('[Address] Successfully requested from device address API, but no address was returned.')
        ctx.emit(':tell', NO_ADDRESS)
        return Promise.reject(new SentNoAddressMessageError())
      case 403:
        console.log("[Address] The consent token we had wasn't authorized to access the user's address.")
        ctx.emit(':tellWithPermissionCard', NOTIFY_MISSING_PERMISSIONS, PERMISSIONS)
        return Promise.reject(new SentPermissionsCardError())
      default:
        console.log('[Address] Unsuccessful address query.', addressResponse)
        ctx.emit(':tell', LOCATION_FAILURE)
        return Promise.reject(new SentLocationError())
      }
    })
  }

  return address.then((address) => {
    console.log('[Address] Got address:', address)
    let addressStr = ''
    const keys = ['addressLine1', 'addressLine2', 'addressLine3', 'city', 'districtOrCounty', 'stateOrRegion', 'postalCode', 'countryCode']
    keys.forEach((key) => {
      if (address[key]) {
        addressStr += `${address[key]}, `
      }
    })
    return GeocodeService.geocode(addressStr)
  })
}

const Mode = {
  Single: 0,
  Multi: 1,
}

const TypeFilter = {
  All: 0,
  Helicopters: 1,
  Jets: 2,
  Military: 3,

  string(typeFilter) {
    switch (typeFilter) {
    case TypeFilter.Helicopters:
      return 'helicopters'
    case TypeFilter.Jets:
      return 'jets'
    case TypeFilter.Military:
      return 'military aircraft'
    default:
      return 'aircraft'
    }
  },

  singularString(typeFilter) {
    switch (typeFilter) {
    case TypeFilter.Helicopters:
      return 'helicopter'
    case TypeFilter.Jets:
      return 'jet'
    case TypeFilter.Military:
      return 'military aircraft'
    default:
      return 'aircraft'
    }
  },
}

function queryHandler(ctx, mode, typeFilter, title) {
  console.log('[Query Handler] Handling query for mode', mode, '; type filter', typeFilter)

  const location = getDeviceLocation(ctx)
    .catch(e => Promise.reject(new GeocodeError(e)))

  const acList = location.then((location) => {
    const acFilters = {}
    switch (typeFilter) {
    case TypeFilter.Helicopters:
      acFilters[ADSB.Filter.Helicopters] = true
      break
    case TypeFilter.Jets:
      acFilters[ADSB.Filter.Jets] = true
      break
    case TypeFilter.Military:
      acFilters[ADSB.Filter.Military] = true
      break
    default:
      break
    }
    return ADSB.query(location, acFilters, SkyView.nearby)
  })

  Promise.all([location, acList]).then((values) => {
    const acList = values[1]
    const response = new Response(title)

    if (mode === Mode.Single) {
      if (!acList.length) {
        response.append(`No ${TypeFilter.string(typeFilter)} are nearby.`)
      } else {
        const ac = acList[0]
        singleAircraftOutput(response, ac, 'nearest', TypeFilter.singularString(typeFilter))
      }
    } else {
      // Mode.Multi
      const addMilitaryDesc = (typeFilter !== TypeFilter.Military) // describe planes as "military" iff user didn't filter to military planes only
      const leftovers = multiAircraftOutput(response, acList, 'nearby', typeFilter, MAX_NEARBY, addMilitaryDesc)

      if (leftovers && leftovers.length > 0) {
        response.setNeedsMore('Do you want to hear more?')
        ctx.attributes['addMilitaryDesc'] = addMilitaryDesc
        ctx.attributes['leftovers'] = leftovers.map(ac => ac.toJSON())
        ctx.attributes['title'] = title
      }
    }

    response.respond(ctx)
  })
    .catch((err) => {
    // don't act on errors which indicate some error card has already been sent:
      if (err instanceof SentPermissionsCardError || err instanceof SentNoAddressMessageError || err instanceof SentLocationError) {
        return
      }

      if (err.ssmlMessage) {
        ctx.response.speak(err.ssmlMessage())
      } else {
        console.log('[Query Handler] Unhandled error in promise chain:', err)
        ctx.response.speak(ERROR_MESSAGE)
      }
      ctx.emit(':responseReady')
    })
}

function queryContinuationHandler(ctx) {
  const acList = ctx.attributes['leftovers'].map(ADSB.AircraftView.fromJSON)
  const addMilitaryDesc = ctx.attributes['addMilitaryDesc']
  const title = ctx.attributes['title']
  const response = new Response(title)

  const limit = MAX_CONTINUE
  const leftovers = []

  response.append('There is ')
  acList.forEach((ac, idx) => {
    if (idx >= limit) {
      leftovers.push(ac)
      return
    }

    // A [model] from [airport] Z miles A at X feet heading Y; …
    const atEnd = (idx === limit - 1 || idx === acList.length - 1)
    if (atEnd) {
      response.append(' and ')
    }
    appendAircraftDetails(response, ac, addMilitaryDesc)
    response.append(atEnd ? '.' : '; ')
  })

  ctx.attributes['leftovers'] = leftovers
  if (leftovers.length > 0 && leftovers.length <= limit) {
    response.setNeedsMore('Do you want to hear the rest?')
  } else if (leftovers.length > limit) {
    response.setNeedsMore('Do you want to hear more?')
  }
  response.respond(ctx)
}

const handlers = {
  'LaunchRequest'() {
    console.log('Handling LaunchRequest')
    this.emit('Nearby_Aircraft')
  },
  'SessionEndedRequest'() {
    console.log('Received SessionEndedRequest')
  },
  'Nearby_Aircraft'() {
    console.log('Handling Nearby_Aircraft')
    queryHandler(this, Mode.Multi, TypeFilter.All, 'Nearby Aircraft')
  },
  'Nearest_Aircraft'() {
    console.log('Handling Nearest_Aircraft')
    queryHandler(this, Mode.Single, TypeFilter.All, 'Nearby Aircraft')
  },
  'Nearest_Jet'() {
    console.log('Handling Nearest_Jet')
    queryHandler(this, Mode.Single, TypeFilter.Jets, 'Nearby Jets')
  },
  'Nearby_Jets'() {
    console.log('Handling Nearby_Jets')
    queryHandler(this, Mode.Multi, TypeFilter.Jets, 'Nearby Jets')
  },
  'Nearby_Helicopters'() {
    console.log('Handling Nearby_Helicopters')
    queryHandler(this, Mode.Multi, TypeFilter.Helicopters, 'Nearby Helicopters')
  },
  'Nearest_Helicopter'() {
    console.log('Handling Nearest_Helicopter')
    queryHandler(this, Mode.Single, TypeFilter.Helicopters, 'Nearby Helicopters')
  },
  'Nearby_Military'() {
    console.log('Handling Nearby_Military')
    queryHandler(this, Mode.Multi, TypeFilter.Military, 'Nearby Military Aircraft')
  },
  'AMAZON.NoIntent'() {
    console.log('Handling AMAZON.NoIntent')
    this.emit(':responseReady')
  },
  'AMAZON.YesIntent'() {
    console.log('Handling AMAZON.YesIntent')
    if (this.attributes['leftovers'] && this.attributes['leftovers'].length > 0) {
      queryContinuationHandler(this)
    } else {
      this.emit('Nearby_Aircraft')
    }
  },
  'AMAZON.HelpIntent'() {
    console.log('Handling AMAZON.HelpIntent')
    this.response.speak(HELP_MESSAGE).listen(HELP_REPROMPT)
    this.emit(':responseReady')
  },
  'AMAZON.CancelIntent'() {
    console.log('Handling AMAZON.CancelIntent')
    this.emit(':responseReady')
  },
  'AMAZON.StopIntent'() {
    console.log('Handling AMAZON.StopIntent')
    this.emit(':responseReady')
  },
}

exports.handler = function handler(event, context, callback) {
  const alexa = Alexa.handler(event, context, callback)
  alexa.appId = APP_ID
  alexa.registerHandlers(handlers)
  alexa.execute()
}
