var CentralDispatch = {
    requestData: function (url, callbacks, options) {
        var request = CentralDispatch.request({url: url, callbacks: callbacks, options: options});
        request.addToDom();
        return request;
    },

    receiveData: function (version, url, data) {
        CentralDispatch.RequestMap.runAllFor(url, data);
    },

    timeout: 60000 // 60 seconds
};

CentralDispatch.request = function (spec, my) {
    var that;
    that = {};
    that.url = spec.url;
    that.requestedUrl = null;

    my = my || {};
    my.timeout = null;
    my.options = spec.options || {};

    // Private methods
    my.setCallbacks = function () {
        if (typeof(spec.callbacks) === 'function') {
            my.callbacks = { onSuccess: spec.callbacks };
        } else {
            my.callbacks = spec.callbacks || {};
        }
    };

    my.setTimeout = function () {
        if (CentralDispatch.timeout) {
            if (window) {
                my.timeout = window.setTimeout(function () {
                    that.timeout();
                }, CentralDispatch.timeout);
            }
        }
    };

    my.setElement = function () {
        var element;
        element = document.createElement('script');
        element.src = that.requestedUrl;
        element.onerror = that.error;
        that.element = element;
    };

    my.setRequestedUrl = function () {
        var url, date;
        // TODO: Make the url using a library
        url = that.url;
        if (my.options.jsonp === "CentralDispatch" || my.options.skipCache) {
            url = url + "?";
        }
        if (my.options.jsonp === "CentralDispatch") {
            url = url + "callback=CentralDispatch.receiveData";
            if (my.options.skipCache) {
                url = url + "&";
            }
        }
        if (my.options.skipCache) {
            date = new Date();
            url = url + "nocache=" + date.valueOf();
        }
        that.requestedUrl = url;
    };

    my.process = function (func) {
        if (!my.executed) {
            my.executed = true;
            my.cleanupElement();
            func();
        }
    };

    my.cleanupElement = function () {
        if (that.element) {
            document.body.removeChild(that.element); 
            that.element = null; 
        }
    };

    my.cleanupTimeout = function () {
        if (my.timeout) {
            window.clearTimeout(my.timeout);
            my.timeout = null;
        }
    };

    // Public methods
    that.success = function (data) { 
        my.process(function () {
            my.cleanupTimeout();
            if (my.callbacks.onSuccess) {
                my.callbacks.onSuccess(data); 
            }
        });
    };

    that.error = function (msg, url, line) {
        my.process(function () {
            CentralDispatch.RequestMap.remove(that);
            if (my.callbacks.onError) {
                my.cleanupTimeout();
                my.callbacks.onError(msg, url, line);
            }
        });
    };

    that.timeout = function () {
        my.process(function () {
            CentralDispatch.RequestMap.remove(that);
            if (my.callbacks.onTimeout) {
                my.callbacks.onTimeout(that);
            }
        });
    };

    that.addToDom = function () {
        document.body.appendChild(that.element);
    };

    that.isExecuted = function () {
        return my.executed;
    };

    // Init
    my.executed = false;
    my.setRequestedUrl();
    my.setCallbacks();
    my.setTimeout();
    my.setElement();
    CentralDispatch.RequestMap.add(that);

    return that;
};

CentralDispatch.RequestMap = function () {
    var klass = {}, requests = {}, findAllFor;

    findAllFor = function (url) {
        var regex, fullUrl;

        // Exit with an exact match if possible for speed
        if (requests[url]) {
            return requests[url];
        }

        // TODO: The following is innefficient in the case of many requests
        regex = new RegExp(url + '$');
        for (fullUrl in requests) {
            if (requests.hasOwnProperty(fullUrl)) {
                if (regex.test(fullUrl)) {
                    return requests[fullUrl];
                }
            }
        }
        // Incase we don't find anything
        return [];
    };

    klass.add = function (request) {
        requests[request.url] = requests[request.url] || [];
        requests[request.url].push(request);
    };

    klass.runAllFor = function (url, data) {
        var matches, current;
        matches = findAllFor(url);
        current = matches.pop();
        while (current) {
            // TODO: Should clone data so that functions don't spoil the fun for
            // others.
            try {
                current.success(data); 
                current = matches.pop();
            } catch (e) {
                // Silently ignore errors so that other callbacks will run
            }
        }
    };

    klass.remove = function (request) {
        var matches, i, match;
        matches = findAllFor(request.url);
        for (i = 0; i < matches.length; i += 1) {
            if (matches[i] === request) {
                match = i;
                break;
            }
        }

        if (match !== undefined) {
            matches.splice(match, 1);
        }
    };

    return klass;
}();

