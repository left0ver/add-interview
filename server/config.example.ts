import process from 'process'
const __DEV__ = process.env.NODE_ENV === 'production' ? false : true

interface DataBaseInfo {
  host: string
  username: string
  port: number
  password: string
  database: string
}
// 生产环境下的数据库配置
const productionDataBaseInfo: DataBaseInfo = {
  host: 'localhost',
  username: 'root',
  port: 3306,
  password: '',
  database: '',
}
// 开发环境下的数据库配置
const developmentDataBaseInfo: DataBaseInfo = {
  host: 'localhost', //ip地址
  username: 'root', //用户名
  port: 3306, //端口号
  password: '', //密码
  database: '', //对应的数据库的名称
}
const databaseInfo = __DEV__ ? developmentDataBaseInfo : productionDataBaseInfo
export { databaseInfo }
