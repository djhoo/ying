var express = require('express');
var multer = require ('multer'); 
var router = express.Router();
var upload = multer({ dest:  "upload/" });  
var xlsx2json = require("node-xlsx");
var fs = require("fs"); 
var moment = require('moment');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});


router.get('/service_boot', function(req, res) {
    indexright(req, res);
    //console.log(req.session.loginUser);
    var db = req.db;
    var service = db.get('servicerecord');
    //console.log(sales);
    
    //sales.find({},{sort: {ctrctEndTime:1}},function(e,docs){
    //sales.find({}).sort({"ctrctId":1}).toArray(function(e,docs){
    service.find({},{sort:{"servStartTime":1}},function(e,docs){
   
        res.render('service_boot', {
            "servicelist" : docs
           // "uid":req.session.loginUser
        });
        //console.log(docs[0].ctrctId);
    });
});

router.get('/addservice', function(req, res) {
    indexright(req,res);

    var db = req.db;
    var customer = db.get('customerlist');
    var enduser = db.get('enduserlist');
    var doctemp;
    var sortData;
    customer.find({},{sort:{"cstmName":1}},function(e,docs){
//           sortData = docs.sort(function(a,b){
//            return (a.cstmName).localeCompare(b.cstmName, "zh")
//            });
//           console.log(docs);
//           console.log(sortData);
           res.render('addservice', {
            "customer" : docs
            });
    });
        //console.log(docs[0].ctrctId);
/*
    enduser.find({},{},function(e,docs1){
         res.render('addservice', {
            "enduser" : docs1
        });
    });
*/

});

router.post('/addservice', upload.single('attach1'), function(req, res) {
    indexright(req, res);
    var db = req.db;
    var file = req.file;
    var servUid = req.session.loginUser;
    // Get our form values. These rely on the "name" attributes
    var servId = decodeURIComponent(req.body.servId);
  //  var ctrctOwner = req.body.ctrctOwner;
    var cstmName = req.body.cstmName;
    var endName = req.body.endName;
    var servType = req.body.servType;
    var servWay = req.body.servWay;
    var servGrade = req.body.servGrade;
    var servStartTime = req.body.servStartTime;
    var servEndTime = req.body.servEndTime;
    var servStatus = "0%";
    var servBrief = req.body.servBrief;
    var originalname;
    var filename;
    var path;
    if(file==null){
        originalname=null;
        filename= null;
        path=null;
    }
    else{
        originalname = file.originalname;
        filename = file.filename;
        path = file.path;
    }

    // Set our collection
    var service = db.get('servicerecord');

    // Submit to the DB
    service.insert({
        "servId" : servId,
        "servUid" : servUid,        
        "cstmName" : cstmName,
        "endName" : endName,
        "servType" : servType,
        "servWay" : servWay,
        "servGrade" : servGrade,
        "servStartTime" : servStartTime,
        "servEndTime" : servEndTime,
        "servStatus" : servStatus,
        "servBrief" : servBrief,
        "attach":[{
            "originalname":originalname,
            "filename":filename,
            "path":path
        }]
    }, function (err, doc) {
        if (err) {
            // If it failed, return error
            res.send("There was a problem adding the information to the database.");
        }
        else {
            // And forward to success page
            res.redirect("service_boot");
        }
    });
});


router.get('/servicedetail', function(req, res) {
    indexright(req, res);
    var db = req.db;
    var service = db.get('servicerecord');
    var id = decodeURIComponent(req.query.id);
    
    console.log(id);
    service.find({'servId':id},{},function(e,docs){
        if(docs.length == 0){
                res.render('helloworld');
                return;
        };
        res.render('servicedetail', {
            "servicelist" : docs,
            "uid":req.session.loginUser
        });
        //console.log(docs[0].ctrctId);
    });

    //res.render('contractdetail', { title: '销售合同细节',id:req.query.id });
});

router.get('/updateservice', function(req, res) {
    indexright(req, res);
    var id = decodeURIComponent(req.query.id);
    var db = req.db;
    var service = db.get('servicerecord');
    
    service.find({"servId" : id},{},function(e,docs){
        res.render('updateservice', {
            "servicelist" : docs,
            title: '变更服务记录'
        });
        //console.log(docs[0].ctrctId);
    });
    //res.render('updatecontract', { title: '变更销售合同'});
});

