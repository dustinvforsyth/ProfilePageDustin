BASE.require([
		"jQuery",
        "String.prototype.trim"
], function () {
    var Future = BASE.async.Future;

    var delegateInterface = [
        "addAsync",
        "editAsync",
        "removeAsync",
        "search",
        "getPropertyLabel",
        "getPropertyDisplay",
        "getPropertyNames",
        "getPrimaryKeyPropertyName",
        "getPropertyWidth"
    ];

    var implementsInterface = function (methodNames, obj) {
        return methodNames.every(function (methodName) {
            return typeof obj[methodName] === "function";
        });
    };

    BASE.namespace("components.gem.forms");

    components.gem.forms.CollectionForm = function (elem, tags, services) {
        var self = this;
        var $elem = $(elem);
        var $search = $(tags["search"]);
        var $edit = $(tags["edit"]);
        var $add = $(tags["add"]);
        var $delete = $(tags["delete"]);
        var table = $(tags["table"]).controller();
        var delegate = null;
        var orderBy = null;

        var search = function (orderByAsc, orderByDesc) {
            var search = $search.val();
            return table.setQueryableAsync(delegate.search(search, orderByAsc, orderByDesc)).try();
        };

        var handleActionButtons = function (selectedItems) {
            var selectedAmount = selectedItems.getKeys().length;
            if (selectedAmount === 0) {
                $edit.attr("disabled", "disabled");
                $delete.attr("disabled", "disabled");
            } else if (selectedAmount > 0) {
                $edit.removeAttr("disabled");
                $delete.removeAttr("disabled");
            }

            if (selectedAmount > 1) {
                $edit.attr("disabled", "disabled");
            }
        };

        var editItemAsync = function (item) {
            return delegate.editAsync(item).chain(function () {
                var selectedItems = table.getSelectedItems();
                selectedItems.clear();
                handleActionButtons(selectedItems);
                return table.redrawItems();
            });
        };

        var setUpCrudUserInterface = function (delegate) {
            // Setup default CRUD
            delegate.canAdd = typeof delegate.canAdd === "boolean" ? delegate.canAdd : true;
            delegate.canEdit = typeof delegate.canEdit === "boolean" ? delegate.canEdit : true;
            delegate.canDelete = typeof delegate.canDelete === "boolean" ? delegate.canDelete : true;

            if (!delegate.canAdd) {
                $add.parent().addClass("hide");
            } else {
                $add.parent().removeClass("hide");
            }

            if (!delegate.canEdit) {
                $edit.parent().addClass("hide");
            } else {
                $edit.parent().removeClass("hide");
            }

            if (!delegate.canDelete) {
                $delete.parent().addClass("hide");
            } else {
                $delete.parent().removeClass("hide");
            }
        };

        self.setDelegate = function (value) {
            delegate = value;

            var isValidDelegate = implementsInterface(delegateInterface, value);

            if (!isValidDelegate) {
                throw new Error("Invalid delegate it needs to implement all these methods." + delegateInterface.join(", "));
            }

            delegate.orderBy = function (orderByAsc, orderByDesc) {
                search(orderByAsc, orderByDesc);
            };

            setUpCrudUserInterface(delegate);
            table.setDelegate(delegate);
            self.searchAsync().try();
        };

        self.searchAsync = function (text) {
            if (typeof text !== "string") {
                text = $search.val();
            } else {
                $search.val(text);
            }

            return table.setQueryableAsync(delegate.search(text, table.getOrderAscendingColumns(), table.getOrderDescendingColumns()));
        };

        $elem.on("selectionChange", function (event) {
            var selectedItems = event.selectedItems;
            handleActionButtons(selectedItems);

            return false;
        });

        $edit.on("click", function () {
            editItemAsync(table.getSelectedItems().getValues()[0]).try();
        });

        $delete.on("click", function () {
            delegate.removeAsync(table.getSelectedItems().getValues()).chain(function () {
                var selectedItems = table.getSelectedItems();
                selectedItems.clear();
                handleActionButtons(selectedItems);
                return self.searchAsync("");
            }).try();
        });

        $add.on("click", function () {
            delegate.addAsync().chain(function () {
                var selectedItems = table.getSelectedItems();
                selectedItems.clear();
                handleActionButtons(selectedItems);
                return self.searchAsync("");
            }).try();
        });

        $elem.on("itemDoubleClicked", function (event) {
            editItemAsync(event.entity).try();
            var selectedItems = table.getSelectedItems();
            selectedItems.clear();
            table.redrawItems();
        });

        $search.on("keyup", function () {
            search(table.getOrderAscendingColumns(), table.getOrderDescendingColumns());
        });

    };
});