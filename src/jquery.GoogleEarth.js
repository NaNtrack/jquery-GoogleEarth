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
			tilt            : null,
			heading         : null
		},
		
		//Google Earth Plugin initialized
		_initialized : false,
		
		init: function (opts) {
			// Extend the defaults
			GE.opts = $.extend(true, {}, GE.defaults, opts);
			if (GE.opts.id == null) {
				console.log('You need to specify an id');
				return;
			}
			google.setOnLoadCallback(function(){
				if(!GE._initialized) {
					google.earth.createInstance(GE.opts.id, GE._pluginInit, GE._pluginFailure);
				}
			});
		},
		setTilt: function (tilt) {
			if (!GE._initialized) return this;
			var camera = GE._ge.getView().copyAsCamera(GE._ge.ALTITUDE_RELATIVE_TO_GROUND);
			camera.setTilt(tilt);
			GE._ge.getView().setAbstractView(camera);
			return this
		},
		setHeading: function (heading) {
			if (!GE._initialized) return this;
			var camera = GE._ge.getView().copyAsCamera(GE._ge.ALTITUDE_RELATIVE_TO_GROUND);
			camera.setHeading(heading);
			GE._ge.getView().setAbstractView(camera);
			return this
		},
		showSun: function () {
			if (!GE._initialized) return this;
			GE.opts.sun = true;
			GE._ge.getSun().setVisibility(GE.opts.sun);
			return this;
		},
		hideSun: function () {
			if (!GE._initialized) return this;
			GE.opts.sun = false;
			GE._ge.getSun().setVisibility(GE.opts.sun);
			return this;
		},
		showControls: function () {
			if (!GE._initialized) return this;
			GE.opts.controls = true;
			GE._ge.getNavigationControl().setVisibility(GE.opts.controls ? GE._ge.VISIBILITY_SHOW : GE._ge.VISIBILITY_HIDE);
			return this;
		},
		hideControls: function () {
			if (!GE._initialized) return this;
			GE.opts.controls = false;
			GE._ge.getNavigationControl().setVisibility(GE.opts.controls ? GE._ge.VISIBILITY_SHOW : GE._ge.VISIBILITY_HIDE);
			return this;
		},
		enableBordersLayer     : function () { return GE._layer(GE._ge.LAYER_BORDERS, true); },
		disableBordersLayer    : function () { return GE._layer(GE._ge.LAYER_BORDERS, false); },
		enableRoadsLayer       : function () { return GE._layer(GE._ge.LAYER_ROADS, true); },
		disableRoadsLayer      : function () { return GE._layer(GE._ge.LAYER_ROADS, false); },
		enableBuildingsLayer   : function () { return GE._layer(GE._ge.LAYER_BUILDINGS, true); },
		disableBuildingsLayer  : function () { return GE._layer(GE._ge.LAYER_BUILDINGS, false); },
		enableTerrainLayer     : function () { return GE._layer(GE._ge.LAYER_TERRAIN, true); },
		disableTerrainLayer    : function () { return GE._layer(GE._ge.LAYER_TERRAIN, false); },
		_layer: function(name, visible) {
			if (!GE._initialized) return this;
			GE._ge.getLayerRoot().enableLayerById(name, visible);
			return this;
		},
		_pluginInit: function (instance) {
			GE._ge = instance;
			var ge = GE._ge;
			GE._initialized = true;
			ge.getWindow().setVisibility(true);
			ge.getNavigationControl().setVisibility(GE.opts.controls ? ge.VISIBILITY_SHOW : ge.VISIBILITY_HIDE);
			GE._layer(ge.LAYER_BORDERS, GE.opts.layer_borders);
			GE._layer(ge.LAYER_ROADS, GE.opts.layer_roads);
			GE._layer(ge.LAYER_BUILDINGS, GE.opts.layer_buildings);
			GE._layer(ge.LAYER_TERRAIN, GE.opts.layer_terrain);
			ge.getSun().setVisibility(GE.opts.sun);
		},
		
		_pluginFailure: function (instance) {
			console.log('Unable to initialize Google Earth Plugin!');
			GE._initialized = false;
		}
	});
	// jQuery plugin initialization
	$.fn.GoogleEarth = function (options) {
		options = options || {};
		return this;
	};
	
}(window, document, jQuery));
