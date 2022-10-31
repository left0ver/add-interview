import 'reflect-metadata'
import fs from 'fs'
import express from 'express'
import cors from 'cors'
import https from 'https'
import dotenv from 'dotenv'
import { DataSource } from 'typeorm'
import { Question } from './entity/Question'
import { databaseInfo, PORT } from './config'
import {Tag} from './entity/Tag'
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
const AppDataSource = new DataSource({
  ...databaseInfo,
  type: 'mysql',
  entities: [Question,Tag],
  synchronize: false,
  logging: false,
})

!AppDataSource.isInitialized &&
  AppDataSource.initialize()
    .then(() => {
      console.log('Data Source init successful')
    })
    .catch(err => {
      console.error('Error during Data Source initialization:', err)
    })

const questionRepository = AppDataSource.getRepository(Question)
const app = express()
app.use(cors())

// 手动录入
app.post('/submit', express.json(), async (req, res) => {
  const { question } = req.body
  try {
    await questionRepository
      .createQueryBuilder()
      .insert()
      .values({ question, isSend: false })
      .execute()
    res.json({ type: 'success', message: '添加成功' })
  } catch (error) {
    console.log(error)
    res.json({ type: 'fail', message: '添加失败' })
  }
})

// 文件上传
app.post('/upload', (req, res) => {
  const enc = new TextDecoder('utf-8')
  let result: string = ''
  req.on('data', chunk => {
    result += enc.decode(chunk)
  })
  req.on('end', async () => {
    const rowData = result.split('\n')
    const insertData: InsertData[] = []
    for (let i = 0; i < rowData.length; i++) {
      const question: string = rowData[i].trim()
      if (question !== '') {
        insertData.push({ question, isSend: false })
      }
    }
    try {
      await questionRepository
        .createQueryBuilder()
        .insert()
        .values(insertData)
        .execute()
      res.json({ type: 'success', message: '添加成功' })
    } catch (error) {
      console.error(error)
      res.json({ type: 'fail', message: '添加失败' })
    }
  })
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
    console.log('server start')
  })
}
