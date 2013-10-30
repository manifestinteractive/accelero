/*
 * Plugin Name
 * https://github.com/filamentgroup/defaultPluginName
 * Copyright (c) 2013 Filament Group, Inc.
 * Licensed under the MIT, GPL licenses.
 */

;(function ($, window, document, undefined) {

	var pluginName = 'accelero';

	var defaults = {
		debug: false,
		speed: 1,
		scale: 1,
		gravityRatio: 0.98,
		bounceRatio: 0.5,
		controlMethod: 'auto', // auto, motion, orientation, mouse
		debugElement: '.accelero-debug-wrapper',
		containerElement: document.documentElement
	};

	function Plugin(element, options) {
		this.element = element;
		this.$element = $(element);

		var dataOptions = {};
		var setData = this.$element.data();

		for(var i in setData)
		{
			if(defaults.hasOwnProperty(i) && (typeof(defaults[i] === 'string')) || typeof(defaults[i] === 'number') || typeof(defaults[i] === 'boolean'))
			{
				dataOptions[i] = setData[i];
			}
		}

		this.options = $.extend( {}, defaults, dataOptions, options );
		this._defaults = defaults;
		this._name = pluginName;

		this.supported = {
			motion: (typeof window.DeviceMotionEvent !== 'undefined'),
			orientation: (typeof window.DeviceOrientationEvent !== 'undefined'),
			touch: ('ontouchstart' in window) || (typeof navigator.msMaxTouchPoints !== 'undefined'),
			mouse: ('onmousemove' in window)
		};

		this.timer = null;
		this.motion = {
				x: 0,
				y: 0,
				z: 0,
				ax: 0,
				ay: 0,
				az: 0,
				vx: 0,
				vy: 0,
				vz: 0,
				max_x: 0,
				max_y: 0,
				new_top: 0,
				new_left: 0
		};

		this.init();
	}

	Plugin.prototype = {
		init: function () {

			var $that = this;

			if(this.options.debug)
			{
				if($(this.options.debugElement).length === 0)
				{
					var classname = this.options.debugElement.replace('.', '').replace('#', '');
					$('body').append('<div class="'+ classname +'"></div>');

					$(this.options.debugElement).append('<div class="accelero-debug acceleration-x">Acceleration X: <span><\/span>g<\/div>');
					$(this.options.debugElement).append('<div class="accelero-debug acceleration-y">Acceleration Y: <span><\/span>g<\/div>');
					$(this.options.debugElement).append('<div class="accelero-debug acceleration-z">Acceleration Z: <span><\/span>g<\/div>');
				}
			}

			if(this.options.scale !== 1)
			{
				var new_width = Math.ceil(this.$element.width() * this.options.scale),
					new_height = Math.ceil(this.$element.height() * this.options.scale);

				this.$element.css({
					'width': new_width + 'px',
					'height': new_height + 'px'
				});
			}

			if(window.DeviceMotionEvent && (this.options.controlMethod == 'auto' || this.options.controlMethod == 'motion'))
			{
				window.ondevicemotion = function(event) {

					$that.motion.ax = event.accelerationIncludingGravity.x * 5;
					$that.motion.ay = event.accelerationIncludingGravity.y * 5;
					$that.motion.az = event.accelerationIncludingGravity.z * 5;
				}

				clearInterval(this.timer);
				this.timer = setInterval($.proxy($that._track, $that), 25);
			}
			else if(window.DeviceOrientationEvent && (this.options.controlMethod == 'auto' || this.options.controlMethod == 'orientation'))
			{
				window.addEventListener('deviceorientation', function(event){

					$that.motion.ax = event.beta;
					$that.motion.ay = event.gamma;
					$that.motion.az = event.alpha;

				}, false);

				clearInterval(this.timer);
				this.timer = setInterval($.proxy($that._track, $that), 25);
			}
			else if(this.options.controlMethod == 'auto' || this.options.controlMethod == 'mouse')
			{
				var $that = this;
				$(this.options.containerElement).mousemove(function(e){
					$that.motion.new_top = e.pageY - ($($that.options.containerElement).offset().top + ($($that.element).height() / 2));
					$that.motion.new_left = e.pageX - ($($that.options.containerElement).offset().left + ($($that.element).width() / 2));

					$that.motion.x += ($that.motion.new_left - $that.motion.x) / ( 12 / $that.options.speed );
					$that.motion.y += ($that.motion.new_top - $that.motion.y) / ( 12 / $that.options.speed );

				});

				clearInterval(this.timer);
				this.timer = setInterval($.proxy($that._track, $that), 25);
			}
		},
		_track: function() {

			if(this.options.debug)
			{
				$('.acceleration-x span').html(this.motion.ax);
				$('.acceleration-y span').html(this.motion.ay);
				$('.acceleration-z span').html(this.motion.az);
			}

			this.$element.data('acceleration-x', this.motion.ax);
			this.$element.data('acceleration-y', this.motion.ay);
			this.$element.data('acceleration-z', this.motion.az);

			this._move();
		},
		_move: function() {
			var landscape_orientation = true,
				reverse = false;

			if(typeof window.orientation !== 'undefined')
			{
				landscape_orientation = false;

				if(window.orientation === 90 || window.orientation === -90)
				{
					landscape_orientation = true;
				}
				if(window.orientation === 90 || window.orientation === 180)
				{
					reverse = true;
				}
			}

			this.motion.max_x = $(this.options.containerElement).width()  - this.$element.width();
			this.motion.max_y = $(this.options.containerElement).height() - this.$element.height();

			if(landscape_orientation)
			{
				this.motion.vx = Math.ceil(this.motion.vx + (this.motion.ay * this.options.speed));
				this.motion.vy = Math.ceil(this.motion.vy + (this.motion.ax * this.options.speed));
			}
			else
			{
				this.motion.vy = Math.ceil(this.motion.vy - (this.motion.ay * this.options.speed));
				this.motion.vx = Math.ceil(this.motion.vx + (this.motion.ax * this.options.speed));
			}

			this.motion.vx = Math.ceil(this.motion.vx * this.options.gravityRatio);
			this.motion.vy = Math.ceil(this.motion.vy * this.options.gravityRatio);

			if(reverse)
			{
				this.motion.x = Math.ceil(parseInt(this.motion.x - this.motion.vx / this.$element.width(), 10));
				this.motion.y = Math.ceil(parseInt(this.motion.y - this.motion.vy / this.$element.height(), 10));
			}
			else
			{
				this.motion.x = Math.ceil(parseInt(this.motion.x + this.motion.vx / this.$element.width(), 10));
				this.motion.y = Math.ceil(parseInt(this.motion.y + this.motion.vy / this.$element.height(), 10));
			}

			this._boundingBoxCheck();

			this.$element.css('transform', 'translate3d(' + this.motion.x + 'px, ' + this.motion.y + 'px, 0)');
		},
		_boundingBoxCheck: function() {

			if(this.motion.x < 0)
			{
				this.motion.x = 0;
				this.motion.vx = -Math.ceil(this.motion.vx * this.options.bounceRatio);
			}

			if(this.motion.y < 0)
			{
				this.motion.y = 0;
				this.motion.vy = -Math.ceil(this.motion.vy * this.options.bounceRatio);
			}

			if(this.motion.x >= this.motion.max_x)
			{
				this.motion.x = this.motion.max_x;
				this.motion.vx = -Math.ceil(this.motion.vx * this.options.bounceRatio);
			}

			if(this.motion.y >= this.motion.max_y)
			{
				this.motion.y = this.motion.max_y;
				this.motion.vy = -Math.ceil(this.motion.vy * this.options.bounceRatio);
			}

			// // Bug Fix
			if(this.motion.x == (this.motion.max_x - 1))
			{
				this.motion.x = this.motion.max_x;
			}

			if(this.motion.y == (this.motion.max_y - 1))
			{
				this.motion.y = this.motion.max_y;
			}
		}
	};

	$.fn[ pluginName ] = function (options) {
		return this.each(function () {
			if ( !$.data( this, 'plugin_' + pluginName ) ) {
				$.data( this, 'plugin_' + pluginName, new Plugin( this, options ));
			}
		});
	};

	$(function(){
		$( '.' + pluginName )[ pluginName ]();
	});

})(jQuery, window, document);
