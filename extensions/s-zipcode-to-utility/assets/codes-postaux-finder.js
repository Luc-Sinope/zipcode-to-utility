
var btn_try_index = 0;
var details_try_index = 0;
var btn_try_id;
var detail_try_id;
var geo_data;

window.addEventListener( "load", function(){

	btn_try_id = setInterval( function(){

		if( document.querySelector( ".pastille-flottante-utility" ) != null ){

			clearInterval( btn_try_id )
			ajoute_lien_autre_fournisseur_sur_pastille()

		}else{
			
			if( btn_try_index < 10 ){
				btn_try_index ++
			}else{
				clearInterval( btn_try_id )
			}
		}

	}, 1000)

	
	document.body.addEventListener( "click", function(e){
		
		if( e.target.closest( 
			`details[is='details-dropdown'] a[href='/pages/rabais'],
			 details[is='details-dropdown'] a[href='/en/pages/thermostats-rebates'], 
			 .affiche-utility-selector, 
			 #MenuDrawer a.drawer__menu-item[href='/pages/rabais'], 
			 #MenuDrawer a.drawer__menu-item[href='/en/pages/thermostats-rebates']` 
		 ) != null )
		 {
			
			e.preventDefault()
			e.stopPropagation()
			e.stopImmediatePropagation()
			
			document.body.classList.add( "affiche-zip-code-form-finder" )
			
			if( document.body.classList.contains( "affiche-utility-popup" ) ){
				document.body.classList.remove( "affiche-utility-popup" )
			}
			
		}
		
	})


})


function ajoute_lien_autre_fournisseur_sur_pastille(){

	const pastille_utility_active = document.querySelector( ".pastille-flottante-utility" )
	if( pastille_utility_active == null ) return

	var bouton_container = pastille_utility_active.querySelector( ".bouton-container" )
	if( bouton_container == null ) return

	var btn_autre_fournisseur = document.createElement( "a" )
	var html_el = document.querySelector( "html" )
	var langue  = html_el.getAttribute( "lang" )
	var btn_titre = "";

	switch( langue ){
		case "fr":
			btn_titre = "Autre fournisseur"
		break;
		case "en":
			btn_titre = "Other provider"
		break;
	}

	btn_autre_fournisseur.setAttribute( "href", "#" )
	btn_autre_fournisseur.setAttribute( "id", "autre_fournisseur" )
	btn_autre_fournisseur.classList.add( "btn-pastille-autre-fournisseur")
	btn_autre_fournisseur.innerHTML = "<span class='btn-text'>"+btn_titre+"</span>"

	btn_autre_fournisseur.addEventListener( "click", function(e){
		e.preventDefault();
		document.body.classList.add( "affiche-zip-code-form-finder" )
	})

	document.querySelector( "#zip-code-form-finder .ferme-validation-zipcode" )
	.addEventListener( "click", function(e){
		e.preventDefault()
		document.body.classList.remove( "affiche-zip-code-form-finder", "split-utility-select")
		setTimeout( function(){
			document.getElementById( "zip-code-form-finder" ).classList.remove( "searching", "split-utility-select" )
			document.querySelector(".split-utility-container").innerHTML = ""
		},300)
	})

	document.querySelector( "#zip-code-form-finder #geolocalisation-btn" )
	.addEventListener( "click", function(e){
		e.preventDefault()
		fetch_auto_zip_code()
	})

	document.querySelector( "#zip-code-form-finder #verif-zip-code" )
	.addEventListener( "click", function(e){
		e.preventDefault()
		fetch_offres_locales()
	})

	document.querySelector( "#zip-code-finder-input" )
	.addEventListener( "input", function(e){
		// clear coordinates
		this.setAttribute( "coordinates", "" )
		this.value = this.value.toUpperCase()
	})


	document.querySelector( "#zip-code-finder-input" )
	.addEventListener( "keypress", function(e){
		var code = (e.keyCode ? e.keyCode : e.which);
		if(code == 13) { 
			fetch_offres_locales()
		}
	})

	document.querySelector( "#fermer-zip-finder" )
	.addEventListener( "click", function(e){
		e.preventDefault();
		window.location.reload()
	})
	

	document.querySelector( "body" )
	.addEventListener( "click", function(e){
		
		if( e.target.getAttribute( "href" ) != undefined ){
			if( 
				e.target.getAttribute( "href" ) == "/pages/rabais" || 
				e.target.getAttribute( "href" ) == "/en/pages/thermostats-rebates" 
			){
				return;
			}
		}
		
		if( e.target.classList.contains( "btn-pastille-autre-fournisseur" ) ){
			return;
		}
		
		if( e.target.closest("#zip-code-form-finder") != null ){
			return;
		}
		
		document.body.classList.remove( "affiche-zip-code-form-finder" )
		
		if( document.querySelectorAll( "#zip-code-form-finder" ).length > 0 ){
			
			setTimeout( function(){
				document.getElementById( "zip-code-form-finder" ).classList.remove( "searching", "split-utility-select" )
				document.querySelector(".split-utility-container").innerHTML = ""
			},300)
			
		}

	})
	

	bouton_container.appendChild( btn_autre_fournisseur )

}

