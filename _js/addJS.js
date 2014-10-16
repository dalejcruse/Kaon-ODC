jQuery(document).ready(function($) {
$('#slider-with-blocks-1').royalSlider({
autoPlay: {
                enabled: true
            },
arrowsNav: false,
arrowsNavAutoHide: true,
fadeinLoadedSlide: true,
controlNavigationSpacing: 0,
controlNavigation: 'bullets',
imageScaleMode: 'none',
imageAlignCenter:true,
blockLoop: true,
loop: false,
numImagesToPreload: 33,
transitionType: 'fade',
keyboardNavEnabled: true,
block: {
delay: 400
}
});
});