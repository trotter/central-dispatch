Screw.Unit(function() {
    describe("Screw.Stub", function() {
        var obj;

        before(function() {
            obj = {};
        });

        describe(".stub", function() {
            it("returns null for stubbed methods", function() {
                Screw.Stub.stub(obj, "pizza");
                expect(obj.pizza()).to(equal, null);
            });
            
            it("accepts a return value", function() {
                var ret = "hello";
                Screw.Stub.stub(obj, "pizza").andReturn(ret);
                expect(obj.pizza()).to(equal, ret);
            });

            it("stubs over stubs", function() {
                Screw.Stub.stub(obj, "pizza").andReturn("cheese");
                Screw.Stub.stub(obj, "pizza").andReturn("sausage");
                expect(obj.pizza()).to(equal, "sausage");
            });

            it("resets stubs", function() {
                obj = (function() {
                  self = {};
                  var private = 'hello';
                  self.pizza = function() { return private; };
                  return self;
                })();
                var expected = obj.pizza();

                Screw.Stub.stub(obj, "pizza");
                Screw.Stub.reset();
                expect(obj.pizza()).to(equal, expected);
            });
        });

        describe(".shouldReceive", function() {
            it("returns null if given no return value", function() {
                Screw.Stub.shouldReceive(obj, "pizza");
                expect(obj.pizza()).to(equal, null);
            });

            it("accepts a return value", function() {
                Screw.Stub.shouldReceive(obj, "pizza").andReturn("hey");
                expect(obj.pizza()).to(equal, "hey");
            });

            it("expects to be called once", function() {
                Screw.Stub.shouldReceive(obj, "pizza");
                expect(obj.pizza.validate).to(raise);
            });

            it("should be told to expect N calls", function() {
                Screw.Stub.shouldReceive(obj, "pizza").numberOfTimes(0);
                obj.pizza();
                expect(obj.pizza.validate).to(raise, 'expected "pizza" to be called 0 times, but it was called 1 times.');
            });

            it("should only match specified arguments if requested", function() {
                obj.pizza = function() { return "gross" };
                Screw.Stub.shouldReceive(obj, "pizza").withArguments("cheese").andReturn("yummy");
                expect(obj.pizza()).to(equal, "gross");
                expect(obj.pizza("cheese")).to(equal, "yummy");
                expect(obj.pizza.validate).to_not(raise);
            });

            it("should only validate once", function() {
                Screw.Stub.shouldReceive(obj, "pizza");
                expect(obj.pizza.validate).to(raise);
                expect(obj.pizza.validate).to_not(raise);
            });

            it("resets", function() {
                obj = (function() {
                  self = {};
                  var private = 'hello';
                  self.pizza = function() { return private; };
                  return self;
                })();
                var expected = obj.pizza();

                Screw.Stub.shouldReceive(obj, "pizza");
                Screw.Stub.reset();
                expect(obj.pizza()).to(equal, expected);
            });
        });
    });
});
