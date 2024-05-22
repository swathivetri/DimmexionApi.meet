const { to } = require('await-to-js');
const moment = require('moment');
var CryptoJS = require("crypto-js");

module.exports.to = async (promise) => {
    let err, res;
   
    [err, res] = await to(promise);
    console.log(err,res,"events data")
    if (err){
        return [err, null]
    };
    return [null, res];
};

module.exports.ReE = function (res, err, code) { // Error Web Response
    if (typeof err == 'object' && typeof err.message != 'undefined') {
        err = err.message;
    }

    if (typeof code !== 'undefined') res.statusCode = code;

    return res.json({ success: false, error: err });
};

module.exports.ReS = function (res, data, code) { // Success Web Response
    let send_data = { success: true };

    if (typeof data == 'object') {
        send_data = Object.assign(data, send_data);//merge the objects
    }

    if (typeof code !== ' undefined') res.statusCode = code;

    return res.json(send_data)
};

module.exports.TE = function (err_message, log) { // TE stands for Throw Error
    if (log === true) {
        console.error(err_message);
    }

    throw new Error(err_message);
};

function isNull(field) {
    return typeof field === 'undefined' || field === '' || field === null
}

module.exports.isNull = isNull

function isEmpty(obj) {
    return !Object.keys(obj).length > 0;
}

module.exports.validation = async (feilds, body) => {
    let feildCheck = [];
    await feilds.map((x) => {
        if (isNull(body[x])) {
            feildCheck.push(x);
        }
    });

    if (feildCheck.length !== 0) {
        return feildCheck;
    }

    if (feildCheck.length == 0) {
        return feildCheck;
    }
}

module.exports.isEmail = async (email) => {
    const reg = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (reg.test(email)) {
        return true
    }
    else {
        return false
    }
}

module.exports.isPhone = async (phone) => {
    const reg = /^[6-9]\d{9}$/
    if (reg.test(phone)) {
        return true
    }
    else {
        return false
    }
}


module.exports.isSmartCard = async (phone) => {
    const reg = /^[1-9]\d{11}$/
    if (reg.test(phone)) {
        return true
    }
    else {
        return false
    }
}

