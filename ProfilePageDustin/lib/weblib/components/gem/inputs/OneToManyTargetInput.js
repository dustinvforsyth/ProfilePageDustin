BASE.require([
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

    components.gem.inputs.OneToManyTargetInput = function (elem, tags, services) {
        var self = this;
        var $elem = $(elem);
        var $label = $(tags["label"]);
        var $input = $(tags["input"]);
        var $change = $(tags["change"]);
        var $error = $(tags["error-message"]);
        var map = defaultMap;
        var validateAsync = defaultValidateAsync;
        var Type = null;
        var value = null;
        var entity = null;
        var displayService = null;
        var parentTypeDisplay = null;
        var propertyName = null;
        var selectorFuture = null;
        var relationship = null;
        var service = null;
        var currentConfig = null;

        var getSelectorModal = function () {
            if (selectorFuture == null) {
                return selectorFuture = services.get("windowService").createModalAsync({
                    componentName: "gem-one-to-many-target-form",
                    height: 400,
                    width: 600
                })
            }

            return selectorFuture;
        };

        var setValue = function () {
            var parentId = entity[relationship.withForeignKey];
            if (parentId == null) {
                $input.val("(None)");
            } else {
                $input.val("Loading...");
                service.asQueryable(relationship.type).where(function (expBuilder) {
                    return expBuilder.property(relationship.hasKey).isEqualTo(parentId);
                }).firstOrDefault().then(function (parentEntity) {
                    if (parentEntity == null) {
                        $input.val("(None)");
                        return;
                    }
                    $input.val(parentTypeDisplay.displayInstance(parentEntity));
                    value = parentEntity;
                });
            }
        };

        var setLabel = function (label) {
            $label.text(label);
        };

        var showSelectorAsync = function () {
            return getSelectorModal().chain(function (windowManager) {
                var future = windowManager.controller.setConfigAsync(currentConfig);
                windowManager.window.showAsync().try();
                return future;
            }).chain(function (newValue) {
                value = newValue;
                $input.val(parentTypeDisplay.displayInstance(value));
            });
        };

        self.focus = function () {
            return $input.focus();
        };

        self.getValue = function () {
            return value;
        };

        self.setConfig = function (config) {
            currentConfig = config;
            entity = config.entity;
            propertyName = config.propertyName;
            relationship = config.relationship;
            service = config.displayService.service;
            parentTypeDisplay = config.displayService.getDisplayByType(relationship.type);

            setValue();
            setLabel(config.label());
        };

        self.saveAsync = function () {
            var value = self.getValue();
            if (value[relationship.hasKey] != entity[relationship.withForeignKey]) {
                entity[propertyName] = self.getValue();
            }
        };

        self.validateAsync = function () {
            return validateAsync(self.getValue()).catch(function (error) {
                $error.text(error.message);
            });
        };

        $change.on("click", function () {
            showSelectorAsync().try();
        });

        $input.on("click", function () {
            showSelectorAsync().try();
            return false;
        });
    };
});