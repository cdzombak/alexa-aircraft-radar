# Aircraft Radar skill for Amazon Alexa

The **Aircraft Radar** skill for Amazon Alexa uses live [ADS-B](https://en.wikipedia.org/wiki/Automatic_dependent_surveillance_–_broadcast) radio signals, collected by volunteers, to tell you what airplanes are around you.

This top-level README covers technical topics relevant to development of the skill codebase.

* To install the skill, see [Aircraft Radar skill on Amazon](https://www.amazon.com/dp/B075XC9L9H/).
* For a general introduction to the skill, read [the skill website](https://www.radarskill.dzombak.com).
* For voice UI design and usage, read [skill/README](skill/README.md).

## Requirements

### Node v8

This is a standard Node application which requires Node v8. It might work with newer Node versions, but AWS Lambda uses v8.

On macOS,
```shell script
brew tap homebrew/cask-versions
brew install node@8

# then, in your shell:
export PATH="/usr/local/opt/node@8/bin:$PATH"
```

### AWS Lambda

This application is deployed to [AWS Lambda](https://aws.amazon.com/lambda/). You can probably run it elsewhere, but it’s specifically designed for and tested with Lambda.

### Geocoding API

The skill requires my [geocoding web service](https://github.com/cdzombak/geocode-service) to be deployed, and you’ll need an API key to access it (see “Environment Vars” below).

### Aircraft Images API

The skill requires my [aircraft images web service](https://github.com/cdzombak/aircraft-image-service) to be deployed, and you’ll need an API key to access it (see “Environment Vars” below).

### Libraries

Per `package.json`, in production this application requires `alexa-sdk`, `request`, and `request-promise`.

## Development

### Install dependencies with npm

Install dependencies, including those for development, with `npm install`.

### Set required environment variables in your shell

Once you have an API key for the geocoding service and aircraft image service, run `source .env.dev` in your shell before running mock requests (see the next step). You can create this file by copying `.env.sample` and filling out the empty values there.

### Run mock requests with lambda-local

`package.json` defines a script that can be used to run a mock request for every supported intent.

Start by running `npm run mock-nearest-aircraft`, and see `package.json` for the full list.

(You’ll have to run this *after* setting the required environment variables in your shell.)

### Generate utterances programmatically

Use `scripts/utterance-gen.py` to programmatically generate variants of utterances which can be grafted into the skill JSON file.

## Deployment

`npm run package` will generate a zip file suitable for uploading to AWS Lambda. It’s placed in the `products` subdirectory.

For convenience when developing on macOS, `npm run deploy` will generate the zip package, copy its path to the clipboard, and open your web browser to the deployment page.

### Environment Vars

- `ADSBX_API_KEY` is the API key for the [ADS-B Exchange API](https://adsbexchange.com/data/#).
- `GEOCODE_API_KEY` is the client key for my geocoding web service.
- `IMAGE_API_KEY` is the client key for my aircraft images web service.

## Be nice to ADS-B Exchange

Aircraft data comes from [ADS-B Exchange](http://www.adsbexchange.com). Be nice to them:

* [Donate to them.](https://www.adsbexchange.com/donate/)
* If possible, [run an ADS-B receiver and feed them](https://www.adsbexchange.com/how-to-feed/).

## Reference Materials

* [SSML Reference](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/speech-synthesis-markup-language-ssml-reference)
* [AircraftList.json API reference](http://www.virtualradarserver.co.uk/Documentation/Formats/AircraftList.aspx)

## Updating ICAO 8643 Aircraft Types

Visit https://www.icao.int/publications/DOC8643/Pages/Search.aspx, observe network requests in the Inspector, and download the AircraftTypes file.

For Manufacturers, visit https://www.icao.int/publications/DOC8643/Pages/Manufacturers.aspx and download the Manufacturers file it loads.

## License

The skill’s code and related data (eg. the utterances file) is licensed under GPLv3. See [LICENSE](LICENSE).

The skill’s icon is stored in this repository but _is not available for use by others_ under any circumstances.

## Author

Chris Dzombak: [dzombak.com](https://www.dzombak.com) / [@cdzombak](https://twitter.com/cdzombak) / chris@dzombak.com

## Inspiration

These links were interesting and inspired me to start on this project, but I wanted something more generally useful and that could use data from all over the place:

* [Asking an Amazon Echo to spot planes with help from an RTL-SDR and Raspberry Pi](http://www.rtl-sdr.com/asking-an-amazon-echo-to-spot-planes-with-help-from-an-rtl-sdr-and-raspberry-pi/)
* [Teaching Alexa to Spot Airplanes: Fun with RTL-SDR and Amazon Echo Dot](https://www.nicksypteras.com/projects/teaching-alexa-to-spot-airplanes)
* [Syps/alexa-airplane-spotter](https://github.com/Syps/alexa-airplane-spotter)
