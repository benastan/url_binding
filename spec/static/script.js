$(document).on('change', '[data-change-submit]', function() {
  $(this).parents('form').submit();
});

$(document).on('click', '[data-click-submit]', function() {
  $(this).parents('form').submit();
});

$(document).on('ajax:success', '[data-submit-wipe]', function() {
  if ($(this).data('remote')) this.reset();
});

$(document).on('submit', '[data-submit-wipe]', function() {
  if (!$(this).data('remote')) this.reset();
});

var eventSource = new EventSource('/events');
eventSource.onmessage = function(e) {
  $(document).triggerHandler('bind:url', e.data);
};

$(document).triggerHandler('bind:url', '/tweets');
