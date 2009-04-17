var CentralDispatch = function () {
    var klass = {},
        callbacks = {},
        addCallback, findCallbacks, runCallbacks;

    addCallback = function (url, callback) {
        callbacks[url] = callbacks[url] || [];
        callbacks[url].push(callback);
    };

    findCallbacks = function (url) {
        var callback, regex, fullUrl;

        // Exit with an exact match if possible for speed
        callback = callbacks[url];
        if (callback) {
            return callback;
        }
        // TODO: The following is innefficient in the case of many callbacks
        regex = new RegExp(url + '$');
        for (fullUrl in callbacks) {
            if (callbacks.hasOwnProperty(fullUrl)) {
                if (regex.test(fullUrl)) {
                    return callbacks[fullUrl];
                }
            }
        }
        // Incase we don't find anything
        return [];
    };

    runCallbacks = function (callbacks, data) {
        var callback = callbacks.pop();
        while (callback) {
            // TODO: Should clone data so that functions don't spoil the fun for
            // others.
            callback(data); 
            callback = callbacks.pop();
        }
    };

    klass.requestData = function (url, callback, options) {
        var tag;
        options = options || {};
        tag = document.createElement('script');
        tag.src = url;
        tag.onerror = function () { 
            if (options.onError) {
                options.onError();
            }
            if (tag) {
                document.body.removeChild(tag);
                tag = null;
            }
        };
        addCallback(url, function (data) { 
            callback(data); 
            if (tag) {
                document.body.removeChild(tag); 
                tag = null; 
            }
        });
        document.body.appendChild(tag);
        return tag;
    };

    klass.receiveData = function (version, url, data) {
        var callbacks = findCallbacks(url);
        runCallbacks(callbacks, data);
        if (callbacks) { 
            callbacks[url] = null;
        }
    };

    return klass;
}();
