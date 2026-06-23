$(function () {
  const spW = 1024;

  // reload
  // --------------------------------------------------
  const mql = window.matchMedia(`(max-width: ${spW}px)`);

  mql.addEventListener('change', (e) => {
    window.location.reload();
  });

  // SPメニューボタン
  // --------------------------------------------------

  // Toggle main menu
$(document).off('click', '.js-menu-btn').on('click', '.js-menu-btn', function() {
  const $btn = $(this);
    const $menu = $('.l-gnav');

    $btn.toggleClass('-active');

    if ($btn.hasClass('-active')) {
        $('.l-header__menu-txt').text('Close');
        $menu.stop(true, true).slideDown(350);
    } else {
        $('.l-header__menu-txt').text('Menu');
        $menu.stop(true, true).slideUp(350);
    }
});

  $(document).off('click', '.js-dropdown-btn')
.on('click', '.js-dropdown-btn > .l-gnav__link', function (e) {
      if (window.innerWidth > 1024) return;
  e.preventDefault();
  e.stopPropagation();
      e.preventDefault();
      const $submenu = $(this).next('.l-gnav__sub');
      if ($submenu.length === 0) return;

      $('.l-gnav__sub').not($submenu).slideUp(300).parent().removeClass('-open');

      $submenu.stop().slideToggle(300);
      $(this).parent().toggleClass('-open');
    });

  // 検索ボタン
  // --------------------------------------------------
  $('.js-search-btn').each(function () {
    $(this).on('click', function () {
      $(this).toggleClass('-active');
      if ($(this).hasClass('-active')) {
        $('.js-search-form').slideDown();
        if ($('.js-menu-btn').hasClass('-active')) {
          $('.js-menu-btn').trigger("click");
        }
      } else {
        $('.js-search-form').slideUp();
      }
    });
  });

  // グロナビのカレント付与
  // --------------------------------------------------
  const currentUrl = location.pathname;
  const urlArr = currentUrl.split('/');
  const currentDir = urlArr[1];

  $('.l-gnav__link').each(function (i, v) {
    let targetHref = $(v).attr('href');
    let hrefArr = targetHref.split('/');
    let hrefDir = hrefArr[1];

    if (currentDir === hrefDir) {
      $(v).addClass('-current');
    }
  });
});