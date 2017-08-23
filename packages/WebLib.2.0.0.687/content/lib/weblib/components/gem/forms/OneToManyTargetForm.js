BASE.require([
		"jQuery"
], function () {
    var Future = BASE.async.Future;
    var Fulfillment = BASE.async.Fulfillment;
    var vowelAndSoftSoundRegex = /[aeiouh]/ig;

    var createWindowName = function (entityDisplay) {
        if (vowelAndSoftSoundRegex.test(entityDisplay.charAt(0))) {
            return "Select an " + entityDisplay;
        } else {
            return "Select a " + entityDisplay;
        }
    };

    BASE.namespace("components.gem.forms");

    components.gem.forms.OneToManyTargetForm = function (elem, tags, scope) {
        var self = this;
        var $elem = $(elem);
        var $cancel = $(tags["cancel"]);
        var $search = $(tags["search"]);
        var $table = $(tags["table"]);
        var table = $table.controller();
        var window = null;
        var fulfillment = null;
        var value = null;
        var delegate = null;
        var orderBy = null;

        var search = function (orderByAsc, orderByDesc) {
            var search = $search.val();
            return table.setQueryableAsync(delegate.search(search, orderByAsc, orderByDesc)).try();
        };

        self.setConfigAsync = function (config) {

            var displayService = config.displayService;
            var Type = config.relationship.type;
            var typeDisplay = displayService.getDisplayByType(Type);
            var edm = displayService.service.getEdm();
            var keys = edm.getPrimaryKeyProperties(Type).concat(edm.getAllKeyProperties(Type));
            var properties = typeDisplay.listProperties.reduce(function (properties, property) {
                var propertyName = property.propertyName;

                if (keys.indexOf(propertyName) > -1) {
                    return properties;
                }

                properties[propertyName] = property;

                return properties;
            }, {});

            delegate = {
                search: function () {
                    return typeDisplay.search.apply(typeDisplay, arguments);
                },
                getPropertyLabel: function (propertyName) {
                    return properties[propertyName].label();
                },
                getPropertyWidth: function (propertyName) {
                    return properties[propertyName].width;
                },
                getPropertyDisplay: function (entity, propertyName) {
                    return properties[propertyName].display(entity[propertyName]);
                },
                getPropertyNames: function () {
                    return Object.keys(properties);
                },
                getPrimaryKeyPropertyName: function () {
                    return displayService.edm.getPrimaryKeyProperties(Type)[0];
                }
            };

            window.setName(createWindowName(config.label()));
            table.setDelegate(delegate);

            self.searchAsync().try();

            fulfillment = new Fulfillment();
            return fulfillment;
        };

        self.searchAsync = function (text) {
            if (!text) {
                text = $search.val();
            } else {
                $search.val(text);
            }

            return table.setQueryableAsync(delegate.search(text, table.getOrderAscendingColumns(), table.getOrderDescendingColumns()));
        };

        self.init = function (windowManager) {
            window = windowManager;
        };

        $table.on("selectionChange", function () {
            value = table.getSelectedItems().getValues()[0] || null;
            fulfillment.setValue(value);
            window.closeAsync().try();
            return false;
        });

        $search.on("keyup", function () {
            search(table.getOrderAscendingColumns(), table.getOrderDescendingColumns());
        });

    };
});