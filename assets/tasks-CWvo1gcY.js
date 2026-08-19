import{t as e}from"./storage-Zs3SgMY6.js";var t=document.getElementById(`allTasksContainer`),n=document.getElementById(`tasksPercentageText`),r=document.getElementById(`tasksProgressBarInner`),i=document.querySelectorAll(`.filter-btn`),a=document.getElementById(`quickSqueezeForm`),o=document.getElementById(`quickTaskText`),s=document.getElementById(`quickTaskCategory`),c=document.getElementById(`sidebarNewTaskBtn`),l=document.getElementById(`newTaskModal`),u=document.getElementById(`modalCloseBtn`),d=document.getElementById(`newTaskForm`),f=`all`;document.addEventListener(`DOMContentLoaded`,()=>{p(),m(),h(),window.addEventListener(`storage`,()=>{p()})});function p(){if(!t)return;t.innerHTML=``;let i=e.getTasks(),a=i.length,o=i.filter(e=>e.completed).length,s=a>0?Math.round(o/a*100):40;n&&(n.textContent=`${s}%`),r&&(r.style.width=`${s}%`);let c=i.filter(e=>f===`all`||e.category===f);if(c.length===0){t.innerHTML=`
      <div class="task-item" style="justify-content: center; font-style: italic; color: var(--text-muted);">
        No tasks in this category. Squeeze details to create one! 🍋
      </div>`;return}[...c.filter(e=>!e.completed),...c.filter(e=>e.completed)].forEach(n=>{let r=document.createElement(`div`);r.className=`task-item ${n.completed?`completed`:``}`,r.dataset.id=n.id;let i=`tag-personal`;n.category===`work`?i=`tag-work`:n.category===`errands`?i=`tag-errands`:n.category===`health`?i=`tag-health`:n.category===`fun`&&(i=`tag-fun`),r.innerHTML=`
      <div class="task-left">
        <button class="check-circle" aria-label="Toggle completed state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </button>
        <span class="task-text">${g(n.text)}</span>
      </div>
      <div style="display: flex; align-items: center; gap: 12px;">
        <span class="tag ${i}">${n.category}</span>
        <!-- Trash delete icon button -->
        <button class="icon-button delete-task-btn" aria-label="Delete task" style="width: 32px; height: 32px; color: #D1A4B2;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
        </button>
      </div>
    `,r.querySelector(`.check-circle`).addEventListener(`click`,t=>{t.stopPropagation(),e.toggleTask(n.id),p()}),r.querySelector(`.delete-task-btn`).addEventListener(`click`,t=>{t.stopPropagation(),e.deleteTask(n.id),p()}),t.appendChild(r)})}function m(){i.forEach(e=>{e.addEventListener(`click`,()=>{i.forEach(e=>e.classList.remove(`active`)),e.classList.add(`active`),f=e.dataset.filter,p()})})}function h(){if(a&&a.addEventListener(`submit`,t=>{t.preventDefault();let n=o.value,r=s.value;n.trim()&&(e.addTask(n,r),o.value=``,p())}),c&&l&&u&&d){c.addEventListener(`click`,()=>{l.classList.add(`active`),document.getElementById(`taskText`).focus()});let t=()=>{l.classList.remove(`active`),d.reset()};u.addEventListener(`click`,t),l.addEventListener(`click`,e=>{e.target===l&&t()}),d.addEventListener(`submit`,n=>{n.preventDefault();let r=document.getElementById(`taskText`).value,i=document.getElementById(`taskCategory`).value;e.addTask(r,i),t(),p()})}}function g(e){return e.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#039;`)}