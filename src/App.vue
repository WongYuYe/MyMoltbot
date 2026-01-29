<template>
  <div class="container">
    <div class="header">
      <h1>MyMoltbot</h1>
      <p class="subtitle">让你的生活井井有条</p>
    </div>
    
    <!-- 添加待办事项卡片 -->
    <div class="card add-todo-card">
      <h2>添加新任务</h2>
      <div class="input-group">
        <input 
          v-model="newTodo.content" 
          class="input-field" 
          placeholder="输入任务内容..."
          @keyup.enter="addTodo"
        />
      </div>
      
      <div class="form-row">
        <div class="form-col">
          <label>截止日期</label>
          <input 
            v-model="newTodo.dueDate" 
            type="date" 
            class="input-field date-input"
          />
        </div>
        
        <div class="form-col">
          <label>优先级</label>
          <select v-model="newTodo.priority" class="input-field select-input">
            <option value="low">低</option>
            <option value="medium" selected>中</option>
            <option value="high">高</option>
          </select>
        </div>
      </div>
      
      <div class="form-row">
        <div class="form-col">
          <label>分类</label>
          <select v-model="newTodo.category" class="input-field select-input">
            <option value="personal" selected>个人</option>
            <option value="work">工作</option>
            <option value="shopping">购物</option>
            <option value="health">健康</option>
            <option value="other">其他</option>
          </select>
        </div>
        
        <div class="form-col">
          <label>提醒时间</label>
          <input 
            v-model="newTodo.reminderTime" 
            type="datetime-local" 
            class="input-field datetime-input"
          />
        </div>
      </div>
      
      <button class="btn btn-primary btn-large" @click="addTodo">
        <span class="btn-icon">➕</span> 添加任务
      </button>
    </div>

    <!-- 统计卡片 -->
    <div class="card stats-card">
      <div class="stat-item">
        <div class="stat-number">{{ todos.length }}</div>
        <div class="stat-label">总任务</div>
      </div>
      <div class="stat-item">
        <div class="stat-number">{{ pendingCount }}</div>
        <div class="stat-label">待完成</div>
      </div>
      <div class="stat-item">
        <div class="stat-number">{{ completedCount }}</div>
        <div class="stat-label">已完成</div>
      </div>
    </div>

    <!-- 筛选器 -->
    <div class="card filter-card">
      <div class="filter-row">
        <div class="filter-group">
          <label>优先级</label>
          <select v-model="filterPriority" @change="applyFilters" class="input-field select-input">
            <option value="">全部优先级</option>
            <option value="high">高</option>
            <option value="medium">中</option>
            <option value="low">低</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>分类</label>
          <select v-model="filterCategory" @change="applyFilters" class="input-field select-input">
            <option value="">全部分类</option>
            <option value="personal">个人</option>
            <option value="work">工作</option>
            <option value="shopping">购物</option>
            <option value="health">健康</option>
            <option value="other">其他</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>状态</label>
          <select v-model="filterStatus" @change="applyFilters" class="input-field select-input">
            <option value="">全部状态</option>
            <option value="pending">待完成</option>
            <option value="completed">已完成</option>
          </select>
        </div>
      </div>
    </div>

    <!-- 任务列表 -->
    <div class="tasks-container">
      <div 
        v-for="todo in filteredTodos" 
        :key="todo.id" 
        class="task-card"
        :class="{ completed: todo.completed, 'priority-high': todo.priority === 'high', 'priority-medium': todo.priority === 'medium', 'priority-low': todo.priority === 'low' }"
      >
        <div class="task-header">
          <div class="task-checkbox">
            <input 
              type="checkbox" 
              :checked="todo.completed" 
              @change="toggleTodo(todo.id)"
              :id="`checkbox-${todo.id}`"
            />
            <label :for="`checkbox-${todo.id}`" class="checkbox-label"></label>
          </div>
          
          <div class="task-content">
            <h3 :class="{ strikethrough: todo.completed }">{{ todo.content }}</h3>
            
            <div class="task-meta">
              <div v-if="todo.dueDate" class="meta-item" :class="{ 'overdue': isOverdue(todo.dueDate) && !todo.completed }">
                <span class="meta-icon">📅</span>
                <span>{{ formatDate(todo.dueDate) }}</span>
                <span v-if="isOverdue(todo.dueDate) && !todo.completed" class="overdue-text">(已逾期)</span>
              </div>
              
              <div class="meta-item">
                <span class="meta-icon">⚡</span>
                <span class="priority-badge" :class="'priority-' + todo.priority">
                  {{ getPriorityText(todo.priority) }}
                </span>
              </div>
              
              <div class="meta-item">
                <span class="meta-icon">🏷️</span>
                <span class="category-badge" :class="'category-' + todo.category">
                  {{ getCategoryText(todo.category) }}
                </span>
              </div>
              
              <div v-if="todo.reminderTime" class="meta-item">
                <span class="meta-icon">🔔</span>
                <span>{{ formatDateTime(todo.reminderTime) }}</span>
              </div>
            </div>
          </div>
          
          <div class="task-actions">
            <button class="btn btn-danger" @click="deleteTodo(todo.id)">
              <span class="btn-icon">🗑️</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="filteredTodos.length === 0" class="empty-state">
      <div class="empty-icon">📋</div>
      <h3>{{ todos.length === 0 ? '还没有任务' : '没有符合条件的任务' }}</h3>
      <p>{{ todos.length === 0 ? '添加一个新任务开始吧！' : '尝试更改筛选条件' }}</p>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'

