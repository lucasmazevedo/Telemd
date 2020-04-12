/*global tele:true, $:true, firebase:true, JitsiMeetExternalAPI:true*/

window.tele = window.tele || {};
window.user = window.user || null;

import firebase from 'firebase';
import * as firebaseui from 'firebaseui';
import { ConversationalForm, EventDispatcher } from 'conversational-form';

window.onload = function() {
	window.$ = $;
	window.firebase = firebase;
	//
	$('#conversational-form').hide();
	//
	initFirebase();
	initSidemenu();
	performPatientTasks();
};


/**
 * ------------------------------------------------
 * initFirebase
 * ------------------------------------------------
 */
function initFirebase(){
	// Your webapp's Firebase configuration
	const	firebaseConfig	=	JSON.parse('#{FIREBASE_CONFIG_REPlACE}#');

	// Initialize Firebase
	firebase.initializeApp(firebaseConfig);

	//
	firebase.auth().onAuthStateChanged(function(user){
		if (user)
			window.user = user;
		else{
			window.user = null;
		}
		//
		onFirebaseAuth();
	});


	window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container',
		{
			size: 'invisible',
			callback: function(response) {
				console.log('Re-captcha completed!');
				return window.success();
			}
		}
	);

}

// This function runs when the 'sign-in-button' is clicked
// Takes the value from the 'phoneNumber' input and sends SMS to that phone number
function submitPhoneNumberAuth() {
	// We are using the test phone numbers we created before
	// var phoneNumber = document.getElementById("phoneNumber").value;
	var phoneNumber = window.phone;
	var appVerifier = window.recaptchaVerifier;
	firebase.auth().signInWithPhoneNumber(phoneNumber, appVerifier)
		.then(function(confirmationResult) {
			window.confirmationResult = confirmationResult;
		})
		.catch(function(error) {
			console.log(error);
		});
	//
}

// This function runs when the 'confirm-code' button is clicked
// Takes the value from the 'code' input and submits the code to verify the phone number
// Return a user object if the authentication was successful, and auth is complete
function submitPhoneNumberAuthCode(code) {
	window.confirmationResult.confirm(code).then(function(result) {
		var user = result.user;
		console.log(user);
		window.otp_success();
	}).catch(function(error) {
		console.log(error);
	});
}


/**
 * ------------------------------------------------
 * onFirebaseAuth
 * ------------------------------------------------
 */
function onFirebaseAuth(){

	if(window.user){
		console.log('User is logged in');

		//User is signed in.
		$('#loggedin_user_div').show();
		$('#ham_button').show();
		$('#login_div').hide();
		//
	}else{
		//No user is signed in.
		$('#loggedin_user_div').hide();
		$('#ham_button').hide();
		$('#login_div').show();
	}

	//
	window.loading_screen.finish();
	if(document.getElementById('_status') != null)
		document.getElementById('_status').innerHTML	=	'Loaded';
}
//

/**
 * ------------------------------------------------
 * initSidemenu
 * // FIX ME: Make sure handling #main and #main-div is
 * // handled consistently across main.js, rmp.js and admin.js
 * ------------------------------------------------
 */
