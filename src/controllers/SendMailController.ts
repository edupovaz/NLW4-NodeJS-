import { json, Request, Response } from "express";
import { getCustomRepository } from "typeorm";
import { SurveysRepository } from "../repositories/SurveysRepository";
import { SurveyUsersRepository } from "../repositories/SurveysUsersRepository";
import { UserRepository } from "../repositories/UserRepository"
import SendMailService from "../services/SendMailService";
import {resolve} from 'path'
import { AppError } from "../errors/AppError";


class SendMailController {

    async execute(request:Request, response:Response){
        const {email, survey_id} = request.body

        const usersRepository = getCustomRepository(UserRepository)
        const surveyRepository = getCustomRepository(SurveysRepository)
        const surveyUsersRepository = getCustomRepository(SurveyUsersRepository)

        const user = await usersRepository.findOne({email})

        if(!user){
            throw new AppError("Survey already exists!")
        }

        const survey = await surveyRepository.findOne({id:survey_id})

        if(!survey){
            throw new AppError("Survey already exists!")
        }

        const npsPath = resolve(__dirname, "..","views", "emails", "npsmail.hbs")

        const surveyUserAlreadyExists = await surveyUsersRepository.findOne({
            where: {user_id: user.id , value: null}, //Condição de AND
            relations: ["user", "survey"]
        })

        const variables = {
            name: user.name,
            title: survey.title,
            description: survey.description,
            id: "",
            link: process.env.URL_MAIL
        }

        if(surveyUserAlreadyExists){
            variables.id = surveyUserAlreadyExists.id
            await SendMailService.execute(email, survey.title, variables, npsPath)
            return response.json(surveyUserAlreadyExists)
        }

        //Salvar as informaçoes na tabela surveyUser

        const surveyUser = surveyUsersRepository.create({
            user_id: user.id,
            survey_id
        })
        
        
        await surveyUsersRepository.save(surveyUser)
        
        //enviar email para o usuario
        
        variables.id = surveyUser.id

        await SendMailService.execute(email, survey.title,variables, npsPath)
        
        return response.json(surveyUser)
    }
}

export { SendMailController}