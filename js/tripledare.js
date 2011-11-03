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
				},
				
				// Add a classname to polyfill the :nth-child() selector
				// @param ARRAY elems - Each element will have the classname applied
				// @param INT index - The nth (ex: 2n)
				nthChildPolyfill = function (elems, index) {
					var i       = 0,
						len     = elems.length,
						matched = null;
						
					for (i; i < len; i += 1) {
						matched = i * parseInt(index, 10);

						if (matched && matched < len + 1) {
							elems[matched - 1].className += (' nth-child-' + index);
						}
					}
				},
				
				// The one hold out for using background size are the thumbs
				// for the obstacle images. To get around it we're gonna
				// grab the background image url, create and append an img
				// with that as the source and then remove the background image.
				fakeBackgroundSizedObstacleItems = function () {
					var obstaclesCon = document.getElementById('obstacles'),
						obstaclesCon = obstaclesCon.getElementsByTagName('nav')[0],
						obstacles    = obstaclesCon.getElementsByTagName('a'),
						i            = 0,
						len          = obstacles.length,
						item         = null,
						imgEl        = null,
						bgImg        = null;
						
					for (i; i < len; i += 1) {
						item = obstacles[i];
						
						// Getting a little krufty here
						bgImg = item.href.split('#')[1];
						bgImg = 'images/obstacle-' + bgImg + '.png';
						
						imgEl = document.createElement('img');
						imgEl.setAttribute('src', bgImg);
						
						item.insertBefore(imgEl, item.firstChild);
					}
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
			
			// Also gonna throw on some extras for IEs not quite as mature as 9
			if (browserDetect.browser === 'Explorer' && browserDetect.version < 9) {
				var prizeCon     = document.getElementById('prizes'),
					prizes       = prizeCon.getElementsByTagName('li'),
					obstaclesCon = document.getElementById('obstacles'),
					obstaclesCon = obstaclesCon.getElementsByTagName('nav')[0],
					obstacles    = obstaclesCon.getElementsByTagName('li');
				
				// Prize <li> need an nth-child(2n)
				nthChildPolyfill(prizes, '2n');
				
				// Make that last-child work for prizes
				prizes[prizes.length - 1].className += ' last-child';
				
				// Obstacle <li>s need an nth-child(3n) and nth-child(2n)
				nthChildPolyfill(obstacles, '3n');
				nthChildPolyfill(obstacles, '2n');
				
				fakeBackgroundSizedObstacleItems();
				
				// Add ie-VERSION classname to the html element	for some
				// super major selection
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

				inputs = document.getElementsByTagName('input');
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
				container    = document.getElementById('obstacles'),
				anchors      = container.getElementsByTagName('a'),

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
					var prevItems = (function () {
							var prevItems = [],
								items     = container.getElementsByTagName('li'),
								len       = items.length,
								i         = 0;
							
							for (i; i < len; i += 1) {
								if (items[i].className.indexOf('active') !== -1) {
									prevItems.push(items[i]);
								}
							}
							
							return prevItems;
						}()),
						
						selectedItem = (function () {
							var selectedItem = null,
								items        = anchors,
								len          = items.length,
								i            = 0,
								hash         = itemHash.replace('#', '');
								
							for (i; i < len; i += 1) {
								if (items[i].href.split('#')[1] === hash) {
									selectedItem = items[i];
								}
							}
							
							return selectedItem;
						}()),
						
						len = 0,
						i   = 0;

					if (prevItems.length > 0) {
						len = prevItems.length;

						for (i; i < len; i += 1) {
							prevItems[i].className = prevItems[i].className.replace('active', ' ');
						}
					}

					previousHash = itemHash;
					selectedItem.parentNode.className += ' active';
					
					// Not the best with the browser sniffing...but zero hour is approaching.
					if (browserDetect.browser === 'Explorer' && browserDetect.version < 9) {
						forcedItem = document.getElementById(itemHash.replace('#', ''));
						forcedItem.className = 'manualDisplay';
					}
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
						forcedItem = document.getElementById(previousHash.replace('#', ''));
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
						firstTarget = null,
						container   = document.getElementById('obstacles'),
						firstItem   = anchors[0];

					if (hash !== null && validHashes[hash]) {
						selectItem(hash);
					} else {
						firstTarget	= firstItem.getAttribute('href').split('#')[1];
						forcedItem  = document.getElementById(firstTarget);

						forcedItem.className = 'manualDisplay';
						selectItem('#' + firstTarget);
					}
				},
				
				// Since IE7 and below will not actually trigger the hashchange event
				// we'll just watch for our nav items to be clicked and manually call
				// the function assigned to window.onhashchange
				initTheNonSupported = function () {
					var i = 0,
						len = anchors.length,
						click = function () {
							window.location.hash = this.href.split('#')[1];
							hashChanged();
							return false;
						}
					
					for (i; i < len; i += 1) {
						anchors[i].onclick = click;
					}
				};

			if (browserDetect.browser === 'Explorer' && browserDetect.version < 9) {
				initTheNonSupported();
			} else {
				
				// IE7 has the hashchange event, but it doesn't actually fire.
				if ('onhashchange' in window) {
					window.onhashchange = hashChanged;
				}
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