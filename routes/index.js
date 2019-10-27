var express = require('express');
var multer = require ('multer');  
var router = express.Router();
var upload = multer({ dest:  "upload/" });  
var xlsx2json = require("node-xlsx");
var fs = require("fs"); 
var moment = require('moment');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: '登录' });
});

router.post('/', function(req,res,next){  
    const crypto = require("crypto"); 
    var user={  
        username:'admin',  
        password:'7e8c928a8cfc1487a23bffc41a033b4e'  
    };
    var user2={
        username:'user01',  
        password:'711769e03242b20d55f9182ff14d9b47'
    }
    var user3={
        username:'david',  
        password:'7003a13fbf3c3c98687daef1add996e6'
    }
    let md5 = crypto.createHash("md5");
    let newPass = md5.update(req.body.password).digest("hex");

    if(req.body.username==user.username && newPass==user.password){  
        req.session.regenerate(function(err) {
            if(err){
                return res.json({ret_code: 2, ret_msg: '登录失败'});                
            }
            
            req.session.loginUser = user.username;
            //res.json({ret_code: 0, ret_msg: '登录成功'});
            res.redirect('contractindex');                            
        });     
    }
    else if(req.body.username==user2.username && newPass==user2.password){  
        req.session.regenerate(function(err) {
            if(err){
                return res.json({ret_code: 2, ret_msg: '登录失败'});                
            }
            
            req.session.loginUser = user2.username;
            //res.json({ret_code: 0, ret_msg: '登录成功'});
            res.redirect('contractindex');                            
        });     
    }
    else if(req.body.username==user3.username && newPass==user3.password){  
        req.session.regenerate(function(err) {
            if(err){
                return res.json({ret_code: 2, ret_msg: '登录失败'});                
            }
            
            req.session.loginUser = user3.username;
            //res.json({ret_code: 0, ret_msg: '登录成功'});
            res.redirect('contractindex');                            
        });     
    }
    else{ 
        res.redirect('/');
    }  
})  

router.get('/contractindex', function(req, res, next) {
    res.render('contractindex', { title: '系统选择' });
  });

/*
router.get('/helloworld', function(req, res, next) {
  res.render('helloworld', { title: 'helloworld!!' });
});
*/
router.get('/helloworld', function(req, res) {
    res.render('helloworld', { title: 'Hello, World!' });
});

//add by houdejun
/* GET Userlist page. */
router.get('/userlist', function(req, res) {
    var db = req.db;
    var collection = db.get('usercollection');
    collection.find({},{},function(e,docs){
        res.render('userlist', {
            "userlist" : docs
        });
    });
});

/* GET New User page. */
router.get('/newuser', function(req, res) {
    res.render('newuser', { title: 'Add New User' });
});

/* POST to Add User Service */
router.post('/adduser', function(req, res) {

    // Set our internal DB variable
    var db = req.db;

    // Get our form values. These rely on the "name" attributes
    var userName = req.body.username;
    var userEmail = req.body.useremail;

    // Set our collection
    var collection = db.get('usercollection');

    // Submit to the DB
    collection.insert({
        "username" : userName,
        "email" : userEmail
    }, function (err, doc) {
        if (err) {
            // If it failed, return error
            res.send("There was a problem adding the information to the database.");
        }
        else {
            // And forward to success page
            res.redirect("userlist");
        }
    });
});



/********************************************/
router.get('/salescontract', function(req, res) {
    if (!req.session.loginUser) {
        return res.redirect("/");
    }
    //console.log(req.session.loginUser);
    var db = req.db;
    var sales = db.get('salescontract');
    //console.log(sales);
    
    sales.find({},{},function(e,docs){
        res.render('salescontract', {
            "saleslist" : docs,
            "uid":req.session.loginUser
        });
        //console.log(docs[0].ctrctId);
    });
});

/********************************************/
router.get('/salescontract_boot', function(req, res) {
    if (!req.session.loginUser) {
        return res.redirect("/");
    }
    //console.log(req.session.loginUser);
    var db = req.db;
    var sales = db.get('salescontract');
    //console.log(sales);
    
    //sales.find({},{sort: {ctrctEndTime:1}},function(e,docs){
    //sales.find({}).sort({"ctrctId":1}).toArray(function(e,docs){
    sales.find({},null,function(e,docs){
   
        res.render('salescontract_boot', {
            "saleslist" : docs,
            "uid":req.session.loginUser
        });

        //console.log(docs[0].ctrctId);
    });
});

router.get('/addcontract', function(req, res) {
    if (!req.session.loginUser) {
        return res.redirect("/");
    }
    var db = req.db;
    var customer = db.get('customerlist');
    customer.find({},{},function(e,docs){
        res.render('addcontract', {
            "customer" : docs
        });
        //console.log(docs[0].ctrctId);
    });
});

router.post('/addcontract', upload.single('attach1'), function(req, res) {
    if (!req.session.loginUser) {
        return res.redirect("/");
    }
    var db = req.db;
    var file = req.file;
    // Get our form values. These rely on the "name" attributes
    var ctrctId = decodeURIComponent(req.body.ctrctId);
    var ctrctOwner = req.body.ctrctOwner;
    var cstmName = req.body.cstmName;
    var ctrctValue = req.body.ctrctValue;
    var ctrctTime = req.body.ctrctTime;
    var ctrctEndTime = req.body.ctrctEndTime;
    var ctrctBrief = req.body.ctrctBrief;
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
    var sales = db.get('salescontract');

    // Submit to the DB
    sales.insert({
        "ctrctId" : ctrctId,
        "ctrctOwner" : ctrctOwner,
        "cstmName" : cstmName,
        "ctrctValue" : ctrctValue,
        "ctrctGross" : ctrctValue,
        "ctrctTime" : ctrctTime,
        "ctrctEndTime" : ctrctEndTime,
        "ctrctStatus":"进行中",
        "ctrctBrief" : ctrctBrief,
        "billtotalvalue":0,     //发票状态 累计金额
        "gathertotalvalue":0,   //收款状态 累计金额
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
            res.redirect("salescontract_boot");
        }
    });
});

router.get('/addcustomer', function(req, res) {
    if (!req.session.loginUser) {
        return res.redirect("/");
    }
    res.render('addcustomer', { title: '新增客户与供应商' });
});

router.post('/addcustomer', upload.single('cstmAttach'), function(req, res) {
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
    /*
    var owner2 = req.body.owner2;
    var cellno2 = req.body.cellno2;
    var telno2 = req.body.telno2;
    var mail2 = req.body.mail2;
    */
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
        /*
        "owner" : owner,
        "cellno" : cellno,
        "telno" : telno,
        "mail" : mail,
        "owner2" : owner2,
        "cellno2" : cellno2,
        "telno2" : telno2,
        "mail2" : mail2,
        */
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
            res.redirect("addcontract");
        }
    });

     // update to the DB
     /*
        custom.update({"cstmName" : cstmName}, 
            {$push:{"contact":{
                    "owner" : owner,
                    "cellno" : cellno,
                    "telno" : telno,
                    "mail" : mail
                }}},
            function (err, doc) {
            if (err) {
                // If it failed, return error
                res.send("There was a problem adding the information to the database.");
                return;
            }
            else {
                res.redirect("addcontract");
            }
        });
    */
});

