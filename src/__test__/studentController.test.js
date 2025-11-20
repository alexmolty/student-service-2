import {jest, describe, beforeAll, beforeEach, afterAll, test, expect} from '@jest/globals'
import request from 'supertest'
import {createApp, makeDoc} from './testUtils.js'

// Mock the repository module BEFORE importing service/controller/routes
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

// DYNAMIC IMPORTS after mocks
const routerModule = await import('../routes/studentRoutes.js')
const repo = await import('../repository/studentRepository.js')

describe('studentController (via HTTP, supertest)', () => {
  let app

  beforeAll(() => {
    app = createApp((routerModule).default)
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /student (addStudent)', () => {
    test('201 Created on successful creation', async () => {
      repo.findStudentById.mockResolvedValueOnce(null)
      repo.createStudent.mockResolvedValueOnce({})

      await request(app)
        .post('/student')
        .send({id: 1000, name: 'Peter', password: '1234'})
        .expect(201)
    })

    test('409 Conflict on duplicate id', async () => {
      repo.findStudentById.mockResolvedValueOnce({})

      await request(app)
        .post('/student')
        .send({id: 1000, name: 'Peter', password: '1234'})
        .expect(409)
    })

    test('400 Bad Request on invalid body', async () => {
      await request(app)
        .post('/student')
        .send({name: 'Peter'}) // missing id and password
        .expect(400)
        .expect(res => {
          expect(res.body).toHaveProperty('error')
        })
    })
  })

  describe('GET /student/:id (findStudent)', () => {
    test('200 OK with student body on success', async () => {
      repo.findStudentById.mockResolvedValueOnce(makeDoc({id: 2000, name: 'Peter', scores: {Math: 95}}))

      const res = await request(app).get('/student/2000').expect('Content-Type', /json/).expect(200)
      expect(res.body).toEqual({id: 2000, name: 'Peter', scores: {Math: 95}})
    })

    test('404 Not Found if the student is not found', async () => {
      repo.findStudentById.mockResolvedValueOnce(null)
      await request(app).get('/student/9999').expect(404)
    })
  })

  describe('DELETE /student/:id (deleteStudent)', () => {
    test('200 OK with deleted student body', async () => {
      repo.deleteStudentById.mockResolvedValueOnce(makeDoc({id: 2000, name: 'Peter', scores: {}}))

      const res = await request(app).delete('/student/2000').expect('Content-Type', /json/).expect(200)
      expect(res.body).toEqual({id: 2000, name: 'Peter', scores: {}})
    })

    test('404 Not Found if the student does not exist', async () => {
      repo.deleteStudentById.mockResolvedValueOnce(null)
      await request(app).delete('/student/404').expect(404)
    })
  })

  describe('PATCH /student/:id (updateStudent)', () => {
    test('200 OK with updated student', async () => {
      repo.updateStudent.mockResolvedValueOnce(makeDoc({id: 2000, name: 'Peter', password: '1234'}))

      const res = await request(app)
        .patch('/student/2000')
        .send({name: 'Peter'})
        .expect('Content-Type', /json/)
        .expect(200)
      expect(res.body).toEqual({id: 2000, name: 'Peter', password: '1234'})
    })

    test('400 Bad Request on invalid body', async () => {
      // Invalid type for the password field (expected string)
      await request(app)
        .patch('/student/2000')
        .send({password: 123})
        .expect('Content-Type', /json/)
        .expect(400)
        .expect(res => {
          expect(res.body).toHaveProperty('error')
        })
    })

    test('404 Not Found if the student is not found', async () => {
      repo.updateStudent.mockResolvedValueOnce(null)
      await request(app)
        .patch('/student/404')
        .send({name: 'X'})
        .expect(404)
    })
  })

  describe('PATCH /score/student/:id (addScore)', () => {
    test('204 No Content on successful score addition', async () => {
      repo.updateStudentScores.mockResolvedValueOnce({ok: 1})

      await request(app)
        .patch('/score/student/2000')
        .send({examName: 'Math', score: 95})
        .expect(204)
    })

    test('204 No Content for boundary score=0', async () => {
      repo.updateStudentScores.mockResolvedValueOnce({ok: 1})
      await request(app)
        .patch('/score/student/2000')
        .send({examName: 'Math', score: 0})
        .expect(204)
    })

    test('204 No Content for boundary score=100', async () => {
      repo.updateStudentScores.mockResolvedValueOnce({ok: 1})
      await request(app)
        .patch('/score/student/2000')
        .send({examName: 'Math', score: 100})
        .expect(204)
    })

    test('204 No Content allows fractional score within range (e.g., 99.5)', async () => {
      repo.updateStudentScores.mockResolvedValueOnce({ok: 1})
      await request(app)
        .patch('/score/student/2000')
        .send({examName: 'Math', score: 99.5})
        .expect(204)
    })

    test('400 Bad Request on invalid body (no score)', async () => {
      await request(app)
        .patch('/score/student/2000')
        .send({examName: 'Math'})
        .expect('Content-Type', /json/)
        .expect(400)
    })

    test('400 Bad Request when score < 0', async () => {
      await request(app)
        .patch('/score/student/2000')
        .send({examName: 'Math', score: -1})
        .expect('Content-Type', /json/)
        .expect(400)
    })

    test('400 Bad Request when score > 100', async () => {
      await request(app)
        .patch('/score/student/2000')
        .send({examName: 'Math', score: 101})
        .expect('Content-Type', /json/)
        .expect(400)
    })

    test('404 Not Found if the student is not found', async () => {
      repo.updateStudentScores.mockResolvedValueOnce(null)
      await request(app)
        .patch('/score/student/404')
        .send({examName: 'Math', score: 90})
        .expect(404)
    })
  })

  describe('GET /students/name/:name (findByName)', () => {
    test('200 OK and a list of students', async () => {
      repo.findStudentsByName.mockResolvedValueOnce([
        makeDoc({id: 1, name: 'Peter', scores: {History: 98}}),
        makeDoc({id: 2, name: 'Peter', scores: {Math: 90, History: 95}}),
      ])

      const res = await request(app).get('/students/name/Peter').expect('Content-Type', /json/).expect(200)
      expect(res.body).toEqual([
        {id: 1, name: 'Peter', scores: {History: 98}},
        {id: 2, name: 'Peter', scores: {Math: 90, History: 95}},
      ])
    })
  })

  describe('GET /quantity/students (countByNames)', () => {
    test('200 OK and number of students (multiple names)', async () => {
      repo.countStudentsByName.mockResolvedValueOnce(1)

      const res = await request(app)
        .get('/quantity/students')
        .query({names: ['Peter', 'John']})
        .expect('Content-Type', /json/)
        .expect(200)

      expect(res.body).toBe(1)
    })

    test('200 OK and number of students (single name as string)', async () => {
      repo.countStudentsByName.mockResolvedValueOnce(3)
      const res = await request(app)
        .get('/quantity/students')
        .query({names: 'Peter'})
        .expect('Content-Type', /json/)
        .expect(200)
      expect(res.body).toBe(3)
    })
  })

  describe('GET /students/exam/:exam/minscore/:minScore (findByMinScore)', () => {
    test('200 OK and list of students for valid params', async () => {
      repo.findStudentsByMinScore.mockResolvedValueOnce([
        makeDoc({id: 2000, name: 'Peter', scores: {History: 92, Math: 77}}),
        makeDoc({id: 4000, name: 'Mary', scores: {History: 98}}),
      ])

      const res = await request(app)
        .get('/students/exam/History/minscore/90')
        .expect('Content-Type', /json/)
        .expect(200)

      expect(res.body).toEqual([
        {id: 2000, name: 'Peter', scores: {History: 92, Math: 77}},
        {id: 4000, name: 'Mary', scores: {History: 98}},
      ])
    })

    test('400 Bad Request for non-numeric minScore', async () => {
      await request(app)
        .get('/students/exam/History/minscore/abc')
        .expect('Content-Type', /json/)
        .expect(400)
    })
  })

  afterAll(() => {
    jest.restoreAllMocks()
  })
})
