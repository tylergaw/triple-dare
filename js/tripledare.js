(function () {

	var 
		// Ran into a number of edge-cases with styling that I
		// can't seem to get around with feature detection, so
		// falling back to some good ole browser sniffing to 
		// handle the few outliers.
		featureAdditionsBySniffing = function () {
			
			// A modified version of Quirksmode's BrowserDetect
			// http://www.quirksmode.org/js/detect.html
			var browserDetect = {
					init: function () {
						this.browser = this.searchString(this.dataBrowser) || "An unknown browser";
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
        	    	
							if (dataString) {
								if (dataString.indexOf(data[i].subString) != -1) {
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
				};
			
			// Start up that browserDetect object
			browserDetect.init();
			
			// Determine whether or not the browser can use font-face
			// with select elements.
			if (fontFaceSelects()) {
				document.getElementsByTagName('html')[0].className += ' font-face-selects';
			}
		},
		
		// That ole timer sure is a doozy. I was really against
		// adding an extra, non-semantic element for the time so
		// I opted for the :before pseudo element for the digit.
		// However, I couldn't find a way to make that change using
		// CSS animations and JS is unable to directly access
		// pseudo elements. So, this little nifty trick found on
		// Stackoverflow: 
		// http://stackoverflow.com/questions/311052/setting-css-pseudo-class-rules-from-javascript/311437#311437
		// describes a method for directly accessing the loaded
		// stylesheets and manipulating them. Neato.
		timer = function () {
			var container      = document.getElementById('be-a-contestant'),
				el             = container.getElementsByTagName('h2')[0],
				stylesheet     = document.styleSheets[0],
				numOfRules     = stylesheet.cssRules.length,
				ruleCounter    = 0,
				startTime      = 60,
				time           = startTime,
				rule           = '#be-a-contestant h2:before { content: "$"; }',
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
					
					stylesheet.insertRule(rule.replace('$', time), numOfRules + ruleCounter);

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
		
		// For browsers that do not yet support the placeholder attribute
		// for input elements.
		placeholderPolyfill = function () {
			
		};
	
	// Start these boss hogs up!
	featureAdditionsBySniffing();
	timer();
	placeholderPolyfill();
	
}());