export default {
  name: 'App',
  setup() {
    const newTodo = ref({
      content: '',
      dueDate: '',
      priority: 'medium',
      category: 'personal',
      reminderTime: ''
    })
    
    const todos = ref([])
    const filterPriority = ref('')
    const filterCategory = ref('')
    const filterStatus = ref('')

    const pendingCount = computed(() => {
      return todos.value.filter(todo => !todo.completed).length
    })

    const completedCount = computed(() => {
      return todos.value.filter(todo => todo.completed).length
    })

    const filteredTodos = computed(() => {
      let result = todos.value
      
      if (filterPriority.value) {
        result = result.filter(todo => todo.priority === filterPriority.value)
      }
      
      if (filterCategory.value) {
        result = result.filter(todo => todo.category === filterCategory.value)
      }
      
      if (filterStatus.value === 'pending') {
        result = result.filter(todo => !todo.completed)
      } else if (filterStatus.value === 'completed') {
        result = result.filter(todo => todo.completed)
      }
      
      return result.sort((a, b) => b.createTime - a.createTime)
    })

    const loadTodos = () => {
      const storedTodos = localStorage.getItem('todos')
      if (storedTodos) {
        todos.value = JSON.parse(storedTodos)
      }
    }

    const saveTodos = () => {
      localStorage.setItem('todos', JSON.stringify(todos.value))
    }

    const addTodo = () => {
      if (!newTodo.value.content.trim()) {
        alert('请输入任务内容')
        return
      }

      const newTodoItem = {
        id: Date.now(),
        content: newTodo.value.content.trim(),
        dueDate: newTodo.value.dueDate,
        priority: newTodo.value.priority,
        category: newTodo.value.category,
        reminderTime: newTodo.value.reminderTime,
        completed: false,
        createTime: new Date().getTime()
      }

      todos.value.push(newTodoItem)
      newTodo.value = {
        content: '',
        dueDate: '',
        priority: 'medium',
        category: 'personal',
        reminderTime: ''
      }
      saveTodos()
    }

    const toggleTodo = (id) => {
      const todo = todos.value.find(item => item.id === id)
      if (todo) {
        todo.completed = !todo.completed
        saveTodos()
      }
    }

    const deleteTodo = (id) => {
      const index = todos.value.findIndex(item => item.id === id)
      if (index !== -1) {
        todos.value.splice(index, 1)
        saveTodos()
      }
    }

    const isOverdue = (dueDate) => {
      if (!dueDate) return false
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const due = new Date(dueDate)
      due.setHours(0, 0, 0, 0)
      return due < today
    }

    const formatDate = (dateString) => {
      if (!dateString) return ''
      const options = { year: 'numeric', month: 'short', day: 'numeric' }
      return new Date(dateString).toLocaleDateString('zh-CN', options)
    }

    const formatDateTime = (dateTimeString) => {
      if (!dateTimeString) return ''
      const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
      return new Date(dateTimeString).toLocaleDateString('zh-CN', options)
    }

    const getPriorityText = (priority) => {
      switch(priority) {
        case 'high': return '高优先级'
        case 'medium': return '中优先级'
        case 'low': return '低优先级'
        default: return '普通'
      }
    }

    const getCategoryText = (category) => {
      switch(category) {
        case 'personal': return '个人'
        case 'work': return '工作'
        case 'shopping': return '购物'
        case 'health': return '健康'
        case 'other': return '其他'
        default: return '其他'
      }
    }

    const applyFilters = () => {
      // 筛选器改变时自动更新
    }

    onMounted(() => {
      loadTodos()
    })

    return {
      newTodo,
      todos,
      pendingCount,
      completedCount,
      filteredTodos,
      filterPriority,
      filterCategory,
      filterStatus,
      addTodo,
      toggleTodo,
      deleteTodo,
      isOverdue,
      formatDate,
      formatDateTime,
      getPriorityText,
      getCategoryText,
      applyFilters
    }
  }
}
</script>