function initSidemenu(){

	//
	$('#ham_button').click(openNav);
	$('#close_nav').click(closeNav);
	//

	//Side menu functions
	let elem = $('#sidemenu a');
	elem.each(function(i){
		//
		$(this).click(function(){
			deselectAll();
			$(this).children().addClass('selected');
			//
			$('#main').hide();
			$('#about').hide();
			$('#analytics').hide();
			$('#settings').hide();
			$('#contact').hide();
			//
			let id = $(this).attr('id');
			if(id.includes('home')){
				$('#main').show();
			}else	if(id.includes('about')){
				$('#about').show();
			}else	if(id.includes('logout')){
				logout();
			}
			//
			closeNav();
		});

	});

	// NOTE
	// Following functions are scoped only for sidemenu
	//
	// function to open navigation
	function openNav()	{
		console.log('Open');
		$('#sidenav').addClass('open');
		$('#sidenav').removeClass('closed');
		$('#sidenav').css('width',	'250px');
		//
		$('#main').css('transform',	'translateX(250px)');
		$('#header_content').css('transform',	'translateX(250px)');
		$('#about').css('transform',	'translateX(250px)');
	}

	// logout functionlity
	function logout(){
		console.log('Logging out...');
		//
		deselectAll();
		closeNav();
		//
		$('#home_item').children().addClass('selected');
		$('#main').show();
		//
		firebase.auth().signOut();
	}

	// deselect sidemenu links
	function deselectAll(){
		let	elem = $('#sidemenu a');
		elem.each(function(i){
			$(this).children().removeClass('selected');
		});
	}

	// close navigation
	function closeNav()	{
		console.log('Close');
		$('#sidenav').addClass('closed');
		$('#sidenav').removeClass('open');
		$('#sidenav').css('width','0');
		//
		$('#main').css('transform','translateX(0)');
		$('#header_content').css('transform','translateX(0)');
		$('#about').css('transform','translateX(0)');
	}
}

/**
 * ------------------------------------------------
 * performPatientTasks
 * ------------------------------------------------
 */
function performPatientTasks(){
	//
	//
	$('#en').click(function(){
		window.ConversationalForm.remove();
		//
		$('#lang_pref').hide();
		$('#basic_details').show();

		var cfInstance = ConversationalForm.startTheConversation({
			formEl: document.getElementById('basic-form-element'),
			context: document.getElementById('basic_details'),
			theme: 'light',
			userImage: './images/mask-patient.png',
			robotImage: './images/ria.png',
			flowStepCallback: function(dto, success, error){
				//return error();
				if(dto.tag.id == 'phone'){
					console.log('Validate me and reply');
					window.phone = '+91' + dto.tag.value;
					//
					submitPhoneNumberAuth();
					window.success = success;
					//
				}else if(dto.tag.id == 'otp'){
					console.log('Authenticate now...');
					let otp_code = dto.tag.value;
					//
					submitPhoneNumberAuthCode(otp_code);
					window.otp_success = success;
					//
				}else
					return error();
			},
			submitCallback: function() {
				//
				// be aware that this prevents default form submit.
				//var formDataSerialized = cfInstance.getFormData(true);
				//console.log('Formdata, serialized:', formDataSerialized);
				//cfInstance.addRobotChatResponse('Please provide the OTP sent to: ' + formDataSerialized.phone);
			}
		});
		//
		//
	});
}

/**
 * ------------------------------------------------
 * startVideo
 * ------------------------------------------------
 */
function startVideo(){
	//
	//
	//
	//
	let	user = firebase.auth().currentUser;
	if(user != null){
		var	email_id = user.email;

		startVideo();
		//
		let body_height = $( window ).height();
		let header_height = $('header').outerHeight();
		let header_width = $('header').outerWidth() - 60;
		let prediv_height = $('#prelogin').outerHeight();
		let meet_height = body_height - header_height - prediv_height - 25;
		let meet_width = header_width;
		//
		$('#main').css({'maxWidth': meet_width});
		$('#main').width(meet_width);
		//
		let doc_uid = '';//
		let parametes = getUrlVars();
		if(parametes.doc != null){
			doc_uid = parametes.doc;
			//
			const domain = 'meet.jit.si';
			const options = {
				roomName: 'COVID19-'+doc_uid,
				width: meet_width,
				height: meet_height,
				parentNode: document.querySelector('#meet'),
				interfaceConfigOverwrite: {
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
				}
			};
			const api = new JitsiMeetExternalAPI(domain, options);
			api.executeCommand('displayName', window.user.displayName);
		}
		else
			$('#meet').text('Error!! No Doctor specified...');
	}
}

/**
 * ------------------------------------------------
 * getUrlVars
 * ------------------------------------------------
 */
// Read a page's GET URL variables and return them as an associative array.
function getUrlVars()
{
	var vars = [], hash;
	var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
	for(var i = 0; i < hashes.length; i++){
		hash = hashes[i].split('=');
		vars.push(hash[0]);
		vars[hash[0]] = hash[1];
	}
	return vars;
}


