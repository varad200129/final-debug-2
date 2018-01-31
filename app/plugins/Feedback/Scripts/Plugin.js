/*!
 * This file is part of App Builder
 * For licenses information see App Builder help
 * ©2018 App Builder - https://www.davidesperalta.com
 */

window.App.Plugins.Feedback = function() {

  /* Public interface: actions exposed by the plugin */

  return {

    FeedbackHapticEnabled: function(callback) {
      if (window.plugins && window.plugins.deviceFeedback) {
        window.plugins.deviceFeedback.isFeedbackEnabled(function(feedback) {
          if (angular.isFunction(window.App.Scope[callback])) {
            window.App.Scope[callback](feedback.haptic.toString());
          }
       });
      } else if (angular.isFunction(window.App.Scope[callback])) {
        window.App.Scope[callback]('false');
      }
    },
    
    FeedbackAcousticEnabled: function(callback) {
      if (window.plugins && window.plugins.deviceFeedback) {
        window.plugins.deviceFeedback.isFeedbackEnabled(function(feedback) {
          if (angular.isFunction(window.App.Scope[callback])) {
            window.App.Scope[callback](feedback.acoustic.toString());
          }
       });
      } else if (angular.isFunction(window.App.Scope[callback])) {
        window.App.Scope[callback]('false');
      }
    },    

    FeedbackAcoustic: function() {
      if (window.plugins && window.plugins.deviceFeedback) {
        window.plugins.deviceFeedback.acoustic();
      }
    },
    
    FeedbackHapticVirtualKey: function() {
      if (window.plugins && window.plugins.deviceFeedback) {
        window.plugins.deviceFeedback.haptic(
         window.plugins.deviceFeedback.VIRTUAL_KEY);
      }
    },  
    
    FeedbackHapticLongPress: function() {
      if (window.plugins && window.plugins.deviceFeedback) {
        window.plugins.deviceFeedback.haptic(
         window.plugins.deviceFeedback.LONG_PRESS);
      }
    },        
    
    FeedbackHapticKeyboardTap: function() {
      if (window.plugins && window.plugins.deviceFeedback) {
        window.plugins.deviceFeedback.haptic(
         window.plugins.deviceFeedback.KEYBOARD_TAP);
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
