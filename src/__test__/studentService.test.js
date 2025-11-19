// ARRANGE, ACT, ASSERT PATTERN
import {jest, describe, beforeEach, test, expect} from '@jest/globals'

// Мокаем модуль репозитория до импорта сервиса
const repoMock = {
    createStudent: jest.fn(),
    findStudentById: jest.fn(),
    deleteStudentById: jest.fn(),
    updateStudent: jest.fn(),
    updateStudentScores: jest.fn(),
    findStudentsByName: jest.fn(),
    countStudentsByName: jest.fn(),
    findStudentsByMinScore: jest.fn(),
}

jest.unstable_mockModule('../repository/studentRepository.js', () => ({
    ...repoMock,
}))

// Динамический импорт после мокапа
const service = await import('../service/studentService.js')
const repo = await import('../repository/studentRepository.js')

describe('studentService', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('addStudent', () => {
        test('должен создать студента и вернуть true, если id не занят', async () => {
            repo.findStudentById.mockResolvedValueOnce(null)
            repo.createStudent.mockResolvedValueOnce({_id: '1', name: 'Ann'})

            const ok = await service.addStudent({id: '1', name: 'Ann', password: 'pass'})

            expect(repo.findStudentById).toHaveBeenCalledWith('1')
            expect(repo.createStudent).toHaveBeenCalledWith({_id: '1', name: 'Ann', password: 'pass'})
            expect(ok).toBe(true)
        })

        test('должен вернуть false, если студент с таким id уже существует', async () => {
            repo.findStudentById.mockResolvedValueOnce({_id: '1'})

            const ok = await service.addStudent({id: '1', name: 'Ann', password: 'pass'})

            expect(repo.findStudentById).toHaveBeenCalledWith('1')
            expect(repo.createStudent).not.toHaveBeenCalled()
            expect(ok).toBe(false)
        })
    })

    describe('findStudent', () => {
        test('должен обнулять password и возвращать студента', async () => {
            const student = {_id: '2', name: 'Bob', password: 'secret'}
            repo.findStudentById.mockResolvedValueOnce({...student})

            const res = await service.findStudent('2')

            expect(repo.findStudentById).toHaveBeenCalledWith('2')
            expect(res).toEqual({_id: '2', name: 'Bob', password: undefined})
        })

        test('должен вернуть null/undefined, если студент не найден', async () => {
            repo.findStudentById.mockResolvedValueOnce(null)

            const res = await service.findStudent('404')
            expect(res).toBeNull()
        })
    })

    describe('deleteStudent', () => {
        test('должен удалить и обнулить password', async () => {
            repo.deleteStudentById.mockResolvedValueOnce({_id: '3', name: 'Cat', password: 'p'})

            const res = await service.deleteStudent('3')

            expect(repo.deleteStudentById).toHaveBeenCalledWith('3')
            expect(res).toEqual({_id: '3', name: 'Cat', password: undefined})
        })

        test('должен вернуть null/undefined, если нечего удалять', async () => {
            repo.deleteStudentById.mockResolvedValueOnce(null)
            const res = await service.deleteStudent('999')
            expect(res).toBeNull()
        })
    })

    describe('updateStudent', () => {
        test('должен вернуть студента с undefined scores', async () => {
            repo.updateStudent.mockResolvedValueOnce({_id: '4', name: 'Dan', scores: {math: 80}})

            const res = await service.updateStudent('4', {name: 'Dan'})

            expect(repo.updateStudent).toHaveBeenCalledWith('4', {name: 'Dan'})
            expect(res).toEqual({_id: '4', name: 'Dan', scores: undefined})
        })

        test('должен вернуть null/undefined, если обновление не найдено', async () => {
            repo.updateStudent.mockResolvedValueOnce(null)
            const res = await service.updateStudent('nope', {})
            expect(res).toBeNull()
        })
    })

    describe('addScore', () => {
        test('возвращает true, если репозиторий вернул объект', async () => {
            repo.updateStudentScores.mockResolvedValueOnce({ok: 1})
            const res = await service.addScore('5', 'math', 95)
            expect(repo.updateStudentScores).toHaveBeenCalledWith('5', 'math', 95)
            expect(res).toBe(true)
        })

        test('возвращает false, если репозиторий вернул null', async () => {
            repo.updateStudentScores.mockResolvedValueOnce(null)
            const res = await service.addScore('5', 'math', 95)
            expect(res).toBe(false)
        })
    })

    describe('findByName', () => {
        test('должен убирать password у каждого найденного', async () => {
            repo.findStudentsByName.mockResolvedValueOnce([
                {_id: '6', name: 'Eva', password: '1'},
                {_id: '7', name: 'eva', password: '2'},
            ])

            const res = await service.findByName('Eva')

            expect(repo.findStudentsByName).toHaveBeenCalledWith('Eva')
            expect(res).toEqual([
                {_id: '6', name: 'Eva', password: undefined},
                {_id: '7', name: 'eva', password: undefined},
            ])
        })
    })

    describe('countByNames', () => {
        test('одиночную строку преобразует в массив и вызывает репозиторий', () => {
            repo.countStudentsByName.mockReturnValueOnce(3)

            const count = service.countByNames('Mia')

            expect(repo.countStudentsByName).toHaveBeenCalledWith(['Mia'])
            expect(count).toBe(3)
        })

        test('переданный массив пробрасывается как есть', () => {
            repo.countStudentsByName.mockReturnValueOnce(5)
            const names = ['A', 'B']
            const count = service.countByNames(names)
            expect(repo.countStudentsByName).toHaveBeenCalledWith(names)
            expect(count).toBe(5)
        })
    })

    describe('findByMinScore', () => {
        test('убирает password у каждого найденного', async () => {
            repo.findStudentsByMinScore.mockResolvedValueOnce([
                {_id: '8', name: 'Neo', password: 'x', scores: {math: 100}},
                {_id: '9', name: 'Trin', password: 'y', scores: {math: 90}},
            ])

            const res = await service.findByMinScore('math', 90)

            expect(repo.findStudentsByMinScore).toHaveBeenCalledWith('math', 90)
            expect(res).toEqual([
                {_id: '8', name: 'Neo', password: undefined, scores: {math: 100}},
                {_id: '9', name: 'Trin', password: undefined, scores: {math: 90}},
            ])
        })
    })
})
