import React, { ChangeEventHandler, useCallback, useState } from 'react'
import axios from 'axios'
import xss from 'xss'
import toast, { Toaster } from 'react-hot-toast'
import debounce from 'lodash.debounce'
import { useDropzone } from 'react-dropzone'
import { Line } from 'rc-progress'
import { baseUrl } from './config'
import './App.css'

function App() {
  let color: string = '#E57373'
  let icon: string = '❗'
  let message: string = '发送失败'

  const [question, setQuestion] = useState<string>('')
  const [percent, setPercent] = useState<number>(0)

  const changeQuestion: ChangeEventHandler<HTMLTextAreaElement> = event => {
    setQuestion(event.target.value)
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
  // 提交
  const submit = async () => {
    if (question.trim().length === 0) {
      notify('请输入具体的面试题', '#FFCA28', '💡')
      setQuestion('')
      return
    }
    try {
      const { data } = await axios.post<{
        type: 'success' | 'fail'
        message: string
      }>(
        '/submit',
        { question: xss(question.trim()) },
        { baseURL: baseUrl, timeout: 5000 },
      )
      color = data.type === 'success' ? '#9CCC65' : '#E57373'
      icon = data.type === 'success' ? '🎉' : '❗'
      message = data.message || '发送失败'
      notify(message, color, icon)
    } catch (error) {
      notify(message, color, icon)
    }
  }
  // 文件上传
  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach(file => {
      const reader = new FileReader()
      reader.onabort = () => console.log('file reading was aborted')
      reader.onloadstart = () => {
        setPercent(0)
      }
      reader.onerror = () => {
        notify('文件读取失败', '#E57373', '❗')
      }

      reader.onload = async () => {
        const formData = new FormData()
        formData.append('file', file)
        try {
          const { data } = await axios.post('/upload', formData, {
            timeout: 5000,
            baseURL: baseUrl,
            onUploadProgress(event: ProgressEvent<FileReader>) {
              setPercent(Math.round((event.loaded / event.total) * 100))
              console.log(event)
            },
          })
          color = data.type === 'success' ? '#9CCC65' : '#E57373'
          icon = data.type === 'success' ? '🎉' : '❗'
          message = data.message || '发送失败'
          notify(message, color, icon)
        } catch (error) {
          notify(message, color, icon)
        }
      }
      reader.readAsArrayBuffer(file)
    })
  }, [])

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    maxSize: 1024 * 1024 * 5, // 5M
    accept: { 'text/plain': ['.txt'] },
    // 上传的不是.txt文件
    onDropRejected() {
      notify('只能上传txt类型的文件', '#E57373', '❗')
    },
  })
  return (
    <>
      <div className="container">
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
            rows={15}></textarea>
        </div>
        <div className="submit-wrap">
          <button onClick={debounce(submit, 800)} className="submit">
            提交
          </button>
        </div>
        <footer>
          copyright© 2022 by <a href="https://github.com/left0ver">leftover</a>
          &nbsp; 💕
        </footer>
      </div>
      <Toaster />
    </>
  )
}

export default App
