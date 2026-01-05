// Polyfill for axios, @stomp/stompjs and other libraries
// This must be imported FIRST before any other imports

// ========== 浏览器兼容性 Polyfill ==========

// 1. 确保 globalThis 存在（IE11 及以下不支持）
if (typeof globalThis === 'undefined') {
  (function() {
    if (typeof self !== 'undefined') {
      self.globalThis = self;
    } else if (typeof window !== 'undefined') {
      window.globalThis = window;
    } else if (typeof global !== 'undefined') {
      global.globalThis = global;
    } else {
      throw new Error('unable to locate global object');
    }
  })();
}

// 2. 确保 global 存在（Node.js 环境）
if (typeof global === 'undefined') {
  if (typeof window !== 'undefined') {
    window.global = window;
  } else if (typeof globalThis !== 'undefined') {
    globalThis.global = globalThis;
  }
}

// 3. 为 axios 提供 Request、Response 和 Headers（旧浏览器不支持）
if (typeof globalThis.Request === 'undefined') {
  globalThis.Request = class Request {
    constructor() {}
  };
}

if (typeof globalThis.Response === 'undefined') {
  globalThis.Response = class Response {
    constructor() {}
  };
}

if (typeof globalThis.Headers === 'undefined') {
  globalThis.Headers = class Headers {
    constructor() {}
  };
}

// 4. Object.assign polyfill (IE11 不支持)
if (typeof Object.assign !== 'function') {
  Object.assign = function(target) {
    if (target == null) {
      throw new TypeError('Cannot convert undefined or null to object');
    }
    var to = Object(target);
    for (var index = 1; index < arguments.length; index++) {
      var nextSource = arguments[index];
      if (nextSource != null) {
        for (var nextKey in nextSource) {
          if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
            to[nextKey] = nextSource[nextKey];
          }
        }
      }
    }
    return to;
  };
}

// 5. Array.from polyfill (IE11 不支持)
if (!Array.from) {
  Array.from = function(arrayLike, mapFn, thisArg) {
    var C = this;
    var items = Object(arrayLike);
    if (arrayLike == null) {
      throw new TypeError('Array.from requires an array-like object - not null or undefined');
    }
    var mapFunction = mapFn !== undefined;
    var T;
    if (typeof mapFn !== 'undefined') {
      if (typeof mapFn !== 'function') {
        throw new TypeError('Array.from: when provided, the second argument must be a function');
      }
      if (arguments.length > 2) {
        T = thisArg;
      }
    }
    var len = parseInt(items.length, 10) || 0;
    var A = typeof C === 'function' ? Object(new C(len)) : new Array(len);
    var k = 0;
    var kValue;
    while (k < len) {
      kValue = items[k];
      if (mapFunction) {
        A[k] = typeof T === 'undefined' ? mapFn(kValue, k) : mapFn.call(T, kValue, k);
      } else {
        A[k] = kValue;
      }
      k += 1;
    }
    A.length = len;
    return A;
  };
}

// 6. Promise polyfill (IE11 不支持) - 如果需要可以引入 es6-promise
// 这里只做检测，不自动引入，避免增加包体积
if (typeof Promise === 'undefined') {
  console.warn('[Polyfill] Promise is not supported. Please include a Promise polyfill for IE11 support.');
}

// 7. String.includes polyfill (IE11 不支持)
if (!String.prototype.includes) {
  String.prototype.includes = function(search, start) {
    if (typeof start !== 'number') {
      start = 0;
    }
    if (start + search.length > this.length) {
      return false;
    } else {
      return this.indexOf(search, start) !== -1;
    }
  };
}

// 8. Array.includes polyfill (IE11 不支持)
if (!Array.prototype.includes) {
  Array.prototype.includes = function(searchElement, fromIndex) {
    if (this == null) {
      throw new TypeError('"this" is null or not defined');
    }
    var o = Object(this);
    var len = parseInt(o.length, 10) || 0;
    if (len === 0) {
      return false;
    }
    var n = parseInt(fromIndex, 10) || 0;
    var k;
    if (n >= 0) {
      k = n;
    } else {
      k = len + n;
      if (k < 0) {
        k = 0;
      }
    }
    function sameValueZero(x, y) {
      return x === y || (typeof x === 'number' && typeof y === 'number' && isNaN(x) && isNaN(y));
    }
    for (; k < len; k++) {
      if (sameValueZero(o[k], searchElement)) {
        return true;
      }
    }
    return false;
  };
}

// 9. 检测浏览器并输出兼容性信息
const browserInfo = {
  userAgent: navigator.userAgent,
  isIE: /MSIE|Trident/.test(navigator.userAgent),
  isEdge: /Edge/.test(navigator.userAgent),
  isChrome: /Chrome/.test(navigator.userAgent) && !/Edge/.test(navigator.userAgent),
  isFirefox: /Firefox/.test(navigator.userAgent),
  isSafari: /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent),
  isMobile: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent),
  supportsES6: typeof Promise !== 'undefined' && typeof Array.from !== 'undefined'
};


// 10. 警告不支持的浏览器
if (browserInfo.isIE) {
  console.warn('[Polyfill] Internet Explorer detected. Some features may not work properly.');
  console.warn('[Polyfill] Please consider using a modern browser like Chrome, Firefox, or Edge.');
}

// 11. 移动端检测和优化
if (browserInfo.isMobile) {
  // 禁用双击缩放
  let lastTouchEnd = 0;
  document.addEventListener('touchend', function(event) {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
      event.preventDefault();
    }
    lastTouchEnd = now;
  }, false);
  
  // 防止页面滚动时出现橡皮筋效果（iOS）
  document.addEventListener('touchmove', function(event) {
    if (event.target.closest('.scrollable')) {
      return;
    }
    // 允许默认滚动行为
  }, { passive: true });
}
