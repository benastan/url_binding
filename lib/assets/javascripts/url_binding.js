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
  
  function $$submit() {
    $(this).submit();
  };

  function $$stop(e) {
    e.stopPropagation();
    e.preventDefault();
  }

  $(document).on('change', '[data-change-submit]', $$submit);
  $(document).on('click', '[data-click-submit]', $$submit);

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

  $(document).on('submit', '[data-nested-form]', $$stop);
  $(document).on('ajax:complete', '[data-nested-form]', $$stop);

  function UrlStream(url, lastEventSentAt) {
    var urlStream = this;
    this._url = url;
    this.lastEventSentAt = lastEventSentAt;
    this.eventSource = new EventSource(this.url());
    this.eventSource.urlStream = this;
  
    this.eventSource.onmessage = function(e) {
      console.log('Received: '+e.data)
      urlStream.lastEventSentAt = +new Date();
      $(document).triggerHandler('bind:url', e.data);
    };

    this.eventSource.onerror = function(e) {
      console.log('lost connection');
      this.url = urlStream.url();
    };

    this.eventSource.onopen = function(e) {
      console.log('opened connection');
    };
  }

  UrlStream.prototype.url = function() {
    return this._url+'?sent_at='+this.lastEventSentAt;
  };


  $('[data-url-stream]').each(function() {
    var $this = $(this);
    var url = $this.data('url-stream');
    var lastEvent = $this.data('url-stream-last-event');
    var lastEventSentAt = lastEvent ? +new Date(lastEvent.sent_at) : +new Date;
    new UrlStream(url, lastEventSentAt);
  });
};

urlBinding();