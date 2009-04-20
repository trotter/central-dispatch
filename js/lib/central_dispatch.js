var CentralDispatch = function () {
    var klass = {},
        callbacks = {},
        addCallback, findCallbacks, runCallbacks,
        makeRequest, RequestMap;

    makeRequest = function (url, callback, options) {
        var self = {}, tag, executed = false;
        options = options || {};

        self.callback = function (data) { 
            callback(data); 
            if (self.tag && !executed) {
                document.body.removeChild(self.tag); 
                self.tag = null; 
            }
            executed = true;
        };

        self.url = url;
        
        self.tag = function () {
            var tag;
            tag = document.createElement('script');
            tag.src = url;
            tag.onerror = function () { 
                if (options.onError) {
                    options.onError();
                }
                if (tag && !executed) {
                    document.body.removeChild(tag);
                    RequestMap.remove(self);
                    tag = null;
                }
                executed = true;
            };
            return tag;
        }();

        self.addToDom = function () {
            document.body.appendChild(self.tag);
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
                current.callback(data); 
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

    klass.requestData = function (url, callback, options) {
        var request = makeRequest(url, callback, options);
        request.addToDom();
        return request.tag;
    };

    klass.receiveData = function (version, url, data) {
        RequestMap.runAllFor(url, data);
    };

    return klass;
}();
