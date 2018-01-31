/*!
 * This file is part of App Builder
 * For licenses information see App Builder help
 * ©2018 App Builder - https://www.davidesperalta.com
 */

window.App = {};

window.App.Utils = (function () {

  var
    lastSound = 0;

  return {

    strLen: function (text) {
      return text.length;
    },

    trimStr: function (text) {
      return text.trim();
    },

    strSearch: function (text, query) {
      return text.search(query);
    },

    splitStr: function (text, separator) {
      return text.split(separator);
    },

    subStr: function (text, start, count) {
      return text.substr(start, count);
    },

    strReplace: function (text, from, to) {
      return text.replace(from, to);
    },

    strReplaceAll: function (text, from, to) {
      return text.split(from).join(to);
    },

    playSound: function (mp3Url, oggUrl) {
      if (lastSound === 0) {
        lastSound = new Audio();
      }
      if (lastSound.canPlayType('audio/mpeg')) {
        lastSound.src = mp3Url;
        lastSound.type = 'audio/mpeg';
      } else {
        lastSound.src = oggUrl;
        lastSound.type = 'audio/ogg';
      }
      lastSound.play();
    },

    stopSound: function () {
      lastSound.pause();
      lastSound.currentTime = 0.0;
    },

    sleep: function (ms) {
      var
        start = new Date().getTime();
      for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > ms){
          break;
        }
      }
    }
  };
})();

window.App.Modal = (function () {

  var
    stack = [],
    current = 0;

  return {

    insert: function (name) {
      current = stack.length;
      stack[current] = {};
      stack[current].name = name;
      stack[current].instance = null;
      return stack[current];
    },

    getCurrent: function () {
      if (stack[current]) {
        return stack[current].instance;
      } else {
        return null;
      }
    },
    
    removeCurrent: function () {
      stack.splice(current, 1);
      current = current - 1;
      current = (current < 0) ? 0 : current;
    },

    closeAll: function () {
      for (var i = stack.length-1; i >= 0; i--) {
        stack[i].instance.dismiss();
      }
      stack = [];
      current = 0;
    }
  };
})();

window.App.Debugger = (function () {

  return {

    exists: function () {
      return (typeof window.external === 'object')
       && ('hello' in window.external);
    },

    log: function (text, aType, lineNum) {
      if (window.App.Debugger.exists()) {
        window.external.log('' + text, aType || 'info', lineNum || 0);
      } else {
        console.log(text);
      }
    },

    watch: function (varName, newValue, oldValue) {
      if (window.App.Debugger.exists()) {
        if (angular.isArray(newValue)) {
          window.external.watch('', varName, newValue.toString(), 'array');
        } else if (angular.isObject(newValue)) {
          angular.forEach(newValue, function (value, key) {
            if (!angular.isFunction (value)) {
              try {
                window.external.watch(varName, key, value.toString(), typeof value);
              } 
              catch(exception) {}
            }
          });
        } else if (angular.isString(newValue) || angular.isNumber(newValue)) {
          window.external.watch('', varName, newValue.toString(), typeof newValue);
        }
      }
    }
  };
})();

window.App.Module = angular.module
(
  'AppModule',
  [
    'ngRoute',
    'ngTouch',
    'ngAnimate',
    'ngSanitize',
    'blockUI',
    'chart.js',
    'ngOnload',
    'ui.bootstrap',
    'angular-canvas-gauge',
    'com.2fdevs.videogular',
    'com.2fdevs.videogular.plugins.controls',
    'AppCtrls'
  ]
);

window.App.Module.run(function () {
  window.FastClick.attach(document.body);
});

window.App.Module.directive('ngImageLoad',
[
  '$parse',

  function ($parse) {
    return {
      restrict: 'A',
      link: function ($scope, el, attrs) {
        el.bind('load', function (event) {
          var 
            fn = $parse(attrs.ngImageLoad);
          fn($scope, {$event: event});
        });
      }
    };
  }
]);

window.App.Module.directive('ngImageError',
[
  '$parse',

  function ($parse) {
    return {
      restrict: 'A',
      link: function ($scope, el, attrs) {
        el.bind('error', function (event) {
          var 
            fn = $parse(attrs.ngImageError);
          fn($scope, {$event: event});
        });
      }
    };
  }
]);

window.App.Module.directive('ngContextMenu',
[
  '$parse',

  function ($parse) {
    return {
      restrict: 'A',
      link: function ($scope, el, attrs) {
        el.bind('contextmenu', function (event) {
          var
            fn = $parse(attrs.ngContextMenu);
          fn($scope, {$event: event});
        });
      }
    };
  }
]);

window.App.Module.directive('bindFile',
[
  function () {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function ($scope, el, attrs, ngModel) {
        el.bind('change', function (event) {
          ngModel.$setViewValue(event.target.files[0]);
          $scope.$apply();
        });

        $scope.$watch(function () {
          return ngModel.$viewValue;
        }, function (value) {
          if (!value) {
            el.val('');
          }
        });
      }
    };
  }
]);

window.App.Module.config
([
  '$compileProvider',

  function ($compileProvider) {
    $compileProvider.debugInfoEnabled(window.App.Debugger.exists());
    $compileProvider.imgSrcSanitizationWhitelist
     (/^\s*(https?|blob|ftp|mailto|file|tel|app|data:image|moz-extension|chrome-extension|ms-appx-web):/);
  }
]);

window.App.Module.config
([
  '$httpProvider',

  function ($httpProvider) {
    if (!$httpProvider.defaults.headers.get) {
      $httpProvider.defaults.headers.get = {};
    }
    if (!$httpProvider.defaults.headers.post) {
      $httpProvider.defaults.headers.post = {};
    }
    $httpProvider.defaults.headers.get['Pragma'] = 'no-cache';
    $httpProvider.defaults.headers.get['Cache-Control'] = 'no-cache';
    $httpProvider.defaults.headers.get['If-Modified-Since'] = 'Mon, 26 Jul 1997 05:00:00 GMT';
    $httpProvider.defaults.headers.post['Content-Type'] = undefined;
    $httpProvider.defaults.transformRequest.unshift(function (data) {
      var
        frmData = new FormData();
      angular.forEach(data, function (value, key) {
        frmData.append(key, value);
      });
      return frmData;
    });
}]);

window.App.Module.config
([
  '$provide',

  function ($provide) {
    $provide.decorator('$exceptionHandler',
    ['$injector',
      function ($injector) {
        return function (exception, cause) {
          var
            $rs = $injector.get('$rootScope');

          if (!angular.isUndefined(cause)) {
            exception.message += ' (caused by "'+cause+'")';
          }

          $rs.App.LastError = exception.message;
          $rs.OnAppError();
          $rs.App.LastError = '';

          if (window.App.Debugger.exists()) {
            throw exception;
          } else {
            if (window.console) {
              window.console.error(exception);
            }
          }
        };
      }
    ]);
  }
]);

window.App.Module.config
([
  'blockUIConfig',

  function (blockUIConfig) {
    blockUIConfig.delay = 0;
    blockUIConfig.autoBlock = false;
    blockUIConfig.resetOnException = true;
    blockUIConfig.message = 'Please wait';
    blockUIConfig.autoInjectBodyBlock = false;
    blockUIConfig.blockBrowserNavigation = true;
  }
]);

window.App.Module.config
([
  '$routeProvider',

  function ($routeProvider) {
    $routeProvider.otherwise({redirectTo: "/home"})
    .when("/home", {controller: "homeCtrl", templateUrl: "app/views/home.html"})
    .when("/sun", {controller: "sunCtrl", templateUrl: "app/views/sun.html"})
    .when("/Merc", {controller: "MercCtrl", templateUrl: "app/views/Merc.html"})
    .when("/Venus", {controller: "VenusCtrl", templateUrl: "app/views/Venus.html"})
    .when("/Earth", {controller: "EarthCtrl", templateUrl: "app/views/Earth.html"})
    .when("/mars", {controller: "marsCtrl", templateUrl: "app/views/mars.html"})
    .when("/jupi", {controller: "jupiCtrl", templateUrl: "app/views/jupi.html"})
    .when("/sat", {controller: "satCtrl", templateUrl: "app/views/sat.html"})
    .when("/ura", {controller: "uraCtrl", templateUrl: "app/views/ura.html"})
    .when("/nep", {controller: "nepCtrl", templateUrl: "app/views/nep.html"})
    .when("/plu", {controller: "pluCtrl", templateUrl: "app/views/plu.html"})
    .when("/vid", {controller: "vidCtrl", templateUrl: "app/views/vid.html"})
    .when("/View13", {controller: "View13Ctrl", templateUrl: "app/views/View13.html"});
  }
]);