router.get('/contractdetail', function(req, res) {
    if (!req.session.loginUser) {
        return res.redirect("/");
    }
    var db = req.db;
    var sales = db.get('salescontract');
    var id = decodeURIComponent(req.query.id);
    
    console.log(id);
    sales.find({'ctrctId':id},{},function(e,docs){
        if(docs.length == 0){
                res.render('helloworld');
                return;
        };
        res.render('contractdetail', {
            "saleslist" : docs,
            "uid":req.session.loginUser
        });
        //console.log(docs[0].ctrctId);
    });

    //res.render('contractdetail', { title: '销售合同细节',id:req.query.id });
});

router.get('/addbill', function(req, res) {
    if (!req.session.loginUser) {
        return res.redirect("/");
    }
    res.render('addbill', { title: '新增发票',id:encodeURIComponent(req.query.id)});
});


router.post('/addbill', function(req, res) {
    var db = req.db;
    var id = decodeURIComponent(req.query.id);
    // Get our form values. These rely on the "name" attributes
    var billvalue = req.body.billvalue;
    var billno = req.body.billno;
    var billowner = req.body.billowner;
    var billsheet = req.body.billsheet;
    var billtime = req.body.billtime;
    var billtotalvalue = 0;

    // Set our collection
    var sales = db.get('salescontract');
    //console.log(id);
    //get billtotalvalue 
    sales.find({'ctrctId':id},{},function(e,docs){
        if(docs[0].billtotalvalue != null){
            billtotalvalue = parseFloat(docs[0].billtotalvalue);
        }

        // update to the DB
        sales.update({"ctrctId" : id}, 
            {$push:{"bill":{
                    "billvalue":billvalue,
                    "billno":billno,
                    "billowner":billowner,
                    "billsheet":billsheet,
                    "billtime":billtime,
                }}},
            function (err, doc) {
            if (err) {
                // If it failed, return error
                res.send("There was a problem adding the information to the database.");
                return;
            }
            else {
                
            }
        });

        billtotalvalue = billtotalvalue + parseFloat(billvalue);

        //update   billtotalvalue  to db
        sales.update({"ctrctId" : id}, 
            {$set:{"billtotalvalue":billtotalvalue}},
            function (err, doc) {
            if (err) {
                // If it failed, return error
                res.send("There was a problem adding the information to the database.");
                return;
            }
            else {
                // And forward to success page
                res.redirect("contractdetail?id="+encodeURIComponent(id));
            }
        });
    });
});

router.get('/addgather', function(req, res) {
    if (!req.session.loginUser) {
        return res.redirect("/");
    }
    res.render('addgather', { title: '新增收款',id:encodeURIComponent(req.query.id)});
});

router.post('/addgather', function(req, res) {
    var db = req.db;
    var id = decodeURIComponent(req.query.id);
    // Get our form values. These rely on the "name" attributes
    var gathervalue = req.body.gathervalue;
    var gathertime = req.body.gathertime;
    var gathertotalvalue = 0;

    // Set our collection
    var sales = db.get('salescontract');

    //get billtotalvalue 
    sales.find({"ctrctId" : id},{},function(e,docs){
        if(docs[0].gathertotalvalue != null){
            gathertotalvalue = parseFloat(docs[0].gathertotalvalue);
        }
       
        // update to the DB
        sales.update({"ctrctId" : id}, 
            {$push:{"gather":{
                    "gathervalue":gathervalue,
                    "gathertime":gathertime,
                }}},
            function (err, doc) {
            if (err) {
                // If it failed, return error
                res.send("There was a problem adding the information to the database.");
                return;
            }
            else {
                
            }
        });

        gathertotalvalue = parseFloat(gathervalue) + gathertotalvalue;

        //update   billtotalvalue   tp db
        sales.update({"ctrctId" : id}, 
            {$set:{"gathertotalvalue":gathertotalvalue}},
            function (err, doc) {
            if (err) {
                // If it failed, return error
                res.send("There was a problem adding the information to the database.");
                return;
            }
            else {
                // And forward to success page
                res.redirect("contractdetail?id="+encodeURIComponent(id));
            }
        });

    });

});

router.get('/addmaterial', function(req, res) {
    if (!req.session.loginUser) {
        return res.redirect("/");
    }
    res.render('addmaterial', { title: '新增实物交付',id:encodeURIComponent(req.query.id)});
});

router.post('/addmaterial', upload.single('xls'), function(req, res) {
//router.post('/addmaterial', function(req, res) {
    var db = req.db;
    var id = decodeURIComponent(req.query.id);
    var flag = req.query.flag;

    if(flag == 1){
        // Get our form values. These rely on the "name" attributes
        var unittype = req.body.unittype;
        var serialno = req.body.serialno;
        var mac = req.body.mac;
        var endtime = req.body.endtime;
        var deliverytime = req.body.deliverytime;
        var deliveryno = req.body.deliveryno;
        var sender = req.body.sender;

        // Set our collection
        var sales = db.get('salescontract');

        // update to the DB
        sales.update({"ctrctId" : id}, 
            {$push:{"material":{
                    "unittype":unittype,
                    "serialno":serialno,
                    "mac":mac,
                    "endtime":endtime,
                    "deliverytime":deliverytime,
                    "deliveryno":deliveryno,
                    "sender":sender
                }}},
            function (err, doc) {
            if (err) {
                // If it failed, return error
                res.send("There was a problem adding the information to the database.");
                return;
            }
            else {
                res.redirect("contractdetail?id="+encodeURIComponent(id));
            }
        });
    }
    else{//flag == 2
    
        var file = req.file;
        
        console.log(file.mimetype);
        console.log('原始文件名：%s', file.originalname);
        /*console.log('原始文件名：%s', file.name);
        console.log('文件大小：%s', file.size);
        console.log('文件保存路径：%s', file.path);
        var date = new Date(1900, 0, dateVal - 1);
       */
        var list = xlsx2json.parse(file.path);   
        var a = JSON.stringify(list);
        console.log(a);

        var sheet;
        var sheetArray  = [];
        
        //批量导入XLS文件
        for(var i=1; i < list[0].data.length; i++) {
            var row = {};        
            row["unittype"] = list[0].data[i][1];
            row["serialno"] = list[0].data[i][2];
            row["mac"] =        list[0].data[i][3];
            var date = new Date(1900, 0, list[0].data[i][4]-1);
            var date1=moment(date).format("YYYY/MM/DD");
            row["endtime"] =   date1; 
            
            date = new Date(1900, 0, list[0].data[i][5]-1);
            date1=moment(date).format("YYYY/MM/DD");
            row["deliverytime"] = date1;
            row["deliveryno"] = list[0].data[i][6];
            row["sender"] =     list[0].data[i][7];
            sheetArray.push(row);
        }
        // Set our collection
        var sales = db.get('salescontract');

        // update to the DB
        sales.update({"ctrctId" : id}, 
            {$pushAll:{"material":sheetArray}},
            function (err, doc) {
            if (err) {
                // If it failed, return error
                res.send("There was a problem adding the information to the database.");
                return;
            }
            else {
                res.redirect("contractdetail?id="+encodeURIComponent(id));
            }
        });
       

        fs.unlink(file.path,function(err){
            if(err){
                throw err;
            }
        });

    }
        
});
/**************************************************************/
//把xls文字转换成json
/**************************************************************/
/*
function praseExcel(list)
{
    console.log("qqq");
    for (var i = 0; i < list.length; i++) 
    {
         var excleData = list[i].data;
         var sheetArray  = [];
         var typeArray =  excleData[1];
         var keyArray =  excleData[2];
        for (var j = 3; j < excleData.length ; j++)
        {
             var curData = excleData[j];
             if(curData.length == 0) continue;
             var item = changeObj(curData,typeArray,keyArray);
             sheetArray.push(item);
        }
        if(sheetArray.length >0) 
        writeFile(list[i].name+".json",JSON.stringify(sheetArray));
    }
   console.log("qqq");
}
//转换数据类型
function changeObj(curData,typeArray,keyArray)
{
     var obj = {};
    for (var i = 0; i < curData.length; i++) 
    {
        //字母 
        obj[keyArray[i]] = changeValue(curData[i],typeArray[i]);  
    }
    return obj;
}
function changeValue(value,type)
{
    if(value == null || value =="null") return ""
    if(type =="int") return Math.floor(value);
    if(type =="Number") return value;
    if(type =="String") return value;  
}
*/
/**************************************************************/
/********************************************/
router.get('/purchasecontract_boot', function(req, res) {
    if (!req.session.loginUser) {
        return res.redirect("/");
    }
    //console.log(req.session.loginUser);
    var db = req.db;
    var purchase = db.get('purchasecontract');
    //console.log(sales);
    
    //sales.find({},{sort: {ctrctEndTime:1}},function(e,docs){
    //sales.find({}).sort({"ctrctId":1}).toArray(function(e,docs){
        purchase.find({},null,function(e,docs){
   
        res.render('purchasecontract_boot', {
            "purchaselist" : docs,
            "uid":req.session.loginUser
        });

        //console.log(docs[0].ctrctId);
    });
});