router.post('/updateservice', function(req, res) {
    indexright(req, res);
    var db = req.db;
    var service = db.get('servicerecord');
    //console.log(sales);
    var servId = decodeURIComponent(req.query.id);
    var servType = req.body.servType;
    var servWay = req.body.servWay;
    var servGrade = req.body.servGrade;
    var servStartTime = req.body.servStartTime;
    var servEndTime = req.body.servEndTime;
    var servStatus = req.body.servStatus;;
    var servBrief = req.body.servBrief;
    var servDetail = req.body.servDetail;

    var reg=new RegExp("\r\n","g");
    servDetail= servDetail.replace(reg,"<br>");

        service.update({"servId" : servId}, 
            {$set:{
                "servType" : servType,
                "servWay" : servWay,
                "servGrade" : servGrade,
                "servStartTime" : servStartTime,
                "servEndTime" : servEndTime,
                "servStatus" : servStatus,
                "servBrief" : servBrief,
                "servDetail": servDetail,
                }},
             function (err, doc) {
                if (err) {
                    // If it failed, return error
                    res.send("There was a problem update the information to the database.");
                    return;
                }
                else {
                    // And forward to success page
                    res.redirect("servicedetail?id="+encodeURIComponent(servId));
                }
            });
    
});

/********************************************************************************/
//上传附件
/********************************************************************************/
router.get('/addservattach', function(req, res) {
    indexright(req, res);
    res.render('addservattach', { title: '上传附件',id:encodeURIComponent(req.query.id)});
});


router.post('/addservattach', upload.single('attach'), function(req, res) {
//router.post('/addmaterial', function(req, res) {
    indexright(req, res);
    var db = req.db;
    var id = decodeURIComponent(req.query.id);
    var file = req.file;
    var service = db.get('servicerecord');

/*
    console.log(file.mimetype);
    console.log('原始文件名：%s', file.originalname);
    console.log('原始文件名：%s', file.filename);
    console.log('文件大小：%s', file.size);
    console.log('文件保存路径：%s', file.path);
    console.log('id：%s', id);
*/    
     // update to the DB
    service.update({"servId" : id}, 
        {$push:{"attach":{
                "originalname":file.originalname,
                "filename":file.filename,
                "path":file.path
            }}},
        function (err, doc) {
        if (err) {
            // If it failed, return error
            res.send("There was a problem adding the information to the database.");
            return;
        }
        else {
            
            res.redirect("servicedetail?id="+encodeURIComponent(id));
        }
    });
   

});

/********************************************************************************/
//增加备注
/********************************************************************************/
router.get('/addservcomment', function(req, res) {
    indexright(req, res);
    res.render('addservcomment', { title: '新增备注',id:encodeURIComponent(req.query.id)});
});

router.post('/addservcomment', function(req, res) {
    indexright(req, res);
    var db = req.db;
    var id = decodeURIComponent(req.query.id);
    // Get our form values. These rely on the "name" attributes
    var content = req.body.content;
    // Set our collection
   
    var service = db.get('servicerecord');
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth()+1;
    var day = date.getDate();
    var hour = date.getHours();
    var minute = date.getMinutes();
    var second = date.getSeconds();
    var time = year+"年"+month+"月"+day+"日"+hour+":"+minute+":"+second;

    var uid = req.session.loginUser;

    // update to the DB
    service.update({"servId" : id}, 
        {$push:{"comment":{
                "time":time,
                "content":content,
                "uid":uid
            }}},
        function (err, doc) {
        if (err) {
            // If it failed, return error
            res.send("There was a problem adding the information to the database.");
            return;
        }
        else {
            
            res.redirect("servicedetail?id="+encodeURIComponent(id));
        }
    });
        
});

/********************************************************************************/
//删除销售合同
/********************************************************************************/
router.post('/deleteservice', function(req, res) {
    indexright(req, res);
    var id = decodeURIComponent(req.query.id);
 //   console.log(ctrctId);
    var db = req.db;
    var service = db.get('servicerecord');

    service.remove({"servId" : id},  function(error, result){
        if (error) {
          console.log('deleteservice Error:'+ error);
        }else{
          res.redirect("service_boot");
        }
    });

});


