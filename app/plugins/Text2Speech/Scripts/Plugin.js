/*!
 * This file is part of App Builder
 * For licenses information see App Builder help
 * ©2018 App Builder - https://www.davidesperalta.com
 */

window.App.Plugins.Text2Speech = function() {

  /* Private plugin's stuff */

  var
    setEventVariables = function(error) {
      window.App.RootScope.Text2SpeechError = error;
    };

  /* Public interface: actions exposed by the plugin */

  return {

    Text2Speech: function(text, locale, rate) {
        
      rate = rate || 1;
      text = text || '';
      locale = locale || 'en-US';

      if (angular.isUndefined(window.TTS)) {
        if (angular.isFunction(window.App.Scope.Text2SpeechErrorEvent)) {
          setEventVariables('-1');
          window.App.Scope.Text2SpeechErrorEvent();
        }
        return;
      }
      
      window.TTS.speak({
        "text": text,
        "locale": locale,
        "rate": rate
      }, 
      function() {
        if (angular.isFunction(window.App.Scope.Text2SpeechSuccessEvent)) {
          setEventVariables('');
          window.App.Scope.Text2SpeechSuccessEvent();
        }
      }, 
      function(error) {
        if (angular.isFunction(window.App.Scope.Text2SpeechErrorEvent)) {
          setEventVariables(error);
          window.App.Scope.Text2SpeechErrorEvent();
        }
      });
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
