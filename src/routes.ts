import { Router } from 'express'
import { AnswerController } from './controllers/AnswerController'
import { NpsController } from './controllers/NpsController'
import { SendMailController } from './controllers/SendMailController'
import { SurveysController } from './controllers/SurveyController'
import { UserController } from "./controllers/UserController"

const router = Router()

const userController = new UserController()
const surveysController = new SurveysController()
const sendMailController = new SendMailController()
const answerController = new AnswerController()
const npsController = new NpsController

router.post("/users", userController.create)

router.get("/surveys", surveysController.show)
router.get("/answers/:value", answerController.execute)
router.post("/surveys", surveysController.create)
router.post("/sendMail", sendMailController.execute)
router.get("/nps/:survey_id", npsController.execute)

export { router }