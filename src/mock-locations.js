'use strict';

exports.VALID_LOCATION = {
  'addressLine1': '118 S. Main St',
  'addressLine2': null,
  'addressLine3': null,
  'districtOrCounty': 'Washtenaw',
  'city': 'Ann Arbor',
  'stateOrRegion': 'Michigan',
  'postalCode': '48104',
  'countryCode': 'US'
}

exports.INVALID_LOCATION = {
  'addressLine1': 'NF-dfddddd',
  'addressLine2': null,
  'addressLine3': null,
  'districtOrCounty': 'flalalks',
  'stateOrRegion': 'XX',
  'city': 'na',
  'countryCode': 'XX',
  'postalCode': '00000'
}
