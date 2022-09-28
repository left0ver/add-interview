import React, { ChangeEventHandler, useState } from 'react'
import axios from 'axios'
import xss from 'xss'
import toast, { Toaster } from 'react-hot-toast'
import debounce from 'lodash.debounce'
import './App.css'
function App() {
  const [question, setQuestion] = useState<string>('')
  const baseUrl: string = 'http://localhost:12500'
  let color: string = '#E57373'
  let icon: string = '❗'
  let message: string = '发送失败'
  const changeQuestion: ChangeEventHandler<HTMLTextAreaElement> = event => {
    setQuestion(event.target.value)
  }
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
        '/upload',
        { question: xss(question.trim()) },
        { baseURL: baseUrl, timeout: 5000 },
      )
      color = data.type === 'success' ? '#9CCC65' : '#E57373'
      icon = data.type === 'success' ? '🎉' : '❗'
      message = data.message || '发送失败'
      notify(message, color, icon)
    } catch (error) {
      console.log(error)
      notify(message, color, icon)
    }
  }
  return (
    <>
      <div className="container">
        <div>
          <textarea
            onChange={changeQuestion}
            className="question-input"
            placeholder="请输入面试题"
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
