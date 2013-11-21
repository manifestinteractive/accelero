/*
 * Accelero
 * https://github.com/manifestinteractive/accelero
 * Copyright (c) 2013 Peter Schmalfeldt <me@peterschmalfeldt.com>
 * Updates: http://twitter.com/mrmidi
 * Licensed under the MIT, GPL licenses.
 */

;(function ($, window, document, undefined) {

	var pluginName = 'accelero';

	var defaults = {

		/** Choose which method you want to control motion. Preference given to orientation and then touch */
		controlMethod: 'auto', // auto, orientation, touch

		/** Whether to use CSS Transform Translate to Move X & Y */
		enableMove: true,

		/** Whether to use CSS Transform Rotation to Rotate X & Y */
		enableRotate: true,

		/** Invert the Layers opposite of how you have them in your HTML */
		invertLayerStack: false,

		/** Whether to Flip the X Axis Movement Calculations. Does nothing if enableMove is false. */
		invertMoveX: false,

		/** Whether to Flip the Y Axis Movement Calculations. Does nothing if enableMove is false. */
		invertMoveY: false,

		/** Whether to Flip the X Axis Rotation Calculations. Does nothing if enableRotate is false. */
		invertRotateX: false,

		/** Whether to Flip the Y Axis Rotation Calculations. Does nothing if enableRotate is false. */
		invertRotateY: false,

		/** How much rotation to use. Setting it above 45 not recommended. Does nothing if enableRotate is false. */
		maxAngle: 3,

		/** Adjust how quickly each layer moves. Does nothing if enableMove is false. */
		speed: 0.2
	};

	function Plugin(element, options) {
		this.element = element;
		this.$element = $(element);

		var dataOptions = {};
		var setData = this.$element.data();

		/** Allow settings to be placed as data attributes on container */
		for(var i in setData)
		{
		    if(defaults.hasOwnProperty(i) && (typeof(defaults[i] === 'string')) || typeof(defaults[i] === 'number') || typeof(defaults[i] === 'boolean'))
		    {
		        dataOptions[i] = setData[i];
		    }
		}

		/** Store Variables for Plugin */
		this.options = $.extend( {}, defaults, dataOptions, options );
		this._defaults = defaults;
		this._name = pluginName;
		this._accelero = {};
		this._motion = {};
		this._supported = {
			motion: (typeof window.DeviceMotionEvent !== 'undefined'),
			orientation: (typeof window.DeviceOrientationEvent !== 'undefined'),
			touch: ('ontouchstart' in window) || (typeof navigator.msMaxTouchPoints !== 'undefined'),
			mouse: ('onmousemove' in window)
		};

		this.init();
	}

	Plugin.prototype = {
		init: function () {

			var $that = this;

			/** Shim for Request Animation */
			window.requestAnimFrame = (function(){
				return  window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function( callback ){ window.setTimeout(callback, 1000 / 60); };
			})();

			/** Fetch layers we need to work with, and detect if what order to sort them in */
			if(this.options.invertLayerStack)
			{
				/** Use the DIVs as they are in the HTML */
				this._accelero.layers = $('> div:not(.ignore)', this.$element);
			}
			else
			{
				/** Reverse the DIVs so they appear more intuitively */
				this._accelero.layers = $($('> div:not(.ignore)', this.$element).get().reverse());
			}

			/** Store Layer Count */
			this._accelero.layerCount = $('> div:not(.ignore)', this.$element).length;

			/** Write Layer Count as Data Attribute to Container Element */
			$(this.$element).data('layer-count', this._accelero.layerCount);

			/** Initialize Element Sizes */
			this.resize();

			/** Detect Device Motion Support */
			if(this._supported.orientation && (this.options.controlMethod == 'auto' || this.options.controlMethod == 'orientation'))
			{
				window.addEventListener('deviceorientation', function(event){

					$that._motion.ax = event.gamma * 5;
					$that._motion.ay = event.beta * 7;

					window.requestAnimFrame(function(evt){
						$that.move(evt);
					});

				}, false);
			}
			/** Detect Mouse & Touch Support */
			else if((this._supported.touch || this._supported.mouse) && (this.options.controlMethod == 'auto' || this.options.controlMethod == 'touch'))
			{
				$(this.$element).mousemove(function(event){
					$.proxy($that.move(event), $that);
				});

				this.element.addEventListener('touchmove', function(event){
					$.proxy($that.move(event), $that);
					event.preventDefault();
				});
			}

			/** Setup Event Listeners */
			$(window).resize(function() {
				$.proxy($that.resize(), $that);
			});

			window.onorientationchange = function(){
				$.proxy($that.resize(), $that);
			};
		},
		/** We need to calculate the center for each layer when the container changes size */
		resize: function(){
			var $that = this;

			/** Store the size of our Container */
			$that._accelero.centerX = ($that.$element.width() / 2);
			$that._accelero.centerY = ($that.$element.height() / 2);

			/** Loop through each layer */
			$that._accelero.layers.each(function(i, el) {

				var z_index = (i+1),
					left = ($(el).width() - $that.$element.width()) / 2,
					top = ($(el).height() - $that.$element.height()) / 2;

				$(el).css({
					'z-index': z_index,
					'left':  -left + 'px',
					'top':  -top + 'px'
				}).data('layer', z_index);
			});
		},
		/** Figure out how we're going to move and set the data we need */
		track: function(evt, i, el)
		{
			var $that = this,
				landscape_orientation = true,
				reverse = false,
				upside_down = false;

			/** Check Device Orientation since we might need to redo some math */
			if(typeof window.orientation !== 'undefined')
			{
				landscape_orientation = false;

				/** device is in landscape, so X & Y axis need to swap */
				if(window.orientation === 90 || window.orientation === -90)
				{
					landscape_orientation = true;
					reverse = true;
				}
				/** Devise is Upside Down, we'll need to invert our numbers */
				if(window.orientation === -90)
				{
					upside_down = true;
				}
			}

			/** Detect Device Motion Support */
			if($that._supported.orientation && ($that.options.controlMethod == 'auto' || $that.options.controlMethod == 'orientation'))
			{
				if(reverse)
				{
					$that._accelero.centerOffsetX = $that._motion.ay;
					$that._accelero.centerOffsetY = (upside_down) ? -$that._motion.ax : $that._motion.ax;
				}
				else
				{
					$that._accelero.centerOffsetX = $that._motion.ax;
					$that._accelero.centerOffsetY = (upside_down) ? -$that._motion.ay : $that._motion.ay;
				}
			}
			/** Detect Mouse & Touch Support */
			else if(($that._supported.touch || $that._supported.mouse) && ($that.options.controlMethod == 'auto' || $that.options.controlMethod == 'touch'))
			{
				if(typeof $that._accelero.currentX == 'undefined')
				{
					$that._accelero.currentX = evt.pageX;
				}
				if(typeof $that._accelero.currentY == 'undefined')
				{
					$that._accelero.currentY = evt.pageY;
				}

				/** Do Calculations on Mouse / Finger Movement */
				$that._accelero.xdiff = evt.pageX - $that._accelero.currentX;
				$that._accelero.ydiff = evt.pageY - $that._accelero.currentY;

				$that._accelero.currentX = evt.pageX;
				$that._accelero.currentY = evt.pageY;

				$that._accelero.px = ($that._accelero.xdiff * $that.options.speed) * (i + 1);
				$that._accelero.py = ($that._accelero.ydiff * $that.options.speed) * (i + 1);

				$that._accelero.newX = $(el).position().left + $that._accelero.px;
				$that._accelero.newY = $(el).position().top + $that._accelero.py;

				$that._accelero.centerOffsetX = evt.pageX - ($that.$element.offset().left + ($that.$element.width() / 2));
				$that._accelero.centerOffsetY = evt.pageY - ($that.$element.offset().top + ($that.$element.height() / 2));

				/** Write Data Attributes to Container */
				$($that.$element).data('current-x', $that._accelero.currentX);
				$($that.$element).data('current-y', $that._accelero.currentY);
				$($that.$element).data('x-diff', $that._accelero.xdiff);
				$($that.$element).data('y-diff', $that._accelero.ydiff);
			}
		},
		/** Move & Rotate the Layers */
		move: function(evt){
			var $that = this;

			/** Loop through each layer */
			$that._accelero.layers.each(function(i, el) {

				/** Figure out where we are */
				$that.track(evt, i, el);

				/** Calculate Rotation for X */
				if($that.options.invertRotateX)
				{
					/** Check which side of center we are on */
					$that._accelero.rotateX = ($that._accelero.centerOffsetX > 0)
						? -($that.options.maxAngle * (i + 1)) * ($that._accelero.centerOffsetX / $that._accelero.centerX)
						: ($that.options.maxAngle * (i + 1)) * (Math.abs($that._accelero.centerOffsetX) / $that._accelero.centerX);
				}
				else
				{
					/** Check which side of center we are on */
					$that._accelero.rotateX = ($that._accelero.centerOffsetX > 0)
						? ($that.options.maxAngle * (i + 1)) * ($that._accelero.centerOffsetX / $that._accelero.centerX)
						: -($that.options.maxAngle * (i + 1)) * (Math.abs($that._accelero.centerOffsetX) / $that._accelero.centerX);
				}

				/** Calculate Rotation for Y */
				if($that.options.invertRotateY)
				{
					/** Check which side of center we are on */
					$that._accelero.rotateY = ($that._accelero.centerOffsetY > 0)
						? ($that.options.maxAngle * (i + 1)) * ($that._accelero.centerOffsetY / $that._accelero.centerY)
						: -($that.options.maxAngle * (i + 1)) * (Math.abs($that._accelero.centerOffsetY) / $that._accelero.centerY);
				}
				else
				{
					/** Check which side of center we are on */
					$that._accelero.rotateY = ($that._accelero.centerOffsetY > 0)
						? -($that.options.maxAngle * (i + 1)) * ($that._accelero.centerOffsetY / $that._accelero.centerY)
						: ($that.options.maxAngle * (i + 1)) * (Math.abs($that._accelero.centerOffsetY) / $that._accelero.centerY);
				}

				/** Calculate Movement for X */
				if($that.options.invertMoveX)
				{
					$that._accelero.translateX = -(($that._accelero.centerOffsetX / ($that._accelero.layerCount - i )) * $that.options.speed);
				}
				else
				{
					$that._accelero.translateX = (($that._accelero.centerOffsetX / ($that._accelero.layerCount - i )) * $that.options.speed);
				}

				/** Calculate Movement for Y */
				if($that.options.invertMoveY)
				{
					$that._accelero.translateY = -(($that._accelero.centerOffsetY / ($that._accelero.layerCount - i )) * $that.options.speed);
				}
				else
				{
					$that._accelero.translateY = (($that._accelero.centerOffsetY / ($that._accelero.layerCount - i )) * $that.options.speed);
				}

				/**  */
				switch(true)
				{
					/** Transform Both Rotation and Movement */
					case ($that.options.enableMove && $that.options.enableRotate):
						$that._accelero.transform = {
							'transform-origin': '50% 50%',
							'transform': 'perspective( 600px ) rotateX('+$that._accelero.rotateY+'deg) rotateY('+$that._accelero.rotateX+'deg) translateX('+$that._accelero.translateX+'px) translateY('+$that._accelero.translateY+'px)',
							'z-index': (i+1) * 10
						};
						break;

					/** Transform Only Movement */
					case ($that.options.enableMove):
						$that._accelero.transform = {
							'transform': 'translateX('+$that._accelero.translateX+'px) translateY('+$that._accelero.translateY+'px)',
							'z-index': (i+1) * 10
						};
						break;

					/** Transform Only Rotation */
					case ($that.options.enableRotate):
						$that._accelero.transform = {
							'transform-origin': '50% 50%',
							'transform': 'perspective( 600px ) rotateX('+$that._accelero.rotateY+'deg) rotateY('+$that._accelero.rotateX+'deg)',
							'z-index': (i+1) * 10
						};
						break;

					default:
						$that._accelero.transform = { 'z-index': (i+1) * 10 };
				}

				/** Write Data Attributes to each Layer */
				$(el).data('layer', (i+1) * 10);
				$(el).data('rotate-x', $that._accelero.rotateX);
				$(el).data('rotate-y', $that._accelero.rotateY);
				$(el).data('translate-x', $that._accelero.translateX);
				$(el).data('translate-y', $that._accelero.translateY);

				/** Actually move the layer */
				$(el).css($that._accelero.transform);

			});
		}
	};

	/** Setup Plugin */
	$.fn[ pluginName ] = function (options) {
		return this.each(function () {
			if ( !$.data( this, 'plugin_' + pluginName ) ) {
				$.data( this, 'plugin_' + pluginName, new Plugin( this, options ));
			}
		});
	};

	/** Self executing plugin if you add the classname accelero to your layers container  */
	$(function(){
		$( '.' + pluginName )[ pluginName ]();
	});

})(jQuery, window, document);