/**************************************************************/
/**************************************************************/
router.get('/addpurchase', function(req, res) {
    if (!req.session.loginUser) {
        return res.redirect("/");
    }
    var db = req.db;
    //var owner = req.query.owner;
    var customer = db.get('customerlist');
    customer.find({},{},function(e,docs){
        res.render('addpurchase', {
            "customer" : docs,
            id:encodeURIComponent(req.query.id),
            owner:req.query.owner
        });
        //console.log(docs[0].ctrctId);
    });
    //res.render('addpurchase', { title: '新增采购合同',id:req.query.id});
});

router.post('/addpurchase', upload.single('attachpur'), function(req, res) {
    var db = req.db;
    var id = decodeURIComponent(req.query.id);
    var owner = decodeURI(req.query.owner);
    var file = req.file;
    // Get our form values. These rely on the "name" attributes
    var purchsId = decodeURIComponent(req.body.purchsId);
    var purchsName = req.body.purchsName;
    var purchsValue = req.body.purchsValue;
    var purchsTime = req.body.purchsTime;
    var purchsBrief = req.body.purchsBrief;
    var originalname;
    var filename;
    var path;
    var purchsOwner;
    if(owner == "0"){
        purchsOwner = req.body.purchsOwner;
    }
    else{
        purchsOwner = owner;
    }

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
    var purchase = db.get('purchasecontract');

    // Submit to the DB
    //增加采购本身的数据内容
    purchase.insert({
        "purchsId" : purchsId,
        "purchsOwner" : purchsOwner,
        "purchsName" : purchsName,
        "purchsValue" : purchsValue,
        "purchsTime" : purchsTime,
        "purchsBrief" : purchsBrief,
        "purchsStatus":"进行中",
        "billtotalvalue":0,     //发票状态 累计金额
        "paytotalvalue":0,   //付款状态 累计金额
        "attach":[{
            "originalname":originalname,
            "filename":filename,
            "path":path
        }]

    }, function (err, doc) {
        if (err) {
            // If it failed, return error
            res.send("There was a problem adding the information to the database.");
            return;
        }
        else {
            // And forward to success page
        }
    });

    // id=0表明这个增加的采购不和任何一个销售合同挂钩
    if(id == 0){
        res.redirect("purchasecontract_boot");
        return;
    }

    // 查询当前销售，把当前销售的对应内容，增加到采购合同的里面去
    var sales = db.get('salescontract');
    sales.find({"ctrctId" : id},{},function(e,docs){

        purchase.update({"purchsId" : purchsId}, 
            {$push:{"sales":{
                    "ctrctId":docs[0].ctrctId,
                    "cstmName":docs[0].cstmName,
                    "ctrctBrief":docs[0].ctrctBrief,
                }}},
            function (err, doc) {
            if (err) {
                // If it failed, return error
                res.send("There was a problem adding the information to the database.");
                return;
            }
            else {
            }
        });
    });

    // 把增加的采购，增加到销售里面去
    sales.update({"ctrctId" : id}, 
        {$push:{"purchase":{
                "purchsId":purchsId,
                "purchsName":purchsName,
                "purchsValue":purchsValue,
                "purchsTime":purchsTime,
                "purchsBrief":purchsBrief
            }}},
        function (err, doc) {
        if (err) {
            // If it failed, return error
            res.send("There was a problem adding the information to the database.");
            return;
        }
        else {

            //查找当前销售的所有采购合同金额，合计，算出当前销售的毛利率
            sales.find({"ctrctId" : id},{},function(e,docs){

                var ctrctgross = 0;
                var purchstotalvalue = 0;
                if(docs[0].purchase != null){
                   for(var i in docs[0].purchase){
                        purchstotalvalue = parseFloat(docs[0].purchase[i].purchsValue) + parseFloat(purchstotalvalue);
                    }
                }
                ctrctgross = parseFloat(docs[0].ctrctValue) - parseFloat(purchstotalvalue);

                 //update   合同毛利率 to db
                sales.update({"ctrctId" : id}, 
                    {$set:{"ctrctGross":ctrctgross}},
                    function (err, doc) {
                    if (err) {
                        // If it failed, return error
                        res.send("There was a problem adding the information to the database.");
                        return;
                    }
                    else {
                        // And forward to success page
                        //res.redirect("purchasedetail?id="+id);
                    }
                });
            });
            res.redirect("contractdetail?id="+encodeURIComponent(id));
        }
    });


});

/*********************************************************************/
/*********************************************************************/
/*********************************************************************/
router.get('/purchasedetail', function(req, res) {
    if (!req.session.loginUser) {
        return res.redirect("/");
    }
    var db = req.db;
    var purchase = db.get('purchasecontract');
    var id = decodeURIComponent(req.query.id);
    purchase.find({'purchsId':id},{},function(e,docs){
        if(e){
            console.log(e);
        }
        else{
            console.log(docs.length);
            if(docs.length == 0){
                res.render('helloworld');
                return;
            }
            res.render('purchasedetail', {
                "purchaselist" : docs
            });
        }
        //console.log(docs[0].ctrctId);
    });
});

router.get('/addpurchasebill', function(req, res) {
    if (!req.session.loginUser) {
        return res.redirect("/");
    }
    res.render('addpurchasebill', { title: '新增采购发票',id:encodeURIComponent(req.query.id)});
});


