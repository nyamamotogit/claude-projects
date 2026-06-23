$(function(){
  var slider = ".solution-slider";
  var thumbnailItem = ".solution-thumb .solution-thumb__item";

  $(thumbnailItem).each(function(){
    var index = $(thumbnailItem).index(this);
    $(this).attr("data-index",index);
  });

  $(slider).on('init',function(slick){
    var index = $(".solution-slider__item.slick-slide.slick-current").attr("data-slick-index");
    $(thumbnailItem+'[data-index="'+index+'"]').addClass("-active");
  });

  $(slider).slick({
    autoplay: false,
    arrows: false,
    fade: true,
    infinite: false
  });
  $(thumbnailItem).on('click',function(){
    var index = $(this).attr("data-index");
    $(slider).slick("slickGoTo",index,false);
  });
  $(slider).on('beforeChange',function(event,slick, currentSlide,nextSlide){
    $(thumbnailItem).each(function(){
      $(this).removeClass("-active");
    });
    $(thumbnailItem+'[data-index="'+nextSlide+'"]').addClass("-active");
  });
});