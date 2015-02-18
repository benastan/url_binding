$(document).triggerHandler('bind:url', '/stories');

$('#stories').sortable({
  update: function() { $(this).submit(); }
});
