const {  isNull } = require('./util.service');

module.exports.validateParticipantDetail = (userDetail, index, AllUserDetails) => {
    const validation = ['name', 'mobileNumber', 'emailId'];
    let map = {};
    let inVaild = validation.filter(x => {
        if (isNull(userDetail[x])) {
            return true;
        }
        return false
    });
    if (inVaild.length > 0) {
        map.Success = false;
        map.Reason = `${inVaild} fields are absend.`;
    }
    else if (userDetail.name.length < 3) {
        map.Success = false;
        map.Reason = 'name minimum 3 character required';
    }
    else if (userDetail.mobileNumber.length < 10) {
        map.Success = false;
        map.Reason = 'Please enter 10 digit mobile number';
    }
    else if (userDetail.emailId === "" || userDetail.emailId === "undefined") {
        map.Success = false;
        map.Reason = 'emailId is required';
    }
    else if (AllUserDetails.find((x, ind) => x.mobileNumber === userDetail.mobileNumber && index !== ind)) {
        map.Success = false;
        map.Reason = 'participant mobileNumber is already exist';
    }
    else if (AllUserDetails.find((x, ind) => x.emailId === userDetail.emailId && index !== ind)) {
        map.Success = false;
        map.Reason = 'participant emailId is already exist';
    }
    else {
        map.Success = true;
    }
    return map;
}
module.exports.validateOrganizerDetail = (organizer_detail) => {
    const validation = ['id', 'name', 'mobileNumber', 'emailId'];
    console.log(organizer_detail,'organizer_detail')
    let map = {};
    let inVaild = validation.filter(x => {
        if (isNull(organizer_detail[x])) {
            return true;
        }
        return false
    });
    if (inVaild.length > 0) {
        map.Success = false;
        map.Reason = `${inVaild} fields are absend.`;
    }
    else if (organizer_detail.name.length < 3) {
        map.Success = false;
        map.Reason = 'name minimum 3 character required';
    }
    else if (organizer_detail.mobileNumber.length < 10) {
        map.Success = false;
        map.Reason = 'Please enter 10 digit mobile number';
    }
    else if (organizer_detail.emailId === "" || organizer_detail.emailId === "undefined"){
        map.Success = false;
        map.Reason = 'emailId is required';
    }
    else {
        map.Success = true;
    }
    return map;
}
let Utility = {};

const getHours = (d) => {
  var h = parseInt(d.split(":")[0]);
  if (d.split(":")[1].split(" ")[1] == "PM") {
    h = h + 12;
  }
  return h;
};
const getMinutes = (d) => {
  return parseInt(d.split(":")[1].split(" ")[0]);
};

module.exports.compareDate = (startDate, endDate) => {
    let now = Date.parse(new Date());
    let start_date = Date.parse(startDate);
    let end_date = Date.parse(endDate);

    if(start_date < now) {
        return {message : 'Start date must be in the future', success : false};
    }

    if(end_date < start_date){
        return {message : 'End date must be in the future of start date',  success : false};
    }

    else return {message : 'Start date and End date both are perfect', success : true};
}

module.exports.compareTime = (start_time, end_time) => {
  var strStartTime = start_time;
  var strEndTime = end_time;

  var startTime = new Date().setHours(
    getHours(strStartTime),
    getMinutes(strStartTime),
    0
  );
  var endTime = new Date(startTime);
  endTime = endTime.setHours(getHours(strEndTime), getMinutes(strEndTime), 0);
  if (startTime > endTime) {
    return { message: "Start Time is greater than end time", success: false };
  }
  if (startTime == endTime) {
    return { message: "Start Time equals end time", success: false };
  }
  if (startTime < endTime) {
    return { message: "Start Time is less than end time", success: true };
  }
};

module.exports.conferenceId = () => {
  let ID = Date.now() + (Math.random() * 100000).toFixed();
  let strArr = Number(ID).toString(36).split("");
  strArr.splice(3, 0, "-");
  strArr.splice(7, 0, "-");
  strArr.pop();
  strArr.pop();
  return strArr.join("");
};

module.exports.meetId = () => {
  let ID = Date.now() + (Math.random() * 100000).toFixed();
  let strArr = Number(ID).toString(36).split("");
  strArr.splice(3, 0, "-");
  strArr.splice(7, 0, "-");
  strArr.pop();
  strArr.pop();
  return strArr.join("");
};

module.exports.eventId = () => {
  let ID = Date.now() + (Math.random() * 100000).toFixed();
  let strArr = Number(ID).toString(36).split("");
  strArr.splice(3, 0, "-");
  strArr.splice(7, 0, "-");
  strArr.pop();
  strArr.pop();
  return strArr.join("");
};

module.exports.getRandomExcept = (min, max, exclude) => {
  Array(exclude).sort((a, b) => a - b);
  let random =
    min + Math.floor((max - min + 1 - exclude.length) * Math.random());
  for (let ex of exclude) {
    if (random < ex) {
      break;
    }
    random++;
  }
  return random;
};

module.exports.generatePass = (length) => {
  let pass = "";
  const ALPHABETS = "AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz";
  const NUMBERS = "0123456789";
  const CHARACTER = "@#$";

  while (pass.length !== length) {
    let choice;
    if (pass.length === 3) {
      choice = CHARACTER;
    } else if ([ 4, 5].includes(pass.length)) {
      choice = NUMBERS;
    } else {
      choice = ALPHABETS;
    }
    let char = Math.floor(Math.random() * choice.length + 1);
    pass += choice.charAt(char);
  }

  return pass;
};

module.exports.removeArrItems = (arr = [], indexes = []) => {
  let newArr = [];

  for (let index = 0; index < arr.length; index++) {
    const element = arr[index];
    if (indexes.includes(index + 1) === true) continue;
    else newArr.push(element);
  }

  return newArr;
};