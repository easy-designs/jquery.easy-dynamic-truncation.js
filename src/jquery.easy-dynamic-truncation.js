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
 * If you want to truncate without giving a user control over expanding, you 
 * can do that by adding data-truncate-no-more, but we recommend only using 
 * this in a mobile context in conjunction with data-truncate-auto-display:
 * 
 * 	<section data-truncate-char-limit="200" data-truncate-no-more
 * 			 data-truncate-auto-display="768">
 * 		<!-- On screens narrower than 768px only 200 characters will 
 * 			 be displayed and no "More" link will appear -->
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
		NULL = null,
		MORE = 'More',
		ALL = 'All',
		HIDE = 'hide',
		SHOW = 'reveal',
		DOT = '.',
		SPACE = ' ',
		A = 'a',
		DATA_ATTR = '[data-',
		CLOSE_SQUARE = ']',
		NOT = ':not(',
		CLOSE_PAREN = ')',
		tap_evt = 'click',
		PREFIX = 'truncate',
		REVEAL = PREFIX + '-reveal',
		HIDE = PREFIX + '-hide',
		COLLAPSED = PREFIX + '-collapsed',
		MAX_ITEMS = PREFIX + '-max-items',
		MAX_ITEMS_SELECTOR = DATA_ATTR + MAX_ITEMS + CLOSE_SQUARE,
		CHAR_LIMIT = PREFIX + '-char-limit',
		AUTO_DISPLAY = PREFIX + '-auto-display',
		EXCLUDE = PREFIX + '-exclude',
		EXCLUDE_SELECTOR = DOT + EXCLUDE,
		MORE_LINK = 'more-link',
		MORE_SELECTOR = DOT + MORE_LINK,
		$truncate = $( MAX_ITEMS_SELECTOR ),
		$reveal = $('<div class="' + MORE_LINK + '"><a class="' + REVEAL + '" href="#show-more">More</a></div>'),
		string_start = '<b class="' + PREFIX + '-string">',
		string_end = '</b>',
		$ellipsis = $('<i class="' + PREFIX + '-ellipsis">\u2026</i>'),
		ELLIPSIS_SELECTOR = DOT + PREFIX + '-ellipsis',
		$win = $(window),
		size = 0;
	
	if ( 'ontouchstart' in window ||
		 'createTouch' in document )
	{
		tap_evt = 'touchend';
	}
	
	
	// resize watcher
	function watchResize(callback)
	{
		var resizing;
		callback.size = size;
		function done()
		{
			var curr_size = $win.width();
			clearTimeout( resizing );
			resizing = NULL;
			// only run on a true resize
			if ( callback.size != curr_size )
			{
				callback();
				callback.size = curr_size;
			}
		}
		$win.resize(function(){
			if ( resizing )
			{
				clearTimeout( resizing );
				resizing = NULL;
			}
			resizing = setTimeout( done, 50 );
		});
		// init
		callback();
	};
	watchResize(function(){
		size = $win.width();
	});
	

	// loop
	$truncate.each(function(){
		
		var $this = $(this),
			skip = $this.data( MAX_ITEMS ),
			exclude = $this.data( EXCLUDE ),
			auto_display = $this.data( AUTO_DISPLAY ),
			// should user be able to re-collapse?
			collapsible = $this.is( DATA_ATTR + PREFIX + '-collapsible]' ),
			// should we display "more"?
			no_more = $this.is( DATA_ATTR + PREFIX + '-no-more]' ),
			// character limit?
			char_limit = FALSE,
			char_total = 0,
			$string = $([]),
			// does more exist already?
			embed = $this.is( DATA_ATTR + PREFIX + '-embed]' ),
			// does more exist already?
			$more_link = $this.siblings( MORE_SELECTOR ),
			has_link = ( $more_link.length > 0 ),
			$link,
			// find the kids
			$children = ( exclude != UNDEFINED ? $this.children( NOT + exclude + CLOSE_PAREN ) : $this.children() )
							// remove any "more" links
							.filter( NOT + MORE_SELECTOR + CLOSE_PAREN );
							
		
		// Character limit
		if ( $this.is( DATA_ATTR + CHAR_LIMIT + CLOSE_SQUARE ) )
		{
			char_limit = parseInt( $this.data( CHAR_LIMIT ), 10 );
			
			// determine where to draw the line
			$children.each(function(){

				// where are we?
				var $child = $(this),
					text = $child.text(),
					html = $child.html(),
					words = text.split( SPACE ),
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
							search = words[i-2] + SPACE + words[i-1] + SPACE;
							
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
			
			$children = $children.filter( NOT + EXCLUDE_SELECTOR + CLOSE_PAREN );
			$string = $this.find( DOT + PREFIX + '-string' );
		}
		
		// manual Skip
		else if ( skip != UNDEFINED )
		{
			$children = $children.eq( skip - 1 ).nextAll();
		}
		

		// reveals the content
		function reveal( $link )
		{
			if ( $this.state == SHOW )
			{
				return;
			}
			
			$children
				.add( $string )
				.removeClass( COLLAPSED );
			
			// no link, just remove the ellipses
			if ( no_more )
			{
				var $first = $children.eq(0).prev();
				if ( $first.length < 1 )
				{
					$first = $string.closest( EXCLUDE_SELECTOR );
				}
				$first.find( ELLIPSIS_SELECTOR )
					.remove();
			}
			// toggle the link
			else
			{
				toggleLink( $link, SHOW );
			}
			
			$this.state = SHOW;
		}
		

		// hides the content
		function hide( $link )
		{
			if ( $this.state == HIDE )
			{
				return;
			}
			
			$children
				.add( $string )
				.addClass( COLLAPSED );
			
			// no link, just add the ellipses
			if ( no_more )
			{
				// find the element that gets the ellipses
				var $first = $children.eq(0).prev();
				if ( $first.length < 1 )
				{
					$first = $string.closest( EXCLUDE_SELECTOR );
				}
				$first.append( $ellipsis.clone() );
			}
			// toggle the link
			else
			{
				toggleLink( $link, HIDE );
			}

			$this.state = HIDE;
		}
		
		
		// toggles the state of things based on the link
		function toggle( e )
		{
			var $link = $(this);

			if ( $link.is( DOT + REVEAL ) )
			{
				reveal( $link );
			}
			else
			{
				hide( $link );
			}

			e.preventDefault();
		}
		
		
		// Handles the More/Less link
		function toggleLink( $link, state )
		{
			state = state || HIDE;
			
			var $first = $children.eq(0).prev(),
				$parent;
			
			// Hiding
			if ( state == HIDE )
			{
				// find the element that gets the "more" link
				if ( $first.length < 1 )
				{
					$first = $string.closest( EXCLUDE_SELECTOR );
				}

				// no matching kids or set to auto_display, don’t bother
				if ( ! auto_display &&
					 $children.length )
				{
					// existing link
					if ( $link != UNDEFINED )
					{
						$link.text( MORE )
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
											.wrap('<span class="' + MORE_LINK + '"/>')
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
						$link.html( $link.html().replace( ALL, MORE ) );
					}
					
					// set up the reveal
					$more_link.on( tap_evt, A, toggle );
				}
			}
			
			// Showing
			else if ( state == SHOW &&
			  		  $link )
			{
				// swap the class
				$link.removeClass( REVEAL );

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

						$more_link.find( ELLIPSIS_SELECTOR )
							.remove();
					}
				}

				// it’s been fun but you work here is done
				else if ( ! has_link )
				{
					$parent = $link.parent();
					if ( $parent.is( MORE_SELECTOR ) )
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
					$link.html( $link.html().replace( MORE, ALL ) );

					$more_link.off( tap_evt, A, toggle );
				}
			}
		}
		
		
		// initialize
		watchResize(function(){

			var threshold = auto_display;
			
			// threshold met?
			if ( threshold != UNDEFINED )
			{
				threshold = size >= threshold;
				
				( threshold ? reveal : hide )();
			}
			else
			{
				hide();
			}
			
		});
		
	});
	
})( jQuery, window, document );
