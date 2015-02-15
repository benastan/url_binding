function urlBinding() {
  var ajaxInProgress = [];

  $(document).on('ajax:before', '[data-remote]', function(e, xhr, status) {
    var url = $(e.target).attr('action');
    var method = e.target.method;
    return method == 'get' && ajaxInProgress.indexOf(url) !== -1;
  });

  $(document).on('ajax:send', '[data-remote]', function(e, xhr, status) {
    var url = $(e.target).attr('action');
    if (ajaxInProgress.indexOf(url) === -1) ajaxInProgress.push(url);
    console.log('Starting ajax to '+url);
  });

  $(document).on('ajax:complete', '[data-remote]', function(e, xhr, status) {
    var url = $(e.target).attr('action');
    ajaxInProgress.splice(ajaxInProgress.indexOf(url), 1);
    console.log('Completed ajax to '+url);
    if (status === 'success') {
      var $form = $(this);
      var url = $form.attr('action');
      $form.trigger('bind:url', url);
    }
  });

  $(document).on('click', '[data-unblock-bind]', function(e) {
    var $form = $(this).closest('form');
    var url = $form.attr('action');
    $form.trigger('bind:url', url);
  });

  $(document).on('bind:url', function(e, url) {
    var target = e.target;
    var $targetForms = $('[data-bind-url="'+url+'"]').not(target);
    var $blockElementsContainers = $('form[action="'+url+'"]:has([data-block-bind])');
    var $blockElements = $blockElementsContainers.find('[data-block-bind]');
    var areBlockElements = $blockElementsContainers.length > 0;
    var isBlockElement = $blockElementsContainers.is(target);
    var ajaxExistsForUrl = ajaxInProgress.indexOf(url) !== -1;
    console.log('Starting bind to url '+url)
    if (areBlockElements && !isBlockElement && !ajaxExistsForUrl) {
      console.log('Blocked.');
      $blockElements.show();
    } else if (!ajaxExistsForUrl) {
      console.log('Binding.');
      $targetForms.load(url);
    } else {
      console.log('Ignored.');
    }
  });
};

urlBinding();