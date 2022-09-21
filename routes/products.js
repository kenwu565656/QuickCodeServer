var express = require('express');
var router = express.Router();
var monk = require('monk');


router.get("/loadpage", function(req, res){
    var db = req.db;
    var coll = db.get('productCollection');
    if(req.query.category != ""){
        var query = {name: {$regex: req.query.search}, category: req.query.category}
    }else{
        var query = {name: {$regex: req.query.search}}
    }
    coll.find(query, {projection: {_id: 1, name: 1, price: 1, productImage: 1}}, function(e, docs){
        if(e === null){
            console.log(docs);
            res.json(docs);
        }else{
            res.send(e);
        }
    })
});

router.get("/loadproduct", function(req, res){
    var db = req.db;
    var coll = db.get('productCollection');
    coll.find({_id: req.query.productid}, {projection: {name: 0, price: 0, productImage: 0, category: 0}}, function(e, docs){
        if(e === null){
            console.log(docs);
            res.cookie('product', docs[0]['_id']);  
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
            jresult['message'] = docs[0]['totalnum'];
            console.log(jresult);
            res.json(jresult);
        }else{
            var jresult = new Object();
            jresult["status"] = "fail";
            jresult['message'] = "cannot find user";
            res.json(jresult);
        }
    }else{
        var jresult = new Object();
            jresult["status"] = "error";
            jresult['message'] = e;
            res.json(jresult);
    }
    })
});

router.get('/signout', function(req, res){
    res.clearCookie('userID');
    res.send("");
});

router.get('/getsessioninfo', function(req, res){
    console.log(req.cookies.userID);
    if (req.cookies.userID){
        var db = req.db;
        var coll = db.get('userCollection');
        coll.find({"_id": req.cookies.userID},{}, function(e, docs){
            if(e === null){
                var jresult = new Object(); 
                jresult['status'] = true;
                jresult['username'] = docs[0]['username'];
                jresult['totalnum'] =  docs[0]['totalnum'];
                console.log(jresult);
                res.json(jresult);

            }else{
                var jresult = new Object(); 
                jresult['status'] = false;
                console.log(jresult);
                res.json(jresult);
            }
        })
    }else{
        var jresult = new Object(); 
        jresult['status'] = false;
        console.log(jresult);
        res.json(jresult);
    }
});


router.post('/addtocart', function(req, res){
    var db = req.db;
    var coll = db.get('userCollection');
    var id = req.cookies.userID;
    //var productId = monk.id(req.body.productId);
    var productId = req.cookies.product;
    console.log(req.cookies.product)
    console.log(productId);
    var quantity = parseInt(req.body.quantity);
    console.log(productId);
    console.log(quantity);
    coll.find({cart: {$elemMatch: {"productId": productId}}, "_id": id}, {}, function(e, docs){
        if(e === null){

        
        if(docs.length > 0){
            coll.update({'_id': id, 'cart.productId': {$eq: productId}}, {$inc: {'cart.$.quantity':quantity, totalnum: quantity}}, function(e, docs){
                if(e === null){
                    coll.find({_id: id}, {projection: {totalnum: 1}}, function(e, docs){
                        if(e === null){
                            console.log(docs);
                            var jresult = new Object(); 
                            jresult["status"] = "success";
                            jresult['message'] = docs[0]['totalnum'];
                            
                            console.log(jresult);
                            res.json(jresult);       
                        }else{
                            var jresult = new Object();
                            jresult["status"] = "error1";
                            jresult['message'] = e;
                            res.json(jresult);
                        }
                    })

                }else{
                    var jresult = new Object();
                    jresult["status"] = "error2";
                    jresult['message'] = e;
                    res.json(jresult);
                }
            })

        }else{
            coll.update({'_id': id}, 
            {$push: {
                "cart": {
                    "productId" : productId,
                    "quantity" : quantity
                }
            }, $inc: {totalnum: quantity}}, function(e, docs){

                if(e === null){
                    coll.find({_id: monk.id(id)}, {projection: {totalnum: 1}}, function(e, docs){
                        if(e === null){
                            console.log(docs);
                            var jresult = new Object(); 
                            jresult["status"] = "success";
                            jresult['message'] = docs[0]['totalnum'];
                            console.log(jresult);
                            res.json(jresult);           
                        }else{
                            var jresult = new Object();
                            jresult["status"] = "error4";
                            jresult['message'] = e;
                            res.json(jresult);
                        }
                    })

                }else{
                    var jresult = new Object();
                    jresult["status"] = "error3";
                    jresult['message'] = e;
                    console.log(jresult);
                    res.json(jresult);
                }
                

            })
        }
    }else{
        var jresult = new Object();
        jresult["status"] = "error5";
        jresult['message'] = e;
        res.json(jresult);
    }
    })
})

router.get('/loadcart', function(req, res){
    var id = req.cookies.userID;
    var db = req.db;
    var coll = db.get('userCollection');
    var jresult = new Object(); 
    var mylist = [];
    coll.find({_id: monk.id(id)}, {}, function(e, docs){
        if(e === null){
        jresult['totalnum'] = docs[0]['totalnum'];
        jresult['status'] = true;
        jresult['cart_quantity'] = docs[0]['cart'];

        console.log(docs[0]['cart']);
        for(i = 0; i < docs[0]['cart'].length;i++){
            console.log(docs[0]['cart'][i]['productId']);
            mylist.push(monk.id(docs[0]['cart'][i]['productId']));
        }
        console.log(mylist[0]);
        req.db.get('productCollection').find({'_id': {$in: monk.id(mylist)}}, {projection: {name: 1, price: 1, productImage: 1, _id: 1}}, function(e1, docs1){
                if(e1 === null){ 
                    console.log("yes");
                    jresult['cart'] = docs1;
                    console.log(jresult);
                    res.json(jresult);
                }else{
                    console.log(e);
                    res.send(e);
                }
            })
        
    }else{
        console.log(e);
        res.send(e);
    }
    })
});

router.post('/updatecart', function(req, res){
    var id = req.cookies.userID;
    var db = req.db;
    var coll = db.get('userCollection');
    coll.update({_id: id, "cart.productId": req.body.productId}, {$set: {"cart.$.quantity": parseInt(req.body.quantity)}, $inc: {totalnum: parseInt(req.body.quantity)}}, function(e, docs){
        if(e === null){
            console.log("update success");
        coll.find({_id: id}, {projection:{totalnum: 1}}, function(e, docs){
            if(e === null){
            res.json(docs);
            }else{
                console.log("update fail");
                console.log(e);
                res.send(e);
            }
        })
    }else{
        console.log("update fail");
        console.log(e);
        res.send(e);
    }
    })
});

router.get('/deletefromcart', function(req, res){
    var id = req.cookies.userID;
    var db = req.db;
    var coll = db.get('userCollection');
    coll.update({"_id": monk.id(id)}, {"$pull": {
        "cart": {
            "productId" : req.query.productId,
        }
    }, "$inc": {totalnum: -1 * parseInt(req.query.quantity)}}, function(e, docs){
        if(e === null){
            res.json("");
        }else{
            console.log(e);
            res.json(e);
        }
    })
});

router.get('/checkout', function(req, res){
    var id = req.cookies.userID;
    var db = req.db;
    var coll = db.get('userCollection');
    coll.update({_id: monk.id(id)}, {$set: {"cart": [], "totalnum": 0}}, function(e, docs){
        if(e === null){
            res.send("");
        }else{
            res.send(e);
        }
    })
});

module.exports = router;