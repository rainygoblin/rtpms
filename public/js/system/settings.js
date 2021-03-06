let subBtn = document.getElementById("process-save-settings");
let initBtn = document.getElementById("process-init-backuplist");
var instElements = document.querySelectorAll(".institution-form-input");
var dbElements = document.querySelectorAll(".database-form-input");
var bkpElements = document.querySelectorAll(".backup-form-input");

postProcess("settings");

// if ("confirm(数据同步操作将删除现有的全部数据和重置所有的设置，确定进行?")) {
//   postForm(uri+"initialization");
// }

function postProcess(dataType) {
  postForm(dataType).then(data=>{
    try{
      loadSettingData(data);
      setEventListeners();
    }
    catch(err){console.log(err)}
  })
}

function loadSettingData(data) {
  for (var i = 0; i < instElements.length; i++) {
    instElements[i].value = data.institution[instElements[i].name];
  }
  for (var i = 0; i < dbElements.length; i++) {
    dbElements[i].value = data.pgConfig[dbElements[i].name];
  }
  for (var i = 0; i < bkpElements.length; i++) {
    bkpElements[i].value = data.backup[bkpElements[i].name];
  }
  //document.querySelector('#text_area').innerHTML = JSON.stringify(data.logs).replace(/\"/g,'').replace(/\\n/g,"<br>");
  document.querySelector("#showCn").innerHTML = data.pgConfig.max;
  //获取datalist的dom
  var ss = document.getElementById("institutions");
  if (ss.options.length == 0) {
    //定义加载institution列表
    data.institution.institutions.forEach(institution => {
      var op = document.createElement("option");
      op.setAttribute("label", institution.name);
      op.setAttribute("value", institution.id);
      ss.appendChild(op);
    });
  }
  if (data.backup.autoDeletePatient == 1) {
    document.querySelector("#autoDeletePatient").checked = true;
    document.getElementById("spaceLimit").removeAttribute("hidden");
  } else {
    document.querySelector("#autoDeletePatient").checked = false;
    document.getElementById("spaceLimit").setAttribute("hidden", true);
  }
  document.querySelector("#autoSeg").checked =
    data.institution.autoSeg == 1 ? true : false;
  document.querySelector("#backupLockedOnly").checked =
    data.backup.backupLockedOnly == 1 ? true : false;
  document.querySelector("#showBN").innerHTML = document.querySelector(
    '[name="backupNumberPerDay"]'
  ).value;
  document.querySelector("#showCapacity").innerHTML =
    document.querySelector('[name="capacityUpperLimit"]').value + "%";
    if(Cookies.get("userInfo")){
      document.getElementById('user-info').innerHTML = JSON.parse(Cookies.get("userInfo")).userName;
    }
}

function setEventListeners() {
  initBtn.addEventListener("click", event => {
    postForm("synchronization");
  });
  subBtn.onclick = function(e) {
    var data = { institution: {}, pgConfig: {}, backup: {} };
    for (var i = 0; i < instElements.length; i++) {
      data.institution[instElements[i].name] = instElements[i].value;
    }
    for (var i = 0; i < dbElements.length; i++) {
      data.pgConfig[dbElements[i].name] = dbElements[i].value;
    }
    for (var i = 0; i < bkpElements.length; i++) {
      data.backup[bkpElements[i].name] = bkpElements[i].value;
    }
    //console.log(data)
    postForm("settings", data);
  };
  document
    .querySelector("#autoSeg")
    .addEventListener("change", function() {
      document.querySelector('[name="autoSeg"]').value = this.checked
        ? 1
        : 0;
    });
  document.querySelector('[name="max"]').addEventListener("input", function() {
    document.querySelector("#showCn").innerHTML = this.value;
  });
  document.querySelector('[name="max"]').addEventListener("change", function() {
    document.querySelector("#showCn").innerHTML = this.value;
  });
  document
    .querySelector('[name="backupNumberPerDay"]')
    .addEventListener("input", function() {
      document.querySelector("#showBN").innerHTML = this.value;
    });
  document
    .querySelector('[name="backupNumberPerDay"]')
    .addEventListener("change", function() {
      document.querySelector("#showBN").innerHTML = this.value;
    });
  document
    .querySelector('[name="capacityUpperLimit"]')
    .addEventListener("input", function() {
      document.querySelector("#showCapacity").innerHTML = this.value + "%";
    });
  document
    .querySelector('[name="capacityUpperLimit"]')
    .addEventListener("change", function() {
      document.querySelector("#showCapacity").innerHTML = this.value + "%";
    });
  document
    .querySelector("#autoDeletePatient")
    .addEventListener("change", function() {
      if (this.checked) {
        document.querySelector('[name="autoDeletePatient"]').value = 1;
        document.getElementById("spaceLimit").removeAttribute("hidden");
      } else {
        document.querySelector('[name="autoDeletePatient"]').value = 0;
        document.getElementById("spaceLimit").setAttribute("hidden", true);
      }
    });
  document
    .querySelector("#backupLockedOnly")
    .addEventListener("change", function() {
      document.querySelector('[name="backupLockedOnly"]').value = this.checked
        ? 1
        : 0;
    });
}
