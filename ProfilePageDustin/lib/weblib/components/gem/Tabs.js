BASE.require([
		"jQuery"
], function () {
    var Future = BASE.async.Future;

    BASE.namespace("components.gem");

    components.gem.Tabs = function (elem, tags, scope) {
        var self = this;
        var $elem = $(elem);
        var $tabsContainer = $(tags["tabs-container"]);
        var stateManager = $(tags["state-manager"]).controller();

        var createTab = function (name) {
            var $tab = $("<button></button>");
            $tab.text(name).addClass("gem-tab");
            $tab.attr("name", name);
            $tab.on("click", function () {
                self.selectTabAsync(name).try();
            });
            return $tab;
        };

        var createTabs = function () {
            var states = stateManager.getStates();

            var keys = Object.keys(states)

            keys.forEach(function (name) {
                var $tabContent = $(states[name]).addClass("absolute-fill-parent");
                var $tab = createTab(name);
                $tab.appendTo($tabsContainer);
            });

            self.selectTabAsync(keys[0]).try();
        };

        self.selectTabAsync = function (name) {
            return Future.fromResult().chain(function () {
                var $tab = $tabsContainer.children("[name='" + name + "']");
                $tabsContainer.children().removeClass("selected");
                $tab.addClass("selected");
                return stateManager.replaceAsync(name);
            });
        };

        self.getTabs = function () {
            return stateManager.getStates();
        };

        createTabs();
    };
});