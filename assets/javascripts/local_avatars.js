jQuery(function($) {
  "use strict";

  var $photographer = $('.capture-avatar'),
      $cropper = $('.crop-avatar'),
      $uploader = $('.add_attachment');

  function error(msg) {
    if ($('#errorExplanation').length == 0) {
      $('<div>').attr({ id: 'errorExplanation'}).prependTo('#avatar-form');
    }
    $('#errorExplanation').text(msg);
  }

  function showBlank() {
    $uploader.uploader('enable');
    $photographer.photographer('enable');
    $('.crop-avatar, .capture-avatar').hide();
    $('.blank-avatar').show();
  }

  function showPhotographer() {
    $uploader.uploader('disable');
    $('.crop-avatar, .blank-avatar').hide();
    $('.capture-avatar').show();
  }

  function cropAvatar(avatarPath, canCrop) {
    $photographer.photographer('disable');
    $uploader.uploader('disable');
    if (canCrop) {
      $('.blank-avatar, .capture-avatar').hide();
      $('.crop-avatar').show();
      $cropper.cropper('start', avatarPath);
    } else {
      $('.crop-avatar, .capture-avatar').hide();
      $('.blank-avatar').show();
    }
  }

  $('#delete-avatar').bind('ajax:success', function(e, d) {
      location.reload();
  });

  $cropper.cropper({
    cropX: 'crop_x', cropY: 'crop_y', cropW: 'crop_w', cropH: 'crop_h',
    previewContainer: '#preview-box'
  });

  $uploader.uploader({
    attachmentsContainer: '#attachments_fields',
    fileFieldContainer:   '.add_attachment',
    thisSelector:         '.add_attachment'
  })
  .bind('uploaderafterupload', function(e, data) {
    cropAvatar(data.attachmentPath, $uploader.data('crop'));
  })
  .bind('uploaderfileremove', function(e, data) {
    showBlank();
    $cropper.cropper('stop');
  });

  $photographer.photographer({
    startButton:   '#start-webcam',
    stopButton:    '#stop-webcam',
    captureButton: '#capture-webcam',
    camerasSelect: '#capture-cameras select',

    resolutionWidth: 480, resolutionHeight: 480,
    swffile:   $photographer.data('swffile'),
    filefield: 'attachment[file]',
    filename:  $photographer.data('filename'),
    postUrl:   $photographer.data('upload-path'),
    postData:  {
      filename:           $photographer.data('filename'),
      attachment_id:      'capture',
      js_callback:        $photographer.data('js-callback'),
      authenticity_token: $('input[name=authenticity_token]').val(),
      uploader:           '#' + $uploader.attr('id')
    }
  })
  .bind('photographererror', function(e, data) { error(data.message); })
  .bind('photographerbeforestart', showPhotographer)
  .bind('photographerbeforestop', showBlank)
  .bind('photographerbeforeupload', function(e, data) {
    $uploader.uploader('createInputField', $(this).data('filename'), 'capture');
  })
  .bind('photographerafterupload', function(e, data) {
    $.globalEval(data.text.replace(/<\/?textarea>|/g, ''));
  });

  $.rails.href = function(element) {
    var href = element.attr('href');
    if (href) return href;
    else      return element.data('url')
  }

  $(document).delegate('input[type=button][data-remote]', 'click.rails', function(e) {
      var button = $(this);
      if (!$.rails.allowAction(button)) return $.rails.stopEverything(e);

      $.rails.handleRemote(button);
      return false;
  });
});
