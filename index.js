'use strict';

const Alexa = require('alexa-sdk');
const ADSB = require('./adsb-query')
const AvFormat = require('./aviation-formatting')
const SkyView = require('./skyview')
const AlexaDeviceAddressClient = require('./AlexaDeviceAddressClient');
const Promise = require('bluebird')
const GeocodeService = require('./geocode')
const Response = require('./alexa-response-builder')

const APP_ID = 'amzn1.ask.skill.aec65dec-e9f5-453e-934e-eb5e53c5de6e'
const SKILL_NAME = 'Aircraft Radar'

const ALL_ADDRESS_PERMISSION = "read::alexa:device:all:address"
const PERMISSIONS = [ALL_ADDRESS_PERMISSION]

const HELP_MESSAGE = 'You can ask what aircraft, helicopters, or jets are nearby, like "what aircraft are around?" or "what helicopters are nearby?" Or you can ask just about aircraft that are overhead, like: "what jets are overhead?"'
const HELP_REPROMPT = 'What can I help you with?'
const ERROR_MESSAGE = "Sorry, I couldn't fetch aircraft information. Please try again later."
const STOP_MESSAGE = 'Goodbye!'

const NOTIFY_MISSING_PERMISSIONS = "Please enable Device Address permissions for the Aircraft Radar skill, in the Amazon Alexa app."
const NO_ADDRESS = "It looks like you don't have an address set. Please set an address for this Echo, in the Amazon Alexa app."
const LOCATION_FAILURE = "There was an error finding your location. Please enable Device Address permissions for the Aircraft Radar skill, and set an address for this Echo, in the Amazon Alexa app."

const MAX_NEARBY = 4