module.exports.genratePassword = async (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

module.exports.genrateNumber = async (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive

}

module.exports.dateDiff = async (startdate) => {
    //define moments for the startdate and enddate
    var startdateMoment = moment(startdate, "DD.MM.YYYY");
    var enddateMoment = moment(new Date(), "DD.MM.YYYY");

    if (startdateMoment.isValid() === true && enddateMoment.isValid() === true) {
        //getting the difference in years
        var years = enddateMoment.diff(startdateMoment, 'years');

        // //moment returns the total months between the two dates, subtracting the years
        // var months = enddateMoment.diff(startdateMoment, 'months') - (years * 12);

        // //to calculate the days, first get the previous month and then subtract it
        // startdateMoment.add(years, 'years').add(months, 'months');
        // var days = enddateMoment.diff(startdateMoment, 'days')

        return years
        // {
        //     years: years,
        //     months: months,
        //     days: days
        // };

    }
    else {
        return undefined;
    }

}

module.exports.dateCount = async (enddate) => {
    //define moments for the startdate and enddate
    var startdateMoment = moment(new Date(), "DD.MM.YYYY");
    var enddateMoment = moment(enddate, "DD.MM.YYYY");

    if (startdateMoment.isValid() === true && enddateMoment.isValid() === true) {
        //getting the difference in years
        // var years = enddateMoment.diff(startdateMoment, 'years');

        //moment returns the total months between the two dates, subtracting the years
        // var months = enddateMoment.diff(startdateMoment, 'months') - (years * 12);

        //to calculate the days, first get the previous month and then subtract it
        // startdateMoment.add(years, 'years').add(months, 'months');
        var days = enddateMoment.diff(startdateMoment, 'days')

        return days
        // {
        //     years: years,
        //     months: months,
        //     days: days
        // };

    }
    else {
        return undefined;
    }

}

module.exports.isAadhar = async (aadhar) => {
    const adharcardTwelveDigit = /^\d{12}$/;
    const adharSixteenDigit = /^\d{16}$/;
    if (adharcardTwelveDigit.test(aadhar)) {
        return true;
    }
    else if (adharSixteenDigit.test(aadhar)) {
        return true;
    }
    else {
        return false;
    }
}

module.exports.sendSms = async (phoneNo, sms, password) => {
    // const Nexmo = require('nexmo');

    // const nexmo = new Nexmo({
    //     apiKey: 'be5c50f8',
    //     apiSecret: 'da1JbKywVT93PP8W',
    // });

    // const from = 'VASBOOK';
    // const to = '91' + phoneNo;
    // const text = sms;

    // let data = await nexmo.message.sendSms(from, to, text);
    // return data;
    var request = require("request");
    var options = {
        method: 'GET',
        url: 'https://api.authkey.io/request',
        qs:
        {
            authkey: 'b307af4dc57410dd',
            sms: sms,
            mobile: phoneNo,
            country_code: '+91',
            sender: "8610356756"
        },
    };

    request(options, function (error, response, body) {
        if (error) return error

        console.log(body);
        return response;
    });
}
// <?php
// 	// Authorisation details.
// 	$username = "ranjithkumarranjith1999@gmail.com";
// 	$hash = "0ebaf2d9f5233b5a5009420d36663939ec89f47d6b408723e199700624be3a20";

// 	// Config variables. Consult http://api.textlocal.in/docs for more info.
// 	$test = "0";

// 	// Data for text message. This is the text message data.
// 	$sender = "TXTLCL"; // This is who the message appears to be from.
// 	$numbers = "910000000000"; // A single number or a comma-seperated list of numbers
// 	$message = "This is a test message from the PHP API script.";
// 	// 612 chars or less
// 	// A single number or a comma-seperated list of numbers
// 	$message = urlencode($message);
// 	$data = "username=".$username."&hash=".$hash."&message=".$message."&sender=".$sender."&numbers=".$numbers."&test=".$test;
// 	$ch = curl_init('http://api.textlocal.in/send/?');
// 	curl_setopt($ch, CURLOPT_POST, true);
// 	curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
// 	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
// 	$result = curl_exec($ch); // This is the result from the API
// 	curl_close($ch);
// ?>

module.exports.isLandline = (inputtxt) => {
    var phoneno = /^\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{4})$/;
    if (phoneno.test(inputtxt)) {
        return true;
    }
    else {
        return false;
    }
}

module.exports.isPan = (inputtxt) => {
    var panNo = /[A-Z]{5}[0-9]{4}[A-Z]{1}/;
    if (panNo.test(inputtxt)) {
        return true;
    }
    else {
        return false;
    }
}

module.exports.generatePassword = () => {
    var length = 8,
        charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        retVal = "",
        specalset = "@#$&(<=>)!";
    for (var i = 0, n = charset.length, k = specalset.length; i < length; ++i) {
        if (i < 7) {
            retVal += charset.charAt(Math.floor(Math.random() * n));
        } else {
            retVal += specalset.charAt(Math.floor(Math.random() * k));
        }
    }
    return retVal;
}

module.exports.isEmpty = isEmpty

module.exports.firstLetterCap = (data) => {
    let normal = String(data);
    normal = normal[0].toLocaleUpperCase() + normal.slice(1).trim();
    return normal
}


//Encrypting text
module.exports.encrypt = (text) => {
    var wordArray = CryptoJS.enc.Utf8.parse(text);
    var base64 = CryptoJS.enc.Base64.stringify(wordArray);
    return base64;
}

// Decrypting text
module.exports.decrypt = (base64data) => {
    var parsedWordArray = CryptoJS.enc.Base64.parse(base64data);
    var parsedStr = parsedWordArray.toString(CryptoJS.enc.Utf8);
    return parsedStr;
}


//session id generation