window.App.Module.service
(
  'AppEventsService',

  ['$rootScope',

  function ($rootScope) {

    function setAppHideEvent() {
      window.document.addEventListener('visibilitychange', function (event) {
        if (window.document.hidden) {
          window.App.Event = event;
          $rootScope.OnAppHide();
          $rootScope.$apply();
        }
      }, false);
    }
    
    function setAppShowEvent() {
      window.document.addEventListener('visibilitychange', function (event) {
        if (!window.document.hidden) {
          window.App.Event = event;
          $rootScope.OnAppShow();
          $rootScope.$apply();
        }
      }, false);
    }    

    function setAppOnlineEvent() {
      window.addEventListener('online', function (event) {
        window.App.Event = event;
        $rootScope.OnAppOnline();
      }, false);
    }

    function setAppOfflineEvent() {
      window.addEventListener('offline', function (event) {
        window.App.Event = event;
        $rootScope.OnAppOffline();
      }, false);
    }

    function setAppResizeEvent() {
      window.addEventListener('resize', function (event) {
        window.App.Event = event;
        $rootScope.OnAppResize();
      }, false);
    }

    function setAppPauseEvent() {
      if (!window.App.Cordova) {
        document.addEventListener('pause', function (event) {
          window.App.Event = event;
          $rootScope.OnAppPause();
          $rootScope.$apply();
        }, false);
      }
    }

    function setAppReadyEvent() {
      if (window.App.Cordova) {
        angular.element(window.document).ready(function (event) {
          window.App.Event = event;
          $rootScope.OnAppReady();
        });
      } else {
        document.addEventListener('deviceready', function (event) {
          window.App.Event = event;
          $rootScope.OnAppReady();
        }, false);
      }
    }

    function setAppResumeEvent() {
      if (!window.App.Cordova) {
        document.addEventListener('resume', function (event) {
          window.App.Event = event;
          $rootScope.OnAppResume();
          $rootScope.$apply();
        }, false);
      }
    }

    function setAppBackButtonEvent() {
      if (!window.App.Cordova) {
        document.addEventListener('backbutton', function (event) {
          window.App.Event = event;
          $rootScope.OnAppBackButton();
        }, false);
      }
    }

    function setAppMenuButtonEvent() {
      if (!window.App.Cordova) {
        document.addEventListener('deviceready', function (event) {
          // http://stackoverflow.com/q/30309354
          navigator.app.overrideButton('menubutton', true);
          document.addEventListener('menubutton', function (event) {
            window.App.Event = event;
            $rootScope.OnAppMenuButton();
          }, false);
        }, false);
      }
    }

    function setAppOrientationEvent() {
      window.addEventListener('orientationchange', function (event) {
        window.App.Event = event;
        $rootScope.OnAppOrientation();
      }, false);
    }

    function setAppVolumeUpEvent() {
      if (!window.App.Cordova) {
        document.addEventListener('volumeupbutton', function (event) {
          window.App.Event = event;
          $rootScope.OnAppVolumeUpButton();
        }, false);
      }
    }

    function setAppVolumeDownEvent() {
      if (!window.App.Cordova) {
        document.addEventListener('volumedownbutton', function (event) {
          window.App.Event = event;
          $rootScope.OnAppVolumeDownButton();
        }, false);
      }
    }

    function setAppKeyUpEvent() {
      document.addEventListener('keyup', function (event) {
        window.App.Event = event;
        $rootScope.OnAppKeyUp();
      }, false);
    }

    function setAppKeyDownEvent() {
      document.addEventListener('keydown', function (event) {
        window.App.Event = event;
        $rootScope.OnAppKeyDown();
      }, false);
    }

    function setAppMouseUpEvent() {
      document.addEventListener('mouseup', function (event) {
        window.App.Event = event;
        $rootScope.OnAppMouseUp();
      }, false);
    }

    function setAppMouseDownEvent() {
      document.addEventListener('mousedown', function (event) {
        window.App.Event = event;
        $rootScope.OnAppMouseDown();
      }, false);
    }

    function setAppViewChangeEvent() {
      angular.element(window.document).ready(function (event) {
        $rootScope.$on('$locationChangeStart', function (event, next, current) {
          window.App.Event = event;
          $rootScope.App.NextView = next.substring(next.lastIndexOf('/') + 1);
          $rootScope.App.PrevView = current.substring(current.lastIndexOf('/') + 1);
          $rootScope.OnAppViewChange();
        });
      });
    }
    
    function setAppWebExtMsgEvent() {
      if (window.chrome) {
        window.chrome.runtime.onMessage.addListener(function (message, sender, responseFunc) {
          $rootScope.App.WebExtMessage = message;
          $rootScope.OnAppWebExtensionMsg();
        });
      }    
    }    

    return {
      init : function () {
        //setAppHideEvent();
        //setAppShowEvent();
        //setAppReadyEvent();
        //setAppPauseEvent();
        //setAppKeyUpEvent();
        //setAppResumeEvent();
        //setAppResizeEvent();
        //setAppOnlineEvent();
        //setAppKeyDownEvent();
        //setAppMouseUpEvent();
        //setAppOfflineEvent();
        //setAppVolumeUpEvent();
        //setAppMouseDownEvent();
        //setAppVolumeDownEvent();
        //setAppBackButtonEvent();
        //setAppMenuButtonEvent();
        //setAppViewChangeEvent();
        //setAppOrientationEvent();
        //setAppWebExtMsgEvent();
      }
    };
  }
]);

window.App.Module.service
(
  'AppGlobalsService',

  ['$rootScope', '$filter',

  function ($rootScope, $filter) {

    var setGlobals = function () {    
      $rootScope.App = {};
      var s = function (name, method) {
        Object.defineProperty($rootScope.App, name, { get: method });
      };      
      s('Online', function () { return navigator.onLine; });
      s('WeekDay', function () { return new Date().getDay(); });
      s('Event', function () { return window.App.Event || ''; });
      s('OuterWidth', function () { return window.outerWidth; });
      s('InnerWidth', function () { return window.innerWidth; });
      s('InnerHeight', function () { return window.innerHeight; });
      s('OuterHeight', function () { return window.outerHeight; });
      s('Timestamp', function () { return new Date().getTime(); });
      s('Day', function () { return $filter('date')(new Date(), 'dd'); });
      s('Hour', function () { return $filter('date')(new Date(), 'hh'); });
      s('Week', function () { return $filter('date')(new Date(), 'ww'); });
      s('Month', function () { return $filter('date')(new Date(), 'MM'); });
      s('Year', function () { return $filter('date')(new Date(), 'yyyy'); });
      s('Hour24', function () { return $filter('date')(new Date(), 'HH'); });
      s('Minutes', function () { return $filter('date')(new Date(), 'mm'); });
      s('Seconds', function () { return $filter('date')(new Date(), 'ss'); });
      s('DayShort', function () { return $filter('date')(new Date(), 'd'); });
      s('WeekShort', function () { return $filter('date')(new Date(), 'w'); });
      s('HourShort', function () { return $filter('date')(new Date(), 'h'); });
      s('YearShort', function () { return $filter('date')(new Date(), 'yy'); });
      s('MonthShort', function () { return $filter('date')(new Date(), 'M'); });
      s('Hour24Short', function () { return $filter('date')(new Date(), 'H'); });
      s('Fullscreen', function () { return window.BigScreen.element !== null; });
      s('MinutesShort', function () { return $filter('date')(new Date(), 'm'); });
      s('SecondsShort', function () { return $filter('date')(new Date(), 's'); });
      s('Milliseconds', function () { return $filter('date')(new Date(), 'sss'); });
      s('Cordova', function () {  return angular.isUndefined(window.App.Cordova) ? 'true' : 'false'; });
      s('Orientation', function () { return window.innerWidth >= window.innerHeight ? 'landscape' : 'portrait'; });
      s('ActiveControl', function () { return (window.document.activeElement !== null) ? window.document.activeElement.id : ''; });

      
$rootScope.App.DialogView = "";
$rootScope.App.IdleIsIdling = "false";
$rootScope.App.IdleIsRunning = "false";
$rootScope.App.ID = "com.infospace.varad";
$rootScope.App.Name = "Info Space (Created with an unregistered version of DecSoft's App Builder)";
$rootScope.App.ShortName = "Info Space";
$rootScope.App.Version = "1.0.1";
$rootScope.App.Description = "this aapp in an eduational app";
$rootScope.App.AuthorName = "varad";
$rootScope.App.AuthorEmail = "varad615@GMAIL.COM";
$rootScope.App.AuthorUrl = "";
$rootScope.App.LanguageCode = "en";
$rootScope.App.TextDirection = "ltr";
$rootScope.App.BuildNumber = 2;
$rootScope.App.Scaled = "scaled";
$rootScope.App.Theme = "Materia";
$rootScope.App.Themes = ["Default"];
if ($rootScope.App.Themes.indexOf("Materia") == -1) { $rootScope.App.Themes.push("Materia"); }
    };

    return {
      init : function () {
        setGlobals();
      }
    };
  }
]);

