$(document).ready(function(){
	$(".footerTitle").toggle(
	function(){
	$(".content").css({"display":"none"});
	$("footer").css({"margin-top":"-157px","height":"auto"});
	$("nav").fadeIn();
	$(".close").css({"display":"inline"});
	$(".storyNavigation").css({"display":"none"});
	$("footer .button").css({"display":"none"});
	$("footer .seek").css({"display":"none"});
	},
	function () {
	$(".content").css({"display":"block"});
	$("footer").css({"margin-top":"0px","height":"80px"});
	$("nav").fadeOut(10);
	$(".close").css({"display":"none"});
	$(".storyNavigation").css({"display":"inline"});
	$("footer .button").css({"display":"block"});
	$("footer .seek").css({"display":"block"});
	}
);
});
document.body.addEventListener('touchmove', function(e){ e.preventDefault(); });