router.post('/addpurchasebill', function(req, res) {
    var db = req.db;
    var id = decodeURIComponent(req.query.id);
    // Get our form values. These rely on the "name" attributes
    var billvalue = req.body.billvalue;
    var billno = req.body.billno;
    var billtime = req.body.billtime;
    var billtotalvalue = 0;


    // Set our collection
    var purchase = db.get('purchasecontract');
    //console.log(id);
    //get billtotalvalue 
    purchase.find({'purchsId':id},{},function(e,docs){
        if(docs[0].billtotalvalue != null){
            billtotalvalue = parseFloat(docs[0].billtotalvalue);
        }

        // update to the DB
        purchase.update({"purchsId" : id}, 
            {$push:{"bill":{
                    "billvalue":billvalue,
                    "billno":billno,
                    "billtime":billtime,
                }}},
            function (err, doc) {
            if (err) {
                // If it failed, return error
                res.send("There was a problem adding the information to the database.");
                return;
            }
            else {
                
            }
        });

        billtotalvalue = billtotalvalue + parseFloat(billvalue);

        //update   billtotalvalue   to db
        purchase.update({"purchsId" : id}, 
            {$set:{"billtotalvalue":billtotalvalue}},
            function (err, doc) {
            if (err) {
                // If it failed, return error
                res.send("There was a problem adding the information to the database.");
                return;
            }
            else {
                // And forward to success page
                res.redirect("purchasedetail?id="+encodeURIComponent(id));
            }
        });
    });
});

router.get('/addpay', function(req, res) {
    if (!req.session.loginUser) {
        return res.redirect("/");
    }
    res.render('addpay', { title: '新增付款',id:encodeURIComponent(req.query.id)});
});

router.post('/addpay', function(req, res) {
    var db = req.db;
    var id = decodeURIComponent(req.query.id);
    // Get our form values. These rely on the "name" attributes
    var payvalue = req.body.payvalue;
    var paytime = req.body.paytime;
    var paytotalvalue = 0;

    // Set our collection
    var purchase = db.get('purchasecontract');

    //get billtotalvalue 
    purchase.find({"purchsId" : id},{},function(e,docs){
        if(docs[0].paytotalvalue != null){
            paytotalvalue = parseFloat(docs[0].paytotalvalue);
        }
        
        // update to the DB
        purchase.update({"purchsId" : id}, 
            {$push:{"pay":{
                    "payvalue":payvalue,
                    "paytime":paytime,
                }}},
            function (err, doc) {
            if (err) {
                // If it failed, return error
                res.send("There was a problem adding the information to the database.");
                return;
            }
            else {
                
            }
        });

        paytotalvalue = parseFloat(payvalue) + paytotalvalue;


        //update   billtotalvalue to db
        purchase.update({"purchsId" : id}, 
            {$set:{"paytotalvalue":paytotalvalue}},
            function (err, doc) {
            if (err) {
                // If it failed, return error
                res.send("There was a problem adding the information to the database.");
                return;
            }
            else {
                // And forward to success page
                res.redirect("purchasedetail?id="+encodeURIComponent(id));
            }
        });

    });

});

router.get('/addpurchasematerial', function(req, res) {
    if (!req.session.loginUser) {
        return res.redirect("/");
    }
    res.render('addpurchasematerial', { title: '新增采购实物交付',id:encodeURIComponent(req.query.id)});
});

router.post('/addpurchasematerial', function(req, res) {
    var db = req.db;
    var id = decodeURIComponent(req.query.id);
    // Get our form values. These rely on the "name" attributes
    var unittype = req.body.unittype;
    var serialno = req.body.serialno;
    var mac = req.body.mac;
    var endtime = req.body.endtime;
    var deliverytime = req.body.deliverytime;

    // Set our collection
    var purchase = db.get('purchasecontract');
    // update to the DB
    purchase.update({"purchsId" : id}, 
        {$push:{"material":{
                "unittype":unittype,
                "serialno":serialno,
                "mac":mac,
                "endtime":endtime,
                "deliverytime":deliverytime
            }}},
        function (err, doc) {
        if (err) {
            // If it failed, return error
            res.send("There was a problem adding the information to the database.");
            return;
        }
        else {
            res.redirect("purchasedetail?id="+encodeURIComponent(id));
        }
    });
        
});
/******************************************************/
//add comment
router.get('/addcomment1', function(req, res) {
    if (!req.session.loginUser) {
        return res.redirect("/");
    }
    res.render('addcomment1', { title: '新增备注',id:encodeURIComponent(req.query.id)});
});

router.post('/addcomment1', function(req, res) {
    var db = req.db;
    var id = decodeURIComponent(req.query.id);
    // Get our form values. These rely on the "name" attributes
    var content = req.body.content;
    // Set our collection
   
    var sales = db.get('salescontract');
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
    sales.update({"ctrctId" : id}, 
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
            
            res.redirect("contractdetail?id="+encodeURIComponent(id));
        }
    });
        
});

router.get('/addcomment2', function(req, res) {
    if (!req.session.loginUser) {
        return res.redirect("/");
    }
    res.render('addcomment2', { title: '新增备注',id:encodeURIComponent(req.query.id)});
});

router.post('/addcomment2', function(req, res) {
    var db = req.db;
    var id = decodeURIComponent(req.query.id);
    // Get our form values. These rely on the "name" attributes
    var content = req.body.content;
    // Set our collection
    var purchase = db.get('purchasecontract');
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
    purchase.update({"purchsId" : id}, 
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
            res.redirect("purchasedetail?id="+encodeURIComponent(id));
        }
    });
        
});


/********************************************************************************/
/********************************************************************************/
/********************************************************************************/

/*search*/
router.get('/search', function(req, res) {
    if (!req.session.loginUser) {
        return res.redirect("/");
    }
    var db = req.db;
    var customer = db.get('customerlist');
    customer.find({},{},function(e,docs){
        res.render('search', {
            "customer" : docs,
            title: '查找',
            flag:req.query.flag,
            "uid":req.session.loginUser
        });
        //console.log(docs[0].ctrctId);
    });
  //  res.render('search', { title: '查找',flag:req.query.flag});
});

