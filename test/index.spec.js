const { assert } = require('chai');
const env        = require('./../src');

describe('env', function () {

    it('test', () => {
        env.set('t.as', 1);
        console.log(env, process.env.NODE_ENV, env.NODE_ENV/*, process.env*/);
    });

});