/**
 * Created by ravenor on 13.07.16.
 */

var Primitive = require('./Primitives');
var UIComponent = require('../UIComponent');
var Property = require('../../Property');
var InputField = require('./InputField');

module.exports = InputField.extend('MaskedInput', {
    _sChars: {
        'd': /[0-9]/,
        'c': /[a-z ]/,
        'C': /[A-Z ]/,
        'i': /[a-zA-Z ]/,
        '*': /./
    },
    _unmask: function (str, selRange) {
        if (!str) return '';

        selRange = selRange || { selStart: 0, selEnd: 0 };

        var beforeSelStart = 0;
        var beforeSelEnd = 0;

        var newStr = '';

        var mask = this._data.mask;
        if (!mask) return str;
        for (var i = 0; i < mask.length; i++) {
            if (!this._sChars[mask[i]]) {
                //str = str.replace(mask[i], '');
                newStr += '';// mask[i];
                // fix selection

                if (i < selRange.selStart) {
                    beforeSelStart += 1;
                    beforeSelEnd += 1;
                } else if (i < selRange.selEnd) {
                    beforeSelEnd += 1;
                }

            } else {
                newStr += str[i] ? str[i] : '';
            }
        }

        selRange.selStart -= beforeSelStart;
        selRange.selEnd -= beforeSelEnd;

        return newStr;
    },
    _enmask: function (str, selRange) {
        selRange = selRange || { selStart: 0, selEnd: 0 };
        var mask = this._data.mask;
        if (!mask) return str;

        var beforeSelStart = 0;
        var beforeSelEnd = 0;

        var count = 0;
        var ret = '';
        for (var i = 0; i < mask.length; i++) {
            if (!str[i - count]) break;

            if (!this._sChars[mask[i]]) {
                ret += mask[i];
                count++;


                if (i <= selRange.selStart) {
                    selRange.selStart += 1;
                    selRange.selEnd += 1;
                } else if (i <= selRange.selEnd) {
                    selRange.selEnd += 1;
                }


            } else {
                if (this._sChars[mask[i]].test(str[i - count])) {
                    ret += str[i - count];
                } else {
                    count--;
                    //fix selection

                    if (i < selRange.selStart) {
                        beforeSelStart -= 1;
                        beforeSelEnd -= 1;
                    } else if (i < selRange.selEnd) {
                        beforeSelEnd -= 1;
                    }

                }
            }
        }

        selRange.selStart -= beforeSelStart;
        selRange.selEnd -= beforeSelEnd;

        return ret;
    },
    _startChange: function (newVal, selRange) {
        var umasked = this._unmask(newVal, selRange);
        this.set('value', umasked);
        return selRange;
    },
    _updateValue: function (newVal, selRange) {
        var masked = this._enmask(newVal, selRange);
        this.set('value', masked);
        this.set('pureText', masked);
        return selRange;
    },
    _prop: {
        pureText: new Property('String', {}, {
            get: Property.defaultGetter,
            set: function (name, value, oldValue, e) {
                e.value(this._unmask(value));
            }
        }, ''),
        maskedText: Property.generate.proxy('value'),
        mask: new Property('String')
    }
});