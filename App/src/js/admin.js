/*global	tele:true,	firebase:	true, JitsiMeetExternalAPI:true, Intense: true*/

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
	///
	//
	initFirebase();
	initSidemenu();
	initModal();
	//
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
			firebase.auth.GoogleAuthProvider.PROVIDER_ID,
			firebase.auth.EmailAuthProvider.PROVIDER_ID
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
		//
		$('#login_div').hide();
		verifyAccount();
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


	//
	//
	function verifyAccount()***REMOVED***
		var db = firebase.firestore();
		const adminsRef = db.collection('admins').doc('authorized');
		//
		adminsRef.get().then(function(docSnapshot)***REMOVED***
			if (docSnapshot.exists) ***REMOVED***
				adminsRef.onSnapshot(function(doc)***REMOVED***
					//
					let adminEmails = doc.get('emails');
					if(window.user.displayName != null)
						$('#uname').text(' ' + window.user.displayName.split(' ')[0]);
					if(adminEmails.indexOf(window.user.email) > -1)***REMOVED***
						performAdminTasks();
					***REMOVED***else***REMOVED***
						console.log('Here');
						$('#auth_message').html('We are sorry, you are not authorized to be here. Please contact <a href="mailto:telemd@gmail.com">telemd@gmail.com</a>');
					***REMOVED***

					//	User	is	signed	in.
					$('#user_div').show();
					$('#ham_button').show();
				***REMOVED***,function(serr)***REMOVED***
					//...
					dbError(serr);
				***REMOVED***);
			***REMOVED***else***REMOVED***
				dbError('Snapshot does not exist');
			***REMOVED***
		***REMOVED***,function (err) ***REMOVED***
			dbError(err);
		***REMOVED***);
	***REMOVED***
***REMOVED***

/**
 * ------------------------------------------------
 * initSidemenu
 *
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
 * initModal
 * ------------------------------------------------
 */
function initModal()***REMOVED***
	var modal = document.querySelector('.modal');
	var closeButton = document.querySelector('.close-button');

	function toggleModal() ***REMOVED***
		modal.classList.toggle('show-modal');
	***REMOVED***

	function windowOnClick(event) ***REMOVED***
		if (event.target === modal) ***REMOVED***
			toggleModal();
		***REMOVED***
	***REMOVED***
	//
	closeButton.addEventListener('click', toggleModal);
	window.addEventListener('click', windowOnClick);
	//
	var intense_elements = document.querySelectorAll( '.intense' );
	Intense( intense_elements );
***REMOVED***

/**
 * ------------------------------------------------
 * performAdminTasks
 * ------------------------------------------------
 */
function performAdminTasks()***REMOVED***
	console.log('Get list of doctors, arrange by authorized vs not autorized.');
	//
	getDocuments('doctors').then(function(value)***REMOVED***
		$('#review_doctors').show();
		value.forEach(function(element, index)***REMOVED***
			index += 1;
			let markup = '<tr><td>'+index+'</td><td>' + element.name + '</td><td id="status_'+index+'">' + element.status  + '</td><td>'+window.user.uid+'</td><td><a href="#" id="doc_'+index+'">View</a></td></tr>';
			$('table tbody').append(markup);
			$('#doc_'+index).click(function()***REMOVED***
				console.log('Show details for index: ' + index + ', name: ' + element.name);
				//
				var modal = document.querySelector('.modal');
				modal.classList.toggle('show-modal');
				//
				// Show approve button
				let approve_markup = '<button	id="approve_button_'+index+'" class="bigbutton" style="background-color: green; display:none;">✔ Approve</button> &nbsp';
				let reject_markup = '<button	id="reject_button_'+index+'" class="bigbutton" style="background-color: red; display:none;">✘ Reject</button>';
				$('#action_buttons').append(approve_markup);
				$('#action_buttons').append(reject_markup);
				// Show rejected button
				//
				$('#doc_name').text(element.name);
				$('#doc_age').text(element.age);
				$('#doc_ph').text(element.phnumber);
				//
				$('#doc_address').text(element.address);
				$('#doc_city').text(element.city);
				$('#doc_country').text(element.state + ',' + element.country);
				// show buttons
				$('#approve_button_'+index).show();
				$('#reject_button_'+index).show();
				// Handle on click
				if(!element.verified)***REMOVED***
					// Approved clicked
					$('#approve_button_'+index).click(function()***REMOVED***
						console.log('Approved for: ' + element.name);
						var db = firebase.firestore();
						const usersRef = db.collection('doctors').doc(element.uid);
						usersRef.update(***REMOVED***
							verified: true,
							status: 'Approved'
						***REMOVED***).then(function() ***REMOVED***
							console.log('Document successfully written!');
							window.notyf.success('Approved!');
							$('#status_'+index).text('Approved');
						***REMOVED***).catch(function(error) ***REMOVED***
							console.error('Error writing document: ', error);
							throwError('Error writing document:\n'+ toString(error));
						***REMOVED***);
						//
					***REMOVED***);
					// Reject clicked
					$('#reject_button_'+index).click(function()***REMOVED***
						console.log('Rejected for: ' + element.name);
						var db = firebase.firestore();
						const usersRef = db.collection('doctors').doc(element.uid);
						usersRef.update(***REMOVED***
							verified: true,
							status: 'Rejected'
						***REMOVED***).then(function() ***REMOVED***
							console.log('Document successfully written!');
							window.notyf.error('Rejected!');
							$('#status_'+index).text('Rejected');
						***REMOVED***).catch(function(error) ***REMOVED***
							console.error('Error writing document: ', error);
							throwError('Error writing document:\n'+ toString(error));
						***REMOVED***);
					***REMOVED***);
				***REMOVED***else***REMOVED***
					$('#approve_button_'+index).attr('disabled', true);
					$('#reject_button_'+index).attr('disabled', true);
					$('#approve_button_'+index).removeClass('bigbutton');
					$('#reject_button_'+index).removeClass('bigbutton');
					$('#approve_button_'+index).attr('style', 'background-color: #666');
					$('#reject_button_'+index).attr('style', 'background-color: #666');
				***REMOVED***
				// hide others
				value.forEach(function(ele, id)***REMOVED***
					id += 1;
					if(index != id)***REMOVED***
						$('#approve_button_'+id).hide();
						$('#reject_button_'+id).hide();
					***REMOVED***
				***REMOVED***);
			***REMOVED***);
		***REMOVED***);
	***REMOVED***,function (err) ***REMOVED***
		// ...
		dbError(err);
	***REMOVED***);

	function throwError(_in)***REMOVED***
		$('#errorSpace').show();
		$('#message').show();
		$('#message').text(_in);
		//
		window.notyf.error(_in);
	***REMOVED***
***REMOVED***

async function getDocuments(_doc) ***REMOVED***
	var db = firebase.firestore();
	const snapshot = await firebase.firestore().collection(_doc).get();
	return snapshot.docs.map(doc => doc.data());
***REMOVED***

//
//
function dbError(_err)***REMOVED***
	console.log(_err);
	// error loading database
	console.log('Databse error...');
	window.notyf.error('Error loading database. Try loggin in again...');
	setTimeout(function()***REMOVED***
		window.user = null;
		firebase.auth().signOut();
		location.reload(true);
	***REMOVED***, 4000);
***REMOVED***

