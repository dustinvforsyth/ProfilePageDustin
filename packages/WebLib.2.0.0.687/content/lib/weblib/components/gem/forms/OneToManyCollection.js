﻿BASE.require([
		"jQuery",
        "BASE.data.DataContext",
        "BASE.data.utils"
], function () {
    var Future = BASE.async.Future;
    var Fulfillment = BASE.async.Fulfillment;
    var DataContext = BASE.data.DataContext;
    var emptyFuture = Future.fromResult();
    var cloneEntity = BASE.data.utils.shallowCloneEntity;

    BASE.namespace("components.gem.forms");

    components.gem.forms.OneToManyCollection = function (elem, tags, services) {
        var self = this;
        var $elem = $(elem);
        var $ok = $(tags["ok"]);
        var collectionForm = $(tags["collection"]).controller();
        var confirmDeleteModalFuture = null;
        var entityFormFuture = null;
        var fulfillment = null;
        var parentEntity = null;
        var relationship = null;
        var displayService = null;
        var window = null;
        var array = null;

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
                    componentName: "gem-one-to-many-collection-entity-form",
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

        self.prepareToDeactivateAsync = function () {
            fulfillment.setValue(parentEntity[relationship.hasMany]);
        };

        self.validateAsync = function () { };
        self.saveAsync = function () { };

        self.setConfigAsync = function (config) {
            fulfillment = new Fulfillment();
            displayService = config.displayService;
            parentEntity = config.entity;
            relationship = config.relationship;

            var edm = displayService.service.getEdm();
            var keys = edm.getPrimaryKeyProperties(relationship.ofType).concat(edm.getAllKeyProperties(relationship.ofType));
            var Type = relationship.ofType;
            var typeDisplay = displayService.getDisplayByType(Type);
            var queryable;

            var properties = typeDisplay.listProperties.orderBy(function (property) {
                return typeof property.sortOrder === "number" ? property.sortOrder : Infinity;
            }).reduce(function (properties, property) {
                var propertyName = property.propertyName;

                if (keys.indexOf(propertyName) > -1 || propertyName === relationship.withOne) {
                    return properties;
                }

                properties[propertyName] = property;

                return properties;
            }, {});

            var delegate = {
                canAdd: typeDisplay.canAdd,
                canEdit: typeDisplay.canEdit,
                canDelete: typeDisplay.canDelete,
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

            if (parentEntity[relationship.hasKey] == null) {
                array = [];
                queryable = array.asQueryable();

                delegate.addAsync = function () {
                    var entity = new Type();

                    var window = null;
                    return getEntityFormModal().chain(function (windowManager) {
                        window = windowManager.window;

                        window.setName("Add " + typeDisplay.labelInstance());

                        setupWindow(typeDisplay, window);

                        var controller = windowManager.controller;
                        var saveFuture = controller.setConfigAsync({
                            displayService: displayService,
                            parentEntity: parentEntity,
                            entity: entity,
                            relationship: relationship
                        });

                        windowManager.window.showAsync().try();
                        return saveFuture
                    }).chain(function () {
                        array.push(entity);
                        parentEntity[relationship.hasMany].push(entity);
                        return window.closeAsync();
                    });
                };

                delegate.editAsync = function (entity) {
                    var window = null;
                    return getEntityFormModal().chain(function (windowManager) {
                        window = windowManager.window;

                        window.setName("Edit " + typeDisplay.labelInstance());

                        setupWindow(typeDisplay, window);

                        var controller = windowManager.controller;
                        var saveFuture = controller.setConfigAsync({
                            displayService: displayService,
                            parentEntity: parentEntity,
                            entity: entity,
                            relationship: relationship
                        });

                        windowManager.window.showAsync().try();
                        return saveFuture
                    }).chain(function () {
                        return window.closeAsync();
                    });
                };

                delegate.removeAsync = function (items) {
                    return getConfirmDeleteModal().chain(function (windowManager) {
                        var controller = windowManager.controller;
                        var confirmFuture = controller.getConfirmationForMessageAsync("Are you sure you want to delete these items?");

                        windowManager.window.showAsync().try();

                        return confirmFuture;
                    }).chain(function () {
                        items.forEach(function (item) {
                            var index = parentEntity[relationship.hasMany].indexOf(item);

                            if (index > -1) {
                                parentEntity[relationship.hasMany].splice(index, 1);
                            }

                            index = array.indexOf(item);

                            if (index > -1) {
                                array.splice(index, 1);
                            }
                        });
                    });
                };

                delegate.search = function () {
                    var searchQueryable = typeDisplay.search.apply(typeDisplay, arguments);
                    return queryable.merge(searchQueryable);
                };

            } else {
                queryable = displayService.service.asQueryable(relationship.ofType).where(function (expBuilder) {
                    return expBuilder.property(relationship.withForeignKey).isEqualTo(parentEntity[relationship.hasKey]);
                });

                delegate.addAsync = function () {
                    var entity = new Type();

                    var window = null;
                    return getEntityFormModal().chain(function (windowManager) {
                        window = windowManager.window;

                        window.setName("Add " + typeDisplay.labelInstance());

                        setupWindow(typeDisplay, window);

                        var controller = windowManager.controller;
                        var saveFuture = controller.setConfigAsync({
                            displayService: displayService,
                            parentEntity: parentEntity,
                            entity: entity,
                            relationship: relationship
                        });

                        windowManager.window.showAsync().try();
                        return saveFuture
                    }).chain(function (entity) {
                        var dataContext = new DataContext(displayService.service);
                        entity = dataContext.loadEntity(entity);
                        entity[relationship.withForeignKey] = parentEntity[relationship.hasKey];
                        return dataContext.saveChangesAsync().chain(function () {
                            return dataContext.dispose();
                        });
                    }).chain(function () {
                        return window.closeAsync();
                    });
                };

                delegate.editAsync = function (entity) {
                    var window = null;

                    var firstEntity = entity;

                    var dataContext = new DataContext(displayService.service);
                    entity = dataContext.loadEntity(entity);

                    return getEntityFormModal().chain(function (windowManager) {
                        window = windowManager.window;

                        window.setName("Edit " + typeDisplay.labelInstance());

                        setupWindow(typeDisplay, window);

                        var controller = windowManager.controller;
                        var saveFuture = controller.setConfigAsync({
                            displayService: displayService,
                            parentEntity: parentEntity,
                            entity: entity,
                            relationship: relationship
                        });

                        windowManager.window.showAsync().try();
                        return saveFuture
                    }).chain(function (entity) {
                        return dataContext.saveChangesAsync().chain(function () {
                            return dataContext.dispose();
                        });
                    }).chain(function () {
                        collectionForm.searchAsync("").try();
                        return window.closeAsync();
                    });
                };

                delegate.removeAsync = function (items) {
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
                    });
                };

                delegate.search = function () {
                    var searchQueryable = typeDisplay.search.apply(typeDisplay, arguments);
                    return queryable.merge(searchQueryable);
                };
            }

            collectionForm.setDelegate(delegate);
            return fulfillment;
        };

    };
});