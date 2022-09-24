var express = require('express');
var router = express.Router();
var monk = require('monk');

router.post("/loadposts", function(req, res){
    var db = req.db;
    var coll = db.get('codeCollection');
    var mylist = JSON.parse(req.query.filter);
    console.log(mylist.length);
    /*
    if(req.query.category != ""){
        var query = {name: {$regex: req.query.search}, category: req.query.category}
    }else{
        var query = {name: {$regex: req.query.search}}
    }
    */
    if(mylist.length === 0){
        var query = {title: {$regex: req.query.search}};
    }else{
        var query = {title: {$regex: req.query.search}, tags: { $all: mylist}};
    }

    var start = 0;
    var end = (req.query.page * 5);

   
    coll.find(query, {projection: {_id: 1, title: 1, date: 1, tags: 1, body: 1}}, function(e, docs){
        if(e === null){
            var jresult = new Object(); 
            jresult['data'] = docs.slice(start, end);
            jresult['length'] = docs.length;
            console.log(jresult);
            res.json(jresult);
        }else{
            res.send(e);
        }
    })
});

router.post("/addpost", function(req, res){
    var db = req.db;
    var coll = db.get('codeCollection');

    var parsedBodyList = [];
    var current_index = -1;
    var bodyList = JSON.parse(req.body.body);
    var tagList = JSON.parse(req.query.tags);
    
    for(var j = 0; j < bodyList.length; j++){
        if(bodyList[j].trim()[0] === "|"){
            current_index += 1;
            parsedBodyList[current_index] = new Object(); 
            parsedBodyList[current_index]["type"] = bodyList[j].trim().substring(1).toLowerCase();
            parsedBodyList[current_index]["main"] = "";
        }else{
            parsedBodyList[current_index]["main"] += (bodyList[j].trim() + "\n");
        }
    }
    
    console.log(parsedBodyList);
    console.log(req.query.title);
    console.log(req.query.date);
    console.log(req.query.tags);

    var myobj = {title: String(req.query.title), date: new Date(), tags: tagList, body: parsedBodyList};

    console.log(req.query.tags);

    coll.insert(myobj, function(err, docs) {
        if(err === null){
            var jresult = new Object(); 
            jresult["status"] = "success";
            res.json(jresult);
        }else{
            console.log("fail");
            var jresult = new Object(); 
            jresult["status"] = "fail";
            res.json(jresult);

        }
      });

});

router.get("/loadpost/:id", function(req, res){
    var db = req.db;
    var coll = db.get('codeCollection');
    coll.find({_id: req.params.id}, {}, function(e, docs){
        if(e === null){
            console.log(docs);
            res.json(docs);         
        }else{
            res.send(e);
        }
    })
});

router.post("/signin", function(req, res){
    var db = req.db;
    var coll = db.get('userCollection');
    var username = req.body.username;
    var password = req.body.password;
    coll.find({'username': username, 'password': password},{}, function(e, docs){
        if(e === null){
        if(docs.length > 0){
            console.log(docs[0]['_id']);
            res.cookie('userID', docs[0]['_id']);
            var jresult = new Object(); 
            jresult["status"] = "success";
            jresult["result"] = true;
            //jresult['message'] = docs[0]['totalnum'];
            console.log(jresult);
            res.json(jresult);
        }else{
            var jresult = new Object();
            jresult["status"] = "fail";
            jresult["result"] = false;
            jresult['message'] = "cannot find user";
            res.json(jresult);
        }
    }else{
        var jresult = new Object();
            jresult["status"] = "error";
            jresult["result"] = false;
            jresult['message'] = e;
            res.json(jresult);
    }
    })
});

router.get("/try", function(req, res){
    var db = req.db;
    var coll = db.get('userCollection');
    coll.find({}, {}, function(e, docs){
        if(e === null){
            console.log(docs);
            res.json(docs);         
        }else{
            res.send("fail");
            //res.send(e);
        }
    })
    //res.send("Hello World");
})

module.exports = router;