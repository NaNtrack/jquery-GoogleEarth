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

	//Google Earth instance
	var ge = null;
	
	var _initialized = false; //Google Earth Plugin initialized
	
	//Private methods
	var _init = function (opts) {
		// Extend the defaults
		GE.opts = $.extend(true, {}, GE.defaults, opts);
		if (GE.opts.id === null) {
			GE.debug && console.log('You need to specify an id for the place holder');
			return;
		}
		if(!_initialized) {
			google.setOnLoadCallback(function(){
				google.earth.createInstance(GE.opts.id, _pluginInit, _pluginFailure);
			});
		} else {
			google.earth.createInstance(GE.opts.id, _pluginInit, _pluginFailure);
		}
	};
	
	var _pluginInit = function (instance) {
		ge = instance;
		GE.ge = ge;
		_initialized = true;
		ge.getWindow().setVisibility(true);
		ge.getNavigationControl().setVisibility(GE.opts.controls ? ge.VISIBILITY_SHOW : ge.VISIBILITY_HIDE);
		_layer(ge.LAYER_BORDERS, GE.opts.borders);
		_layer(ge.LAYER_ROADS, GE.opts.roads);
		_layer(ge.LAYER_BUILDINGS, GE.opts.buildings);
		_layer(ge.LAYER_TERRAIN, GE.opts.terrain);
		ge.getSun().setVisibility(GE.opts.sun);
		GE.setViewType(GE.opts.type);
		if (GE.opts.latitude || GE.opts.longitude) GE.setPosition(GE.opts.latitude, GE.opts.longitude);
		if (GE.opts.tilt) GE.setTilt(GE.opts.tilt);
		if (GE.opts.heading) GE.setHeading(GE.opts.heading);
		if (GE.opts.range) GE.setRange(GE.opts.range);
		if (GE.opts.altitude) GE.setAltitude(GE.opts.altitude);
		GE.addListener(ge.getView(), 'viewchangeend', function(){
			var view = GE.getView();
			if(GE.opts.type == 'lookat') {
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
		if (GE.opts.onComplete) {
			GE.opts.onComplete(instance);
		}
	};

	var _pluginFailure = function (errorCode) {
		GE.debug && console.log('Unable to initialize Google Earth Plugin!');
		_initialized = false;
		if (GE.opts.onError) {
			GE.opts.onError(errorCode);
		}
	};
        
	var _layer = function (name, visible) {
		if (!_initialized) return this;
		ge.getLayerRoot().enableLayerById(name, visible);
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
			id         : null,
			borders    : false,  
			roads      : false,
			buildings  : false,
			terrain    : false,
			sun        : false,
			controls   : true,
			type  : 'lookat',
			latitude   : null,
			longitude  : null,
			tilt       : null,
			heading    : null,
			range      : null,
			altitude   : null,
			onComplete : null,
			onError    : null
		},
        
		//Debug: true or false
		debug: false,
		
		//View
		view : null,
		
		//Kml objects
		kmlObjects: [],
		
		/*Listeners*/
		addListener: function (obj, event, callback) {
			google.earth.addEventListener(obj, event, callback);
		},
		
		removeListener: function(obj, event, callback) {
			google.earth.removeEventListener(obj, event, callback);
		},
        
		/*View methods*/
		setViewType: function(viewType) {
			if (viewType == 'lookat'){
				if (GE.opts.type != 'lookat' || GE.view === null) {
					GE.view = ge.getView().copyAsLookAt(ge.ALTITUDE_RELATIVE_TO_GROUND);
					GE.opts.type = 'lookat';
				}
			} else if(viewType == 'camera') {
				if (GE.opts.type != 'camera' || GE.view === null) {
					GE.view = ge.getView().copyAsCamera(ge.ALTITUDE_RELATIVE_TO_GROUND);
					GE.opts.type = 'camera';    
				}
			} else {
				GE.debug && console.log('Invalid view type, please use \'lookat\' or \'camera\'');
				GE.setViewType('lookat');
			}
			return this;
		},
		
		setView: function (options) {
			var defaults = {
				type      : 'lookat',
				latitude  : GE.opts.latitude,
				longitude : GE.opts.longitude,
				altitude  : GE.opts.altitude,
				range     : GE.opts.range,
				heading   : GE.opts.heading,
				tilt      : GE.opts.tilt
			}
			options = $.extend( defaults, options);
			GE.setViewType(options.type);
			GE.view = GE.getView();
			GE.view.setLatitude(parseFloat(options.latitude));
			GE.view.setLongitude(parseFloat(options.longitude));
			try{GE.view.setAltitude(parseFloat(options.altitude));}catch(e){}
			try{GE.view.setRange(parseFloat(options.range));}catch(e){}
			GE.view.setHeading(parseFloat(options.heading));
			GE.view.setTilt(parseFloat(options.tilt));
			ge.getView().setAbstractView(GE.view);
			return this;
		},
		
		getView: function() {
			if (!_initialized) return null;
			if (GE.opts.type == 'lookat'){
				return ge.getView().copyAsLookAt(ge.ALTITUDE_RELATIVE_TO_GROUND);
			}
			return ge.getView().copyAsCamera(ge.ALTITUDE_RELATIVE_TO_GROUND);
		},
		
		setPosition: function (lat, lng) {
			if (!_initialized) return this;
			if (lat || lng) {
				if (lat) {
					GE.opts.latitude = lat;
				}
				if (lng) { 
					GE.opts.longitude = lng;
				}
				GE.setView(GE.opts);
			}
			return this
		},
        
		setTilt: function (tilt) {
			if (!_initialized) return this;
			GE.opts.tilt = tilt;
			GE.setView(GE.opts);
			return this
		},
		
		setHeading: function (heading) {
			if (!_initialized) return this;
			GE.opts.heading = heading;
			GE.setView(GE.opts);
			return this
		},
        
		setRange: function (range) {
			if (!_initialized) return this;
			if (GE.opts.type != 'lookat') {
				GE.debug && console.log('Range is only available on \'lookat\' view');
				return this;
			}
			GE.opts.range = range;
			GE.setView(GE.opts);
			return this;
		},
        
		setAltitude: function (altitude) {
			if (!_initialized) return this;
			if (GE.opts.type != 'camera') {
				GE.debug && console.log('Altitude is only available on \'camera\' view');
				return this;
			}
			GE.opts.altitude = altitude;
			GE.setView(GE.opts);
			return this;
		},
		
		/*General methods*/
		showSun: function () {
			if (!_initialized) return this;
			GE.opts.sun = true;
			ge.getSun().setVisibility(GE.opts.sun);
			return this;
		},
		
		hideSun: function () {
			if (!_initialized) return this;
			GE.opts.sun = false;
			ge.getSun().setVisibility(GE.opts.sun);
			return this;
		},
		
		showControls: function () {
			if (!_initialized) return this;
			GE.opts.controls = true;
			ge.getNavigationControl().setVisibility(GE.opts.controls ? ge.VISIBILITY_SHOW : ge.VISIBILITY_HIDE);
			return this;
		},
		
		hideControls: function () {
			if (!_initialized) return this;
			GE.opts.controls = false;
			ge.getNavigationControl().setVisibility(GE.opts.controls ? ge.VISIBILITY_SHOW : ge.VISIBILITY_HIDE);
			return this;
		},
        
		enableBordersLayer     : function () {
			return _layer(ge.LAYER_BORDERS, true);
		},
		disableBordersLayer    : function () {
			return _layer(ge.LAYER_BORDERS, false);
		},
		enableRoadsLayer       : function () {
			return _layer(ge.LAYER_ROADS, true);
		},
		disableRoadsLayer      : function () {
			return _layer(ge.LAYER_ROADS, false);
		},
		enableBuildingsLayer   : function () {
			return _layer(ge.LAYER_BUILDINGS, true);
		},
		disableBuildingsLayer  : function () {
			return _layer(ge.LAYER_BUILDINGS, false);
		},
		enableTerrainLayer     : function () {
			return _layer(ge.LAYER_TERRAIN, true);
		},
		disableTerrainLayer    : function () {
			return _layer(ge.LAYER_TERRAIN, false);
		},
        
		/**
		 * Fetch a Kml from a given URL
		 */
		fetchKml: function(url, callback){
			if (!_initialized) return this;
			google.earth.fetchKml(ge, url, function(kml){
				if (kml) {
					var kmlObject = new Object();
					kmlObject.url = url;
					kmlObject.kml = kml;
					kmlObject.hide = function(){
						ge.getFeatures().removeChild(this.kml);
					}
					kmlObject.show = function() {
						ge.getFeatures().appendChild(this.kml);
					}
					GE.kmlObjects.push(kmlObject);
					GE.showKml(kml);
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
			if (!_initialized) return this;
			ge.getFeatures().appendChild(kml);
			return this;
		},
		
		hideKml: function (kml) {
			if (!_initialized) return this;
			ge.getFeatures().removeChild(kml);
			return this;
		},
                
		setFlyToSpeed: function (speed) {
			if (!_initialized) return this;
			ge.getOptions().setFlyToSpeed(speed);
			return this;
		},
                
		addPlacemark: function (options) {
			if (!_initialized) return this;
			var defaults = {
				latitude    : 0,
				longitude   : 0,
				altitude    : 0,
				icon        : '', 
				description : '',
				onclick     : false
			};
			
			options = $.extend(defaults, options);
			
			var placemark   = ge.createPlacemark('');
			var point       = ge.createPoint('');
			var icon        = ge.createIcon('');
			var style       = ge.createStyle('');

			point.setLatitude(parseFloat(options.latitude));
			point.setLongitude(parseFloat(options.longitude));
			point.setAltitudeMode(ge.ALTITUDE_RELATIVE_TO_GROUND);
			point.setAltitude(parseFloat(options.altitude));
			point.setExtrude(true);

			placemark.setGeometry(point);
			icon.setHref(options.icon);
			style.getIconStyle().setIcon(icon);
			placemark.setStyleSelector(style);
			ge.getFeatures().appendChild(placemark);
			if (options.description.length > 0 ) {
				google.earth.addEventListener(
					placemark,
					'click',
					function(event){
						event.preventDefault();
						var balloon = ge.createHtmlStringBalloon('');
						balloon.setFeature(event.getTarget());
						balloon.setMaxWidth(340);
						balloon.setContentString(options.description);
						ge.setBalloon(balloon);
					}
				);
			}
			if (options.onclick) {
				google.earth.addEventListener(
					placemark,
					'click',
					function(event) {
						options.onclick(event);
					}
				);
			}
			return placemark;
		},
		
		updatePlacemark : function(placemark, options){
			if (!_initialized) return this;
			var defaults = {
				latitude    : 0,
				longitude   : 0,
				altitude    : 0
			};
			options = $.extend(defaults, options);
			var point = ge.createPoint('');
			point.setLatitude(parseFloat(options.latitude));
			point.setLongitude(parseFloat(options.longitude));
			point.setAltitudeMode(ge.ALTITUDE_RELATIVE_TO_GROUND);
			point.setAltitude(parseFloat(options.altitude));
			point.setExtrude(true);
			placemark.setGeometry(point);
			return placemark;
		},
		
		getStreamingPercent: function () {
			if (!_initialized) return 0;
			return ge.getStreamingPercent();
		},
		
		startAnimation: function (animation_url, onStart) {
			if (!_initialized) return this;
			this.fetchKml(animation_url, function(kml){
				if(kml){
					ge.getTourPlayer().setTour(kml);
					ge.getTourPlayer().play();
					if (onStart) {
						onStart(ge.getTourPlayer());
					}
				}
			});
			return this;
		},
		
		stopAnimation: function () {
			if (!_initialized) return this;
			ge.getTourPlayer().stop();
			return this;
		},

		isInstalled: function () {
			return google.earth.isInstalled();
		}, 
		
		isSupported : function () {
			return google.earth.isSupported();
		},
		
		toString : function () {
			return "{version: '" + GE.version +"', " + 
				"type: '" + GE.opts.type + "', " +
				"latitude: " + GE.opts.latitude + ", " +
				"longitude: " + GE.opts.longitude + ", " +
				"altitude: " + GE.opts.altitude + ", " +
				"range: " + GE.opts.range + ", " +
				"heading: " + GE.opts.heading + ", " +
				"tilt: " + GE.opts.tilt + "}"
			
			;
		}
		
	});
    
	// jQuery plugin initialization
	$.fn.GoogleEarth = function (options) {
		options = options || {};
		return this;
	};
	
}(jQuery));
