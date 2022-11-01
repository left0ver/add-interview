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
import type { Repository } from 'typeorm'

interface InsertData {
  question: string
  isSend: boolean
}

const args = process.argv.slice(2)
let dotenvConfigPath: string = ''
for (const arg of args) {
  const value = arg.split('=')
  if (value[0] === 'dotenv_config_path') {
    dotenvConfigPath = value[1]
  }
}
dotenv.config({ path: dotenvConfigPath, encoding: 'utf-8' })
const isHttps = process.env.HTTPS === 'true' ? true : false


const app = express()
app.use(cors())

// 手动录入
// app.post('/submit', express.json(), async (req, res) => {
//   const { question } = req.body
//   try {
//     await questionRepository
//       .createQueryBuilder()
//       .insert()
//       .values({ question, isSend: false })
//       .execute()
//     res.json({ type: 'success', message: '添加成功' })
//   } catch (error) {
//     console.log(error)
//     res.json({ type: 'fail', message: '添加失败' })
//   }
// })

// 文件上传
// app.post('/upload', (req, res) => {
//   const enc = new TextDecoder('utf-8')
//   let result: string = ''
//   req.on('data', chunk => {
//     result += enc.decode(chunk)
//   })
//   req.on('end', async () => {
//     const rowData = result.split('\n')
//     const insertData: InsertData[] = []
//     for (let i = 0; i < rowData.length; i++) {
//       const question: string = rowData[i].trim()
//       if (question !== '') {
//         insertData.push({ question, isSend: false })
//       }
//     }
//     try {
//       await questionRepository
//         .createQueryBuilder()
//         .insert()
//         .values(insertData)
//         .execute()
//       res.json({ type: 'success', message: '添加成功' })
//     } catch (error) {
//       console.error(error)
//       res.json({ type: 'fail', message: '添加失败' })
//     }
//   })
// })

app.post('/upload1', express.json(), async (req, res) => {
  const AppDataSource = await initDatabase(true)
  const questionRepository = AppDataSource.getRepository(Question)
  const tagRepository = AppDataSource.getRepository(Tag)
  const { model } = req.body
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
  res.send("success")
})

if (isHttps) {
  // https
  const httpsOption = {
    key: fs.readFileSync(process.env.HTTPS_KEY || ''),
    cert: fs.readFileSync(process.env.HTTPS_CERT || ''),
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