router.post('/search', function(req, res) {
    var db = req.db;
    var flag = req.query.flag;
    // Get our form values. These rely on the "name" attributes
    var searchitem = req.body.searchitem;
    var content = req.body.content;
    //var content1 = req.body.content1;
    //var content2 = req.body.content2;
    var starttime1 = req.body.starttime1;
    var endtime1 = req.body.endtime1;
    var starttime2 = req.body.starttime2;
    var endtime2 = req.body.endtime2;
    var starttime3 = req.body.starttime3;
    var endtime3 = req.body.endtime3;
    var box1 = req.body.box1;
    var box2 = req.body.box2;
    
    if(searchitem == "name"){
        content = req.body.content1;
        console.log("cntent1");
    }
    else if(searchitem == "status"){
        content = req.body.content2;
    }

    console.log(content);
    console.log(box1);
    console.log(box2);
    
    var condition ={};
    if(flag == 1){
        if(content != ""){
            content = new RegExp(content+"+");
            condition1 = {'cstmName':content};
        }
        else{
            condition1 = {'cstmName':{"$exists":true}}
        }
        if((starttime1 != "") || ( endtime1 != "")){
            if(starttime1 == "")
            {
                starttime1 = '1950/01/01';
            }
            if(endtime1 == "")
            {
                endtime1 = '2099/01/01';
            }
            condition2 = {"ctrctTime":{"$gte":starttime1, "$lte":endtime1}};
        }
        else{
            condition2 = {'ctrctTime':{"$exists":true}}
        }
        if((starttime2 != "") && ( endtime2 != "")){
            if(starttime2 == "")
            {
                starttime2 = '1950/01/01';
            }
            if(endtime2 == "")
            {
                endtime2 = '2099/01/01';
            }
            condition3 = {"ctrctEndTime":{"$gte":starttime2, "$lte":endtime2}};
        }
        else{
            condition3 = {'ctrctEndTime':{"$exists":true}}
        }
        if(box1 == "on"){
           //condition4 = {'$where': "this.ctrctValue > this.gathertotalvalue"};
           condition = {'cstmName':condition1.cstmName, 'ctrctTime':condition2.ctrctTime, 'ctrctEndTime':condition3.ctrctEndTime,'$where': "this.ctrctValue > this.gathertotalvalue"};
        }
        else{
            //condition4 = {'ctrctEndTime':{"$exists":true}};
            condition = {'cstmName':condition1.cstmName, 'ctrctTime':condition2.ctrctTime, 'ctrctEndTime':condition3.ctrctEndTime};
        }


        //condition = {'cstmName':condition1.cstmName, 'ctrctTime':condition2.ctrctTime, 'ctrctEndTime':condition3.ctrctEndTime};


        console.log(condition);
    }
    else{//flag = 2采购
        if(content != ""){
            content = new RegExp(content+"+");
            condition1 = {'purchsName':content};
        }
        else{
            condition1 = {'purchsName':{"$exists":true}}
        }
        if((starttime3 != "") || ( endtime3 != "")){
            if(starttime3 == "")
            {
                starttime3 = '1950/01/01';
            }
            if(endtime3 == "")
            {
                endtime3 = '2099/01/01';
            }
            condition2 = {"purchsTime":{"$gte":starttime3, "$lte":endtime3}};
        }
        else{
            condition2 = {'purchsTime':{"$exists":true}}
        }
        //condition = {'purchsName':condition1.purchsName, 'purchsTime':condition2.purchsTime};
        if(box2 == "on"){
           //condition4 = {'$where': "this.ctrctValue > this.gathertotalvalue"};
           condition = {'purchsName':condition1.purchsName, 'purchsTime':condition2.purchsTime, '$where': "this.purchsValue > this.billtotalvalue"};
        }
        else{
            //condition4 = {'ctrctEndTime':{"$exists":true}};
            condition = {'purchsName':condition1.purchsName, 'purchsTime':condition2.purchsTime};
        }

        console.log(condition);
    }
    // Set our collection

    var dbname;
    if(flag == 1){
        dbname = db.get('salescontract');
        if(searchitem == "name"){
            
            dbname.find(condition,{},function(e,docs){
                res.render("searchresult1", {
                    "result" : docs
                });
            //console.log(docs[0].cstmName);
            });
        }
        if(searchitem == "id"){

            dbname.find({'ctrctId':content},{},function(e,docs){
                res.render('searchresult1', {
                  "result" : docs
                });
        //console.log(docs[0].ctrctId);
            });
        }
        if(searchitem == "status"){
    
            dbname.find({'ctrctStatus':content},{},function(e,docs){
                res.render('searchresult1', {
                    "result" : docs
                });
            });
        }
        if(searchitem == "serialno"){

            dbname.find({'material.serialno':content},{},function(e,docs){
                res.render('searchresult1', {
                    "result" : docs
                });
            });
        }
        if(searchitem == "mac"){

            dbname.find({'material.mac':content},{},function(e,docs){
                res.render('searchresult1', {
                    "result" : docs
                });
            });
        }

    }
    else{
        dbname = db.get('purchasecontract');
        if(searchitem == "name"){
         //   content = new RegExp(content+"+");
            dbname.find(condition,{},function(e,docs){
                res.render("searchresult2", {
                    "result" : docs
                });
            //console.log(docs[0].cstmName);
            });
        }
        if(searchitem == "id"){
          //  content = new RegExp(content+"+");
            dbname.find({'purchsId':content},{},function(e,docs){
                res.render('searchresult2', {
                  "result" : docs
                });
        //console.log(docs[0].ctrctId);
            });
        }
        if(searchitem == "status"){
          //  content = new RegExp(content+"+");
            dbname.find({'purchsStatus':content},{},function(e,docs){
                res.render('searchresult2', {
                    "result" : docs
                });
            });
        }
        if(searchitem == "serialno"){
         //   content = new RegExp(content+"+");
            dbname.find({'material.serialno':content},{},function(e,docs){
                res.render('searchresult2', {
                    "result" : docs
                });
            });
        }
        if(searchitem == "mac"){
        //    content = new RegExp(content+"+");
            dbname.find({'material.mac':content},{},function(e,docs){
                res.render('searchresult2', {
                    "result" : docs
                });
            });
        }
    } 
    
        
});

/********************************************************************************/
/********************************************************************************/
/********************************************************************************/
router.get('/customerview', function(req, res) {
    if (!req.session.loginUser) {
        return res.redirect("/");
    }

    var db = req.db;
    var customer = db.get('customerlist');
    var name = decodeURI(req.query.name);

    customer.find({cstmName:name},{},function(e,docs){
            res.render('customerview', {
                "customer" : docs
            });
        
        //console.log(docs[0].ctrctId);
    });

//    res.render('customerview', { title: '客户与供应商',name:req.query.name});
});

/********************************************************************************/
//上传附件
/********************************************************************************/
router.get('/addattach', function(req, res) {
    if (!req.session.loginUser) {
        return res.redirect("/");
    }
    res.render('addattach', { title: '上传附件',id:encodeURIComponent(req.query.id),flag:req.query.flag});
});

router.post('/addattach', upload.single('attach'), function(req, res) {
//router.post('/addmaterial', function(req, res) {
    var db = req.db;
    var id = decodeURIComponent(req.query.id);
    var flag = req.query.flag;
    var file = req.file;
    var sales = db.get('salescontract');
    var purchase = db.get('purchasecontract');

    console.log(file.mimetype);
    console.log('原始文件名：%s', file.originalname);
    console.log('原始文件名：%s', file.filename);
    console.log('文件大小：%s', file.size);
    console.log('文件保存路径：%s', file.path);
    console.log('id：%s', id);
    
    if(flag == 1){
         // update to the DB
        sales.update({"ctrctId" : id}, 
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
                
                res.redirect("contractdetail?id="+encodeURIComponent(id));
            }
        });
    }
    else{//采购的时候flag=2
          // update to the DB
        purchase.update({"purchsId" : id}, 
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
                res.redirect("purchasedetail?id="+encodeURIComponent(id));
            }
        });  
    }

});

