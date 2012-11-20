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
 * Or you can set an arbitrary character length:
 * 
 * 	<section data-truncate-char-limit="600">
 * 		<!-- By default only 600 characters will be shown (across multiple 
 * 			 elements) and a "show More" link will be dynamically added -->
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
 * If you want to allow the user to re-collapse the interface, use the 
 * data-truncate-collapsible attribute:
 * 
 * 	<section data-truncate-max-items="2" data-truncate-collapsible>
 * 		<!-- By default only 2 children will be shown and the user will be 
 * 			 able to re-collapse the collection at will with a "less" link -->
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
	
	var FALSE = false,
		tap_evt = 'click',
		PREFIX = 'truncate',
		REVEAL = PREFIX + '-reveal',
		HIDE = PREFIX + '-hide',
		COLLAPSED = PREFIX + '-collapsed',
		MAX_ITEMS = PREFIX + '-max-items',
		MAX_ITEMS_SELECTOR = '[data-' + MAX_ITEMS + ']',
		CHAR_LIMIT = PREFIX + '-char-limit',
		AUTO_DISPLAY = PREFIX + '-auto-display',
		EXCLUDE = PREFIX + '-exclude',
		$truncate = $( MAX_ITEMS_SELECTOR ),
		$reveal = $('<div class="more-link"><a class="' + REVEAL + '" href="#show-more">More</a></div>'),
		string_start = '<b class="' + PREFIX + '-string">',
		string_end = '</b>',
		$ellipsis = $('<i class="' + PREFIX + '-ellipsis">\u2026</i>');
	
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
			// should user be able to re-collapse?
			collapsible = $this.is( '[data-' + PREFIX + '-collapsible]' ),
			// character limit?
			char_limit = FALSE,
			char_total = 0,
			$string = $([]),
			// does more exist already?
			embed = $this.is( '[data-' + PREFIX + '-embed]' ),
			// does more exist already?
			$more_link = $this.siblings('.more-link'),
			has_link = ( $more_link.length > 0 ),
			$link,
			// find the kids
			$children = ( exclude != UNDEFINED ? $this.children( ':not(' + exclude + ')' ) : $this.children() )
							// remove any "more" links
							.filter(':not(.more-link)');
							
		if ( auto_display != UNDEFINED )
		{
			auto_display = $(window).width() >= auto_display;
		}
		
		// Character limit
		if ( $this.is( '[data-' + CHAR_LIMIT + ']' ) )
		{
			char_limit = parseInt( $this.data( CHAR_LIMIT ), 10 );
			
			// determine where to draw the line
			$children.each(function(){

				// where are we?
				var $child = $(this),
					text = $child.text(),
					html = $child.html(),
					words = text.split(' '),
					length = text.length;
				
				// we’ll exclude up until we bust
				$child.addClass( EXCLUDE );

				// dive in?
				if ( ( char_total + length ) > char_limit )
				{

					$.each( words, function( i, word ){
						
						var word_length = word.length + 1, // +1 for the space
							search;
						
						if ( char_total + word_length > char_limit )
						{
							// get the previous words
							search = words[i-2] + ' ' + words[i-1] + ' ';
							
							// wrap the arbitrary text
							$child.html(
								html.replace( search, search + string_start ) + string_end
							);
							
							// bust out;
							return FALSE;
						}
						
						// add it up
						char_total += word_length;
					});
					
					// bust out
					return FALSE;
				}
				
				// add it up
				char_total += length;
			});
			
			$children = $children.filter( ':not(.' + EXCLUDE + ')' );
			$string = $('.' + PREFIX + '-string');
		}
		
		// manual Skip
		else if ( skip != UNDEFINED )
		{
			$children = $children.eq( skip - 1 ).nextAll();
		}
		
		
		function reveal( $link )
		{
			var $parent = $link.parent();

			// reveal the kids
			$children
				.add( $string )
				.removeClass( COLLAPSED );
			
			// swap the class
			$link
				.removeClass( REVEAL );
			
			// collapsible?
			if ( collapsible )
			{
				$link.text( 'Less' )
					.addClass( HIDE );
				
				// relocate to the last child?
				if ( embed )
				{
					$children.last()
						.append( $more_link );
					
					$more_link.find( '.' + PREFIX + '-ellipsis' )
						.remove();
				}
			}
			
			// it’s been fun but you work here is done
			else if ( ! has_link )
			{
				if ( $parent.is('.more-link') )
				{
					$parent.remove();
				}
				else
				{
					$link.remove();
				}
			}
			
			// Existing link
			else
			{
				// swap out "More" for "All"
				$link.html( $link.html().replace( 'More', 'All' ) );
				
				$more_link.off( tap_evt, 'a', toggle );
			}
		 }
	
		function hide( $link )
		{
			// find the element that gets the "more" link
			var $first = $children.eq(0).prev();
			if ( $first.length < 1 )
			{
				$first = $string.closest( '.' + EXCLUDE + ')' );
			}
			
			// no matching kids or set to auto_display, don’t bother
			if ( ! auto_display &&
				 $children.length )
			{
				// hide initially
				$children
					.add( $string )
					.addClass( COLLAPSED );
				
				// existing link
				if ( $link != UNDEFINED )
				{
					$link.text( 'More' )
					// swap the class
						.addClass( REVEAL )
						.removeClass( HIDE );
						
					// relocate to the previous child?
					if ( embed )
					{
						$first.append(
							$more_link
								.prepend( $ellipsis.clone() )
						);
					}
				}
				
				// non-existant link (first run?)
				else if ( ! has_link )
				{
					$more_link = $reveal.clone();

					// embed it in the previous child?
					if ( embed )
					{
						$more_link = $more_link.find('a')
										.wrap('<span class="more-link"/>')
										.parent()
											.prepend( $ellipsis.clone() );
						$first.append( $more_link );
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

			}
		}
		
		function toggle( e )
		{
			var $link = $(this);

			if ( $link.is( '.' + REVEAL ) )
			{
				reveal( $link );
			}
			else
			{
				hide( $link );
			}

			e.preventDefault();
		}
		
		hide();

		// set up the reveal
		$more_link.on( tap_evt, 'a', toggle );
		
	});
	
})( jQuery, window, document );