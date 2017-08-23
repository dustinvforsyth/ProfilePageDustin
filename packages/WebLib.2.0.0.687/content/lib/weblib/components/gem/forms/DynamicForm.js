BASE.require([
    "jQuery",
    "BASE.collections.Hashmap",
    "Array.prototype.orderBy"
], function () {

    var Hashmap = BASE.collections.Hashmap;
    var Future = BASE.async.Future;
    var formByTypes = new Hashmap();

    BASE.namespace("components.gem.forms");

    components.gem.forms.DynamicForm = function (elem, tags, services) {
        var self = this;
        var $elem = $(elem);
        var entity = null;
        var Type = null;
        var displayService = null;
        var typeDisplay = null;
        var currentForm = null;
        var hiddenTools = [];
        var hiddenInputs = [];

        var generateMainTool = function (mainInputs) {
            var mainTab = document.createElement("div");
            var $mainTab = $(mainTab);

            $mainTab.attr({
                name: "General",
                component: "gem-input-form"
            });

            var inputs = mainInputs.orderBy(function (input) {
                return typeof input.sortOrder === "number" ? input.sortOrder : Infinity;
            }).filter(function (inputDisplay) {
                return hiddenInputs.indexOf(inputDisplay.name) === -1;
            }).map(function (inputDisplay) {
                return generateInput(inputDisplay);
            }).forEach(function (input) {
                $mainTab.append(input);
            });

            return $mainTab;
        };

        var generateInput = function (inputDisplay) {
            var input = document.createElement("div");
            var $input = $(input);

            $input.attr({
                component: inputDisplay.component.name,
                span: inputDisplay.span,
                "input-name": inputDisplay.name
            }).css({
                padding: "15px"
            });

            return $input;
        };

        var generateTool = function (toolDisplay) {
            var tab = document.createElement("div");
            var $tab = $(tab);
            $tab.attr("name", toolDisplay.label());

            $tab.attr({
                component: toolDisplay.component.name
            }).addClass("absolute-fill-parent");

            return $tab;
        };

        var generateTools = function (mainTab, tools) {
            var tabBody = document.createElement("div");
            var $tabBody = $(tabBody);

            $tabBody.append(mainTab);

            $tabBody.attr({
                "component": "gem-tabs"
            }).addClass("absolute-fill-parent");

            tools.orderBy(function (tool) {
                return typeof tool.sortOrder === "number" ? tool.sortOrder : Infinity;
            }).filter(function (tool) {
                return hiddenTools.indexOf(tool.name) === -1;
            }).map(function (tool) {
                return generateTool(tool);
            }).forEach(function (tab) {
                $tabBody.append(tab);
            });

            return $tabBody;
        };

        var createFormAsync = function () {
            var mainTab = generateMainTool(typeDisplay.mainInputs || []);
            var tabs = generateTools(mainTab, typeDisplay.tools || []);

            tabs.addClass("absolute-fill-parent").css("overflow", "hidden");

            return BASE.web.components.loadAsync(tabs).chain(function (form) {
                formByTypes.add(Type, form);

                return form;
            });
        };

        var getFormAsync = function (Type) {
            var form = formByTypes.get(Type);

            if (form == null) {
                return createFormAsync(Type);
            } else {
                return Future.fromResult(form);
            }
        };

        self.setConfigAsync = function (config) {
            entity = config.entity;
            Type = config.Type;
            displayService = config.displayService;
            typeDisplay = displayService.getDisplayByType(Type);
            hiddenTools = config.hiddenTools || [];
            hiddenInputs = config.hiddenInputs || [];

            $elem.children().detach();

            return getFormAsync(Type).chain(function (form) {
                var tabController = $(form).controller();
                var tabs = tabController.getTabs();

                currentForm = form;
                Object.keys(tabs).forEach(function (tabName) {
                    var tab = $(tabs[tabName]).controller();
                    var config = displayService.getToolByLabel(Type, tabName) || { hiddenInputs: hiddenInputs };

                    config.displayService = displayService;
                    config.Type = Type;
                    config.entity = entity;
                    config.typeDisplay = typeDisplay;

                    tab.setConfigAsync(config).try();
                });

                tabController.selectTabAsync("General").try();

                $elem.append(form);
            });
        };

        self.saveAsync = function () {
            var tabs = $(currentForm).controller().getTabs();

            var futures = Object.keys(tabs).map(function (tabName) {
                var tab = $(tabs[tabName]).controller();

                return tab.saveAsync(config);
            });

            return Future.all(futures);
        };

        self.validateAsync = function () {
            var tabs = $(currentForm).controller().getTabs();

            var futures = Object.keys(tabs).map(function (tabName) {
                var tab = $(tabs[tabName]).controller();

                return tab.validateAsync(config);
            });

            return Future.all(futures);
        };
    };
});