/********************************************************************************/
//下载附件
/********************************************************************************/
router.get('/download', function(req, res){
    indexright(req, res);
    var flag = req.query.flag;
    var name = req.query.name;
    var filename = "upload/"+name;

    var db = req.db;
    var service = db.get('servicerecord');
    service.find({"attach.filename" : name},{},function(e,docs){
//        console.log('文件名称：%s', docs[0].attach[0].originalname);
        for(var i in docs[0].attach){
            if(docs[0].attach[i].filename == name){
                res.download(filename,docs[0].attach[i].originalname); 
            }
        }
        //res.download(filename,docs[0].attach[0].originalname); 
    });

});


/********************************************************************************/
//增加终端用户
/********************************************************************************/
router.get('/addenduser', function(req, res) {
    indexright(req, res);
    res.render('addenduser', { title: '新增终端用户' });
});

router.post('/addenduser',  function(req, res) {
    indexright(req, res);
    var db = req.db;
    // Get our form values. These rely on the "name" attributes
    //var cstmId = req.body.cstmId;
    var file = req.file;
    var owner = req.body.owner;
    var cellno = req.body.cellno;
    var telno = req.body.telno;
    var mail = req.body.mail;
    var otherinfo = req.body.otherinfo;
    

    // Set our collection
    var enduser = db.get('enduserlist');

    // Submit to the DB
    enduser.insert({
        "owner" :owner,
        "cellno" :cellno,
        "telno" :telno,
        "mail" :mail,
        "otherinfo" :otherinfo,
    
    }, function (err, doc) {
        if (err) {
            // If it failed, return error
            res.send("There was a problem adding the information to the database.");
        }
        else {
            // And forward to success page
            res.redirect("addservice");
        }
    });
});

/*search*/
router.get('/servicesearch', function(req, res) {
    indexright(req, res);
    var db = req.db;
    var customer = db.get('customerlist');
    customer.find({},{sort:{"cstmName":1}},function(e,docs){
        res.render('servicesearch', {
            "customer" : docs,
            title: '查找',
            "uid":req.session.loginUser
        });
        //console.log(docs[0].ctrctId);
    });
  //  res.render('search', { title: '查找',flag:req.query.flag});
});


router.post('/servicesearch', function(req, res) {
    indexright(req, res);
    var db = req.db;
    // Get our form values. These rely on the "name" attributes
//    var searchitem = req.body.searchitem;


    var cstmName = req.body.cstmName;
    var servUid = req.body.servUid;
    var servType = req.body.servType;
    var servWay = req.body.servWay;
    var starttime = req.body.starttime;
    var endtime = req.body.endtime;
    
    
    var condition ={};

    if(cstmName != ""){
        cstmName = new RegExp(cstmName+"+");
        condition1 = {'cstmName':cstmName};
    }
    else{
        condition1 = {'cstmName':{"$exists":true}}
    }
    
    if((starttime != "") || ( endtime != "")){
        if(starttime == "")
        {
            starttime = '1950/01/01';
        }
        if(endtime == "")
        {
            endtime = '2099/01/01';
        }
        condition2 = {"servStartTime":{"$gte":starttime, "$lte":endtime}};
    }
    else{
        condition2 = {'servStartTime':{"$exists":true}}
    }
  
    if(servUid != ""){
        servUid = new RegExp(servUid+"+");
        condition3 = {'servUid':servUid};
    }
    else{
        condition3 = {'servUid':{"$exists":true}}
    }

    if(servType != ""){
        servType = new RegExp(servType+"+");
        condition4 = {'servType':servType};
    }
    else{
        condition4 = {'servType':{"$exists":true}}
    }

    if(servWay != ""){
        servWay = new RegExp(servWay+"+");
        condition5 = {'servWay':servWay};
    }
    else{
        condition5 = {'servWay':{"$exists":true}}
    }

   //condition4 = {'$where': "this.ctrctValue > this.gathertotalvalue"};
   condition = {'cstmName':condition1.cstmName, 'servStartTime':condition2.servStartTime, 'servUid':condition3.servUid, 'servType':condition4.servType,'servWay':condition5.servWay,};
  


    //condition = {'cstmName':condition1.cstmName, 'ctrctTime':condition2.ctrctTime, 'ctrctEndTime':condition3.ctrctEndTime};


    console.log(condition);

    var service = db.get('servicerecord');
        
    service.find(condition,{sort:{"servStartTime":1}},function(e,docs){
        res.render("servicesearchresult", {
            "servicelist" : docs
        });
    //console.log(docs[0].cstmName);
    });
        

});


function indexright(req, res)
{
    if (!req.session.loginUser) {
        return res.redirect("/");
    }
}

module.exports = router;





