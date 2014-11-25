/*! jQuery Placeholder Plugin - v0.7.0 - 2013-02-18
* http://andrew-jones.com/jquery-placeholder-plugin
* Copyright (c) 2013 Andrew Jones; Licensed MIT */
(function(a){"use strict",a.extend({placeholder:{settings:{focusClass:"placeholderFocus",activeClass:"placeholder",overrideSupport:!1,preventRefreshIssues:!0}}}),a.support.placeholder="placeholder"in document.createElement("input"),a.fn.plVal=a.fn.val,a.fn.val=function(b){if(typeof b=="undefined")return a.fn.plVal.call(this);var c=a(this[0]),d=c.plVal(),e=a(this).plVal(b);return c.hasClass(a.placeholder.settings.activeClass)&&d===c.attr("placeholder")?(c.removeClass(a.placeholder.settings.activeClass),e):c.hasClass(a.placeholder.settings.activeClass)&&c.plVal()===c.attr("placeholder")?"":a.fn.plVal.call(this,b)},a(window).bind("beforeunload.placeholder",function(){var b=a("input."+a.placeholder.settings.activeClass);b.length>0&&b.val("").attr("autocomplete","off")}),a.fn.placeholder=function(b){return b=a.extend({},a.placeholder.settings,b),!b.overrideSupport&&a.support.placeholder?this:this.each(function(){var c=a(this);if(!c.is("[placeholder]"))return;if(c.is(":password"))return;b.preventRefreshIssues&&c.attr("autocomplete","off"),c.bind("focus.placeholder",function(){var c=a(this);this.value===c.attr("placeholder")&&c.hasClass(b.activeClass)&&c.val("").removeClass(b.activeClass).addClass(b.focusClass)}),c.bind("blur.placeholder",function(){var c=a(this);c.removeClass(b.focusClass),this.value===""&&c.val(c.attr("placeholder")).addClass(b.activeClass)}),c.triggerHandler("blur"),c.parents("form").submit(function(){c.triggerHandler("focus.placeholder")})})}})(jQuery);




/*Plugin by: Ara Abcarians: http://ara-abcarians.com License: http://creativecommons.org/licenses/by/3.0/ */
(function($){$.fn.aToolTip=function(options){var defaults={closeTipBtn:'aToolTipCloseBtn',toolTipId:'aToolTip',fixed:false,clickIt:false,inSpeed:200,outSpeed:100,tipContent:'',toolTipClass:'defaultTheme',xOffset:5,yOffset:5,onShow:null,onHide:null},settings=$.extend({},defaults,options);return this.each(function(){var obj=$(this);if(obj.attr('title')){var tipContent=obj.attr('title');}else{var tipContent=settings.tipContent;}
var buildaToolTip=function(){$('body').append("<div id='"+settings.toolTipId+"' class='"+settings.toolTipClass+"'><p class='aToolTipContent'>"+tipContent+"</p></div>");if(tipContent&&settings.clickIt){$('#'+settings.toolTipId+' p.aToolTipContent').append("<a id='"+settings.closeTipBtn+"' href='#' alt='close'>close</a>");}},positionaToolTip=function(){$('#'+settings.toolTipId).css({top:(obj.offset().top-$('#'+settings.toolTipId).outerHeight()-settings.yOffset)+'px',left:(obj.offset().left+obj.outerWidth()+settings.xOffset)+'px'}).stop().fadeIn(settings.inSpeed,function(){if($.isFunction(settings.onShow)){settings.onShow(obj);}});},removeaToolTip=function(){$('#'+settings.toolTipId).stop().fadeOut(settings.outSpeed,function(){$(this).remove();if($.isFunction(settings.onHide)){settings.onHide(obj);}});};if(tipContent&&!settings.clickIt){obj.hover(function(){$('#'+settings.toolTipId).remove();obj.attr({title:''});buildaToolTip();positionaToolTip();},function(){removeaToolTip();});}
if(tipContent&&settings.clickIt){obj.click(function(el){$('#'+settings.toolTipId).remove();obj.attr({title:''});buildaToolTip();positionaToolTip();$('#'+settings.closeTipBtn).click(function(){removeaToolTip();return false;});return false;});}
if(!settings.fixed&&!settings.clickIt){obj.mousemove(function(el){$('#'+settings.toolTipId).css({top:(el.pageY-$('#'+settings.toolTipId).outerHeight()-settings.yOffset),left:(el.pageX+settings.xOffset)});});}});};})(jQuery);



