// ARRANGE, ACT, ASSERT PATTERN
import {jest, describe, beforeEach, test, expect} from '@jest/globals'

// Mock the repository module before importing the service
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

// Dynamic import after mocking
const service = await import('../service/studentService.js')
const repo = await import('../repository/studentRepository.js')

describe('studentService', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('addStudent', () => {
        test('should create a student and return true if id is free', async () => {
            repo.findStudentById.mockResolvedValueOnce(null)
            repo.createStudent.mockResolvedValueOnce({_id: '1', name: 'Ann'})

            const ok = await service.addStudent({id: '1', name: 'Ann', password: 'pass'})

            expect(repo.findStudentById).toHaveBeenCalledWith('1')
            expect(repo.createStudent).toHaveBeenCalledWith({_id: '1', name: 'Ann', password: 'pass'})
            expect(ok).toBe(true)
        })

        test('should return false if a student with the same id already exists', async () => {
            repo.findStudentById.mockResolvedValueOnce({_id: '1'})

            const ok = await service.addStudent({id: '1', name: 'Ann', password: 'pass'})

            expect(repo.findStudentById).toHaveBeenCalledWith('1')
            expect(repo.createStudent).not.toHaveBeenCalled()
            expect(ok).toBe(false)
        })
    })

    describe('findStudent', () => {
        test('should set password to undefined and return the student', async () => {
            const student = {_id: '2', name: 'Bob', password: 'secret'}
            repo.findStudentById.mockResolvedValueOnce({...student})

            const res = await service.findStudent('2')

            expect(repo.findStudentById).toHaveBeenCalledWith('2')
            expect(res).toEqual({_id: '2', name: 'Bob', password: undefined})
        })

        test('should return null if the student is not found', async () => {
            repo.findStudentById.mockResolvedValueOnce(null)

            const res = await service.findStudent('404')
            expect(res).toBeNull()
        })
    })

    describe('deleteStudent', () => {
        test('should delete and set password to undefined', async () => {
            repo.deleteStudentById.mockResolvedValueOnce({_id: '3', name: 'Cat', password: 'p'})

            const res = await service.deleteStudent('3')

            expect(repo.deleteStudentById).toHaveBeenCalledWith('3')
            expect(res).toEqual({_id: '3', name: 'Cat', password: undefined})
        })

        test('should return null if there is nothing to delete', async () => {
            repo.deleteStudentById.mockResolvedValueOnce(null)
            const res = await service.deleteStudent('999')
            expect(res).toBeNull()
        })
    })

    describe('updateStudent', () => {
        test('should return the student with undefined scores', async () => {
            repo.updateStudent.mockResolvedValueOnce({_id: '4', name: 'Dan', scores: {math: 80}})

            const res = await service.updateStudent('4', {name: 'Dan'})

            expect(repo.updateStudent).toHaveBeenCalledWith('4', {name: 'Dan'})
            expect(res).toEqual({_id: '4', name: 'Dan', scores: undefined})
        })

        test('should return null if the update target is not found', async () => {
            repo.updateStudent.mockResolvedValueOnce(null)
            const res = await service.updateStudent('nope', {})
            expect(res).toBeNull()
        })
    })

    describe('addScore', () => {
        test('returns true if the repository returned an object', async () => {
            repo.updateStudentScores.mockResolvedValueOnce({ok: 1})
            const res = await service.addScore('5', 'math', 95)
            expect(repo.updateStudentScores).toHaveBeenCalledWith('5', 'math', 95)
            expect(res).toBe(true)
        })

        test('returns false if the repository returned null', async () => {
            repo.updateStudentScores.mockResolvedValueOnce(null)
            const res = await service.addScore('5', 'math', 95)
            expect(res).toBe(false)
        })
    })

    describe('findByName', () => {
        test('should remove password for each found student', async () => {
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
        test('converts a single string to an array and calls the repository', () => {
            repo.countStudentsByName.mockReturnValueOnce(3)

            const count = service.countByNames('Mia')

            expect(repo.countStudentsByName).toHaveBeenCalledWith(['Mia'])
            expect(count).toBe(3)
        })

        test('passes the provided array as is', () => {
            repo.countStudentsByName.mockReturnValueOnce(5)
            const names = ['A', 'B']
            const count = service.countByNames(names)
            expect(repo.countStudentsByName).toHaveBeenCalledWith(names)
            expect(count).toBe(5)
        })
    })

    describe('findByMinScore', () => {
        test('removes password for each found student', async () => {
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
