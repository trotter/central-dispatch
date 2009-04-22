/*extern Screw, CentralDispatch, describe, it,
         expect, equal, before, include */
Screw.Unit(function () {
    describe('CentralDispatch', function () {
        describe('requesting data from a url', function () {
            it('should write a script tag', function () {
                var url = 'http://test.host/';
                CentralDispatch.requestData(url, function () {});
                expect(document.body.lastChild.src).to(equal, url);
            });
        });

        describe('request data from a central dispatch jsonp url', function () {
            it('should write a script tag', function () {
                var url = 'http://test.host/';
                CentralDispatch.requestData(url, function () {}, { jsonp: 'CentralDispatch' });
                expect(document.body.lastChild.src).to(equal, url + "?CentralDispatch.receiveData");
            });
        });

        describe('registered to receive data from http://test.host/test.js', function () {
            var callback, requestedUrl, storedData, request, element;

            before(function () {
                storedData = null;
                callback = function (data) {
                    storedData = data;
                };
                requestedUrl = 'http://test.host/test.js';
                request = CentralDispatch.requestData(requestedUrl, callback);
                element = request.element;
            });

            it('should callback when receiving data for http://test.host/test.js', function () {
                var url, data;
                url = 'http://test.host/test.js';
                data = {hello: 'bob'};
                CentralDispatch.receiveData('v1', url, data);
                expect(storedData).to(equal, data);
            });

            it('should only callback once', function () {
                var url, data, data2;
                url = 'http://test.host/test.js';
                data = {hello: 'bob'};
                data2 = {time: 'to eat'};
                CentralDispatch.receiveData('v1', url, data);
                CentralDispatch.receiveData('v1', url, data2);
                expect(storedData).to(equal, data);
            });

            it('should garbage collect the script tag', function () {
                CentralDispatch.receiveData('v1', requestedUrl, null);
                expect(document.body.childNodes).to_not(include, element);
            });

            it('should callback when receiving data for test.host/test.js', function () {
                var url, data;
                url = 'test.host/test.js';
                data = {hello: 'bob'};
                CentralDispatch.receiveData('v1', url, data);
                expect(storedData).to(equal, data);
            });

            it('should callback when receiving data for test.js', function () {
                var url, data;
                url = 'test.js';
                data = {hello: 'bob'};
                CentralDispatch.receiveData('v1', url, data);
                expect(storedData).to(equal, data);
            });
            
            it('should cleanup on timeout', function () {
                request.timeout();
                expect(document.body.childNodes).to_not(include, element);
            });

            it('should cleanup on error', function () {
                element.onerror();
                expect(document.body.childNodes).to_not(include, element);
            });
        });

        describe('registered twice to receive data from the same place', function () {
            var callback, requestedUrl, storedData;

            before(function () {
                storedData = 0;
                callback = function (data) {
                    storedData += 1;
                };
                requestedUrl = 'http://test.host/test.js';
                CentralDispatch.requestData(requestedUrl, callback);
                CentralDispatch.requestData(requestedUrl, callback);
            });

            it('should call the callback twice', function () {
                CentralDispatch.receiveData('v1', requestedUrl, null);
                expect(storedData).to(equal, 2);
            });
        });

        describe('registered to receive data from two different places', function () {
            var storedData, goodCallback, badCallback, goodUrl, badUrl;

            before(function () {
                storedData = null;
                goodCallback = function (data) {
                    storedData = 'good';
                };
                badCallback = function (data) {
                    storedData = 'bad';
                };
                goodUrl = 'http://test.host/test.js';
                badUrl = 'http://good.host/test.js';
                CentralDispatch.requestData(goodUrl, goodCallback);
                CentralDispatch.requestData(badUrl, badCallback);
            });

            it('should call the correct callback', function () {
                CentralDispatch.receiveData('v1', goodUrl, 'data');
                expect(storedData).to(equal, 'good');
            });
        });

        describe('registered to receive an error callback', function () {
            var errorCallback, requestedUrl, storedData, callback, element, request;

            before(function () {
                storedData = null;
                callback = function (data) {
                    storedData = data;
                };
                errorCallback = function (error) {
                    storedData = 'error';
                };
                requestedUrl = 'http://test.host/test.js';
                request = CentralDispatch.requestData(requestedUrl, { onSuccess: callback, onError: errorCallback });
                element = request.element;
            });

            it('should call the error callback', function () {
                element.onerror();
                expect(storedData).to(equal, 'error');
            });

            it('should prevent the data callback from firing', function () {
                element.onerror();
                CentralDispatch.receiveData('v1', requestedUrl, 'pizza');
                expect(storedData).to(equal, 'error');
            });

            it('should prevent the timeout from firing', function () {
                Screw.Stub.shouldReceive(window, 'clearTimeout');
                element.onerror();
                request.timeout();
                expect(storedData).to(equal, 'error');
            });

            it('should garbage collect', function () {
                element.onerror();
                expect(document.body.childNodes).to_not(include, element);
            });
        });

        describe('not registered to receive data', function () {
            it('should silently ignore incoming data', function () {
                CentralDispatch.receiveData('v1', 'nonexistant/url', 'data');
            });
        });

        describe('registered to receive a timeout callback', function () {
            var timeoutCallback, url, storedData, successCallback, errorCallback, request;

            before(function () {
                storedData = null;
                successCallback = function (data) {
                    storedData = data;
                };
                timeoutCallback = function (data) {
                    storedData = data;
                };
                errorCallback = function () {
                    storedData = 'error';
                };
                url = 'http://test.host/test.js';
                request = CentralDispatch.requestData(url, { onSuccess: successCallback, onTimeout: timeoutCallback, onError: errorCallback });
            });

            it('should pass request to timeout function', function () {
                request.timeout();
                expect(storedData).to(equal, request);
            });

            it('should garbage collect', function () {
                var element = request.element;
                request.timeout();
                expect(document.body.childNodes).to_not(include, element);
            });

            it('should prevent the data callback from firing', function () {
                request.timeout();
                CentralDispatch.receiveData('v1', url, 'pizza');
                expect(storedData).to(equal, request);
            });

            it('should prevent the error callback from firing', function () {
                var element = request.element;
                request.timeout();
                element.onerror();
                expect(storedData).to(equal, request);
            });

            it('should not call if callback has run', function () {
                Screw.Stub.shouldReceive(window, 'clearTimeout');
                CentralDispatch.receiveData('v1', url, 'pizza');
                request.timeout();
                expect(storedData).to(equal, 'pizza');
            });
        });
    });
});