/*!
	dsCountDown v1.1
	jQuery count down plugin
	(c) 2013 I Wayan Wirka - http://iwayanwirka.duststone.com/dscountdown/
	license: http://www.opensource.org/licenses/mit-license.php
*/
(function(e){e.fn.dsCountDown=function(t){var n=this;n.data={refreshed:1e3,thread:null,running:false,left:0,decreament:1,interval:0,seconds:0,minutes:0,hours:0,days:0,elemDays:null,elemHours:null,elemMinutes:null,elemSeconds:null};var r={startDate:new Date,endDate:null,elemSelDays:"",elemSelHours:"",elemSelMinutes:"",elemSelSeconds:"",theme:"white",titleDays:"Days",titleHours:"Hours",titleMinutes:"Minutes",titleSeconds:"Seconds",onBevoreStart:null,onClocking:null,onFinish:null};n.options=e.extend({},r,t);if(this.length>1){this.each(function(){e(this).dsCountDown(t)});return this}n.init=function(){if(!n.options.elemSelSeconds){n.prepend('<div class="ds-element ds-element-seconds">							<div class="ds-element-title">'+n.options.titleSeconds+'</div>							<div class="ds-element-value ds-seconds">00</div>						</div>');n.data.elemSeconds=n.find(".ds-seconds")}else{n.data.elemSeconds=n.find(n.options.elemSelSeconds)}if(!n.options.elemSelMinutes){n.prepend('<div class="ds-element ds-element-minutes">							<div class="ds-element-title">'+n.options.titleMinutes+'</div>							<div class="ds-element-value ds-minutes">00</div>						</div>');n.data.elemMinutes=n.find(".ds-minutes")}else{n.data.elemMinutes=n.find(n.options.elemSelMinutes)}if(!n.options.elemSelHours){n.prepend('<div class="ds-element ds-element-hours">							<div class="ds-element-title">'+n.options.titleHours+'</div>							<div class="ds-element-value ds-hours">00</div>						</div>');n.data.elemHours=n.find(".ds-hours")}else{n.data.elemHours=n.find(n.options.elemSelHours)}if(!n.options.elemSelDays){n.prepend('<div class="ds-element ds-element-days">							<div class="ds-element-title">'+n.options.titleDays+'</div>							<div class="ds-element-value ds-days">00</div>						</div>');n.data.elemDays=n.find(".ds-days")}else{n.data.elemDays=n.find(n.options.elemSelDays)}n.addClass("dsCountDown");n.addClass("ds-"+n.options.theme);if(n.options.startDate&&n.options.endDate){n.data.interval=n.options.endDate.getTime()-n.options.startDate.getTime();if(n.data.interval>0){var e=n.data.interval/1e3;var t=e%86400;var r=t%3600;n.data.left=e;n.data.days=Math.floor(e/86400);n.data.hours=Math.floor(t/3600);n.data.minutes=Math.floor(r/60);n.data.seconds=Math.floor(r%60)}}n.start()};n.stop=function(e){if(n.data.running){clearInterval(n.data.thread);n.data.running=false}if(e){e(n)}};n.start=function(){e("#logger").append("<br/>Start");if(!n.data.running){e("#logger").append("<br/>Clock");if(n.data.left>0){if(n.options.onBevoreStart){n.options.onBevoreStart(n)}n.data.thread=setInterval(function(){if(n.data.left>0){n.data.left-=n.data.decreament;n.data.seconds-=n.data.decreament;if(n.data.seconds<=0&&(n.data.minutes>0||n.data.hours>0||n.data.days>0)){n.data.minutes--;n.data.seconds=60}if(n.data.minutes<=0&&(n.data.hours>0||n.data.days>0)){n.data.hours--;n.data.minutes=60}if(n.data.hours<=0&&n.data.days>0){n.data.days--;n.data.hours=24}if(n.data.elemDays)n.data.elemDays.html(n.data.days<10?"0"+n.data.days:n.data.days);if(n.data.elemHours)n.data.elemHours.html(n.data.hours<10?"0"+n.data.hours:n.data.hours);if(n.data.elemMinutes)n.data.elemMinutes.html(n.data.minutes<10?"0"+n.data.minutes:n.data.minutes);if(n.data.elemSeconds)n.data.elemSeconds.html(n.data.seconds<10?"0"+n.data.seconds:n.data.seconds);if(n.options.onClocking){n.options.onClocking(n)}}else{n.stop(n.options.onFinish)}},n.data.refreshed);n.data.running=true}else{if(n.options.onFinish){n.options.onFinish(n)}}}};n.init()}})(jQuery)


