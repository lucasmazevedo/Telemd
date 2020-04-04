/*global	tele:true,	firebase:	true, JitsiMeetExternalAPI:true*/

window.tele	=	window.tele	||	***REMOVED******REMOVED***;
window.user	=	window.user	||	null;

import	$	from	'jquery';
import	firebase	from	'firebase';
import	*	as	firebaseui	from	'firebaseui';
import	bootstrap	from	'bootstrap';
import ***REMOVED*** Notyf ***REMOVED*** from 'notyf';

window.onload	=	function()	***REMOVED***
	window.$	=	$;
	window.firebase	=	firebase;
	window.notyf = new Notyf();
	//
	//
	initFirebase();
	initSidemenu();
	//
	//
	$('#formsubmit').click(submitDoctorDetails);
***REMOVED***;

/**
 * ------------------------------------------------
 * initFirebase
 * ------------------------------------------------
 */
function	initFirebase()***REMOVED***

	console.log('initFirebase');

	//	Your	web	app's	Firebase	configuration
	const	firebaseConfig	=	***REMOVED******REMOVED***;

	//	Initialize	Firebase
	firebase.initializeApp(firebaseConfig);

	//
	firebase.auth().onAuthStateChanged(function(user)	***REMOVED***
		if	(user)***REMOVED***
			window.user	=	user;
		***REMOVED***
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
	console.log('initFirebaseUI');

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

	//	User	is	signed	in.
	if(window.user)***REMOVED***

		let userState = 'na';
		var db = firebase.firestore();
		const usersRef = db.collection('doctors').doc(window.user.uid);
		//
		usersRef.get().then(function(docSnapshot)***REMOVED***
			if (docSnapshot.exists) ***REMOVED***
				usersRef.onSnapshot(function(doc)***REMOVED***
					// Check if the user is verified and if verified create chatroom
					let db_Status = doc.get('status').toString();
					if(doc.get('verified'))***REMOVED***
						if(db_Status === 'Approved')***REMOVED***
							// Definitely approved
							// or approved [to be checked]
							// Verfied user
							console.log('User is verified and onboarded.');
							userState = 'approved';
							$('#user_div').hide();
							$('pending_div').show();
							$('#inlogin').hide();
							$('#verified_div').show();
							$('#ham_button').show();
							$('#login_div').hide();
							$('#disc').hide();
							//
							getUserInfo().then(function(value)***REMOVED***
								window.user.info = value;
								startVideo();
							***REMOVED***);
							//

							//
						***REMOVED***else if(db_Status === 'Rejected')***REMOVED***
							// Definitely rejected
							$('#main_applicant_status').text('🛑 APPLICATION REJECTED');
							$('.rejected_stage').show();
							// Rejected user
							userState = 'rejected';
							console.log('User is rejected.');
							$('#user_div').hide();
							$('#inlogin').hide();
							$('#pending_div').show();
							$('#ham_button').show();
							$('#login_div').hide();
						***REMOVED***else***REMOVED***
							console.log('error! Not supposed to be here');
						***REMOVED***
					***REMOVED***else***REMOVED***
						// Submitted user, still pending review
						userState = 'pending';
						console.log('Pending stage');
						$('#user_div').hide();
						$('#inlogin').hide();
						$('#pending_div').show();
						$('#ham_button').show();
						$('#login_div').hide();
						//
						setTimeout(function()***REMOVED***waitTimer(0,10);***REMOVED***, 3000);
					***REMOVED***
				***REMOVED***,function(serr)***REMOVED***
					//...
					console.log('error!');
				***REMOVED***);
			***REMOVED*** else ***REMOVED***
				userState = 'new';
				// New user
				console.log('New user');
				$('#user_div').show();
				$('#inlogin').show();
				$('#ham_button').show();
				$('#login_div').hide();
				// ...
			***REMOVED***
		***REMOVED***,function (err) ***REMOVED***
			//....
			console.log('error!');
			// error loading database
			console.log('Databse error...');
			window.notyf.error('Error loading database. Try loggin in again...');
			setTimeout(function()***REMOVED***
				window.user = null;
				firebase.auth().signOut();
				location.reload(true);
			***REMOVED***, 4000);
		***REMOVED***);
	***REMOVED***
	//	No	user	is	signed	in.
	else***REMOVED***
		$('#user_div').hide();
		$('#ham_button').hide();
		$('#login_div').show();
		$('#inlogin').hide();
		// ...
	***REMOVED***

	//
	window.loading_screen.finish();
	if(document.getElementById('_status') != null)
		document.getElementById('_status').innerHTML	=	'Connected';
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
		firebase.auth().signOut();
		//
		$('#home_item').children().addClass('selected');
		$('#main-div').show();
		$('#main').hide();
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
 * submitDoctorDetails
 * ------------------------------------------------
 */
function submitDoctorDetails()***REMOVED***

	console.log('Performing validation check');
	let is_valid = validateForm();
	if(!is_valid)***REMOVED***
		throwError('All fields are strictly required.');
		return -1;
	***REMOVED***

	console.log('Now submit values and documents');
	//
	var db = firebase.firestore();
	//
	var first_name = $('#fnfield').val();
	var last_name = $('#lnfield').val();
	var age = parseInt($('#age').val());
	var address = $('#addfield').val();
	var city = $('#cityfield').val();
	var state = $('#state').val();
	var phnumber = parseInt($('#ph').val());
	//
	// Add a new document in collection "doctors"
	db.collection('doctors').doc(window.user.uid).set(***REMOVED***
		name: 'Dr. ' + first_name + ' ' + last_name,
		age: age,
		address: address,
		city: city,
		state: state,
		country: 'IN',
		phnumber: phnumber,
		uid: window.user.uid,
		verified: false,
		status: 'Pending...'
	***REMOVED***).then(function() ***REMOVED***
		console.log('Document successfully written!');
		//
		$('#noteSpace').show();
		$('#errorSpace').hide();
		$('#message').text('');
		$('#errorSpace').hide();
		window.notyf.success('Your changes have been successfully submitted!');
		//
		setTimeout(function()***REMOVED***location.reload(true);***REMOVED***, 3000);
	***REMOVED***).catch(function(error) ***REMOVED***
		console.error('Error writing document: ', error);
		throwError('Error writing document:\n'+ toString(error));
	***REMOVED***);

	function throwError(_in)***REMOVED***
		$('#noteSpace').hide();
		$('#errorSpace').show();
		$('#message').show();
		$('#message').text(_in);
		//
		window.notyf.error(_in);
	***REMOVED***

	function validateForm() ***REMOVED***
		var isValid = true;
		var jfields = $('.ss-item-required');
		var fields = jfields.serializeArray();
		$.each(fields, function(i, field) ***REMOVED***
			if (!field.value)***REMOVED***
				isValid = false;
				$(jfields[i]).addClass('required');
				setTimeout(function()***REMOVED***$(jfields[i]).removeClass('required');***REMOVED***, 3000);
			***REMOVED***
		***REMOVED***);
		return isValid;
	***REMOVED***
***REMOVED***


/**
 * ------------------------------------------------
 * waitTimer
 * ------------------------------------------------
 */
function waitTimer(mm,ss)***REMOVED***
	$('.retry_stage_a').hide();
	if(mm != 0)***REMOVED***
		$('.retry_stage_b').hide();
		$('.retry_stage_c').show();
	***REMOVED***
	else***REMOVED***
		$('.retry_stage_b').show();
		$('.retry_stage_c').hide();
	***REMOVED***

	function getTimeRemaining(endtime) ***REMOVED***
		var t = Date.parse(endtime) - Date.parse(new Date());
		var seconds = Math.floor((t / 1000) % 60);
		var minutes = Math.floor((t / 1000 / 60) % 60);
		var hours = Math.floor((t / (1000 * 60 * 60)) % 24);
		var days = Math.floor(t / (1000 * 60 * 60 * 24));
		return ***REMOVED***
			'total': t,
			'days': days,
			'hours': hours,
			'minutes': minutes,
			'seconds': seconds
		***REMOVED***;
	***REMOVED***

	function initializeClock(id, endtime) ***REMOVED***
		var clock = document.getElementById(id);
		var minutesSpan = clock.querySelector('.minutes');
		var secondsSpan = clock.querySelector('.seconds');

		function updateClock() ***REMOVED***
			var t = getTimeRemaining(endtime);

			minutesSpan.innerHTML = ('0' + t.minutes).slice(-2);
			secondsSpan.innerHTML = ('0' + t.seconds).slice(-2);

			if (t.total <= 0) ***REMOVED***
				$('#pending_div').trigger('timeisup', [mm,ss]);
				$('.retry_stage_a').show();
				$('.retry_stage_b').hide();
				$('.retry_stage_c').hide();
				//
				//
				clearInterval(timeinterval);
				//
				setTimeout(function()***REMOVED***location.reload(true);***REMOVED***, 2000);
			***REMOVED***
		***REMOVED***

		updateClock();
		var timeinterval = setInterval(updateClock, 1000);
	***REMOVED***

	var deadline = new Date(Date.parse(new Date()) + mm * ss * 1000 + ss * 1000);
	initializeClock('clockdiv', deadline);
***REMOVED***


async function getUserInfo() ***REMOVED***
	var db = firebase.firestore();
	const snapshot = await db.collection('doctors').doc(window.user.uid).get();
	return snapshot.data();
***REMOVED***

/**
 * ------------------------------------------------
 * startVideo
 * ------------------------------------------------
 */
function startVideo()***REMOVED***
	//
	let	user	=	firebase.auth().currentUser;
	if(user	!=	null)***REMOVED***
		var	email_id	=	user.email;
		//var meeting_width = document.getElementById('main_video_item').offsetWidth;
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
		const domain = 'meet.jit.si';
		const options = ***REMOVED***
			roomName: 'COVID19-'+window.user.uid,
			width: meet_width,
			height: meet_height,
			parentNode: document.querySelector('#meet'),
			interfaceConfigOverwrite: ***REMOVED***
				DEFAULT_BACKGROUND: '#111',
				DEFAULT_REMOTE_DISPLAY_NAME: 'Doctor',
				SHOW_BRAND_WATERMARK: true,
				BRAND_WATERMARK_LINK: 'https://telemd.org.in/img/logo.png',
				SHOW_JITSI_WATERMARK: false,
				SHOW_WATERMARK_FOR_GUESTS: false,
				MOBILE_APP_PROMO: false,
				SHOW_CHROME_EXTENSION_BANNER: false,
				TOOLBAR_BUTTONS: [
					'microphone', 'camera', 'desktop', 'fullscreen',
					'fodeviceselection', 'hangup', 'profile', 'recording',
					'livestreaming', 'etherpad', 'chat','sharedvideo', 'settings',
					'videoquality', 'filmstrip', 'stats', 'shortcuts',
					'tileview', 'help', 'mute-everyone'
				]
			***REMOVED***
		***REMOVED***;
		const api = new JitsiMeetExternalAPI(domain, options);
		api.executeCommand('displayName', window.user.info.name);
		api.executeCommand('subject', 'COVID19-'+window.user.info.name);
	***REMOVED***
***REMOVED***
