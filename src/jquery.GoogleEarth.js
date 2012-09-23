/**
 * ============================================================================
 * jQuery Plugin for Google Earth API 
 * jquery.GoogleEarth.js v0.1
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
(function (window, document, $, undefined) {
	"use strict";

	var W  = $(window),
		D  = $(document),
		GE = $.GoogleEarth = function () {
			GE.init.apply( this, arguments );
		};
	
	$.extend(GE, {
		//the version of this plugin
		version : '0.1',
		
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
            altitude        : null
		},
         
        //View
        view : null,
        
        //Google Earth instance
        ge: null,
        
		//Google Earth Plugin initialized
		_initialized : false,
		
		init: function (opts) {
			// Extend the defaults
			GE.opts = $.extend(true, {}, GE.defaults, opts);
			if (GE.opts.id == null) {
				console.log('You need to specify an id for the place holder');
				return;
			}
			google.setOnLoadCallback(function(){
				if(!GE._initialized) {
					google.earth.createInstance(GE.opts.id, GE._pluginInit, GE._pluginFailure);
				}
			});
		},
        
        _pluginInit: function (instance) {
    		GE.ge = instance;
			GE._initialized = true;
			GE.ge.getWindow().setVisibility(true);
			GE.ge.getNavigationControl().setVisibility(GE.opts.controls ? GE.ge.VISIBILITY_SHOW : GE.ge.VISIBILITY_HIDE);
			GE._layer(GE.ge.LAYER_BORDERS, GE.opts.layer_borders);
			GE._layer(GE.ge.LAYER_ROADS, GE.opts.layer_roads);
			GE._layer(GE.ge.LAYER_BUILDINGS, GE.opts.layer_buildings);
			GE._layer(GE.ge.LAYER_TERRAIN, GE.opts.layer_terrain);
			GE.ge.getSun().setVisibility(GE.opts.sun);
            GE.setViewType(GE.opts.view_type);
            if (GE.opts.latitude || GE.opts.longitude) GE.setPosition(GE.opts.latitude, GE.opts.longitude);
            if (GE.opts.tilt) GE.setTilt(GE.opts.tilt);
            if (GE.opts.heading) GE.setHeading(GE.opts.heading);
            if (GE.opts.range) GE.setRange(GE.opts.range);
            if (GE.opts.altitude) GE.setAltitude(GE.opts.altitude);
        },
        
		_pluginFailure: function (instance) {
			console.log('Unable to initialize Google Earth Plugin!');
			GE._initialized = false;
		},
        
        _updateView: function () {
            GE.ge.getView().setAbstractView(GE.view);  
        },
        
        /*View methods*/
        setViewType: function(viewType) {
            if (viewType == 'lookat'){
                if (GE.opts.view_type != 'lookat' || GE.view == null) {
                    GE.view = GE.ge.getView().copyAsLookAt(GE.ge.ALTITUDE_RELATIVE_TO_GROUND);
                    GE.opts.view_type = 'lookat';
                }
            } else if(viewType == 'view') {
                if (GE.opts.view_type != 'view' || GE.view == null) {
                    GE.view = GE.ge.getView().copyAsCamera(GE.ge.ALTITUDE_RELATIVE_TO_GROUND);
                    GE.opts.view_type = 'view';    
                }
            } else {
                console.log('Invalid view type, please use \'lookat\' or \'view\'');
                GE.setViewType('lookat');
            }
            return this;
        },
		
        setPosition: function (lat, lng) {
            if (!GE._initialized) return this;
            if (lat || lng) {
                if (lat) {
                    GE.view.setLatitude(lat);
                    GE.opts.latitude = lat;
                }
                if (lng) { 
                    GE.view.setLongitude(lng);
                    GE.opts.longitude = lng;
                }
                GE._updateView();
            }
            return this
        },
        
        setTilt: function (tilt) {
			if (!GE._initialized) return this;
			GE.view.setTilt(tilt);
			GE._updateView();
            GE.opts.tilt = tilt;
			return this
		},
		
        setHeading: function (heading) {
			if (!GE._initialized) return this;
			GE.view.setHeading(heading);
            GE._updateView();
            GE.opts.heading = heading;
			return this
		},
        
        setRange: function (range) {
            if (!GE._initialized) return this;
            if (GE.opts.view_type != 'lookat') {
                console.log('Range is only available on \'lookat\' view');
                return this;
            }
            GE.view.setRange(range);
            GE._updateView();
            GE.opts.range = range;
            return this;
        },
        
        setAltitude: function (altitude) {
            if (!GE._initialized) return this;
            if (GE.opts.view_type != 'view') {
                console.log('Altitude is only available on \'view\' view');
                return this;
            }
            GE.view.setAltitude(altitude);
            GE._updateView();
            GE.opts.altitude = altitude;
            return this;
        },
		
        /*General methods*/
        showSun: function () {
			if (!GE._initialized) return this;
			GE.opts.sun = true;
			GE._updateView();
			return this;
		},
		
        hideSun: function () {
			if (!GE._initialized) return this;
			GE.opts.sun = false;
			GE._updateView();
			return this;
		},
		
        showControls: function () {
			if (!GE._initialized) return this;
			GE.opts.controls = true;
			GE.ge.getNavigationControl().setVisibility(GE.opts.controls ? GE.ge.VISIBILITY_SHOW : GE.ge.VISIBILITY_HIDE);
			return this;
		},
		
        hideControls: function () {
			if (!GE._initialized) return this;
			GE.opts.controls = false;
			GE.ge.getNavigationControl().setVisibility(GE.opts.controls ? GE.ge.VISIBILITY_SHOW : GE.ge.VISIBILITY_HIDE);
			return this;
		},
        
		_layer: function(name, visible) {
            if (!GE._initialized) return this;
			GE.ge.getLayerRoot().enableLayerById(name, visible);
			return this;
		},
        
        enableBordersLayer     : function () { return GE._layer(GE.ge.LAYER_BORDERS, true); },
		disableBordersLayer    : function () { return GE._layer(GE.ge.LAYER_BORDERS, false); },
		enableRoadsLayer       : function () { return GE._layer(GE.ge.LAYER_ROADS, true); },
		disableRoadsLayer      : function () { return GE._layer(GE.ge.LAYER_ROADS, false); },
		enableBuildingsLayer   : function () { return GE._layer(GE.ge.LAYER_BUILDINGS, true); },
		disableBuildingsLayer  : function () { return GE._layer(GE.ge.LAYER_BUILDINGS, false); },
		enableTerrainLayer     : function () { return GE._layer(GE.ge.LAYER_TERRAIN, true); },
		disableTerrainLayer    : function () { return GE._layer(GE.ge.LAYER_TERRAIN, false); }
        
	});
    
	// jQuery plugin initialization
	$.fn.GoogleEarth = function (options) {
		options = options || {};
		return this;
	};
	
}(window, document, jQuery));
