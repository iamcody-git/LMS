import express from 'express'
import { checkHealth } from '../Controllers/healthController.js'

const router = express.Router()

router.get('/',checkHealth)

export default router;