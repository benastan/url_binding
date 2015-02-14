$(document).on('ajax:success', '[data-remote]', function(e) {
  var $form = $(this);
  var url = $form.attr('action');
  $(document).triggerHandler('bind:url', url);
});

$(document).on('bind:url', function(e, url) {
  var $targetForms = $('[data-bind-url="'+url+'"]').not(this);
  $targetForms.load(url);
});
