/*! (c) Aaron Gustafson (@AaronGustafson). MIT License. http://github.com/easy-designs/jquery.easy-dynamic-truncation.js */

/* Dynamic Truncation API
 * 
 * To add dynamic truncation, you must set the maximum number of items to 
 * display using the data-truncate-max-items parameter:
 * 
 * 	<section data-truncate-max-items="2">
 * 		<!-- By default only 2 children will be shown and a "show More" 
 * 		     link will be dynamically added -->
 * 	</section>
 * 
 * If you want the children to be automatically shown when screens are over
 * a certain size, use the data-truncate-auto-display attribute:
 * 
 * 	<section data-truncate-max-items="2" data-truncate-auto-display="768">
 * 		<!-- By default only 2 children will be shown if the screen is less
 * 		     than 768px and a "show More" link will be dynamically added -->
 * 	</section>
 * 
 * Finally, you can exclude elements from being hidden using the 
 * data-truncate-exclude attribute to specify a selector to use for exclusion:
 * 
 * 	<section data-truncate-max-items="2" data-truncate-auto-display="768"
 * 	         data-truncate-exclude=".entry-meta">
 * 		<!-- By default only 2 children (that are not classified as "entry-meta"
 * 		     will be shown if the screen is less than 768px and a "show More"
 * 		     link will be dynamically added -->
 * 	</section>
 * 
 **/
;(function( $, window, document, UNDEFINED ){
	
	var tap_evt = 'click',
		PREFIX = 'truncate',
		REVEAL = PREFIX + '-reveal',
		COLLAPSED = PREFIX + '-collapsed',
		MAX_ITEMS = PREFIX + '-max-items',
		MAX_ITEMS_SELECTOR = '[data-' + MAX_ITEMS + ']',
		AUTO_DISPLAY = PREFIX + '-auto-display',
		EXCLUDE = PREFIX + '-exclude',
		$truncate = $( MAX_ITEMS_SELECTOR ),
		$reveal = $('<div class="more-link"><a class="' + REVEAL + '" href="#show-more">Read More</a></div>');
	
	if ( 'ontouchstart' in window ||
		 'createTouch' in document )
	{
		tap_evt = 'touchend';
	}
	
	$truncate.each(function(){
		
		var $this = $(this),
			skip = $this.data( MAX_ITEMS ),
			exclude = $this.data( EXCLUDE ),
			auto_display = $this.data( AUTO_DISPLAY ),
			// does more exist already?
			embed = $this.is( '[data-' + PREFIX + '-embed]' ),
			// does more exist already?
			$more_link = $this.siblings('.more-link'),
			has_link = ( $more_link.length > 0 ),
			$link,
			// find the kids
			$children = ( exclude != UNDEFINED ? $this.children( ':not(' + exclude + ')' ) : $this.children() )
							// get all siblings after the one we want to skip
							.eq( skip - 1 ).nextAll()
							// remove any more links
							.filter(':not(.more-link)');
							
		if ( auto_display != UNDEFINED )
		{
			auto_display = $(window).width() >= auto_display;
		}
		
		function reveal( e )
		{
			var $this = $(this),
				$parent = $this.parent();

			// reveal the kids
			$children.removeClass( COLLAPSED );
			
			// remove the class
			$this.removeClass( REVEAL );
			
			// it’s been fun but you work here is done
			if ( ! has_link )
			{
				if ( $parent.is('.more-link') )
				{
					$parent.remove();
				}
				else
				{
					$this.remove();
				}
			}
			else
			{
				// swap out "More" for "All"
				$this.html( $this.html().replace( 'More', 'All' ) );
				
				$this.off( tap_evt, reveal );
				
				e.preventDefault();
			}
		 }
	
		// no matching kids or set to auto_display, don’t bother
		if ( ! auto_display &&
			 $children.length )
		{
			// hide initially
			$children.addClass( COLLAPSED );
			
			if ( ! has_link )
			{
				$more_link = $reveal.clone();
				
				// embed it in the previouous child?
				if ( embed )
				{
					$more_link = $more_link.find('a')
									.wrap('<span class="more-link"/>')
									.parent()
										.prepend( '\u2026 ' );
					$children.eq(0).prev()
						.append( $more_link );
				}
				else
				{
					$this.closest(':not(ol,ul,dl)')
						.append( $more_link );
				}
			}
			else
			{
				$link = $more_link.find('a')
							.addClass( REVEAL );
				
				// swap out "All" for "More"
				$link.html( $link.html().replace( 'All', 'More' ) );
			}

			// set up the reveal
			$more_link.on( tap_evt, reveal );
		}
		
	});
	
})( jQuery, window, document );
