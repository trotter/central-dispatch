Screw.Stub = (function() {
    var self = {};
    var stubbedObjects = [];

    var base = function(obj, name, private) {
        private = private || {};
        var self = {};

        private.returnVal = null;
        private.functionWasCalled = function() {};

        self = function() {
            private.functionWasCalled();
            return private.returnVal;
        };

        self.andReturn = function(val) {
            private.returnVal = val;
            return self.public;
        };

        self.validate = function() {
            return true;
        };

        self.accepts = function() { 
            return true;
        }

        obj[name].stubs.push(self);
        return self;
    };

    var shouldReceive = function(obj, name) {
        var private = {};
        var self = base(obj, name, private);

        private.expectedCallCount = 1;
        private.actualCallCount = 0;
        private.validated = false;
        private.expectedArguments;

        private.functionWasCalled = function() {
            private.actualCallCount += 1;
        };

        self.numberOfTimes = function(count) {
            private.expectedCallCount = count;
            return self;
        };

        self.withArguments = function() {
            private.expectedArguments = arguments;
            return self;
        };

        self.accepts = function(args) {
            if (!private.expectedArguments) {
                return true;
            } else if (args.length !== private.expectedArguments.length) {
                return false;
            } else {
                for (var i=0; i < args.length; i++) {
                    if (args[i] !== private.expectedArguments[i]) {
                        return false;
                    }
                };
                return true;
            }
        };

        self.validate = function() {
            if (!private.validated && private.expectedCallCount !== private.actualCallCount) {
                private.validated = true;
                throw('expected ' + $.print(name) + ' to be called ' + 
                      private.expectedCallCount.toString() + 
                      ' times, but it was called ' + 
                      private.actualCallCount.toString() + ' times.');
            }
        };

        return self;
    };

    var stub = function(obj, name) {
        var self = base(obj, name);
        return self;
    };

    var stubReceiver = function(obj, name) {
        var private = {};
        private.oldVal = obj[name];

        self = function() {
            for(var i=0; i < self.stubs.length; i++) {
                var stub = self.stubs[i];
                if (stub && stub.accepts(arguments)) {
                    return stub(arguments);
                }
            }

            if (private.oldVal.constructor === Function) {
                return private.oldVal();
            } else {
                return private.oldVal;
            }
        };

        self.validate = function() {
            for(var i=0; i < self.stubs.length; i++) {
                var stub = self.stubs[i];
                if (stub) {
                  stub.validate();
                }
            }
        }

        self.reset = function() {
            obj[name] = private.oldVal;
        };

        self.stubs = [];

        stubbedObjects.push(self);
        obj[name] = self;
    };

    self.shouldReceive = function(obj, name) {
        stubReceiver(obj, name);
        return shouldReceive(obj, name);
    }

    self.stub = function(obj, name) {
        stubReceiver(obj, name);
        return stub(obj, name);
    };

    self.validate = function() {
        for (i=0; i < stubbedObjects.length; i++) {
            var stub = stubbedObjects[i];
            if (stub) {
              stub.validate();
            }
        }
    };

    self.reset = function() {
        var stub;
        while ((stub = stubbedObjects.pop()) !== undefined) {
            stub.reset();
        }
    };

    return self;
}());

Screw.Unit(function() {
    after(function() {
        Screw.Stub.validate();
        Screw.Stub.reset();
    });
});