module.exports.sessionIdgenerate = (checkConferenceName, name) => {
    let Session = '';

    for (var i = 0; i < 8; i++) {
        if (i < 3) {
            Session = `${Session}${String(checkConferenceName)[i].toUpperCase()}`;
        }

        if (i > 2 && i < 5) {
            Session = `${Session}${String(name)[i - 2].toUpperCase()}`;
        }

        if (i >= 5 && i < 8) {
            var result = '';
            var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            var charactersLength = characters.length;
            for (var j = 0; j <= 1; j++) {
                result += characters.charAt(Math.floor(Math.random() *
                    charactersLength));
            }

            Session = `${Session}${result}`;
        }
    }

    return Session;
}

module.exports.planIdgenerate = (checkConferenceName, no) => {
    let Session = '';

    for (var i = 0; i < no; i++) {
        if (i < 3) {
            Session = `${Session}${String(checkConferenceName)[i].toUpperCase()}`;
        }

        if (i > 2 && i < 5) {
            var result = '';
            var characters = '0123456789';
            var charactersLength = characters.length;
            for (var j = 0; j <= 1; j++) {
                result += characters.charAt(Math.floor(Math.random() *
                    charactersLength));
            }
            Session = `${Session}${result}`;
        }

        if (i >= 5 && i < no) {
            var result = '';
            var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            var charactersLength = characters.length;
            for (var j = 0; j <= 1; j++) {
                result += characters.charAt(Math.floor(Math.random() *
                    charactersLength));
            }

            Session = `${Session}${result}`;
        }
    }

    return Session;
}

module.exports.NumToWord = (price) => {
	var sglDigit = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"],
	  dblDigit = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"],
	  tensPlace = ["", "Ten", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"],
	  handle_tens = function(dgt, prevDgt) {
		return 0 == dgt ? "" : " " + (1 == dgt ? dblDigit[prevDgt] : tensPlace[dgt])
	  },
	  handle_utlc = function(dgt, nxtDgt, denom) {
		return (0 != dgt && 1 != nxtDgt ? " " + sglDigit[dgt] : "") + (0 != nxtDgt || dgt > 0 ? " " + denom : "")
	  };
  
	var str = "",
	  digitIdx = 0,
	  digit = 0,
	  nxtDigit = 0,
	  words = [];
	if (price += "", isNaN(parseInt(price))) str = "";
	else if (parseInt(price) > 0 && price.length <= 10) {
	  for (digitIdx = price.length - 1; digitIdx >= 0; digitIdx--) switch (digit = price[digitIdx] - 0, nxtDigit = digitIdx > 0 ? price[digitIdx - 1] - 0 : 0, price.length - digitIdx - 1) {
		case 0:
		  words.push(handle_utlc(digit, nxtDigit, ""));
		  break;
		case 1:
		  words.push(handle_tens(digit, price[digitIdx + 1]));
		  break;
		case 2:
		  words.push(0 != digit ? " " + sglDigit[digit] + " Hundred" + (0 != price[digitIdx + 1] && 0 != price[digitIdx + 2] ? " and" : "") : "");
		  break;
		case 3:
		  words.push(handle_utlc(digit, nxtDigit, "Thousand"));
		  break;
		case 4:
		  words.push(handle_tens(digit, price[digitIdx + 1]));
		  break;
		case 5:
		  words.push(handle_utlc(digit, nxtDigit, "Lakh"));
		  break;
		case 6:
		  words.push(handle_tens(digit, price[digitIdx + 1]));
		  break;
		case 7:
		  words.push(handle_utlc(digit, nxtDigit, "Crore"));
		  break;
		case 8:
		  words.push(handle_tens(digit, price[digitIdx + 1]));
		  break;
		case 9:
		  words.push(0 != digit ? " " + sglDigit[digit] + " Hundred" + (0 != price[digitIdx + 1] || 0 != price[digitIdx + 2] ? " and" : " Crore") : "")
	  }
	  str = words.reverse().join("")
	} else str = "";
	return str
  
}