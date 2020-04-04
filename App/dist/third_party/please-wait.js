/**
* please-wait
* Display a nice loading screen while your app loads

* @author Pathgather <tech@pathgather.com>
* @copyright Pathgather 2015
* @license MIT <http://opensource.org/licenses/mit-license.php>
* @link https://github.com/Pathgather/please-wait
* @module please-wait
* @version 0.0.5
*/
(function(root, factory) ***REMOVED***
  if (typeof exports === "object") ***REMOVED***
    factory(exports);
***REMOVED*** else if (typeof define === "function" && define.amd) ***REMOVED***
    define(["exports"], factory);
***REMOVED*** else ***REMOVED***
    factory(root);
***REMOVED***
***REMOVED***)(this, function(exports) ***REMOVED***
  var PleaseWait, addClass, animationEvent, animationSupport, domPrefixes, elm, key, pfx, pleaseWait, removeClass, transEndEventNames, transitionEvent, transitionSupport, val, _i, _len;
  elm = document.createElement('fakeelement');
  animationSupport = false;
  transitionSupport = false;
  animationEvent = 'animationend';
  transitionEvent = null;
  domPrefixes = 'Webkit Moz O ms'.split(' ');
  transEndEventNames = ***REMOVED***
    'WebkitTransition': 'webkitTransitionEnd',
    'MozTransition': 'transitionend',
    'OTransition': 'oTransitionEnd',
    'msTransition': 'MSTransitionEnd',
    'transition': 'transitionend'
***REMOVED***;
  for (key in transEndEventNames) ***REMOVED***
    val = transEndEventNames[key];
    if (elm.style[key] != null) ***REMOVED***
      transitionEvent = val;
      transitionSupport = true;
      break;
  ***REMOVED***
***REMOVED***
  if (elm.style.animationName != null) ***REMOVED***
    animationSupport = true;
***REMOVED***
  if (!animationSupport) ***REMOVED***
    for (_i = 0, _len = domPrefixes.length; _i < _len; _i++) ***REMOVED***
      pfx = domPrefixes[_i];
      if (elm.style["" + pfx + "AnimationName"] != null) ***REMOVED***
        switch (pfx) ***REMOVED***
          case 'Webkit':
            animationEvent = 'webkitAnimationEnd';
            break;
          case 'Moz':
            animationEvent = 'animationend';
            break;
          case 'O':
            animationEvent = 'oanimationend';
            break;
          case 'ms':
            animationEvent = 'MSAnimationEnd';
      ***REMOVED***
        animationSupport = true;
        break;
    ***REMOVED***
  ***REMOVED***
***REMOVED***
  addClass = function(classname, elem) ***REMOVED***
    if (elem.classList) ***REMOVED***
      return elem.classList.add(classname);
  ***REMOVED*** else ***REMOVED***
      return elem.className += " " + classname;
  ***REMOVED***
***REMOVED***;
  removeClass = function(classname, elem) ***REMOVED***
    if (elem.classList) ***REMOVED***
      return elem.classList.remove(classname);
  ***REMOVED*** else ***REMOVED***
      return elem.className = elem.className.replace(classname, "").trim();
  ***REMOVED***
***REMOVED***;
  PleaseWait = (function() ***REMOVED***
    PleaseWait._defaultOptions = ***REMOVED***
      backgroundColor: null,
      logo: null,
      loadingHtml: null,
      template: "<div class='pg-loading-inner'>\n  <div class='pg-loading-center-outer'>\n    <div class='pg-loading-center-middle'>\n      <h1 class='pg-loading-logo-header'>\n        <img class='pg-loading-logo'></img>\n      </h1>\n      <div class='pg-loading-html'>\n      </div>\n    </div>\n  </div>\n</div>",
      onLoadedCallback: null
  ***REMOVED***;

    function PleaseWait(options) ***REMOVED***
      var defaultOptions, k, listener, v;
      defaultOptions = this.constructor._defaultOptions;
      this.options = ***REMOVED******REMOVED***;
      this.loaded = false;
      this.finishing = false;
      for (k in defaultOptions) ***REMOVED***
        v = defaultOptions[k];
        this.options[k] = options[k] != null ? options[k] : v;
    ***REMOVED***
      this._loadingElem = document.createElement("div");
      this._loadingHtmlToDisplay = [];
      this._loadingElem.className = "pg-loading-screen";
      if (this.options.backgroundColor != null) ***REMOVED***
        this._loadingElem.style.backgroundColor = this.options.backgroundColor;
    ***REMOVED***
      this._loadingElem.innerHTML = this.options.template;
      this._loadingHtmlElem = this._loadingElem.getElementsByClassName("pg-loading-html")[0];
      if (this._loadingHtmlElem != null) ***REMOVED***
        this._loadingHtmlElem.innerHTML = this.options.loadingHtml;
    ***REMOVED***
      this._readyToShowLoadingHtml = false;
      this._logoElem = this._loadingElem.getElementsByClassName("pg-loading-logo")[0];
      if (this._logoElem != null) ***REMOVED***
        this._logoElem.src = this.options.logo;
    ***REMOVED***
      removeClass("pg-loaded", document.body);
      addClass("pg-loading", document.body);
      document.body.appendChild(this._loadingElem);
      addClass("pg-loading", this._loadingElem);
      this._onLoadedCallback = this.options.onLoadedCallback;
      listener = (function(_this) ***REMOVED***
        return function(evt) ***REMOVED***
          _this.loaded = true;
          _this._readyToShowLoadingHtml = true;
          addClass("pg-loaded", _this._loadingHtmlElem);
          if (animationSupport) ***REMOVED***
            _this._loadingHtmlElem.removeEventListener(animationEvent, listener);
        ***REMOVED***
          if (_this._loadingHtmlToDisplay.length > 0) ***REMOVED***
            _this._changeLoadingHtml();
        ***REMOVED***
          if (_this.finishing) ***REMOVED***
            if (evt != null) ***REMOVED***
              evt.stopPropagation();
          ***REMOVED***
            return _this._finish();
        ***REMOVED***
      ***REMOVED***;
    ***REMOVED***)(this);
      if (this._loadingHtmlElem != null) ***REMOVED***
        if (animationSupport) ***REMOVED***
          this._loadingHtmlElem.addEventListener(animationEvent, listener);
      ***REMOVED*** else ***REMOVED***
          listener();
      ***REMOVED***
        this._loadingHtmlListener = (function(_this) ***REMOVED***
          return function() ***REMOVED***
            _this._readyToShowLoadingHtml = true;
            removeClass("pg-loading", _this._loadingHtmlElem);
            if (transitionSupport) ***REMOVED***
              _this._loadingHtmlElem.removeEventListener(transitionEvent, _this._loadingHtmlListener);
          ***REMOVED***
            if (_this._loadingHtmlToDisplay.length > 0) ***REMOVED***
              return _this._changeLoadingHtml();
          ***REMOVED***
        ***REMOVED***;
      ***REMOVED***)(this);
        this._removingHtmlListener = (function(_this) ***REMOVED***
          return function() ***REMOVED***
            _this._loadingHtmlElem.innerHTML = _this._loadingHtmlToDisplay.shift();
            removeClass("pg-removing", _this._loadingHtmlElem);
            addClass("pg-loading", _this._loadingHtmlElem);
            if (transitionSupport) ***REMOVED***
              _this._loadingHtmlElem.removeEventListener(transitionEvent, _this._removingHtmlListener);
              return _this._loadingHtmlElem.addEventListener(transitionEvent, _this._loadingHtmlListener);
          ***REMOVED*** else ***REMOVED***
              return _this._loadingHtmlListener();
          ***REMOVED***
        ***REMOVED***;
      ***REMOVED***)(this);
    ***REMOVED***
  ***REMOVED***

    PleaseWait.prototype.finish = function(immediately, onLoadedCallback) ***REMOVED***
      if (immediately == null) ***REMOVED***
        immediately = false;
    ***REMOVED***
      if (window.document.hidden) ***REMOVED***
        immediately = true;
    ***REMOVED***
      this.finishing = true;
      if (onLoadedCallback != null) ***REMOVED***
        this.updateOption('onLoadedCallback', onLoadedCallback);
    ***REMOVED***
      if (this.loaded || immediately) ***REMOVED***
        return this._finish(immediately);
    ***REMOVED***
  ***REMOVED***;

    PleaseWait.prototype.updateOption = function(option, value) ***REMOVED***
      switch (option) ***REMOVED***
        case 'backgroundColor':
          return this._loadingElem.style.backgroundColor = value;
        case 'logo':
          return this._logoElem.src = value;
        case 'loadingHtml':
          return this.updateLoadingHtml(value);
        case 'onLoadedCallback':
          return this._onLoadedCallback = value;
        default:
          throw new Error("Unknown option '" + option + "'");
    ***REMOVED***
  ***REMOVED***;

    PleaseWait.prototype.updateOptions = function(options) ***REMOVED***
      var k, v, _results;
      if (options == null) ***REMOVED***
        options = ***REMOVED******REMOVED***;
    ***REMOVED***
      _results = [];
      for (k in options) ***REMOVED***
        v = options[k];
        _results.push(this.updateOption(k, v));
    ***REMOVED***
      return _results;
  ***REMOVED***;

    PleaseWait.prototype.updateLoadingHtml = function(loadingHtml, immediately) ***REMOVED***
      if (immediately == null) ***REMOVED***
        immediately = false;
    ***REMOVED***
      if (this._loadingHtmlElem == null) ***REMOVED***
        throw new Error("The loading template does not have an element of class 'pg-loading-html'");
    ***REMOVED***
      if (immediately) ***REMOVED***
        this._loadingHtmlToDisplay = [loadingHtml];
        this._readyToShowLoadingHtml = true;
    ***REMOVED*** else ***REMOVED***
        this._loadingHtmlToDisplay.push(loadingHtml);
    ***REMOVED***
      if (this._readyToShowLoadingHtml) ***REMOVED***
        return this._changeLoadingHtml();
    ***REMOVED***
  ***REMOVED***;

    PleaseWait.prototype._changeLoadingHtml = function() ***REMOVED***
      this._readyToShowLoadingHtml = false;
      this._loadingHtmlElem.removeEventListener(transitionEvent, this._loadingHtmlListener);
      this._loadingHtmlElem.removeEventListener(transitionEvent, this._removingHtmlListener);
      removeClass("pg-loading", this._loadingHtmlElem);
      removeClass("pg-removing", this._loadingHtmlElem);
      if (transitionSupport) ***REMOVED***
        addClass("pg-removing", this._loadingHtmlElem);
        return this._loadingHtmlElem.addEventListener(transitionEvent, this._removingHtmlListener);
    ***REMOVED*** else ***REMOVED***
        return this._removingHtmlListener();
    ***REMOVED***
  ***REMOVED***;

    PleaseWait.prototype._finish = function(immediately) ***REMOVED***
      var listener;
      if (immediately == null) ***REMOVED***
        immediately = false;
    ***REMOVED***
      if (this._loadingElem == null) ***REMOVED***
        return;
    ***REMOVED***
      addClass("pg-loaded", document.body);
      if (typeof this._onLoadedCallback === "function") ***REMOVED***
        this._onLoadedCallback.apply(this);
    ***REMOVED***
      listener = (function(_this) ***REMOVED***
        return function() ***REMOVED***
          document.body.removeChild(_this._loadingElem);
          removeClass("pg-loading", document.body);
          if (animationSupport) ***REMOVED***
            _this._loadingElem.removeEventListener(animationEvent, listener);
        ***REMOVED***
          return _this._loadingElem = null;
      ***REMOVED***;
    ***REMOVED***)(this);
      if (!immediately && animationSupport) ***REMOVED***
        addClass("pg-loaded", this._loadingElem);
        return this._loadingElem.addEventListener(animationEvent, listener);
    ***REMOVED*** else ***REMOVED***
        return listener();
    ***REMOVED***
  ***REMOVED***;

    return PleaseWait;

***REMOVED***)();
  pleaseWait = function(options) ***REMOVED***
    if (options == null) ***REMOVED***
      options = ***REMOVED******REMOVED***;
  ***REMOVED***
    return new PleaseWait(options);
***REMOVED***;
  exports.pleaseWait = pleaseWait;
  return pleaseWait;
***REMOVED***);
