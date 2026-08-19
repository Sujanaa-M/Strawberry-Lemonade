import{t as e}from"./storage-CqDzK5fc.js";var t=document.getElementById(`statTotalTasks`),n=document.getElementById(`statLongestStreak`),r=document.getElementById(`statHabitsMastered`),i=document.getElementById(`statCurrentLevel`),a=document.getElementById(`weeklyGoalList`),o=document.getElementById(`weeklyGoalsCount`),s=document.getElementById(`addWeeklyGoalForm`),c=document.getElementById(`newWeeklyGoalInput`),l=document.getElementById(`badgesPreviewGrid`),u=document.getElementById(`badgesPreviewSubtitle`),d=document.getElementById(`viewBadgesAnchor`),f=document.getElementById(`allBadgesModal`),p=document.getElementById(`badgesModalCloseBtn`),m=document.getElementById(`badgesModalSubtitle`),h=document.getElementById(`allBadgesGrid`),g=document.querySelectorAll(`.badge-filter-btn`),_=`all`,v=document.getElementById(`btnWeeklyChart`),y=document.getElementById(`btnMonthlyChart`),b=document.getElementById(`svgYellowCurve`),x=document.getElementById(`svgPinkCurve`),S=document.getElementById(`svgScatterPoints`),C=document.getElementById(`sidebarNewTaskBtn`),w=document.getElementById(`newTaskModal`),T=document.getElementById(`modalCloseBtn`),E=document.getElementById(`newTaskForm`);document.addEventListener(`DOMContentLoaded`,()=>{D(),O(),P(),k(),F(),A(`weekly`),M(),N(),window.addEventListener(`storage`,()=>{D(),O(),P(),f&&f.classList.contains(`active`)&&I(_),A(`weekly`)})});function D(){let a=e.getStats();t&&(t.textContent=a.totalTasksCompleted),n&&(n.textContent=`${a.longestStreak} Days`),r&&(r.textContent=a.habitsMastered),i&&(i.textContent=`Lvl ${a.currentLevel}`)}function O(){if(!a)return;a.innerHTML=``;let t=e.getWeeklyGoals(),n=t.filter(e=>e.completed).length;if(o&&(o.textContent=`${n} / ${t.length} done`),t.length===0){let e=document.createElement(`div`);e.className=`weekly-goal-empty`,e.innerHTML=`
      <span>🍋</span>
      No goals yet for this week!<br>Add your top priorities above.
    `,a.appendChild(e);return}t.forEach(t=>{let n=document.createElement(`div`);n.className=`weekly-goal-item ${t.completed?`completed`:``}`,n.dataset.id=t.id,n.innerHTML=`
      <div class="weekly-goal-left" role="button" tabindex="0" title="Toggle goal completion">
        <div class="weekly-goal-checkbox" aria-label="Toggle goal status">
          <svg viewBox="0 0 24 24">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <span class="weekly-goal-name">${L(t.text)}</span>
      </div>
      <button class="weekly-goal-delete-btn" aria-label="Delete goal" title="Delete goal">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
      </button>
    `;let r=n.querySelector(`.weekly-goal-left`),i=()=>{e.toggleWeeklyGoal(t.id),O()};r.addEventListener(`click`,i),r.addEventListener(`keydown`,e=>{(e.key===`Enter`||e.key===` `)&&(e.preventDefault(),i())}),n.querySelector(`.weekly-goal-delete-btn`).addEventListener(`click`,n=>{n.stopPropagation(),e.deleteWeeklyGoal(t.id),O()}),a.appendChild(n)})}function k(){!s||!c||s.addEventListener(`submit`,t=>{t.preventDefault();let n=c.value.trim();n&&(e.addWeeklyGoal(n),c.value=``,O())})}function A(e){if(!b||!x||!S)return;S.innerHTML=``;let t=[],n=[];if(e===`weekly`)t=[{x:50,y:165},{x:133,y:145},{x:216,y:130},{x:299,y:105},{x:382,y:85},{x:465,y:92},{x:548,y:108}],n=[{x:50,y:145},{x:133,y:135},{x:216,y:155},{x:299,y:135},{x:382,y:125},{x:465,y:110},{x:548,y:65}],document.getElementById(`consistencySvg`).setAttribute(`viewBox`,`0 0 600 240`);else for(let e=0;e<15;e++){let r=50+e*35.714285714285715,i=90+Math.sin(e*.8)*35+Math.cos(e*.4)*15,a=120+Math.cos(e*.8)*45+Math.sin(e*.3)*10;t.push({x:r,y:i}),n.push({x:r,y:a})}b.setAttribute(`d`,j(t)),x.setAttribute(`d`,j(n)),t.forEach(e=>{let t=document.createElementNS(`http://www.w3.org/2000/svg`,`circle`);t.setAttribute(`cx`,e.x),t.setAttribute(`cy`,e.y),t.setAttribute(`r`,5),t.setAttribute(`fill`,`#FFE066`),t.setAttribute(`stroke`,`#FFFFFF`),t.setAttribute(`stroke-width`,1.5),S.appendChild(t)}),n.forEach(e=>{let t=document.createElementNS(`http://www.w3.org/2000/svg`,`circle`);t.setAttribute(`cx`,e.x),t.setAttribute(`cy`,e.y),t.setAttribute(`r`,5),t.setAttribute(`fill`,`#FF8EA5`),t.setAttribute(`stroke`,`#FFFFFF`),t.setAttribute(`stroke-width`,1.5),S.appendChild(t)})}function j(e){if(e.length===0)return``;let t=`M ${e[0].x} ${e[0].y}`;for(let n=0;n<e.length-1;n++){let r=e[n],i=e[n+1],a=r.x+(i.x-r.x)/3,o=r.y,s=r.x+2*(i.x-r.x)/3,c=i.y;t+=` C ${a} ${o}, ${s} ${c}, ${i.x} ${i.y}`}return t}function M(){!v||!y||(v.addEventListener(`click`,()=>{v.classList.add(`active`),y.classList.remove(`active`),A(`weekly`)}),y.addEventListener(`click`,()=>{y.classList.add(`active`),v.classList.remove(`active`),A(`monthly`)}))}function N(){if(!C||!w||!T||!E)return;C.addEventListener(`click`,()=>{w.classList.add(`active`),document.getElementById(`taskText`).focus()});let t=()=>{w.classList.remove(`active`),E.reset()};T.addEventListener(`click`,t),w.addEventListener(`click`,e=>{e.target===w&&t()}),E.addEventListener(`submit`,n=>{n.preventDefault();let r=document.getElementById(`taskText`).value,i=document.getElementById(`taskCategory`).value;e.addTask(r,i),t(),D()})}function P(){if(!l)return;l.innerHTML=``;let t=e.getBadges(),n=t.filter(e=>e.unlocked).length;u&&(u.textContent=`${n} of ${t.length} unlocked`),t.slice(0,4).forEach(e=>{let t=document.createElement(`div`);t.className=`badge-item ${e.unlocked?``:`locked`}`,t.title=e.unlocked?`Unlocked: ${e.name}`:`Locked: ${e.criteria}`,t.innerHTML=`
      <div class="badge-icon-holder" style="background-color: ${e.bgColor}; color: ${e.textColor};">
        ${e.icon}
      </div>
      <span class="badge-label">${L(e.name)}</span>
    `,l.appendChild(t)})}function F(){if(!f||!d||!p)return;let e=()=>{f.classList.add(`active`),I(_)},t=()=>{f.classList.remove(`active`)};d.addEventListener(`click`,t=>{t.preventDefault(),e()}),p.addEventListener(`click`,t),f.addEventListener(`click`,e=>{e.target===f&&t()}),document.addEventListener(`keydown`,e=>{e.key===`Escape`&&f.classList.contains(`active`)&&t()}),g.forEach(e=>{e.addEventListener(`click`,()=>{g.forEach(e=>e.classList.remove(`active`)),e.classList.add(`active`),_=e.dataset.badgeFilter||`all`,I(_)})})}function I(t=`all`){if(!h)return;h.innerHTML=``;let n=e.getBadges(),r=n.filter(e=>e.unlocked).length;if(m){let e=Math.round(r/n.length*100);m.textContent=`${r} of ${n.length} Badges Unlocked (${e}% Complete)`}let i=n.filter(e=>t===`unlocked`?e.unlocked:t!==`locked`||!e.unlocked);if(i.length===0){h.innerHTML=`
      <div style="grid-column: 1 / -1; text-align: center; padding: 36px 12px; color: var(--text-muted); font-style: italic;">
        No badges found in this category. Keep squeezing your goals! 🍋
      </div>
    `;return}i.forEach(e=>{let t=document.createElement(`div`);t.className=`badge-detail-card ${e.unlocked?`unlocked`:`locked`}`,t.innerHTML=`
      <div class="badge-detail-icon" style="background-color: ${e.bgColor}; color: ${e.textColor};" title="${L(e.name)}">
        ${e.icon}
      </div>
      <div class="badge-detail-info">
        <div class="badge-detail-title-row">
          <span class="badge-detail-name">${L(e.name)}</span>
          <span class="badge-status-pill ${e.unlocked?`unlocked`:`locked`}">
            ${e.unlocked?`✓ Unlocked`:`🔒 In Progress`}
          </span>
        </div>
        <p class="badge-detail-desc">${L(e.description)}</p>
        <span class="badge-detail-criteria">Target: ${L(e.criteria)}</span>
      </div>
    `,h.appendChild(t)})}function L(e){return e.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#039;`)}