function fetch_auto_zip_code(){

	if( localStorage.getItem( "el-geoip-location" ) == null ) return;

	geo_data 		= JSON.parse( localStorage.getItem( "el-geoip-location" ) )
	var auto_zip_code, latitude, longitude

	if( geo_data != null ){
		auto_zip_code 	= geo_data.value.postalCode
		longitude 		= geo_data.value.longitude
		latitude 		= geo_data.value.latitude
		const input_field 	= document.getElementById( "zip-code-finder-input" )
		input_field.value 	= auto_zip_code
		input_field.setAttribute( "coordinates", longitude  + "," + latitude )
	}
	
	

}

async function fetch_offres_locales(){

	document.querySelector( "#zip-code-form-finder" ).classList.add( "searching" )

	const input_value = document.getElementById( "zip-code-finder-input" ).value
	const coordinates = document.getElementById( "zip-code-finder-input" ).getAttribute( "coordinates" )
	
	// make lower case and trim
	var final_value = input_value.toUpperCase().trim();
	
	final_value = final_value.replace(/\s/g, '');

	// remove accents from charaters
	final_value = final_value.normalize('NFD').replace(/[\u0300-\u036f]/g, '')

	// replace invalid chars with spaces
	final_value = final_value.replace(/[^A-Z0-9\s-]/g, '').trim();
	
	// check si c'est un zip code usa si le premier caractere est un chiffre
	const firstChar = final_value.charAt(0); // or myString[0]
	
	if (isNaN(parseInt(firstChar, 10))) {
		var part1 = final_value.slice(0, 3)
		var part2 = final_value.slice(3)
		final_value = part1 + " " + part2
	}
	
	var pays = "", region_code = "", auto_zip_code = "", longitude = "", latitude = ""

	if( localStorage.getItem( "el-geoip-location" ) != null && coordinates != "" ){

		geo_data = JSON.parse( localStorage.getItem( "el-geoip-location" ) )

		pays 			= geo_data.value.country.iso_code
		region_code 	= geo_data.value.regionCode
		final_value 	= geo_data.value.postalCode
		longitude 		= geo_data.value.longitude
		latitude 		= geo_data.value.latitude

	}

	find_split_utility( pays, region_code, final_value, longitude, latitude )

}


function display_split_utility_menu( is_split_utility, pays, region_code, final_value, longitude, latitude ){



	const split_menu = document.getElementById( "split-selector" )
	const find_rewards = document.getElementById( "zip-code-form-finder" )
	const utilities_container = split_menu.querySelector( ".split-utility-container" )
	find_rewards.classList.add( "split-utility-select" )
	const les_utilities = is_split_utility;

	les_utilities.forEach( (utility) => {
		utilities_container.innerHTML += `<div class="split-utility-item" utility="`+utility.name+`" latitude="`+latitude+`" longitude="`+longitude+`" region="`+region_code+`" pays="`+pays+`" zip="`+final_value+`">
									<div style="background-image: url(`+utility.logo+`)" class="split-image-container">
									</div>
									<h3>`+utility.name+`</h3>
								</div>`
	})

	const split_choices = document.querySelectorAll( ".split-utility-item" )

	split_choices.forEach( (choice) => {
		choice.addEventListener( "click", function(e){

			e.preventDefault();
			e.stopPropagation();
			e.stopImmediatePropagation();
			
			const pays 			= this.getAttribute( "pays" )
			const region 		= this.getAttribute( "region" )
			const zip 			= this.getAttribute( "zip" )
			const longitude 	= this.getAttribute( "longitude" )
			const latitude 		= this.getAttribute( "latitude" )
			const utility 		= this.getAttribute( "utility")

			check_offre_locale( pays, region, zip, longitude, latitude, utility )

		})
	})

}


