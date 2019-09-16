'use strict'

function toRadians(degrees) {
  return degrees * Math.PI / 180;
}

function toDegrees(radians) {
  return radians * 180 / Math.PI;
}

// from https://stackoverflow.com/a/52079217
function bearing(startLat, startLng, destLat, destLng){
  startLat = toRadians(startLat);
  startLng = toRadians(startLng);
  destLat = toRadians(destLat);
  destLng = toRadians(destLng);

  const y = Math.sin(destLng - startLng) * Math.cos(destLat);
  const x = Math.cos(startLat) * Math.sin(destLat) -
    Math.sin(startLat) * Math.cos(destLat) * Math.cos(destLng - startLng);
  const bearing = toDegrees(Math.atan2(y, x));
  return Math.round((bearing + 360) % 360);
}

// from https://www.geodatasource.com/developers/javascript
function distance(lat1, lon1, lat2, lon2, unit) {
  if ((lat1 === lat2) && (lon1 === lon2)) {
    return 0;
  } else {
    const radlat1 = Math.PI * lat1/180;
    const radlat2 = Math.PI * lat2/180;
    const theta = lon1-lon2;
    const radtheta = Math.PI * theta/180;
    let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) {
      dist = 1;
    }
    dist = Math.acos(dist);
    dist = dist * 180/Math.PI;
    dist = dist * 60 * 1.1515;
    if (unit && unit.toUpperCase() === "KM") {
      dist = dist * 1.609344
    } else if (unit && unit.toUpperCase() === "NM") {
      dist = dist * 0.8684
    }
    return dist;
  }
}

class Location {
  constructor(lat, lon) {
    this.latitude = lat
    this.longitude = lon
  }

  static fromJSON(json) {
    return new Location(json['latitude'], json['longitude'])
  }

  toJSON() {
    return {
      latitude: this.latitude,
      longitude: this.longitude
    }
  }

  get lat() {
    return this.latitude
  }

  get lon() {
    return this.longitude
  }

  get lng() {
    return this.longitude
  }

  // Return the bearing from this location to the given location.
  bearingTo(location) {
    return bearing(this.latitude, this.longitude, location.latitude, location.longitude)
  }

  // Return the bearing from the given location to this location.
  bearingFrom(location) {
    return location.bearingTo(this)
  }

  // Return the distance between this and the given location, in miles.
  distanceMi(location) {
    return distance(this.latitude, this.longitude, location.latitude, location.longitude)
  }

  // Return the distance between this and the given location, in kilometers.
  distanceKm(location) {
    return distance(this.latitude, this.longitude, location.latitude, location.longitude, "KM")
  }

  // Return the distance between this and the given location, in nautical miles.
  distanceNm(location) {
    return distance(this.latitude, this.longitude, location.latitude, location.longitude, "NM")
  }
}

module.exports = Location
