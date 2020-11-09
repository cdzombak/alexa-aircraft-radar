'use strict'

exports.VALID_LOCATION = {
  addressLine1: '118 S. Main St',
  addressLine2: null,
  addressLine3: null,
  districtOrCounty: 'Washtenaw',
  city: 'Ann Arbor',
  stateOrRegion: 'Michigan',
  postalCode: '48104',
  countryCode: 'US',
}

exports.INVALID_LOCATION = {
  addressLine1: 'NF-dfddddd',
  addressLine2: null,
  addressLine3: null,
  districtOrCounty: 'flalalks',
  stateOrRegion: 'XX',
  city: 'na',
  countryCode: 'XX',
  postalCode: '00000',
}

exports.AZTEST_LOCATION = {
  addressLine1: 'A2Z DEVELOPMENT CENTER',
  addressLine2: '40 PACIFICA',
  addressLine3: null,
  stateOrRegion: 'CA',
  city: 'IRVINE',
  countryCode: 'US',
  postalCode: '92618-7471',
}