router.get('/download', function(req, res){
    var flag = req.query.flag;
    var name = req.query.name;
    var filename = "upload/"+name;

    var db = req.db;
    if(flag == 1){
        var sales = db.get('salescontract');
        sales.find({"attach.filename" : name},{},function(e,docs){
            console.log('文件名称：%s', docs[0].attach[0].originalname);
            for(var i in docs[0].attach){
                if(docs[0].attach[i].filename == name){
                    res.download(filename,docs[0].attach[i].originalname); 
                }
            }
            //res.download(filename,docs[0].attach[0].originalname); 
        });
    }
    else if(flag == 2){
        var sales = db.get('purchasecontract');
        sales.find({"attach.filename" : name},{},function(e,docs){
            console.log('文件名称：%s', docs[0].attach[0].originalname);
            for(var i in docs[0].attach){
                if(docs[0].attach[i].filename == name){
                    res.download(filename,docs[0].attach[i].originalname); 
                }
            }
            //res.download(filename,docs[0].attach[0].originalname); 
        });
    }
    else{//flag ==3
        var sales = db.get('customerlist');
        sales.find({"attach.filename" : name},{},function(e,docs){
            console.log('文件名称：%s', docs[0].attach[0].originalname);
            for(var i in docs[0].attach){
                if(docs[0].attach[i].filename == name){
                    res.download(filename,docs[0].attach[i].originalname); 
                }
            }
            //res.download(filename,docs[0].attach[0].originalname); 
        });
    }

});

/********************************************************************************/
//变更销售合同
/********************************************************************************/
router.get('/updatecontract', function(req, res) {
    if (!req.session.loginUser) {
        return res.redirect("/");
    }
    var id = decodeURIComponent(req.query.id);
    var db = req.db;
    var sales = db.get('salescontract');
    //console.log(sales);
    
    sales.find({"ctrctId" : id},{},function(e,docs){
        res.render('updatecontract', {
            "saleslist" : docs,
            title: '变更销售合同'
        });
        //console.log(docs[0].ctrctId);
    });
    //res.render('updatecontract', { title: '变更销售合同'});
});

router.post('/updatecontract', function(req, res) {
    if (!req.session.loginUser) {
        return res.redirect("/");
    }
    var db = req.db;
    var sales = db.get('salescontract');
    var purchase = db.get('purchasecontract');
    //console.log(sales);
    var ctrctId = decodeURIComponent(req.query.id);
    var ctrctValue = req.body.ctrctValue;
    var ctrctTime = req.body.ctrctTime;
    var ctrctEndTime = req.body.ctrctEndTime;
    var ctrctBrief = req.body.ctrctBrief;
    var ctrctStatus = req.body.ctrctStatus;
    var ctrctOwner = req.body.ctrctOwner;
    var ctrctGross ;

    sales.find({"ctrctId" : ctrctId},{},function(e,docs){
        //变更合同毛利
        console.log('docs[0].ctrctValue:'+ docs[0].ctrctValue);
        console.log('docs[0].ctrctGross:'+ docs[0].ctrctGross);
        ctrctGross = parseFloat(ctrctValue) - (parseFloat(docs[0].ctrctValue) - parseFloat(docs[0].ctrctGross));
        console.log('ctrctGross:'+ ctrctGross);
        sales.update({"ctrctId" : ctrctId}, 
            {$set:{
                "ctrctValue" : ctrctValue,
                "ctrctTime" : ctrctTime,
                "ctrctEndTime" : ctrctEndTime,
                "ctrctBrief" : ctrctBrief,
                "ctrctStatus" : ctrctStatus,
                "ctrctOwner":ctrctOwner,
                "ctrctGross":ctrctGross

                }},
             function (err, doc) {
                if (err) {
                    // If it failed, return error
                    res.send("There was a problem update the information to the database.");
                    return;
                }
                else {
                    // And forward to success page
                    res.redirect("contractdetail?id="+encodeURIComponent(ctrctId));
                }
            });
    });

    //查询该销售合同里面采购合同的ID
    sales.find({"ctrctId" : ctrctId},{},function(e,docs){
    //根据所有采购合同ID，把相关的采购合同的销售合同简介变更
        if(docs[0].purchase != null){
            for(var i in docs[0].purchase){
                purchase.update({"purchsId" : docs[0].purchase[i].purchsId},  
                    {$set:{
                        "sales.0.ctrctBrief":ctrctBrief,
                    }},{upsert: true}, 
                    function(error, result){
                    if (error) {
                      console.log('update salse and purchase Error:'+ error);
                    }else{
                    }
                });

            }
        }
    });

    //res.render('updatecontract', { title: '变更销售合同'});
});

/********************************************************************************/
//删除销售合同
/********************************************************************************/
router.post('/deletecontract', function(req, res) {
     if (!req.session.loginUser) {
        return res.redirect("/");
    }
    var ctrctId = decodeURIComponent(req.query.id);
    console.log(ctrctId);
    var db = req.db;
    var sales = db.get('salescontract');
    var purchase = db.get('purchasecontract');
    //查询该销售合同里面采购合同的ID
    sales.find({"ctrctId" : ctrctId},{},function(e,docs){
    //根据所有采购合同ID，把相关的采购合同删除
        if(docs[0].purchase != null){
            for(var i in docs[0].purchase){
                purchase.remove({"purchsId" : docs[0].purchase[i].purchsId},  function(error, result){
                    if (error) {
                      console.log('deletepurchsId Error:'+ error);
                    }else{
                    }
                });
            }
        }
    });

    sales.remove({"ctrctId" : ctrctId},  function(error, result){
        if (error) {
          console.log('deletecontract Error:'+ error);
        }else{
          res.redirect("salescontract_boot");
        }
    });

});

/********************************************************************************/
//变更采购合同
/********************************************************************************/
router.get('/updatepurchase', function(req, res) {
    if (!req.session.loginUser) {
        return res.redirect("/");
    }
    var id = decodeURIComponent(req.query.id);
    var db = req.db;
    var purchase = db.get('purchasecontract');
    //console.log(sales);
    
    purchase.find({"purchsId" : id},{},function(e,docs){
        res.render('updatepurchase', {
            "purchaselist" : docs,
            title: '变更采购合同'
        });
        //console.log(docs[0].ctrctId);
    });
    //res.render('updatecontract', { title: '变更销售合同'});
});