/* jQuery tubular plugin
|* by Sean McCambridge
|* http://www.seanmccambridge.com/tubular
|* version: 1.0
|* updated: October 1, 2012
|* since 2010
|* licensed under the MIT License
|* Enjoy.
|* 
|* Thanks,
|* Sean */

;(function ($, window) {

    // test for feature support and return if failure
    
    // defaults
    var defaults = {
        ratio: 16/9, // usually either 4/3 or 16/9 -- tweak as needed
        videoId: 'ZCAnLxRvNNc', // toy robot in space is a good default, no?
        mute: true,
        repeat: true,
        width: $(window).width(),
        wrapperZIndex: 99,
        playButtonClass: 'tubular-play',
        pauseButtonClass: 'tubular-pause',
        muteButtonClass: 'tubular-mute',
        volumeUpClass: 'tubular-volume-up',
        volumeDownClass: 'tubular-volume-down',
        increaseVolumeBy: 10,
        start: 0
    };

    // methods

    var tubular = function(node, options) { // should be called on the wrapper div
        var options = $.extend({}, defaults, options),
            $body = $('body') // cache body node
            $node = $(node); // cache wrapper node

        // build container
        var tubularContainer = '<div id="tubular-container" style="overflow: hidden; position: fixed; z-index: 1; width: 100%; height: 100%"><div id="tubular-player" style="position: absolute"></div></div><div id="tubular-shield" style="width: 100%; height: 100%; z-index: 2; position: absolute; left: 0; top: 0;"></div>';

        // set up css prereq's, inject tubular container and set up wrapper defaults
        $('html,body').css({'width': '100%', 'height': '100%'});
        $body.prepend(tubularContainer);
        $node.css({position: 'relative', 'z-index': options.wrapperZIndex});

        // set up iframe player, use global scope so YT api can talk
        window.player;
        window.onYouTubeIframeAPIReady = function() {
            player = new YT.Player('tubular-player', {
                width: options.width,
                height: Math.ceil(options.width / options.ratio),
                videoId: options.videoId,
                playerVars: {
                    controls: 0,
                    showinfo: 0,
                    modestbranding: 1,
                    wmode: 'transparent'
                },
                events: {
                    'onReady': onPlayerReady,
                    'onStateChange': onPlayerStateChange
                }
            });
        }

        window.onPlayerReady = function(e) {
            resize();
            if (options.mute) e.target.mute();
            e.target.seekTo(options.start);
            e.target.playVideo();
        }

        window.onPlayerStateChange = function(state) {
            if (state.data === 0 && options.repeat) { // video ended and repeat option is set true
                player.seekTo(options.start); // restart
            }
        }

        // resize handler updates width, height and offset of player after resize/init
        var resize = function() {
            var width = $(window).width(),
                pWidth, // player width, to be defined
                height = $(window).height(),
                pHeight, // player height, tbd
                $tubularPlayer = $('#tubular-player');

            // when screen aspect ratio differs from video, video must center and underlay one dimension

            if (width / options.ratio < height) { // if new video height < window height (gap underneath)
                pWidth = Math.ceil(height * options.ratio); // get new player width
                $tubularPlayer.width(pWidth).height(height).css({left: (width - pWidth) / 2, top: 0}); // player width is greater, offset left; reset top
            } else { // new video width < window width (gap to right)
                pHeight = Math.ceil(width / options.ratio); // get new player height
                $tubularPlayer.width(width).height(pHeight).css({left: 0, top: (height - pHeight) / 2}); // player height is greater, offset top; reset left
            }

        }

        // events
        $(window).on('resize.tubular', function() {
            resize();
        })

        $('body').on('click','.' + options.playButtonClass, function(e) { // play button
            e.preventDefault();
            player.playVideo();
        }).on('click', '.' + options.pauseButtonClass, function(e) { // pause button
            e.preventDefault();
            player.pauseVideo();
        }).on('click', '.' + options.muteButtonClass, function(e) { // mute button
            e.preventDefault();
            (player.isMuted()) ? player.unMute() : player.mute();
        }).on('click', '.' + options.volumeDownClass, function(e) { // volume down button
            e.preventDefault();
            var currentVolume = player.getVolume();
            if (currentVolume < options.increaseVolumeBy) currentVolume = options.increaseVolumeBy;
            player.setVolume(currentVolume - options.increaseVolumeBy);
        }).on('click', '.' + options.volumeUpClass, function(e) { // volume up button
            e.preventDefault();
            if (player.isMuted()) player.unMute(); // if mute is on, unmute
            var currentVolume = player.getVolume();
            if (currentVolume > 100 - options.increaseVolumeBy) currentVolume = 100 - options.increaseVolumeBy;
            player.setVolume(currentVolume + options.increaseVolumeBy);
        })
    }

    // load yt iframe js api

    var tag = document.createElement('script');
    tag.src = "//www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    // create plugin

    $.fn.tubular = function (options) {
        return this.each(function () {
            if (!$.data(this, 'tubular_instantiated')) { // let's only run one
                $.data(this, 'tubular_instantiated', 
                tubular(this, options));
            }
        });
    }

})(jQuery, window);



 // ----------------------------------------------------------------------------
 // Vegas – Fullscreen Backgrounds and Slideshows with jQuery.
 // v1.3.3 - released 2013-09-03 13:27
 // Licensed under the MIT license.
 // http://vegas.jaysalvat.com/
 // ----------------------------------------------------------------------------
 // Copyright (C) 2010-2013 Jay Salvat
 // http://jaysalvat.com/
 // ----------------------------------------------------------------------------

