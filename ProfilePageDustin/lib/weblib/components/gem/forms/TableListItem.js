BASE.require([
		"jQuery"
], function () {
    var Future = BASE.async.Future;

    BASE.namespace("components.gem.forms");

    components.gem.forms.TableListItem = function (elem, tags, scope) {
        var self = this;
        var $elem = $(elem);
        var currentMappings = null;
        var currentConfig = null;
        var columns = {};
        var item = null;

        var selectedState = function () {
            state = deselectedState;
            $elem.removeClass("selected");
            $elem.trigger({
                type: "itemDeselected",
                entity: item
            });
        };

        var deselectedState = function () {
            state = selectedState;
            $elem.addClass("selected");
            $elem.trigger({
                type: "itemSelected",
                entity: item
            });
        };

        var state = deselectedState;

        var createColumn = function (column) {
            var name = column.name;
            var width = column.width;
            var left = column.left;

            var $column = $("<div></div>");
            $column.css({
                boxSizing: "border-box",
                height: "25px",
                fontSize: "14px",
                lineHeight: "25px",
                width: width + "px",
                paddingLeft: "10px",
                position: "absolute",
                top: "0",
                left: left + "px"
            });

            $column.attr("name", name);
            $column.addClass("ellipsis");

            return {
                $element: $column,
                text: function (value) {
                    var text = currentConfig.delegate.getPropertyDisplay(item, name);
                    $column.text(text);
                }
            };
        };

        var setBackgroundColor = function (index) {

        };

        self.setLoading = function () {
            Object.keys(columns).forEach(function (property) {
                columns[property].$element.text("Loading...");
            });
        };

        self.setEntity = function (entity, index) {
            item = entity;

            setBackgroundColor(index);

            Object.keys(columns).forEach(function (property) {
                var value = entity[property];

                if (value == null) {
                    value = "(None)";
                }

                columns[property].text(value);
            });
        };

        self.setConfig = function (config) {
            if (currentConfig !== config) {
                currentConfig = config;
                $elem.empty();
                columns = {};
                config.columns.forEach(function (column) {
                    var columnData = createColumn(column);

                    columns[column.name] = columnData;
                    $elem.append(columnData.$element);

                    return columns;
                });
            }
        };

        self.select = function () {
            state = selectedState;
            $elem.addClass("selected");
        };

        self.deselect = function () {
            state = deselectedState;
            $elem.removeClass("selected");
        };

        $elem.on("click", function () {
            state();
            return false;
        });

        $elem.on("dblclick", function () {
            $elem.trigger({
                type: "itemDoubleClicked",
                entity: item
            });
        });
    };
});