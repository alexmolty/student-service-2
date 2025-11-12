import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
    _id: {type: Number, required: true},
    name: {type: String, required: true},
    password: {type: String, required: true},
    scores: {
        type: Map, key: String, of: Number, default: {}
    }
}, {
    versionKey: false,
    toJSON: {
        transform(doc, ret) {
            const {_id, ...rest} = ret
            return {id: _id, ...rest}  // id первым
        }
    }
})
const Student = mongoose.model('Student', studentSchema, 'college');
export default Student;