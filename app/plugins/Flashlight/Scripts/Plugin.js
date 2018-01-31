/*!
 * This file is part of App Builder
 * For licenses information see App Builder help
 * ©2018 App Builder - https://www.davidesperalta.com
 */

window.App.Plugins.Flashlight = function() {

  /* Public interface: actions exposed by the plugin */

  return {

    FlashlightAvailable: function(callback) {
      if (window.plugins && window.plugins.flashlight) {
        window.plugins.flashlight.available(function(isAvailable) {
          if (angular.isFunction(window.App.Scope[callback])) {
            window.App.Scope[callback](isAvailable.toString());
          }
        });
      } else if (angular.isFunction(window.App.Scope[callback])) {
        window.App.Scope[callback]('false');
      }
    },

    FlashlightSwitchOn: function() {
      if (window.plugins && window.plugins.flashlight) {
        window.plugins.flashlight.switchOn();
      }
    },

    FlashlightSwitchOff: function() {
      if (window.plugins && window.plugins.flashlight) {
        window.plugins.flashlight.switchOff();
      }
    },

    FlashlightToggle: function() {
      if (window.plugins && window.plugins.flashlight) {
        window.plugins.flashlight.toggle();
      }
    },

    /* Optional plugin's events (called by App Builder) */

    PluginSetupEvent: function() {
      // Nothing to do here
    },

    PluginAppReadyEvent: function() {
      // Nothing to do here
    },

    PluginDocumentReadyEvent: function() {
      // Nothing to do here
    }
  };
};
