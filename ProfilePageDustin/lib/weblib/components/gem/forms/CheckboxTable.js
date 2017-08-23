BASE.require([
		"jQuery",
        "BASE.collections.Hashmap"
], function () {
    var Hashmap = BASE.collections.Hashmap;

    BASE.namespace("components.gem.forms");

    components.gem.forms.CheckboxTable = function (elem, tags, scope) {
        var self = this;
        var $elem = $(elem);
        var $headers = $(tags["header"]);
        var $headerContainer = $(tags["header-container"]);
        var $list = $(tags["list"]);
        var list = $list.controller();
        var layout = list.getLayout();
        var selectedItems = new Hashmap();
        var queryable = null;
        var delegate = null;
        var columns = null;
        var listItemConfig = null;
        var primaryKeyProperty = "id";
        var currentWidth = 0;
        var headers;

        var createHeader = function (column) {
            var name = column.name;
            var label = column.label;
            var left = column.left;
            var width = column.width;

            var $header = $("<button></button>");

            $header.text(label).addClass("gem-column-headers");
            $header.css({
                boxSizing: "border-box",
                height: "25px",
                fontSize: "14px",
                lineHeight: "25px",
                width: width + "px",
                paddingLeft: "10px",
                textAlign: "left",
                position: "absolute",
                top: "0",
                left: left + "px",
                color: "rgba(0,0,0,0.8)"
            });

            $header.on("click", function () {
                var orderBy = $header.attr("order-by");
                $headers.children().removeAttr("order-by");

                if (orderBy === "asc") {
                    $header.attr("order-by", "desc");
                } else {
                    $header.attr("order-by", "asc");
                }

                delegate.orderBy(self.getOrderAscendingColumns(), self.getOrderDescendingColumns());
            });

            return $header;
        };

        var createHeaders = function (columns) {
            $headers.css("width", currentWidth);
            return columns.reduce(function (columns, column) {
                var $column = createHeader(column);
                columns[column.name] = $column;

                $headers.append($column);

                return columns;
            }, {});

        };

        var createColumns = function (properties) {
            currentWidth = 0;
            var checkboxColumn = {
                name: "__checkbox__",
                display: function () {
                    return "";
                },
                label: function () {
                    return "";
                },
                width: 40,
                left: currentWidth
            };

            currentWidth += 40;

            columns = properties.map(function (propertyName) {
                var width = delegate.getPropertyWidth(propertyName) || 200;

                var column = {
                    name: propertyName,
                    label: delegate.getPropertyLabel(propertyName),
                    width: width,
                    left: currentWidth
                };

                currentWidth += width;

                return column;
            });

            columns.unshift(checkboxColumn);
            return columns;
        };

        self.setDelegate = function (value) {
            var properties;
            delegate = value;
            properties = delegate.getPropertyNames();
            columns = createColumns(properties);
            headers = createHeaders(columns);
            primaryKeyProperty = delegate.getPrimaryKeyPropertyName();

            listItemConfig = {
                columns: columns,
                delegate: delegate
            };

            list.getLayout().setWidth(currentWidth);
        };

        self.setQueryableAsync = function (value) {
            queryable = value;
            $elem.trigger({
                type: "selectionChange",
                selectedItems: selectedItems
            });
            return list.setQueryableAsync(queryable);
        };

        self.redrawItems = function () {
            return list.redrawItems();
        };

        self.getSelectedItems = function () {
            return selectedItems;
        };

        self.getOrderAscendingColumns = function () {
            return Object.keys(headers).filter(function (key) {
                $column = headers[key];
                return $column.attr("order-by") === "asc";
            });
        };

        self.getOrderDescendingColumns = function () {
            return Object.keys(headers).filter(function (key) {
                $column = headers[key];
                return $column.attr("order-by") === "desc";
            });
        };

        layout.prepareElement = function (element, item, index) {
            var controller = $(element).controller();

            controller.setConfig(listItemConfig);
            controller.setEntity(item, index);

            if (selectedItems.hasKey(item[primaryKeyProperty])) {
                controller.select();
            } else {
                controller.deselect();
            }
        };

        $elem.on("itemSelected", function (event) {
            selectedItems.add(event.entity[primaryKeyProperty], event.entity);

            $elem.trigger({
                type: "selectionChange",
                selectedItems: selectedItems
            });

            return false;
        });

        $elem.on("itemDeselected", function (event) {
            selectedItems.remove(event.entity[primaryKeyProperty]);

            $elem.trigger({
                type: "selectionChange",
                selectedItems: selectedItems
            });

            return false;
        });

        $list.on("scroll", function () {
            $headerContainer.scrollLeft($list.scrollLeft());
        });

    };
});