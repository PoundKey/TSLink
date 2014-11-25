/**
 * Custom plugin for bersua theme
 */
(function($){
	
	$.fn.bersua = function( opt ){
		
		var obj = this,
			/***   Default options   ***/
			defaults = {
				startDate : new Date(),
				endDate : new Date(),
				titleDays : 'days',
				titleHours : 'hours',
				titleMinutes : 'minutes',
				titleSeconds : 'seconds',
				theme: 'custome',
				videoID: ''
			},
			options = $.extend(defaults, opt);
	
		obj.init = function(){
			
			// Activate count down
			$("#countdown").dsCountDown( options );
			
			// Activate tooltip for social media link
			$(".social-links a").aToolTip({
				fixed: true,
				inSpeed: 400,
				xOffset: -107.5
			});		
			
			// Activate placeholder for old browser
			$(":input[placeholder]").placeholder();
			
			// Activate ajax for newsletter form
			$('form').submit(function(event){
				event.preventDefault();
				
				var form = $(this);
				
				if(form.hasClass('processing')){
					return false;
				}
				
				var send_destination = form.attr('action') + '?ajax=1';
				var send_data = form.serialize();
				
				form.addClass('processing');
				$.ajax({
					type: 'POST',
					url: send_destination,
					dataType: 'json',
					data: send_data,
					success: function(result){
					
						if(result.error){
							form.find('.message').html(result.message);
						}else if(result.success){
							form.find('.message').html(result.message);
							form.find('input[type="text"]').val('');
							form.find('textarea').val('');
						}
						
						form.removeClass('processing');
						
					}
				});
				
			});
			
			//Activate navigation for contact page when contact link clicked
			$('.btn-trigger').bind('click', function(event){
				event.preventDefault();
				var href = $($(this).attr('href'));
				
				$('.page.active').addClass('deactive');
				setTimeout(function(){
					$('.page.active').removeClass('active').addClass('hidden');
					href.removeClass('hidden');
					setTimeout(function(){
						href.removeClass('deactive').addClass('active');
					}, 100);
				}, 1001);
			});
			
			$('#preloader').fadeOut('slow');
			
			// Activate background
			if( options.videoId ){
				// Nothing todo since it's done by on ready state
			}else{
				var bg = $('#background img');
				if( bg.size() == 1){
					var imageSrc = $('#background img').attr('src');
					$.vegas({
						src: imageSrc,
						fade: 2000
					});
				}else if(bg.size() > 1){
					var theBackgrounds = [];
					bg.each(function(){
						theBackgrounds[theBackgrounds.length] = {
							src: $(this).attr('src'),
							fade: 1500
						};
					});
					$.vegas('slideshow', {
						delay: 7000,
						backgrounds: theBackgrounds
					})('overlay');
				}
			}
		}
		
		// Do preloader
		obj.preloading = function(){
			var preloader = $('<div id="preloader"><div class="loading"><div class="label">loading...</div></div></div>');
			obj.prepend(preloader);
			preloader.numberBg = $('#background img').size();
			if( preloader.numberBg ){
				$('#background img').each(function(index){
					$('.loading', preloader).append('<span class="indicator-'+ index +'"></span>');
					var bg = $(this);
					bg.itemIndex = index;
					var img = new Image();
					img.onload = function(){
						$('.indicator-' + bg.itemIndex).addClass('done');
						if( $('.done', preloader).size() >= preloader.numberBg ){
							setTimeout(function(){ obj.init(); }, 500);
						}
					};
					img.src = $(this).attr('src');
				});
			}else{
				obj.init();
			}
		}
		
		obj.preloading();
		
	}
	
})(jQuery);