function onLoad() {
	// Accordion controls - multiple h1s
	$('h2').eq(0).addClass('active');
	$('.inner').eq(0).show();
	$("h2").click(function(){
		$(this).next(".inner").slideToggle("slow")
		.siblings(".inner:visible").slideUp("slow");
		$(this).toggleClass("active");
		$(this).siblings("h2").removeClass("active");
	});
	// Accordion controls - single h1
	$('h1.multiple').eq(0).addClass('active');
	$('.accordionInner').eq(0).show();
	$('.inner').eq(3).show();
	$('.inner').eq(6).show();
	$('.inner').eq(9).show();
	$("h1.multiple").click(function(){
		$(this).next(".accordionInner").slideToggle("slow")
		.siblings(".accordionInner:visible").slideUp("slow");
		$(this).toggleClass("active");
		$(this).siblings("h1.multiple").removeClass("active");
	});
}