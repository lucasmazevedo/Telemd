/*global tele:true, $:true, firebase:true, JitsiMeetExternalAPI:true, Intense:true, Tooltip:true*/

window.tele	=	window.tele	||	{};
window.user	=	window.user	||	null;

import firebase from 'firebase';
import * as firebaseui from 'firebaseui';
import { Notyf } from 'notyf';
import { Twilio } from 'twilio';
import p5 from 'p5';
import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import ipapi from 'ipapi.co';
import {} from './Extras/Reporter';

window.onload = function() {
	window.$ = $;
	window.firebase = firebase;
	window.notyf = new Notyf();
	window.reporter = new window.tele.NewReporter();
	window.calendar = null;

	//
	//
	initFirebase();
	initSidemenu();
	//
	//
	$('#formsubmit').click(submitDoctorDetails);
};

/**
 * ------------------------------------------------
 * initFirebase
 * ------------------------------------------------
 */
function initFirebase(){
	console.log('initFirebase');

	//Your webapp's Firebase configuration
	const firebaseConfig = JSON.parse('#{FIREBASE_CONFIG_REPlACE}#');

	// Initialize Firebase
	firebase.initializeApp(firebaseConfig);

	//
	firebase.auth().onAuthStateChanged(function(user){
		if (user){
			window.user = user;
		}
		else{
			window.user	=	null;
			initFirebaseUI();
		}
		//
		onFirebaseAuth();
	});
}

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
 * onFirebaseAuth
 * ------------------------------------------------
 */
