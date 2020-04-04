/*global	tele:true,	firebase:	true, JitsiMeetExternalAPI:true*/

window.tele	=	window.tele	||	***REMOVED******REMOVED***;
window.user	=	window.user	||	null;

import	$	from	'jquery';
import	firebase	from	'firebase';
import	*	as	firebaseui	from	'firebaseui';
import	bootstrap	from	'bootstrap';
//import	***REMOVED******REMOVED***	from	'./calibrate';

window.onload	=	function()	***REMOVED***
	window.$	=	$;
	window.firebase	=	firebase;
	//
	initFirebase();
	initSidemenu();
***REMOVED***;


/**
 * ------------------------------------------------
 * initFirebase
 * ------------------------------------------------
 */
function	initFirebase()***REMOVED***

	//	Your	web	app's	Firebase	configuration
	const	firebaseConfig	=	***REMOVED******REMOVED***;

	//	Initialize	Firebase
	firebase.initializeApp(firebaseConfig);

	//
	firebase.auth().onAuthStateChanged(function(user)	***REMOVED***
		if	(user)
			window.user	=	user;
		else***REMOVED***
			window.user	=	null;
			initFirebaseUI();
		***REMOVED***
		//
		onFirebaseAuth();
	***REMOVED***);
***REMOVED***

/**
 * ------------------------------------------------
 * initFirebaseUI
 * ------------------------------------------------
 */
function initFirebaseUI()***REMOVED***

	// FirebaseUI config.
	var uiConfig = ***REMOVED***
		signInSuccessUrl: location.href,
		callbacks: ***REMOVED***
			signInSuccessWithAuthResult: function(authResult, redirectUrl) ***REMOVED***
				// On success redirect to signInSuccessUrl.
				return true;
				// On sucess - get me some info on the user
				//return false;
			***REMOVED***
		***REMOVED***,
		signInFlow: 'popup',
		signInOptions: [
			// Leave the lines as is for the providers you want to offer your users.
			firebase.auth.GoogleAuthProvider.PROVIDER_ID,
			firebase.auth.EmailAuthProvider.PROVIDER_ID,
			firebase.auth.PhoneAuthProvider.PROVIDER_ID,
			firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID
		]
	***REMOVED***;

	// Initialize the FirebaseUI Widget using Firebase.
	var ui = new firebaseui.auth.AuthUI(firebase.auth());
	// The start method will wait until the DOM is loaded.
	ui.start('#firebaseui-auth-container', uiConfig);
***REMOVED***

/**
 * ------------------------------------------------
 * onFirebaseAuth
 * ------------------------------------------------
 */
function	onFirebaseAuth()***REMOVED***

	if(window.user)***REMOVED***
		console.log('User is logged in');

		//	User	is	signed	in.
		$('#user_div').show();
		$('#ham_button').show();
		$('#login_div').hide();

		setTimeout(function()***REMOVED***
			startVideo();
		***REMOVED***,	2000);


	***REMOVED***else***REMOVED***
		//	No	user	is	signed	in.
		$('#user_div').hide();
		$('#ham_button').hide();
		$('#login_div').show();
	***REMOVED***

	//
	window.loading_screen.finish();
	if(document.getElementById('_status') != null)
		document.getElementById('_status').innerHTML	=	'Loaded';
***REMOVED***

/**
 * ------------------------------------------------
 * initSidemenu
 * // FIX ME: Make sure handling #main and #main-div is
 * // handled consistently across main.js, rmp.js and admin.js
 * ------------------------------------------------
 */
