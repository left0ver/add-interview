import { DataSource } from 'typeorm'
import { databaseInfo } from '../config'
import { Tag } from '../entity/Tag'
import { Question } from '../entity/Question'
export async function initDatabase(isInit: boolean = false) {
  const AppDataSource = new DataSource({
    ...databaseInfo,
    type: 'mysql',
    entities: [Question, Tag],
    synchronize: isInit,
    logging: false,
  })
  try {
    !AppDataSource.isInitialized && (await AppDataSource.initialize())
    console.log('Data Source init successful')
  } catch (error) {
    console.error('Error during Data Source initialization:', error)
  }
  return AppDataSource
}
