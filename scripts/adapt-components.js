const fs = require('fs');
const path = require('path');

function adaptComponent(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Заменяем импорт Config на api
  content = content.replace(
    /from ['"]\.\.\/\.\.\/Config['"];?/g,
    "from '@/lib/api';"
  );
  content = content.replace(
    /import { API_BASE_URL, API_EXAM_URL } from ['"].*Config['"];?/g,
    "import { api } from '@/lib/api';"
  );
  
  // Заменяем прямые вызовы API на новые
  content = content.replace(/axios\.post\(`\$\{API_EXAM_URL\}\//g, 'api.examPost(');
  content = content.replace(/axios\.post\(`\$\{API_BASE_URL\}\//g, 'api.post(');
  content = content.replace(/axios\.get\(`\$\{API_EXAM_URL\}\//g, 'api.examGet(');
  content = content.replace(/axios\.get\(`\$\{API_BASE_URL\}\//g, 'api.get(');
  content = content.replace(/fetch\(`\$\{API_EXAM_URL\}\//g, '(async () => { const res = await fetch(`${await import(\'@/lib/api\')}.examGet(`');
  content = content.replace(/fetch\(`\$\{API_BASE_URL\}\//g, '(async () => { const res = await fetch(`${await import(\'@/lib/api\')}.request(`');
  
  // Удаляем axios импорты
  content = content.replace(/import axios from ['"]axios['"];?\n?/g, '');
  
  // Добавляем 'use client' директиву в начало если её нет
  if (!content.includes("'use client'") && !content.includes('"use client"')) {
    content = "'use client';\n" + content;
  }
  
  // Заменяем localStorage на безопасные вызовы
  content = content.replace(
    /localStorage\.(getItem|setItem|removeItem)/g,
    "typeof window !== 'undefined' && localStorage.$1"
  );
  
  fs.writeFileSync(filePath, content);
}

function adaptDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      adaptDirectory(filePath);
    } else if (file.endsWith('.js') && !file.endsWith('.module.js')) {
      console.log('Адаптирую:', filePath);
      adaptComponent(filePath);
    }
  }
}

const componentDirs = [
  path.join(__dirname, '..', 'components', 'student', 'StudentFunctions'),
  path.join(__dirname, '..', 'components', 'admin', 'AdminFunctions'),
];

for (const dir of componentDirs) {
  if (fs.existsSync(dir)) {
    console.log(`Обрабатываю директорию: ${dir}`);
    adaptDirectory(dir);
  }
}

console.log('Адаптация завершена!');

