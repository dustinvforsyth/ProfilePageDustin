BASE.require(["jQuery"], function () {
    var Future = BASE.async.Future;

    BASE.namespace("components.gem.forms");

    components.gem.forms.InputForm = function (elem, tags, services) {
        var self = this;
        var $elem = $(elem);
        var inputs = null;
        var $container = $(tags["container"]);
        var inputHash = {};

        var getComponentControllersByName = function () {
            return $container.children("[component]").toArray().reduce(function (hash, element) {
                var $element = $(element);
                var name = $element.attr("input-name");

                hash[name] = $(element).controller();
                return hash;
            }, {});
        };

        self.getInputs = function () {
            return inputHash = getComponentControllersByName();
        };

        self.setConfigAsync = function (config) {
            var inputData = config.typeDisplay.mainInputs.filter(function (mainInput) {
                return config.hiddenInputs.indexOf(mainInput.name) === -1;
            }).map(function (mainInput) {
                return {
                    controller: inputHash[mainInput.name],
                    input: mainInput
                };
            });

            inputData.forEach(function (inputDatum) {
                var controller = inputDatum.controller;
                mainInput = inputDatum.input;
                mainInput.displayService = config.displayService;
                mainInput.Type = config.Type;
                mainInput.entity = config.entity;

                controller.setConfig(mainInput);
            });

            return Future.fromResult();
        };

        self.saveAsync = function () {
            var controllers = inputHash;

            var futures = Object.keys(controllers).map(function (key) {
                var controller = controllers[key];
                return controller.saveAsync();
            });

            return Future.all(futures);
        };

        self.validateAsync = function () {
            var controllers = inputHash;

            var futures = Object.keys(controllers).map(function (key) {
                var controller = controllers[key];
                return controller.validateAsync();
            });

            return Future.all(futures);
        };

        inputHash = getComponentControllersByName();
    };
});