// Universal Subtitles, universalsubtitles.org
//
// Copyright (C) 2010 Participatory Culture Foundation
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see
// http://www.gnu.org/licenses/agpl-3.0.html.

goog.provide('mirosubs.video.FlashVideoPlayer');

/**
 * @constructor
 */
mirosubs.video.FlashVideoPlayer = function(videoSource) {
    mirosubs.video.AbstractVideoPlayer.call(this, videoSource);
    this.embed_ = null;
    this.object_ = null;
    this.decorateTimer_ = null;
    this.decorateAttemptCount_ = 0;
};
goog.inherits(mirosubs.video.FlashVideoPlayer,
              mirosubs.video.AbstractVideoPlayer);

/**
 * @override
 * @param {Element} Either object or embed. Must be decoratable. For example, 
 *     for youtube, enablejsapi=1. For any video player, wmode must be set.
 *
 */
mirosubs.video.FlashVideoPlayer.prototype.decorateInternal = function(element) {
    this.findElements_(element);
    var elementToUse = this.object_ || this.embed_;
    mirosubs.video.FlashVideoPlayer.superClass_.decorateInternal.call(
        this, elementToUse);
    this.decorateTimer_ = new goog.Timer(250);
    this.getHandler().listen(
        this.decorateTimer_,
        goog.Timer.TICK,
        this.decorateTimerTick_);
    this.decorateTimer_.start();
};

mirosubs.video.FlashVideoPlayer.prototype.decorateTimerTick_ = function(e) {
    this.decorateAttemptCount_++;
    if (this.decorateAttemptCount_ == 20)
        this.logExternalInterfaceError_();
    if (!this.tryDecorating_(this.embed_))
        this.tryDecorating_(this.object_);
};

mirosubs.video.FlashVideoPlayer.prototype.isFlashElementReady = goog.abstractMethod;

mirosubs.video.FlashVideoPlayer.prototype.setFlashPlayerElement = goog.abstractMethod;

mirosubs.video.FlashVideoPlayer.prototype.tryDecorating_ = function(element) {
    if (!goog.isDefAndNotNull(element)) {
        return false;
    }
    else if (this.isFlashElementReady(element)) {
        this.decorateTimer_.stop();
        this.setFlashPlayerElement(element);
        return true;
    }
    else {
        return false;
    }
};

mirosubs.video.FlashVideoPlayer.prototype.elementForSizing = function() {
    return this.object_ || this.embed_;
};

mirosubs.video.FlashVideoPlayer.prototype.logExternalInterfaceError_ = function() {
    mirosubs.Rpc.call(
        'log_youtube_ei_failure', { 'page_url': window.location.href });
};

mirosubs.video.FlashVideoPlayer.prototype.findElements_ = function(element) {
    if (element.nodeName == "EMBED") {
        this.embed_ = element;
        if (this.embed_.parentNode.nodeName == "OBJECT")
            this.object_ = this.embed_.parentNode;
    }
    else {
        this.object_ = element;
        this.embed_ = goog.dom.findNode(
            this.object_, 
            function(e) { return e.nodeName == "EMBED"; });
    }
};