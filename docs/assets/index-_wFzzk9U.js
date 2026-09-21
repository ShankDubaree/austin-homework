(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=[`some`,`come`,`were`,`your`,`school`,`where`,`said`,`are`,`house`,`friend`],t=[{tens:2,ones:1},{tens:1,ones:5},{tens:3,ones:4},{tens:4,ones:5},{tens:6,ones:2}],n=`abcdefghijklmnopqrstuvwxyz`,r=document.querySelector(`#app`),i=0,a=!1,o=!1,s=``,c=[],l=[],u=0,d=``,f=``,p=`tens`;function m(){l.forEach(e=>clearTimeout(e)),l=[],speechSynthesis.cancel()}function h(e,t){l.push(setTimeout(t,e))}function g(e){try{let t=new SpeechSynthesisUtterance(e);t.rate=.75,speechSynthesis.speak(t)}catch{}}function _(e){return e.map(e=>({item:e,sort:Math.random()})).sort((e,t)=>e.sort-t.sort).map(({item:e})=>e)}function v(e){let t=_(n.split(``)).filter(t=>!e.includes(t)).slice(0,e.length<5?3:2);return _([...e.split(``),...t])}function y(){let t=e[i];m(),a=!1,o=!0,s=``,c=v(t),S(),h(5e3,()=>{g(t),h(2e3,()=>{g(t),h(2e3,()=>{g(t),h(1200,()=>{a=!0,o=!1,S()})})})})}function b(e,t){return Array.from({length:e},()=>t===`ten`?`<span class="rod"></span>`:`<span class="cube"></span>`).join(``)}function x(){m(),r.innerHTML=`
    <main class="card">
      <p class="week">Austin</p>
      <h1 class="word">Homework</h1>
      <p class="progress">Pick one</p>
      <a class="big next" href="#spell">Spellings</a>
      <a class="big next-word" href="#maths">Maths</a>
    </main>
  `}function S(){let t=e[i],n=a&&!o,l=n&&s.length>0;r.innerHTML=`
    <main class="card">
      <p class="week">Spellings</p>
      <p class="progress">Word ${i+1} of ${e.length}</p>
      <h1 class="word">${a?`⭐`.repeat(Math.min(t.length,6)):t}</h1>
      <div class="answer">${s||(n?`tap the letters`:`watch and listen`)}</div>
      <p id="result"></p>
      <div class="tiles">
        ${c.map((e,t)=>`<a class="tile ${n?``:`off`}" href="#spell/l/${t}/${e}">${e}</a>`).join(``)}
      </div>
      <a class="big next ${l?``:`off`}" href="#spell/check">Check</a>
      <div class="row">
        <a class="big" href="#spell/again">Again</a>
        <a class="big next-word" href="#spell/next">Next word</a>
      </div>
      <a class="big" href="#home">Home</a>
    </main>
  `}function C(){let e=t[u],n=d!==``&&f!==``;r.innerHTML=`
    <main class="card">
      <p class="week">Make and Count</p>
      <p class="progress">Question ${u+1} of ${t.length}</p>
      <div class="build">
        <div class="rods">${b(e.tens,`ten`)}</div>
        <div class="ones">${b(e.ones,`one`)}</div>
      </div>
      <p class="sum-line ${p===`tens`?`on`:``}">
        There ${e.tens===1?`is`:`are`}
        <span class="blank">${d||`?`}</span>
        ${e.tens===1?`ten`:`tens`}.
      </p>
      <p class="sum-line ${p===`ones`?`on`:``}">
        There ${e.ones===1?`is`:`are`}
        <span class="blank">${f||`?`}</span>
        ${e.ones===1?`one`:`ones`}.
      </p>
      <p id="result"></p>
      <div class="row">
        <a class="big" href="#maths/tens">Tens</a>
        <a class="big" href="#maths/ones">Ones</a>
      </div>
      <div class="tiles">
        ${[0,1,2,3,4,5,6,7,8,9].map(e=>`<a class="tile num" href="#maths/n/${e}">${e}</a>`).join(``)}
      </div>
      <a class="big next ${n?``:`off`}" href="#maths/check">Check</a>
      <div class="row">
        <a class="big" href="#maths/clear">Clear</a>
        <a class="big next-word" href="#maths/next">Next</a>
      </div>
      <a class="big" href="#home">Home</a>
    </main>
  `}function w(){let n=(location.hash||`#home`).replace(/^#/,``).split(`/`);if(n[0]===`spell`){if(n[1]===`l`&&a&&!o){s+=n[3]||``,history.replaceState(null,``,`#spell`),S();return}if(n[1]===`check`){let t=e[i];history.replaceState(null,``,`#spell`),S();let n=document.querySelector(`#result`);s===t?(n.textContent=`Yes! Well done`,n.className=`ok`,g(`Well done`)):(s=``,c=v(t),S(),document.querySelector(`#result`).textContent=`Try again`,document.querySelector(`#result`).className=`no`);return}if(n[1]===`again`){history.replaceState(null,``,`#spell`),y();return}if(n[1]===`next`){i=(i+1)%e.length,history.replaceState(null,``,`#spell`),y();return}y();return}if(n[0]===`maths`){if(n[1]===`tens`&&(p=`tens`),n[1]===`ones`&&(p=`ones`),n[1]===`n`&&(p===`tens`?d=n[2]:f=n[2]),n[1]===`clear`&&(d=``,f=``,p=`tens`),n[1]===`next`&&(u=(u+1)%t.length,d=``,f=``,p=`tens`),n[1]===`check`){history.replaceState(null,``,`#maths`),C();let e=t[u],n=document.querySelector(`#result`);Number(d)===e.tens&&Number(f)===e.ones?(n.textContent=`Yes! Well done`,n.className=`ok`,g(`Well done`)):(n.textContent=`Try again`,n.className=`no`);return}history.replaceState(null,``,`#maths`),C();return}x()}window.addEventListener(`hashchange`,w),window.addEventListener(`load`,w),w();