router.post('/updatepurchase', function(req, res) {
    if (!req.session.loginUser) {
        return res.redirect("/");
    }
    var db = req.db;
    var purchase = db.get('purchasecontract');
    //console.log(sales);
    var ctrctId = decodeURIComponent(req.query.ctrctId);
    var purchsId = decodeURIComponent(req.query.id);
    var purchsValue = req.body.purchsValue;
    var purchsTime = req.body.purchsTime;
    var purchsBrief = req.body.purchsBrief;
    var purchsStatus = req.body.purchsStatus;
    
    //更新采购合同的内容
    purchase.update({"purchsId" : purchsId}, 
        {$set:{
            "purchsValue" : purchsValue,
            "purchsTime" : purchsTime,
            "purchsBrief" : purchsBrief,
            "purchsStatus" : purchsStatus
            }},
         function (err, doc) {
            if (err) {
                // If it failed, return error
                res.send("There was a problem update the information to the database  aa.");
                return;
            }
            else {
                // And forward to success page
               // res.redirect("contractdetail?id="+ctrctId);
            }
        });
    //res.render('updatecontract', { title: '变更销售合同'});
    if(ctrctId == ""){
        res.redirect("purchasedetail?id="+encodeURIComponent(purchsId));
        return;
    }

    //更新销售合同的采购部分的内容
    var sales = db.get('salescontract');
    sales.update({"ctrctId" : ctrctId,"purchase.purchsId":purchsId}, 
        {$set:{
            "purchase.$.purchsValue" : purchsValue,
            "purchase.$.purchsTime" : purchsTime,
            "purchase.$.purchsBrief" : purchsBrief,
            }},{upset:true},
         function (err, doc) {
            if (err) {
                // If it failed, return error
                res.send("There was a problem update the information to the database  bb.");
                return;
            }
            else {
                //更新销售合同的毛利的内容
                //查找当前销售的所有采购合同金额，合计，算出当前销售的毛利率
                sales.find({"ctrctId" : ctrctId},{},function(e,docs){

                    var ctrctgross = 0;
                    var purchstotalvalue = 0;
                    if(docs[0].purchase != null){
                       for(var i in docs[0].purchase){
                            purchstotalvalue = parseFloat(docs[0].purchase[i].purchsValue) + parseFloat(purchstotalvalue);
                        }
                    }
                    ctrctgross = parseFloat(docs[0].ctrctValue) - parseFloat(purchstotalvalue);

                     //update   合同毛利率 to db
                    sales.update({"ctrctId" : ctrctId}, 
                        {$set:{"ctrctGross":ctrctgross}},
                        function (err, doc) {
                        if (err) {
                            // If it failed, return error
                            res.send("There was a problem adding the information to the database.");
                            return;
                        }
                        else {
                            
                        }
                    });
                });

                res.redirect("purchasedetail?id="+encodeURIComponent(purchsId));
            }
        });
});

/********************************************************************************/
//删除采购合同
/********************************************************************************/
router.post('/deletepurchase', function(req, res) {
     if (!req.session.loginUser) {
        return res.redirect("/");
    }
    var purchsId = decodeURIComponent(req.query.id);
    var ctrctId = decodeURIComponent(req.query.ctrctId);
    console.log(purchsId);
    console.log(ctrctId);
    var db = req.db;
    var purchase = db.get('purchasecontract');
    purchase.remove({"purchsId" : purchsId},  function(error, result){
        if (error) {
          console.log('deletecontract Error:'+ error);
        }else{
       //   res.redirect("salescontract");
        }
    });

    if(ctrctId == 0){
        res.redirect("purchasecontract_boot");
        return;
    }

    var sales = db.get('salescontract');
    sales.update({"ctrctId" : ctrctId}, 
        {$pull:{"purchase":
            {"purchsId":purchsId}
        }},
         function(error, result){
        if (error) {
          console.log('deletepurchase update salse Error:'+ error);
        }else{
            res.redirect("purchasecontract_boot");
        }
    });

});
/********************************************************************************/
//变更销售合同的发票内容
/********************************************************************************/
router.get('/updatebill', function(req, res) {
    if (!req.session.loginUser) {
        return res.redirect("/");
    }
    var ctrctId = decodeURIComponent(req.query.id);
    var flag = req.query.flag;
    var db = req.db;
    var sales = db.get('salescontract');
    sales.find({"ctrctId" : ctrctId},{},function(e,docs){
        res.render('updatebill', {
            "saleslist" : docs,
            flag:req.query.flag,
            title: '变更发票'
        });
        //console.log(docs[0].ctrctId);
    });
    //res.render('updatecontract', { title: '变更销售合同'});
});


router.post('/updatebill', function(req, res) {
     if (!req.session.loginUser) {
        return res.redirect("/");
    }
    var ctrctId = decodeURIComponent(req.query.id);
    var flag = req.query.flag;
    var billvalue = req.body.billvalue;
    var billno = req.body.billno;
    var billowner = req.body.billowner;
    var billsheet = req.body.billsheet;
    var billtime = req.body.billtime;

    var billvaluebef;
    var billnobef;
    var billownerbef;
    var billsheetbef;
    var billtimebef;

    var billtotalvalue = 0;

    var db = req.db;
    var sales = db.get('salescontract');
    sales.find({'ctrctId':ctrctId},{},function(e,docs){
        if(docs.length == 0){
                res.render('helloworld');
                return;
        };
 
        billtotalvalue = parseFloat(docs[0].billtotalvalue);
        billvaluebef = docs[0].bill[flag].billvalue;
        billnobef = docs[0].bill[flag].billno;
        billownerbef = docs[0].bill[flag].billowner;
        billsheetbef = docs[0].bill[flag].billsheet;
        billtimebef = docs[0].bill[flag].billtime;
 
        sales.update({"ctrctId" : ctrctId,"bill.billvalue":billvaluebef,"bill.billno":billnobef,
                        "bill.billowner":billownerbef,"bill.billsheet":billsheetbef,"bill.billtime":billtimebef}, 
           {$set:{
                        "bill.$.billvalue":billvalue,
                        "bill.$.billno":billno,
                        "bill.$.billowner":billowner,
                        "bill.$.billsheet":billsheet,
                        "bill.$.billtime":billtime
            }},{upset:true},
             function(error, result){
            if (error) {
              console.log('updatebill  Error:'+ error);
            }else{
              res.redirect("contractdetail?id="+encodeURIComponent(ctrctId));
            }
        });

        billtotalvalue = billtotalvalue + parseFloat(billvalue) - parseFloat(billvaluebef);

        ///update   billtotalvalue  to db
        sales.update({"ctrctId" : ctrctId}, 
            {$set:{"billtotalvalue":billtotalvalue}},
            function (err, doc) {
            if (err) {
                // If it failed, return error
                res.send("There was a problem adding the information to the database.");
                return;
            }
            else {
                // And forward to success page
                //res.redirect("contractdetail?id="+encodeURIComponent(id));
            }
        });

    });

});

/********************************************************************************/
//删除销售合同的发票内容
/********************************************************************************/
router.post('/deletebill', function(req, res) {
    if (!req.session.loginUser) {
        return res.redirect("/");
    }
    var ctrctId = decodeURIComponent(req.query.id);
    var flag = req.query.flag;
    var billvaluebef = 0;
    var billnobef = 0;
    var billtotalvalue = 0;

    var db = req.db;
    var sales = db.get('salescontract');
    sales.find({'ctrctId':ctrctId},{},function(e,docs){
        if(docs.length == 0){
                res.render('helloworld');
                return;
        };
 
        billtotalvalue = parseFloat(docs[0].billtotalvalue);
        billvaluebef = docs[0].bill[flag].billvalue;
        billnobef = docs[0].bill[flag].billno;
    
        sales.update({"ctrctId" : ctrctId}, 
           {$pull:{"bill":
            {"billno":billnobef}}},
             function(error, result){
            if (error) {
              console.log('deletebill  Error:'+ error);
            }else{
              //res.redirect("contractdetail?id="+encodeURIComponent(ctrctId));
            }
        });

        billtotalvalue = billtotalvalue - parseFloat(billvaluebef);

        ///update   billtotalvalue  to db
        sales.update({"ctrctId" : ctrctId}, 
            {$set:{"billtotalvalue":billtotalvalue}},
            function (err, doc) {
            if (err) {
                // If it failed, return error
                res.send("There was a problem adding the information to the database.");
                return;
            }
            else {
                // And forward to success page
                res.redirect("contractdetail?id="+encodeURIComponent(ctrctId));
            }
        });

    });

});


