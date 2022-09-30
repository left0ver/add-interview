import 'reflect-metadata'
import express from 'express'
import cors from 'cors'
import { DataSource } from 'typeorm'
import { Question } from './entity/Question'
import { databaseInfo, PORT } from './config'
interface InsertData {
  question: string
  isSend: boolean
}
const AppDataSource = new DataSource({
  ...databaseInfo,
  type: 'mysql',
  entities: [Question],
  synchronize: true,
  logging: false,
})

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

app.post('/submit', express.json(), async (req, res) => {
  const { question } = req.body
  try {
    await questionRepository
      .createQueryBuilder()
      .insert()
      .values({ question, isSend: false })
      .execute()
    res.send({ type: 'success', message: '添加成功' })
  } catch (error) {
    console.log(error)
    res.send({ type: 'fail', message: '添加失败' })
  }
})

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
      res.send({ type: 'success', message: '添加成功' })
    } catch (error) {
      console.error(error)
      res.send({ type: 'fail', message: '添加失败' })
    }
  })
})

app.listen(PORT, '127.0.0.1', () => {
  console.log('server start')
})
