const mongoose = require('mongoose');
const roomSchema = new mongoose.Schema({
    name: String,
    price:{
        type:Number,
        required: [true,"價格必填"]
    },
    rating: Number,
    payment: Array,
    createdAt: {
        type: Date,
        default: Date.now,
        // select 保護起來 只能在資料庫看到 前台回傳看不到
        select: false
    }
},
// versionKey 不要加入 mongoose 預設的 __v
// collection 自訂資料庫集合名稱 不受 mongoose 預設規範限制
// timestamps 資料創建日期 資料更新日期
{
    versionKey: false,
    // collection: 'room',
    // timestamps: true
}
)

const Room = mongoose.model('Room', roomSchema);
// Room 會被變成 rooms
// 開頭變小寫
// 強制加上 s

module.exports = Room;