window.App.Module.service
(
  'AppControlsService',

  ['$rootScope', '$http', '$sce',

  function ($rootScope, $http, $sce) {

    var setControlVars = function () {
      

$rootScope.Button1 = {};
$rootScope.Button1.ABRole = 2001;
$rootScope.Button1.Hidden = "";
$rootScope.Button1.Title = "";
$rootScope.Button1.TabIndex = -1;
$rootScope.Button1.TooltipText = "";
$rootScope.Button1.TooltipPos = "top";
$rootScope.Button1.PopoverText = "";
$rootScope.Button1.PopoverTitle = "";
$rootScope.Button1.PopoverEvent = "mouseenter";
$rootScope.Button1.PopoverPos = "top";
$rootScope.Button1.Badge = "";
$rootScope.Button1.Icon = "";
$rootScope.Button1.Text = "Venus";
$rootScope.Button1.Class = "btn btn-light btn-md animated flipInX";
$rootScope.Button1.Disabled = "";

$rootScope.Button2 = {};
$rootScope.Button2.ABRole = 2001;
$rootScope.Button2.Hidden = "";
$rootScope.Button2.Title = "";
$rootScope.Button2.TabIndex = -1;
$rootScope.Button2.TooltipText = "";
$rootScope.Button2.TooltipPos = "top";
$rootScope.Button2.PopoverText = "";
$rootScope.Button2.PopoverTitle = "";
$rootScope.Button2.PopoverEvent = "mouseenter";
$rootScope.Button2.PopoverPos = "top";
$rootScope.Button2.Badge = "";
$rootScope.Button2.Icon = "";
$rootScope.Button2.Text = "Mercury";
$rootScope.Button2.Class = "btn btn-light btn-md animated flipInX";
$rootScope.Button2.Disabled = "";

$rootScope.Button3 = {};
$rootScope.Button3.ABRole = 2001;
$rootScope.Button3.Hidden = "";
$rootScope.Button3.Title = "";
$rootScope.Button3.TabIndex = -1;
$rootScope.Button3.TooltipText = "";
$rootScope.Button3.TooltipPos = "top";
$rootScope.Button3.PopoverText = "";
$rootScope.Button3.PopoverTitle = "";
$rootScope.Button3.PopoverEvent = "mouseenter";
$rootScope.Button3.PopoverPos = "top";
$rootScope.Button3.Badge = "";
$rootScope.Button3.Icon = "";
$rootScope.Button3.Text = "Uranus";
$rootScope.Button3.Class = "btn btn-light btn-md animated flipInX";
$rootScope.Button3.Disabled = "";

$rootScope.Button4 = {};
$rootScope.Button4.ABRole = 2001;
$rootScope.Button4.Hidden = "";
$rootScope.Button4.Title = "";
$rootScope.Button4.TabIndex = -1;
$rootScope.Button4.TooltipText = "";
$rootScope.Button4.TooltipPos = "top";
$rootScope.Button4.PopoverText = "";
$rootScope.Button4.PopoverTitle = "";
$rootScope.Button4.PopoverEvent = "mouseenter";
$rootScope.Button4.PopoverPos = "top";
$rootScope.Button4.Badge = "";
$rootScope.Button4.Icon = "";
$rootScope.Button4.Text = "Saturn";
$rootScope.Button4.Class = "btn btn-light btn-md animated flipInX";
$rootScope.Button4.Disabled = "";

$rootScope.Button5 = {};
$rootScope.Button5.ABRole = 2001;
$rootScope.Button5.Hidden = "";
$rootScope.Button5.Title = "";
$rootScope.Button5.TabIndex = -1;
$rootScope.Button5.TooltipText = "";
$rootScope.Button5.TooltipPos = "top";
$rootScope.Button5.PopoverText = "";
$rootScope.Button5.PopoverTitle = "";
$rootScope.Button5.PopoverEvent = "mouseenter";
$rootScope.Button5.PopoverPos = "top";
$rootScope.Button5.Badge = "";
$rootScope.Button5.Icon = "";
$rootScope.Button5.Text = "Jupiter";
$rootScope.Button5.Class = "btn btn-light btn-md animated flipInX";
$rootScope.Button5.Disabled = "";

$rootScope.Button6 = {};
$rootScope.Button6.ABRole = 2001;
$rootScope.Button6.Hidden = "";
$rootScope.Button6.Title = "";
$rootScope.Button6.TabIndex = -1;
$rootScope.Button6.TooltipText = "";
$rootScope.Button6.TooltipPos = "top";
$rootScope.Button6.PopoverText = "";
$rootScope.Button6.PopoverTitle = "";
$rootScope.Button6.PopoverEvent = "mouseenter";
$rootScope.Button6.PopoverPos = "top";
$rootScope.Button6.Badge = "";
$rootScope.Button6.Icon = "";
$rootScope.Button6.Text = "Mars";
$rootScope.Button6.Class = "btn btn-light btn-md animated flipInX";
$rootScope.Button6.Disabled = "";

$rootScope.Button7 = {};
$rootScope.Button7.ABRole = 2001;
$rootScope.Button7.Hidden = "";
$rootScope.Button7.Title = "";
$rootScope.Button7.TabIndex = -1;
$rootScope.Button7.TooltipText = "";
$rootScope.Button7.TooltipPos = "top";
$rootScope.Button7.PopoverText = "";
$rootScope.Button7.PopoverTitle = "";
$rootScope.Button7.PopoverEvent = "mouseenter";
$rootScope.Button7.PopoverPos = "top";
$rootScope.Button7.Badge = "";
$rootScope.Button7.Icon = "";
$rootScope.Button7.Text = "Earth";
$rootScope.Button7.Class = "btn btn-light btn-md animated flipInX";
$rootScope.Button7.Disabled = "";

$rootScope.Button8 = {};
$rootScope.Button8.ABRole = 2001;
$rootScope.Button8.Hidden = "";
$rootScope.Button8.Title = "";
$rootScope.Button8.TabIndex = -1;
$rootScope.Button8.TooltipText = "";
$rootScope.Button8.TooltipPos = "top";
$rootScope.Button8.PopoverText = "";
$rootScope.Button8.PopoverTitle = "";
$rootScope.Button8.PopoverEvent = "mouseenter";
$rootScope.Button8.PopoverPos = "top";
$rootScope.Button8.Badge = "";
$rootScope.Button8.Icon = "";
$rootScope.Button8.Text = "Sun";
$rootScope.Button8.Class = "btn btn-light btn-md animated flipInX";
$rootScope.Button8.Disabled = "";

$rootScope.Button9 = {};
$rootScope.Button9.ABRole = 2001;
$rootScope.Button9.Hidden = "";
$rootScope.Button9.Title = "";
$rootScope.Button9.TabIndex = -1;
$rootScope.Button9.TooltipText = "";
$rootScope.Button9.TooltipPos = "top";
$rootScope.Button9.PopoverText = "";
$rootScope.Button9.PopoverTitle = "";
$rootScope.Button9.PopoverEvent = "mouseenter";
$rootScope.Button9.PopoverPos = "top";
$rootScope.Button9.Badge = "";
$rootScope.Button9.Icon = "";
$rootScope.Button9.Text = "Neptune";
$rootScope.Button9.Class = "btn btn-light btn-md animated flipInX";
$rootScope.Button9.Disabled = "";

$rootScope.Button10 = {};
$rootScope.Button10.ABRole = 2001;
$rootScope.Button10.Hidden = "";
$rootScope.Button10.Title = "";
$rootScope.Button10.TabIndex = -1;
$rootScope.Button10.TooltipText = "";
$rootScope.Button10.TooltipPos = "top";
$rootScope.Button10.PopoverText = "";
$rootScope.Button10.PopoverTitle = "";
$rootScope.Button10.PopoverEvent = "mouseenter";
$rootScope.Button10.PopoverPos = "top";
$rootScope.Button10.Badge = "";
$rootScope.Button10.Icon = "";
$rootScope.Button10.Text = "Pluto";
$rootScope.Button10.Class = "btn btn-light btn-md animated flipInX";
$rootScope.Button10.Disabled = "";

$rootScope.Button11 = {};
$rootScope.Button11.ABRole = 2001;
$rootScope.Button11.Hidden = "";
$rootScope.Button11.Title = "";
$rootScope.Button11.TabIndex = -1;
$rootScope.Button11.TooltipText = "";
$rootScope.Button11.TooltipPos = "top";
$rootScope.Button11.PopoverText = "";
$rootScope.Button11.PopoverTitle = "";
$rootScope.Button11.PopoverEvent = "mouseenter";
$rootScope.Button11.PopoverPos = "top";
$rootScope.Button11.Badge = "";
$rootScope.Button11.Icon = "fa fa-youtube-play";
$rootScope.Button11.Text = "Explore Through Video";
$rootScope.Button11.Class = "btn btn-danger btn-md animated pulse";
$rootScope.Button11.Disabled = "";

$rootScope.HtmlContent2 = {};
$rootScope.HtmlContent2.ABRole = 6001;
$rootScope.HtmlContent2.Hidden = "";
$rootScope.HtmlContent2.Class = "ios-inertial-scroll ";
$rootScope.HtmlContent2.Title = "";
$rootScope.HtmlContent2.TooltipText = "";
$rootScope.HtmlContent2.TooltipPos = "top";
$rootScope.HtmlContent2.PopoverText = "";
$rootScope.HtmlContent2.PopoverEvent = "mouseenter";
$rootScope.HtmlContent2.PopoverTitle = "";
$rootScope.HtmlContent2.PopoverPos = "top";

$rootScope.HtmlContent3 = {};
$rootScope.HtmlContent3.ABRole = 6001;
$rootScope.HtmlContent3.Hidden = "";
$rootScope.HtmlContent3.Class = "ios-inertial-scroll animated bounceIn";
$rootScope.HtmlContent3.Title = "";
$rootScope.HtmlContent3.TooltipText = "";
$rootScope.HtmlContent3.TooltipPos = "top";
$rootScope.HtmlContent3.PopoverText = "";
$rootScope.HtmlContent3.PopoverEvent = "mouseenter";
$rootScope.HtmlContent3.PopoverTitle = "";
$rootScope.HtmlContent3.PopoverPos = "top";

$rootScope.IFrame3 = {};
$rootScope.IFrame3.ABRole = 4001;
$rootScope.IFrame3.Hidden = "";
$rootScope.IFrame3.Url = "sun.html";
$rootScope.IFrame3.Class = "ios-iframe-wrapper ";

$rootScope.Button12 = {};
$rootScope.Button12.ABRole = 2001;
$rootScope.Button12.Hidden = "";
$rootScope.Button12.Title = "";
$rootScope.Button12.TabIndex = -1;
$rootScope.Button12.TooltipText = "";
$rootScope.Button12.TooltipPos = "top";
$rootScope.Button12.PopoverText = "";
$rootScope.Button12.PopoverTitle = "";
$rootScope.Button12.PopoverEvent = "mouseenter";
$rootScope.Button12.PopoverPos = "top";
$rootScope.Button12.Badge = "";
$rootScope.Button12.Icon = "fa fa-arrow-left";
$rootScope.Button12.Text = "Back";
$rootScope.Button12.Class = "btn btn-success btn-md ";
$rootScope.Button12.Disabled = "";

$rootScope.IFrame1 = {};
$rootScope.IFrame1.ABRole = 4001;
$rootScope.IFrame1.Hidden = "";
$rootScope.IFrame1.Url = "merc.html";
$rootScope.IFrame1.Class = "ios-iframe-wrapper ";

$rootScope.Button14 = {};
$rootScope.Button14.ABRole = 2001;
$rootScope.Button14.Hidden = "";
$rootScope.Button14.Title = "";
$rootScope.Button14.TabIndex = -1;
$rootScope.Button14.TooltipText = "";
$rootScope.Button14.TooltipPos = "top";
$rootScope.Button14.PopoverText = "";
$rootScope.Button14.PopoverTitle = "";
$rootScope.Button14.PopoverEvent = "mouseenter";
$rootScope.Button14.PopoverPos = "top";
$rootScope.Button14.Badge = "";
$rootScope.Button14.Icon = "fa fa-arrow-left";
$rootScope.Button14.Text = "Back";
$rootScope.Button14.Class = "btn btn-success btn-md ";
$rootScope.Button14.Disabled = "";

$rootScope.IFrame2 = {};
$rootScope.IFrame2.ABRole = 4001;
$rootScope.IFrame2.Hidden = "";
$rootScope.IFrame2.Url = "venus.html";
$rootScope.IFrame2.Class = "ios-iframe-wrapper ";

$rootScope.Button13 = {};
$rootScope.Button13.ABRole = 2001;
$rootScope.Button13.Hidden = "";
$rootScope.Button13.Title = "";
$rootScope.Button13.TabIndex = -1;
$rootScope.Button13.TooltipText = "";
$rootScope.Button13.TooltipPos = "top";
$rootScope.Button13.PopoverText = "";
$rootScope.Button13.PopoverTitle = "";
$rootScope.Button13.PopoverEvent = "mouseenter";
$rootScope.Button13.PopoverPos = "top";
$rootScope.Button13.Badge = "";
$rootScope.Button13.Icon = "fa fa-arrow-left";
$rootScope.Button13.Text = "Back";
$rootScope.Button13.Class = "btn btn-success btn-md ";
$rootScope.Button13.Disabled = "";

$rootScope.IFrame4 = {};
$rootScope.IFrame4.ABRole = 4001;
$rootScope.IFrame4.Hidden = "";
$rootScope.IFrame4.Url = "earth.html";
$rootScope.IFrame4.Class = "ios-iframe-wrapper ";

$rootScope.Button15 = {};
$rootScope.Button15.ABRole = 2001;
$rootScope.Button15.Hidden = "";
$rootScope.Button15.Title = "";
$rootScope.Button15.TabIndex = -1;
$rootScope.Button15.TooltipText = "";
$rootScope.Button15.TooltipPos = "top";
$rootScope.Button15.PopoverText = "";
$rootScope.Button15.PopoverTitle = "";
$rootScope.Button15.PopoverEvent = "mouseenter";
$rootScope.Button15.PopoverPos = "top";
$rootScope.Button15.Badge = "";
$rootScope.Button15.Icon = "fa fa-arrow-left";
$rootScope.Button15.Text = "Back";
$rootScope.Button15.Class = "btn btn-success btn-md ";
$rootScope.Button15.Disabled = "";

$rootScope.IFrame5 = {};
$rootScope.IFrame5.ABRole = 4001;
$rootScope.IFrame5.Hidden = "";
$rootScope.IFrame5.Url = "mars.html";
$rootScope.IFrame5.Class = "ios-iframe-wrapper ";

$rootScope.Button16 = {};
$rootScope.Button16.ABRole = 2001;
$rootScope.Button16.Hidden = "";
$rootScope.Button16.Title = "";
$rootScope.Button16.TabIndex = -1;
$rootScope.Button16.TooltipText = "";
$rootScope.Button16.TooltipPos = "top";
$rootScope.Button16.PopoverText = "";
$rootScope.Button16.PopoverTitle = "";
$rootScope.Button16.PopoverEvent = "mouseenter";
$rootScope.Button16.PopoverPos = "top";
$rootScope.Button16.Badge = "";
$rootScope.Button16.Icon = "fa fa-arrow-left";
$rootScope.Button16.Text = "Back";
$rootScope.Button16.Class = "btn btn-success btn-md ";
$rootScope.Button16.Disabled = "";

$rootScope.IFrame6 = {};
$rootScope.IFrame6.ABRole = 4001;
$rootScope.IFrame6.Hidden = "";
$rootScope.IFrame6.Url = "jupi.html";
$rootScope.IFrame6.Class = "ios-iframe-wrapper ";

$rootScope.Button17 = {};
$rootScope.Button17.ABRole = 2001;
$rootScope.Button17.Hidden = "";
$rootScope.Button17.Title = "";
$rootScope.Button17.TabIndex = -1;
$rootScope.Button17.TooltipText = "";
$rootScope.Button17.TooltipPos = "top";
$rootScope.Button17.PopoverText = "";
$rootScope.Button17.PopoverTitle = "";
$rootScope.Button17.PopoverEvent = "mouseenter";
$rootScope.Button17.PopoverPos = "top";
$rootScope.Button17.Badge = "";
$rootScope.Button17.Icon = "fa fa-arrow-left";
$rootScope.Button17.Text = "Back";
$rootScope.Button17.Class = "btn btn-success btn-md ";
$rootScope.Button17.Disabled = "";

$rootScope.IFrame7 = {};
$rootScope.IFrame7.ABRole = 4001;
$rootScope.IFrame7.Hidden = "";
$rootScope.IFrame7.Url = "sat.html";
$rootScope.IFrame7.Class = "ios-iframe-wrapper ";

$rootScope.Button18 = {};
$rootScope.Button18.ABRole = 2001;
$rootScope.Button18.Hidden = "";
$rootScope.Button18.Title = "";
$rootScope.Button18.TabIndex = -1;
$rootScope.Button18.TooltipText = "";
$rootScope.Button18.TooltipPos = "top";
$rootScope.Button18.PopoverText = "";
$rootScope.Button18.PopoverTitle = "";
$rootScope.Button18.PopoverEvent = "mouseenter";
$rootScope.Button18.PopoverPos = "top";
$rootScope.Button18.Badge = "";
$rootScope.Button18.Icon = "fa fa-arrow-left";
$rootScope.Button18.Text = "Back";
$rootScope.Button18.Class = "btn btn-success btn-md ";
$rootScope.Button18.Disabled = "";

$rootScope.IFrame8 = {};
$rootScope.IFrame8.ABRole = 4001;
$rootScope.IFrame8.Hidden = "";
$rootScope.IFrame8.Url = "ura.html";
$rootScope.IFrame8.Class = "ios-iframe-wrapper ";

$rootScope.Button19 = {};
$rootScope.Button19.ABRole = 2001;
$rootScope.Button19.Hidden = "";
$rootScope.Button19.Title = "";
$rootScope.Button19.TabIndex = -1;
$rootScope.Button19.TooltipText = "";
$rootScope.Button19.TooltipPos = "top";
$rootScope.Button19.PopoverText = "";
$rootScope.Button19.PopoverTitle = "";
$rootScope.Button19.PopoverEvent = "mouseenter";
$rootScope.Button19.PopoverPos = "top";
$rootScope.Button19.Badge = "";
$rootScope.Button19.Icon = "fa fa-arrow-left";
$rootScope.Button19.Text = "Back";
$rootScope.Button19.Class = "btn btn-success btn-md ";
$rootScope.Button19.Disabled = "";

$rootScope.IFrame9 = {};
$rootScope.IFrame9.ABRole = 4001;
$rootScope.IFrame9.Hidden = "";
$rootScope.IFrame9.Url = "nep.html";
$rootScope.IFrame9.Class = "ios-iframe-wrapper ";

$rootScope.Button20 = {};
$rootScope.Button20.ABRole = 2001;
$rootScope.Button20.Hidden = "";
$rootScope.Button20.Title = "";
$rootScope.Button20.TabIndex = -1;
$rootScope.Button20.TooltipText = "";
$rootScope.Button20.TooltipPos = "top";
$rootScope.Button20.PopoverText = "";
$rootScope.Button20.PopoverTitle = "";
$rootScope.Button20.PopoverEvent = "mouseenter";
$rootScope.Button20.PopoverPos = "top";
$rootScope.Button20.Badge = "";
$rootScope.Button20.Icon = "fa fa-arrow-left";
$rootScope.Button20.Text = "Back";
$rootScope.Button20.Class = "btn btn-success btn-md ";
$rootScope.Button20.Disabled = "";

$rootScope.IFrame10 = {};
$rootScope.IFrame10.ABRole = 4001;
$rootScope.IFrame10.Hidden = "";
$rootScope.IFrame10.Url = "plu.html";
$rootScope.IFrame10.Class = "ios-iframe-wrapper ";

$rootScope.Button21 = {};
$rootScope.Button21.ABRole = 2001;
$rootScope.Button21.Hidden = "";
$rootScope.Button21.Title = "";
$rootScope.Button21.TabIndex = -1;
$rootScope.Button21.TooltipText = "";
$rootScope.Button21.TooltipPos = "top";
$rootScope.Button21.PopoverText = "";
$rootScope.Button21.PopoverTitle = "";
$rootScope.Button21.PopoverEvent = "mouseenter";
$rootScope.Button21.PopoverPos = "top";
$rootScope.Button21.Badge = "";
$rootScope.Button21.Icon = "fa fa-arrow-left";
$rootScope.Button21.Text = "Back";
$rootScope.Button21.Class = "btn btn-success btn-md ";
$rootScope.Button21.Disabled = "";

$rootScope.Button22 = {};
$rootScope.Button22.ABRole = 2001;
$rootScope.Button22.Hidden = "";
$rootScope.Button22.Title = "";
$rootScope.Button22.TabIndex = -1;
$rootScope.Button22.TooltipText = "";
$rootScope.Button22.TooltipPos = "top";
$rootScope.Button22.PopoverText = "";
$rootScope.Button22.PopoverTitle = "";
$rootScope.Button22.PopoverEvent = "mouseenter";
$rootScope.Button22.PopoverPos = "top";
$rootScope.Button22.Badge = "";
$rootScope.Button22.Icon = "fa fa-arrow-left";
$rootScope.Button22.Text = "Back";
$rootScope.Button22.Class = "btn btn-success btn-md ";
$rootScope.Button22.Disabled = "";

$rootScope.IFrame11 = {};
$rootScope.IFrame11.ABRole = 4001;
$rootScope.IFrame11.Hidden = "";
$rootScope.IFrame11.Url = "site.html";
$rootScope.IFrame11.Class = "ios-iframe-wrapper ";
    };

    return {
      init : function () {
        setControlVars();
      }
    };
  }
]);

