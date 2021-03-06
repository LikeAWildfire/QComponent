/**
 * Created by ravenor on 13.07.16.
 */

var Primitive = require('./Primitives');
var UIComponent = require('../UIComponent');
var Property = require('../../Property');


module.exports = UIComponent.extend('Checkbox', {
    createEl: function () {
        var self = this;
        this.el = UIComponent.document.createElement('span');
        var labelEl = UIComponent.document.createElement('label');
        var inputEl = UIComponent.document.createElement('input');
        inputEl.setAttribute('type', 'checkbox');

        this.el.appendChild(inputEl);
        this.el.appendChild(labelEl);

        this.label = labelEl;
        this.input = inputEl;

        this.el.addEventListener('click', function (event) {
            var checked = self.get('checked');
            if (checked) {
                self.set('checked', false);
                self.fire('unchecked', this);
            } else {
                self.set('checked', true);
                self.fire('checked', this);
            }
        });
    },
    _prop: {
        checked: new Property('Boolean', {},
            {
                get: Property.defaultGetter,
                set: function (name, value, oldValue, e) {
                    this.input.checked = value;
                }
            }, false),
        caption: new Property('String', { description: 'Text near the checkbox' },
            {
                get: Property.defaultGetter,
                set: function (name, value, oldValue, e) {
                    this.label.innerHTML = value;
                }
            }, ''),
        value: Property.generate.proxy('checked')
    },
    simlink: {

    }
});