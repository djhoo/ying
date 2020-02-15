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



router.get('/customerview', function(req, res) {
    indexright(req, res);

    var db = req.db;
    var customer = db.get('customerlist');
    var name = decodeURI(req.query.name);
    var flag = req.query.flag;

    customer.find({cstmName:name},{},function(e,docs){
            res.render('customerview', {
                "customer" : docs,
                "flag" : flag,
            });
        
        //console.log(docs[0].ctrctId);
    });

//    res.render('customerview', { title: '客户与供应商',name:req.query.name});
});


router.get('/addcustomer', function(req, res) {
    indexright(req,res);
    
    res.render('addcustomer', { title: '新增客户与供应商' });
});

router.post('/addcustomer', upload.single('cstmAttach'), function(req, res) {
    indexright(req,res);
    
    var db = req.db;
    // Get our form values. These rely on the "name" attributes
    //var cstmId = req.body.cstmId;
    var file = req.file;
    var cstmName = req.body.cstmName;
    var cstmAddr = req.body.cstmAddr;
    var owner = req.body.owner;
    var cellno = req.body.cellno;
    var telno = req.body.telno;
    var mail = req.body.mail;
    var otherinfo = req.body.otherinfo;
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
    var custom = db.get('customerlist');

    // Submit to the DB
    custom.insert({
       // "cstmId" : cstmId,
        "cstmName" :cstmName,
        "cstmAddr" :cstmAddr,
        "otherinfo" : otherinfo,
        "attach":[{
            "originalname":originalname,
            "filename":filename,
            "path":path
        }],
        "contact":[{
                    "owner" : owner,
                    "cellno" : cellno,
                    "telno" : telno,
                    "mail" : mail
        }]
    }, function (err, doc) {
        if (err) {
            // If it failed, return error
            res.send("There was a problem adding the information to the database.");
        }
        else {
            // And forward to success page
            res.redirect("/addcontract");
        }
    });

});


/********************************************************************************/
//增加联系人内容
/********************************************************************************/
router.get('/addcontact', function(req, res) {
    if (!req.session.loginUser) {
        return res.redirect("/");
    }

    var cstmName = decodeURIComponent(req.query.cstmName);
    var flag = req.query.flag;
    res.render('addcontact', { title: '增加联系人',cstmName:encodeURIComponent(req.query.cstmName),flag:flag});
});

router.post('/addcontact', function(req, res) {
    if (!req.session.loginUser) {
        return res.redirect("/");
    }

    var flag = req.query.flag;
    var cstmName = decodeURIComponent(req.query.cstmName);

    var owner = req.body.owner;
    var cellno = req.body.cellno;
    var telno = req.body.telno;
    var mail = req.body.mail;
//    console.log('cstmName:'+ mail);
    var db = req.db;
    var customer = db.get('customerlist');
    // update to the DB
    
    customer.update({"cstmName" : cstmName}, 
            {$push:{"contact":{
                    "owner" : owner,
                    "cellno" : cellno,
                    "telno" : telno,
                    "mail" : mail,
                }}},
            function (err, doc) {
            if (err) {
                // If it failed, return error
                res.send("There was a problem adding the information to the database.");
                return;
            }
            else {
                res.redirect("customerview?name="+encodeURIComponent(cstmName)+"&flag="+flag);
            }
    });   
});

/********************************************************************************/
//变更联系人内容
/********************************************************************************/
router.get('/updatecontact', function(req, res) {
    if (!req.session.loginUser) {
        return res.redirect("/");
    }

    var cstmName = decodeURIComponent(req.query.cstmName);
    var number = req.query.number;
    var flag = req.query.flag;
    var db = req.db;
    var customer = db.get('customerlist');
    customer.find({cstmName:cstmName},{},function(e,docs){
            res.render('updatecontact', {
                "customer" : docs,
                "flag" : flag,
                "number":number,
            });
        
        //console.log(docs[0].ctrctId);
    });
});
router.post('/updatecontact', function(req, res) {
    if (!req.session.loginUser) {
        return res.redirect("/");
    }

    var cstmName = decodeURIComponent(req.query.cstmName);
    var number = req.query.number;
    var flag = req.query.flag;
    var cellno = req.body.cellno;
    var telno = req.body.telno;
    var mail = req.body.mail;

    var db = req.db;
    var customer = db.get('customerlist');
    customer.find({cstmName:cstmName},{},function(e,docs){
            
        customer.update({"cstmName" : cstmName,"contact.owner":docs[0].contact[number].owner}, 
           {$set:{
                        "contact.$.cellno":cellno,
                        "contact.$.telno":telno,
                        "contact.$.mail":mail,
            }},{upset:true},
             function(error, result){
            if (error) {
              console.log('updategather  Error:'+ error);
            }else{
               res.redirect("customerview?name="+encodeURIComponent(cstmName)+"&flag="+flag);
            }
        });
        //console.log(docs[0].ctrctId);
    });
});



/********************************************************************************/
//删除联系人
/********************************************************************************/
router.post('/deletecontact', function(req, res) {
    indexright(req,res);

    var cstmName = decodeURIComponent(req.query.cstmName);
    var owner = decodeURIComponent(req.query.owner);


    var db = req.db;
    var customer = db.get('customerlist');

    customer.update({"cstmName" : cstmName}, 
        {$pull:{"contact":
            {"owner":owner}
        }},
         function(error, result){
        if (error) {
          console.log('deletepurchase update salse Error:'+ error);
        }else{
          res.redirect("customerview?name="+encodeURIComponent(cstmName)+"&flag=1");
        }
    });

});






function indexright(req, res)
{
    if (!req.session.loginUser) {
        return res.redirect("/");
    }
}

module.exports = router;