<style>
/* 现代化CSS样式 */
:root {
  --primary-color: #6366f1;
  --primary-light: #818cf8;
  --primary-dark: #4f46e5;
  --secondary-color: #f9fafb;
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --danger-color: #ef4444;
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-200: #e5e7eb;
  --gray-300: #d1d5db;
  --gray-400: #9ca3af;
  --gray-500: #6b7280;
  --gray-600: #4b5563;
  --gray-700: #374151;
  --gray-800: #1f2937;
  --gray-900: #111827;
  --card-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --card-shadow-hover: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  --border-radius: 12px;
  --transition: all 0.3s ease;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
  color: var(--gray-800);
  line-height: 1.6;
  min-height: 100vh;
  padding: 20px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  text-align: center;
  margin-bottom: 30px;
}

.header h1 {
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(90deg, var(--primary-color), var(--primary-light));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin-bottom: 8px;
}

.subtitle {
  color: var(--gray-600);
  font-size: 1.1rem;
}

.card {
  background: white;
  border-radius: var(--border-radius);
  box-shadow: var(--card-shadow);
  padding: 24px;
  margin-bottom: 24px;
  transition: var(--transition);
}

.card:hover {
  box-shadow: var(--card-shadow-hover);
}

.add-todo-card h2 {
  margin-bottom: 20px;
  color: var(--gray-800);
  font-weight: 600;
}

.form-row {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.form-col {
  flex: 1;
  min-width: 200px;
}

.form-col label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: var(--gray-700);
  font-size: 0.9rem;
}

.input-field {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid var(--gray-200);
  border-radius: 8px;
  font-size: 1rem;
  transition: var(--transition);
  background: var(--gray-50);
}

.input-field:focus {
  outline: none;
  border-color: var(--primary-color);
  background: white;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.select-input, .date-input, .datetime-input {
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 12px center;
  background-repeat: no-repeat;
  background-size: 16px;
  padding-right: 40px;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
  outline: none;
}

.btn:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
}

.btn-large {
  padding: 14px 24px;
  font-size: 1.1rem;
}

.btn-primary {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -5px rgba(99, 102, 241, 0.4);
}

.btn-danger {
  background: var(--danger-color);
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  padding: 0;
}

.btn-danger:hover {
  background: #dc2626;
  transform: scale(1.05);
}

.btn-icon {
  margin-right: 8px;
}

.stats-card {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  background: linear-gradient(135deg, var(--primary-light), var(--primary-color));
  color: white;
}

.stat-item {
  text-align: center;
  padding: 16px;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.9;
}

.filter-card {
  padding: 16px;
}

.filter-row {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.filter-group {
  flex: 1;
  min-width: 150px;
}

.filter-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: var(--gray-700);
  font-size: 0.9rem;
}

.tasks-container {
  display: grid;
  gap: 16px;
}

.task-card {
  background: white;
  border-radius: var(--border-radius);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  transition: var(--transition);
}

.task-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.task-card.completed {
  background: var(--gray-50);
  opacity: 0.9;
}

.task-header {
  display: flex;
  align-items: flex-start;
  padding: 20px;
  gap: 16px;
}