function onFirebaseAuth(){
	// User is signed in.
	if(window.user){
		let userState = 'na';
		var db = firebase.firestore();
		const usersRef = db.collection('doctors').doc(window.user.uid);
		//
		usersRef.get().then(function(docSnapshot){
			if (docSnapshot.exists) {
				let doc = docSnapshot;
				// Check if the user is verified and if verified create chatroom
				let db_Status = doc.get('status').toString();
				if(doc.get('verified')){
					if(db_Status === 'Approved'){
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
						window.user.info = doc.data();
						console.log('FIRST');
						console.log(window.user.info);
						//
						if(window.user.info.name != null){
							$('#doc_name').text(' ' + window.user.info.name.split(' ')[0] + ' ' + window.user.info.name.split(' ')[1]);
							$('#doc_name_main').text(' ' + window.user.info.name.split(' ')[0] + ' ' + window.user.info.name.split(' ')[1]);
						}
						//
						initModal(true);
						initP5();
						initTwilio();
						fetchPatients();
						initDoctorProfile();
						//

						//

						//
					}else if(db_Status === 'Rejected'){
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
					}else{
						console.log('error! Not supposed to be here');
					}
				}else{
					// Submitted user, still pending review
					userState = 'pending';
					console.log('Pending stage');
					$('#user_div').hide();
					$('#inlogin').hide();
					$('#pending_div').show();
					$('#ham_button').show();
					$('#login_div').hide();
					//
					setTimeout(function(){waitTimer(0,10,'retry');}, 3000);
				}
			} else {
				userState = 'new';
				// New user
				console.log('New user');
				$('#user_div').show();
				$('#inlogin').show();
				$('#ham_button').show();
				$('#login_div').hide();
				$('#disc').hide();
				// ...
				console.log(window.user.phoneNumber.replace('+91', ''));
				let ph = window.user.phoneNumber.replace('+91', '');
				$('#ph').val(ph);
				$.getJSON('https://api.ipify.org?format=json', function(data){
					console.log(data);
					//
					//var geo = geoip.lookup(data.ip);
					//console.log(geo);
					//
					ipapi.location(function(loc){
						console.log(loc);
						//
						$('#cityfield').val(loc.city);
						$('#pin').val(loc.postal);
						$('#state').val(loc.region_code);
					}, data.ip);
				});
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
	}
	//No user is signed in.
	else{
		$('#user_div').hide();
		$('#ham_button').hide();
		$('#login_div').show();
		$('#inlogin').hide();
		// ...
	}

	//
	window.loading_screen.finish();
	if(document.getElementById('_status') != null)
		document.getElementById('_status').innerHTML	=	'Connected';
}


/**
 * ------------------------------------------------
 * initTwilio
 * ------------------------------------------------
 */
function initTwilio(){
	const twilioConfig = JSON.parse('#{TWILIO_CONFIG_REPlACE}#');
	const accountSid = twilioConfig.sid;
	const authToken = twilioConfig.token;
	//
	let twilio_client = new Twilio(accountSid, authToken);
	window.tc = {
		client: twilio_client,
		from: twilioConfig.fromph
	};
}

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

	// Side menu functions
	let elem = $('#sidemenu	a');
	elem.each(function(i)	{
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
		firebase.auth().signOut();
		//
		$('#home_item').children().addClass('selected');
		$('#main-div').show();
		$('#main').hide();
	}

	// deselect sidemenu links
	function deselectAll(){
		let elem = $('#sidemenu	a');
		elem.each(function(i)	{
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
 * initDoctorProfile
 * ------------------------------------------------
 */
function initDoctorProfile(){
	$('#doc_profile').show();
	//
	$.covid19stats({
		element:'#covid-widget',
		countryCode:'IN',
		showCases:true,
		showDeaths:true,
		showRecovered:true,
		showRightLabel:false
	});

	//
	initCalendar();
}


/**
 * ------------------------------------------------
 * initCalendar
 * ------------------------------------------------
 */
function initCalendar(){
	//
	console.log('Do we have doctor info?');
	console.log(window.user.info);
	//
	// Let's add calendar
	var calendarEl = document.getElementById('calendar');
	var calendar = new Calendar(calendarEl, {
		schedulerLicenseKey: 'GPL-My-Project-Is-Open-Source',
		navLinks: true,
		eventLimit: 3,
		plugins: [ dayGridPlugin, timeGridPlugin, listPlugin ],
		themeSystem: 'cosmo',
		defaultView: 'dayGridMonth',
		header: {
			left: 'prev,next today',
			center: 'title',
			right: 'dayGridMonth,listDay,timeGridWeek,timeGridDay'
		},
		events: window.user.info.events,
		eventRender: function(info) {
			let tooltip = new Tooltip(info.el, {
				title: info.event.title,
				placement: 'top',
				trigger: 'hover',
				container: 'body'
			});
		}
	});
	//
	calendar.render();
	window.calendar = calendar;
	//
	$.each(window.user.info.events, function( index, value ) {
		//
		let timenow =  new Date();
		let timetarget = new Date(value.start);
		let timetargetend = new Date(value.end);
		let beforeOffsetms = 2 * 60 *1000;
		let offsetmilliseconds = timetarget.getTime() - timenow.getTime() - beforeOffsetms;
		let withinOffsetmilliseconds = timetargetend.getTime() - timenow.getTime();
		//
		if(offsetmilliseconds > 0){
			setTimeout(function(){
				// Check for modal
				resetModal();
				if(!isModalOpen)
					toggleModal();
				$('#nextmeeting').show();
				$('#currentmeeting').hide();
				// Notification audio
				var when_audio = document.getElementById('meeting_stage_a_audio');
				when_audio.play();
				// Have a timer runnnig
				$('#nextmeetingname').text(value.title);
				$('#meetingclockdiv').show();
				$('.meeting_stage_a').show();
				waitTimer(2,0,'meeting');
				// Show join meeting button
				$('#startingsoon').show();

			}, offsetmilliseconds);
		}else if(offsetmilliseconds < 0 && withinOffsetmilliseconds > 0){
			// Check for modal
			resetModal();
			if(!isModalOpen)
				toggleModal();
			$('#nextmeeting').hide();
			$('#currentmeeting').show();
			//
			// Notification audio
			var now_audio = document.getElementById('meeting_stage_ready_audio');
			now_audio.play();
			// No timer
			$('#currentmeetingname').text(value.title);
			$('#meetingclockdiv').hide();
			// Show join meeting button
			$('#startingsoon').show();
		}

	});
	//
}

/**
 * ------------------------------------------------
 * initModal
 * ------------------------------------------------
 */
let isModalOpen = false;
function initModal(start_opened){
	var modal = document.querySelector('.modal');
	var closeButton = document.querySelector('.close-button');
	// FIX-ME!!!!!
	// ADD RESET modal when the form is closed.
	resetModal();
	//
	function windowOnClick(event) {
		if (event.target === modal) {
			toggleModal();
		}
	}
	//
	closeButton.addEventListener('click', function(){
		resetModal();
		toggleModal();
	});
	window.addEventListener('click', windowOnClick);
	//
	$(document).keydown(function(event) {
		if (event.keyCode == 27) {
			resetModal();
			toggleModal();
		}
	});
	//
	if(start_opened){
		$('#onenter').show();
		toggleModal();
	}
	//
	$('#golive').click(function(){
		startVideo();
	});

	$('#schedule').click(function(){
		$('#schedulenow').show();
		$('#onenter').hide();
		$('#patientscheduler').hide();
	});

	$('#patient').click(function(){
		$('#schedulenow').hide();
		$('#onenter').hide();
		$('#patientscheduler').show();
	});


	$('#patdatetime').datetimepicker({
		openOnFocus:true,
		timepicker:true,
		datepicker:true,
		weeks:false
	});

	let free_type = true;
	$('#free').click(function(){
		free_type = true;
		$('#schedulenow').hide();
		$('#onenter').hide();
		$('#patientscheduler').hide();
		$('#patientdetails').show();
		//
	});

	$('#paid').click(function(){
		free_type = false;
		$('#schedulenow').hide();
		$('#onenter').hide();
		$('#patientscheduler').hide();
		$('#patientdetails').show();
		$('#conamount').show();
	});

	function addMinutes(time, minsToAdd) {
		function D(J){ return (J<10? '0':'') + J; }
		var piece = time.split(':');
		var mins = piece[0]*60 + +piece[1] + +minsToAdd;
		return D(mins%(24*60)/60 | 0) + ':' + D(mins%60);
	}

	$('#confirmdetails').click(function(){
		//
		console.log('Reading input values.');
		//
		let patient_name = $('#patname').val();
		let patient_number = $('#patnumber').val();
		let at_schedule = $('#patdatetime').val();
		let add_min = $('#patdur').val();
		if(add_min > 60)	add_min = 60;
		//
		let till_schedule = at_schedule.split(' ')[0] + ' ' + addMinutes(at_schedule.split(' ')[1], add_min);
		let _from = at_schedule.replace(' ', 'T').replace('/','-') + ':00';
		let _to = at_schedule.split(' ')[0].replace('/','-') + 'T' + addMinutes(at_schedule.split(' ')[1], add_min)+ ':00';
		//
		if(!free_type){
			let cosultation_amount = $('#conamount').val();
			//
			$('#patientdetails').hide();
			$('#schedulingprogress').show();
			$('.close-button').hide();
			//
			setTimeout(function(){ $('#schedulingstatus').text('Hold tight! Sending a message...'); },1000);
			//
			// Send a text to confirm meeting
			if(window.tc.client != null){
				//
				window.tc.client.messages
					.create({
						body: 'Hello ' + patient_name + ', a doctor appointment has been scheduled on '+at_schedule.split(' ')[0].replace('/','-').replace('/','-') + ' at ' + at_schedule.split(' ')[1] +'. Doctor has also requested a consultation fee, payment details will be shared shortly.\nPlease login now with the link and register to the confirm details - https://call.telemd.org.in/?doc=drpradeep\nThank you from Team TeleMD.',
						from: window.tc.from,
						to: '+91' + patient_number
					})
					.then(function(message) {
						$('#schedulingstatus').text('Message has been sent to the patient!');
						//
						// Fix ME!!!!
						// Update firebase, then add event
						// Update firebase, then add event
						console.log('Now updating event to firebase');
						//
						let newCalEvent = {
							title  : '[Paid] Meeting pateint ' + patient_name,
							info: {
								patient_name: patient_name,
								patient_number: patient_number,
								type: 'paid'
							},
							start:_from.replace('/','-'),
							end:_to.replace('/','-'),
							allDay:false
						};

						var db = firebase.firestore().collection('doctors').doc(window.user.uid);
						//
						db.update({
							events: firebase.firestore.FieldValue.arrayUnion(newCalEvent)
						}).then(function() {
							console.log('Document successfully written!');
							//
							window.calendar.addEventSource( [newCalEvent] );
							window.calendar.render();
							setTimeout(function(){$('#schedulingstatus').text('Your schedule has been successfully saved.');}, 600);
							//
							console.log('Message has been sent!');
							console.log(message);
							window.notyf.success('Appointment confimed & Message sent!');
							setTimeout(function(){
								//
								$('#schedulingprogress').hide();
								$('#schedulingcomplete').show();
								//
								$('#gcyes').click(function(){
									console.log('Adding to Google calendar...');
									let base_url = 'https://calendar.google.com/calendar/render';
									let url = base_url + '?action=TEMPLATE&text='+newCalEvent.title+'&dates='+ at_schedule.replace(' ', 'T').replace('/','').replace('/','').replace(':','')+'00'+'/'+ till_schedule.replace(' ', 'T').replace('/','').replace('/','').replace(':','')+'00'+ '&details=With%20patient&location=Online';
									console.log(url);
									window.open(url, '_blank');
									setTimeout(function(){toggleModal();}, 1500);
								});
								//
								$('#gcno').click(function(){
									console.log('Skipped adding to Google calendar...');
									toggleModal();
								});
								//
								//
							}, 1200);
							//
							//
						}).catch(function(error) {
							console.error('Error writing document: ', error);
							throwError('Error writing document:\n'+ toString(error));
						});

					});
			}else
				console.log('Message Error!!\nTwilio client not available!!');
			//
			//
		}else{
			//
			$('#patientdetails').hide();
			$('#schedulingprogress').show();
			$('.close-button').hide();
			//
			setTimeout(function(){ $('#schedulingstatus').text('Hold tight!'); },1000);
			//

			// Send a text to confirm meeting
			if(window.tc.client != null){
				//
				window.tc.client.messages
					.create({
						body: 'Hello ' + patient_name + ', a FREE doctor appointment has been scheduled on '+at_schedule.split(' ')[0].replace('/','-').replace('/','-') + ' at ' + at_schedule.split(' ')[1] +'.\nPlease login now with the link and register to the confirm details - https://call.telemd.org.in/?doc=drpradeep\nThank you from Team TeleMD.',
						from: window.tc.from,
						to: '+91' + patient_number
					})
					.then(function(message) {
						$('#schedulingstatus').text('Message has been sent to the patient!');

						//
						// Update firebase, then add event
						console.log('Now updating event to firebase');
						//
						let newCalEvent = {
							title:'[Free] Meeting patient ' + patient_name,
							info: {
								patient_name: patient_name,
								patient_number: patient_number,
								type: 'free'
							},
							start:_from.replace('/','-'),
							end:_to.replace('/','-'),
							allDay:false
						};

						var db = firebase.firestore().collection('doctors').doc(window.user.uid);
						//
						db.update({
							events: firebase.firestore.FieldValue.arrayUnion(newCalEvent)
						}).then(function() {
							console.log('Document successfully written!');
							//
							window.calendar.addEventSource( [newCalEvent] );
							window.calendar.render();
							setTimeout(function(){$('#schedulingstatus').text('Your schedule has been successfully saved.');}, 600);
							//
							console.log('Message has been sent!');
							console.log(message);
							window.notyf.success('Appointment confimed & Message sent!');
							setTimeout(function(){
								//
								$('#schedulingprogress').hide();
								$('#schedulingcomplete').show();
								//
								$('#gcyes').click(function(){
									console.log('Adding to Google calendar...');
									let base_url = 'https://calendar.google.com/calendar/render';
									let url = base_url + '?action=TEMPLATE&text='+newCalEvent.title+'&dates='+ at_schedule.replace(' ', 'T').replace('/','').replace('/','').replace(':','')+'00'+'/'+ till_schedule.replace(' ', 'T').replace('/','').replace('/','').replace(':','')+'00'+ '&details=With%20patient&location=Online';
									console.log(url);
									window.open(url, '_blank');
									setTimeout(function(){toggleModal();}, 1500);
								});
								//
								$('#gcno').click(function(){
									console.log('Skipped adding to Google calendar...');
									toggleModal();
								});
								//
								//
							}, 1200);
							//
							//
						}).catch(function(error) {
							console.error('Error writing document: ', error);
							throwError('Error writing document:\n'+ toString(error));
						});
						///
						//
					});
			}else
				console.log('Message Error!!\nTwilio client not available!!');
		}
	});

	$('#share').click(function(){
		$('#onenter').hide();
		$('#share-buttons-container').show();
		$('.close-button').show();
	});
}


function toggleModal() {
	var modal = document.querySelector('.modal');
	modal.classList.toggle('show-modal');
	//
	isModalOpen = !isModalOpen;
}

function resetModal(){
	$('#onenter').hide();
	$('#goinglive').hide();
	$('#schedulenow').hide();
	$('#patientscheduler').hide();
	$('#patientdetails').hide();
	$('#schedulingprogress').hide();
	$('#schedulingcomplete').hide();
	$('#startingsoon').hide();
	$('#share-buttons-container').hide();

}

let intense_init = false;
function initP5(){
	//
	window.reporter.init();
	var myp5 = new p5(window.reporter.getSketch());
	//
	const p5element = document.getElementById('main-p5-canvas');
	p5element.addEventListener('ready-report', function (e) {
		console.log('report image ready.');
		$('#currentPatient').text((currentPatientView+1) + ' / ' + patientQ.length);
		//
		$('#loadingreport').hide();
		$('#viewPatient').show();
		$('#reports_status').text('💡Hint: Click over report to enlarge.');
		//
		let canvas = $('#main-p5-canvas > canvas:first')[0];
		console.log(canvas);
		let reportDataUrl = canvas.toDataURL();
		$('#current_report').attr('src', reportDataUrl);
		$('#current_report').attr('width', '100%');
		$('#current_report').show();
		//
		if(intense_init == false){
			var intense_elements = document.querySelectorAll( '.intense' );
			Intense( intense_elements );
			intense_init = true;
		}
		//
		$('#connectPatient').attr('disabled', false);
		$('#skipPatient').attr('disabled', false);
	}, false);
	//
}

/**
 * ------------------------------------------------
 * submitDoctorDetails
 * ------------------------------------------------
 */
function submitDoctorDetails(){

	console.log('Performing validation check');
	let is_valid = validateForm();
	if(!is_valid){
		throwError('All fields are strictly required.');
		return -1;
	}

	console.log('Now submit values and documents');
	//
	var db = firebase.firestore();
	//
	var first_name = $('#fnfield').val();
	var last_name = $('#lnfield').val();
	var address = $('#addfield').val();
	var city = $('#cityfield').val();
	var state = $('#state').val();
	var pin = $('#pin').val();
	var serviceloc = ['IN-'+state];
	var phnumber = parseInt($('#ph').val());
	//
	// Add a new document in collection "doctors"
	db.collection('doctors').doc(window.user.uid).set({
		name: 'Dr. ' + first_name + ' ' + last_name,
		address: address,
		city: city,
		state: state,
		country: 'IN',
		phnumber: phnumber,
		serviceloc: serviceloc,
		uid: window.user.uid,
		verified: false,
		events: [],
		status: 'Pending...'
	}).then(function() {
		console.log('Document successfully written!');
		//
		$('#noteSpace').show();
		$('#errorSpace').hide();
		$('#message').text('');
		$('#errorSpace').hide();
		window.notyf.success('Your changes have been successfully submitted!');
		//
		setTimeout(function(){location.reload(true);}, 3000);
	}).catch(function(error) {
		console.error('Error writing document: ', error);
		throwError('Error writing document:\n'+ toString(error));
	});

	function validateForm() {
		var isValid = true;
		var jfields = $('.ss-item-required');
		var fields = jfields.serializeArray();
		$.each(fields, function(i, field) {
			if (!field.value){
				isValid = false;
				$(jfields[i]).addClass('required');
				setTimeout(function(){$(jfields[i]).removeClass('required');}, 3000);
			}
		});
		return isValid;
	}
}


function throwError(_in){
	$('#noteSpace').hide();
	$('#errorSpace').show();
	$('#message').show();
	$('#message').text(_in);
	//
	window.notyf.error(_in);
}


/**
 * ------------------------------------------------
 * waitTimer
 * ------------------------------------------------
 */
function waitTimer(mm,ss,fortype){
	if(fortype == 'retry'){
		$('.retry_stage_a').hide();
		if(mm != 0){
			$('.retry_stage_b').hide();
			$('.retry_stage_c').show();
		}
		else{
			$('.retry_stage_b').show();
			$('.retry_stage_c').hide();
		}
	}else if(fortype == 'meeting'){
		$('.meeting_stage_a').show();
		$('.meeting_stage_a').css('color', 'black');
	}

	function getTimeRemaining(endtime) {
		var t = Date.parse(endtime) - Date.parse(new Date());
		var seconds = Math.floor((t / 1000) % 60);
		var minutes = Math.floor((t / 1000 / 60) % 60);
		var hours = Math.floor((t / (1000 * 60 * 60)) % 24);
		var days = Math.floor(t / (1000 * 60 * 60 * 24));
		return {
			'total': t,
			'days': days,
			'hours': hours,
			'minutes': minutes,
			'seconds': seconds
		};
	}

	function initializeClock(id, endtime) {
		var clock = document.getElementById(id);
		var minutesSpan = clock.querySelector('.minutes');
		var secondsSpan = clock.querySelector('.seconds');

		function updateClock() {
			var t = getTimeRemaining(endtime);

			minutesSpan.innerHTML = ('0' + t.minutes).slice(-2);
			secondsSpan.innerHTML = ('0' + t.seconds).slice(-2);

			if (t.total <= 0) {
				if(fortype == 'retry'){
					$('#pending_div').trigger('timeisup', [mm,ss]);
					$('.retry_stage_a').show();
					$('.retry_stage_b').hide();
					$('.retry_stage_c').hide();
					////
					setTimeout(function(){location.reload(true);}, 2000);
				}else if(fortype == 'meeting'){
					console.log('Time\'s up for meeting');
					//
					// Notification audio
					var now_audio = document.getElementById('meeting_stage_ready_audio');
					now_audio.play();
					//
					$('.meeting_stage_a').show();
					$('.meeting_stage_a').css('color', 'red');
					$('.meeting_stage_ready').show();
				}
				//
				//
				clearInterval(timeinterval);
			}
		}

		updateClock();
		var timeinterval = setInterval(updateClock, 1000);
	}

	var deadline = new Date(Date.parse(new Date()) + mm * 60 * 1000 + ss * 1000);

	if(fortype == 'retry')
		initializeClock('clockdiv', deadline);
	else if(fortype == 'meeting')
		initializeClock('meetingclockdiv', deadline);
}


async function getUserInfo() {
	var db = firebase.firestore();
	const snapshot = await db.collection('doctors').doc(window.user.uid).get();
	return snapshot.data();
}

/**
 * ------------------------------------------------
 * startVideo
 * ------------------------------------------------
 */
function startVideo(){
	//
	$('#onenter').hide();
	$('#goinglive').show();
	$('.close-button').hide();
	let online = false;
	//
	let	user	=	firebase.auth().currentUser;
	if(user	!=	null){
		var	email_id	=	user.email;
		//var meeting_width = document.getElementById('main_video_item').offsetWidth;
		let body_height = $( window ).height();
		let header_height = $('header').outerHeight();
		let header_width = $('header').outerWidth() - 60;
		let prediv_height = $('#prelogin').outerHeight();
		let meet_height = body_height - header_height - prediv_height - 25;
		let meet_width = header_width;
		//
		$('#main').css({'maxWidth': '100%'});
		$('#main').width('80%');
		//
		const domain = 'meet.jit.si';
		const options = {
			roomName: 'COVID19-'+window.user.uid,
			width: '100%',
			height: '86%',
			parentNode: document.querySelector('#meet'),
			interfaceConfigOverwrite: {
				DEFAULT_BACKGROUND: '#fff',
				DEFAULT_REMOTE_DISPLAY_NAME: 'Patient',
				DEFAULT_LOCAL_DISPLAY_NAME: 'me',
				SHOW_BRAND_WATERMARK: true,
				BRAND_WATERMARK_LINK: 'https://cdn.jitsi.net/2676/images/watermark.png',
				SHOW_JITSI_WATERMARK: false,
				SHOW_WATERMARK_FOR_GUESTS: false,
				MOBILE_APP_PROMO: false,
				SHOW_CHROME_EXTENSION_BANNER: false,
				TOOLBAR_BUTTONS: [
					'microphone', 'camera', 'desktop', 'fullscreen',
					'fodeviceselection','filmstrip',  'hangup', 'profile', 'settings',
					'videoquality', 'stats', 'shortcuts', 'help', 'mute-everyone'
				],
				SETTINGS_SECTIONS: [ 'devices', 'moderator']
			},
			/*
			userInfo: {
				avatar: 'https:/gravatar.com/avatar/abc123',
				email: 'jdoe@example.com',
				id: window.user.uid
			},*/
			onload: function(){
				//
				var modal = document.querySelector('.modal');
				modal.classList.toggle('show-modal');
				//
				online = !online;
				if(online){
					// Doctor is now online
					$('#onenter').hide();
					$('#goinglive').show();
					$('#meet').show();
					$('#islive').show();
					$('#doc_profile').hide();
					//
					// Show pateint report to doctor
					setTimeout(function(){nextPatientReport();}, 3000);
					// VIEW
					$('#viewPatient').click(function(){
						$('#current_report').trigger('click');
					});
					// SKIP
					$('#skipPatient').click(function(){
						if(currentPatientView < patientQ.length-1)
							currentPatientView++;
						else
							currentPatientView = 0;
						//
						$('#loadingreport').show();
						$('#viewPatient').hide();
						$('#current_report').hide();
						//
						setTimeout(function(){nextPatientReport();}, 2000);
					});
				}else{
					// Doctor went offline
					$('#onenter').show();
					$('#goinglive').hide();
					$('#meet').empty();
					$('#meet').hide();
					$('#islive').hide();
					$('#doc_profile').show();
				}
			}
		};
		const api = new JitsiMeetExternalAPI(domain, options);
		api.executeCommand('displayName', window.user.info.name);
		api.executeCommand('subject', 'COVID19-'+window.user.info.name);
	}
}


let patientQ = [];
let currentPatientView = 0;
function fetchPatients(){
	console.log('Fetch patients from database');
	// Get a reference to the database service
	var database = firebase.database();
	//
	console.log(window.user.info);
	let serviceLocations = window.user.info.serviceloc;

	// FIX ME!!! CONSILDER OTHER STATES TOO
	// Request for recent 10 patients
	// FIX ME!! Consilder multi-doctor scenario for queing
	var recentRequestsRef = firebase.database().ref('waitlist/'+serviceLocations[0]+'/patients').limitToLast(10);
	recentRequestsRef.once('value').then(function(snapshot) {
		//
		if(snapshot.val() != null){
			for(let q=0; q < snapshot.val().length; q++){
				let currentPatientInfo = snapshot.val()[q];
				if(currentPatientInfo.attended != true)
					patientQ.push(currentPatientInfo);
			}
			//
		}
		//
		// ACTIONS
		//
		// Show number of patients waiting
		console.log('There are ' + patientQ.length + ' patients waiting to be treated...');
		let patients_hint = 'Right now, There are ' + patientQ.length + ' patients waiting to be treated...\nEnter ward and start treating patients.';
		$('#patients_live').text(patients_hint);
		$('#currentPatient').text(0 + ' / ' + patientQ.length);
		//

	});

	// Listen for new changes as-well for more recent cases
}

//
function nextPatientReport(){
	console.log('Show patient report: ' + currentPatientView);
	let report = patientQ[currentPatientView]['covid19-report'];
	//
	//
	const p5element = document.getElementById('main-p5-canvas');
	p5element.patientReportCode = report;
	if(window.reporter.getP() != null){
		console.log('P5 ready, dispatching now!');
		$('#loadingreport').show();
		$('#reports_status').text('Loading next report...');
		$('#viewPatient').hide();
		$('#current_report').hide();
		//
		$('#connectPatient').attr('disabled', true);
		//
		p5element.dispatchEvent(new Event('update-report'));
	}else{
		console.log('Not yet ready! Will need to try again...');
	}
	//patientQ = [];
	//currentPatientView = 0;

	/*

	*/

}