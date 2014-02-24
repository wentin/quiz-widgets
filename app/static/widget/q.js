/* name is q.js: let's make the name as short as possible as for easy reference
	
	This is pure javascript - no jQuery
*/

var domain = "http://";
//domain += '127.0.0.1:8080';
domain += '42461ba5.ngrok.com'; // for mobile development
//domain += 'quizwidget-petri.dotcloud.com';



/* wrap in anonymous function as to not interfere with existing function and variable names */
(function() {
	this.quizWidgets = {};
	// window.swipeControllers = (window.swipeControllers || {});
	window.quizModuleJSONPcallbacks = (window.quizModuleJSONPcallbacks || {});
	var mobile = false;
	var contentModule;

	/* these lists of dependencies are pushed to when handling mobile and IE checks */
	var scripts 	= [(domain + "/widget/swipe.js"),
					   (domain + "/widget/quiz-object.js"),
					   (domain + "/widget/quiz-object-new.js"),
					   //"http://platform.twitter.com/widgets.js",
					   ];
	var stylesheets = [(domain + "/widget/widget.css")];

	var setupTwitter = function() {
		window.twitterShare = function(text, via, hashtags) {
			var twitterURL = 'https://twitter.com/share?url=' + window.location.href + '&text=' + text + '&via=HuffPostCode&hashtags=huffpostQuiz';
			window.open(twitterURL, 'targetWindow','toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=300,height=300');
		}
	}
	var setupFB = function() {
	    /*
	    facebook sharing plan:
	      only share on facebook if its from huffpost domain (or dotcloud or locahost) -
	            - need app for each domain
	   */

	    // NEED: <div style="display:none" id="fb-root"></div>
	    var fb_root_div = document.getElementById('fb-root');
	    if (!fb_root_div) {
			fb_root_div = document.createElement('div');
			fb_root_div.id = 'fb-root';
			fb_root_div.style.display = 'none';
			document.body.appendChild(fb_root_div);
	    }

	   /* ------------- necessary setup straight from FB ------------- */
		window.fbAsyncInit = function() {
			FB.init({
				appId      : '813086478716856',
				status     : true,
				xfbml      : true
			});
		};
		(function(d, s, id){var js, fjs = d.getElementsByTagName(s)[0];if (d.getElementById(id)) {return;}js = d.createElement(s); js.id = id;js.src = "//connect.facebook.net/en_US/all.js";fjs.parentNode.insertBefore(js, fjs);}(document, 'script', 'facebook-jssdk'));
		/* ------------- necessary setup straight from FB above ----------- */
		

		window.fbShareQuiz = function(quizTitle, quizPicUrl) {
			FB.ui({
				method: 'feed',
				name: quizTitle,
				picture: quizPicUrl,
				link: window.location.href,
				caption: 'Find out..',
			}, 
			function(response) {
				if (response && response.post_id) {
					console.log('FB quiz post was published.');
				} else {
					console.log('FB quiz post was not published.');
				}
			});
		}
		window.fbShareOutcome = function(quizTitle, outcomePicUrl, outcomeText) {
			FB.ui({
				method: 'feed',
				name: quizTitle,
				picture: outcomePicUrl,
				link: window.location.href,
				caption: 'I got: ' + outcomeText,
			}, 
			function(response) {
				if (response && response.post_id) {
				console.log('FB outcome post was published.');
				} else {
				console.log('FB outcome post was not published.');
				}
				});
			}
		}

	var quizCompleteCallback = function(outcome, chosenAnswers) {
		console.log('quizCompleteCallback', chosenAnswers, outcome)
		
		/* increment counts for outcome and each chosenAnswer */
		jsonp("/api/outcome/" + outcome._id + "/increment-count", null);
		for (var i=0; i<chosenAnswers.length; i++) {
			jsonp("/api/answer/" + chosenAnswers[i]._id + "/increment-count", null);
		}
	}


	function load_quiz_info(quizID, container){
		jsonp("/api/quiz/" + quizID, function(data) {
			var widget = new HuffpostLabsQuizObjectNew(container, data, mobile, quizCompleteCallback);
			this.quizWidgets[quizID] = widget;
		});
	};

	/* helper for 'getting' and 'posting' (cough... jsonp hack to get around cross origin issue...) */
	function jsonp(data_url, callback){
		var random = Math.random().toString();

		var tempscript  = document.createElement('script');
		tempscript.id   = "tempscript-" + random;
		tempscript.src  = domain + data_url + "?callback=quizModuleJSONPcallbacks['" + random + "']";
		tempscript.type = "text/javascript";
		document.body.appendChild(tempscript);

		window.quizModuleJSONPcallbacks[random] = function(data) {
			document.body.removeChild(tempscript);
			tempscript = null;
			if (callback) { callback(data); }
		}
	}
	/* check if user is using mobile browser -- return true if so */
	function isMobile() {
		var check = false;
		(function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
		if(window.innerWidth <= 600) { check = true; }
		return check;
	}
	
	function isIE8or9() {
		var rv = -1;
		if (navigator.appName == 'Microsoft Internet Explorer') {
			var ua = navigator.userAgent;
			var re  = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
			if (re.exec(ua) != null)
				rv = parseFloat( RegExp.$1 );
		}
		if ((rv > 0) && (rv < 10)) {
			return true;
		} else {
			return false;
		}
	}

	var withScripts = function(srcList, callback) {
		var numScripts = srcList.length;
		//console.log('withScripts', numScripts, srcList)
		var numLoaded = 0;
        function scriptLoaded() {
            numLoaded++;
            if (numLoaded === numScripts) {
                callback();
            }
        }
		for (var i=0; i<numScripts; i++) {

			var script_tag = document.createElement('script');
			script_tag.setAttribute("type","text/javascript");
			script_tag.setAttribute("src", srcList[i]);
			if (script_tag.readyState) {
				script_tag.onreadystatechange = function () { // For old versions of IE
					if (this.readyState == 'complete' || this.readyState == 'loaded') {
						scriptLoaded();
					}
				};
			} else {
				script_tag.onload = scriptLoaded;
			}
			// Try to find the head, otherwise default to the documentElement
			(document.getElementsByTagName("head")[0] || document.documentElement).appendChild(script_tag);
		}
		if (!numScripts) {
			callback();
		}
	};

	var withStyleSheets = function(srcList, callback) {
		for (var i=0; i<srcList.length; i++) {
			if (document.createStyleSheet) {
				document.createStyleSheet(srcList[i]);
			} else {
				var ss = document.createElement("link");
				ss.type = "text/css";
				ss.rel = "stylesheet";
				ss.href = srcList[i];
				document.getElementsByTagName("head")[0].appendChild(ss);
			}
		}
		if (callback) { callback(); }
	};
	function loadDependencies(callback) {
		withStyleSheets(stylesheets);
		withScripts(scripts, callback);
	}

	// load dependencies before calling main
	function main(){
		setupFB();
		setupTwitter();

		mobile = isMobile();
		if (mobile) { 
			console.log('MOBILE');
		}

		var widgetContainers = document.getElementsByClassName('huffpostlabs-quiz-new');
		for (var i=0; i<widgetContainers.length; i++) {
			var container = widgetContainers[i];
			var quizID = container.id;
			if (quizID) {
				load_quiz_info(quizID, container);
			}
		}
	}
	loadDependencies(main);

	return {quizWidgets: this.quizWidgets};	
})();

