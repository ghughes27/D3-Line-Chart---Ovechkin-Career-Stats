(function($, window, document, undefined) {
  "use strict";
  var $html = $("html");

  $html.on("click.ui.dropdown", ".js-dropdown", function(e) {
    e.preventDefault();
    $(this).toggleClass("is-open");
  });

  $html.on("click.ui.dropdown", ".js-dropdown [data-dropdown-value]", function(e) {
    e.preventDefault();
    var $item = $(this);
    var $dropdown = $item.parents(".js-dropdown");
    $dropdown.find(".dropdown-input").val($item.data("dropdown-value"));
    $dropdown.find(".dropdown-current").text($item.text());
  });

  $html.on("click.ui.dropdown", function(e) {
    var $target = $(e.target);
    if (!$target.parents().hasClass("js-dropdown")) {
      $(".js-dropdown").removeClass("is-open");
    }
  });
})(jQuery, window, document);
