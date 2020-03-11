﻿"use strict";
var fs = require("fs");
var express = require("express");
var router = express.Router();
var utils = require("../public/javascripts/utils");
var sortList = utils.sortList;
var getProsData = utils.getProsData;
var getSettings = utils.getSettings;

/* GET home page. */
router.get("/", function(req, res) {
  res.render("login", { title: "放疗数据管理" });
});
/* GET home page. */
router.get("/index", function(req, res) {
  res.render("index", { title: "放疗数据管理" });
});

/* POST institution data list. */
router.post("/institution", async function(req, res, next) {
  var settings = await getSettings();
  try {
    let reqData = "";
    req.on("data", function(dataChunk) {
      reqData += decodeURIComponent(dataChunk);
    });
    req.on("end", function() {
      res.setHeader("Content-Type", "application/json;charset=utf-8");
      res.setHeader("Access-Control-Allow-Origin", "*");
      var objPage = {},
        sortBy = "",
        sortAscent = true,
        pageData = [];
      var arr = reqData.split("&").map(m => {
        var item = m.split("=");
        objPage[item[0]] = item[1];
      });
      for (var a in objPage) {
        if (a.substr(0, 5) == "sort_") {
          sortBy = a;
          sortAscent = objPage[a] == "ASC" ? true : false;
        }
      }
      fs.readFile(settings.institution.institutionFileName, (err, data) => {
        if (err) {
          console.log(err.stack);
          return;
        }
        var resBl = JSON.parse(data.toString()).data;
        if (sortBy != "") {
          sortList(
            resBl,
            sortBy.replace(/^sort_/, ""),
            sortAscent,
            sortedBl => {
              resBl = sortedBl;
            }
          );
        }
        res.write(
          JSON.stringify({
            data: resBl,
            totals: resBl.length,
            settings: settings
          })
        );
        res.end();
      });
    });
  } catch (e) {
    console.log(e);
  }
});

/* POST patient data list. */
router.post("/patient", async function(req, res, next) {
  var settings = await getSettings();
  try {
    let reqData = "";
    req.on("data", function(dataChunk) {
      reqData += decodeURIComponent(dataChunk);
    });
    req.on("end", function() {
      res.setHeader("Content-Type", "application/json;charset=utf-8");
      res.setHeader("Access-Control-Allow-Origin", "*");
      var objPage = {},
        sortBy = "",
        sortAscent = true,
        pageData = [];
      var arr = reqData.split("&").map(m => {
        var item = m.split("=");
        objPage[item[0]] = item[1];
      });
      for (var a in objPage) {
        if (a.substr(0, 5) == "sort_") {
          sortBy = a;
          sortAscent = objPage[a] == "ASC" ? true : false;
        }
      }
      var searchStr = objPage["searchString"];
      console.log(objPage);
      utils
        .readDataFile(settings.institution.patientFileName)
        .then(data => {
          var resBl = data.data;
          if (sortBy != "") {
            sortList(
              resBl,
              sortBy.replace(/^sort_/, ""),
              sortAscent,
              sortedBl => {
                resBl = sortedBl;
              }
            );
          }
          //筛选institutionid
          if (objPage.institutionid != "All") {
            resBl = resBl.filter(m =>
              m.institutionid == objPage.institutionid ? m : null
            );
          }
          //按照名字和病历号搜索病人
          if (searchStr != "" && searchStr != undefined) {
            var reg = new RegExp(searchStr, "ig");
            resBl = resBl.filter(m => {
              if (
                m.firstname.match(reg) ||
                m.lastname.match(reg) ||
                m.middlename.match(reg) ||
                m.medicalrecordnumber.match(reg)
              ) {
                return m;
              }
            });
          }
          //分页显示
          pageData = resBl.slice(
            (+objPage.cPage < 1 ? 0 : +objPage.cPage - 1) * +objPage.pSize,
            (+objPage.cPage < 1 ? 1 : +objPage.cPage) * +objPage.pSize
          );
          utils.getServers().then(servers=>{
              res.write(
                JSON.stringify({
                  data: pageData,
                  totals: resBl.length,
                  settings: settings,
                  dbServerDisk: servers[2].disk
                })
              );
              res.end();
          })
        })
        .catch(err => console.log(err));
    });
  } catch (e) {
    console.log(e);
  }
});