function appendModelFromAircraft(response, ac, addMilitaryDesc) {
  if (!ac.Mdl) {
    if (!ac.Type) {
      return "unknown-model";
    } else {
      return ac.Type;
    }
  }

  var modelStr = ac.Mdl.trim();

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

  switch (ac.Species) {
    case 4:
      modelStr += " helicopter"
      break
    case 5:
      modelStr += " gyrocopter"
      break
    case 6:
      modelStr += " tilt-wing"
      break
  }

  modelStr = modelStr.trim()

  if (ac.Mil && addMilitaryDesc) {
    modelStr = 'military ' + modelStr
  }

  if ((/^[aeiou]/i).test(modelStr)) {
    modelStr = 'an ' + modelStr
  } else {
    modelStr = 'a ' + modelStr
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

  return modelStr
}

function fmtAirport(airportStr) {
  airportStr = airportStr.replace(', United States', '')

  // remove leading code, ie. "KDTW"
  var strings = airportStr.split(' ')
  strings.splice(0, 1)
  airportStr = strings.join(' ')

  strings = airportStr.split(',')
  if (strings.length == 2) {
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
  const round_dec = function(value, precision) {
      var multiplier = Math.pow(10, precision || 0);
      return Math.round(value * multiplier) / multiplier;
  }

  if (distance < 5) {
    return round_dec(distance, 1)
  } else {
    return Math.round(distance)
  }
}

function appendAltFromAircraft(response, ac) {
  if (ac.Alt) {
    response.append('at ')
    response.append(ac.Alt + ' feet,', '<say-as interpret-as="unit">' + ac.Alt + 'ft</say-as>,')
  }
}

function singleAircraftOutput(response, ac, position, type) {
  // The nearest aircraft is a [model], Z miles A, at X feet, heading Y,
  // registration [reg], en route from [airport] to [airport] with [count] stops.

  response.setThumbnailPromise(ADSB.thumbnailURL(ac))

  response.append('The ' + position + ' ' + type + ' is')
  response.space()
  verboseAircraftOutput(response, ac)
}

function verboseAircraftOutput(response, ac) {
  appendModelFromAircraft(response, ac, true)
  response.append(', ')
  response.append(fmtDistance(ac.cdz_DstMi) + ' miles ' + AvFormat.cardinal(ac.Brng, "away") + ',')
  response.space()
  appendAltFromAircraft(response, ac)
  response.space()
  response.append('heading ' + AvFormat.cardinal(ac.Trak, null))

  if (ac.From && ac.To) {
    response.append(", en route from " + fmtAirport(ac.From))

    if (ac.From != ac.To) {
      response.append(", to " + fmtAirport(ac.To))
    }

    if (ac.Stops && ac.Stops.length) {
      if (ac.Stops.length == 1) {
        response.append(", stopping at " + fmtAirport(ac.Stops[0]))
      } else {
        response.append(", making " + ac.Stops.length + " stops")
      }
    }
  } else if (ac.From) {
    response.append(", from " + fmtAirport(ac.From))
  }

  if (ac.Call & !ac.CallSus) {
    response.append(", with callsign " + ac.Call + " and registration")
  } else {
    response.append(", with registration")
  }

  response.append(' ', ': ')
  response.append(ac.Reg, '<prosody rate="slow">' + AvFormat.icaoStr(ac.Reg) +'</prosody>')
  response.append('.')
}

function multiAircraftOutput(response, acList, position, typeFilter, limit, addMilitaryDesc) {
  // N aircraft are nearby. [Here are the first M:] A [model] from
  // [airport], Z miles A, at X feet, heading Y; …

  if (!acList.length) {
    response.append("No " + TypeFilter.string(typeFilter) + " are " + position + ".")
    return
  }

  response.append(acList.length + ' ')

  if (acList.length == 1) {
    response.append(TypeFilter.singularString(typeFilter) + ' is ' + position + ': ')
    verboseAircraftOutput(response, acList[0])
    return
  } else {
    response.append(TypeFilter.string(typeFilter) + ' are ' + position)
  }

  if (acList.length > limit) {
    response.append('. Here are the nearest ' + limit)
  }

  response.append(': ')

  acList.forEach(function(ac, idx, list) {
    // A [model] from [airport] Z miles A at X feet heading Y; …
    if (idx >= limit) {
      return
    }

    appendModelFromAircraft(response, ac, addMilitaryDesc)

    if (ac.From) {
      response.append(" from " + fmtAirport(ac.From))
    }

    response.append(', ')
    response.append(fmtDistance(ac.cdz_DstMi) + ' miles ' + AvFormat.cardinal(ac.Brng, "away") + ',')
    response.space()
    appendAltFromAircraft(response, ac)
    response.space()
    response.append('heading ' + AvFormat.cardinal(ac.Trak, null))

    if (ac.Call & !ac.CallSus) {
      response.append(", with callsign " + ac.Call)
    }

    const atEnd = idx == limit-1 || idx == acList.length -1
    response.append(atEnd ? '.' : '; ')
  });
}

class SentLocationError extends Error {}
class SentPermissionsCardError extends Error {}
class SentNoAddressMessageError extends Error {}

class GeocodeError extends Error {
  ssmlMessage() {
    return "Sorry, I couldn't pinpoint your location. Please verify that this Echo's address is correct, then try again."
  }
}

function getDeviceLocation(ctx) {
  const permissions = ctx.event.context.System.user.permissions
  const consentToken = permissions ? permissions.consentToken : null;

  // If we have not been provided with a consent token, this means that the user has not
  // authorized your skill to access this information. In this case, you should prompt them
  // that you don't have permissions to retrieve their address.
  if (!consentToken && !process.env.MOCK_LOCATION) {
    ctx.emit(":tellWithPermissionCard", NOTIFY_MISSING_PERMISSIONS, PERMISSIONS);
    return Promise.reject(new SentPermissionsCardError());
  }

  var address;

  if (process.env.MOCK_LOCATION) {
    const MockLocation = require('./mock-locations')
    if (process.env.MOCK_LOCATION == 'invalid') {
      address = Promise.resolve (MockLocation.INVALID_LOCATION)
    } else {
      address = Promise.resolve (MockLocation.VALID_LOCATION)
    }
  } else {
    const deviceId = ctx.event.context.System.device.deviceId;
    const apiEndpoint = ctx.event.context.System.apiEndpoint;
    const alexaDeviceAddressClient = new AlexaDeviceAddressClient(apiEndpoint, deviceId, consentToken);

    address = alexaDeviceAddressClient.getFullAddress().then((addressResponse) => {
      switch(addressResponse.statusCode) {
        case 200:
          return addressResponse.address;
        case 204:
          // This likely means that the user didn't have their address set via the companion app.
          console.log("[Address] Successfully requested from device address API, but no address was returned.");
          ctx.emit(":tell", NO_ADDRESS);
          return Promise.reject(new SentNoAddressMessageError());
        case 403:
          console.log("[Address] The consent token we had wasn't authorized to access the user's address.");
          ctx.emit(":tellWithPermissionCard", NOTIFY_MISSING_PERMISSIONS, PERMISSIONS);
          return Promise.reject(new SentPermissionsCardError());
        default:
          console.log("[Address] Unsuccessful address query.", addressResponse);
          ctx.emit(":tell", LOCATION_FAILURE);
          return Promise.reject(new SentLocationError());
      }
    })
  }

  return address.then(function(address) {
    console.log("[Address] Got address:", address);

    var addressStr = ''
    const keys = ['addressLine1', 'addressLine2', 'addressLine3', 'city', 'districtOrCounty', 'stateOrRegion', 'postalCode', 'countryCode']
    keys.forEach((key) => { if (address[key]) addressStr += address[key] + ', ' })
    return GeocodeService.geocode(addressStr)
  })
}

const Mode = {
  Single: 0,
  Multi: 1
}

const Position = {
  Overhead: 0,
  Nearby: 1,

  string: function(position) {
    return position === Position.Overhead ? "overhead" : "nearby"
  },

  singularString: function(position) {
    return position === Position.Overhead ? "closest overhead" : "nearest"
  },

  searchRadius: function(position) {
    return position === Position.Overhead ? SkyView.RadiusString.Overhead_KM : SkyView.RadiusString.Nearby_KM
  },

  filter: function(position) {
    return position === Position.Overhead ? SkyView.overhead : SkyView.nearby
  }
}

const TypeFilter = {
  All: 0,
  Helicopters: 1,
  Jets: 2,
  Military: 3,

  string: function(typeFilter) {
    switch (typeFilter) {
      case TypeFilter.Helicopters:
        return "helicopters"
      case TypeFilter.Jets:
        return "jets"
      case TypeFilter.Military:
        return "military aircraft"
      default:
        return "aircraft"
    }
  },

  singularString: function(typeFilter) {
    switch (typeFilter) {
      case TypeFilter.Helicopters:
        return "helicopter"
      case TypeFilter.Jets:
        return "jet"
      case TypeFilter.Military:
        return "military aircraft"
      default:
        return "aircraft"
    }
  }
}

function queryHandler(ctx, mode, position, typeFilter, title) {
  console.log("[Query Handler] Handling query for mode", mode, "; position", position, "; type filter", typeFilter)

  const location = getDeviceLocation(ctx).then((location) => {
    // really the GeocodeService API should reject this promise; and the remote API should return a different HTTP code and error in JSON
    if (!location.location) {
      return Promise.reject(new GeocodeError());
    } else {
      return location
    }
  })

  const acList = location.then((location) => {
    var opts = {
      'radius': Position.searchRadius(position)
    }
    switch (typeFilter) {
      case TypeFilter.Helicopters:
        opts[ADSB.Filter.Helicopters] = true
        break
      case TypeFilter.Jets:
        opts[ADSB.Filter.Jets] = true
        break
      case TypeFilter.Military:
        opts[ADSB.Filter.Military] = true
        break
    }
    return ADSB.query(location.location, opts)
  })

  Promise.all([location, acList]).then(function(values) {
    const location = values[0]
    var acList = values[1]

    acList = ADSB.preprocessAircraftList(acList, location.elevation)
    acList = acList.filter(Position.filter(position))

    const response = new Response(title)

    if (mode == Mode.Single) {
      if (!acList.length) {
        response.append("No " + TypeFilter.string(typeFilter) + " are " + Position.string(position) + ".")
      } else {
        const ac = acList[0]
        singleAircraftOutput(response, ac, Position.singularString(position), TypeFilter.singularString(typeFilter))
      }
    } else {
      // Mode.Multi
      const addMilitaryDesc = (typeFilter != TypeFilter.Military)
      multiAircraftOutput(response, acList, Position.string(position), typeFilter, MAX_NEARBY, addMilitaryDesc)
    }

    response.respond(ctx)
  })
  .catch(function(err) {
    // don't act on errors which indicate some error card has already been sent:
    if (err instanceof SentPermissionsCardError || err instanceof SentNoAddressMessageError || err instanceof SentLocationError) {
      return
    }

    if (err.ssmlMessage) {
      ctx.response.speak(err.ssmlMessage());
    } else {
      console.log('[Query Handler] Unhandled error in promise chain:', err)
      ctx.response.speak(ERROR_MESSAGE);
    }
    ctx.emit(':responseReady');
  });
}

const handlers = {
  'LaunchRequest': function () {
    console.log("Handling LaunchRequest" )
    this.emit('Nearby_Aircraft');
  },
  'Nearby_Aircraft': function () {
    console.log("Handling Nearby_Aircraft")
    queryHandler(this, Mode.Multi, Position.Nearby, TypeFilter.All, "Nearby Aircraft")
  },
  'Nearest_Aircraft': function () {
    console.log("Handling Nearest_Aircraft")
    queryHandler(this, Mode.Single, Position.Nearby, TypeFilter.All, "Nearby Aircraft")
  },
  'Nearest_Overhead_Aircraft': function () {
    console.log("Handling Nearest_Overhead_Aircraft")
    queryHandler(this, Mode.Single, Position.Overhead, TypeFilter.All, "Aircraft Overhead")
  },
  'Overhead_Aircraft': function () {
    console.log("Handling Overhead_Aircraft")
    queryHandler(this, Mode.Multi, Position.Overhead, TypeFilter.All, "Aircraft Overhead")
  },
  'Nearest_Jet': function () {
    console.log("Handling Nearest_Jet")
    queryHandler(this, Mode.Single, Position.Nearby, TypeFilter.Jets, "Nearby Jets")
  },
  'Nearby_Jets': function () {
    console.log("Handling Nearby_Jets")
    queryHandler(this, Mode.Multi, Position.Nearby, TypeFilter.Jets, "Nearby Jets")
  },
  'Overhead_Jets': function () {
    console.log("Handling Overhead_Jets")
    queryHandler(this, Mode.Multi, Position.Overhead, TypeFilter.Jets, "Jets Overhead")
  },
  'Overhead_Helicopters': function () {
    console.log("Handling Overhead_Helicopters")
    queryHandler(this, Mode.Multi, Position.Overhead, TypeFilter.Helicopters, "Helicopters Overhead")
  },
  'Nearby_Helicopters': function () {
    console.log("Handling Nearby_Helicopters")
    queryHandler(this, Mode.Multi, Position.Nearby, TypeFilter.Helicopters, "Nearby Helicopters")
  },
  'Nearest_Helicopter': function () {
    console.log("Handling Nearest_Helicopter")
    queryHandler(this, Mode.Single, Position.Nearby, TypeFilter.Helicopters, "Nearby Helicopters")
  },
  'Overhead_Military': function () {
    console.log("Handling Overhead_Military")
    queryHandler(this, Mode.Multi, Position.Overhead, TypeFilter.Military, "Military Aircraft Overhead")
  },
  'Nearby_Military': function () {
    console.log("Handling Nearby_Military")
    queryHandler(this, Mode.Multi, Position.Nearby, TypeFilter.Military, "Nearby Military Aircraft")
  },
  'AMAZON.HelpIntent': function () {
    console.log("Handling AMAZON.HelpIntent")
    const speechOutput = HELP_MESSAGE;
    const reprompt = HELP_REPROMPT;
    this.response.speak(speechOutput).listen(reprompt);
    this.emit(':responseReady');
  },
  'AMAZON.CancelIntent': function () {
    console.log("Handling AMAZON.CancelIntent")
    this.response.speak(STOP_MESSAGE);
    this.emit(':responseReady');
  },
  'AMAZON.StopIntent': function () {
    console.log("Handling AMAZON.StopIntent")
    this.response.speak(STOP_MESSAGE);
    this.emit(':responseReady');
  },
};

exports.handler = function (event, context, callback) {
  const alexa = Alexa.handler(event, context, callback);
  alexa.appId = APP_ID;
  alexa.registerHandlers(handlers);
  alexa.execute();
};