window.App.Plugins = {};

window.App.Module.service
(
  'AppPluginsService',

  ['$rootScope',

  function ($rootScope) {

    var setupPlugins = function () {
      Object.keys(window.App.Plugins).forEach(function (plugin) {
        if (angular.isFunction (window.App.Plugins[plugin])) {
          plugin = window.App.Plugins[plugin].call();
          if (angular.isFunction (plugin.PluginSetupEvent)) {
            plugin.PluginSetupEvent();
          }
          if (angular.isFunction (plugin.PluginDocumentReadyEvent)) {
            angular.element(window.document).ready(
             plugin.PluginDocumentReadyEvent);
          }
          if (angular.isUndefined(window.App.Cordova) &&
           angular.isFunction (plugin.PluginAppReadyEvent)) {
             document.addEventListener('deviceready',
              plugin.PluginAppReadyEvent, false);
          }
        }
      });
    };

    return {
      init : function () {
        setupPlugins();
      }
    };
  }
]);

window.App.Ctrls = angular.module('AppCtrls', []);

window.App.Ctrls.controller
(
  'AppCtrl',

  ['$scope', '$rootScope', '$location', '$uibModal', '$http', '$sce', '$timeout', '$window', '$document', 'blockUI', '$uibPosition',
    'AppEventsService', 'AppGlobalsService', 'AppControlsService', 'AppPluginsService',

  function ($scope, $rootScope, $location, $uibModal, $http, $sce, $timeout, $window, $document, blockUI, $uibPosition,
   AppEventsService, AppGlobalsService, AppControlsService, AppPluginsService) {

    window.App.Scope = $scope;
    window.App.RootScope = $rootScope;

    AppEventsService.init();
    AppGlobalsService.init();
    AppControlsService.init();
    AppPluginsService.init();

    $scope.showView = function (viewName) {
      window.App.Modal.closeAll();
      $rootScope.App.CurrentView = viewName;      
      $rootScope.App.DialogView = '';
      $location.path(viewName);
    };

    $scope.replaceView = function (viewName) {
      window.App.Modal.closeAll();
      $rootScope.App.DialogView = '';
      $rootScope.App.CurrentView = viewName;            
      $location.path(viewName).replace();
    };

    $scope.showModalView = function (viewName, callback) {
      var
        execCallback = null,
        modal = window.App.Modal.insert(viewName);

      $rootScope.App.DialogView = viewName;

      modal.instance = $uibModal.open
      ({
        size: 'lg',
        scope: $scope,
        keyboard: false,
        animation: false,
        backdrop: 'static',
        windowClass: 'dialogView',
        controller: viewName + 'Ctrl',
        templateUrl: 'app/views/' + viewName + '.html'
      });
      execCallback = function (modalResult) {
        window.App.Modal.removeCurrent();
        if (angular.isFunction (callback)) {
          callback(modalResult);
        }
      };
      modal.instance.result.then(
        function (modalResult){execCallback(modalResult);},
        function (modalResult){execCallback(modalResult);}
      );
    };

    $scope.closeModalView = function (modalResult) {
      var
        modal = window.App.Modal.getCurrent();

      $rootScope.App.DialogView = '';

      if (modal !== null) {
        window.App.Modal.getCurrent().close(modalResult);
      }
    };

    $scope.loadVariables = function (text) {

      var
        setVar = function (name, value) {
          var
            newName = '',
            dotPos = name.indexOf('.');

          if (dotPos !== -1) {
            newName = name.split('.');
            if (newName.length === 2) {
              $rootScope[newName[0].trim()][newName[1].trim()] = value;
            } else if (newName.length === 3) {
              // We support up to 3 levels here
              $rootScope[newName[0].trim()][newName[1].trim()][newName[2].trim()] = value;
            }
          } else {
            $rootScope[name] = value;
          }
        };

      var
        varName = '',
        varValue = '',
        isArray = false,
        text = text || '',
        separatorPos = -1;

      angular.forEach(text.split('\n'), function (value, key) {
        separatorPos = value.indexOf('=');
        if ((value.trim() !== '') && (value.substr(0, 1) !== ';') && (separatorPos !== -1)) {
          varName = value.substr(0, separatorPos).trim();
          if (varName !== '') {
            varValue = value.substr(separatorPos + 1, value.length).trim();
            isArray = varValue.substr(0, 1) === '|';
            if (!isArray) {
              setVar(varName, varValue);
            } else {
              setVar(varName, varValue.substr(1, varValue.length).split('|'));
            }
          }
        }
      });
    };

    $scope.alertBox = function (content, type) {
      var
        aType = type || 'info',
        modal = window.App.Modal.insert('builder/views/alertBox.html');

      modal.instance = $uibModal.open
      ({
        size: 'lg',
        scope: $scope,
        keyboard: true,
        animation: false,
        controller: 'AppDialogsCtrl',
        templateUrl: 'builder/views/alertBox.html',
        resolve: {
          properties: function () {
            return {
              Type: aType,
              Content: content
            };
          }
        }
      });
      modal.instance.result.then(null, function () {
        window.App.Modal.removeCurrent();
      });
    };

    $scope.inputBox = function (header, buttons,
     inputVar, defaultVal, type, callback) {
      var
        execCallback = null,
        aType = type || 'info',
        aButtons = buttons || 'Ok|Cancel',
        modal = window.App.Modal.insert('builder/views/inputBox.html');

      $rootScope[inputVar] = defaultVal;

      modal.instance = $uibModal.open
      ({
        size: 'lg',
        scope: $scope,
        keyboard: false,
        animation: false,
        backdrop: 'static',
        controller: 'AppDialogsCtrl',
        templateUrl: 'builder/views/inputBox.html',
        resolve: {
          properties: function () {
            return {
              Type: aType,
              Header: header,
              Buttons: aButtons.split('|'),
              InputVar: $rootScope.inputVar
            };
          }
        }
      });
      execCallback = function (modalResult) {
        window.App.Modal.removeCurrent();
        if (angular.isFunction (callback)) {
          callback(modalResult, $rootScope[inputVar]);
        }
      };
      modal.instance.result.then(
        function (modalResult){execCallback(modalResult);},
        function (modalResult){execCallback(modalResult);}
      );
    };

    $scope.messageBox = function (header,
     content, buttons, type, callback) {
      var
        execCallback = null,
        aType = type || 'info',
        aButtons = buttons || 'Ok',
        modal = window.App.Modal.insert('builder/views/messageBox.html');

      modal.instance = $uibModal.open
      ({
        size: 'lg',
        scope: $scope,
        keyboard: false,
        animation: false,
        backdrop: 'static',
        controller: 'AppDialogsCtrl',
        templateUrl: 'builder/views/messageBox.html',
        resolve: {
          properties: function () {
            return {
              Type: aType,
              Header: header,
              Content: content,
              Buttons: aButtons.split('|')
            };
          }
        }
      });
      execCallback = function (modalResult) {
        window.App.Modal.removeCurrent();
        if (angular.isFunction (callback)) {
          callback(modalResult);
        }
      };
      modal.instance.result.then(
        function (modalResult){execCallback(modalResult);},
        function (modalResult){execCallback(modalResult);}
      );
    };

    $scope.alert = function (title, text) {
      if (window.App.Cordova || !('notification' in navigator)) {
        window.alert(text);
      } else {
        navigator.notification.alert(
         text, null, title, null);
      }
    };

    $scope.confirm = function (title, text, callback) {
      if (window.App.Cordova || !('notification' in navigator)) {
        callback(window.confirm(text));
      } else {
        navigator.notification.confirm
        (
          text,
          function (btnIndex) {
            callback(btnIndex === 1);
          },
          title,
          null
        );
      }
    };

    $scope.prompt = function (title, text, defaultVal, callback) {
      if (window.App.Cordova || !('notification' in navigator)) {
        var
          result = window.prompt(text, defaultVal);
        callback(result !== null, result);
      } else {
        navigator.notification.prompt(
          text,
          function (result) {
            callback(result.buttonIndex === 1, result.input1);
          },
          title,
          null,
          defaultVal
        );
      }
    };

    $scope.beep = function (times) {
      if (window.App.Cordova || !('notification' in navigator)) {
        window.App.Utils.playSound
        (
          'builder/sounds/beep/beep.mp3',
          'builder/sounds/beep/beep.ogg'
        );
      } else {
        navigator.notification.beep(times);
      }
    };

    $scope.vibrate = function (milliseconds) {
      if (window.App.Cordova || !('notification' in navigator)) {
        var
          body = angular.element(document.body);
        body.addClass('animated shake');
        setTimeout(function () {
          body.removeClass('animated shake');
        }, milliseconds);
      } else {
        navigator.vibrate(milliseconds);
      }
    };

    $scope.setLocalOption = function (key, value) {
      window.localStorage.setItem(key, value);
    };

    $scope.getLocalOption = function (key) {
      return window.localStorage.getItem(key) || '';
    };

    $scope.removeLocalOption = function (key) {
      window.localStorage.removeItem(key);
    };

    $scope.clearLocalOptions = function () {
      window.localStorage.clear();
    };

    $scope.log = function (text, lineNum) {
      window.App.Debugger.log(text, lineNum);
    };

    $window.TriggerAppOrientationEvent = function () {
      $rootScope.OnAppOrientation();
      $rootScope.$apply();
    };

    $scope.idleStart = function (seconds) {

      $scope.idleStop();
      $rootScope.App.IdleIsIdling = false;

      if($rootScope.App._IdleSeconds !== seconds) {
        $rootScope.App._IdleSeconds = seconds;
      }

      $document.on('mousemove mousedown mousewheel keydown scroll touchstart touchmove DOMMouseScroll', $scope._resetIdle);

      $rootScope.App.IdleIsRunning = true;

      $rootScope.App._IdleTimer = setTimeout(function () {
        $rootScope.App.IdleIsIdling = true;
        $rootScope.OnAppIdleStart();
        $scope.$apply();
      }, $rootScope.App._IdleSeconds * 1000);
    };

    $scope._resetIdle = function () {
      if($rootScope.App.IdleIsIdling) {
        $rootScope.OnAppIdleEnd();
        $rootScope.App.IdleIsIdling = false;
        $scope.$apply();
      }
      $scope.idleStart($rootScope.App._IdleSeconds);
    };

    $scope.idleStop = function () {
      $document.off('mousemove mousedown mousewheel keydown scroll touchstart touchmove DOMMouseScroll', $scope._resetIdle);
      clearTimeout($rootScope.App._IdleTimer);
      $rootScope.App.IdleIsRunning = false;
    };

    $scope.trustSrc = function (src) {
      return $sce.trustAsResourceUrl(src);
    };

    $scope.openWindow = function (url, showLocation, target) {
      var
        options = 'location=';

      if (showLocation) {
        options += 'yes';
      } else {
        options += 'no';
      }

      if (window.App.Cordova) {
        options += ', width=500, height=500, resizable=yes, scrollbars=yes';
      }

      return window.open(url, target, options);
    };

    $scope.closeWindow = function (winRef) {
      if (angular.isObject(winRef) && angular.isFunction (winRef.close)) {
        winRef.close();
      }
    };    
    
    $scope.fileDownload = function(url, subdir, fileName,
     privatelly, headers, errorCallback, successCallback) {
     
      if (window.App.Cordova) {
        if (angular.isFunction(errorCallback)) { 
          errorCallback('-1'); 
        }
        return;
      }
      
      var
        ft = new FileTransfer(),
        root = privatelly.toString() === 'true' ? cordova.file.dataDirectory :
         (device.platform.toLowerCase() === 'ios') ?
          cordova.file.documentsDirectory : cordova.file.externalRootDirectory;

      window.resolveLocalFileSystemURL(root, function (dir) {
        dir.getDirectory(subdir, { create: true, exclusive: false }, function (downloadDir) {
          downloadDir.getFile(fileName, { create: true, exclusive: false }, function (file) {
            ft.download(url, file.toURL(), function(entry) { 
              if (angular.isFunction(successCallback)) { successCallback(entry.toURL(), entry); } 
            }, 
            function(error) {
              if (angular.isFunction(errorCallback)) { errorCallback(4, error); }               
            }, 
            false, 
            { "headers": angular.isObject(headers) ? headers : {} });
          }, 
          function(error) {
            if (angular.isFunction(errorCallback)) { 
              errorCallback(3, error); 
            }               
          });
        }, 
        function(error) {
          if (angular.isFunction(errorCallback)) { 
            errorCallback(2, error); 
          }               
        });
      }, 
      function(error) {
        if (angular.isFunction(errorCallback)) { 
          errorCallback(1, error); 
        }               
      });
    };        

   
}]);