async function find_split_utility( pays, region_code, final_value, longitude, latitude ){

	var retour = await fetch( "https://sinopetechtools.kinsta.cloud/canada_zip/find_split_utility.php", {
		method: "POST",
		body: JSON.stringify({ 
			zip			: final_value
		})
	})
	.then(response => response.json())
	.then( async result => {
		
		if( !result.status ) {
			document.querySelector( "#zip-code-form-finder" ).classList.remove( "searching" )
			document.querySelector( "#zip-code-form-finder" ).classList.add( "erreur" )
			document.querySelector( "#zip-code-form-finder" ).classList.remove( "complete" )
			return;
		}
		
		const pays = result.pays
		const region_code = result.region_code
		const zip = result.postal_code
		const longitude = result.longitude
		const latitude = result.latitude


		const utility_data = utility_list_for_zipfinder.filter( (utility) => {
			return utility.province == region_code
		})
		
		if( utility_data.length == 0 ) {
			document.querySelector( "#zip-code-form-finder" ).classList.remove( "searching" )
			document.querySelector( "#zip-code-form-finder" ).classList.remove( "erreur" )
			document.querySelector( "#zip-code-form-finder" ).classList.remove( "complete" )
			return;
		}
		
		if( utility_data.length > 1 ){

			const multi_utilities_list = utility_data.map( (utility) => {
				return {
					"logo" 		: utility.utility_logo,
					"name" 		: utility.titre_utility,
					"url_fr"	: utility.page_rabais_fr,
					"url_en"	: utility.page_rabais_en
				}
			})

			display_split_utility_menu( multi_utilities_list, pays, region_code, zip, longitude, latitude )

		}else{

			check_offre_locale( pays, region_code, final_value, longitude, latitude, utility_data[0].titre_utility )

		}
		

	})

}


async function check_offre_locale( pays, region_code, final_value, longitude, latitude, utility ){

	var html_el = document.querySelector( "html" )
	var langue  = html_el.getAttribute( "lang" )
	var url_prefx = "";

	switch( langue ){
		case "en":
			url_prefx = "/en";
		break;
	}
	
	let coordinates = []
	if( longitude != "" || latitude != "" ){
		coordinates  = longitude + "," + latitude
	}

	var retour = await fetch( "https://sinopetechtools.kinsta.cloud/canada_zip/", {
		method: "POST",
		body: JSON.stringify({ 
			pays		: pays, 
			region_code	: region_code, 
			zip			: final_value, 
			coordinates	: coordinates,
			utility		: utility,
			ville		: ""
		})
	})
	.then(response => response.json())
	.then( async result => {
		
		let resultat
		
		let utility_page = ""
		
		if( result.region != null ){
	
			const region = region_code;
	
			switch( region ){
				
				case "QC":
					utility_page = url_prefx + "/pages/hilo"
				break;
				
				case "BC":
					utility_page = url_prefx + "/pages/eco-sinope-bc-hydro-peak-saver"
				break;
				
				case "NB":
					switch( langue ){
						case "fr":
							utility_page = url_prefx + "/pages/energienb"
						break;
						case "en":
							utility_page = url_prefx + "/pages/nb-power"
						break;
					}
				break;
				
				case "PE":
					utility_page = url_prefx + "/pages/efficiencypei-rebate-program"
				break;
				
				case "NS":
					utility_page = url_prefx + "/pages/rabais-efficiency-nova-scotia"
				break;
				
				case "YT":
					utility_page = url_prefx + "/pages/eco-sinope-peak-smart"
				break;
				
				case "WA":
					
					if( utility == "Puget Sound Energy" ){
						utility_page = url_prefx + "/pages/eco-sinope-puget-sound-energy-flex-smart"
					}else if( utility == "Seattle City Light" ){
						utility_page = url_prefx + "/pages/seattle-city-lights-rebates" 
					}
	
				break;
			}
			
		}

		if( result.status == true ){
			
			// ajoute les infos aux attributs du cart
			const province_code = result.region;
			const pays = result.pays;
			const postal_code = result.postal_code;
			const longitude = result.longitude;
			const latitude = result.latitude
			const utility = result.power_utility

			const confirmed_data = {
				province_code	: province_code,
				pays			: pays,
				postal_code		: postal_code,
				longitude		: longitude,
				latitude		: latitude,
				utility			: utility
			}

			resultat = await update_customer_zipcode( confirmed_data )

			window.location.href = utility_page

			
		}else{

			document.querySelector( "#zip-code-form-finder" ).classList.remove( "searching" )
			document.querySelector( "#zip-code-form-finder" ).classList.add( "erreur" )
			document.querySelector( "#zip-code-form-finder" ).classList.remove( "complete" )

		}
		
		
	})


}


