function urlBinding() {
  var ajaxInProgress = [];

  $(document).on('ajax:before', '[data-remote]', function(e, xhr, status) {
    var $target = $(e.target);
    var url = $target.attr('action') || $target.attr('href');
    var method = e.target.method;
    return !(method == 'get' && ajaxInProgress.indexOf(url) !== -1);
  });

  $(document).on('ajax:send', '[data-remote]', function(e, xhr, status) {
    var $target = $(e.target);
    var url = $target.attr('action') || $target.attr('href');
    if (ajaxInProgress.indexOf(url) === -1) ajaxInProgress.push(url);
    console.log('Starting ajax to '+url);
  });

  $(document).on('ajax:complete', '[data-remote]', function(e, xhr, status) {
    var $target = $(e.target);
    var url = $target.attr('action') || $target.attr('href');
    ajaxInProgress.splice(ajaxInProgress.indexOf(url), 1);
    console.log('Completed ajax to '+url);
    if (status === 'success') {
      var $form = $(this);
      var url = $form.attr('action') || $form.attr('href');
      $form.trigger('bind:url', url);
    }
  });

  $(document).on('click', '[data-unblock-bind]', function(e) {
    var $target = $(this).closest('[data-remote]');
    var url = $target.attr('action') || $target.attr('href');
    $target.trigger('bind:url', url);
  });

  $(document).on('bind:url', function(e, url) {
    var target = e.target;
    var $targetForms = new jQuery();
    var paramsRegExp = /(\:(\w+))(?:\/)/
    $('[data-bind-url]').each(function() {
      var $currentForm = $(this);
      var bindUrl = $currentForm.data('bind-url');
      var matches = bindUrl.match(paramsRegExp);
      var bindUrlRegExp = new RegExp('^'+bindUrl.replace(paramsRegExp, '\\w+/')+'$');
      if (bindUrlRegExp.test(url)) {
        $targetForms = $targetForms.add($currentForm);
      }
    });
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