/* POST plan data list. */
router.post("/plan", async function(req, res, next) {
  var settings = await getSettings();
  try {
    let reqData = "";
    req.on("data", function(dataChunk) {
      reqData += decodeURIComponent(dataChunk);
    });
    req.on("end", function() {
      res.setHeader("Content-Type", "application/json;charset=utf-8");
      res.setHeader("Access-Control-Allow-Origin", "*");
      var objPage = {},
        sortBy = "",
        sortAscent = true,
        pageData = [];
      var arr = reqData.split("&").map(m => {
        var item = m.split("=");
        objPage[item[0]] = item[1];
      });
      for (var a in objPage) {
        if (a.substr(0, 5) == "sort_") {
          sortBy = a;
          sortAscent = objPage[a] == "ASC" ? true : false;
        }
      }
      //console.log(objPage)
      fs.readFile(settings.institution.planFileName, (err, data) => {
        if (err) {
          console.log(err.stack);
          return;
        }
        var resBl = JSON.parse(data.toString()).data;
        //筛选patientid
        resBl = resBl.filter(m =>
          m.patientid == objPage.patientid ? m : null
        );
        //处理排序
        if (sortBy != "") {
          sortList(
            resBl,
            sortBy.replace(/^sort_/, ""),
            sortAscent,
            sortedBl => {
              resBl = sortedBl;
            }
          );
        }
        //写入返回客户端的数据
        res.write(JSON.stringify({ data: resBl, totals: resBl.length }));
        res.end();
      });
    });
  } catch (e) {
    console.log(e);
  }
});

/* POST patient data list. */
router.post("/treatment", async function(req, res, next) {
  var settings = await getSettings();
  try {
    let reqData = "";
    req.on("data", function(dataChunk) {
      reqData += decodeURIComponent(dataChunk);
    });
    req.on("end", function() {
      res.setHeader("Content-Type", "application/json;charset=utf-8");
      res.setHeader("Access-Control-Allow-Origin", "*");
      var objPage = {},
        sortBy = "",
        sortAscent = true,
        pageData = [];
      var arr = reqData.split("&").map(m => {
        var item = m.split("=");
        objPage[item[0]] = item[1];
      });
      for (var a in objPage) {
        if (a.substr(0, 5) == "sort_") {
          sortBy = a;
          sortAscent = objPage[a] == "ASC" ? true : false;
        }
      }
      var searchStr = objPage["searchString"];
      console.log(objPage);
      utils
        .readDataFile(settings.institution.patientFileName)
        .then(data => {
          var resBl = data.data;
          if (sortBy != "") {
            sortList(
              resBl,
              sortBy.replace(/^sort_/, ""),
              sortAscent,
              sortedBl => {
                resBl = sortedBl;
              }
            );
          }
          //按照名字和病历号搜索病人
          if (searchStr != "" && searchStr != undefined) {
            var reg = new RegExp(searchStr, "ig");
            resBl = resBl.filter(m => {
              if (
                m.firstname.match(reg) ||
                m.lastname.match(reg) ||
                m.middlename.match(reg) ||
                m.medicalrecordnumber.match(reg)
              ) {
                return m;
              }
            });
          }
          //分页显示
          pageData = resBl.slice(
            (+objPage.cPage < 1 ? 0 : +objPage.cPage - 1) * +objPage.pSize,
            (+objPage.cPage < 1 ? 1 : +objPage.cPage) * +objPage.pSize
          );
          res.write(
            JSON.stringify({
              data: pageData,
              totals: resBl.length,
              settings: settings
            })
          );
          res.end();
        })
        .catch(err => console.log(err));
    });
  } catch (e) {
    console.log(e);
  }
});
/* POST open plan. */
router.post("/openPlan", async function(req, res, next) {
  if (JSON.stringify(req.body) != "{}") {
    var plan = req.body;
    utils.exportPlanInfo(plan);
  }
});
/* POST patient data list. */
router.post("/deletePatient", async function(req, res, next) {
  if (JSON.stringify(req.body) != "{}") {
    var patients = req.body;
    utils.deletePatient(patients);
  }
});
/* POST settings. */
router.post("/settings", async function(req, res, next) {
  var settings = await getSettings();
  if (JSON.stringify(req.body) != "{}") {
    //Write to database file
    settings.institution.defaultInstitution =
      req.body.institution.defaultInstitution;
    settings.pgConfig = req.body.pgConfig;
    settings.backup = req.body.backup;
    var ws = fs.createWriteStream("database/settings.json", { start: 0 });
    var buffer = new Buffer.from(JSON.stringify(settings));
    ws.write(buffer, "utf8", function(err, buffer) {
      console.log("Write settings completely finished");
    });
    ws.end("");
  }
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  res.setHeader("Content-Type", "application/json;charset=utf-8");
  res.write(JSON.stringify(settings));
  res.end();
});

