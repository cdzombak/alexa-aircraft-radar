# Aircraft Radar Alexa Skill

Voice UI design and documentation for the Aircraft Radar Alexa skill.

* For a general introduction to the skill, read [the skill website](https://www.radarskill.dzombak.com).

## Nearby vs Overhead Queries

* Overhead: 15km radius with aggressive filtering of aircraft further away at low altitude.
* Nearby: 40km radius with very mild filtering or faraway low-altitude aircraft.

### Near-ground filtering: "overhead"

Execute a search for aircraft within 15km. Apply the following filters based on aircraft altitude **above user ground level:**

| Altitude AGL | Maximum Distance |
| ------------ | ---------------- |
| 0-2k ft      | 4 km             |
| 2k-4k ft     | 8 km             |
| 4k-6k ft     | 10 km            |
[Filtering: "Overhead"]

### Near-ground filtering: "nearby"

Execute a search for aircraft within 40km. Apply the following filters based on aircraft altitude **above user ground level:**

| Altitude AGL | Maximum Distance |
| ------------ | ---------------- |
| 0-2k ft      | 15 km            |
| 2k-4k ft     | 25 km            |
[Filtering: "Nearby"]

### Synonyms

In utterances,

* "around" is a synonym for "nearby".
* "closest" is a synonym for "nearest".

## Sorting and Distance Calculations

Results are always sorted by distance to the user. Distances are calculated taking distance along the ground _and altitude_ into account.

## Filters

* Aircraft (synonym: Airplanes)
* Helicopters
* Jets
* Military

## Intents and Behaviors

| Implemented? | Intent                    | Behavior                                                                                | Response Format                                                                                                                               |
| ------------ | ------------------------- | --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| x            | Nearby_Aircraft           | Search for nearby aircraft and return 4 closest results based on calculated distance.   | N aircraft are nearby. [Here are the first M:] A [model] from [airport] Z miles A at X feet heading Y; …                                      |
| x            | Overhead_Aircraft         | Search for overhead aircraft and return 4 closest results based on calculated distance. |                                                                                                                                               |
| x            | Nearest_Overhead_Aircraft | Search for overhead aircraft and calculate distance. Return closest result.             |                                                                                                                                               |
| x            | Nearest_Aircraft          | Search for nearby aircraft and calculate distance. Return closest result.               | The nearest aircraft is a [model] Z miles A at X feet heading Y, registration [reg], en route from [airport] to [airport] with [count] stops. |
| x            | Overhead_Helicopters      | Search for overhead helicopters (using API filtering). Return 4 closest results.        |                                                                                                                                               |
| x            | Nearby_Helicopters        | Search for nearby helicopters (using API filtering). Return 4 closest results.          |                                                                                                                                               |
| x            | Nearest_Helicopter        | Search for nearby helicopters (using API filtering). Return closest result.             |                                                                                                                                               |
| x            | Nearby_Jets               | Search for nearby jets (using API filtering). Return 4 closest results.                 |                                                                                                                                               |
| x            | Overhead_Jets             | Search for overhead jets (using API filtering). Return 4 closest results.               |                                                                                                                                               |
| x            | Nearest_Jet               | Search for nearby jets (using API filtering). Return closest result.                    |                                                                                                                                               |
| x            | Overhead_Military         | Search for overhead military aircraft (using API filtering). Return 4 closest results.  |                                                                                                                                               |
| x            | Nearby_Military           | Search for nearby military aircraft (using API filtering). Return 4 closest results.    |                                                                                                                                               |
[Intents and Behavior Specs]

## Utterances

**See:** [`skill.json`](skill.json).

## Publishing Information

[Amazon Developer Console / Alexa](https://developer.amazon.com/edw/home.html)

**Testing instructions:**

> The Echo used for testing must have an address assigned to it. The skill requires address permissions and will ask for them if it doesn't have them.
>
> Things to ask: "ask aircraft radar, what airplanes are nearby?" "ask aircraft radar, what's overhead?" "ask aircraft radar, what helicopters are nearby?" "ask aircraft radar, what's the closest jet plane?"

**Short description:**

> Tells you what aircraft are nearby.

**Full Skill Description:**

> Aircraft Radar uses live aircraft radio signals, collected by volunteers, to tell you what airplanes are around you.
>
> You can ask it:
> - "what airplanes are around?"
> - "what jets are overhead?"
> - "what was that?"
> - "are there any helicopters nearby?"
> - "what's the nearest aircraft?"
> - "are there any military planes around?"
> - ...and more!
>
> If Aircraft Radar only finds one aircraft, it'll give you detailed information including registration number and a picture  (if it can find one). Otherwise, you'll get a list of the closest 4 aircraft that you're asking about.
>
> This skill requires your Echo to have an address assigned to it, and you'll need to give Aircraft Radar permission in the Alexa app to access your address. This information is used to search for airplanes near your location.
>
> Data is provided by ADS-B Exchange (www.adsbexchange.com). Be aware that not all airplanes transmit location radio signals just yet, and not all geographical areas have a volunteer receiving ADS-B transmissions from airplanes. The ADS-B Exchange website has instructions on how to contribute data from your location.

**Keywords:**

> airplanes,radar,flights,aircraft,helicopters,tracker,ads-b

**Example phrases:**

1. Alexa, ask Aircraft Radar what airplanes are around.
2. Alexa, ask Aircraft Radar what helicopters are nearby.
3. Alexa, ask Aircraft Radar what jets are overhead.
