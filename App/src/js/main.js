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
	updateOnKeyboard();
	//
	//
	initFirebase();
	initFirebaseUI();
	onFirebaseAuth();


	//
	$('#_footer').show();
	$('#_footer').click(function()***REMOVED***
		if	(document.fullscreenElement)***REMOVED***
			console.log('Its	in	fullscreen');
		***REMOVED***
		else***REMOVED***
			document.documentElement.requestFullscreen();
			let	newOrientation	=	'portrait-primary';
			screen.orientation.lock(newOrientation);
		***REMOVED***
	***REMOVED***);

	//
	//$('#gallery_item').click(startGallery);

	//
	$('#enter_button').click(login);
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


***REMOVED***;

function	initFirebase()***REMOVED***

	//	Your	web	app's	Firebase	configuration
	const	firebaseConfig	= ***REMOVED******REMOVED***;// Config_id

	//	Initialize	Firebase
	firebase.initializeApp(firebaseConfig);


	//
	firebase.auth().onAuthStateChanged(function(user)	***REMOVED***
		if	(user)
			window.user	=	user;
		else
			window.user	=	null;
		//
		window.loading_screen.finish();
		if(document.getElementById('_status') != null)
			document.getElementById('_status').innerHTML	=	'Loaded';
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
***REMOVED***

function startVideo()***REMOVED***
	//
	let	user	=	firebase.auth().currentUser;
	if(user	!=	null)***REMOVED***
		var	email_id	=	user.email;
		//var meeting_width = document.getElementById('main_video_item').offsetWidth;
		//var meeting_height = document.getElementById('main_video_item').offsetHeight;
		console.log(document.getElementById('main_video_item'));
		//
		const domain = 'meet.jit.si';
		const options = ***REMOVED***
			roomName: 'COVID19-RemoteTreatment-Dr.#### #####',
			width: 700,
			height: 700,
			parentNode: document.querySelector('#meet')
		***REMOVED***;
		const api = new JitsiMeetExternalAPI(domain, options);
	***REMOVED***
***REMOVED***


function	updateOnKeyboard()***REMOVED***
	//
	//
	var	_originalSize	=	$(window).width()	+	$(window).height();
	$(window).resize(function()***REMOVED***
		if($(window).width()	+	$(window).height()	!=	_originalSize)***REMOVED***
			console.log('keyboard	show	up');
			//$('#_footer').hide();
			//$('body').css('transform',	'translateY(-80px)');
		***REMOVED***else***REMOVED***
			console.log('keyboard	closed');
			//$('#_footer').show();
			//$('body').css('transform',	'translateY(0)');
		***REMOVED***
	***REMOVED***);
***REMOVED***


function	deselectAll()***REMOVED***
	let	elem	=	$('#sidemenu	a');
	elem.each(function(	i	)	***REMOVED***
		$(this).children().removeClass('selected');
	***REMOVED***);
***REMOVED***

function	login()***REMOVED***
	var	userEmail	=	$('#email_input').val();
	var	userPass	=	$('#password_input').val();


	firebase.auth().signInWithEmailAndPassword(userEmail,	userPass).catch(function(error)	***REMOVED***
		//	Handle	Errors	here.
		var	errorCode	=	error.code;
		var	errorMessage	=	error.message;

		window.alert('Error	:	'	+	errorMessage);

	***REMOVED***);

***REMOVED***

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


