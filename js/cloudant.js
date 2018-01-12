var loginServicePath = "https://myloginservice.eu-gb.mybluemix.net/";
var filesServicePath = "https://myfilesservice.eu-gb.mybluemix.net/";
var manageServicePath = "https://mymanageservice.eu-gb.mybluemix.net/";
var cred = "0677dc4a-00da-46cd-97db-f627e643765e-bluemix:137c1cea45ee9a1ee20523e99f21c3086ebd7f37392def5e1bb3a4a1ffc9dc9c";

function postDocument(doc, path, whatwedid) {
  var r = new XMLHttpRequest();

  r.open("POST", path, true);
  r.setRequestHeader("Content-Type","application/json");
  r.setRequestHeader("Authorization","Basic " +btoa(cred));


  r.onreadystatechange = function() {
    if(r.readyState == 4 && r.status == 200) {

      if (whatwedid == "login") {
        if (r.response != -1) {
          window.location.href = "./gallery/gallery.html";
          localStorage.setItem("username", doc._id);
        } else {
          alert("Wrong username or password")
        }
      }

      if (whatwedid == "register") {
        alert(r.response)
      }

      if (whatwedid == "upload") {
        if (r.response == "Upload Succeeded") {
          location.reload()
        }
      }

      if (whatwedid == "share") {
        alert(r.response)
      }

    }
  }

  r.send(JSON.stringify(doc));
}

function login() {
  var username = $("input[name=username]").val();
  var password = $("input[name=pass]").val();

  var doc = {};
  doc._id = username;
  doc.password = password;

  postDocument(doc, loginServicePath + "/Login", "login");
}

function createNewUser() {
  var username = $("input[name=username]").val();
  var password = $("input[name=pass]").val();

  var doc = {};
  doc._id = username;
  doc.password = password;

  postDocument(doc, loginServicePath + "/CreateUser", "register")
}

function uploadImage(encodedImage) {
    var r = new XMLHttpRequest();
    var doc = {};
    doc._id = localStorage.getItem("username");
    doc.data = encodedImage;
    localStorage.setItem("uploadedImage", encodedImage);

  postDocument(doc, filesServicePath + "/api/Files/UploadFile", "upload")
}

function encodeImageFileAsURL() {
  var filesSelected = document.getElementById("inputFileToLoad").files;
  if (filesSelected.length > 0) {
    var fileToLoad = filesSelected[0];

    var fileReader = new FileReader();

    fileReader.onload = function(fileLoadedEvent) {
      var srcData = fileLoadedEvent.target.result; // <--- data: base64
      uploadImage(srcData);
    }
  fileReader.readAsDataURL(fileToLoad);
  }
}

function getDocument(path, whatwedid) {
  var r = new XMLHttpRequest();

  r.open("GET", path, true);
  r.setRequestHeader("Authorization","Basic " +btoa(cred));

  r.onreadystatechange = function() {
    if (r.readyState == 4 && r.status == 200) {
      if (r.response != null) {
        var jsonArray = JSON.parse(r.response);
        console.log(jsonArray.length);
        jsonArray.forEach(function(obj) {
          var html = '<div class="col-sm-6 col-md-4 lightbox">' + 
                    '<span class="col-sm-4" align="center">' +
                    '<a id="' + obj._id + '" href="#" onclick="shareImg(this.id)">Share</a>' +
                    '</span>' +
                    '<span class="col-sm-4" align="center">' +
                    '<a id="' + obj._id + '" href="#" onclick="deleteImg(this.id)">Delete</a>' +
                    '</span>' +
                    '<span class="col-sm-4" align="center">' +
                    '<a href="' + obj.data + '" download="image.jpg">Download</a>' +
                    '</span>' +
                    '<br>' +
                    '<img src="' + obj.data + '">' +
                    '</div>';
          $(".imagesList").append(html)
         });


      }
    }
  }
  r.send();
}

function shareImg(_id) {
  var person = prompt("Please enter username you want to share with:", "");
  if (person != null && person != "") {
    var doc = {};
    doc._id = localStorage.getItem("username");
    doc.imgId = _id;
    doc.toUser = person;
  
    postDocument(doc, manageServicePath + "/ShareFile", "share");
  }
  console.log(_id)
}

function deleteImg(_id) {
  deleteDocument(_id, filesServicePath + "/api/Files/Delete")
}

function getList() {

  getDocument(filesServicePath + "/api/Files/GetList/" + localStorage.getItem("username", "getList"))
}


function deleteDocument(id, path) {
  var r = new XMLHttpRequest();
  r.open("DELETE", path + "/" + id, true);
  r.setRequestHeader("Authorization","Basic " +btoa(cred));

  r.onreadystatechange = function() {
    if(r.readyState == 4 && r.status == 200) {
      if (r.response == 1) {
        alert("Image deleted successfully")
        location.reload();
      }
    }
  }
  r.send();
}

function signOut() {
  localStorage.removeItem("username");
  window.location.href = "../index.html";
}