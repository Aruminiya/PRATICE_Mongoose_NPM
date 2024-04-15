const http = require("http");
const Room = require("./models/room.js");
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({path:"./config.env"});
const DB = process.env.DATABASE.replace(
    '<password>',
    process.env.DATABASE_PASSWORD
)

// 連接資料庫
mongoose.connect(DB).then(()=>{
    console.log('資料庫連線成功');
})
.catch((error)=>{
    console.log(error);
});

const requestListener = async (req,res)=>{
    const headers = {
        // 允許的請求標頭
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
        // 允許的來源（此處為所有來源，請謹慎使用）
        'Access-Control-Allow-Origin': '*',
        // 允許的請求方法
        'Access-Control-Allow-Methods': 'PATCH, POST, GET, OPTIONS, DELETE',
        // Content-Type 標頭指示請求/回應的媒體類型
        'Content-Type': 'application/json'
    }
    
    // 取得房型
    if (req.url=="/rooms" && req.method=="GET"){
        const getRoom = await Room.find();
        res.writeHead(200,headers);
        // 網路請求只看得懂字串
        res.write(JSON.stringify({
            "status":"success",
            rooms: getRoom
        }))
        res.end();
    }

    // 新增房型
    else if (req.url=="/rooms" && req.method=="POST") {
       
        let body = "";
        req.on("data",(chunk)=>{
            body += chunk
        })
        req.on("end",async ()=>{               
            try
            {   
                // 取的 POST 的資料
                let postData = JSON.parse(body);
                    
                const postRoom = await Room.create(postData)
                console.log("資料建立成功");
                res.writeHead(200,headers);
                res.write(JSON.stringify({
                    "status":"success",
                    rooms: postRoom
                }));
                res.end();
            }
            catch(err){
                console.error("資料傳輸或建立失敗");
                res.writeHead(400,headers);
                res.write(JSON.stringify({
                    "status":"error",
                    "message":"資料傳輸或建立失敗",
                    "errors": err.errors
                }));
                res.end();
            }      
        })
        
        
    }
    // 刪除所有房型
    else if (req.url=="/rooms" && req.method=="DELETE"){
        await Room.deleteMany({});
        res.writeHead(200,headers);
        // 網路請求只看得懂字串
        res.write(JSON.stringify({
            "status":"success",
            rooms: []
        }))
        res.end();
    }
    // 刪除單一房型
    else if (req.url.startsWith("/rooms/") && req.method=="DELETE"){
        // 抽出 id
        const urlParts = req.url.split("/");
        const deleteId = urlParts[2]; 
        try{
            const deleteRoom = await Room.findByIdAndDelete(deleteId);
            res.writeHead(200,headers);
            // 網路請求只看得懂字串
            res.write(JSON.stringify({
                "status":"success",
                rooms: deleteRoom
            }))
            res.end();
        }catch(error){
            res.writeHead(200,headers);
            // 網路請求只看得懂字串
            res.write(JSON.stringify({
                "status":"success",
                "message": "刪除單筆房型失敗",
                error
            }))
            res.end();
        }             
    }
    // 編輯單一房型
    else if (req.url.startsWith("/rooms/") && req.method=="PATCH"){
        let body = "";
        req.on("data",(chunk)=>{
            body += chunk
        })
        req.on("end",async ()=>{        
            try{
                // 取的 PATCH 的資料
                let editData = JSON.parse(body);
                console.log(editData)

                // 抽出 id
                const urlParts = req.url.split("/");
                const editId = urlParts[2]; 

                const editRoom = await Room.findByIdAndUpdate(editId,editData,{ new: true });
                res.writeHead(200,headers);
                // 網路請求只看得懂字串
                res.write(JSON.stringify({
                    "status":"success",
                    rooms: editRoom
                }))
                res.end();
            }catch(error){
                res.writeHead(200,headers);
                // 網路請求只看得懂字串
                res.write(JSON.stringify({
                    "status":"success",
                    "message": "編輯單筆房型失敗",
                    error
                }))
                res.end();
            }             
          })


         
    }
    // preflight options API 檢查機制
    else if (req.url=="/rooms" && req.method=="OPITIONS"){
        res.writeHead(200,headers);
        res.end();
    }
    // 找不到路由
    else {
        res.writeHead(200,headers);
        // 網路請求只看得懂字串
        res.write(JSON.stringify({
            "status":"success",
            "message": "無此網站路由"
        }))
        res.end();
    }
}

const server = http.createServer(requestListener);
server.listen(process.env.PORT);