Accelero
========

This jQuery Plugin was created to manage multiple layers of both vertical and horizontal parallax.  It also combines the ability to add 3D depth by using CSS 3D transforms to rotate and move each layer based on your interaction.

The name Accelero comes from another awesome feature... if your device has an Accelerometer, you can use it to control the parallax.

There are plenty of settings to make this work right for you.  Check out our demos to get an idea of what this plugin can do.

**Follow me on Twitter for Updates**: [@mrmidi](http://twitter.com/mrmidi)

Demo
---
* [Touch & Mouse Based Control](http://lab.peterschmalfeldt.com/accelero/demos/touch.html)
* [Device Accelerometer Control](http://lab.peterschmalfeldt.com/accelero/demos/orientation.html) ( **Cool Note**: Mac Laptops can use this too )

[<img src="http://lab.peterschmalfeldt.com/accelero/demos/images/example.jpg">](http://lab.peterschmalfeldt.com/accelero/demos/touch.html "Touch & Mouse Based Control")

Usage
---
This plugin is hopefully pretty straight forward.  You just make a DIV with the class of **accelero**.  Then you put some more DIVs in that accelero DIV that you want to make awesome.

If for some reason you want to have a DIV inside accelero be ignored so it does not move, just give that DIV a class of **ignore**.

You will likely want to use CSS to set sizes and the images you want for your new found awesomeness, so check out the demos on how we set things up.

Settings
---

You can configure the plugin via the following JavaScript Settings.  Default values shown.

	/** Choose which method you want to control motion. Preference given to orientation and then touch */
	controlMethod: 'auto' // options: auto, touch & orientation

	/** Whether to use CSS Transform Translate to Move X & Y */
	enableMove: true

	/** Whether to use CSS Transform Rotation to Rotate X & Y */
	enableRotate: true

	/** Invert the Layers opposite of how you have them in your HTML */
	invertLayerStack: false

	/** Whether to Flip the X Axis Movement Calculations. Does nothing if enableMove is false. */
	invertMoveX: false

	/** Whether to Flip the Y Axis Movement Calculations. Does nothing if enableMove is false. */
	invertMoveY: false

	/** Whether to Flip the X Axis Rotation Calculations. Does nothing if enableRotate is false. */
	invertRotateX: false

	/** Whether to Flip the Y Axis Rotation Calculations. Does nothing if enableRotate is false. */
	invertRotateY: false

	/** How much rotation to use. Setting it above 45 not recommended. Does nothing if enableRotate is false. */
	maxAngle: 3

	/** Adjust how quickly each layer moves. Does nothing if enableMove is false. */
	speed: 0.2

Or you can use data attributes on the element you will be using for Accelero

	data-control-method="auto"

	data-enable-move="true"

	data-enable-rotate="true"

	data-invert-layer-stack="false"

	data-invert-move-x="false"

	data-invert-move-y="false"

	data-invert-rotate-x="false"

	data-invert-rotate-y="false"

	data-max-angle="3"

	data-speed="0.2"

Example
---

The following example will automatically execute the Accelero plugin since there is a DIV with a class of accelero.

	<div class="layers accelero">
		<div class="layer layer-4"></div>
		<div class="layer layer-3"></div>
		<div class="ignore info">You can put whatever you want here, and since it has an ignore class it will not move</div>
		<div class="layer layer-2"></div>
		<div class="layer layer-1"></div>
	</div>
	<script src="http://code.jquery.com/jquery-1.10.1.min.js"></script>
	<script src="js/jquery.accelero.min.js"></script>

If you would like to change some settings without creating any JavaScript, you can do so using data attributes.

	<div class="layers accelero" data-control-method="touch" data-invert-layer-stack="true" data-speed="0.15" data-max-angle="10">
		<div class="layer layer-4"></div>
		<div class="layer layer-3"></div>
		<div class="layer layer-2"></div>
		<div class="layer layer-1"></div>
	</div>
	<script src="http://code.jquery.com/jquery-1.10.1.min.js"></script>
	<script src="js/jquery.accelero.min.js"></script>

But maybe you want to control when the plugin gets used... thats fine too

	<div class="layers">
		<div class="layer layer-4"></div>
		<div class="layer layer-3"></div>
		<div class="layer layer-2"></div>
		<div class="layer layer-1"></div>
	</div>
	<script src="http://code.jquery.com/jquery-1.10.1.min.js"></script>
	<script src="js/jquery.accelero.min.js"></script>

	<script>
	$('.layers').accelero({
		controlMethod: 'touch',
		invertLayerStack: true,
		invertMoveX: true,
		invertRotateX: true,
		maxAngle: 10,
		speed: 0.15
	});
	</script>

And, FYI, you can still use the data attributes and not have to pass them over when you're ready to call Accelero

	<div class="layers" data-control-method="touch" data-invert-layer-stack="true" data-speed="0.15" data-max-angle="10">
		<div class="layer layer-4"></div>
		<div class="layer layer-3"></div>
		<div class="layer layer-2"></div>
		<div class="layer layer-1"></div>
	</div>
	<script src="http://code.jquery.com/jquery-1.10.1.min.js"></script>
	<script src="js/jquery.accelero.min.js"></script>

	<script>
	$('.layers').accelero();
	</script>
