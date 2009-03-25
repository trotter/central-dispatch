var CentralDispatch = function() {
    var klass = {};
    var callbacks = {};

    var addCallback = function(url, callback) {
        callbacks[url] = callbacks[url] || [];
        callbacks[url].push(callback);
    };

    var findCallbacks = function(url) {
        // Exit with an exact match if possible for speed
        var callback = callbacks[url];
        if (callback) {
          return callback;
        }
        // TODO: The following is innefficient in the case of many callbacks
        var regex = new RegExp(url + '$');
        for (var fullUrl in callbacks) {
          if (callbacks.hasOwnProperty(fullUrl)) {
            if (regex.test(fullUrl)) {
              return callbacks[fullUrl];
            }
          }
        }
    };

    var runCallbacks = function(callbacks, data) {
        var callback = callbacks.pop();
        while (callback) {
            // TODO: Should clone data so that functions don't spoil the fun for
            // others.
            callback(data); 
            callback = callbacks.pop();
        }
    };

    klass.requestData = function(url, callback) {
        addCallback(url, callback);
        var tag = document.createElement('script');
        tag.src = url;
        document.body.appendChild(tag);
    };

    klass.receiveData = function(url, data) {
        var callbacks = findCallbacks(url);
        runCallbacks(callbacks, data);
        if (callbacks) { 
          callbacks[url] = null;
        }
    };

    return klass;
}();
