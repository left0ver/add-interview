import 'reflect-metadata'
import fs from 'fs'
import express from 'express'
import cors from 'cors'
import https from 'https'
import dotenv from 'dotenv'
import { Question } from './entity/Question'
import { Tag } from './entity/Tag'
import { PORT } from './config'
import { initDatabase } from './utils/index'


dotenv.config()
const isHttps = process.env.HTTPS === 'true' ? true : false

const app = express()
app.use(cors())

app.post('/upload', express.json(), async (req, res) => {
  const { model, databaseInfo } = req.body
  if (databaseInfo.password.trim() === '') {
    res.json({ type: "fail", message: "缺少密码" })
    return;
  }

  databaseInfo.host = databaseInfo.host || 'localhost'
  databaseInfo.port = databaseInfo.port || 3306
  databaseInfo.username = databaseInfo.username || 'root'
  databaseInfo.database = databaseInfo.database || 'qqrot'

  const AppDataSource = await initDatabase(databaseInfo, true)
  const questionRepository = AppDataSource.getRepository(Question)
  const tagRepository = AppDataSource.getRepository(Tag)
  try {
    for (let i = 0, len = model.length; i < len; i++) {
      const inputQuestion = model[i].question
      const inputTags: Tag[] = []
      for (let j = 0; j < model[i].tags.length; j++) {
        // 处理tag
        const tagName = model[i].tags[j]
        const maxId = await tagRepository.createQueryBuilder('tag').getCount()
        const tagResult = await tagRepository.createQueryBuilder('tag').select('tag.tagId').where({ tagName }).getOne()
        // 如果已经有了这个分类，则使用这个分类，否则新建分类
        const id = tagResult?.tagId || maxId + 1
        const tag = new Tag()
        tag.tagId = id
        tag.tagName = tagName
        await tagRepository.save(tag, { reload: true })
        inputTags.push(tag)
      }
      const question = new Question()
      question.question = inputQuestion
      question.tags = inputTags
      question.isSend = false
      await questionRepository.save(question)
    }
    res.json({ type: 'success', message: '添加成功' })
  } catch (error) {
    res.json({ type: 'fail', message: '添加失败' })
  }
})

if (isHttps) {
  // https
  const httpsOption = {
    key: fs.readFileSync(process.env.SSL_KEY_FILE || ''),
    cert: fs.readFileSync(process.env.SSL_CRT_FILE || ''),
  }
  https.createServer(httpsOption, app).listen(PORT, '0.0.0.0', () => {
    console.log('server start')
  })
} else {
  // http
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`server start and listening on port ${PORT}`)
  })
}