(function(e){function t(a,n){var r={align:"center",valign:"center"};if(e.extend(r,n),0===a.height())return a.load(function(){t(e(this),n)}),void 0;var i,s,g,d=o(),l=d.width,u=d.height,v=a.width(),c=a.height(),p=u/l,f=c/v;p>f?(i=u/f,s=u):(i=l,s=l*f),g={width:i+"px",height:s+"px",top:"auto",bottom:"auto",left:"auto",right:"auto"},isNaN(parseInt(r.valign,10))?"top"==r.valign?g.top=0:"bottom"==r.valign?g.bottom=0:g.top=(u-s)/2:g.top=0-(s-u)/100*parseInt(r.valign,10)+"px",isNaN(parseInt(r.align,10))?"left"==r.align?g.left=0:"right"==r.align?g.right=0:g.left=(l-i)/2:g.left=0-(i-l)/100*parseInt(r.align,10)+"px",a.css(g)}function a(){d.prependTo("body").fadeIn()}function n(){d.fadeOut("fast",function(){e(this).remove()})}function r(){return e("body").css("backgroundImage")?e("body").css("backgroundImage").replace(/url\("?(.*?)"?\)/i,"$1"):void 0}function o(){var e=window,t="inner";return"innerWidth"in window||(e=document.documentElement||document.body,t="client"),{width:e[t+"Width"],height:e[t+"Height"]}}var i,s=e("<img />").addClass("vegas-background"),g=e("<div />").addClass("vegas-overlay"),d=e("<div />").addClass("vegas-loading"),l=e(),u=null,v=[],c=0,p=5e3,f=function(){},h={init:function(o){var i={src:r(),align:"center",valign:"center",fade:0,loading:!0,load:function(){},complete:function(){}};e.extend(i,e.vegas.defaults.background,o),i.loading&&a();var g=s.clone();return g.css({position:"fixed",left:"0px",top:"0px"}).bind("load",function(){g!=l&&(e(window).bind("load resize.vegas",function(){t(g,i)}),l.is("img")?(l.stop(),g.hide().insertAfter(l).fadeIn(i.fade,function(){e(".vegas-background").not(this).remove(),e("body").trigger("vegascomplete",[this,c-1]),i.complete.apply(g,[c-1])})):g.hide().prependTo("body").fadeIn(i.fade,function(){e("body").trigger("vegascomplete",[this,c-1]),i.complete.apply(this,[c-1])}),l=g,t(l,i),i.loading&&n(),e("body").trigger("vegasload",[l.get(0),c-1]),i.load.apply(l.get(0),[c-1]),c&&(e("body").trigger("vegaswalk",[l.get(0),c-1]),i.walk.apply(l.get(0),[c-1])))}).attr("src",i.src),e.vegas},destroy:function(t){return t&&"background"!=t||(e(".vegas-background, .vegas-loading").remove(),e(window).unbind("*.vegas"),l=e()),t&&"overlay"!=t||e(".vegas-overlay").remove(),clearInterval(i),e.vegas},overlay:function(t){var a={src:null,opacity:null};return e.extend(a,e.vegas.defaults.overlay,t),g.remove(),g.css({margin:"0",padding:"0",position:"fixed",left:"0px",top:"0px",width:"100%",height:"100%"}),a.src&&g.css("backgroundImage","url("+a.src+")"),a.opacity&&g.css("opacity",a.opacity),g.prependTo("body"),e.vegas},slideshow:function(t,a){var n={step:c,delay:p,preload:!1,backgrounds:v,walk:f};if(e.extend(n,e.vegas.defaults.slideshow,t),n.backgrounds!=v&&(t.step||(n.step=0),t.walk||(n.walk=function(){}),n.preload&&e.vegas("preload",n.backgrounds)),v=n.backgrounds,p=n.delay,c=n.step,f=n.walk,clearInterval(i),!v.length)return e.vegas;var r=function(){0>c&&(c=v.length-1),(c>=v.length||!v[c-1])&&(c=0);var t=v[c++];t.walk=n.walk,t.fade===void 0&&(t.fade=n.fade),t.fade>n.delay&&(t.fade=n.delay),e.vegas(t)};return r(),a||(u=!1,e("body").trigger("vegasstart",[l.get(0),c-1])),u||(i=setInterval(r,n.delay)),e.vegas},next:function(){var t=c;return c&&(e.vegas("slideshow",{step:c},!0),e("body").trigger("vegasnext",[l.get(0),c-1,t-1])),e.vegas},previous:function(){var t=c;return c&&(e.vegas("slideshow",{step:c-2},!0),e("body").trigger("vegasprevious",[l.get(0),c-1,t-1])),e.vegas},jump:function(t){var a=c;return c&&(e.vegas("slideshow",{step:t},!0),e("body").trigger("vegasjump",[l.get(0),c-1,a-1])),e.vegas},stop:function(){var t=c;return c=0,u=null,clearInterval(i),e("body").trigger("vegasstop",[l.get(0),t-1]),e.vegas},pause:function(){return u=!0,clearInterval(i),e("body").trigger("vegaspause",[l.get(0),c-1]),e.vegas},get:function(e){return null===e||"background"==e?l.get(0):"overlay"==e?g.get(0):"step"==e?c-1:"paused"==e?u:void 0},preload:function(t){var a=[];for(var n in t)if(t[n].src){var r=document.createElement("img");r.src=t[n].src,a.push(r)}return e.vegas}};e.vegas=function(t){return h[t]?h[t].apply(this,Array.prototype.slice.call(arguments,1)):"object"!=typeof t&&t?(e.error("Method "+t+" does not exist"),void 0):h.init.apply(this,arguments)},e.vegas.defaults={background:{},slideshow:{},overlay:{}}})(jQuery);