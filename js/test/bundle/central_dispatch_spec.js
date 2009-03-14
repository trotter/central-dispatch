Screw.Unit(function() {
    describe('CentralDispatch', function() {
        describe('requesting data from a url', function() {
            it('should write a script tag', function() {
                var url = 'http://test.host/';
                CentralDispatch.requestData(url, function() {});
                expect(document.body.lastChild.src).to(equal, url);
            });
        });

        describe('registered to receive data from http://test.host/test.js', function() {
            var callback, requestedUrl, storedData;

            before(function() {
                callback = function(data) { storedData = data; };
                requestedUrl = 'http://test.host/test.js';
                CentralDispatch.requestData(requestedUrl, callback);
            });

            it('should callback when receiving data for http://test.host/test.js', function() {
                var url = 'http://test.host/test.js';
                var data = {hello: 'bob'};
                CentralDispatch.receiveData(url, data);
                expect(storedData).to(equal, data);
            });

            it('should only callback once', function() {
                var url = 'http://test.host/test.js';
                var data = {hello: 'bob'};
                var data2 = {time: 'to eat'};
                CentralDispatch.receiveData(url, data);
                CentralDispatch.receiveData(url, data2);
                expect(storedData).to(equal, data);
            });

            it('should callback when receiving data for test.host/test.js', function() {
                pending();
            });

            it('should callback when receiving data for test.js', function() {
                pending();
            });
        });

        describe('registered twice to receive data from the same place', function() {
            it('should call the callback twice', function() {
                pending();
            });
        });

        describe('registered to receive data from two different places', function() {
            it('should call the correct callback', function() {
                pending();
            });
        });

        describe('registered to receive data with a timeout', function() {
            it('should receive data before the timeout', function() {
                pending();
            });

            it('should not receive data after the timeout', function() {
                pending();
            });
        });
    });
});
