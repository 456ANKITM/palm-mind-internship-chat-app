import mongoose from "mongoose";
import bcrypt from "bcryptjs"

const userSchema = new mongoose.Schema({
    name:{type:String, required:true, trim:true},
    email:{type:String, unique:true, required:true, trim:true},
    password:{type:String, required:true},
    profileImage:{type:String, default:""}
},{timestamps:true});

// we need to encrypt the password before saving the user into our database 
userSchema.pre("save", async function(){
    if(!this.isModified("password")) return ;
    this.password = await bcrypt.hash(this.password, 10);
})

// we also need to compare password for the authentication
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password)
}

const User = mongoose.model("User", userSchema);

export default User; 