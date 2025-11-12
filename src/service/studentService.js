import * as repo from '../repository/studentRepository.js';

export const addStudent = async ({id, name, password}) => {
    if (await repo.findStudentById(id)) {
        return false;
    }
    await repo.createStudent({_id: id, name, password});
    return true;
}

export const findStudent = async id => {
    const student = await repo.findStudentById(id);
    if (student) {
        student.password = undefined;
    }
    return student
}

export const deleteStudent = async id => {
    const student = await repo.deleteStudentById(id);
    if (student) {
        student.password = undefined;
    }
    return student
}

export const updateStudent = async (id, data) => {
    const student = await repo.updateStudent(id, data);
    if (student) {
        student.scores = undefined;
    }
    return student
}

export const addScore = async (id, exam, score) => {
    const updated = await repo.updateStudentScores(id, exam, score);
    return !!updated;
}

export const findByName = async (name) => {
    const students = await repo.findStudentsByName(name);
    return students.map(student => {
        student.password = undefined;
        return student
    })
}

export const countByNames = (names) => {
    if (!Array.isArray(names)) names = [names];
    return repo.countStudentsByName(names);
}

export const findByMinScore = async (exam, minScore) => {
    const students = await repo.findStudentsByMinScore(exam, minScore)
    return students.map(student => {
        student.password = undefined;
        return student
    })
}