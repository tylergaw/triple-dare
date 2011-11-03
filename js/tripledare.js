(function () {

	'use strict';

	var htmlElem = document.getElementsByTagName('html')[0],
		
		// A modified version of Quirksmode's BrowserDetect
		// http://www.quirksmode.org/js/detect.html
		// TODO: Remember to remove browsers/OSs you don't need
		browserDetect = {
			init: function () {
				this.browser = this.searchString(this.dataBrowser) || "An unknown browser";
				this.version = this.searchVersion(navigator.userAgent);
				this.OS = this.searchString(this.dataOS) || "an unknown OS";
			},
			searchString: function (data) {
				var i          = 0,
					len        = data.length,
					dataString = null,
					dataProp   = null,
					identity   = null;
			
				for (i; i < len; i += 1) {
					dataString = data[i].string;
					dataProp   = data[i].prop;
					
					this.versionSearchString = data[i].versionSearch || data[i].identity;
			
					if (dataString) {
						if (dataString.indexOf(data[i].subString) !== -1) {
							identity = data[i].identity;
							break;
						}
					} else if (dataProp) {
						identity = data[i].identity;
						break;
					}
				}
				return identity;
			},
			
			searchVersion: function (dataString) {
				var version = null,
					index   = dataString.indexOf(this.versionSearchString);
				
				if (index !== -1) {
					version = parseFloat(dataString.substring(index + this.versionSearchString.length + 1));
				}
				
				return version;
			},
			dataBrowser: [
				{
					string: navigator.userAgent,
					subString: "Chrome",
					identity: "Chrome"
				},
				{
					string: navigator.vendor,
					subString: "Apple",
					identity: "Safari",
					versionSearch: "Version"
				},
				{
					prop: window.opera,
					identity: "Opera",
					versionSearch: "Version"
				},
				{
					string: navigator.userAgent,
					subString: "Firefox",
					identity: "Firefox"
				},
				{
					string: navigator.userAgent,
					subString: "MSIE",
					identity: "Explorer",
					versionSearch: "MSIE"
				}
			],
			dataOS : [
				{
					string: navigator.platform,
					subString: "Win",
					identity: "Windows"
				},
				{
					string: navigator.platform,
					subString: "Mac",
					identity: "Mac"
				},
				{
					string: navigator.userAgent,
					subString: "iPhone",
					identity: "iPhone/iPod"
			    },
				{
					string: navigator.userAgent,
					subString: "iPad",
					identity: "iPad"
			    }
			]
		},

		// Ran into a number of edge-cases with styling that I
		// can't seem to get around with feature detection, so
		// falling back to some good ole browser sniffing to 
		// handle the few outliers.
		featureAdditionsBySniffing = function () {
			var
				// Safari (as of 5.1) has a bug where @font-face fonts
				// cannot be used with select elements. Using them together
				// causing the selects to not work, and makes the browser
				// go totally apeshit. iOS Safari does not have this problem.
				fontFaceSelects = function () {
					var b = true;

					if (browserDetect.browser === 'Safari') {
						if (browserDetect.OS.indexOf('iP') === -1) {
							b = false;
						}
					}

					return b;
				},

				// Those select styles are tough. Using JS and "skinning" an
				// element to act as the <select> I'm sure every browser
				// could have the same full style, but just doesn't seem
				// worth the extra http requests and filesize for those elements.
				// Chrome and Safari do play nice though. The -webkit-appearance
				// property is really great for removing all of the standard
				// styling, leaving it open for user CSS to take the helm.
				// Here we'll do some more sniffing and give a class to Chrome/Safari
				customSelects = function () {
					var b = false,
						browsers = {
							'Chrome': true,
							'Safari': true
						};

					if (browsers[browserDetect.browser]) {
						b = true;
					}

					return b;
				};

			// Start up that browserDetect object
			browserDetect.init();

			// Determine whether or not the browser can use font-face
			// with select elements.
			if (fontFaceSelects()) {
				htmlElem.className += ' font-face-selects';
			}

			// Determine whether or not the browser can have custom
			// styles on select elements.
			if (customSelects()) {
				htmlElem.className += ' custom-selects';
			}
			
			// I'm also gonna throw a classname on the html elem
			// for older versions of ie
			if (browserDetect.browser === 'Explorer' && browserDetect.version < 9) {
				htmlElem.className += (' ie' + browserDetect.version);
			}
		},

		// For browsers that do not yet support the placeholder attribute
		// for input elements.
		placeholderPolyfill = function () {
			var support = 'placeholder' in document.createElement('input'),
				inputs  = null,
				input   = null,
				len     = null,
				i       = 0,
				focus   = function () {
					var val = this.value || null;

					if (val === null || val === this.getAttribute('placeholder')) {
						this.value = '';
					}
				},
				blur    = function () {
					var val = this.value || null;

					if (val === null) {
						this.value = this.getAttribute('placeholder');
					}
				};
			
			// Adding a check for Opera here because we don't want
			// to use Opera's placeholder implementation. It works,
			// but there is no way to style the placeholder text.
			if (support && browserDetect.browser !== 'Opera') {
				htmlElem.className += ' input-placeholders';
			} else {
				htmlElem.className += ' polyfilled-input-placeholders';

				inputs = document.querySelectorAll('input');
				len = inputs.length;

				for (i; i < len; i += 1) {
					input = inputs[i];

					if (input.getAttribute('type') !== 'submit') {
						input.value = input.getAttribute('placeholder');
						input.onfocus = focus;
						input.onblur = blur;
					}
				}
			}
		},

		// That ole timer sure is a doozy. I was really against
		// adding an extra, non-semantic element for the time so
		// I opted for the :before pseudo element for the digit.
		// However, I couldn't find a way to make that change using
		// CSS animations and JS is unable to directly access
		// pseudo elements. So this little nifty trick found on
		// Stackoverflow: 
		// http://stackoverflow.com/questions/311052/setting-css-pseudo-class-rules-from-javascript/311437#311437
		// describes a method for directly accessing the loaded
		// stylesheets and manipulating them. Neato.
		timer = function () {
			var container      = document.getElementById('be-a-contestant'),
				el             = container.getElementsByTagName('h2')[0],
				stylesheet     = document.styleSheets[0],
				
				// IE < 9 handles stylesheets with different property and
				// method names. Detect, then build the correct object.
				styles         = (function () {
					var styles = {};
					
					if (browserDetect.browser === 'Explorer' && browserDetect.version < 9) {
						styles.bad = true;
						styles.num = stylesheet.rules.length;
						styles.insert = 'addRule';
					} else {
						styles.bad = false;
						styles.num = stylesheet.cssRules.length;
						styles.insert = 'insertRule';
					}
					
					return styles;
				}()),
				
				ruleCounter    = 0,
				startTime      = 60,
				time           = startTime,
				selector       = '#be-a-contestant h2:before',
				rule           = 'content: "$"',
				warningClass   = 'ten-second-warning',
				outOfTimeClass = 'out-of-time',
				interval       = 0,
				tickSpeed      = 1000,

				// Each time a second passes on the timer we'll
				// update the contents of the h2:before pseudo element
				// and increment the other counter vars
				tick = function () {

					if (el.className === outOfTimeClass) {
						el.className = '';
					}
					
					if (styles.bad) {
						stylesheet.addRule(selector, rule.replace('$', time), (styles.num + ruleCounter));
					} else {
						stylesheet.insertRule((selector + ' { ' + rule.replace('$', time) + ' ;} '), (styles.num + ruleCounter));
					}
					

					ruleCounter += 1;

					if (time === 10) {
						el.className = warningClass;
					}

					if (time === 0) {
						clearInterval(interval);
						time = startTime;
						alarm();
					}

					time -= 1;
				},
				alarm = function () {
					var alarmDuration = 3500;
					el.className = outOfTimeClass;

					setTimeout(function () {
						interval = setInterval(tick, tickSpeed);
					}, alarmDuration);
				};

			interval = setInterval(tick, tickSpeed);
		},

		// We're taking care of displaying each obstacle using
		// the :target pseudo selector, but we need to add a
		// couple more things to the obstacle navigation. 
		obstacleSelection = function () {

			var previousHash = null,
				forcedItem   = null,

				// Since we know what hashes we're looking for and we don't
				// want to trigger the changes if a main nav item is selected
				// just store the valid hashes and check for them when needed.
				validHashes = {
					'#the-tank': true,
					'#sundae-slide': true,
					'#human-hamster-wheel': true,
					'#down-the-hatch': true,
					'#pick-it': true,
					'#the-wringer': true
				},

				// @param STRING itemHash - The hashtag in the href for the selected item.
				selectItem = function (itemHash) {
					var prevItems    = document.querySelectorAll('li.active') || null,
						len          = 0,
						selectedItem = document.querySelector('a[href="' + itemHash + '"]'),
						i            = 0;

					if (prevItems !== null) {
						len = prevItems.length;

						for (i; i < len; i += 1) {
							prevItems[i].className = '';
						}
					}

					previousHash = itemHash;
					selectedItem.parentNode.className = 'active';
				},

				hashChanged = function () {
					var hash = window.location.hash;

					if (validHashes[hash]) {

						if (forcedItem !== null) {
							forcedItem.className = '';
							forcedItem = null;
						}

						selectItem(window.location.hash);

					} else {

						// Since we'll be losing the :target, we need to
						// explicity set the currently displayed obstacle
						// to keep displaying
						forcedItem = document.querySelector(previousHash);
						forcedItem.className = 'manualDisplay';
					}
				},

				// When the page first loads there may or may not
				// be a hash and that hash might not be for the
				// obstacle nav. We need to make sure the correct
				// item is selected
				onPageLoad = function () {
					var hash        = window.location.hash || null,
						firstItem   = null,
						firstTarget = null;

					if (hash !== null && validHashes[hash]) {
						selectItem(hash);
					} else {
						firstItem   = document.querySelector('#obstacles nav li:first-child a');
						firstTarget	= firstItem.getAttribute('href');
						forcedItem  = document.querySelector(firstTarget);

						forcedItem.className = 'manualDisplay';
						selectItem(firstTarget);
					}
				};

			if ('onhashchange' in window) {
				window.onhashchange = hashChanged;
			}

			onPageLoad();
		},
		
		// Fake an async form submission
		handleFormSubmit = function () {
			var form = document.getElementsByTagName('form')[0],
				submit = function () {
					var that       = this,
						fieldset   = this.getElementsByTagName('fieldset')[0],
						firstChild = fieldset.getElementsByTagName('label')[0],
						container  = document.createElement('div'),
						title      = document.createElement('h3'),
						message    = document.createElement('p');
					
					fieldset.className = 'submitting';
					
					title.appendChild(document.createTextNode('Thanks!'));
					message.appendChild(document.createTextNode('We\'ll let you know soon if you\'ve been picked to get messy!'));
					container.appendChild(title);
					container.appendChild(message);
					container.className = 'success';
					
					// Give a little pause to fake an ajax request
					setTimeout(function () {
						fieldset.insertBefore(container, firstChild);
						fieldset.className = 'submitted';
					}, 1500);
					
					setTimeout(function () {						
						fieldset.removeChild(container);
						fieldset.className = '';
					}, 12000);
					
					return false;
				};
			
			form.onsubmit = submit;
		};

	// Start these boss hogs up!
	featureAdditionsBySniffing();
	placeholderPolyfill();
	timer();
	obstacleSelection();
	handleFormSubmit();
}());