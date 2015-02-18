$(document).on('change', '[data-change-submit]', function() {
  $(this).submit();
});

$(document).on('click', '[data-click-submit]', function() {
  $(this).submit();
});

$(document).on('ajax:complete', '[data-submit-wipe]', function(e, xhr, status) {
  if (status === 'success' && $(this).data('remote') !== undefined) this.reset();
  return true;
});

$(document).on('submit', '[data-submit-wipe]', function() {
  if ($(this).data('remote') === undefined) this.reset();
  return true;
});

function isRemoteForm() {
  var $form;
  if (this.tagName !== 'FORM') $form = $(this).closest('form');
  else $form = $(this);
  return $form.data('remote') !== undefined
}

$(document).on('ajax:complete', '[data-submit-remove]', function(e, xhr, status) {
  if (status === 'success' && isRemoteForm.call(e.target)) {
    $(this).remove();
  }
  return true;
});

$(document).on('submit', '[data-submit-remove]', function(e) {
  if (!isRemoteForm.call(e.target)) {
    $(this).remove();
  }
  return true;
});

$(document).on('submit', '[data-nested-form]', function(e) {
  e.stopPropagation();
  e.preventDefault();
});

$(document).on('ajax:complete', '[data-nested-form]', function(e) {
  e.stopPropagation();
  e.preventDefault();
});

var lastEventSentAt = lastEvent ? +new Date(lastEvent.sent_at) : +new Date;
var eventSource = new EventSource('/events?sent_at='+lastEventSentAt);
eventSource.onmessage = function(e) {
  console.log('Received: '+e.data)
  lastEventSentAt = +new Date();
  $(document).triggerHandler('bind:url', e.data);
};

eventSource.onerror = function(e) {
  console.log('lost connection');
  this.url = '/events?sent_at='+lastEventSentAt;
  $(document).triggerHandler('bind:url', '/tweets');  
}

eventSource.onopen = function(e) {
  console.log('opened connection');
}

$(document).triggerHandler('bind:url', '/stories');

$('#stories').sortable({
  update: function() { $(this).submit(); }
});
