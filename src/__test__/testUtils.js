// Common utilities for tests
import express from 'express'

// Mongoose document mock: supports toJSON returning the current state
export const makeDoc = (initial) => {
  const state = {...initial}
  return {
    ...state,
    toJSON() {
      // return a slice of the current state (without methods)
      const {toJSON, ...plain} = this
      return {...plain}
    },
  }
}

// Express app factory for supertest
export const createApp = (router) => {
  const app = express()
  app.use(express.json())
  app.use(router)
  return app
}
