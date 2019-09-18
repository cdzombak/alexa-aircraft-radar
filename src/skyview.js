'use strict'

// Filter to be applied with Array.prototype.filter

// Given an aircraft, returns whether to consider the aircraft "in view" of the user
exports.nearby = function nearbySkyView(ac) {
  if      (ac.altitudeAgl <= 2000) return ac.user3DDistanceKm <= 15
  else if (ac.altitudeAgl <= 4000) return ac.user3DDistanceKm <= 25
  return   ac.userDistanceKm <= 40
}
