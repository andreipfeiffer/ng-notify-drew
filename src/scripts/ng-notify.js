/**
 * @license ng-notify v0.4.0
 * http://matowens.github.io/ng-notify
 * (c) 2014 MIT License, matowens.com
 */
(function() {
    'use strict';

    /**
     * @description
     *
     * This module provides any AngularJS application with a simple, lightweight
     * system for displaying notifications of varying degree to it's users.
     *
     */
     var module = angular.module('ngNotify', []);

     module.provider('ngNotify', function() {

        this.$get = ['$document', '$compile', '$rootScope', '$timeout', '$interval',

            function($document, $compile, $rootScope, $timeout, $interval) {

                // Defaults...

                var options = {
                    theme: 'pure',
                    position: 'top',
                    duration: 3000,
                    type: 'info',
                    sticky: true
                };

                // Options...
                var userOpts = {};

                var themes = {
                    pure: '',
                    prime: 'ngn-prime',
                    pastel: 'ngn-pastel',
                    pitchy: 'ngn-pitchy'
                };

                var types = {
                    infoClass: 'ngn-info',
                    errorClass: 'ngn-error',
                    successClass: 'ngn-success',
                    warnClass: 'ngn-warn',
                    grimaceClass: 'ngn-grimace'
                };

                var positions = {
                    bottom: 'ngn-bottom',
                    top: 'ngn-top'
                };

                // Fade params...

                var notifyTimeout;
                var notifyInterval;

                // Template and scope...

                var notifyScope = $rootScope.$new();
                var tpl = $compile(
                    '<div class="ngn" ng-class="ngNotify.notifyClass" ng-click="!ngNotify.isLoading && dismiss()">' +
                        // '<span class="ngn-dismiss">&times;</span>' +
                        '<span class="ngn-message" ng-if="!ngNotify.isLoading">{{ ngNotify.notifyMessage }}</span>' +
                        '<span class="ngn-spinner" ng-if="ngNotify.isLoading"></span>' +
                    '</div>'
                )(notifyScope);

                $document.find('body').append(tpl);

                // Private methods...

                /**
                 * Sets what type of notification do display, eg, error, warning, etc.
                 *
                 * @param  {String} providedType - optional user provided type that will override our default value.
                 * @return {String}              - the type that will be assigned to this notification.
                 */
                var setType = function(providedType) {
                    var type = (providedType || options.type) + 'Class';
                    return types[type] || types.infoClass;
                };

                /**
                 * Sets the theme for a notification, eg, pure, pastel, etc.
                 *
                 * @param  {String} providedTheme - optional user provided theme that will override our default value.
                 * @return {String}               - the theme that will be assigned to this notification.
                 */
                var setTheme = function(providedTheme) {
                    var theme = providedTheme || options.theme;
                    return themes[theme] || themes.pure;
                };

                var setPosition = function(providedPosition) {
                    var position = providedPosition || options.position;
                    return positions[position] || positions.top;
                };

                var setDuration = function(providedDuration) {
                    var duration = providedDuration || options.duration;
                    return angular.isNumber(duration) ? duration : 3500;
                };

                var setSticky = function(providedSticky) {
                    var sticky = providedSticky || options.sticky;
                    return sticky ? true : false;
                };

                var notifyReset = function() {
                    notifyScope.ngNotify = {
                        notifyClass: '',
                        notifyMessage: '',
                        isLoading: false
                    };
                };

                notifyScope.dismiss = function() {
                    notifyReset();
                };


                var el = tpl;

                /**
                 * Our primary object containing all public API methods and allows for all our functionality to be invoked.
                 */
                var notifyObject = {

                    /**
                     * Merges our user specified options with our default set of options.
                     *
                     * @param {Object} params - object of user provided options to configure notifications.
                     */
                    config: function(params) {
                        params = params || {};
                        angular.extend(options, params);
                    },

                    /**
                     * Sets, configures and displays each notification.
                     *
                     * @param {String}             message - the message our notification will display to the user.
                     * @param {String|Object|null} userOpt - optional parameter that contains the type or an object of options used to configure this notification.
                     */
                    set: function(message, userOpt) {

                        if (!message) {
                            return;
                        }

                        $interval.cancel(notifyInterval);
                        $timeout.cancel(notifyTimeout);

                        if (typeof userOpt === 'object') {
                            userOpts = {
                                type: userOpt.type || undefined,
                                theme: userOpt.theme || undefined,
                                position: userOpt.position || undefined,
                                duration: userOpt.duration || undefined,
                                sticky: userOpt.sticky || undefined
                            };
                        } else {
                            userOpts.type = userOpt;
                        }


                        var sticky = setSticky(userOpts.sticky);
                        var duration = setDuration(userOpts.duration);
                        var notifyClass = setType(userOpts.type) + ' ' +
                                          setTheme(userOpts.theme) + ' ';

                        notifyClass += setPosition(userOpts.position);
                        notifyClass += sticky ? ' ngn-sticky' : '';
                        notifyClass += ' ngn-animate';

                        notifyScope.ngNotify = notifyScope.ngNotify || {};

                        notifyScope.ngNotify.notifyClass = '';
                        notifyScope.ngNotify.notifyMessage = message;
                        notifyScope.ngNotify.isLoading = false;

                        // el.fadeIn(200, function() {
                            if (!sticky) {
                                notifyTimeout = $timeout(function() {
                                    notifyScope.dismiss();
                                }, duration);
                            }
                        // });

                        $timeout(function() {
                            notifyScope.ngNotify.notifyClass = notifyClass;
                        }, 1);
                    },

                    /**
                     * Allows a developer to manually dismiss a notification that may be
                     * set to sticky, when the message is no longer warranted.
                     */
                    dismiss: function() {
                        notifyScope.dismiss();
                    },

                    load: function() {
                        $interval.cancel(notifyInterval);
                        $timeout.cancel(notifyTimeout);

                        var notifyClass = setType() + ' ' +
                                          setTheme() + ' '+
                                          setPosition() + ' '+
                                          ' ngn-loading';

                        notifyScope.ngNotify = notifyScope.ngNotify || {};
                        notifyScope.ngNotify.isLoading = true;

                        notifyScope.ngNotify.notifyClass = '';
                        notifyScope.ngNotify.notifyMessage = '';

                        $timeout(function() {
                            notifyScope.ngNotify.notifyClass = notifyClass;
                        }, 1);
                    },


                    // User customizations...

                    /**
                     * Adds a new, user specified theme to our notification system
                     * that they can then use throughout their application.
                     *
                     * @param {String} themeName  - the name for this new theme that will be used when applying it via configuration.
                     * @param {String} themeClass - the class that this theme will use when applying it's styles.
                     */
                    addTheme: function(themeName, themeClass) {
                        if (!themeName || !themeClass) { return; }
                        themes[themeName] = themeClass;
                    },

                    /**
                     * Adds a new, user specified notification type that they
                     * can then use throoughout their application.
                     *
                     * @param {String} typeName  - the name for this new type that will be used when applying it via configuration.
                     * @param {String} typeClass - the class that this type will use when applying it's styles.
                     */
                    addType: function(typeName, typeClass) {
                        if (!typeName || !typeClass) { return; }
                        types[typeName + 'Class'] = typeClass;
                    }

                };

                return notifyObject;
            }
        ];
     });
})();
