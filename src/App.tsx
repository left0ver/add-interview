import React, { ChangeEventHandler, useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import xss from 'xss'
import toast, { Toaster } from 'react-hot-toast'
import debounce from 'lodash.debounce'
import { read, utils } from 'xlsx'
import { useDropzone } from 'react-dropzone'
import { Line } from 'rc-progress'
import './App.css'

interface ResponseData {
  type: 'success' | 'fail'
  message: string
}
interface inputData {
  question: string
  tags: string[]
}

// 消息通知
const notify = (message: string, color: string, icon: string) => {
  toast(message, {
    duration: 2500,
    position: 'top-center',
    icon,
    style: {
      width: '200px',
      height: '20px',
      color,
      fontSize: '14px',
      textAlign: 'center',
    },
  })
}
const parse = (inputQuestion: string, inputTags: string) => {
  const question = inputQuestion
  const tags = xss(inputTags).split(/,|，/)
  return { question, tags }
}

function App() {
  let color: string = '#E57373'
  let icon: string = '❗'
  let message: string = '发送失败'
  const baseUrl = process.env.BASE_URL
  const isHttps = process.env.HTTPS ==='true' ? true :false
  useEffect(()=>{
    if (isHttps) {
      if (!baseUrl?.startsWith('https')) {
        notify('您设置了https为true,请将请求的url替换为https',color,icon)
      }
    }else {
      //非https
      if (baseUrl?.startsWith('https')) {
        notify('您设置了https为false,请将请求的url替换为http',color,icon)
      }
    }},[baseUrl, color, icon, isHttps])
  const [inputData, setInputData] = useState<string>('')
  const [percent, setPercent] = useState<number>(0)
  const [ip, setIp] = useState('')
  const [databaseName, setDatabaseName] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [port, setPort] = useState('')

  const changeQuestion: ChangeEventHandler<HTMLTextAreaElement> = event => {
    setInputData(event.target.value)
  }
  const handleIpChange: ChangeEventHandler<HTMLInputElement> = event => {
    setIp(event.target.value)
  }
  const handleDatabaseChange: ChangeEventHandler<HTMLInputElement> = event => {
    setDatabaseName(event.target.value)
  }
  const handleUsernameChange: ChangeEventHandler<HTMLInputElement> = event => {
    setUsername(event.target.value)
  }
  const handlePasswordChange: ChangeEventHandler<HTMLInputElement> = event => {
    setPassword(event.target.value)
  }
  const handlePortChange: ChangeEventHandler<HTMLInputElement> = event => {
    setPort(event.target.value)
  }

  const submitData = useCallback(async (
    ip: string,
    username: string,
    databaseName: string,
    password: string,
    port: string,
    model: inputData[],
    config?: Record<string, any>,
  ) => {
    try {
      if (password.trim() === '') {
        notify('请输入密码', color, icon)
        return
      }
      const { data } = await axios.post<ResponseData>(
        '/upload',
        {
          databaseInfo: {
            host: xss(ip),
            username: xss(username),
            database: xss(databaseName),
            password: xss(password),
            port: parseInt(xss(port)),
          },
          model,
        },
        { baseURL: baseUrl, timeout: 5000, ...config },
      )
      color = data.type === 'success' ? '#9CCC65' : '#E57373'
      icon = data.type === 'success' ? '🎉' : '❗'
      message = data.message || '发送失败'
      setInputData('')
      notify(message, color, icon)
    } catch (error) {
      notify(message, color, icon)
    }
  },[])

  // 提交
  // question: xxx-css,js

  const submit = async () => {
    const data = inputData.split('-')
    const { question, tags } = parse(data[0], data[1])
    const model = [{ question, tags }]
    if (question.trim().length === 0) {
      notify('请输入具体的面试题', '#FFCA28', '💡')
      setInputData('')
      return
    }
    try {
      await submitData(ip, username, databaseName, password, port, model)
    } catch (error) {
      console.error(error)
    }
  }
  // 文件上传
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      acceptedFiles.forEach(file => {
        const reader = new FileReader()
        reader.onabort = () => console.log('file reading was aborted')
        reader.onloadstart = () => {
          setPercent(0)
        }
        reader.onerror = error => {
          console.error(error)
          notify('文件读取失败', '#E57373', '❗')
        }
        reader.onload = async () => {
          const wb = read(reader.result) // parse the array buffer
          const ws = wb.Sheets[wb.SheetNames[0]] // get the first worksheet
          const data = utils.sheet_to_json<{ question: string; tags: string }>(ws)
          const model =data.map(item=>{
            return parse(item.question, item.tags)
          })
          await submitData(ip, username, databaseName, password, port, model, {
            onUploadProgress(event: ProgressEvent<FileReader>) {
              setPercent(Math.round((event.loaded / event.total) * 100))
            },
          })
        }
        reader.readAsArrayBuffer(file)
      })
    },
    [databaseName, ip, password, port, submitData, username],
  )

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    maxSize: 1024 * 1024 * 10, // 10M
    // 只允许上传.xlsx，.csv，.xls的文件
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx','.csv','.xls'],
    },
    // 上传的不是.xlsx，.csv，.xls类型的文件
    onDropRejected() {
      notify('只能上传.xlsx，.csv，.xls类型的文件', '#E57373', '❗')
    },
  })
  return (
    <>
      <div className="app-container">
        <div className="database-info">
          <div className="database-input">
            <span>服务器ip地址:</span>
            <input type="text" value={ip} onChange={handleIpChange} />
          </div>
          <div className="database-input">
            <span>数据库名称:</span>
            <input
              type="text"
              value={databaseName}
              onChange={handleDatabaseChange}
            />
          </div>
          <div className="database-input">
            <span>数据库用户名:</span>
            <input
              type="text"
              value={username}
              onChange={handleUsernameChange}
            />
          </div>
          <div className="database-input">
            <span>数据库密码:</span>
            <input
              type="password"
              value={password}
              onChange={handlePasswordChange}
            />
          </div>
          <div className="database-input">
            <span>数据库端口号:</span>
            <input type="text" value={port} onChange={handlePortChange} />
          </div>
        </div>
        <div className="upload-container">
          <div {...getRootProps({ className: 'upload' })}>
            <div className="icon">+</div>
            <input {...getInputProps()} />
            <div>
              <span>拖拽或者点击上传txt文件(文件中一行一个题目)</span>
            </div>
          </div>
          <div className="progress-wrap">
            <div className="progress">
              <Line percent={percent} strokeWidth={5} />
            </div>
            <div>
              <span>{percent}%</span>
            </div>
          </div>
          <div>
            <textarea
              onChange={changeQuestion}
              className="question-input"
              placeholder="手动录入,请输入面试题,点击提交"
              maxLength={1024}
              minLength={1}
              cols={45}
              value={inputData}
              rows={15}></textarea>
          </div>
          <div className="submit-wrap">
            <button onClick={debounce(submit, 800)} className="submit">
              提交
            </button>
          </div>
          <footer>
            copyright© 2022 by{' '}
            <a href="https://github.com/left0ver">leftover</a>
            &nbsp; 💕
          </footer>
        </div>
      </div>

      <Toaster />
    </>
  )
}

export default App