window.App.Ctrls.controller
(
  'AppDialogsCtrl',

  ['$scope', 'properties',

  function ($scope, properties) {
    $scope.Properties = properties;
  }
]);

window.App.Ctrls.controller
(
  'AppEventsCtrl',

  ['$scope', '$rootScope', '$location', '$uibModal', '$http', '$sce', '$timeout', '$window', '$document', 'blockUI', '$uibPosition',

  function ($scope, $rootScope, $location, $uibModal, $http, $sce, $timeout, $window, $document, blockUI, $uibPosition) {

    $rootScope.OnAppHide = function () {
      //__APP_HIDE_EVENT
    };
    
    $rootScope.OnAppShow = function () {
      //__APP_SHOW_EVENT
    };    

    $rootScope.OnAppReady = function () {
      //__APP_READY_EVENT
    };

    $rootScope.OnAppPause = function () {
      //__APP_PAUSE_EVENT
    };

    $rootScope.OnAppKeyUp = function () {
      //__APP_KEY_UP_EVENT
    };

    $rootScope.OnAppKeyDown = function () {
      //__APP_KEY_DOWN_EVENT
    };

    $rootScope.OnAppMouseUp = function () {
      //__APP_MOUSE_UP_EVENT
    };

    $rootScope.OnAppMouseDown = function () {
      //__APP_MOUSE_DOWN_EVENT
    };

    $rootScope.OnAppError = function () {
      //__APP_ERROR_EVENT
    };

    $rootScope.OnAppResize = function () {
      //__APP_RESIZE_EVENT
    };

    $rootScope.OnAppResume = function () {
      //__APP_RESUME_EVENT
    };

    $rootScope.OnAppOnline = function () {
      //__APP_ONLINE_EVENT
    };

    $rootScope.OnAppOffline = function () {
      //__APP_OFFLINE_EVENT
    };

    $rootScope.OnAppIdleEnd = function () {
      //__APP_IDLE_END_EVENT
    };

    $rootScope.OnAppIdleStart = function () {
      //__APP_IDLE_START_EVENT
    };

    $rootScope.OnAppBackButton = function () {
      //__APP_BACK_BUTTON_EVENT
    };

    $rootScope.OnAppMenuButton = function () {
      //__APP_MENU_BUTTON_EVENT
    };

    $rootScope.OnAppViewChange = function () {
      //__APP_VIEW_CHANGE_EVENT
    };

    $rootScope.OnAppOrientation = function () {
      //__APP_ORIENTATION_EVENT
    };

    $rootScope.OnAppVolumeUpButton = function () {
      //__APP_VOLUME_UP_EVENT
    };

    $rootScope.OnAppVolumeDownButton = function () {
      //__APP_VOLUME_DOWN_EVENT
    };
    
    $rootScope.OnAppWebExtensionMsg = function () {
      //__APP_WEBEXTENSION_MSG_EVENT
    };    
  }
]);

