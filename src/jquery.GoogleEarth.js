/**
 * ============================================================================
 * jQuery Plugin for Google Earth API 
 * jquery.GoogleEarth.js v1.0
 * https://github.com/delpho/jquery-GoogleEarth
 * ============================================================================
 * 
 * Copyright (c) 2012 Julio Araya <julioarayacerda@gmail.com>
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to 
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in 
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
 * DEALINGS IN THE SOFTWARE.
 * 
 */
(function ($, undefined) {
	"use strict";

	//Private vars
	var _initialized = false; //Google Earth Plugin initialized
	
	//Private methods
	var _init = function (opts) {
		// Extend the defaults
		GE.opts = $.extend(true, {}, GE.defaults, opts);
		if (GE.opts.id === null) {
			GE.debug && console.log('You need to specify an id for the place holder');
			return;
		}
		google.setOnLoadCallback(function(){
			if(!_initialized) {
				google.earth.createInstance(GE.opts.id, _pluginInit, _pluginFailure);
			}
		});
	};
	
	var _pluginInit = function (instance) {
		GE.ge = instance;
		_initialized = true;
		GE.ge.getWindow().setVisibility(true);
		GE.ge.getNavigationControl().setVisibility(GE.opts.controls ? GE.ge.VISIBILITY_SHOW : GE.ge.VISIBILITY_HIDE);
		_layer(GE.ge.LAYER_BORDERS, GE.opts.layer_borders);
		_layer(GE.ge.LAYER_ROADS, GE.opts.layer_roads);
		_layer(GE.ge.LAYER_BUILDINGS, GE.opts.layer_buildings);
		_layer(GE.ge.LAYER_TERRAIN, GE.opts.layer_terrain);
		GE.ge.getSun().setVisibility(GE.opts.sun);
		GE.setViewType(GE.opts.view_type);
		if (GE.opts.latitude || GE.opts.longitude) GE.setPosition(GE.opts.latitude, GE.opts.longitude);
		if (GE.opts.tilt) GE.setTilt(GE.opts.tilt);
		if (GE.opts.heading) GE.setHeading(GE.opts.heading);
		if (GE.opts.range) GE.setRange(GE.opts.range);
		if (GE.opts.altitude) GE.setAltitude(GE.opts.altitude);
		GE.addViewListener('viewchangeend', function(){
			var view = GE.getView();
			if(GE.opts.view_type == 'lookat') {
				GE.opts.range = view.getRange();
				GE.opts.altitude = null;
			} else {
				GE.opts.altitude = view.getAltitude();
				GE.opts.range = null;
			}
			GE.opts.latitude = view.getLatitude();
			GE.opts.longitude = view.getLongitude();
			GE.opts.tilt = view.getTilt();
			GE.opts.heading = view.getHeading();
		});
		if (GE.opts.viewListener && GE.opts.viewEvent) GE.addViewListener(GE.opts.viewEvent, GE.opts.viewListener);
	};

	var _pluginFailure = function (instance) {
		GE.debug && console.log('Unable to initialize Google Earth Plugin!');
		_initialized = false;
	};
        
	var _updateView = function () {
		GE.ge.getView().setAbstractView(GE.view);
	};
	
	var _layer = function (name, visible) {
		if (!_initialized) return this;
		GE.ge.getLayerRoot().enableLayerById(name, visible);
		return GE;
	};

	var GE = $.GoogleEarth = function () {
		_init.apply( this, arguments );
	};
	
	$.extend(GE, {
		//the version of this plugin
		version : '1.0',
		
		//Default options
		defaults : { 
			id              : null,
			layer_borders   : false,  
			layer_roads     : false,
			layer_buildings : false,
			layer_terrain   : false,
			sun             : false,
			controls        : true,
			view_type       : 'lookat',
			latitude        : null,
			longitude       : null,
			tilt            : null,
			heading         : null,
			range           : null,
			altitude        : null,
			viewEvent       : null,
			viewListener    : null
		},
        
		//Debug: true or false
		debug: true,
		
		//View
		view : null,
		
		//Kml objects
		kmlObjects: [],
        
		//Google Earth instance
		ge: null,
		
		/*Listeners*/
		addViewListener: function (event, callback) {
			google.earth.addEventListener(GE.ge.getView(), event, callback);
		},
		
		removeViewListener: function(event, callback) {
			google.earth.removeEventListener(GE.ge.getView(),event, callback);
		},
        
		/*View methods*/
		setViewType: function(viewType) {
			if (viewType == 'lookat'){
				if (GE.opts.view_type != 'lookat' || GE.view === null) {
					GE.view = GE.ge.getView().copyAsLookAt(GE.ge.ALTITUDE_RELATIVE_TO_GROUND);
					GE.opts.view_type = 'lookat';
				}
			} else if(viewType == 'camera') {
				if (GE.opts.view_type != 'camera' || GE.view === null) {
					GE.view = GE.ge.getView().copyAsCamera(GE.ge.ALTITUDE_RELATIVE_TO_GROUND);
					GE.opts.view_type = 'camera';    
				}
			} else {
				GE.debug && console.log('Invalid view type, please use \'lookat\' or \'camera\'');
				GE.setViewType('lookat');
			}
			return this;
		},
		
		getView: function() {
			if (GE.opts.view_type == 'lookat'){
				return GE.ge.getView().copyAsLookAt(GE.ge.ALTITUDE_RELATIVE_TO_GROUND);
			}
			return GE.ge.getView().copyAsCamera(GE.ge.ALTITUDE_RELATIVE_TO_GROUND);
		},
		
			setPosition: function (lat, lng) {
			if (!_initialized) return this;
			if (lat || lng) {
				if (lat) {
					GE.view.setLatitude(lat);
					GE.opts.latitude = lat;
				}
				if (lng) { 
					GE.view.setLongitude(lng);
					GE.opts.longitude = lng;
				}
				_updateView();
			}
			return this
		},
        
		setTilt: function (tilt) {
			if (!_initialized) return this;
			GE.view.setTilt(tilt);
			_updateView();
			GE.opts.tilt = tilt;
			return this
		},
		
		setHeading: function (heading) {
			if (!_initialized) return this;
			GE.view.setHeading(heading);
			_updateView();
			GE.opts.heading = heading;
			return this
		},
        
		setRange: function (range) {
			if (!_initialized) return this;
			if (GE.opts.view_type != 'lookat') {
				GE.debug && console.log('Range is only available on \'lookat\' view');
				return this;
			}
			GE.view.setRange(range);
			_updateView();
			GE.opts.range = range;
			return this;
		},
        
		setAltitude: function (altitude) {
			if (!_initialized) return this;
			if (GE.opts.view_type != 'camera') {
				GE.debug && console.log('Altitude is only available on \'camera\' view');
				return this;
			}
			GE.view.setAltitude(altitude);
			_updateView();
			GE.opts.altitude = altitude;
			return this;
		},
		
		/*General methods*/
		showSun: function () {
			if (!_initialized) return this;
			GE.opts.sun = true;
			_updateView();
			return this;
		},
		
		hideSun: function () {
			if (!_initialized) return this;
			GE.opts.sun = false;
			_updateView();
			return this;
		},
		
		showControls: function () {
			if (!_initialized) return this;
			GE.opts.controls = true;
			GE.ge.getNavigationControl().setVisibility(GE.opts.controls ? GE.ge.VISIBILITY_SHOW : GE.ge.VISIBILITY_HIDE);
			return this;
		},
		
		hideControls: function () {
			if (!_initialized) return this;
			GE.opts.controls = false;
			GE.ge.getNavigationControl().setVisibility(GE.opts.controls ? GE.ge.VISIBILITY_SHOW : GE.ge.VISIBILITY_HIDE);
			return this;
		},
        
		enableBordersLayer     : function () {
			return _layer(GE.ge.LAYER_BORDERS, true);
		},
		disableBordersLayer    : function () {
			return _layer(GE.ge.LAYER_BORDERS, false);
		},
		enableRoadsLayer       : function () {
			return _layer(GE.ge.LAYER_ROADS, true);
		},
		disableRoadsLayer      : function () {
			return _layer(GE.ge.LAYER_ROADS, false);
		},
		enableBuildingsLayer   : function () {
			return _layer(GE.ge.LAYER_BUILDINGS, true);
		},
		disableBuildingsLayer  : function () {
			return _layer(GE.ge.LAYER_BUILDINGS, false);
		},
		enableTerrainLayer     : function () {
			return _layer(GE.ge.LAYER_TERRAIN, true);
		},
		disableTerrainLayer    : function () {
			return _layer(GE.ge.LAYER_TERRAIN, false);
		},
        
		/**
		 * Fetch a Kml from a given URL
		 */
		fetchKml: function(url, callback){
			google.earth.fetchKml(GE.ge, url, function(kml){
				if (kml) {
					var kmlObject = new Object();
					kmlObject.url = url;
					kmlObject.kml = kml;
					kmlObject.hide = function(){
						GE.ge.getFeatures().removeChild(this.kml);
					}
					kmlObject.show = function() {
						GE.ge.getFeatures().appendChild(this.kml);
					}
					GE.kmlObjects.push(kmlObject);
					GE.debug && console.log('Loaded Kml object from ' + url);
				} else {
					GE.debug && console.log('Unable to load Kml object from \'' + url+'\'');
				}
				//send the kml object to the callback
				if(callback) {
					callback(kml);
				}
			});
			return this;
		},
		
		/**
		 * Return an array with all the kml objects loaded, every kml object contains the following attributes:
		 * url: The url of the kml object
		 * kml: the kml itself
		 * hide: (function) Hide the kml object from the current view
		 * show: (function) Show the kml object in the current view
		 */
		getKmlObjects: function () {
			return GE.kmlObjects;
		},
		
		showKml: function(kml) {
			GE.ge.getFeatures().appendChild(kml);
		},
		
		hideKml: function (kml) {
			GE.ge.getFeatures().removeChild(kml);
		}
		
	});
    
	// jQuery plugin initialization
	$.fn.GoogleEarth = function (options) {
		options = options || {};
		return this;
	};
	
}(jQuery));
