import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchGroupsList } from '../../api'
import { clearUser } from '../../auth'
import { isoLocal } from '../../dates'
import './AttendanceJournal.css'

async function request(path, options = {}) {
  const res = await fetch(`/api/attendance${path}`, { ...options, cache: 'no-store', headers: { 'Content-Type': 'application/json', 'X-Attendance-Request': '1' } })
  if (!res.ok) {
    let message = res.status === 401 ? 'Войдите заново, чтобы открыть журнал.' : 'Не удалось сохранить или загрузить журнал. Попробуйте ещё раз.'
    try { const body = await res.json(); if (body.error && res.status !== 401) message = body.error } catch { /* Keep fallback. */ }
    const error = new Error(message); error.status = res.status; throw error
  }
  return res.status === 204 ? null : res.json()
}
const cellKey = (studentId, lessonId, date) => `${studentId}:${lessonId}:${date}`

export default function AttendanceJournal() {
  const navigate = useNavigate()
  const [groups, setGroups] = useState([])
  const [groupId, setGroupId] = useState('')
  const [month, setMonth] = useState(() => isoLocal(new Date()).slice(0, 7))
  const [journal, setJournal] = useState(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [notice, setNotice] = useState('')
  const [revision, setRevision] = useState(0)
  const [names, setNames] = useState('')
  const [rosterOpen, setRosterOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [subject, setSubject] = useState('')
  const [showArchived, setShowArchived] = useState(false)

  useEffect(() => {
    let active = true
    fetchGroupsList().then(data => {
      if (!active) return
      setGroups(data); setGroupId(current => data.some(g => String(g.id) === current) ? current : String(data[0]?.id || ''))
      if (!data.length) setLoading(false)
    }).catch(err => { if (active) { setError(err); setLoading(false) } })
    return () => { active = false }
  }, [revision])

  useEffect(() => {
    if (!groupId || !month) return
    const controller = new AbortController()
    setLoading(true); setError(null); setJournal(null); setNotice('')
    request(`?groupId=${groupId}&month=${month}`, { signal: controller.signal })
      .then(data => { if (!controller.signal.aborted) setJournal(data) })
      .catch(err => { if (!controller.signal.aborted) setError(err) })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [groupId, month, revision])

  async function save(action, success) {
    setBusy(true); setError(null); setNotice('')
    try { await action(); success?.(); setNotice('Сохранено') }
    catch (err) { setError(err) }
    finally { setBusy(false) }
  }
  function changeMark(student, col, value) {
    save(() => request('/marks', { method: 'PUT', body: JSON.stringify({ studentId: student.id, lessonId: col.lessonId, date: col.date, value }) }), () => {
      setJournal(current => ({ ...current, marks: [...current.marks.filter(m => cellKey(m.studentId, m.lessonId, m.lessonDate) !== cellKey(student.id, col.lessonId, col.date)),
        ...(value ? [{ studentId: student.id, lessonId: col.lessonId, lessonDate: col.date, mark: value }] : [])] }))
    })
  }
  function addStudents(event) {
    event.preventDefault()
    const list = names.split('\n').map(name => name.trim()).filter(Boolean)
    save(() => request(`/students?groupId=${groupId}`, { method: 'POST', body: JSON.stringify({ names: list }) }), () => { setNames(''); setRevision(n => n + 1) })
  }
  function updateStudent(archived) {
    save(() => request(`/students/${editing.id}`, { method: 'PUT', body: JSON.stringify({ name: editing.name, archived }) }), () => { setEditing(null); setRevision(n => n + 1) })
  }
  const subjects = [...new Set(journal?.columns.map(c => c.subject) || [])]
  const columns = journal?.columns.filter(c => !subject || c.subject === subject) || []
  const values = new Map(journal?.marks.map(m => [cellKey(m.studentId, m.lessonId, m.lessonDate), m.mark]) || [])
  const markedStudents = new Set(journal?.marks.map(m => m.studentId) || [])
  const visibleStudents = journal?.students.filter(s => !s.archived || showArchived || markedStudents.has(s.id)) || []

  return <div className="attendance-journal">
    <div className="attendance-toolbar">
      <label>Группа<select value={groupId} disabled={busy} onChange={e => { setGroupId(e.target.value); setSubject(''); setEditing(null); setNames('') }}><option value="" disabled>Выберите группу</option>{groups.map(g => <option key={g.id} value={g.id}>{g.number}</option>)}</select></label>
      <label>Месяц<input aria-label="Месяц журнала" type="month" min="2000-01" max="2100-12" required value={month} disabled={busy} onChange={e => { if (e.target.value) setMonth(e.target.value) }} /></label>
      <label>Предмет<select value={subject} disabled={busy || loading} onChange={e => setSubject(e.target.value)}><option value="">Все предметы</option>{subjects.map(s => <option key={s}>{s}</option>)}</select></label>
      <button type="button" disabled={busy || !journal} onClick={() => setRosterOpen(v => !v)} aria-expanded={rosterOpen}>Список учеников</button>
      <button type="button" disabled={busy || loading} onClick={() => { setSubject(''); setRevision(n => n + 1) }}>Обновить</button>
    </div>
    <p className="attendance-help">Даты берутся из расписания группы. Н — отсутствовал, П — присутствовал, 1–5 — оценка. Пустая ячейка — ещё не отмечено.</p>
    {error && <div className="attendance-error" role="alert">{error.message}{error.status === 401 && <button type="button" onClick={() => { clearUser(); navigate('/login') }}>Войти</button>}</div>}
    <div role="status" className="attendance-status">{busy ? 'Сохраняем…' : loading ? 'Загружаем журнал…' : notice}</div>
    {!loading && !groups.length && !error && <p>Сначала создайте группу в расписании школы, затем нажмите «Обновить».</p>}
    {journal && <>
      {rosterOpen && <div className="attendance-roster">
        <form onSubmit={addStudents}><label htmlFor="attendance-names">Добавить учеников — каждый с новой строки</label><textarea id="attendance-names" rows={4} value={names} onChange={e => setNames(e.target.value)} placeholder={'Иванов Иван\nПетрова Анна'} disabled={busy} required /><button disabled={busy || !names.trim()}>Добавить в группу</button></form>
        <p className="attendance-help">Чтобы исправить имя или убрать ученика из списка, нажмите на его имя в таблице. Старые отметки сохранятся в архиве.</p>
        <label><span><input type="checkbox" checked={showArchived} onChange={e => setShowArchived(e.target.checked)} /> Показать учеников из архива</span></label>
      </div>}
      {editing && <form className="attendance-student-edit" onSubmit={e => { e.preventDefault(); updateStudent(editing.archived) }}>
        <label>Имя ученика<input value={editing.name} maxLength={150} required onChange={e => setEditing({ ...editing, name: e.target.value })} disabled={busy} /></label>
        <button disabled={busy}>Сохранить имя</button>
        <button type="button" disabled={busy} onClick={() => updateStudent(!editing.archived)}>{editing.archived ? 'Вернуть в список' : 'В архив (сохранить отметки)'}</button>
        <button className="attendance-delete" type="button" disabled={busy} onClick={() => setDeleteId(editing.id)}>Удалить ученика</button>
        <button type="button" disabled={busy} onClick={() => { setEditing(null); setDeleteId(null) }}>Закрыть</button>
        {deleteId === editing.id && <div className="attendance-delete-confirm" role="alert">
          <p>Удалить ученика «{editing.name}» из группы? Все его отметки за все месяцы тоже будут удалены. Это действие нельзя отменить. Чтобы сохранить историю, выберите архив.</p>
          <button type="button" disabled={busy} onClick={() => setDeleteId(null)}>Отмена</button>
          <button className="attendance-delete" type="button" disabled={busy} onClick={() => save(() => request(`/students/${editing.id}`, { method: 'DELETE' }), () => { setEditing(null); setDeleteId(null); setRevision(n => n + 1) })}>Удалить вместе с отметками</button>
        </div>}
      </form>}
      {!visibleStudents.length && <div className="attendance-empty"><strong>В группе пока нет учеников</strong><p>Добавьте список, чтобы начать отмечать посещаемость.</p><button type="button" onClick={() => setRosterOpen(true)}>Добавить учеников</button></div>}
      {!columns.length && <p className="attendance-help">В выбранном месяце нет занятий{subject ? ' по этому предмету' : ''}. Проверьте расписание, праздники и каникулы.</p>}
      {!!visibleStudents.length && <div className="attendance-scroll" tabIndex={0} role="region" aria-label="Таблица посещаемости">
        <table><caption className="sr-only">Посещаемость группы {groups.find(g => String(g.id) === groupId)?.number}, {month}</caption><thead><tr><th scope="col" className="attendance-name">Ученик <span>· {visibleStudents.length}</span></th>{columns.map(col => <th scope="col" key={`${col.lessonId}:${col.date}`}><strong>{col.date.slice(8)}.{col.date.slice(5, 7)}</strong><small>{col.time?.slice(0, 5)}</small><span>{col.subject}</span>{col.historical && <small>Из истории</small>}</th>)}</tr></thead>
          <tbody>{visibleStudents.map((student, index) => <tr key={student.id}><th scope="row" className="attendance-name"><button disabled={busy} onClick={() => setEditing({ ...student })}>{index + 1}. {student.name}</button>{student.archived && <small>В архиве</small>}</th>{columns.map(col => {
            const value = values.get(cellKey(student.id, col.lessonId, col.date)) || ''
            return <td key={`${col.lessonId}:${col.date}`} data-mark={value}><select aria-label={`${student.name}, ${col.date}, ${col.subject}, ${col.time || ''}`} value={value} disabled={busy || (student.archived && !value) || (col.historical && !value)} onChange={e => changeMark(student, col, e.target.value)}><option value="">—</option>{['Н', 'П', '1', '2', '3', '4', '5'].map(mark => <option key={mark}>{mark}</option>)}</select></td>
          })}</tr>)}</tbody></table>
      </div>}
    </>}
  </div>
}