angular.element(window.document).ready(function () {
  angular.bootstrap(window.document, ['AppModule']);
});

window.App.Ctrls.controller("homeCtrl", ["$scope", "$rootScope", "$sce", "$timeout", "$interval", "$http", "$uibPosition", "blockUI",

function($scope, $rootScope, $sce, $timeout, $interval, $http, $position, blockUI) {

$rootScope.home = {};
$rootScope.home.ABView = true;

window.App.home = {};
window.App.home.Scope = $scope;
$rootScope.App.CurrentView = "home";

angular.element(window.document).ready(function(event){
angular.element(document.querySelector("body")).addClass($rootScope.App.Theme.toLowerCase());
});

angular.element(window.document).ready(function(event){
$rootScope.home.Event = event;

window.App.Debugger.log("Start of home Show event", "info", -1);

window.App.Debugger.log("ArrayClear \x22[ThemeSelect.Items]\x22", "info", 1);

$rootScope.ThemeSelect.Items = [];

window.App.Debugger.log("ArrayConcat \x22[App.Themes]\x22 \x22[ThemeSelect.Items]\x22 \x22[ThemeSelect.Items]\x22", "info", 2);

$rootScope.ThemeSelect.Items = $rootScope.App.Themes.concat($rootScope.ThemeSelect.Items);

window.App.Debugger.log("ArrayIndexOf \x22[ThemeSelect.Items]\x22 \x22[App.Theme]\x22 \x22[ThemeSelect.ItemIndex]\x22", "info", 3);

$rootScope.ThemeSelect.ItemIndex = $rootScope.ThemeSelect.Items.indexOf($rootScope.App.Theme);

window.App.Debugger.log("End of home Show event", "info", -2);

$rootScope.$apply();
});

$scope.Button1Click = function($event) {
$rootScope.Button1.Event = $event;

window.App.Debugger.log("Start of Button1 Click event", "info", -1);

window.App.Debugger.log("ReplaceView \x22Venus\x22", "info", 1);

$scope.replaceView("Venus");

window.App.Debugger.log("End of Button1 Click event", "info", -2);

};

$scope.Button2Click = function($event) {
$rootScope.Button2.Event = $event;

window.App.Debugger.log("Start of Button2 Click event", "info", -1);

window.App.Debugger.log("ReplaceView \x22Merc\x22", "info", 1);

$scope.replaceView("Merc");

window.App.Debugger.log("End of Button2 Click event", "info", -2);

};

$scope.Button3Click = function($event) {
$rootScope.Button3.Event = $event;

window.App.Debugger.log("Start of Button3 Click event", "info", -1);

window.App.Debugger.log("ReplaceView \x22ura\x22", "info", 1);

$scope.replaceView("ura");

window.App.Debugger.log("End of Button3 Click event", "info", -2);

};

$scope.Button4Click = function($event) {
$rootScope.Button4.Event = $event;

window.App.Debugger.log("Start of Button4 Click event", "info", -1);

window.App.Debugger.log("ReplaceView \x22sat\x22", "info", 1);

$scope.replaceView("sat");

window.App.Debugger.log("End of Button4 Click event", "info", -2);

};

$scope.Button5Click = function($event) {
$rootScope.Button5.Event = $event;

window.App.Debugger.log("Start of Button5 Click event", "info", -1);

window.App.Debugger.log("ReplaceView \x22jupi\x22", "info", 1);

$scope.replaceView("jupi");

window.App.Debugger.log("End of Button5 Click event", "info", -2);

};

$scope.Button6Click = function($event) {
$rootScope.Button6.Event = $event;

window.App.Debugger.log("Start of Button6 Click event", "info", -1);

window.App.Debugger.log("ReplaceView \x22mars\x22", "info", 1);

$scope.replaceView("mars");

window.App.Debugger.log("End of Button6 Click event", "info", -2);

};

$scope.Button7Click = function($event) {
$rootScope.Button7.Event = $event;

window.App.Debugger.log("Start of Button7 Click event", "info", -1);

window.App.Debugger.log("ReplaceView \x22Earth\x22", "info", 1);

$scope.replaceView("Earth");

window.App.Debugger.log("End of Button7 Click event", "info", -2);

};

$scope.Button8Click = function($event) {
$rootScope.Button8.Event = $event;

window.App.Debugger.log("Start of Button8 Click event", "info", -1);

window.App.Debugger.log("ReplaceView \x22sun\x22", "info", 1);

$scope.replaceView("sun");

window.App.Debugger.log("End of Button8 Click event", "info", -2);

};

$scope.Button9Click = function($event) {
$rootScope.Button9.Event = $event;

window.App.Debugger.log("Start of Button9 Click event", "info", -1);

window.App.Debugger.log("ReplaceView \x22nep\x22", "info", 1);

$scope.replaceView("nep");

window.App.Debugger.log("End of Button9 Click event", "info", -2);

};

$scope.Button10Click = function($event) {
$rootScope.Button10.Event = $event;

window.App.Debugger.log("Start of Button10 Click event", "info", -1);

window.App.Debugger.log("ReplaceView \x22plu\x22", "info", 1);

$scope.replaceView("plu");

window.App.Debugger.log("End of Button10 Click event", "info", -2);

};

$scope.Button11Click = function($event) {
$rootScope.Button11.Event = $event;

window.App.Debugger.log("Start of Button11 Click event", "info", -1);

window.App.Debugger.log("ReplaceView \x22vid\x22", "info", 1);

$scope.replaceView("vid");

window.App.Debugger.log("End of Button11 Click event", "info", -2);

};

}]);

