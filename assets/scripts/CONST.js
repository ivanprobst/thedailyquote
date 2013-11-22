module.exports = {

	extension_map : {
	".png":"image/png",".jpg":"image/jpg",".gif":"image/gif",".ico":"image/x-icon",
	".js":"text/javascript",".css":"text/css",
	".html":"text/html"},
					
	// map for tz calculation
	ccode_to_tz_map : {"AF":"+04:30", "AL":"+01:00", "DZ":"+01:00", "AD":"+01:00", "AO":"+01:00", "AG":"-04:00", "AR":"-03:00", "AM":"+04:00", "AU":"+10:00", "AT":"+01:00", "AZ":"+04:00", "BS":"-05:00", "BH":"+03:00", "BD":"+06:00", "BB":"-04:00", "BY":"+03:00", "BE":"+01:00", "BZ":"-06:00", "BJ":"+01:00", "BT":"+06:00", "BA":"+01:00", "BW":"+02:00", "BR":"-03:00", "BG":"+02:00", "BF":"0", "BI":"+02:00", "KH":"+07:00", "CM":"+01:00", "CA":"-07:00", "CV":"-01:00", "CF":"+01:00", "TD":"+01:00", "CL":"-04:00", "CN":"+08:00", "CO":"-05:00", "KM":"+03:00", "CR":"-06:00", "CI":"0", "HR":"+01:00", "CU":"-05:00", "CY":"+02:00", "CZ":"+01:00", "DJ":"+03:00", "DM":"-04:00", "DO":"-04:00", "EC":"-05:00", "EG":"+02:00", "SV":"-06:00", "GQ":"+01:00", "ER":"+03:00", "EE":"+02:00", "ET":"+03:00", "FJ":"+12:00", "FI":"+02:00", "FR":"+01:00", "GA":"+01:00", "GM":"0", "GE":"+04:00", "DE":"+01:00", "GH":"0", "GR":"+02:00", "GD":"-04:00", "GT":"-06:00", "GN":"0", "GW":"0", "GY":"-04:00", "HT":"-05:00", "HN":"-06:00", "HU":"+01:00", "IS":"0", "IN":"+05:30", "ID":"+07:00", "IQ":"+03:00", "IE":"0", "IL":"+02:00", "IT":"+01:00", "JM":"-05:00", "JP":"+09:00", "JO":"+03:00", "KZ":"+05:00", "KE":"+03:00", "KI":"+12:00", "KW":"+03:00", "KG":"+06:00", "LV":"+02:00", "LB":"+02:00", "LS":"+02:00", "LR":"0", "LY":"+01:00", "LI":"+01:00", "LT":"+02:00", "LU":"+01:00", "MG":"+03:00", "MW":"+02:00", "MY":"+08:00", "MV":"+05:00", "ML":"0", "MT":"+01:00", "MH":"+12:00", "MR":"0", "MU":"+04:00", "MX":"-06:00", "MC":"+01:00", "MN":"+08:00", "ME":"+01:00", "MA":"0", "MZ":"+02:00", "MM":"+06:30", "NA":"+01:00", "NR":"+12:00", "NP":"+05:45", "NZ":"+12:00", "NI":"-06:00", "NE":"+01:00", "NG":"+01:00", "NO":"+01:00", "OM":"+04:00", "PK":"+05:00", "PW":"+09:00", "PA":"-05:00", "PG":"+10:00", "PY":"-04:00", "PE":"-05:00", "PH":"+08:00", "PL":"+01:00", "PT":"0", "QA":"+03:00", "RO":"+02:00", "RW":"+02:00", "KN":"-04:00", "LC":"-04:00", "VC":"-04:00", "WS":"+13:00", "SM":"+01:00", "SA":"+03:00", "SN":"0", "RS":"+01:00", "SC":"+04:00", "SL":"0", "SG":"+08:00", "SK":"+01:00", "SI":"+01:00", "SB":"+11:00", "SO":"+03:00", "ZA":"+02:00", "SS":"+03:00", "ES":"+01:00", "LK":"+05:30", "SD":"+03:00", "SR":"-03:00", "SZ":"+02:00", "SE":"+01:00", "CH":"+01:00", "TJ":"+05:00", "TH":"+07:00", "TG":"0", "TO":"+13:00", "TT":"-04:00", "TN":"+01:00", "TR":"+02:00", "TM":"+05:00", "TV":"+12:00", "UG":"+03:00", "UA":"+02:00", "AE":"+04", "GB":"0", "US":"-07:00", "UY":"-03:00", "UZ":"+05:00", "VU":"+11:00", "YE":"+03:00", "ZM":"+02:00", "ZW":"+02:00"},
	
	// design defaults
	default_barsColor: '#fff',
	default_directionSlide: 'center',
	default_blockFontColor: '#000',
	default_blockFontSize: '48px',
	default_blockWidth: '35%',
	default_blockBackgroundColor: 'none',
	default_positionLeft: 'auto',
	default_positionRight: 'auto',
	default_positionTop: 'auto',
	default_positionBottom: 'auto',
	default_photoWidth: 0,
	default_photoHeight: 0,
	
	// RSS consts
	rssTitle : 'The Quote Tribune',
	
	// timerz
	daily_transition_hour : 6, // 6am UTC
	
	// other
	db_url : 'mongodb://localhost:27017/thequotetribune',

	cleanDate : function(stringDate){
		var year = stringDate.substr(0,4);
		var month = (''+stringDate.match(/-[0-9]+-/)).replace(/-/g,'');
		var day = (''+stringDate.slice(-2)).replace(/-/g,'');
		return new Date(year, month, day);
	},

	strDateToObject : function(stringDate){
		var year = stringDate.substr(0,4);
		var month = (''+stringDate.match(/-[0-9]+-/)).replace(/-/g,'');
		var day = (''+stringDate.slice(-2)).replace(/-/g,'');
		return new Date(year, month, day);
	}
};

