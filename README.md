# Scroller

A minimalistic javascript scrollbar. Check out the [demo page here](http://bolmaster2.com/dev/examples/scroller/scroller_example.html)

# HTML
    <div id="outer-container">
			<div id="inner-container">
				(My scroll content goes here...)
			</div>
		</div>
# Javascript
    <script>
			// Create the object and send in the scroll element
			var scroller = new Scroller(document.getElementById("inner-container"));
		</script>