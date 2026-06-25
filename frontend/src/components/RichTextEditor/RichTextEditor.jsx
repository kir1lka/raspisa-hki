import { useMemo } from 'react'
import ReactQuill from 'react-quill-new'
import 'react-quill-new/dist/quill.snow.css'
import './RichTextEditor.css'

const MODULES = {
  toolbar: [
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link'],
    ['clean'],
  ],
}
const FORMATS = ['bold', 'italic', 'underline', 'strike', 'list', 'link']

export function richEmpty(html) {
  if (!html) return true
  return html.replace(/<[^>]*>/g, '').replace(/\s|&nbsp;/g, '') === ''
}

function looksLikeHtml(s) {
  return /<[a-z][\s\S]*>/i.test(s || '')
}

function escapeHtml(s) {
  return (s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

export function prepareRichHtml(value) {
  if (!value) return ''
  if (!looksLikeHtml(value)) {
    return escapeHtml(value).replace(/\n/g, '<br>')
  }
  return value.replace(/<a\s/gi, '<a target="_blank" rel="noopener noreferrer" ')
}

export default function RichTextEditor({ value, onChange, placeholder }) {
  const modules = useMemo(() => MODULES, [])
  return (
    <div className="rte">
      <ReactQuill
        theme="snow"
        value={value || ''}
        onChange={onChange}
        modules={modules}
        formats={FORMATS}
        placeholder={placeholder}
      />
    </div>
  )
}

export function RichText({ value, className = '' }) {
  return (
    <div
      className={'rte-content ' + className}
      dangerouslySetInnerHTML={{ __html: prepareRichHtml(value) }}
    />
  )
}
