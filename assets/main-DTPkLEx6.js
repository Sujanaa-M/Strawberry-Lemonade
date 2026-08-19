import{t as e}from"./storage-CqDzK5fc.js";var t=document.getElementById(`focusTaskList`),n=document.getElementById(`habitMiniList`),r=document.getElementById(`sidebarNewTaskBtn`),i=document.getElementById(`newTaskModal`),a=document.getElementById(`modalCloseBtn`),o=document.getElementById(`newTaskForm`);document.addEventListener(`DOMContentLoaded`,()=>{s(),c(),l(),window.addEventListener(`storage`,()=>{s(),c()})});function s(){if(!t)return;t.innerHTML=``;let n=e.getTasks(),r=n.filter(e=>!e.completed),i=n.filter(e=>e.completed),a=[...r,...i].slice(0,5);if(a.length===0){t.innerHTML=`
      <div class="task-item" style="justify-content: center; font-style: italic; color: var(--text-muted);">
        No tasks for today! Sweet days ahead. 🍋
      </div>`;return}a.forEach(n=>{let r=document.createElement(`div`);r.className=`task-item ${n.completed?`completed`:``}`,r.dataset.id=n.id;let i=`tag-personal`;n.category===`work`?i=`tag-work`:n.category===`errands`?i=`tag-errands`:n.category===`health`?i=`tag-health`:n.category===`fun`&&(i=`tag-fun`),r.innerHTML=`
      <div class="task-left">
        <button class="check-circle" aria-label="Toggle completed state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </button>
        <span class="task-text">${u(n.text)}</span>
      </div>
      <span class="tag ${i}">${n.category}</span>
    `,r.querySelector(`.check-circle`).addEventListener(`click`,t=>{t.stopPropagation(),e.toggleTask(n.id),s()}),t.appendChild(r)})}function c(){n&&(n.innerHTML=``,e.getHabits().slice(0,3).forEach(e=>{let t=document.createElement(`div`);t.className=`habit-mini-item`;let r=Math.min(100,Math.round(e.currentValue/e.targetValue*100)),i=2*Math.PI*18,a=i-r/100*i,o=``;o=e.name.toLowerCase().includes(`water`)||e.name.toLowerCase().includes(`hydration`)?`<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 21.5c-4.14 0-7.5-3.36-7.5-7.5 0-3.37 3.33-7.5 7.5-12.75 4.17 5.25 7.5 9.38 7.5 12.75 0 4.14-3.36 7.5-7.5 7.5z"/></svg>`:e.name.toLowerCase().includes(`step`)||e.name.toLowerCase().includes(`walk`)?`<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5H9.5M10.5 8h4.5M12 2a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm-2 18l1.5-6H14l1.5 6m-4-6V10M14 10v4" /></svg>`:e.name.toLowerCase().includes(`read`)||e.name.toLowerCase().includes(`book`)?`<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>`:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 3v1m0 16v1M21 12h-1M4 12H3" stroke-linecap="round"/></svg>`,t.innerHTML=`
      <div class="progress-ring-container">
        <!-- SVG Radial Loading Ring -->
        <svg width="50" height="50" viewBox="0 0 50 50">
          <circle cx="25" cy="25" r="18" fill="transparent" stroke="#FFF2F4" stroke-width="4.5"/>
          <circle class="progress-ring-circle" cx="25" cy="25" r="18" fill="transparent" stroke="var(--accent-pink)" stroke-width="4.5"
            stroke-dasharray="${i}" stroke-dashoffset="${a}" stroke-linecap="round"/>
        </svg>
        <div class="progress-ring-icon">
          ${o}
        </div>
      </div>
      <div class="habit-mini-details">
        <span class="habit-name-mini">${u(e.name)}</span>
        <span class="habit-progress-mini">${e.currentValue.toLocaleString()} / ${e.targetValue.toLocaleString()} ${e.unit}</span>
      </div>
    `,n.appendChild(t)}))}function l(){if(!r||!i||!a||!o)return;let t=()=>{i.classList.add(`active`),document.getElementById(`taskText`).focus()},n=()=>{i.classList.remove(`active`),o.reset()};r.addEventListener(`click`,t),a.addEventListener(`click`,n),i.addEventListener(`click`,e=>{e.target===i&&n()}),o.addEventListener(`submit`,t=>{t.preventDefault();let r=document.getElementById(`taskText`).value,i=document.getElementById(`taskCategory`).value;e.addTask(r,i),n(),s()})}function u(e){return e.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#039;`)}