function check_multi_utility( zip ){

	
	const wa_zip_list = {
		"split_utilities" : [
			{
				"logo":"https://cdn.shopify.com/s/files/1/0569/5727/2150/files/logo-puget-sound-energy-flex-smart-1-1.png?v=1718828987",
				"name":"Puget Sound Energy"
			},
			{
				"logo":"https://cdn.shopify.com/s/files/1/0569/5727/2150/files/Seattle_City_Light__logo.svg?v=1718291842",
				"name":"Seattle City Light"
			}
		],
		"zips": [
					{"type": "split","zip": "98158","city": "Seatac/Airport"},
					{"type": "split","zip": "98062","city": "BURIEN/Seahurst"},
					{"type": "split","zip": "98166","city": "Burien/Normandy Park"},
					{"type": "split","zip": "98168","city": "BURIEN/Highline/Tukwila"},
					{"type": "split","zip": "98155","city": "Lake Forest Park"},
					{"type": "split","zip": "98057","city": "Renton"},
					{"type": "split","zip": "98148","city": "Burien"},
					{"type": "split","zip": "98188","city": "SEATAC/Tukwila"},
					{"type": "normal","zip": "98101","city": "SEATTLE"},
					{"type": "normal","zip": "98102","city": "SEATTLE"},
					{"type": "normal","zip": "98103","city": "SEATTLE"},
					{"type": "normal","zip": "98104","city": "SEATTLE"},
					{"type": "normal","zip": "98105","city": "SEATTLE"},
					{"type": "normal","zip": "98106","city": "SEATTLE"},
					{"type": "normal","zip": "98107","city": "SEATTLE"},
					{"type": "normal","zip": "98108","city": "SEATTLE"},
					{"type": "normal","zip": "98109","city": "SEATTLE"},
					{"type": "normal","zip": "98111","city": "SEATTLE"},
					{"type": "normal","zip": "98112","city": "SEATTLE"},
					{"type": "normal","zip": "98113","city": "SHORELINE"},
					{"type": "normal","zip": "98114","city": "SEATTLE"},
					{"type": "normal","zip": "98115","city": "SEATTLE"},
					{"type": "normal","zip": "98116","city": "SEATTLE"},
					{"type": "normal","zip": "98117","city": "SEATTLE"},
					{"type": "normal","zip": "98118","city": "SEATTLE"},
					{"type": "normal","zip": "98119","city": "SEATTLE"},
					{"type": "normal","zip": "98121","city": "SEATTLE"},
					{"type": "normal","zip": "98122","city": "SEATTLE"},
					{"type": "normal","zip": "98124","city": "SEATTLE"},
					{"type": "normal","zip": "98125","city": "SEATTLE"},
					{"type": "normal","zip": "98126","city": "SEATTLE"},
					{"type": "normal","zip": "98127","city": "SEATTLE"},
					{"type": "normal","zip": "98129","city": "SEATTLE"},
					{"type": "normal","zip": "98131","city": "SEATTLE"},
					{"type": "normal","zip": "98133","city": "SEATTLE"},
					{"type": "normal","zip": "98134","city": "SEATTLE"},
					{"type": "normal","zip": "98136","city": "SEATTLE"},
					{"type": "normal","zip": "98139","city": "SEATTLE"},
					{"type": "normal","zip": "98141","city": "SEATTLE"},
					{"type": "normal","zip": "98144","city": "SEATTLE"},
					{"type": "normal","zip": "98145","city": "SEATTLE"},
					{"type": "normal","zip": "98146","city": "BURIEN"},
					{"type": "normal","zip": "98154","city": "SEATTLE"},
					{"type": "normal","zip": "98160","city": "SHORELINE"},
					{"type": "normal","zip": "98161","city": "SEATTLE"},
					{"type": "normal","zip": "98164","city": "SEATTLE"},
					{"type": "normal","zip": "98165","city": "SEATTLE"},
					{"type": "normal","zip": "98170","city": "SEATTLE"},
					{"type": "normal","zip": "98174","city": "SEATTLE"},
					{"type": "normal","zip": "98175","city": "SEATTLE"},
					{"type": "normal","zip": "98177","city": "SEATTLE"},
					{"type": "normal","zip": "98178","city": "SEATTLE"},
					{"type": "normal","zip": "98181","city": "SEATTLE"},
					{"type": "normal","zip": "98185","city": "SEATTLE"},
					{"type": "normal","zip": "98190","city": "SEATTLE"},
					{"type": "normal","zip": "98191","city": "SEATTLE"},
					{"type": "normal","zip": "98194","city": "SEATTLE"},
					{"type": "normal","zip": "98195","city": "SEATTLE"},
					{"type": "normal","zip": "98199","city": "SEATTLE"},
					{"type": "normal","zip": "98220","city": "ACME"},
					{"type": "normal","zip": "98221","city": "ANACORTES"},
					{"type": "normal","zip": "98001","city": "AUBURN"},
					{"type": "normal","zip": "98002","city": "AUBURN"},
					{"type": "normal","zip": "98063","city": "AUBURN"},
					{"type": "normal","zip": "98071","city": "AUBURN"},
					{"type": "normal","zip": "98092","city": "AUBURN"},
					{"type": "normal","zip": "98110","city": "BAINBRIDGE ISLAND"},
					{"type": "normal","zip": "98224","city": "BARING"},
					{"type": "normal","zip": "98004","city": "BELLEVUE"},
					{"type": "normal","zip": "98005","city": "BELLEVUE"},
					{"type": "normal","zip": "98006","city": "BELLEVUE"},
					{"type": "normal","zip": "98007","city": "BELLEVUE"},
					{"type": "normal","zip": "98009","city": "BELLEVUE"},
					{"type": "normal","zip": "98015","city": "BELLEVUE"},
					{"type": "normal","zip": "98008","city": "BELLEVUE"},
					{"type": "normal","zip": "98226","city": "BELLINGHAM"},
					{"type": "normal","zip": "98229","city": "BELLINGHAM"},
					{"type": "normal","zip": "98225","city": "BELLINGHAM"},
					{"type": "normal","zip": "98227","city": "BELLINGHAM"},
					{"type": "normal","zip": "98228","city": "BELLINGHAM"},
					{"type": "normal","zip": "98010","city": "BLACK DIAMOND"},
					{"type": "normal","zip": "98230","city": "BLAINE"},
					{"type": "normal","zip": "98231","city": "BLAINE"},
					{"type": "normal","zip": "98391","city": "BONNEY LAKE"},
					{"type": "normal","zip": "98011","city": "BOTHELL"},
					{"type": "normal","zip": "98041","city": "BOTHELL"},
					{"type": "normal","zip": "98232","city": "BOW"},
					{"type": "normal","zip": "98310","city": "BREMERTON"},
					{"type": "normal","zip": "98311","city": "BREMERTON"},
					{"type": "normal","zip": "98312","city": "BREMERTON"},
					{"type": "normal","zip": "98314","city": "BREMERTON"},
					{"type": "normal","zip": "98337","city": "BREMERTON"},
					{"type": "normal","zip": "98321","city": "BUCKLEY"},
					{"type": "normal","zip": "98530","city": "BUCODA"},
					{"type": "normal","zip": "98322","city": "BURLEY"},
					{"type": "normal","zip": "98233","city": "BURLINGTON"},
					{"type": "normal","zip": "98013","city": "BURTON"},
					{"type": "normal","zip": "98323","city": "CARBONADO"},
					{"type": "normal","zip": "98014","city": "CARNATION"},
					{"type": "normal","zip": "98922","city": "CLE ELUM"},
					{"type": "normal","zip": "98235","city": "CLEARLAKE"},
					{"type": "normal","zip": "98236","city": "CLINTON"},
					{"type": "normal","zip": "98237","city": "CONCRETE"},
					{"type": "normal","zip": "98238","city": "CONWAY"},
					{"type": "normal","zip": "98239","city": "COUPEVILLE"},
					{"type": "normal","zip": "98240","city": "CUSTER"},
					{"type": "normal","zip": "98244","city": "DEMING"},
					{"type": "normal","zip": "98327","city": "DUPONT"},
					{"type": "normal","zip": "98019","city": "DUVALL"},
					{"type": "normal","zip": "98540","city": "EAST OLYMPIA"},
					{"type": "normal","zip": "98925","city": "EASTON"},
					{"type": "normal","zip": "98590","city": "ELLENSBURG"},
					{"type": "normal","zip": "98926","city": "ELLENSBURG"},
					{"type": "normal","zip": "98022","city": "ENUMCLAW"},
					{"type": "normal","zip": "98247","city": "EVERSON"},
					{"type": "normal","zip": "98024","city": "FALL CITY"},
					{"type": "normal","zip": "98003","city": "FEDERAL WAY"},
					{"type": "normal","zip": "98023","city": "FEDERAL WAY"},
					{"type": "normal","zip": "98093","city": "FEDERAL WAY"},
					{"type": "normal","zip": "98248","city": "FERNDALE"},
					{"type": "normal","zip": "98249","city": "FREELAND"},
					{"type": "normal","zip": "98338","city": "GRAHAM"},
					{"type": "normal","zip": "98253","city": "GREENBANK"},
					{"type": "normal","zip": "98255","city": "HAMILTON"},
					{"type": "normal","zip": "98340","city": "HANSVILLE"},
					{"type": "normal","zip": "98025","city": "HOBART"},
					{"type": "normal","zip": "98342","city": "INDIANOLA"},
					{"type": "normal","zip": "98029","city": "ISSAQUAH"},
					{"type": "normal","zip": "98027","city": "ISSAQUAH"},
					{"type": "normal","zip": "98344","city": "KAPOWSIN"},
					{"type": "normal","zip": "98028","city": "KENMORE"},
					{"type": "normal","zip": "98030","city": "KENT"},
					{"type": "normal","zip": "98031","city": "KENT"},
					{"type": "normal","zip": "98032","city": "KENT"},
					{"type": "normal","zip": "98035","city": "KENT"},
					{"type": "normal","zip": "98042","city": "KENT"},
					{"type": "normal","zip": "98064","city": "KENT"},
					{"type": "normal","zip": "98345","city": "KEYPORT"},
					{"type": "normal","zip": "98346","city": "KINGSTON"},
					{"type": "normal","zip": "98033","city": "KIRKLAND"},
					{"type": "normal","zip": "98034","city": "KIRKLAND"},
					{"type": "normal","zip": "98083","city": "KIRKLAND"},
					{"type": "normal","zip": "98934","city": "KITTITAS"},
					{"type": "normal","zip": "98257","city": "LA CONNER"},
					{"type": "normal","zip": "98503","city": "LACEY"},
					{"type": "normal","zip": "98509","city": "LACEY"},
					{"type": "normal","zip": "98498","city": "LAKEWOOD"},
					{"type": "normal","zip": "98439","city": "LAKEWOOD"},
					{"type": "normal","zip": "98260","city": "LANGLEY"},
					{"type": "normal","zip": "98556","city": "LITTLEROCK"},
					{"type": "normal","zip": "98262","city": "LUMMI ISLAND"},
					{"type": "normal","zip": "98263","city": "LYMAN"},
					{"type": "normal","zip": "98264","city": "LYNDEN"},
					{"type": "normal","zip": "98353","city": "MANCHESTER"},
					{"type": "normal","zip": "98266","city": "MAPLE FALLS"},
					{"type": "normal","zip": "98038","city": "MAPLE VALLEY"},
					{"type": "normal","zip": "98267","city": "MARBLEMOUNT"},
					{"type": "normal","zip": "98558","city": "MCKENNA"},
					{"type": "normal","zip": "98039","city": "MEDINA"},
					{"type": "normal","zip": "98040","city": "MERCER ISLAND"},
					{"type": "normal","zip": "98082","city": "MILL CREEK"},
					{"type": "normal","zip": "98273","city": "MOUNT VERNON"},
					{"type": "normal","zip": "98274","city": "MOUNT VERNON"},
					{"type": "normal","zip": "98276","city": "NOOKSACK"},
					{"type": "normal","zip": "98045","city": "NORTH BEND"},
					{"type": "normal","zip": "98277","city": "OAK HARBOR"},
					{"type": "normal","zip": "98278","city": "OAK HARBOR"},
					{"type": "normal","zip": "98359","city": "OLALLA"},
					{"type": "normal","zip": "98501","city": "OLYMPIA"},
					{"type": "normal","zip": "98502","city": "OLYMPIA"},
					{"type": "normal","zip": "98504","city": "OLYMPIA"},
					{"type": "normal","zip": "98505","city": "OLYMPIA"},
					{"type": "normal","zip": "98506","city": "OLYMPIA"},
					{"type": "normal","zip": "98507","city": "OLYMPIA"},
					{"type": "normal","zip": "98508","city": "OLYMPIA"},
					{"type": "normal","zip": "98513","city": "OLYMPIA"},
					{"type": "normal","zip": "98516","city": "OLYMPIA"},
					{"type": "normal","zip": "98599","city": "OLYMPIA"},
					{"type": "normal","zip": "98512","city": "OLYMPIA"},
					{"type": "normal","zip": "98360","city": "ORTING"},
					{"type": "normal","zip": "98047","city": "PACIFIC"},
					{"type": "normal","zip": "98281","city": "POINT ROBERTS"},
					{"type": "normal","zip": "98366","city": "PORT ORCHARD"},
					{"type": "normal","zip": "98367","city": "PORT ORCHARD"},
					{"type": "normal","zip": "98370","city": "POULSBO"},
					{"type": "normal","zip": "98050","city": "PRESTON"},
					{"type": "normal","zip": "98371","city": "PUYALLUP"},
					{"type": "normal","zip": "98372","city": "PUYALLUP"},
					{"type": "normal","zip": "98374","city": "PUYALLUP"},
					{"type": "normal","zip": "98373","city": "PUYALLUP"},
					{"type": "normal","zip": "98375","city": "PUYALLUP"},
					{"type": "normal","zip": "98576","city": "RAINIER"},
					{"type": "normal","zip": "98051","city": "RAVENSDALE"},
					{"type": "normal","zip": "98052","city": "REDMOND"},
					{"type": "normal","zip": "98073","city": "REDMOND"},
					{"type": "normal","zip": "98053","city": "REDMOND"},
					{"type": "normal","zip": "98056","city": "RENTON"},
					{"type": "normal","zip": "98058","city": "RENTON"},
					{"type": "normal","zip": "98059","city": "RENTON"},
					{"type": "normal","zip": "98055","city": "RENTON"},
					{"type": "normal","zip": "98378","city": "RETSIL"},
					{"type": "normal","zip": "98579","city": "ROCHESTER"},
					{"type": "normal","zip": "98283","city": "ROCKPORT"},
					{"type": "normal","zip": "98940","city": "RONALD"},
					{"type": "normal","zip": "98941","city": "ROSLYN"},
					{"type": "normal","zip": "98580","city": "ROY"},
					{"type": "normal","zip": "98074","city": "SAMMAMISH"},
					{"type": "normal","zip": "98075","city": "SAMMAMISH"},
					{"type": "normal","zip": "98380","city": "SEABECK"},
					{"type": "normal","zip": "98198","city": "SEATTLE"},
					{"type": "normal","zip": "98284","city": "SEDRO WOOLLEY"},
					{"type": "normal","zip": "98315","city": "SILVERDALE"},
					{"type": "normal","zip": "98383","city": "SILVERDALE"},
					{"type": "normal","zip": "98288","city": "SKYKOMISH"},
					{"type": "normal","zip": "98065","city": "SNOQUALMIE"},
					{"type": "normal","zip": "98068","city": "SNOQUALMIE PASS"},
					{"type": "normal","zip": "98943","city": "SOUTH CLE ELUM"},
					{"type": "normal","zip": "98384","city": "SOUTH COLBY"},
					{"type": "normal","zip": "98385","city": "SOUTH PRAIRIE"},
					{"type": "normal","zip": "98386","city": "SOUTHWORTH"},
					{"type": "normal","zip": "98295","city": "SUMAS"},
					{"type": "normal","zip": "98352","city": "SUMNER"},
					{"type": "normal","zip": "98390","city": "SUMNER"},
					{"type": "normal","zip": "98392","city": "SUQUAMISH"},
					{"type": "normal","zip": "98589","city": "TENINO"},
					{"type": "normal","zip": "98946","city": "THORP"},
					{"type": "normal","zip": "98393","city": "TRACYTON"},
					{"type": "normal","zip": "98511","city": "TUMWATER"},
					{"type": "normal","zip": "98070","city": "VASHON"},
					{"type": "normal","zip": "98396","city": "WILKESON"},
					{"type": "normal","zip": "98077","city": "WOODINVILLE"},
					{"type": "normal","zip": "98072","city": "WOODINVILLE"},
					{"type": "normal","zip": "98597","city": "YELM"}
					]
	}

	var resultat;
	var found = false;

	wa_zip_list.zips.forEach( ( item_zip ) => {

		if( found == true ){ 
			return;
		}
		
		if( zip == item_zip.zip ){

			if( item_zip.type == "split" ){

				found = true
				
				resultat = {
					"status" 	: "split",
					"utilities" : wa_zip_list.split_utilities
				}

			}else{

				found = true

				resultat = {
					"status" 	: "found",
					"utility"	: "PSE"
				}
			}
			
		}

	})

	if( found ){

		return resultat;

	}else{

		resultat = {
			"status": "none",
			"utility": "SCL"
		}

		return resultat;

	}

	


}


