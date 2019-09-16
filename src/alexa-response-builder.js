'use strict';

class AlexaResponseBuilder {

  constructor(title) {
    this._title = title;
    this._text = "";
    this._ssml = "";
    this._needsMore = null;
    this._thumbnailPromise = Promise.resolve(null)
  }

  respond(ctx) {
    if (this._needsMore) {
      this.append(" " + this._needsMore, " <break time=\"500ms\" />" + this._needsMore);
    }
    this._thumbnailPromise.then((thumbnailURL) => {
      console.log('[AlexaResponseBuilder] Sending title:', this._title)
      console.log('[AlexaResponseBuilder] Sending text:', this._text)
      console.log('[AlexaResponseBuilder] Sending SSML:', this._ssml)
      if (thumbnailURL) console.log('[AlexaResponseBuilder] Sending image:', thumbnailURL)

      var image = null;
      if (thumbnailURL) {
        image = {
          smallImageUrl: thumbnailURL,
          largeImageUrl: thumbnailURL
        };
      }

      ctx.response.cardRenderer(this._title, this._text, image);
      ctx.response.speak(this._ssml);
      if (this._needsMore) {
        ctx.response.listen(this._needsMore);
      }
      ctx.emit(':responseReady');
    })
  }

  append(text, ssml) {
    this._text += text;
    if (ssml === undefined) {
      this._ssml += text;
    } else {
      this._ssml += ssml;
    }
  }

  space() {
    this.append(' ');
  }

  setThumbnailPromise(thumbnailPromise) {
    this._thumbnailPromise = thumbnailPromise
  }

  setNeedsMore(needsMore) {
    this._needsMore = needsMore
  }
}

module.exports = AlexaResponseBuilder;
