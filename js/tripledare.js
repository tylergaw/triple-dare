(function () {
	
	// Ran into a number of edge-cases with styling that I
	// can't seem to get around with feature detection, so
	// falling back to some good ole browser sniffing to 
	// handle the few outliers.
	var featureAdditionsBySniffing = function () {
		
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
	};
	
	featureAdditionsBySniffing();
}());