window.App.Ctrls.controller("sunCtrl", ["$scope", "$rootScope", "$sce", "$timeout", "$interval", "$http", "$uibPosition", "blockUI",

function($scope, $rootScope, $sce, $timeout, $interval, $http, $position, blockUI) {

$rootScope.sun = {};
$rootScope.sun.ABView = true;

window.App.sun = {};
window.App.sun.Scope = $scope;

$scope.Button12Click = function($event) {
$rootScope.Button12.Event = $event;

window.App.Debugger.log("Start of Button12 Click event", "info", -1);

window.App.Debugger.log("ReplaceView \x22home\x22", "info", 1);

$scope.replaceView("home");

window.App.Debugger.log("End of Button12 Click event", "info", -2);

};

}]);

window.App.Ctrls.controller("MercCtrl", ["$scope", "$rootScope", "$sce", "$timeout", "$interval", "$http", "$uibPosition", "blockUI",

function($scope, $rootScope, $sce, $timeout, $interval, $http, $position, blockUI) {

$rootScope.Merc = {};
$rootScope.Merc.ABView = true;

window.App.Merc = {};
window.App.Merc.Scope = $scope;

$scope.Button14Click = function($event) {
$rootScope.Button14.Event = $event;

window.App.Debugger.log("Start of Button14 Click event", "info", -1);

window.App.Debugger.log("ReplaceView \x22home\x22", "info", 1);

$scope.replaceView("home");

window.App.Debugger.log("End of Button14 Click event", "info", -2);

};

}]);

