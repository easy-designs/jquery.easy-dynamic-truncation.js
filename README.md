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

If you want the children to be automatically shown when screens are over a certain size, use the `data-truncate-auto-display` attribute:

	<section data-truncate-max-items="2" data-truncate-auto-display="768">
		<!-- By default only 2 children will be shown if the screen is less
		     than 768px and a "Show More" link will be dynamically added -->
	</section>

Finally, you can exclude elements from being hidden using the `data-truncate-exclude` attribute to specify a selector to use for exclusion:

	<section data-truncate-max-items="2" data-truncate-auto-display="768"
	         data-truncate-exclude=".entry-meta">
		<!-- By default only 2 children (that are not classified as "entry-meta"
		     will be shown if the screen is less than 768px and a "Show More"
		     link will be dynamically added -->
	</section>