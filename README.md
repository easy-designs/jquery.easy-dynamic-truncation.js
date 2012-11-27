jquery.easy-dynamic-truncation.js
=================================

A simple declarative helper for dynamically truncating text on the client

The API
-------

To add dynamic truncation, you must set the maximum number of items to display using the `data-truncate-max-items` parameter:

	<section data-truncate-max-items="2">
		<!-- By default only 2 children will be shown and a "show More" 
		     link will be dynamically added -->
	</section>

Or you can set an arbitrary character length:

	<section data-truncate-char-limit="600">
		<!-- By default only 600 characters will be shown (across multiple 
			 elements) and a "show More" link will be dynamically added -->
	</section>

If you want the children to be automatically shown when screens are over a certain size, use the `data-truncate-auto-display` attribute:

	<section data-truncate-max-items="2" data-truncate-auto-display="768">
		<!-- By default only 2 children will be shown if the screen is less
		     than 768px and a "Show More" link will be dynamically added -->
	</section>

If you want to truncate without giving a user control over expanding, you can do that by adding `data-truncate-no-more`, but we recommend only using this in a mobile context in conjunction with `data-truncate-auto-display`:

	<section data-truncate-char-limit="200" data-truncate-no-more
			 data-truncate-auto-display="768">
		<!-- On screens narrower than 768px only 200 characters will 
			 be displayed and no "More" link will appear -->
	</section>

If you want to allow the user to re-collapse the interface, use the `data-truncate-collapsible` attribute:

	<section data-truncate-max-items="2" data-truncate-collapsible>
		<!-- By default only 2 children will be shown and the user will be 
	 		 able to re-collapse the collection at will with a "less" link -->
 	</section>

Finally, you can exclude elements from being hidden using the `data-truncate-exclude` attribute to specify a selector to use for exclusion:

	<section data-truncate-max-items="2" data-truncate-auto-display="768"
	         data-truncate-exclude=".entry-meta">
		<!-- By default only 2 children (that are not classified as "entry-meta"
		     will be shown if the screen is less than 768px and a "Show More"
		     link will be dynamically added -->
	</section>