.task-checkbox {
  position: relative;
  margin-top: 4px;
}

.task-checkbox input[type="checkbox"] {
  opacity: 0;
  position: absolute;
  width: 0;
  height: 0;
}

.checkbox-label {
  display: inline-block;
  width: 24px;
  height: 24px;
  border: 2px solid var(--gray-300);
  border-radius: 6px;
  position: relative;
  cursor: pointer;
  transition: var(--transition);
}

.checkbox-label::after {
  content: '';
  position: absolute;
  left: 6px;
  top: 2px;
  width: 6px;
  height: 12px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
  opacity: 0;
  transition: var(--transition);
}

.task-checkbox input[type="checkbox"]:checked + .checkbox-label {
  background: var(--primary-color);
  border-color: var(--primary-color);
}

.task-checkbox input[type="checkbox"]:checked + .checkbox-label::after {
  opacity: 1;
}

.task-content {
  flex: 1;
}

.task-content h3 {
  margin: 0 0 12px 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--gray-800);
}

.strikethrough {
  text-decoration: line-through;
  color: var(--gray-500) !important;
}

.task-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: var(--gray-600);
}

.meta-icon {
  font-size: 0.9rem;
}

.priority-badge, .category-badge {
  padding: 2px 8px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
}

.priority-high {
  background: rgba(239, 68, 68, 0.15);
  color: #dc2626;
}

.priority-medium {
  background: rgba(245, 158, 11, 0.15);
  color: #d97706;
}

.priority-low {
  background: rgba(16, 185, 129, 0.15);
  color: #047857;
}

.category-personal { background: rgba(99, 102, 241, 0.15); color: var(--primary-dark); }
.category-work { background: rgba(59, 130, 246, 0.15); color: #1d4ed8; }
.category-shopping { background: rgba(139, 92, 246, 0.15); color: #7c3aed; }
.category-health { background: rgba(245, 158, 11, 0.15); color: #d97706; }
.category-other { background: rgba(107, 114, 128, 0.15); color: var(--gray-600); }

.overdue-text {
  color: var(--danger-color);
  font-weight: 600;
}

.task-actions {
  display: flex;
  gap: 8px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--gray-500);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 16px;
}

.empty-state h3 {
  font-size: 1.5rem;
  color: var(--gray-700);
  margin-bottom: 8px;
}

.empty-state p {
  font-size: 1rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .container {
    padding: 10px;
  }
  
  .header h1 {
    font-size: 2rem;
  }
  
  .form-row {
    flex-direction: column;
    gap: 12px;
  }
  
  .form-col {
    min-width: auto;
  }
  
  .filter-row {
    flex-direction: column;
  }
  
  .filter-group {
    min-width: auto;
  }
  
  .task-header {
    flex-direction: column;
    gap: 12px;
  }
  
  .task-meta {
    flex-direction: column;
    gap: 8px;
  }
  
  .stats-card {
    grid-template-columns: 1fr;
  }
}

/* 深色模式 */
@media (prefers-color-scheme: dark) {
  :root {
    --secondary-color: #111827;
    --gray-50: #111827;
    --gray-100: #1f2937;
    --gray-200: #374151;
    --gray-300: #4b5563;
    --gray-400: #6b7280;
    --gray-500: #9ca3af;
    --gray-600: #d1d5db;
    --gray-700: #e5e7eb;
    --gray-800: #f3f4f6;
    --gray-900: #f9fafb;
  }
  
  body {
    background: linear-gradient(135deg, #0f172a, #1e293b);
    color: var(--gray-200);
  }
  
  .card {
    background: var(--gray-800);
    color: var(--gray-200);
  }
  
  .input-field {
    background: var(--gray-700);
    border-color: var(--gray-600);
    color: var(--gray-100);
  }
  
  .input-field:focus {
    background: var(--gray-600);
  }
  
  .task-card {
    background: var(--gray-800);
    color: var(--gray-200);
  }
  
  .task-card.completed {
    background: var(--gray-700);
  }
  
  .task-content h3 {
    color: var(--gray-100);
  }
  
  .strikethrough {
    color: var(--gray-400) !important;
  }
  
  .meta-item {
    color: var(--gray-300);
  }
}
</style>