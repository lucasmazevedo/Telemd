/*global tele:true, $:true, firebase:true, JitsiMeetExternalAPI:true*/

window.tele = window.tele || {};
window.user = window.user || null;

import firebase from 'firebase';
import * as firebaseui from 'firebaseui';
import { Notyf } from 'notyf';
import { ConversationalForm, EventDispatcher } from 'conversational-form';
import ipapi from 'ipapi.co';

window.onload = function() {
	window.$ = $;
	window.firebase = firebase;
	window.notyf = new Notyf();
	//
	$('#conversational-form').hide();
	//
	$('#existing').click(function(){
		console.log('Existing user');
		$('#login_div').hide();
		initFirebaseUI();
	});
	$('#new').click(function(){
		console.log('New user');
		$('#login_div').hide();
		$('#new_user_div').show();
		$('#patient_info').show();
	});
	//
	initFirebase();
	initSidemenu();
	performPatientTasks();
};


/**
 * ------------------------------------------------
 * initFirebaseUI
 * ------------------------------------------------
 */
function initFirebaseUI(){
	console.log('initFirebaseUI');

	// FirebaseUI config.
	var uiConfig = {
		signInSuccessUrl: location.href,
		callbacks: {
			signInSuccessWithAuthResult: function(authResult, redirectUrl) {
				$('#firebaseui-auth-container').hide();
				// On success redirect to signInSuccessUrl.
				return true;
				// On sucess - get me some info on the user
				//return false;
			}
		},
		signInFlow: 'popup',
		signInOptions: [
			{
				provider: firebase.auth.PhoneAuthProvider.PROVIDER_ID,
				defaultCountry: 'IN',
			}
		]
	};

	// Initialize the FirebaseUI Widget using Firebase.
	var ui = new firebaseui.auth.AuthUI(firebase.auth());
	// The start method will wait until the DOM is loaded.
	ui.start('#firebaseui-auth-container', uiConfig);
}

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
		if (user){
			window.user = user;
		}
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
		$('#firebaseui-auth-container').hide();
		//
		var db = firebase.firestore();
		const usersRef = db.collection('patients').doc(window.user.uid);
		//
		usersRef.get().then(function(docSnapshot){
			if (docSnapshot.exists) {
				let patient = docSnapshot;
				// Check if the user is verified and if verified create chatroom
				let db_Status = patient.get('status').toString();
				console.log('Patient is: ' + db_Status);
				// Definitely registered
				console.log('User is registered and onboarded.');
				window.userDetails = patient.data();
				console.log(window.userDetails);
				//
				if(window.userDetails.name != null){
					$('#patient_name_main').text(' ' + window.userDetails.name.split(' ')[0]);
				}
			}
		},function (err) {
			//....
			console.log('error!');
			// error loading database
			console.log('Databse error...');
			window.notyf.error('Error loading database. Try loggin in again...');
			setTimeout(function(){
				window.user = null;
				firebase.auth().signOut();
				location.reload(true);
			}, 4000);
		});
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
	window.logout = logout;

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
		//
		window.userLoc = null;
		window.userDetails = null;
		//
		$.getJSON('https://api.ipify.org?format=json', function(data){
			console.log(data);
			//
			//var geo = geoip.lookup(data.ip);
			//console.log(geo);
			//
			ipapi.location(function(loc){
				console.log(loc);
				window.userLoc = loc;
				//
				$('#city').val(loc.city);
				$('#pincode').val(loc.postal);
				//$('#state').val(loc.region_code);
			}, data.ip);
		});
		//
		var cfInstance = ConversationalForm.startTheConversation({
			formEl: document.getElementById('basic-form-element'),
			context: document.getElementById('basic_details'),
			theme: 'light',
			userImage: '../images/mask-patient.png',
			robotImage: '../images/ria.png',
			flowStepCallback: function(dto, success, error){
				//
				$('.conversational-form cf-input input').focus();
				$('.conversational-form cf-input textarea').focus();
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
					return success();
			},
			submitCallback: function() {
				//
				// be aware that this prevents default form submit.
				var formDataSerialized = cfInstance.getFormData(true);
				console.log('Formdata, serialized:', formDataSerialized);
				window.userDetails = formDataSerialized;
				//
				// Upload to firebase
				//
				console.log('Now submit values and documents');
				var db = firebase.firestore();
				const usersRef = db.collection('patients').doc(window.user.uid);
				//
				// Add a new document in collection "patients"
				usersRef.set({
					name: window.userDetails.name,
					gender: window.userDetails.gender[0],
					age: window.userDetails.age[0],
					city: window.userDetails.city,
					state: state_codes[window.userLoc.region_code],
					country: 'IN',
					phnumber: window.userDetails.phone,
					serviceloc: 'IN-'+window.userLoc.region_code,
					uid: window.user.uid,
					events: [],
					status: 'registered',
					lang: 'en'
				}).then(function() {
					console.log('Document successfully written!');
					//
					setTimeout(function(){location.reload(true);}, 3000);
				}).catch(function(error) {
					console.error('Error writing document: ', error);
					window.logout();
				});
				//
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


let state_codes = {
	'AP' : 'Andhra Pradesh',
	'AN' : 'Andaman and Nicobar Islands',
	'AR' : 'Arunachal Pradesh',
	'AS' : 'Assam',
	'BR' : 'Bihar',
	'CH' : 'Chandigarh',
	'CT' : 'Chhattisgarh',
	'DN' : 'Dadar and Nagar Haveli',
	'DD' : 'Daman and Diu',
	'DL' : 'Delhi',
	'LD' : 'Lakshadweep',
	'PY' : 'Puducherry',
	'GA' : 'Goa',
	'GJ' : 'Gujarat',
	'HR' : 'Haryana',
	'HP' : 'Himachal Pradesh',
	'JK' : 'Jammu and Kashmir',
	'JH' : 'Jharkhand',
	'KA' : 'Karnataka',
	'KL' : 'Kerala',
	'MP' : 'Madhya Pradesh',
	'MH' : 'Maharashtra',
	'MN' : 'Manipur',
	'ML' : 'Meghalaya',
	'MZ' : 'Mizoram',
	'NL' : 'Nagaland',
	'OR' : 'Odisha',
	'PB' : 'Punjab',
	'RJ' : 'Rajasthan',
	'SK' : 'Sikkim',
	'TN' : 'Tamil Nadu',
	'TG' : 'Telangana',
	'TR' : 'Tripura',
	'UP' : 'Uttar Pradesh',
	'UT' : 'Uttarakhand',
	'WB' : 'West Bengal'
};