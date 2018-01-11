var loginServicePath = "http://localhost:5010";//"https://myloginservice.eu-gb.mybluemix.net/";
var filesServicePath = "http://localhost:5000";//"https://myfilesservice.eu-gb.mybluemix.net/";
var manageServicePath = "http://localhost:5030";//"https://myloginservice.eu-gb.mybluemix.net/";
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
          var html = '<div class="col-sm-6 col-md-4">' + 
          '<a class="lightbox" href="./images/park.jpg">' + 
            localStorage.getItem("uploadedImage") +
              '</a>' +
              '</div>';
          $(".imagesList").append(html)
        }
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
    var doc = {}; //create an empty json object.
    //var encodedImage = encodeImageFileAsURL()
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

      var newImage = document.createElement('img');
      newImage.src = srcData;

      uploadImage(newImage.outerHTML);

      //document.getElementById("imgTest").innerHTML = newImage.outerHTML;
      //alert("Converted Base64 version is " + document.getElementById("imgTest").innerHTML);
      //console.log("Converted Base64 version is " + document.getElementById("imgTest").innerHTML);
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
        var json1 = JSON.parse(r.response);
        var list = "{ \"list\" :" + r.response + "}";
        var json2 = JSON.parse(list);
        console.log(json1.length);
        json1.forEach(function(obj) {
          var html = '<div class="col-sm-6 col-md-4 lightbox">' + 
          '<a class="button lightbox" href="javascript:manageImage(' + obj._id + ')">' +
            obj.data +
              '</div>';
          $(".imagesList").append(html)
         });
      }
    }
  }
  r.send();
}

function manageImage(imgId) {
  localStorage.setItem("currentImage", imgId);
  window.location.href = "./manageImage.html";
}

function getList() {

  getDocument(filesServicePath + "/api/Files/GetList/" + localStorage.getItem("username", "getList"))
}


function deleteDocument(id,rev) {
  var r = new XMLHttpRequest();
  r.open("DELETE",dbPath+"/"+id+"?rev="+rev,true);
  r.setRequestHeader("Authorization","Basic " +btoa(cred));

  r.onreadystatechange = function() {
    if(r.readyState == 4 && r.status == 200) {
     console.log(r.response);
    }
  }
  r.send();
}

function updateDocument(id, rev, doc) {
  var r = new XMLHttpRequest();
  r.open("PUT", dbPath+"/"+id+"?rev="+rev);
  r.setRequestHeader("Authorization","Basic " +btoa(cred));

  r.onreadystatechange = function() {
    if(r.readyState == 4 && r.status == 200) {
     console.log(r.response);
    }
  }
  r.send(doc);
}


function signOut() {
  localStorage.removeItem("username");
  window.location.href = "../index.html";
}