/*

Scroller
Adds a javascript scroll to content, both vertical and horizontal
Draggable and scrollable with the mouse wheel

Copyright 2011, Joel Larsson
Released under the MIT License

*/
function Scroller(el, horizontal, context, callback) {
	var self = this; // save a reference to this
	// Set window object as the default context
	context = typeof context == "undefined" ? window : context;
	// Is it a horizontal scroll?
	horizontal = typeof horizontal == "undefined" ? true : horizontal;
	
	// The scroll power
	var power = 30; 
	
	// min slider value in pixels
	var min_slider_size = 20; 
	// max slider value - this number is divided with the viewport: viewport_w / max_slider_size
	var max_slider_size = 3; 

	// Element references
	var scrollbar;
	var slider;
	
	// Vars for dragging the slider
	var mouse_offset;
	var drag;
	
	// Caching the mouse coords for IE
	var mouse_coords_cache = null;
	
	// Ratio between slider and viewport
	var ratio;
	
	// The position of the scroll
	this.offset = 0;
	
	// Viewport width
	this.viewport_w = 0;
	// Content width
	this.content_w = 0;
	
	// "Constructor" - Bind events, create scrollbar DOM
	var init = function() {

		// Get the viewport width/height 
		self.viewport_w = horizontal ? parseInt(el.parentNode.offsetWidth) : parseInt(el.offsetHeight);

		// Get the content width/height
		self.content_w = horizontal ? parseInt(el.offsetWidth) : parseInt(el.offsetHeight);
	
			
		// Don't create the scroll if the viewport is bigger than the content (surprise :)
		if (self.viewport_w > self.content_w)
			return;
	
		// Calculate ratio
		ratio = self.viewport_w / (self.content_w - self.viewport_w);
		
		// Calculate max offset
		self.max_offset = -(self.content_w - self.viewport_w);

		// Create the DOM for the scrollbar
		create_scrollbar();		
		
		// Event binding
		if (el.addEventListener)
			el.addEventListener('DOMMouseScroll', scroll_handler, false); // FF
		else if (el.attachEvent)
			el.attachEvent("onmousewheel", scroll_handler); // IE
		// Webkit
		el.onmousewheel = scroll_handler;
		

		bind(slider, "mousedown", on_mouse_down);			
		bind(context, "mouseup", on_mouse_up);
		
	};
	
	// On mouse up - set drag to off and unbind on move move event...
	var on_mouse_up = function(e) {
		drag = false;
		context.onmousemove = null;
	};
	
	// On mouse down - set drag to on and bind on mouse move to be able to know where the mouse is
	var on_mouse_down = function(e) {
		e = e || context.event; 
		mouse_offset = get_mouse_offset(e);

		drag = true;
		
		bind(context, "mousemove", on_mouse_move);
		
		if (e.preventDefault)
			e.preventDefault();
		
		return false;
	}
	
	// Move the slider and the content when dragging the slider. Will only run if drag is true
	var on_mouse_move = function(e) {
		if (drag) {
			e = e || context.event;
			var mouse_pos = mouse_coords(e);
			var value = horizontal ? mouse_pos.x - mouse_offset : mouse_pos.y - mouse_offset;

			var offset = -(value/ratio);

			if (offset > 0 || offset < self.max_offset) return false;
			
			self.scroll_to(offset);	
		}
	};
	
	// Get the mouse coordinates
	var mouse_coords = function(e) { 
		// Do some caching of the coords for IE
		if (!e && !mouse_coords_cache) return {x: 0, y: 0};
		else if (!e && mouse_coords_cache) return mouse_coords_cache;
		
		// Save the coords to the "cache", then return it
		// cross-browser - use pageX/pageY if it exists
		if (e.pageX || e.pageY)
			mouse_coords_cache = {x: e.pageX, y: e.pageY};
		else 
			mouse_coords_cache = {x: e.clientX + context.body.scrollLeft - context.body.clientLeft, y: e.clientY + context.body.scrollTop  - context.body.clientTop};
		
		return mouse_coords_cache; 
	};
	
	// Get mouse offset!
	var get_mouse_offset = function(e) {
		var mouse_pos = mouse_coords(e);
		
		if (horizontal)
			return mouse_pos.x - parseInt(slider.style.left);
		else 
			return mouse_pos.y - parseInt(slider.style.top);

	};
	
	
	// Do stuff when user is scrolling! (scroll the content and move the slider -> this.scroll_to)
	var scroll_handler = function(e) {
		
		e = e || context.event; 
		if (!e) return;
		
		// Get the delta cross-browser
		var delta = 0;
		delta = e.wheelDelta ? e.wheelDelta / 120 : -e.detail / 3; 
		
		// The new offset!
		self.offset = self.offset + (power * delta);
		
		// Prevent to scroll more than the max content and less then zero
		if (self.offset > 0) self.offset = 0;
		if (self.offset < self.max_offset) self.offset = self.max_offset;
		
		// Move the content and the slider
		self.scroll_to(self.offset);
		if (e.preventDefault)
			e.preventDefault();
		return false;
	};	
	
	// Calculate the slider size
	var calc_slider_size = function() {
		var size = ratio * 100;

		

		// Set min and max values
		if (size < min_slider_size) 
			size = min_slider_size;
		else if (size > (self.viewport_w / max_slider_size))
			size = self.viewport_w / max_slider_size;

		// compensate for the slider width
		ratio = ratio - (size / (self.content_w - self.viewport_w));

		return size;
	};
	
	// Create the scroller DOM
	var create_scrollbar = function() {
		scrollbar = document.createElement("div");
		scrollbar.id = "scroller";
		scrollbar.className = horizontal ? "horizontal" : "vertical";
		
		slider = document.createElement("div");
		slider.id = "slider";
		
		
		scrollbar.appendChild(slider);
		el.parentNode.appendChild(scrollbar);
		if (horizontal)
			slider.style.width = calc_slider_size()+"px";
		else
			slider.style.height = calc_slider_size()+"px";
	};
	
	// Move the content
	var move_el = function(value) {
		if (horizontal)
			el.style.left = value + "px";
		else
			el.style.top = value + "px";
		return value;
	};
	
	// Move the slider
	var move_slider = function(value) {
		value = value * ratio;
		if (horizontal)
			slider.style.left = -value + "px";
		else
			slider.style.top = -value + "px";
		return value;
	};
	
	// cross browser event bind helper
	var bind = function(el, eventb, callback) {
		if (el.addEventListener) el.addEventListener(eventb, callback, false);
		else if (el.attachEvent) el.attachEvent("on"+eventb, callback)
		else el[eventb] = callback;
		return el;
	};
	
	// Scroll to - move both the content and the slider 
	this.scroll_to = function(v) {
		if (self.viewport_w > self.content_w)
			return;
		
		if (v < self.max_offset)
			v = self.max_offset;
			
		self.offset = v;
		move_el(v);
		move_slider(v);
		
		if (callback)
			callback(self);
	}; 
	
	init();
};
