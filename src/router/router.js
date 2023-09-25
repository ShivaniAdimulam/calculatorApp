const express = require('express')
const router = express.Router()
const opController = require('../controller/operationCont')




router.post('/init' ,opController.initialPhase)

router.post('/operation' ,opController.nextOperations)

router.put('/undo' ,opController.undoOperation )

router.get('/reset',opController.resetOperation)



module.exports = router