window.App.Ctrls.controller("VenusCtrl", ["$scope", "$rootScope", "$sce", "$timeout", "$interval", "$http", "$uibPosition", "blockUI",

function($scope, $rootScope, $sce, $timeout, $interval, $http, $position, blockUI) {

$rootScope.Venus = {};
$rootScope.Venus.ABView = true;

window.App.Venus = {};
window.App.Venus.Scope = $scope;

$scope.Button13Click = function($event) {
$rootScope.Button13.Event = $event;

window.App.Debugger.log("Start of Button13 Click event", "info", -1);

window.App.Debugger.log("ReplaceView \x22home\x22", "info", 1);

$scope.replaceView("home");

window.App.Debugger.log("End of Button13 Click event", "info", -2);

};

}]);

window.App.Ctrls.controller("EarthCtrl", ["$scope", "$rootScope", "$sce", "$timeout", "$interval", "$http", "$uibPosition", "blockUI",

function($scope, $rootScope, $sce, $timeout, $interval, $http, $position, blockUI) {

$rootScope.Earth = {};
$rootScope.Earth.ABView = true;

window.App.Earth = {};
window.App.Earth.Scope = $scope;

$scope.Button15Click = function($event) {
$rootScope.Button15.Event = $event;

window.App.Debugger.log("Start of Button15 Click event", "info", -1);

window.App.Debugger.log("ReplaceView \x22home\x22", "info", 1);

$scope.replaceView("home");

window.App.Debugger.log("End of Button15 Click event", "info", -2);

};

}]);

window.App.Ctrls.controller("marsCtrl", ["$scope", "$rootScope", "$sce", "$timeout", "$interval", "$http", "$uibPosition", "blockUI",

function($scope, $rootScope, $sce, $timeout, $interval, $http, $position, blockUI) {

$rootScope.mars = {};
$rootScope.mars.ABView = true;

window.App.mars = {};
window.App.mars.Scope = $scope;

$scope.Button16Click = function($event) {
$rootScope.Button16.Event = $event;

window.App.Debugger.log("Start of Button16 Click event", "info", -1);

window.App.Debugger.log("ReplaceView \x22home\x22", "info", 1);

$scope.replaceView("home");

window.App.Debugger.log("End of Button16 Click event", "info", -2);

};

}]);

window.App.Ctrls.controller("jupiCtrl", ["$scope", "$rootScope", "$sce", "$timeout", "$interval", "$http", "$uibPosition", "blockUI",

function($scope, $rootScope, $sce, $timeout, $interval, $http, $position, blockUI) {

$rootScope.jupi = {};
$rootScope.jupi.ABView = true;

window.App.jupi = {};
window.App.jupi.Scope = $scope;

$scope.Button17Click = function($event) {
$rootScope.Button17.Event = $event;

window.App.Debugger.log("Start of Button17 Click event", "info", -1);

window.App.Debugger.log("ReplaceView \x22home\x22", "info", 1);

$scope.replaceView("home");

window.App.Debugger.log("End of Button17 Click event", "info", -2);

};

}]);

window.App.Ctrls.controller("satCtrl", ["$scope", "$rootScope", "$sce", "$timeout", "$interval", "$http", "$uibPosition", "blockUI",

function($scope, $rootScope, $sce, $timeout, $interval, $http, $position, blockUI) {

$rootScope.sat = {};
$rootScope.sat.ABView = true;

window.App.sat = {};
window.App.sat.Scope = $scope;

$scope.Button18Click = function($event) {
$rootScope.Button18.Event = $event;

window.App.Debugger.log("Start of Button18 Click event", "info", -1);

window.App.Debugger.log("ReplaceView \x22home\x22", "info", 1);

$scope.replaceView("home");

window.App.Debugger.log("End of Button18 Click event", "info", -2);

};

}]);

window.App.Ctrls.controller("uraCtrl", ["$scope", "$rootScope", "$sce", "$timeout", "$interval", "$http", "$uibPosition", "blockUI",

function($scope, $rootScope, $sce, $timeout, $interval, $http, $position, blockUI) {

$rootScope.ura = {};
$rootScope.ura.ABView = true;

window.App.ura = {};
window.App.ura.Scope = $scope;

$scope.Button19Click = function($event) {
$rootScope.Button19.Event = $event;

window.App.Debugger.log("Start of Button19 Click event", "info", -1);

window.App.Debugger.log("ReplaceView \x22home\x22", "info", 1);

$scope.replaceView("home");

window.App.Debugger.log("End of Button19 Click event", "info", -2);

};

}]);

window.App.Ctrls.controller("nepCtrl", ["$scope", "$rootScope", "$sce", "$timeout", "$interval", "$http", "$uibPosition", "blockUI",

function($scope, $rootScope, $sce, $timeout, $interval, $http, $position, blockUI) {

$rootScope.nep = {};
$rootScope.nep.ABView = true;

window.App.nep = {};
window.App.nep.Scope = $scope;

$scope.Button20Click = function($event) {
$rootScope.Button20.Event = $event;

window.App.Debugger.log("Start of Button20 Click event", "info", -1);

window.App.Debugger.log("ReplaceView \x22home\x22", "info", 1);

$scope.replaceView("home");

window.App.Debugger.log("End of Button20 Click event", "info", -2);

};

}]);

window.App.Ctrls.controller("pluCtrl", ["$scope", "$rootScope", "$sce", "$timeout", "$interval", "$http", "$uibPosition", "blockUI",

function($scope, $rootScope, $sce, $timeout, $interval, $http, $position, blockUI) {

$rootScope.plu = {};
$rootScope.plu.ABView = true;

window.App.plu = {};
window.App.plu.Scope = $scope;

$scope.Button21Click = function($event) {
$rootScope.Button21.Event = $event;

window.App.Debugger.log("Start of Button21 Click event", "info", -1);

window.App.Debugger.log("ReplaceView \x22home\x22", "info", 1);

$scope.replaceView("home");

window.App.Debugger.log("End of Button21 Click event", "info", -2);

};

}]);

window.App.Ctrls.controller("vidCtrl", ["$scope", "$rootScope", "$sce", "$timeout", "$interval", "$http", "$uibPosition", "blockUI",

function($scope, $rootScope, $sce, $timeout, $interval, $http, $position, blockUI) {

$rootScope.vid = {};
$rootScope.vid.ABView = true;

window.App.vid = {};
window.App.vid.Scope = $scope;

$scope.Button22Click = function($event) {
$rootScope.Button22.Event = $event;

window.App.Debugger.log("Start of Button22 Click event", "info", -1);

window.App.Debugger.log("ReplaceView \x22home\x22", "info", 1);

$scope.replaceView("home");

window.App.Debugger.log("End of Button22 Click event", "info", -2);

};

}]);

window.App.Ctrls.controller("View13Ctrl", ["$scope", "$rootScope", "$sce", "$timeout", "$interval", "$http", "$uibPosition", "blockUI",

function($scope, $rootScope, $sce, $timeout, $interval, $http, $position, blockUI) {

$rootScope.View13 = {};
$rootScope.View13.ABView = true;

window.App.View13 = {};
window.App.View13.Scope = $scope;

}]);
