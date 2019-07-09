const os = require('os');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const { object } = require('@core/tools');

const comments = [';', '#', '//'];
const separator = '=';

const _create = Symbol('_create');
const _env = Symbol('_env');
const _enrich = Symbol('_enrich');
const _validate = Symbol('_validate');
const _template = Symbol('_template');

const validation = {

    string(value, ctx) {
        return ctx[_template](String(value));
    },

    number(value) {
        return parseFloat(value) || 0;
    },

    boolean(value) {
        return value === 'true' || value === '1';
    },

    regexp(value) {
        return RegExp(value.slice(1).slice(0, -1));
    },

    json(value) {
        return JSON.parse(value);
    },

    symbol(value) {
        return Symbol(value);
    },

    null(value) {
        return null;
    },

    NaN(value) {
        return NaN;
    },

    undefined(value) {
        return undefined;
    },

    Infinity(value) {
        return value >= 0 ? Infinity : -Infinity;
    },

    file(value) {
        return fs.readFileSync(path.normalize(path.join(process.cwd(), value)));
    },

    ['file-utf8'](value) {
        return this.file(value).toString('utf8');
    },

};

const check = RegExp(`^\\(${Object.keys(validation).join('\\)|\\(')}\\)`);

class Env {

    [_validate](value) {
        let type;
        if (!value)
            return value;
        if (value.startsWith('!'))
            return value.slice(1);
        value = this[_template](value);
        if (!check.test(value))
            return value;
        type = value.match(check)[0];
        value = value.replace(type, '');
        type = type.slice(1).slice(0, -1);
        return validation[type](value, this);
    }

    [_template](value) {
        let res, result,
            regExp = /\${([^}{]+)+?}/g;
        result = value;
        while (res = regExp.exec(value))
            result = result.replace(res[0], _.get(this, res[1]));
        return result;
    }

    [_enrich](env) {
        for (let field in env)
            process.env[field] = env[field];
        return env;
    }

    [_env]() {
        let env, lines, path, value,
            result = {};
        try {
            env = fs.readFileSync(`${process.cwd()}/.env`, 'utf8');
            console.warn(`WARNING! [.env] file is used, use it in you local environment only!`);
        } catch (e) {
            return false;
        }
        lines = env.split(os.EOL);
        f1:for (let line of lines) {
            for (let comment of comments)
                if (line.startsWith(comment))
                    continue f1;
            [path, ...value] = line.split(separator);
            value = value.join('=');
            result[path] = value;
        }
        return result;
    }

    [_create]() {
        let path,
            env = this[_env]();
            env = env ? this[_enrich](env) : object.ksort(process.env);
        for (let field in env) {
            if (!field)
                continue;
            env[field] = this[_validate](env[field]);
            path = field.split('_').join('.');
            _.set(this, path, env[field]);
        }
        return new Proxy(this, {
            get(ctx, field, ...args) {
                if (Reflect.has(ctx, field, ...args))
                    return Reflect.get(ctx, field, ...args);
                return Reflect.get(process.env, field, ...args)
            }
        });
    }

    set(path, value) {
        _.set(this, path, value);
        process.env[path.split('.').join('_')] = value;
    }

}

module.exports = new Env()[_create]();