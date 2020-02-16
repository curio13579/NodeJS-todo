const express = require('express');
const Sequelize = require('sequelize');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


const port = 5432;


const sequelize = new Sequelize('todo', 'priya', "", {
    host: 'localhost',
    dialect: 'postgres'
});

sequelize.authenticate()
.then( ()=> {
    console.log("Database Connected");
}).catch( err => {
    console.error('unable to connect to Database');
});


//USER TABLE
const User = sequelize.define('userdata',{

    u_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    uname: Sequelize.STRING,

    uemail: {
        type: Sequelize.STRING,
        unique: true,
            },
    profilePIC: Sequelize.STRING
   
    },{
        timestamps: false
});
// TODO TABLE
const todo = sequelize.define('todo',
{

    tid: {
        type: Sequelize.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    title: Sequelize.STRING,
    description: Sequelize.STRING,
    status : {
    type: Sequelize.BOOLEAN,
    defaultValue: false
    },
    deleted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    }
},
    {
        timestamps: false
});

//LOGIN TABLE

const Login = sequelize.define('login',
{

    LOGINid: {
        type: Sequelize.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    password: Sequelize.STRING,
    email: {
        type: Sequelize.STRING,
        allowNull: false,
    }
    },{
        timestamps: false
});

Login.belongsTo(User,{foreignKey: 'email', targetKey: 'uemail'});
User.hasMany(todo,{foreignKey:'u_id'});


 sequelize.sync({
     force: true
    });


//USER API

app.post('/create/user', async (req,res) => {

    var newUser = {
        uname: req.body.uname,
        uemail: req.body.email
    }

   try{
       
        var user_created = await User.create(newUser);

        console.log(user_created);
       
        if(user_created)
        {
            res.status(200).json({
                message: "User created successfully."
            });
            return;
        }
   }
   catch(err){
    console.log(err);
    res.status(500).json({
        message: "not created",
        error: err
    });
    return;
   }

})

//TODO API

app.post('/create/todo', async (req,res) => {

    var tit = req.body.title;
    var des = req.body.description;
    var uid = req.body.u_id;

    var newtodo = {
        title: tit,
        description: des,
        u_id:uid
    }

   try{
       
        var todo_created = await todo.create(newtodo);

        console.log(todo_created);
       
        if(todo_created)
        {
            res.status(200).json({
                message: "Todo created successfully."
            });
            return;
        }
   }
   catch(err){
    console.log(err);
    res.status(500).json({
        message: "Todo not created",
        error: err
    });
    return;
   }

})

//DASHBOARD API
app.get('/get/dashboard', async (req,res) => {
    var uid = req.query.uid;
    try{

        var todos = await todo.findAll({
            where: {
                u_id: uid
            }
        });
        if(todos)
        {
            res.status(200).json({
                todo : todos
            });
            return;
        }
    }
    catch(err){
        console.log(err);
        res.status(500).json({
            message: "error"
        });
        return;
    }

})

//DELETE TODO API
app.get('/delete_todo', async (req,res) => {

    var tid1 = req.query.tid;

    try{

        var todos = await todo.update(
                    {
                      deleted:true
                    },
                    { where: { tid: tid1 } }
        );

        if(todos)
        {
            res.status(200).json({
                message: "deleted successfully"
            });
            return;
        }
        }
    catch(err){
        console.log(err);
        res.status(500).json({
            message: "error while getting data from table"
        });
        return;
    }

})

//EDIT TODO

app.get('/get/edit_todo', async (req,res) => {
   
    var tid1 = req.query.tid;
    var tit = req.query.title;
    var des = req.query.description;
    var stat = req.query.status;
    var del = req.query.deleted;

    var newtodo = {
        title: tit,
        description: des,
        status:stat,
        deleted:del
    }

    try{

        var todos = await todo.update(newtodo,
                    { where: { tid: tid1 } }
        );

        if(todos)
        {
            res.status(200).json({
                message: "TO-Do Updated successfully !!"
            });
            return;
        }
        }
    catch(err){
        console.log(err);
        res.status(500).json({
            message: "error while getting data from table"
        });
        return;
    }

})

//DELETED TODO DASHBOARD API
app.get('/get/deleted_dashboard', async (req,res) => {

    var uid = req.query.u_id;

    try{

        var todos = await todo.findAll({
            where: {
                u_id: uid,
                deleted: true
            }
        });

        if(todos)
        {
            res.status(200).json({
                todo : todos
            });
            return;
        }
    }
    catch(err){
        console.log(err);
        res.status(500).json({
            message: "error while getting data from table"
        });
        return;
    }

})

//PROFILE DETAILS API
app.get('/get/profile_details', async (req,res) => {

    var uid = req.query.u_id;

    try{

        var user = await User.findOne({
            where: {
                u_id: uid
            }
        });

        if(user)
        {
            res.status(200).json({
                user_details : user
            });
             return;
        }
    }
    catch(err){
        console.log(err);
        res.status(500).json({
            message: "error while getting data from table"
        });
        return;
    }

})

app.listen(port, () => {
    console.log("Server started on port ${port}");
});
