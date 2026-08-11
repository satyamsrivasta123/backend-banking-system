const mongoose=require("mongoose")
const bcrypt=require("bcryptjs")

const userSchema= new mongoose.Schema({
    email:{
        type:String,
        required:[true,"Email is required"],
        trim:true,
        lowercase:true,
        match:[/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],
        unique:[true,"Email already exist"]

    },
    name:{
        type:String,
        required:[true,"Name is required"]

    },
    password:{
        type:String,
        required:[true,"Password is requires"],
        minlength:[6,"Password should be morethan 6 length"],
        select:false
    },
    systemUser:{
        type:Boolean,
        default:false,
        immutable:true,
        select:false
    }
},{
    timestamps:true
})
//Convert passsword to hash value..
userSchema.pre("save",async function(){
    if(!this.isModified("password")){
        return 
    }
    const hash=await bcrypt.hash(this.password,10)
    this.password=hash

    return 



})
//Compare the password and has value in the database and return true..
userSchema.methods.comparePassword=async function(password){
    return await bcrypt.compare(password,this.password)
}

const userModel=mongoose.model("user", userSchema)
module.exports=userModel;