async function update_customer_zipcode( confirmed_data ){
	
	var html_el = document.querySelector( "html" )
	var langue  = html_el.getAttribute( "lang" )
	var url_prefx = "";

	switch( langue ){
		case "en":
			url_prefx = "/en";
		break;
	}

	// 1) va chercher le contenu de la variable chez shopify
	var cart_attributes = await fetch( window.Shopify.routes.root + 'cart.js', {
		method: "GET",
		headers: {
			'X-Requested-With'	: 'XMLHttpRequest',
			'Content-Type'		: 'application/json;'
		}
	})
	.then(response => response.json())
	.then( cart => {
		return  cart.attributes
	})



	if( !confirmed_data ){

		// si [confirmed_data] est false on efface l'attribut dans le cart
		cart_attributes.zip_code_confirmed = null
		cart_attributes["pre-enrolled-offers"] = null
		cart_attributes.pre_activation_data = null

	}else{

		// sinon on ajoute / update la valeur confirme dans les attributs du cart
		cart_attributes.zip_code_confirmed = {
			province_code 	: confirmed_data.province_code,
			pays 			: confirmed_data.pays,
			postal_code 	: confirmed_data.postal_code,
			longitude 		: confirmed_data.longitude,
			latitude 		: confirmed_data.latitude,
			utility			: confirmed_data.utility
		}

		let utility_name;
		switch( confirmed_data.province_code ){

			case "QC":
				utility_name = "hydro_quebec";
			break;

			case "BC":
				utility_name = "bc_hydro";
			break;

			case "NS":
				utility_name = "efficiency_nova_scotia";
			break;

			case "NB":
				utility_name = "nb_power";
			break;

			case "PEI":
				utility_name = "efficiency_pei";
			break;

			case "ON":
				utility_name = "hydro_one";
			break;

			case "WA":

				switch( confirmed_data.utility ){
					case "Seattle City Light":
						utility_name = "seattle_city_light";
					break
					case "Puget Sound Energy":
						utility_name = "puget_sound_energy";
					break;
				}
				

			break;

		}

		cart_attributes["pre-enrolled-offers"] = [{
			"preenrolled": false,
			"province": confirmed_data.province_code,
			"utility_name": utility_name,
			"utility": "0",
			"lang": langue,
			"argent": false
		}]

		cart_attributes.pre_activation_data = {
			"utility": utility_name,
			"utility_slug": utility_name,
			"utility_titre": "",
			"province_code": confirmed_data.province_code,
			"langue": langue
		}

		cart_attributes.customer_discount_data = {
			"province": confirmed_data.province_code,
			"langue": langue,
			"pays": confirmed_data.pays
		}


		

		var localGeo = await localStorage.getItem( "el-geoip-location" )

		geo_data = JSON.parse( localGeo )
		geo_data.value.postalCode = confirmed_data.postal_code
		geo_data.value.longitude = confirmed_data.longitude
		geo_data.value.latitude = confirmed_data.latitude
		geo_data.value.regionCode = confirmed_data.province_code

		await localStorage.setItem( "el-geoip-location", JSON.stringify( geo_data ) )

	}



	var updated_cart = await fetch( window.Shopify.routes.root + 'cart/update.js', {
		method: "POST",
		headers: {
			'X-Requested-With'	: 'XMLHttpRequest',
			'Content-Type'		: 'application/json;'
		},
		body: JSON.stringify({
			attributes: cart_attributes
		})
	}).then(response => response.json())
	.then( cart => {
		return cart
	})
	
	return updated_cart;

}