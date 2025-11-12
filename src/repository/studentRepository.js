import Student from "../model/student.js";

export function createStudent(student) {
    return Student.create(student)
}

export function findStudentById(id){
    return Student.findById(id)
}

export function deleteStudentById(id){
    return Student.findByIdAndDelete(id)
}

export function updateStudent(id,data){
    return Student.findByIdAndUpdate(id,data)
}

export function updateStudentScores(id,exam,score){
    return Student.findByIdAndUpdate(id, {[`scores.${exam}`]: score})
}

export function findStudentsByName(name){
    return Student.find({name: new RegExp(`^${name}$`, 'i')})
}

export function countStudentsByName(names){
    const regexConditions = names.map(name => ({name: new RegExp(`^${name}$`, 'i')}));
    return Student.countDocuments({$or: regexConditions})
}

export function findStudentsByMinScore(exam, minScore){
    return Student.find({[`scores.${exam}`]: {$gte: minScore}})
}