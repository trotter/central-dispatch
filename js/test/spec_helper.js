Screw.Matchers.include = {
    match: function (expected, actual) {
        var i;
        for (i = 0; i < actual.length; i++) {
            if (actual[i] === expected) { 
                return true;
            }
        }
        return false;
    },

    failure_message: function (expected, actual, not) {
        var ending = (not ? ' to not include ' : ' to include ') + $.print(actual);
        return 'expected ' + $.print(actual) + ending;
    }
}
