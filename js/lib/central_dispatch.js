var CentralDispatch = function () {
    var klass = {},
        callbacks = {},
        addCallback, findCallbacks, runCallbacks,
        makeRequest, RequestMap;

    makeRequest = function (url, callback) {
        var self = {}, element, executed = false,
            onSuccess, onError;

        if (typeof(callback) === 'function') {
            onSuccess = callback;
        } else {
            onSuccess = callback.onSuccess;
            onError = callback.onError;
        }

        self.success = function (data) { 
            onSuccess(data); 
            if (self.element && !executed) {
                document.body.removeChild(self.element); 
                self.element = null; 
            }
            executed = true;
        };

        self.url = url;
        
        self.element = function () {
            var element;
            element = document.createElement('script');
            element.src = url;
            element.onerror = function (msg, url, line) { 
                if (onError) {
                    onError(msg, url, line);
                }
                if (element && !executed) {
                    document.body.removeChild(element);
                    RequestMap.remove(self);
                    element = null;
                }
                executed = true;
            };
            return element;
        }();

        self.addToDom = function () {
            document.body.appendChild(self.element);
        };

        RequestMap.add(self);
        return self;
    };

    RequestMap = function () {
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
                current.success(data); 
                current = matches.pop();
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

    klass.requestData = function (url, callback) {
        var request = makeRequest(url, callback);
        request.addToDom();
        return request;
    };

    klass.receiveData = function (version, url, data) {
        RequestMap.runAllFor(url, data);
    };

    klass.timeout = 60000; // 60 seconds

    return klass;
}();
