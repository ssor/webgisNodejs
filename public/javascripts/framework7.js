(function () {
    'use strict';

    /*===========================
    jQuery-like DOM library
    ===========================*/
    function arrayUnique(arr) {
        var unique = [];
        for (var i=0; i<arr.length; i++) {
            if (unique.indexOf(arr[i]) == -1) unique.push(arr[i])
        }
        return unique;
    }
    var Dom = function (arr) {
        var _this = this, i=0;
        // Create array-like object
        for (i=0; i<arr.length; i++) {
            _this[i] = arr[i];
        }
        _this.length = arr.length;
        // Return collection with methods
        return this;
    }
    Dom.prototype = {
        // Classes and attriutes
        addClass: function (className) {
            var classes = className.split(' ');
            for (var i=0; i<classes.length; i++) {
                for (var j=0; j<this.length; j++) {
                    this[j].classList.add(classes[i])
                }
            }
            return this;
        },
        removeClass: function (className) {
            var classes = className.split(' ');
            for (var i=0; i<classes.length; i++) {
                for (var j=0; j<this.length; j++) {
                    this[j].classList.remove(classes[i])
                }
            }
            return this;
        },
        hasClass: function (className) {
            if (!this[0]) return false;
            else return this[0].className.indexOf(className)>=0;
        },
        toggleClass: function (className) {
            var classes = className.split(' ');
            for (var i=0; i<classes.length; i++) {
                for (var j=0; j<this.length; j++) {
                    this[j].classList.toggle(classes[i])
                }
            }
            return this;
        },
        attr: function (attr, value) {
            if (typeof value === 'undefined') {
                return this[0].getAttribute(attr);
            }
            else {
                for (var i=0; i<this.length; i++) {
                    this[i].setAttribute(attr, value);
                }
                return this;
            }
        },
        // Transforms
        transform : function (transform) {
            for (var i=0; i<this.length; i++) {
                var elStyle = this[i].style;
                elStyle.webkitTransform = elStyle.MsTransform = elStyle.msTransform = elStyle.MozTransform = elStyle.OTransform = elStyle.transform = transform
            }
            return this;
        },
        transition: function (duration) {
            for (var i=0; i<this.length; i++) {
                var elStyle = this[i].style;
                elStyle.webkitTransitionDuration = elStyle.MsTransitionDuration = elStyle.msTransitionDuration = elStyle.MozTransitionDuration = elStyle.OTransitionDuration = elStyle.transitionDuration = duration+'ms';
            }
            return this;
        },
        //Events
        on: function (event, listener) {
            for (var i=0; i<this.length; i++) {
                if (arguments.length==3) {
                    //Live event 
                    var event = arguments[0];
                    var targetSelector = arguments[1];
                    var listener = arguments[2];
                    this[i].addEventListener(event, function(e){
                        var target = e.target;
                        if ($(target).is(targetSelector)) listener.call(target, e);
                        else {
                            var parents = $(target).parents();
                            for (var j=0; j<parents.length; j++) {
                                if ( $(parents[j]).is(targetSelector) ) listener.call(parents[j], e);
                            }
                        }
                    }, false);
                }
                else {
                    this[i].addEventListener(event, listener, false);
                }
                
            }
            return this;
        },
        off: function (event, listener) {
            for (var i=0; i<this.length; i++) {
                this[i].removeEventListener(event, listener, false);
            }
            return this;
        },
        transitionEnd: function (callback) {
            var events = ['webkitTransitionEnd', 'transitionend', 'oTransitionEnd', 'MSTransitionEnd', 'msTransitionEnd'],
                i, j, dom = this;
            function fireCallBack(e) {
                callback.call(this,e);
                for (i=0; i<events.length; i++) {
                    dom.off(events[i], fireCallBack)
                }
            }
            if (callback) {
                for (i=0; i<events.length; i++) {
                    dom.on(events[i], fireCallBack)
                }
            }
        },
        animationEnd: function (callback) {
            var events = ['webkitAnimationEnd', 'OAnimationEnd', 'MSAnimationEnd', 'animationend'],
                i, j, dom = this;
            function fireCallBack(e) {
                callback(e);
                for (i=0; i<events.length; i++) {
                    dom.off(events[i], fireCallBack)
                }
            }
            if (callback) {
                for (i=0; i<events.length; i++) {
                    dom.on(events[i], fireCallBack)
                }
            }
        },
        width: function(){
            if (this.length>0) {
                return this[0].offsetWidth;
            }
            else {
                return 0;
            }
        },
        offset: function(){
            if (this.length>0) {
                var el = this[0];
                var box = el.getBoundingClientRect();
                var body = document.body;
                var clientTop  = el.clientTop  || body.clientTop  || 0;
                var clientLeft = el.clientLeft || body.clientLeft || 0;
                var scrollTop  = window.pageYOffset || el.scrollTop;
                var scrollLeft = window.pageXOffset || el.scrollLeft;
                return {
                    top: box.top  + scrollTop  - clientTop,
                    left: box.left + scrollLeft - clientLeft
                };
            }
            else {
                return {left:0, top:0}
            }
        },
        //Dom manipulation
        html: function(html) {
            if (typeof html === 'undefined') {
                return this[0].innerHTML;
            }
            else {
                for (var i=0; i<this.length; i++) {
                    this[i].innerHTML = html;
                }
                return this;
            }
        },
        is: function (selector) {
            var compareWith = document.querySelectorAll(selector);
            var match =false;
            for (var i=0; i<compareWith.length; i++) {
                if (compareWith[i]==this[0]) match = true;
            }
            return match;
        },
        append: function (newChild) {
            for (var i=0; i<this.length; i++) {
                if (typeof newChild == 'string') {
                    this[i].innerHTML += newChild;
                }
                else {
                    this[i].appendChild(newChild);
                }
            }
            return this;
        },
        prepend: function (newChild) {
            for (var i=0; i<this.length; i++) {
                if (typeof newChild == 'string') {
                    this[i].innerHTML = newChild + this[i].innerHTML;
                }
                else {
                    this[i].insertBefore(newChild, this[i].childNodes[0])
                }
            }
            return this;
        },
        parent: function () {
            var parents = [];
            for (var i=0; i<this.length; i++) {
                parents.push(this[i].parentNode)
            }
            return $(arrayUnique(parents));
        },
        parents: function (selector) {
            var parents = [];
            for (var i=0; i<this.length; i++) {
                var parent = this[i].parentNode;
                while(parent) {
                    if (selector){
                        if($(parent).is(selector)) parents.push(parent);
                    }
                    else {
                        parents.push(parent);
                    }
                    parent = parent.parentNode;
                }
            }
            return $(arrayUnique(parents));
        },
        find : function (selector) {
            var foundElements = [];
            for (var i=0; i< this.length; i++) {
                var found = this[i].querySelectorAll(selector);
                for (var j=0; j<found.length; j++) {
                    foundElements.push(found[j])
                }
            }
            return $(foundElements);
        },
        children: function (selector) {
            var children = [];
            for (var i=0; i<this.length; i++) {
                var childNodes = this[i].childNodes;
                for (var j=0; j<childNodes.length; j++) {
                    if (selector) {
                        if (childNodes[j].nodeType==1) children.push(childNodes[j])    
                    }
                    else {
                        if (childNodes[j].nodeType==1 && $(childNodes[j]).is(selector)) children.push(childNodes[j])
                    }
                }
            }
            return $(arrayUnique(children));
        },
        remove: function () {
            for (var i=0; i<this.length; i++) {
                this[i].parentNode.removeChild(this[i]);   
            }
            return this;
        }
    }
    var $ = function(selector, context) {
        var arr = [], i=0;
        if (selector) {
            // String
            if (typeof selector=='string') {
                var els = (context||document).querySelectorAll(selector);
                for (i=0; i<els.length; i++) {
                    arr.push(els[i]);
                }
            }
            // Node/element
            else if (selector.nodeType || selector == window || selector == document) {
                arr.push(selector)
            }
            //Array of elements or instance of Dom
            else if (selector.length>0 && selector[0].nodeType) {
                for (i=0; i<selector.length; i++) {
                    arr.push(selector[i]);
                }
            }
        }

        return new Dom(arr);
    }

    /*===========================
    Framework 7
    ===========================*/
    window.Framework7 = function (params) {
        // CSS :active fix
        document.addEventListener("touchstart", function(){}, true);

        // App
        var app = this;

        // Default Parameters
        app.params = {
            cache: true,
            cacheDuration: 1000*10, // Ten minutes 
            preloadPreviousPage: true,
            swipeBackPage: true,
            swipeBackPageThreshold: 30,
            swipeBackPageActiveDistance: 30,
            pagesAnimationDuration:400,
            modalAnimationDuration:400,
            panelsCloseByOutside: true,
            panelsVisibleZIndex: 6000,
            panelsOpenBySwipe: true
        }

        // Extend with parameters
        for (var param in params) {
            app.params[param] = params[param];
        }

        // Expose DOM lib
        app.$ = $;

        // Touch support detection and touch events
        app.supportTouch = !!(("ontouchstart" in window) || window.DocumentTouch && document instanceof DocumentTouch);
        app.touchEvents = {
            start: app.supportTouch ? 'touchstart' : 'mousedown',
            move: app.supportTouch ? 'touchmove' : 'mousemove',
            end: app.supportTouch ? 'touchend' : 'mouseup'
        }

        // Panels
        app.panelLeft = $('.panel-left');
        app.panelRight = $('.panel-right');
        
        //Views
        app.views = [];
        app.addView = function (view, viewParams) {
            var container;
            if (!view) return;
            if (typeof view === 'string') {
                container = $(view)[0];
            }
            else if (view.nodeType){
                container = view; 
            }
            if (!container) return;
            var view = {
                container: container,
                params: viewParams || {},
                history: [],
                pagesContainer: $('.pages', container)[0],
                main: $(container).hasClass('view-main'),
                loadPage: function (url) {
                    app.loadPage(view, url);
                },
                goBack: function(url) {
                    app.goBack(view, url);
                }
            }
            // Store to history main view's url
            if (view.main) {
                view.history.push(document.location.href);
            }

            // Store View in element for easy access
            container.framework7View = view;

            // Add view to app
            app.views.push(view);

            // Init View's events
            app.initViewEvents(view);

            // Return view object
            return view;
        }

        // Live Events on view links
        app.initViewEvents = function(view){
            var viewContainer = $(view.container);
            // Swipe Back to previous page
            var isTouched = false, 
                isMoved = false,
                touchesStart={}, 
                isScrolling = undefined, 
                activePage, previousPage, 
                viewContainerWidth, 
                touchesDiff, 
                panelTouchesDiff,
                allowViewTouchMove = true, 
                allowBackPageSwipe = true,
                touchStartTime,
                dynamicToolbar = false,
                activeToolbar,
                previousToolbar,
                activeToolbarElements,
                previousToolbarElements;

            viewContainer.on(app.touchEvents.start, function(e){
                if (!allowViewTouchMove) return;
                isMoved = false;
                isScrolling = undefined;
                activePage = $(e.target).is('.page') ? $(e.target) : $(e.target).parents('.page');
                previousPage = viewContainer.find('.page-on-left');
                
                touchesStart.x = e.type=='touchstart' ? e.targetTouches[0].pageX : e.pageX;
                touchesStart.y = e.type=='touchstart' ? e.targetTouches[0].pageY : e.pageY;

                if (touchesStart.x - viewContainer.offset().left > app.params.swipeBackPageActiveDistance) return;
                if (previousPage.length==0 || activePage.length==0) return;
                if (viewContainer.hasClass('dynamic-toolbar')) {
                    activeToolbar = viewContainer.find('.toolbar-on-center');
                    previousToolbar = viewContainer.find('.toolbar-on-left');
                    activeToolbarElements = activeToolbar.find('.links-left, h1, .links-right');
                    previousToolbarElements = previousToolbar.find('.links-left, h1, .links-right');
                    dynamicToolbar = true;
                }
                viewContainerWidth = viewContainer.width();
                touchStartTime = (new Date()).getTime();
                isTouched = true;
                e.preventDefault();

            })
            viewContainer.on(app.touchEvents.move, function(e){
                if (!isTouched) return;
                isMoved = true;
                var pageX = e.type=='touchmove' ? e.targetTouches[0].pageX : e.pageX;
                var pageY = e.type=='touchmove' ? e.targetTouches[0].pageY : e.pageY;
                if ( typeof isScrolling === 'undefined') {
                  isScrolling = !!( isScrolling || Math.abs(pageY - touchesStart.y) > Math.abs( pageX - touchesStart.x ) );
                }
                if (isScrolling ) {
                    isTouched = false;
                    return;
                }
                e.preventDefault();

                touchesDiff = pageX - touchesStart.x - app.params.swipeBackPageThreshold;
                if (touchesDiff<0) touchesDiff = 0;
                var percentage = touchesDiff / viewContainerWidth;
                activePage.transform('translate3d('+touchesDiff+'px,0,0)');
                activePage[0].style.boxShadow = '0px 0px '+(8 - 8*percentage)+'px rgba(0,0,0,'+(0.6-0.6*percentage)+')';
                previousPage.transform('translate3d('+(touchesDiff/5 - viewContainerWidth/5) +'px,0,0)');
                previousPage[0].style.opacity = 0.8 + 0.2*percentage;  

                // Toolbars
                if (dynamicToolbar) {
                    activeToolbarElements.transition(0);
                    for (var i=0; i<activeToolbarElements.length; i++) {
                        var el = activeToolbarElements[i];
                        el.style.opacity = 1 - percentage;
                        if (el.className.indexOf('sliding')>=0) {
                            $(el).transform('translate3d('+(percentage*100)+'%,0,0)')
                        }
                    }
                    previousToolbarElements.transition(0);
                    for (var i=0; i<previousToolbarElements.length; i++) {
                        var el = previousToolbarElements[i];
                        el.style.opacity = percentage;
                        if (el.className.indexOf('sliding')>=0) {
                            $(el).transform('translate3d('+(-100 + percentage*100)+'%,0,0)')
                        }
                    }
                }

            })
            viewContainer.on(app.touchEvents.end, function(e){
                if (!isTouched || !isMoved) {
                    isTouched = false; 
                    isMoved = false;
                    return;
                }
                isTouched = false; 
                isMoved = false;
                var timeDiff = (new Date()).getTime() - touchStartTime;
                var pageChanged = false;
                // Swipe to previous page
                if (
                        timeDiff<300 && touchesDiff>10 ||
                        timeDiff>=300 && touchesDiff>viewContainerWidth/2
                    ) {
                    activePage.removeClass('page-on-center').addClass('page-on-right');
                    previousPage.removeClass('page-on-left').addClass('page-on-center');
                    if (dynamicToolbar) {
                        activeToolbar.removeClass('toolbar-on-center').addClass('toolbar-on-right');
                        previousToolbar.removeClass('toolbar-on-left').addClass('toolbar-on-center');
                    }

                    pageChanged = true;
                }
                $([activePage[0], previousPage[0]]).transform('').transition(app.params.pagesAnimationDuration);
                previousPage[0].style.opacity='';
                activePage[0].style.boxShadow = '';

                activeToolbarElements.transition(app.params.pagesAnimationDuration);
                previousToolbarElements.transition(app.params.pagesAnimationDuration);
                for (var i = 0; i<activeToolbarElements.length; i++) {
                    $(activeToolbarElements[i]).transform("");
                    activeToolbarElements[i].style.opacity="";
                }
                for (var i = 0; i<previousToolbarElements.length; i++) {
                    $(previousToolbarElements[i]).transform("");
                    previousToolbarElements[i].style.opacity="";
                }

                allowViewTouchMove = false;
                activePage.transitionEnd(function(){
                    $([activePage[0], previousPage[0]]).transition(0);
                    activeToolbarElements.transition(0);
                    previousToolbarElements.transition(0);
                    allowViewTouchMove = true;
                    if (pageChanged) app.afterGoBack(view, activePage, previousPage);
                })
                    
            })
        }

        // XHR Caching
        app.cache = [];
        app.removeFromCache = function(url) {
            var index = false;
            for (var i=0; i<app.cache.length; i++) {
                if (app.cache[i].url == url) index = i;
            }
            if (index!==false) app.cache.splice(index,1);
        }

        // XHR
        app.xhr = false;
        app.get = function (url, callback) {
            if (app.params.cache) {
                // Check is the url cached
                for (var i=0; i<app.cache.length; i++) {
                    if (app.cache[i].url == url) {
                        // Check expiration
                        if ( (new Date()).getTime() - app.cache[i].time < app.params.cacheDuration ) {
                            // Load from cache
                            callback(app.cache[i].data);
                            return false;
                        }
                    }
                }
            }
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            xhr.onload = function(e) {
                if (this.status == 200 && callback) {
                    callback(this.responseText);
                    if (app.params.cache) {
                        app.removeFromCache(url)
                        app.cache.push({
                            url: url,
                            time: (new Date()).getTime(),
                            data: this.responseText
                        })
                    }
                }
            }
            xhr.send();
            app.xhr = xhr;
            return xhr;
        }

        // Load Page
        app.allowPageChange = true;
        app._tempDomElement = document.createElement('div');
        app.loadPage = function (view, url) {
            if (!app.allowPageChange) return false;
            app.allowPageChange = false;
            if (app.xhr) {
                app.xhr.abort()
                app.xhr = false;
            }
            app.get(url, function(data){
                var viewContainer = $(view.container),
                    newPage, oldPage, pagesInView, i, oldToolbarInner, newToolbarInner, toolbar, dynamicToolbar;

                // Parse DOM to find new page
                app._tempDomElement.innerHTML = data;
                newPage = $('.page', app._tempDomElement);
                if (newPage.length>1) {
                    newPage = $(app._tempDomElement).find('.view-main .page');
                }

                // If pages not found or there are still more than one, exit
                if (newPage.length==0 || newPage.length>1) {
                    app.allowPageChange = true;
                    return
                }
                newPage.addClass('page-on-right')

                // Update View history
                view.history.push(url);

                // Find old page (should be the last one) and remove older pages
                pagesInView = viewContainer.find('.page');
                if (pagesInView.length>1) {
                    for (i=0; i<pagesInView.length-2; i++) {
                        $(pagesInView[i]).remove();
                    }
                    $(pagesInView[i]).remove();
                }
                oldPage = viewContainer.find('.page');

                // Dynamic toolbar
                if (viewContainer.hasClass('dynamic-toolbar')){
                    dynamicToolbar = true;
                    // Find toolbar
                    newToolbarInner = $('.toolbar-inner', app._tempDomElement);
                    if (newToolbarInner.length>1) {
                        newToolbarInner = $('.view-main .toolbar-inner', app._tempDomElement);
                    }
                    newToolbarInner.addClass('toolbar-on-right');
                    toolbar = viewContainer.find('.toolbar-top');
                    oldToolbarInner = toolbar.find('.toolbar-inner');
                    if (oldToolbarInner.length>1) {
                        $(oldToolbarInner[0]).remove()
                        oldToolbarInner = toolbar.find('.toolbar-inner');
                    }
                    toolbar.append(newToolbarInner[0]);
                }

                // Append Old Page and add classes for animation
                $(view.pagesContainer).append(newPage[0]);
                setTimeout(function(){
                    newPage.addClass('page-from-right-to-center');
                    oldPage.removeClass('page-on-center');
                    oldPage.addClass('page-from-center-to-left');

                    // Dynamic toolbar
                    if (dynamicToolbar) {
                        newToolbarInner.addClass('toolbar-from-right-to-center');
                        oldToolbarInner.removeClass('toolbar-on-center').addClass('toolbar-from-center-to-left');
                    }
                },0)

                newPage.animationEnd(function(){
                    app.allowPageChange = true;
                    newPage.toggleClass('page-from-right-to-center page-on-center page-on-right');
                    oldPage.toggleClass('page-from-center-to-left page-on-left');
                    if (dynamicToolbar) {
                        newToolbarInner.toggleClass('toolbar-from-right-to-center toolbar-on-center toolbar-on-right');
                        oldToolbarInner.toggleClass('toolbar-from-center-to-left toolbar-on-left');
                    }
                })

            })
        }
        app.goBack = function (view, url, preloadOnly) {
            if (!app.allowPageChange) return false;
            app.allowPageChange = false;
            if (app.xhr) {
                app.xhr.abort()
                app.xhr = false;
            }

            var viewContainer = $(view.container),
                pagesInView = viewContainer.find('.page'),
                oldPage, newPage,oldToolbarInner, newToolbarInner, toolbar, dynamicToolbar
            if (pagesInView.length>1) {
                // Exit if only preloadOnly
                if (preloadOnly) {
                    app.allowPageChange = true;
                    return;
                }
                // Define old and new pages
                newPage = $(pagesInView[pagesInView.length-2]);
                oldPage = $(pagesInView[pagesInView.length-1]);

                // Dynamic toolbar
                if (viewContainer.hasClass('dynamic-toolbar')){
                    dynamicToolbar = true;
                    // Find toolbar
                    var inners = viewContainer.find('.toolbar-inner');
                    newToolbarInner = $(inners[0]);
                    oldToolbarInner = $(inners[1]);
                }

                // Add classes for animation
                newPage.removeClass('page-on-left');
                newPage.addClass('page-from-left-to-center');

                oldPage.removeClass('page-on-center');
                oldPage.addClass('page-from-center-to-right');

                // Dynamic toolbar animation
                if (dynamicToolbar) {
                    newToolbarInner.removeClass('toolbar-on-left').addClass('toolbar-from-left-to-center');
                    oldToolbarInner.removeClass('toolbar-on-center').addClass('toolbar-from-center-to-right');
                }
                
                newPage.animationEnd(function(){
                    app.afterGoBack(view, oldPage, newPage);
                })
            }
            else {
                var url = url;
                if (url && url.indexOf('#')==0) url = undefined;
                if (view.history.length>1) {
                    url = view.history[view.history.length-2];
                }
                if (!url) {
                    app.allowPageChange = true;
                    return;
                }
                app.get(url, function(data){

                    // Parse DOM to find new page
                    app._tempDomElement.innerHTML = data;
                    newPage = $('.page', app._tempDomElement);
                    if (newPage.length>1) {
                        newPage = $(app._tempDomElement).find('.view-main .page');
                    }

                    // If pages not found or there are still more than one, exit
                    if (newPage.length==0 || newPage.length>1) {
                        app.allowPageChange = true;
                        return;
                    }
                    newPage.addClass('page-on-left');

                    // Find old page (should be the only one)
                    oldPage = $(viewContainer.find('.page')[0])

                    // Dynamic toolbar
                    if (viewContainer.hasClass('dynamic-toolbar')){
                        dynamicToolbar = true;
                        // Find toolbar
                        newToolbarInner = $('.toolbar-inner', app._tempDomElement);
                        if (newToolbarInner.length>1) {
                            newToolbarInner = $('.view-main .toolbar-inner', app._tempDomElement);
                        }
                        newToolbarInner.addClass('toolbar-on-left')
                        toolbar = viewContainer.find('.toolbar-top');
                        oldToolbarInner = toolbar.find('.toolbar-inner');
                        if (oldToolbarInner.length>1) {
                            $(oldToolbarInner[0]).remove()
                            oldToolbarInner = toolbar.find('.toolbar-inner');
                        }
                        toolbar.prepend(newToolbarInner[0]);
                    }
                    
                    // Prepend new Page and add classes for animation
                    $(view.pagesContainer).prepend(newPage[0]);

                    // Exit if we need only to preload page
                    if (preloadOnly) {
                        newPage.addClass('page-on-left')
                        app.allowPageChange = true;
                        return;
                    }
                    setTimeout(function(){
                        newPage.addClass('page-from-left-to-center');
                        
                        oldPage.removeClass('page-on-center');
                        oldPage.addClass('page-from-center-to-right');

                        // Dynamic toolbar animation
                        if (dynamicToolbar) {
                            newToolbarInner.removeClass('toolbar-on-left').addClass('toolbar-from-left-to-center');
                            oldToolbarInner.removeClass('toolbar-on-center').addClass('toolbar-from-center-to-right');
                        }
                    },0)

                    newPage.animationEnd(function(){
                        app.afterGoBack(view, oldPage, newPage);
                    })

                })
            }
        }
        app.afterGoBack = function(view, oldPage, newPage) {
            // Remove old page and set classes on new one
            var oldPage = $(oldPage);
            var newPage = $(newPage);
            oldPage.remove();
            newPage.removeClass('page-from-left-to-center');
            newPage.addClass('page-on-center').removeClass('page-on-left');
            app.allowPageChange = true;
            // Updated dynamic toolbar
            if ($(view.container).hasClass('dynamic-toolbar')) {
                var inners = $(view.container).find('.toolbar-inner');
                var oldToolbar = $(inners[1]).remove();
                var newToolbar = $(inners[0]).removeClass('toolbar-on-left toolbar-from-left-to-center').addClass('toolbar-on-center');
            }
            // Update View's Hitory
            view.history.pop();
            // Preload previous page
            if (app.params.preloadPreviousPage) {
                app.goBack(view, false, true)
            }
        }

        //Modals
        app.modalPromptCallback = undefined;
        app.modalConfirmCallback = undefined;
        app.alert = function(string) {
            $('.modal-alert .modal-text').html(string||'');
            app.openModal('.modal-alert');
        }

        app.confirm = function(string, callback) {
            $('.modal-confirm .modal-text').html(string||'');
            app.openModal('.modal-confirm');
            app.modalConfirmCallback = callback;
        }

        app.prompt = function(string, callback) {
            $('.modal-prompt .modal-text').html(string||'');
            $('.modal-prompt .modal-input')[0].value = '';
            app.openModal('.modal-prompt');
            $('.modal-prompt').transitionEnd(function(){
                $('.modal-prompt .modal-input')[0].focus();    
            })
            app.modalPromptCallback = callback;
        }

        app.openModal = function(modal) {
            $(modal)[0].style.visibility='visible';
            setTimeout(function(){
                $('.modal-overlay').addClass('modal-overlay-visible');
                $(modal).addClass('modal-in');    
            },0)
            
        }

        app.closeModal = function(modal) {
            var modal = modal || '.modal-in';
            $('.modal-overlay').removeClass('modal-overlay-visible');
            $(modal).toggleClass('modal-in modal-out').transitionEnd(function(e){
                $(this).removeClass('modal-in modal-out')[0].style.visibility="";
            })
        }

        // Panels
        app.openLeftPanel = function() {
            var className;
            if ($('.panel-left').hasClass('panel-below')) className = 'with-panel-left-below';
            if ($('.panel-left').hasClass('panel-above')) className = 'with-panel-left-above';
            app.closePanel();
            $('.panel-left').transitionEnd(function(){
                var panel = this;
                setTimeout(function(){
                    panel.style.zIndex = app.params.panelsVisibleZIndex;    
                },100)
            })
            $('.panel-left')[0].style.display="block";
            setTimeout(function(){
                $('body').addClass(className);    
            },0)
            
        }
        app.openRightPanel = function() {
            var className;
            if ($('.panel-right').hasClass('panel-below')) className = 'with-panel-right-below';
            if ($('.panel-right').hasClass('panel-above')) className = 'with-panel-right-above';
            app.closePanel();
            $('.panel-right').transitionEnd(function(){
                var panel = this;
                setTimeout(function(){
                    panel.style.zIndex = app.params.panelsVisibleZIndex;    
                },100)
            })
            $('.panel-right')[0].style.display="block";
            setTimeout(function(){
                $('body').addClass(className);    
            },0)
        }
        app.closePanel = function() {
            for (var i=0; i < $('.panel-wrap').length; i++) {
                $('.panel-wrap')[i].style.zIndex = '';
            }
            if ($('body').hasClass('with-panel-left-below') || $('body').hasClass('with-panel-left-above')) {
                $('.panel-left').transitionEnd(function(){
                    this.style.display='none';
                })
            }
            if ($('body').hasClass('with-panel-right-below') || $('body').hasClass('with-panel-right-above')) {
                $('.panel-right').transitionEnd(function(){
                    this.style.display='none';
                })
            }            
            $('body').removeClass('with-panel-left-below with-panel-left-above with-panel-right-below with-panel-right-above');
        }
        
        // Handle clicks and make them fast (on tap);
        app.initClickEvents = function () {
            var touchesStart = {}, touchesEnd = {}, isTouched, isMoved, touchStartTime;
            $(document).on(app.touchEvents.start, 'a, .open-panel, .close-panel, .panel-wrap, .modal-button', function(e){
                isTouched = true;
                touchesStart.x = touchesEnd.x = e.type=='touchstart' ? e.targetTouches[0].pageX : e.pageX;
                touchesStart.y = touchesEnd.y = e.type=='touchstart' ? e.targetTouches[0].pageY : e.pageY;
                touchStartTime = (new Date()).getTime();
            })
            $(document).on(app.touchEvents.move, 'a, .open-panel, .close-panel, .panel-wrap, .modal-button', function(e){
                if (!isTouched) return;
                touchesEnd.x = e.type=='touchmove' ? e.targetTouches[0].pageX : e.pageX;
                touchesEnd.y = e.type=='touchmove' ? e.targetTouches[0].pageY : e.pageY;
            })
            $(document).on(app.touchEvents.end, 'a, .open-panel, .close-panel, .panel-wrap, .modal-button', function(e){
                if (!isTouched) return;
                var diffX = Math.abs(touchesEnd.x-touchesStart.x);
                var diffY = Math.abs(touchesEnd.y-touchesStart.y);
                var timeDiff = (new Date()).getTime() - touchStartTime;
                if (isTouched && diffX < 20 && diffY < 20 && timeDiff<1000) {
                    var clicked = $(this);
                    var url = $(this).attr('href');
                    var validUrl = url && url.length>0 && url.indexOf('#')!==0;
                    // External
                    if (clicked.hasClass('external')) {
                        isTouched = false;
                        return;
                    }

                    // Prevent Default for others
                    e.preventDefault();

                    // Open Panel
                    if (clicked.hasClass('open-panel')) {
                        if ($('.panel').length==1) {
                            if ($('.panel').hasClass('panel-left')) app.openLeftPanel();
                            else if ($('.panel').hasClass('panel-left')) app.openRightPanel();
                        }
                        else {
                            if (clicked.attr('data-panel')=='right') app.openRightPanel();
                            else app.openLeftPanel();
                        }
                    }
                    // Close Panel
                    if (clicked.hasClass('close-panel')) {
                        app.closePanel();
                    }
                    if (clicked.hasClass('panel-wrap') && app.params.panelsCloseByOutside) {
                        if (!$(e.target).is('.panel') && $(e.target).parents('.panel').length==0) {
                            app.closePanel();
                        }
                    }

                    // Modal
                    if (clicked.hasClass('modal-button')) {
                        var modal = clicked.parents('.modal');
                        app.closeModal(modal);
                        if (clicked.hasClass('button-ok')) {
                            if (modal.hasClass('modal-prompt')) {
                                app.modalPromptCallback && app.modalPromptCallback( modal.find('.modal-input')[0].value );
                                modal.find('.modal-input')[0].blur();
                                app.modalPromptCallback = undefined
                            }
                            else if (modal.hasClass('modal-confirm')) {
                                app.modalConfirmCallback && app.modalConfirmCallback();   
                                app.modalConfirmCallback = undefined;
                            }
                        }
                    }
                    // Load Page
                    if (validUrl || clicked.hasClass('back')) {
                        var view;
                        if (clicked.attr('data-view')) {
                            view = $(clicked.attr('data-view'))[0].framework7View;
                        }
                        else {
                            view = clicked.parents('.view')[0] && clicked.parents('.view')[0].framework7View;
                        }
                        if (!view) {
                            for (var i=0; i<app.views.length; i++) {
                                if (app.views[i].main) view = app.views[i]
                            }
                        }
                        if (!view) return;
                        if (clicked.hasClass('back')) view.goBack(clicked.attr('href'));
                        else view.loadPage(clicked.attr('href'));
                    }
                }
                isTouched = false;
            })
            //Disable clicks
            $(document).on('click', 'a', function(e){
                if (!$(this).hasClass('external')) e.preventDefault();
            })
        }
        app.initClickEvents();
        
        //Return instance        
        return app;
    }
})();