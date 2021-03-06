﻿BASE.require([
		"jQuery",
        "Date.prototype.format"
], function () {
    var Future = BASE.async.Future;
    BASE.namespace("components.gem.inputs");

    var defaultValidateAsync = function () {
        return Future.fromResult();
    };
    var defaultMap = function (value) {
        return value;
    };

    components.gem.inputs.Textarea = function (elem, tags, scope) {
        var self = this;
        var $elem = $(elem);
        var $label = $(tags["label"]);
        var $input = $(tags["input"]);
        var $error = $(tags["error-message"]);
        var config = null;
        var map = defaultMap;
        var validateAsync = defaultValidateAsync;
        var value = null;
        var property = null;
        var Type = null;
        var entity = null;
        var displayService = null;
        var propertyName = null;

        var setValue = function (value) {
            $input.val(value);
        };

        var setLabel = function (label) {
            $label.text(label);
        };

        self.focus = function () {
            $input.focus();
            return $input.select();
        };

        self.getValue = function () {
           var value = $input.val();
            if (value === "") {
                value = null;
            }
            return map(value);
        };

        self.setConfig = function (config) {
            entity = config.entity;
            Type = config.Type;
            displayService = config.displayService;
            propertyName = config.propertyName;
            value = entity[propertyName];

            if (config.readOnly) {
                $input.prop("disabled", true);
            }

            setValue(value);
            setLabel(config.label());
        };

        self.saveAsync = function () {
            entity[propertyName] = self.getValue();
        };

        self.validateAsync = function () {
            return validateAsync(self.getValue()).catch(function (error) {
                $error.text(error.message);
            });
        };
    };
});