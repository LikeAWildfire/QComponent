/**
 * Created by ravenor on 29.06.16.
 */
var Base = require('../Base');
var assert = require('chai').assert;

var QObject = Base.QObject;
var Component = Base.Component;
var EventManager = Base.EventManager;

function TestComponent(cname, cfg) {
    Component.apply(this, arguments);

    this._comp1 = new Component('comp1');
    this._comp2 = new Component('comp2');

    this._eventManager.registerComponent('comp1', this._comp1);
    this._eventManager.registerComponent('comp2', this._comp2);

    this._eventManager.createSimplePipe(
        {component: this.cname, property: "testSourceProp"},
        {component: "comp1", property: "testProp"}
    );

    this._eventManager.createSimplePipe(
        {component: "comp1", property: "testProp"},
        {component: this.cname, property: "testTargetProp"}
    );

    this._eventManager.createSimplePipe(
        {component: "comp2", property: "testProp"},
        {component: this.cname, property: "testTargetProp"}
    );
}
TestComponent.prototype = new Component();
TestComponent.constructor = TestComponent;

describe("Complex Components functionality", function () {
    it("should pipe internal components", function () {
        var tcomp = new TestComponent("test");

        tcomp.set('testTargetProp', 10);
        assert.equal(tcomp.get("testTargetProp"), 10);

        tcomp.set('testSourceProp', 20);
        assert.equal(tcomp.get("testTargetProp"), 20);
    });

    it("should not pipe external component to internal components", function () {
        var tcomp = new TestComponent("test");
        var tcomp2 = new TestComponent("test");

        tcomp.set('testSourceProp', 20);
        assert.equal(tcomp.get("testTargetProp"), 20);
        tcomp2.set('testSourceProp', 20);
        assert.equal(tcomp2.get("testTargetProp"), 20);

        tcomp.set('testSourceProp', 30);
        assert.equal(tcomp.get("testTargetProp"), 30);
        assert.equal(tcomp2.get("testTargetProp"), 20);
    });
});