BASE.require([
		"jQuery",
        "BASE.data.DataContext"
], function () {
    var Future = BASE.async.Future;
    var DataContext = BASE.data.DataContext;

    BASE.namespace("components.gem.forms");

    components.gem.forms.IndependentCollection = function (elem, tags, services) {
        var self = this;
        var $elem = $(elem);
        var collectionForm = $(tags["collection"]).controller();
        var confirmDeleteModalFuture = null;
        var entityFormFuture = null;

        var getConfirmDeleteModal = function () {
            if (confirmDeleteModalFuture == null) {
                return confirmDeleteModalFuture = services.get("windowService").createModalAsync({
                    componentName: "gem-confirm",
                    height: 150,
                    width: 350
                })
            }

            return confirmDeleteModalFuture;
        };

        var getEntityFormModal = function () {
            if (entityFormFuture == null) {
                return entityFormFuture = services.get("windowService").createModalAsync({
                    componentName: "gem-independent-entity-form",
                    height: 500,
                    width: 800
                })
            }

            return entityFormFuture;
        };

        var setupWindow = function (typeDisplay, window) {
            if (typeDisplay.windowSize) {
                window.setSize(typeDisplay.windowSize);
            }

            if (typeDisplay.maxWindowSize) {
                window.setMaxSize(typeDisplay.maxWindowSize);
            }

            if (typeDisplay.minWindowSize) {
                window.setMinSize(typeDisplay.minWindowSize);
            }
        };

        self.setDisplay = function (Type, displayService) {
            var typeDisplay = displayService.getDisplayByType(Type);
            var edm = displayService.service.getEdm();
            var keys = edm.getPrimaryKeyProperties(Type).concat(edm.getAllKeyProperties(Type));
            var properties = typeDisplay.listProperties.orderBy(function (property) {
                return typeof property.sortOrder === "number" ? property.sortOrder : Infinity;
            }).reduce(function (properties, property) {
                var propertyName = property.propertyName;

                if (keys.indexOf(propertyName) > -1) {
                    return properties;
                }

                properties[propertyName] = property;

                return properties;
            }, {});

            var delegate = {
                canAdd: typeDisplay.canAdd,
                canEdit: typeDisplay.canEdit,
                canDelete: typeDisplay.canDelete,
                addAsync: function () {
                    var entity = new Type();
                    var window = null;
                    var dataContext = new DataContext(displayService.service);
                    dataContext.addEntity(entity);

                    return getEntityFormModal().chain(function (windowManager) {
                        window = windowManager.window;

                        window.setName("Add " + typeDisplay.labelInstance());

                        setupWindow(typeDisplay, window);

                        var controller = windowManager.controller;
                        var saveFuture = controller.setConfigAsync({
                            displayService: displayService,
                            entity: entity
                        });

                        windowManager.window.showAsync().try();
                        return saveFuture
                    }).chain(function () {
                        return dataContext.saveChangesAsync();
                    }).chain(function () {
                        dataContext.dispose();
                        collectionForm.searchAsync("").try();
                        return window.closeAsync();
                    }).catchCanceled(function () {
                        dataContext.dispose();
                        return window.closeAsync();
                    }).catch(function (error) {
                        console.log(error);
                    });
                },
                editAsync: function (entity) {
                    var window = null;
                    var dataContext = new DataContext(displayService.service);
                    entity = dataContext.loadEntity(entity);

                    return getEntityFormModal().chain(function (windowManager) {
                        window = windowManager.window;

                        window.setName("Edit " + typeDisplay.labelInstance());

                        setupWindow(typeDisplay, window);

                        var controller = windowManager.controller;
                        var saveFuture = controller.setConfigAsync({
                            displayService: displayService,
                            entity: entity
                        });

                        windowManager.window.showAsync().try();
                        return saveFuture
                    }).chain(function () {
                        return dataContext.saveChangesAsync();
                    }).chain(function () {
                        dataContext.dispose();
                        collectionForm.searchAsync("").try();
                        return window.closeAsync();
                    }).catchCanceled(function () {
                        dataContext.dispose();
                        return window.closeAsync();
                    }).catch(function (error) {
                        console.log(error);
                    });
                },
                removeAsync: function (items) {
                    return getConfirmDeleteModal().chain(function (windowManager) {
                        var controller = windowManager.controller;
                        var confirmFuture = controller.getConfirmationForMessageAsync("Are you sure you want to delete these items?");

                        windowManager.window.showAsync().try();

                        return confirmFuture;
                    }).chain(function () {
                        var removeItemFutures = items.map(function (item) {
                            return displayService.service.remove(Type, item);
                        });
                        return Future.all(removeItemFutures);
                    }).chain(function () {
                        return collectionForm.searchAsync("").try();
                    }).catch(function () {
                        console.log(error);
                    });
                },
                search: function () {
                    return typeDisplay.search.apply(typeDisplay, arguments);
                },
                orderByDesc: function () {

                },
                getPropertyWidth: function (propertyName) {
                    return properties[propertyName].width;
                },
                getPropertyLabel: function (propertyName) {
                    return properties[propertyName].label();
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

            collectionForm.setDelegate(delegate);
        };
    };
});