/* POST backup data list. */
router.post("/backupData", async function(req, res, next) {
  var settings = await getSettings();
  try {
    let reqData = "";
    req.on("data", function(dataChunk) {
      reqData += decodeURIComponent(dataChunk);
    });
    req.on("end", function() {
      res.setHeader("Content-Type", "application/json;charset=utf-8");
      res.setHeader("Access-Control-Allow-Origin", "*");
      var objPage = {},
        sortBy = "",
        sortAscent = true,
        pageData = [];
      var arr = reqData.split("&").map(m => {
        var item = m.split("=");
        objPage[item[0]] = item[1];
      });
      for (var a in objPage) {
        if (a.substr(0, 5) == "sort_") {
          sortBy = a;
          sortAscent = objPage[a] == "ASC" ? true : false;
        }
      }
      var searchStr = objPage["searchString"];
      var newBl = [];
      //console.log(objPage)
      utils.readDataFile(settings.institution.backupedFileName).then(data => {
        var resBl = data,
          backupTotalNumber = resBl.length,
          backupTotalSize = 0;
        resBl = resBl.map(b => {
          b.backupTimeStamp = b.institution.BackupTimeStamp;
          b.backupFileName = b.institution.BackupFileName;
          b.backupFileSize = b.institution.BackupFileSize;
          b.size = b.institution.PatientLiteList.PatientLite.DirSize;
          backupTotalSize += b.size / 1000;
          b.size = b.size.toFixed(2) + "MB";
          return b;
        });
        if (sortBy != "") {
          sortList(
            resBl,
            sortBy.replace(/^sort_/, ""),
            sortAscent,
            sortedBl => {
              resBl = sortedBl;
            }
          );
        }
        if (searchStr != "" && searchStr != undefined) {
          var reg = new RegExp(searchStr, "ig");
          //console.log(regName)
          resBl = resBl.filter(m => {
            if (
              m["LastName"].match(reg) ||
              m["FirstName"].match(reg) ||
              m["MiddleName"].match(reg) ||
              m["MRN"].match(reg) ||
              m.institution.BackupFileName.match(reg) ||
              m.institution.BackupTimeStamp.match(reg)
            ) {
              return m;
            }
          });
        }
        pageData = resBl.slice(
          (+objPage.cPage < 1 ? 0 : +objPage.cPage - 1) * +objPage.pSize,
          (+objPage.cPage < 1 ? 1 : +objPage.cPage) * +objPage.pSize
        );
        utils.getServers().then(servers=>{
            res.write(
              JSON.stringify({
                data: pageData,
                totals: resBl.length,
                backupTotalNumber: backupTotalNumber,
                backupTotalSize: backupTotalSize.toFixed(2),
                defaultSelectedInstitution: settings.institution.defaultInstitution,
                backupServerDisk: servers[0].disk
              })
            );
            res.end();
        })
      });
    });
  } catch (e) {
    console.log(e);
  }
});

/* POST backup pending list. */
router.post("/backupPending", async function(req, res, next) {
  var settings = await getSettings();
  try {
    let reqData = "";
    req.on("data", function(dataChunk) {
      reqData += decodeURIComponent(dataChunk);
    });
    req.on("end", function() {
      res.setHeader("Content-Type", "application/json;charset=utf-8");
      res.setHeader("Access-Control-Allow-Origin", "*");
      var objPage = {},
        sortBy = "",
        sortAscent = true,
        pageData = [];
      var arr = reqData.split("&").map(m => {
        var item = m.split("=");
        objPage[item[0]] = item[1];
      });
      for (var a in objPage) {
        if (a.substr(0, 5) == "sort_") {
          sortBy = a;
          sortAscent = objPage[a] == "ASC" ? true : false;
        }
      }
      fs.readFile(settings.institution.backupPendingFileName, (err, data) => {
        if (err) {
          console.log(err.stack);
          return;
        }
        var resBl = JSON.parse(data.toString()).data,
          backupPendingNumber = resBl.length,
          backupPendingSize = 0;
        resBl.forEach(b => {
          backupPendingSize += b.dirsize / 1000;
        });
        if (sortBy != "") {
          sortList(
            resBl,
            sortBy.replace(/^sort_/, ""),
            sortAscent,
            sortedBl => {
              resBl = sortedBl;
              //console.log(sortedBl,{'data':sortedBl,'totals':sortedBl.length})
            }
          );
        }
        res.write(
          JSON.stringify({
            data: resBl,
            totals: resBl.length,
            number: backupPendingNumber,
            size: backupPendingSize.toFixed(2)
          })
        );
        res.end();
      });
    });
  } catch (e) {
    console.log(e);
  }
});
/* POST check user. */
router.post("/user", async function(req, res, next) {
  //console.log(req.body)
  if (JSON.stringify(req.body) != "{}") {
    var user = req.body;
    utils.readUser(user);
  }
});
module.exports = router;