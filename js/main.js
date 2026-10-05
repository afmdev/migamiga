/* migamiga scripts */
$(function() {

  "use strict";

  $('.sb-year').text(new Date().getFullYear());

  // marquee: repeat the message until half the track is wider than the viewport (track scrolls -50%)
  $(window).on('load', function() {
    var $t = $('.sb-marquee-track'), $s = $t.children().first();
    if (!$s.length) return;
    var n = Math.ceil(window.innerWidth / $s.outerWidth()) + 1;
    for (var i = 1; i < 2 * n; i++) {
      $t.append($s.clone().attr('aria-hidden', 'true').find('a').attr('tabindex', '-1').end());
    }
    // intro (100vw) at the loop's speed (half track per 36s) so it never speeds up or slows down
    $t[0].style.setProperty('--mq-in', (window.innerWidth / ($t[0].scrollWidth / 2) * 36) + 's');
  });
  /***************************

  preloader

  ***************************/
  $(document).ready(function() {
    $(".sb-loading").animate({
      opacity: 1
    }, {
      duration: 500,
    });
    setTimeout(function() {
      $('.sb-preloader-number').each(function() {
        var $this = $(this),
          countTo = $this.attr('data-count');
        $({
          countNum: $this.text()
        }).animate({
          countNum: countTo
        }, {
          duration: 1000,
          easing: 'swing',
          step: function() {
            $this.text(Math.floor(this.countNum));
          },
        });
      });
      $(".sb-bar").animate({
        height: '100%'
      }, {
        duration: 1000,
        complete: function() {

          $(".sb-preloader").addClass('sb-hidden')
        }
      });
    }, 400);
  });
  /***************************

  faq

  ***************************/
  $(document).on('click keydown', '.sb-faq li .sb-question', function(e) {
    if (e.type === 'keydown' && e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    var open = $(this).parent().toggleClass('sb-active').hasClass('sb-active');
    $(this).attr('aria-expanded', open)
      .find('.sb-plus-minus-toggle').toggleClass('sb-collapsed', !open);
  });
  /***************************

  swup

  ***************************/
  const options = {
    containers: ['#sb-dynamic-content', '#sb-dynamic-menu'],
    animateHistoryBrowsing: true,
    linkSelector: '.sb-navigation a:not([data-no-swup]) , a:not([data-no-swup])',
  };
  // const swup = new Swup(options); // disabled: pushState/AJAX no funciona en file://
  /***************************

  isotope

  ***************************/
  $('.sb-filter a').on('click', function() {
    $('.sb-filter .sb-active').removeClass('sb-active');
    $(this).addClass('sb-active');

    var selector = $(this).data('filter');
    $('.sb-masonry-grid').isotope({
      filter: selector
    });
    return false;
  });
  $(document).ready(function() {
    $('.sb-masonry-grid').isotope({
      itemSelector: '.sb-grid-item',
      percentPosition: true,
      masonry: {
        columnWidth: '.sb-grid-sizer'
      }
    });
  });
  $('.sb-tabs').isotope({
    filter: '.sb-ingredients-tab'
  });
  /***************************

  fancybox

  ***************************/
  $('[data-fancybox="menu"]').fancybox({
    animationEffect: "zoom-in-out",
    animationDuration: 600,
    transitionDuration: 1200,
  });
  $('[data-fancybox="gallery"]').fancybox({
    animationEffect: "zoom-in-out",
    animationDuration: 600,
    transitionDuration: 1200,
  });
  $.fancybox.defaults.hash = false;
  /***************************

  discount popup

  ***************************/
  var POPUP_KEY = 'mm_popup_seen';
  var POPUP_DAYS = 30;
  // cookie, plus localStorage as fallback (browsers drop cookies on file://)
  function popupSeen() {
    if (document.cookie.indexOf(POPUP_KEY + '=') !== -1) return true;
    try {
      var t = parseInt(localStorage.getItem(POPUP_KEY), 10);
      return t && Date.now() - t < POPUP_DAYS * 864e5;
    } catch (e) { return false; }
  }
  function rememberPopup() {
    document.cookie = POPUP_KEY + '=1; max-age=' + POPUP_DAYS * 86400 + '; path=/; SameSite=Lax';
    try { localStorage.setItem(POPUP_KEY, Date.now()); } catch (e) {}
  }
  // only [data-auto] popups open by themselves; the rest wait for a trigger
  function showPopup() {
    $('.sb-popup-frame[data-auto]').addClass('sb-active');
  }
  if (!popupSeen()) {
    setTimeout(showPopup, 10000);
  }
  var popupOpener = null;
  function openPopup($p) {
    if (!$p.length) return;
    popupOpener = document.activeElement;
    $p.addClass('sb-active').find('.sb-close-popup').trigger('focus');
  }
  function closePopup($p) {
    if (!$p.length) return;
    $p.removeClass('sb-active');
    if ($p.is('[data-auto]')) rememberPopup();
    if (popupOpener) { $(popupOpener).trigger('focus'); popupOpener = null; }
  }
  $(document).on('click', '[data-popup-open]', function(e) {
    e.preventDefault();
    openPopup($($(this).attr('data-popup-open')));
  });
  $(document).on('click keydown', '.sb-close-popup', function(e) {
    if (e.type === 'keydown' && e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    closePopup($(this).closest('.sb-popup-frame'));
  });
  $(document).on('click', '.sb-ppc', function() {
    closePopup($(this).closest('.sb-popup-frame'));
  });
  $(document).on('click', '.sb-popup-frame', function(e) {
    if (e.target === this) closePopup($(this));
  });
  $(document).on('keydown', function(e) {
    if (e.key === 'Escape') closePopup($('.sb-popup-frame.sb-active'));
  });
  /***************************

  click effect

  ***************************/
  const cursor = document.querySelector('.sb-click-effect')
  document.addEventListener('mousemove', (e) => {
    cursor.setAttribute('style', "top:" + (e.pageY - 15) + "px; left:" + (e.pageX - 15) + "px;")
  });
  document.addEventListener('click', () => {
    cursor.classList.add('sb-click')
    setTimeout(() => {
      cursor.classList.remove('sb-click')
    }, 600)
  });
  /***************************

  add to cart

  ***************************/
  var counter = $('.sb-cart-number').text();

  $('.sb-atc').on('click', function() {
    counter++;
    $('.sb-cart-number').addClass('sb-added');
    $(this).addClass('sb-added');
    setTimeout(() => {
      $('.sb-cart-number').removeClass('sb-added');
    }, 600);
    setTimeout(() => {
      $('.sb-cart-number').text(counter);
    }, 300);
  });
  /***************************

  menu

  ***************************/
  // language switcher: click toggle for touch, outside click / Esc closes
  $(document).on('click', '.sb-lang-btn', function(e) {
    e.stopPropagation();
    var open = $(this).parent().toggleClass('sb-open').hasClass('sb-open');
    $(this).attr('aria-expanded', open);
  });
  $(document).on('click keydown', function(e) {
    if (e.type === 'keydown' && e.key !== 'Escape') return;
    $('.sb-lang').removeClass('sb-open').find('.sb-lang-btn').attr('aria-expanded', false);
  });
  $('.sb-menu-btn').on('click', function() {
    $('.sb-menu-btn , .sb-navigation').toggleClass('sb-active');
    $('.sb-info-btn , .sb-info-bar , .sb-minicart').removeClass('sb-active');
  });
  $('.sb-info-btn').on('click', function() {
    $('.sb-info-btn , .sb-info-bar').toggleClass('sb-active');
    $('.sb-menu-btn , .sb-navigation , .sb-minicart').removeClass('sb-active');
  });
  $('.sb-btn-cart').on('click', function() {
    $('.sb-minicart').toggleClass('sb-active');
    $('.sb-info-btn , .sb-info-bar , .sb-navigation , .sb-menu-btn , .sb-info-btn').removeClass('sb-active');
  });
  $(window).on("scroll", function() {
    var scroll = $(window).scrollTop();
    if (scroll >= 10) {
      $('.sb-top-bar-frame').addClass('sb-scroll');
    } else {
      $('.sb-top-bar-frame').removeClass('sb-scroll');
    }
    if (scroll >= 10) {
      $('.sb-info-bar , .sb-minicart').addClass('sb-scroll');
    } else {
      $('.sb-info-bar , .sb-minicart').removeClass('sb-scroll');
    }
  });
  $(document).on('click', function(e) {
    var el = '.sb-minicart , .sb-btn-cart , .sb-menu-btn , .sb-navigation , .sb-info-btn , .sb-info-bar';
    if (jQuery(e.target).closest(el).length) return;
    $('.sb-minicart , .sb-btn-cart , .sb-menu-btn , .sb-navigation , .sb-info-btn , .sb-info-bar').removeClass('sb-active');
  });

  if ($(window).width() < 992) {
    $(".sb-has-children > a").attr("href", "#.")
  }
  $(window).resize(function() {
    if ($(window).width() < 992) {
      $(".sb-has-children > a").attr("href", "#.")
    }
  });
  /***************************

  quantity

  ***************************/
  $('.sb-add').on('click', function() {
    if ($(this).prev().val() < 10) {
      $(this).prev().val(+$(this).prev().val() + 1);
    }
  });
  $('.sb-sub').on('click', function() {
    if ($(this).next().val() > 1) {
      if ($(this).next().val() > 1) $(this).next().val(+$(this).next().val() - 1);
    }
  });
  /***************************

  sticky

  ***************************/
  var sticky = new Sticky('.sb-sticky');
  if ($(window).width() < 992) {
    sticky.destroy();
  }
  /***************************

  contact form

  ***************************/
  $("#form").submit(function() {
    $.ajax({
      type: "POST",
      url: "mail.php",
      data: $(this).serialize()
    }).done(function() {
      $('.sb-success-result').addClass('sb-active');
    });
    return false;
  });
  /***************************

  sliders

  ***************************/
  var swiper = new Swiper('.sb-short-menu-slider-3i', {
    slidesPerView: 3,
    spaceBetween: 30,
    parallax: true,
    speed: 1000,
    navigation: {
      prevEl: '.sb-short-menu-prev',
      nextEl: '.sb-short-menu-next',
    },
    breakpoints: {
      992: {
        slidesPerView: 2,
      },
      768: {
        slidesPerView: 1,
      },
    },
  });
  var swiper = new Swiper('.sb-short-menu-slider-2-3i', {
    slidesPerView: 3,
    spaceBetween: 30,
    parallax: true,
    speed: 1000,
    navigation: {
      prevEl: '.sb-short-menu-prev-2',
      nextEl: '.sb-short-menu-next-2',
    },
    breakpoints: {
      992: {
        slidesPerView: 2,
      },
      768: {
        slidesPerView: 1,
      },
    },
  });
  var swiper = new Swiper('.sb-short-menu-slider-4i', {
    slidesPerView: 4,
    spaceBetween: 30,
    parallax: true,
    speed: 1000,
    navigation: {
      prevEl: '.sb-short-menu-prev',
      nextEl: '.sb-short-menu-next',
    },
    breakpoints: {
      992: {
        slidesPerView: 2,
      },
      768: {
        slidesPerView: 1,
      },
    },
  });
  var swiper = new Swiper('.sb-short-menu-slider-2-4i', {
    slidesPerView: 4,
    spaceBetween: 30,
    parallax: true,
    speed: 1000,
    navigation: {
      prevEl: '.sb-short-menu-prev-2',
      nextEl: '.sb-short-menu-next-2',
    },
    breakpoints: {
      992: {
        slidesPerView: 2,
      },
      768: {
        slidesPerView: 1,
      },
    },
  });
  var swiper = new Swiper('.sb-reviews-slider', {
    slidesPerView: 2,
    spaceBetween: 30,
    parallax: true,
    speed: 1000,
    navigation: {
      prevEl: '.sb-reviews-prev',
      nextEl: '.sb-reviews-next',
    },
    breakpoints: {
      992: {
        slidesPerView: 2,
      },
      768: {
        slidesPerView: 1,
      },
    },
  });
  var swiper = new Swiper('.sb-blog-slider-2i', {
    slidesPerView: 2,
    spaceBetween: 30,
    parallax: true,
    speed: 1000,
    navigation: {
      prevEl: '.sb-blog-prev',
      nextEl: '.sb-blog-next',
    },
    breakpoints: {
      992: {
        slidesPerView: 2,
      },
      768: {
        slidesPerView: 1,
      },
    },
  });
  var swiper = new Swiper('.sb-blog-slider-3i', {
    slidesPerView: 3,
    spaceBetween: 30,
    parallax: true,
    speed: 1000,
    navigation: {
      prevEl: '.sb-blog-prev',
      nextEl: '.sb-blog-next',
    },
    breakpoints: {
      992: {
        slidesPerView: 2,
      },
      768: {
        slidesPerView: 1,
      },
    },
  });
  /***************************

  map

  ***************************/
  $(".sb-lock").on('click', function() {
    $('.sb-map').toggleClass('sb-active');
    $('.sb-lock').toggleClass('sb-active');
    $('.sb-lock .fas').toggleClass('fa-unlock');
  });

  /***************************

  datepicker

  ***************************/
  $('.sb-datepicker').datepicker({
    minDate: new Date(),
  });

  /*----------------------------------------------------------
  ------------------------------------------------------------

  REINIT

  ------------------------------------------------------------
  ----------------------------------------------------------*/
  document.addEventListener("swup:contentReplaced", function() {
    $('.sb-info-btn , .sb-info-bar , .sb-minicart , .sb-menu-btn , .sb-navigation').removeClass('sb-active');
    $('.sb-top-bar-frame').removeClass('sb-scroll');
    $('a').removeClass('sb-click');
    if ($('html').hasClass('is-rendering')) {
      $("html, body").animate({
        scrollTop: 0
      }, {
        duration: 0,
        complete: function() {}
      });
    }
    /***************************

    isotope

    ***************************/
    $('.sb-filter a').on('click', function() {
      $('.sb-filter .sb-active').removeClass('sb-active');
      $(this).addClass('sb-active');

      var selector = $(this).data('filter');
      $('.sb-masonry-grid').isotope({
        filter: selector
      });
      return false;
    });
    $(document).ready(function() {
      $('.sb-masonry-grid').isotope({
        itemSelector: '.sb-grid-item',
        percentPosition: true,
        masonry: {
          columnWidth: '.sb-grid-sizer'
        }
      });
    });
    $('.sb-tabs').isotope({
      filter: '.sb-ingredients-tab'
    });
    /***************************

    fancybox

    ***************************/
    $('[data-fancybox="menu"]').fancybox({
      animationEffect: "zoom-in-out",
      animationDuration: 600,
      transitionDuration: 1200,
    });
    $('[data-fancybox="gallery"]').fancybox({
      animationEffect: "zoom-in-out",
      animationDuration: 600,
      transitionDuration: 1200,
    });
    $.fancybox.defaults.hash = false;
    /***************************

    click effect

    ***************************/
    $('a[href]:not([href^="mailto\\:"], [href$="\\#"], [href$="\\#."])').on('click', function() {
      $(this).addClass('sb-click');
    });
    $('.sb-breadcrumbs a[href]:not([href^="mailto\\:"], [href$="\\#"], [href$="\\#."])').on('click', function() {
      $('.sb-breadcrumbs').addClass('sb-click');
    });
    /***************************

    add to cart

    ***************************/
    $('.sb-atc').on('click', function() {
      counter++;
      $('.sb-cart-number').addClass('sb-added');
      $(this).addClass('sb-added');
      setTimeout(() => {
        $('.sb-cart-number').removeClass('sb-added');
      }, 600);
      setTimeout(() => {
        $('.sb-cart-number').text(counter);
      }, 300);
    });
    /***************************

    menu

    ***************************/
    $(document).on('click', function(e) {
      var el = '.sb-minicart , .sb-btn-cart , .sb-menu-btn , .sb-navigation , .sb-info-btn , .sb-info-bar';
      if (jQuery(e.target).closest(el).length) return;
      $('.sb-minicart , .sb-btn-cart , .sb-menu-btn , .sb-navigation , .sb-info-btn , .sb-info-bar').removeClass('sb-active');
    });
    if ($(window).width() < 992) {
      $(".sb-has-children > a").attr("href", "#.")
    }
    $(window).resize(function() {
      if ($(window).width() < 992) {
        $(".sb-has-children > a").attr("href", "#.")
      }
    });
    /***************************

    quantity

    ***************************/
    $('.sb-add').on('click', function() {
      if ($(this).prev().val() < 10) {
        $(this).prev().val(+$(this).prev().val() + 1);
      }
    });
    $('.sb-sub').on('click', function() {
      if ($(this).next().val() > 1) {
        if ($(this).next().val() > 1) $(this).next().val(+$(this).next().val() - 1);
      }
    });
    /***************************

    sticky

    ***************************/
    var sticky = new Sticky('.sb-sticky');
    if ($(window).width() < 992) {
      sticky.destroy();
    }
    /***************************

    contact form

    ***************************/
    $("#form").submit(function() {
      $.ajax({
        type: "POST",
        url: "mail.php",
        data: $(this).serialize()
      }).done(function() {
        $('.sb-success-result').addClass('sb-active');
      });
      return false;
    });
    /***************************

    sliders

    ***************************/
    var swiper = new Swiper('.sb-short-menu-slider-3i', {
      slidesPerView: 3,
      spaceBetween: 30,
      parallax: true,
      speed: 1000,
      navigation: {
        prevEl: '.sb-short-menu-prev',
        nextEl: '.sb-short-menu-next',
      },
      breakpoints: {
        992: {
          slidesPerView: 2,
        },
        768: {
          slidesPerView: 1,
        },
      },
    });
    var swiper = new Swiper('.sb-short-menu-slider-2-3i', {
      slidesPerView: 3,
      spaceBetween: 30,
      parallax: true,
      speed: 1000,
      navigation: {
        prevEl: '.sb-short-menu-prev-2',
        nextEl: '.sb-short-menu-next-2',
      },
      breakpoints: {
        992: {
          slidesPerView: 2,
        },
        768: {
          slidesPerView: 1,
        },
      },
    });
    var swiper = new Swiper('.sb-short-menu-slider-4i', {
      slidesPerView: 4,
      spaceBetween: 30,
      parallax: true,
      speed: 1000,
      navigation: {
        prevEl: '.sb-short-menu-prev',
        nextEl: '.sb-short-menu-next',
      },
      breakpoints: {
        992: {
          slidesPerView: 2,
        },
        768: {
          slidesPerView: 1,
        },
      },
    });
    var swiper = new Swiper('.sb-short-menu-slider-2-4i', {
      slidesPerView: 4,
      spaceBetween: 30,
      parallax: true,
      speed: 1000,
      navigation: {
        prevEl: '.sb-short-menu-prev-2',
        nextEl: '.sb-short-menu-next-2',
      },
      breakpoints: {
        992: {
          slidesPerView: 2,
        },
        768: {
          slidesPerView: 1,
        },
      },
    });
    var swiper = new Swiper('.sb-reviews-slider', {
      slidesPerView: 2,
      spaceBetween: 30,
      parallax: true,
      speed: 1000,
      navigation: {
        prevEl: '.sb-reviews-prev',
        nextEl: '.sb-reviews-next',
      },
      breakpoints: {
        992: {
          slidesPerView: 2,
        },
        768: {
          slidesPerView: 1,
        },
      },
    });
    var swiper = new Swiper('.sb-blog-slider-2i', {
      slidesPerView: 2,
      spaceBetween: 30,
      parallax: true,
      speed: 1000,
      navigation: {
        prevEl: '.sb-blog-prev',
        nextEl: '.sb-blog-next',
      },
      breakpoints: {
        992: {
          slidesPerView: 2,
        },
        768: {
          slidesPerView: 1,
        },
      },
    });
    var swiper = new Swiper('.sb-blog-slider-3i', {
      slidesPerView: 3,
      spaceBetween: 30,
      parallax: true,
      speed: 1000,
      navigation: {
        prevEl: '.sb-blog-prev',
        nextEl: '.sb-blog-next',
      },
      breakpoints: {
        992: {
          slidesPerView: 2,
        },
        768: {
          slidesPerView: 1,
        },
      },
    });
    /***************************

    map

    ***************************/
    $(".sb-lock").on('click', function() {
      $('.sb-map').toggleClass('sb-active');
      $('.sb-lock').toggleClass('sb-active');
      $('.sb-lock .fas').toggleClass('fa-unlock');
    });
    /***************************

    datepicker

    ***************************/
    $('.sb-datepicker').datepicker({
      minDate: new Date(),
    });
  });

});