/********************************************************************************/
//删除实物内容
/********************************************************************************/
router.post('/deletematerial', function(req, res) {
    if (!req.session.loginUser) {
        return res.redirect("/");
    }
    var ctrctId = decodeURIComponent(req.query.id);
    var flag = req.query.flag;
   
    var unittype;
    var serialno;
    var mac;
    var endtime;
    var deliverytime;
    var deliveryno;
    var sender;

    var db = req.db;
    var sales = db.get('salescontract');
    sales.find({'ctrctId':ctrctId},{},function(e,docs){
        if(docs.length == 0){
                res.render('helloworld');
                return;
        };
 
        unittype = docs[0].material[flag].unittype;
        serialno = docs[0].material[flag].serialno;
        mac = docs[0].material[flag].mac;
        endtime = docs[0].material[flag].endtime;
        deliverytime = docs[0].material[flag].deliverytime;
        deliveryno = docs[0].material[flag].deliveryno;
        sender = docs[0].material[flag].sender;
    
        sales.update({"ctrctId" : ctrctId}, 
           {$pull:{"material":
            {"unittype":unittype,"serialno":serialno,"mac":mac,"endtime":endtime,"deliverytime":deliverytime,"deliveryno":deliveryno,"sender":sender}}},
             function(error, result){
            if (error) {
              console.log('deletematerial  Error:'+ error);
            }else{
              res.redirect("contractdetail?id="+encodeURIComponent(ctrctId));
            }
        });

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
    res.render('addcontact', { title: '增加联系人',cstmName:encodeURIComponent(req.query.cstmName)});
});

router.post('/addcontact', function(req, res) {
    if (!req.session.loginUser) {
        return res.redirect("/");
    }
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
                res.redirect("customerview?name="+encodeURIComponent(cstmName));
            }
    });   
});

/********************************************************************************/
//删除联系人
/********************************************************************************/
router.post('/deletecontact', function(req, res) {
     if (!req.session.loginUser) {
        return res.redirect("/");
    }
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
          res.redirect("customerview?name="+encodeURIComponent(cstmName));
        }
    });

});


/********************************************************************************/
//变更采购合同的收款内容 ******没有要
/********************************************************************************/
/*
router.get('/updatepay', function(req, res) {
    if (!req.session.loginUser) {
        return res.redirect("/");
    }
    var ctrctId = decodeURIComponent(req.query.id);
    var flag = req.query.flag;
    var db = req.db;
    var sales = db.get('salescontract');
    sales.find({"ctrctId" : ctrctId},{},function(e,docs){
        res.render('updatepay', {
            "saleslist" : docs,
            flag:req.query.flag,
            title: '变更收款'
        });
        //console.log(docs[0].ctrctId);
    });
    //res.render('updatecontract', { title: '变更销售合同'});
});
*/
/********************************************************************************/
//变更销售合同的收款内容
/********************************************************************************/
router.get('/updategather', function(req, res) {
    if (!req.session.loginUser) {
        return res.redirect("/");
    }
    var ctrctId = decodeURIComponent(req.query.id);
    var flag = req.query.flag;
    var db = req.db;
    var sales = db.get('salescontract');
    sales.find({"ctrctId" : ctrctId},{},function(e,docs){
        res.render('updategather', {
            "saleslist" : docs,
            flag:req.query.flag,
            title: '变更收款'
        });
        //console.log(docs[0].ctrctId);
    });
    //res.render('updatecontract', { title: '变更销售合同'});
});

router.post('/updategather', function(req, res) {
    if (!req.session.loginUser) {
        return res.redirect("/");
    }
    var ctrctId = decodeURIComponent(req.query.id);
    var flag = req.query.flag;
    
    var gathervalue = req.body.gathervalue;
    var gathertime = req.body.gathertime;
    var gathertotalvalue = 0.0;

    var gathervaluebef;
    var gathertimebef;

    var db = req.db;
    var sales = db.get('salescontract');
    sales.find({'ctrctId':ctrctId},{},function(e,docs){
        if(docs.length == 0){
                res.render('helloworld');
                return;
        };
        gathervaluebef = docs[0].gather[flag].gathervalue;
        gathertimebef = docs[0].gather[flag].gathertime;

        for(var i in docs[0].gather){
            gathertotalvalue = gathertotalvalue + parseFloat(docs[0].gather[i].gathervalue);
        }

        sales.update({"ctrctId" : ctrctId,"gather.gathervalue":gathervaluebef,"gather.gathertime":gathertimebef}, 
           {$set:{
                        "gather.$.gathervalue":gathervalue,
                        "gather.$.gathertime":gathertime
            }},{upset:true},
             function(error, result){
            if (error) {
              console.log('updategather  Error:'+ error);
            }else{
              //res.redirect("contractdetail?id="+encodeURIComponent(ctrctId));
            }
        });

        gathertotalvalue = gathertotalvalue - parseFloat(gathervaluebef) + parseFloat(gathervalue);
        sales.update({"ctrctId" : ctrctId}, 
           {$set:{"gathertotalvalue":gathertotalvalue}},
             function(error, result){
            if (error) {
              console.log('updategather  Error:'+ error);
            }else{
              res.redirect("contractdetail?id="+encodeURIComponent(ctrctId));
            }
        });

        
    });
});

/********************************************************************************/
//删除销售合同的收款内容
/********************************************************************************/
router.post('/deletegather', function(req, res) {
    if (!req.session.loginUser) {
        return res.redirect("/");
    }
    var ctrctId = decodeURIComponent(req.query.id);
    var flag = req.query.flag;
    
    var gathervalue = req.body.gathervalue;
    var gathertime = req.body.gathertime;
    var gathertotalvalue = 0.0;

    var gathervaluebef;
    var gathertimebef;

    var db = req.db;
    var sales = db.get('salescontract');
    sales.find({'ctrctId':ctrctId},{},function(e,docs){
        if(docs.length == 0){
                res.render('helloworld');
                return;
        };
        gathervaluebef = docs[0].gather[flag].gathervalue;
        gathertimebef = docs[0].gather[flag].gathertime;

        //get the gather total value
        for(var i in docs[0].gather){
            gathertotalvalue = gathertotalvalue + parseFloat(docs[0].gather[i].gathervalue);
        }

        sales.update({"ctrctId" : ctrctId}, 
           {$pull:{"gather":
                        {"gathervalue":gathervaluebef,
                        "gathertime":gathertimebef
                        }
            }},
             function(error, result){
            if (error) {
              console.log('deletegather  Error:'+ error);
            }else{
              //res.redirect("contractdetail?id="+encodeURIComponent(ctrctId));
            }
        });

        //recalculate the gather total value
        gathertotalvalue = gathertotalvalue - parseFloat(gathervaluebef);
        sales.update({"ctrctId" : ctrctId}, 
           {$set:{"gathertotalvalue":gathertotalvalue}},
             function(error, result){
            if (error) {
              console.log('updategather  Error:'+ error);
            }else{
              res.redirect("contractdetail?id="+encodeURIComponent(ctrctId));
            }
        });

    });
});



//that of all

module.exports = router;
