'use strict'

const Https = require('https')

/**
 * This is a small wrapper client for the Alexa Address API.
 *
 * Taken from some Alexa sample code in Sept. 2017.
 */
class AlexaDeviceAddressClient {

  /**
     * Retrieve an instance of the Address API client.
     * @param apiEndpoint the endpoint of the Alexa APIs.
     * @param deviceId the device ID being targeted.
     * @param consentToken valid consent token.
     */
  constructor(apiEndpoint, deviceId, consentToken) {
    this.deviceId = deviceId
    this.consentToken = consentToken
    this.endpoint = apiEndpoint.replace(/^https?:\/\//i, '')
  }

  /**
     * This will make a request to the Address API using the device ID and
     * consent token provided when the Address Client was initialized.
     * This will retrieve the full address of a device.
     * @return {Promise} promise for the request in flight.
     */
  getFullAddress() {
    const options = this.__getRequestOptions(`/v1/devices/${this.deviceId}/settings/address`)

    return new Promise((fulfill, reject) => {
      this.__handleDeviceAddressApiRequest(options, fulfill, reject)
    })
  }

  /**
     * This will make a request to the Address API using the device ID and
     * consent token provided when the Address Client was initialized.
     * This will retrieve the country and postal code of a device.
     * @return {Promise} promise for the request in flight.
     */
  getCountryAndPostalCode() {
    const options = this.__getRequestOptions(`/v1/devices/${this.deviceId}/settings/address/countryAndPostalCode`)

    return new Promise((fulfill, reject) => {
      this.__handleDeviceAddressApiRequest(options, fulfill, reject)
    })
  }

  /**
     * This is a helper method that makes requests to the Address API and handles the response
     * in a generic manner. It will also resolve promise methods.
     * @param requestOptions
     * @param fulfill
     * @param reject
     * @private
     */
  // eslint-disable-next-line class-methods-use-this
  __handleDeviceAddressApiRequest(requestOptions, fulfill, reject) {
    Https.get(requestOptions, (response) => {
      console.log('[AlexaDeviceAddressClient] Device Address API responded with status code: ', response.statusCode)

      if (response.statusCode === 204) {
        // no data means on('data') will never happen
        const deviceAddressResponse = {
          statusCode: response.statusCode,
          address: null,
        }
        fulfill(deviceAddressResponse)
      } else {
        response.on('data', (data) => {
          const responsePayloadObject = JSON.parse(data)
          const deviceAddressResponse = {
            statusCode: response.statusCode,
            address: responsePayloadObject,
          }
          fulfill(deviceAddressResponse)
        })
      }
    }).on('error', (e) => {
      console.error(e)
      reject()
    })
  }

  /**
     * Private helper method for retrieving request options.
     * @param path the path that you want to hit against the API provided by the skill event.
     * @return {{hostname: string, path: *, method: string, headers: {Authorization: string}}}
     * @private
     */
  __getRequestOptions(path) {
    return {
      hostname: this.endpoint,
      path,
      method: 'GET',
      headers: { Authorization: `Bearer ${this.consentToken}` },
    }
  }

}

module.exports = AlexaDeviceAddressClient
