/**
 * Created by zibx on 01.08.16.
 */
module.exports = (function () {
    'use strict';
    /**
     * Factory of factories of properties
     */
    //var QObject = require('./QObject');
    var ObservableSequence = require('observable-sequence');
    var dequeue = require('z-lib-structure-dequeue');

    var dataTypes = {
        Boolean: {
            set: function (key, value, old, e) {
                if ((value !== !!value) && (value !== 'true' && value !== 'false'))
                    e.cancel();
            },
            get: function (key, value) {
                return value;
            }
        },
        Number: {
            set: function () {

            },
            get: function (key, value) {
                return value;
            }
        },
        Variant: {
            set: function () {

            },
            get: function (key, value) {
                return value;
            }
        },
        Array: {
            set: function (key, value, old, e) {
                var val = value;
                if (!(value instanceof ObservableSequence)) {
                    value = new ObservableSequence(new dequeue());
                    val.forEach(function (v) {
                        value.push(v);
                    });
                    e.value(val);
                }
            },
            get: function (key, value) {
                return value;
            }
        },
        Function: {
            set: function (key, value, old, e) {
                this[key] = value;
                e.cancel();
            },
            get: function (key, value) {
                return this[key];
            }
        }
    };

    var SetterFlags = function () { };
    SetterFlags.prototype = {
        canceled: false,
        valueSetted: false,
        _value: null,
        value: function (val) {
            this._value = val;
            this.valueSetted = true;
        },
        cancel: function () {
            this.canceled = true;
        }
    };

    /**
     * 
     * @param type
     * @param metadata
     * @param cfg
     * @param defaultValue
     */
    var Property = function (type, metadata, cfg, defaultValue) {
        this.metadata = metadata = metadata || {};
        cfg = cfg || {};

        if ('set' in metadata || 'get' in metadata)
            throw new Error('do not put get/set to metadata');

        var dataType = dataTypes[type];

        /** if type is in known classes */
        //if (!dataType && QObject._knownComponents[type])
        //    dataType = dataTypes[type] = Property.generate.typed(type, QObject._knownComponents[type]);

        if (!dataType)
            dataType = dataTypes.Variant;

        this.proxyFor = metadata.proxyFor = cfg.proxyFor;
        this.type = metadata.type = type;

        if (arguments.length > 3) {
            this.setDefault = true;
            metadata.defaultValue = defaultValue;
        } else {
            this.setDefault = false;
        }

        if (!('set' in cfg) && !('get' in cfg)) {
            this._set = dataType.set;
            this._get = dataType.get;
        } else {
            this._set = cfg.set;
            this._get = cfg.get;
        }
    };

    Property.prototype = {
        /**
         * 
         * @param {} parent 
         * @param {} key 
         * @param {} value 
         * @returns {} 
         */
        init: function (parent, key, value) {
            if (!parent._prop.__proxy)
                parent._prop.__proxy = {};

            this.parent = parent;
            this.key = key;
            this.firstSet = true;

            if (this.proxyFor) {
                if (!parent._prop.__proxy[this.proxyFor])
                    parent._prop.__proxy[this.proxyFor] = [];
                parent._prop.__proxy[this.proxyFor].push(key);
            }

            if (arguments.length > 2) {
                this.parent._data[key] = value;
            } else if (this.metadata.defaultValue) {
                this.parent._data[key] = this.metadata.defaultValue;
            }

            return this;
        },
        /**
         * 
         * @param {} value 
         * @returns {} 
         */
        set: function (value) {
            var key = this.proxyFor || this.key,
                oldValue = this.parent._data[key],
                proxy = this.parent._prop.__proxy[key],
                prop = this.parent._prop[this.proxyFor] || this,
                flags;


            if ((value !== oldValue) || this.firstSet) {
                this.firstSet = false;
                flags = new SetterFlags();
                this.parent._data[key] = value;
                prop._set.call(this.parent, key, value, oldValue, flags);
                if (!flags.canceled) {
                    if (flags.valueSetted)
                        value = this.parent._data[key] = flags._value;
                    if (value !== oldValue) {
                        this.parent._onPropertyChanged(this.parent, [key], value, oldValue);
                        if (proxy) {
                            for (var i = 0; i < proxy.length; i++) {
                                this.parent._onPropertyChanged(this.parent, [proxy[i]], value, oldValue);
                            }

                        }
                        return true;
                    }
                }
            } else {
                return false;
            }

            this.parent._data[key] = oldValue;
            return false;
        },
        /**
         * 
         * @returns {} 
         */
        get: function () {
            var key = this.proxyFor || this.key;
            return this._get.call(this.parent, key, this.parent._data[key]);
        }
    };

    /**
     * 
     * @param {} name 
     * @param {} cfg 
     * @returns {} 
     */
    Property.defineType = function (name, cfg) {
        dataTypes[name] = cfg;
    };



    /**
     * 
     */
    Property.generate = {
        proxy: function (proxyFor) {
            return new Property('Variant', { description: 'Proxy for ' + proxyFor + ' property' }, { proxyFor: proxyFor });
        },
        typed: function (name, cls) {
            return {
                set: function (key, value, old, e) {
                    if (!(value instanceof cls || (value && value.prototype && value.prototype instanceof cls)))
                        return e.cancel();
                },
                get: function (key, value) {
                    return value;
                }
            };
        },
        cssProperty: function (text) {
            return new Property('String',
                { description: text },
                {
                    set: function (key, val) {
                        if (val) {
                            this.el.style[key] = val;
                        } else {
                            this.el.style.removeProperty(key);
                        }
                    },
                    get: function (key, value) {
                        return value;
                    }
                }
            );
        },
        attributeProperty: function (attr) {
            return new Property('String',
                { description: attr },
                {
                    set: function (key, val) {
                        if (!val) {
                            this.el.removeAttribute(attr);
                            delete this.el[attr];
                        } else {
                            this.el.setAttribute(attr, val);
                            this.el[attr] = val;
                        }

                        this.el[attr] = val;
                    },
                    get: function (key, value) {
                        return value;
                    }
                }
            );
        }
    };

    Property.defaultGetter = dataTypes.Variant.get;
    Property.defaultSetter = function (name, value) { };

    return Property;
})();