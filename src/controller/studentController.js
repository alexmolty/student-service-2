import * as repo from "../repository/studentRepository.js";

export const addStudent = async (req, res) => {
    const success = await repo.addStudent(req.body);
    if (success) {
        res.status(204).send();
    } else {
        res.status(409).send();
    }
}

export const findStudent = async (req, res) => {
    const student = await repo.findStudent(+req.params.id);
    if (student) {
        const {password, ...studentWithoutPassword} = student;
        res.json(studentWithoutPassword);
    } else {
        res.status(404).send();
    }
}

export const updateStudent = async (req, res) => {
    const student = await repo.updateStudent(+req.params.id, req.body);
    if (student) {
        const {scores, ...studentWithoutScores} = student;
        res.json(studentWithoutScores);
    } else {
        res.status(404).send();
    }
}

export const deleteStudent = async (req, res) => {
    const student = await repo.deleteStudent(+req.params.id);
    if (student) {
        const {password, ...studentWithoutPassword} = student;
        res.json(studentWithoutPassword);
    } else {
        res.status(404).send();
    }
}

export const addScore = async (req, res) => {
    const success = await repo.addScore(+req.params.id, req.body.examName, +req.body.score);
    if (success) {
        res.status(204).send();
    } else {
        res.status(404).send();
    }
}

export const findByName = async (req, res) => {
    const students = await repo.findByName(req.params.name);
    const studentsWithoutPasswords = students.map(student => ({...student, password: undefined}))
    res.json(studentsWithoutPasswords);
}

export const countByNames = async (req, res) => {
    const names = req.query.names;
    const list = Array.isArray(names) ? names : [names];
    const count = await repo.countByNames(list);
    res.json(count)
}

export const findByMinScore = async (req, res) => {
    const students = await repo.findByMinScore(req.params.exam, +req.params.minScore);
    const studentsWithoutPasswords = students.map(student => ({...student, password: undefined}))
    res.json(studentsWithoutPasswords);
}