function initSidemenu()***REMOVED***

	//
	$('#ham_button').click(openNav);
	$('#close_nav').click(closeNav);
	//

	//	Side	menu	functions
	let	elem	=	$(	'#sidemenu	a'	);
	elem.each(function(	i	)	***REMOVED***
		//
		$(this).click(function()***REMOVED***
			deselectAll();
			$(this).children().addClass('selected');
			//
			$('#main').hide();
			$('#about').hide();
			$('#analytics').hide();
			$('#settings').hide();
			$('#contact').hide();
			//
			let	id	=	$(this).attr('id');
			if(id.includes('home'))***REMOVED***
				$('#main').show();
			***REMOVED***else	if(id.includes('about'))***REMOVED***
				$('#about').show();
			***REMOVED***else	if(id.includes('logout'))***REMOVED***
				logout();
			***REMOVED***
			//
			closeNav();
		***REMOVED***);

	***REMOVED***);

	// NOTE
	// Following functions are scoped only for sidemenu
	//
	// function to open navigation
	function	openNav()	***REMOVED***
		console.log('Open');
		$('#sidenav').addClass('open');
		$('#sidenav').removeClass('closed');
		$('#sidenav').css('width',	'250px');
		//
		$('#main').css('transform',	'translateX(250px)');
		$('#header_content').css('transform',	'translateX(250px)');
		$('#about').css('transform',	'translateX(250px)');
	***REMOVED***

	// logout functionlity
	function	logout()***REMOVED***
		console.log('Logging	out...');
		//
		deselectAll();
		closeNav();
		//
		$('#home_item').children().addClass('selected');
		$('#main').show();
		//
		firebase.auth().signOut();
	***REMOVED***

	// deselect sidemenu links
	function	deselectAll()***REMOVED***
		let	elem	=	$('#sidemenu	a');
		elem.each(function(	i	)	***REMOVED***
			$(this).children().removeClass('selected');
		***REMOVED***);
	***REMOVED***

	// close navigation
	function	closeNav()	***REMOVED***
		console.log('Close');
		$('#sidenav').addClass('closed');
		$('#sidenav').removeClass('open');
		$('#sidenav').css('width',	'0');
		//
		$('#main').css('transform',	'translateX(0)');
		$('#header_content').css('transform',	'translateX(0)');
		$('#about').css('transform',	'translateX(0)');
	***REMOVED***

***REMOVED***

/**
 * ------------------------------------------------
 * startVideo
 * ------------------------------------------------
 */
function startVideo()***REMOVED***
	//
	//
	//
	//
	let	user	=	firebase.auth().currentUser;
	if(user	!=	null)***REMOVED***
		var	email_id	=	user.email;
		//
		let body_height = $( window ).height();
		let header_height = $('header').outerHeight();
		let header_width = $('header').outerWidth() - 60;
		let prediv_height = $('#prelogin').outerHeight();
		let meet_height = body_height - header_height - prediv_height - 25;
		let meet_width = header_width;
		//
		$('#main').css(***REMOVED***'maxWidth': meet_width***REMOVED***);
		$('#main').width(meet_width);
		//
		let doc_uid = '';//
		let parametes = getUrlVars();
		if(parametes.doc != null)***REMOVED***
			doc_uid = parametes.doc;
			//
			const domain = 'meet.jit.si';
			const options = ***REMOVED***
				roomName: 'COVID19-'+doc_uid,
				width: meet_width,
				height: meet_height,
				parentNode: document.querySelector('#meet'),
				interfaceConfigOverwrite: ***REMOVED***
					DEFAULT_BACKGROUND: '#111',
					DEFAULT_REMOTE_DISPLAY_NAME: 'Patient',
					SHOW_BRAND_WATERMARK: true,
					BRAND_WATERMARK_LINK: 'https://telemd.org.in/img/logo.png',
					SHOW_JITSI_WATERMARK: false,
					SHOW_WATERMARK_FOR_GUESTS: false,
					MOBILE_APP_PROMO: false,
					SHOW_CHROME_EXTENSION_BANNER: false,
					TOOLBAR_BUTTONS: [
						'microphone', 'camera', 'desktop', 'fullscreen',
						'fodeviceselection', 'hangup', 'profile', 'recording',
						'livestreaming', 'etherpad', 'chat', 'sharedvideo', 'settings',
						'videoquality', 'filmstrip', 'stats', 'shortcuts',
						'tileview', 'help', 'mute-everyone'
					]
				***REMOVED***
			***REMOVED***;
			const api = new JitsiMeetExternalAPI(domain, options);
			api.executeCommand('displayName', window.user.displayName);
		***REMOVED***
		else
			$('#meet').text('Error!! No Doctor specified...');
	***REMOVED***
***REMOVED***

/**
 * ------------------------------------------------
 * getUrlVars
 * ------------------------------------------------
 */
// Read a page's GET URL variables and return them as an associative array.
function getUrlVars()
***REMOVED***
	var vars = [], hash;
	var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
	for(var i = 0; i < hashes.length; i++)***REMOVED***
		hash = hashes[i].split('=');
		vars.push(hash[0]);
		vars[hash[0]] = hash[1];
	***REMOVED***
	return vars;
***REMOVED***


