export class DomReady {
  _maxTryNum = 800;
  _tryNum: number;
  callback: any;
  _interval = 100;
  constructor(callback) {
    this._tryNum = 0;
    this.callback = callback;
    this.check();
  }
  check() {
    if (++this._tryNum > this._maxTryNum) {
      return;
    }
    if (document.readyState === 'complete') {
      this.callback();
      return true;
    } else {
      setTimeout(() => {
        this.check();
      }, 100);
    }
  }
}
export const domReady = (callback) => {
  return new DomReady(callback);
};

export const getWebisteInfo = () => {

  const origin = window.top?.location.origin;
  const icon =
    (querySelector('head > link[rel~="icon"]') as HTMLLinkElement)?.href ||
    (querySelector('head > meta[itemprop="image"]') as HTMLMetaElement)?.content;
  const name = document.title || (querySelector('head > meta[name="title"]') as HTMLMetaElement)?.content || origin;

  return { origin, icon, name };
}

export const querySelector = document.querySelector.bind(document);
