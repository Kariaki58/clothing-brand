import mongoose from "mongoose";


const UserSchema = new mongoose.Schema({
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            validate: {
                validator: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
                message: (props) => `${props.value} is not a valid email!`
            },
            index: true
        },
        googleId: {
            type: String,
            unique: true
        },
        avatar: String,
        
        role: {
            type: String,
            enum: ['admin', 'user'],
            default: 'user'
        }
    }, 
    {
        timestamps: true,
});

UserSchema.index({ email: 1, googleId: 1 });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

export default User;