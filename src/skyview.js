'use strict';

exports.RadiusString = {
  Overhead_KM: '15',
  Nearby_KM: '40'
}

// Filters to be applied with Array.prototype.filter

// Deprecated:
exports.overhead = function(ac) {
  if      (ac.cdz_altAgl < 2000) { return ac.cdz_hypot < 4 }
  else if (ac.cdz_altAgl < 4000) { return ac.cdz_hypot < 8 }
  else if (ac.cdz_altAgl < 6000) { return ac.cdz_hypot < 10 }
  else { return ac.Dst <= 15 }
}

exports.nearby = function(ac) {
  if      (ac.cdz_altAgl <= 2000)  { return ac.cdz_hypot <= 15 }
  else if (ac.cdz_altAgl <= 4000)  { return ac.cdz_hypot <= 25 }
  else { return ac.Dst <= 40 }
}
