/**
 * SimpleFlux ES5 Flux library version 1.0
 * Copyright 2016 Gus Cost, MIT License
 * Based on the dispatcher implementation from the Flux reference project:
 * https://github.com/facebook/flux
 */
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.sf = factory();
  }
}(this, function () {
  'use strict';

  /**
   * dispatcher stuff
   * Action Creators will run `sf.dispatch({ ... });`
   * Stores created with the `sf.createStore` function below will automatically register
   */

  var _lastID = 1;
  var _prefix = 'ID_';

  var _callbacks = {};
  var _isPending = {};
  var _isHandled = {};
  var _isDispatching = false;
  var _pendingPayload = null;

  /**
   * Register a callback to be invoked with every dispatched payload. Returns
   * a token that can be used with `waitFor()`.
   */
  var register = function register(callback) {
    if (_isDispatching) {
      throw 'Dispatcher.register(...): Cannot register in the middle of a dispatch.';
    }
    var id = _prefix + _lastID++;
    _callbacks[id] = callback;
    return id;
  };

  /**
   * Remove a callback based on its token.
   */
  var unregister = function unregister(id) {
    if (_isDispatching) {
      throw 'Dispatcher.unregister(...): Cannot unregister in the middle of a dispatch.';
    }
    if (!_callbacks[id]) {
      throw 'Dispatcher.unregister(...): `' + id + '` does not map to a registered callback.';
    }
    delete _callbacks[id];
  };

  /**
   * Wait for the callbacks specified to be invoked before continuing execution
   * of the current callback. This method should only be used by a callback in
   * response to a dispatched payload.
   */
  var waitFor = function waitFor(ids) {
    if (!_isDispatching) {
      throw 'Dispatcher.waitFor(...): Must be invoked while dispatching.';
    }
    for (var ii = 0; ii < ids.length; ii++) {
      var id = ids[ii];
      if (_isPending[id]) {
        if (!_isHandled[id]) {
          throw 'Dispatcher.waitFor(...): Circular dependency detected while ' + 'waiting for `' + id + '`.';
        }
        continue;
      }
      if (!_callbacks[id]) {
        throw 'Dispatcher.waitFor(...): `' + id + '` does not map to a registered callback.';
      }
      _invokeCallback(id);
    }
  };

  /**
   * Dispatch a payload to all registered callbacks.
   */
  var dispatch = function dispatch(payload) {
    if (_isDispatching) {
      throw 'Dispatch.dispatch(...): Cannot dispatch in the middle of a dispatch.';
    }
    _startDispatching(payload);
    try {
      for (var id in _callbacks) {
        if (_isPending[id]) {
          continue;
        }
        _invokeCallback(id);
      }
    } finally {
      _stopDispatching();
    }
  };

  /**
   * Is this Dispatcher currently dispatching?
   */
  var isDispatching = function isDispatching() {
    return _isDispatching;
  };

  /**
   * Call the callback stored with the given id. Also do some internal
   * bookkeeping.
   */
  var _invokeCallback = function _invokeCallback(id) {
    _isPending[id] = true;
    _callbacks[id](_pendingPayload);
    _isHandled[id] = true;
  };

  /**
   * Set up bookkeeping needed when dispatching.
   */
  var _startDispatching = function _startDispatching(payload) {
    for (var id in _callbacks) {
      _isPending[id] = false;
      _isHandled[id] = false;
    }
    _pendingPayload = payload;
    _isDispatching = true;
  };

  /**
   * Clear bookkeeping used for dispatching.
   */
  var _stopDispatching = function _stopDispatching() {
    _pendingPayload = null;
    _isDispatching = false;
  };

  /**
   * Warn if an action has a falsy type (usually because a constant does not exist)
   */
  var _warnForActionType = function _warnForActionType(action) {
    if (!action.type) {
      console.warn('Warning: Dispatched action has type: ' + action.type);
    }
  };


  /**
   * Factory function to create stores
   * initialState is an object describing the initial state
   * actionHandler runs evey time an action is dispatched
   */
  var createStore = function createStore(initialState, actionHandler) {
    'use strict';

    var _state = initialState;
    var _updateCallbacks = [];

    /**
     * Subscribe or unsubscribe a callback to receive updates from this store
     */
    var subscribe = function subscribe(callback) {
      _updateCallbacks.push(callback);
    };
    var unsubscribe = function unsubscribe(callback) {
      _updateCallbacks.splice(_updateCallbacks.indexOf(callback), 1);
    };

    /**
     * Get the current state of this store, usually for rendering
     */
    var getState = function getState() {
      return _state;
    };

    /**
     * Register action handler with the `dispatcher` and save the `dispatchToken`
     */
    var dispatchToken = register(function (action) {

      // The actionHandler function should Return `true` to update
      var shouldUpdate = actionHandler(_state, action);

      // Run any callbacks subscribed to this store if we should update
      if (shouldUpdate) {
        for (var i = 0; i < _updateCallbacks.length; i++) {
          _updateCallbacks[i](_state);
        }
      }

    });
  
    /**
     * `createStore` API
     */
    return {
        getState: getState,
        subscribe: subscribe,
        unsubscribe: unsubscribe,
        dispatchToken: dispatchToken
    };
  };


  /**
   * Public API
   */
  return {
    register: register,
    unregister: unregister,
    waitFor: waitFor,
    dispatch: dispatch,
    isDispatching: isDispatching,
    createStore: createStore
  }
}));
