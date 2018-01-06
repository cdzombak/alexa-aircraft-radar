'use strict';

// Aviation formatting for Alexa/SSML.

// Convert the given angle to cardinal direction word.
// Use badInputValue when cardinal is not in 0-360; pass `null` to get a default.
exports.cardinal = function(angle, badInputValue) {
  const directions = 8

  const degree = 360 / directions
  angle = angle + degree/2

  if (angle >= 0 * degree && angle < 1 * degree)
    return "north"
  if (angle >= 1 * degree && angle < 2 * degree)
    return "northeast"
  if (angle >= 2 * degree && angle < 3 * degree)
    return "east"
  if (angle >= 3 * degree && angle < 4 * degree)
    return "southeast"
  if (angle >= 4 * degree && angle < 5 * degree)
    return "south"
  if (angle >= 5 * degree && angle < 6 * degree)
    return "southwest"
  if (angle >= 6 * degree && angle < 7 * degree)
    return "west"
  if (angle >= 7 * degree && angle < 8 * degree)
    return "northwest"

  // Should never happen:
  console.log("[aviation-formatting] invalid angle input angle:", angle)
  return badInputValue !== null ? badInputValue : "unknown"
}

// SSML ICAO:

exports.icaoChar = function(ch) {
  switch (ch.toLowerCase()) {
    case "a": return "ALPHA"
    case "b": return "BRAVO"
    case "c": return "CHARLIE"
    case "d": return "DELTA"
    case "e": return "ECHO"
    case "f": return "FOXTROT"
    case "g": return "GOLF"
    case "h": return "HOTEL"
    case "i": return "INDIA"
    case "j": return "<phoneme alphabet=\"ipa\" ph=\"d͡ʒuliɛt\">juliet</phoneme>"
    case "k": return "KILO"
    case "l": return "<phoneme alphabet=\"ipa\" ph=\"l'imə\">lima</phoneme>"
    case "m": return "MIKE"
    case "n": return "NOVEMBER"
    case "o": return "OSCAR"
    case "p": return "PAPA"
    case "q": return "QUEBEC"
    case "r": return "ROMEO"
    case "s": return "SIERRA"
    case "t": return "TANGO"
    case "u": return "UNIFORM"
    case "v": return "VICTOR"
    case "w": return "WHISKEY"
    case "x": return "X-RAY"
    case "y": return "YANKEE"
    case "z": return "ZULU"
    case "1": return "ONE"
    case "2": return "TWO"
    case "3": return "TREE"
    case "4": return "FOUR"
    case "5": return "FIVE"
    case "6": return "SIX"
    case "7": return "SEVEN"
    case "8": return "EIGHT"
    case "9": return "NINER"
    case "0": return "ZERO"
    case "-": return "DASH"
  }

  return null
}

exports.icaoStr = function(str) {
  var result = ""

  for (var i = 0, len = str.length; i < len; i++) {
    const icao = exports.icaoChar(str[i])
    if (icao !== null) {
      result += " " + icao + " "
    } else {
      result += str[i]
    }
  }

  return result.replace(/  /g, " ").trim()
}
