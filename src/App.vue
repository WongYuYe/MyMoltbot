<template>
  <div class="container">
    <div class="header">
      <h1>MyMoltbot - Todo List</h1>
    </div>
    
    <!-- 添加待办事项区域 -->
    <div class="add-todo-section">
      <div class="input-group">
        <input 
          v-model="newTodo.content" 
          class="add-input" 
          placeholder="添加新的待办事项..." 
          @keyup.enter="addTodo"
        />
      </div>
      
      <div class="input-group">
        <label>截止日期:</label>
        <input 
          v-model="newTodo.dueDate" 
          type="date" 
          class="date-input"
        />
      </div>
      
      <div class="input-group">
        <label>优先级:</label>
        <select v-model="newTodo.priority" class="priority-select">
          <option value="low">低</option>
          <option value="medium" selected>中</option>
          <option value="high">高</option>
        </select>
      </div>
      
      <div class="input-group">
        <label>分类:</label>
        <select v-model="newTodo.category" class="category-select">
          <option value="personal" selected>个人</option>
          <option value="work">工作</option>
          <option value="shopping">购物</option>
          <option value="health">健康</option>
          <option value="other">其他</option>
        </select>
      </div>
      
      <div class="input-group">
        <label>提醒时间:</label>
        <input 
          v-model="newTodo.reminderTime" 
          type="datetime-local" 
          class="reminder-input"
        />
      </div>
      
      <button class="add-btn btn btn-primary" @click="addTodo">添加</button>
    </div>

    <!-- 待办事项统计 -->
    <div class="todo-stats">
      <span class="stat-text">总共: {{ todos.length }} | 待完成: {{ pendingCount }} | 已完成: {{ completedCount }}</span>
    </div>

    <!-- 待办事项筛选器 -->
    <div class="filter-section">
      <div class="filter-group">
        <label>按优先级筛选:</label>
        <select v-model="filterPriority" @change="applyFilters" class="filter-select">
          <option value="">全部</option>
          <option value="high">高</option>
          <option value="medium">中</option>
          <option value="low">低</option>
        </select>
      </div>
      
      <div class="filter-group">
        <label>按分类筛选:</label>
        <select v-model="filterCategory" @change="applyFilters" class="filter-select">
          <option value="">全部</option>
          <option value="personal">个人</option>
          <option value="work">工作</option>
          <option value="shopping">购物</option>
          <option value="health">健康</option>
          <option value="other">其他</option>
        </select>
      </div>
      
      <div class="filter-group">
        <label>按状态筛选:</label>
        <select v-model="filterStatus" @change="applyFilters" class="filter-select">
          <option value="">全部</option>
          <option value="pending">待完成</option>
          <option value="completed">已完成</option>
        </select>
      </div>
    </div>

    <!-- 待办事项列表 -->
    <div class="todo-list">
      <div 
        v-for="todo in filteredTodos" 
        :key="todo.id" 
        class="todo-item"
        :class="{ completed: todo.completed, 'priority-high': todo.priority === 'high', 'priority-medium': todo.priority === 'medium', 'priority-low': todo.priority === 'low' }"
      >
        <div class="todo-header">
          <label class="todo-label">
            <input 
              type="checkbox" 
              :checked="todo.completed" 
              @change="toggleTodo(todo.id)"
            />
            <span class="todo-text">{{ todo.content }}</span>
          </label>
          
          <div class="todo-meta">
            <span v-if="todo.dueDate" class="due-date" :class="{ 'overdue': isOverdue(todo.dueDate) && !todo.completed }">
              📅 {{ formatDate(todo.dueDate) }}
            </span>
            <span class="priority-badge" :class="'priority-' + todo.priority">
              {{ getPriorityText(todo.priority) }}
            </span>
            <span class="category-badge" :class="'category-' + todo.category">
              {{ getCategoryText(todo.category) }}
            </span>
          </div>
        </div>
        
        <div class="todo-details">
          <span v-if="todo.reminderTime" class="reminder-time">
            🔔 提醒: {{ formatDateTime(todo.reminderTime) }}
          </span>
        </div>
        
        <div class="todo-actions">
          <button class="btn btn-danger" @click="deleteTodo(todo.id)">删除</button>
        </div>
      </div>
    </div>

    <!-- 空状态提示 -->
    <div v-if="filteredTodos.length === 0" class="empty-tips">
      <span>{{ todos.length === 0 ? '暂无待办事项，快添加一个吧！' : '没有符合条件的待办事项' }}</span>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'

export default {
  name: 'App',
  setup() {
    // 响应式数据
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

    // 计算属性
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
      
      // 按创建时间倒序排列
      return result.sort((a, b) => b.createTime - a.createTime)
    })

    // 从本地存储加载数据
    const loadTodos = () => {
      const storedTodos = localStorage.getItem('todos')
      if (storedTodos) {
        todos.value = JSON.parse(storedTodos)
      }
    }

    // 保存数据到本地存储
    const saveTodos = () => {
      localStorage.setItem('todos', JSON.stringify(todos.value))
    }

    // 添加待办事项
    const addTodo = () => {
      if (!newTodo.value.content.trim()) {
        alert('请输入待办事项')
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
      // 重置表单
      newTodo.value = {
        content: '',
        dueDate: '',
        priority: 'medium',
        category: 'personal',
        reminderTime: ''
      }
      saveTodos()
    }

    // 切换待办事项完成状态
    const toggleTodo = (id) => {
      const todo = todos.value.find(item => item.id === id)
      if (todo) {
        todo.completed = !todo.completed
        saveTodos()
      }
    }

    // 删除待办事项
    const deleteTodo = (id) => {
      const index = todos.value.findIndex(item => item.id === id)
      if (index !== -1) {
        todos.value.splice(index, 1)
        saveTodos()
      }
    }

    // 检查是否逾期
    const isOverdue = (dueDate) => {
      if (!dueDate) return false
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const due = new Date(dueDate)
      due.setHours(0, 0, 0, 0)
      return due < today
    }

    // 格式化日期
    const formatDate = (dateString) => {
      if (!dateString) return ''
      const options = { year: 'numeric', month: 'short', day: 'numeric' }
      return new Date(dateString).toLocaleDateString('zh-CN', options)
    }

    // 格式化日期时间
    const formatDateTime = (dateTimeString) => {
      if (!dateTimeString) return ''
      const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
      return new Date(dateTimeString).toLocaleDateString('zh-CN', options)
    }

    // 获取优先级文本
    const getPriorityText = (priority) => {
      switch(priority) {
        case 'high': return '高优先级'
        case 'medium': return '中优先级'
        case 'low': return '低优先级'
        default: return '普通'
      }
    }

    // 获取分类文本
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

    // 应用筛选器
    const applyFilters = () => {
      // 由于使用了computed，筛选会自动应用
    }

    // 组件挂载时加载数据
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
/* 全局样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: #f5f5f5;
  padding: 20px;
}

.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.header {
  text-align: center;
  margin-bottom: 30px;
}

.header h1 {
  color: #333;
  font-size: 2.5rem;
}

/* 添加待办事项区域 */
.add-todo-section {
  display: grid;
  grid-template-columns: 1fr 120px;
  grid-gap: 15px;
  margin-bottom: 30px;
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.input-group {
  display: flex;
  flex-direction: column;
}

.input-group label {
  margin-bottom: 5px;
  font-size: 14px;
  color: #555;
}

.add-input {
  height: 50px;
  line-height: 50px;
  padding: 0 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  outline: none;
}

.add-input:focus {
  border-color: #007aff;
}

.date-input, .priority-select, .category-select, .reminder-input {
  height: 40px;
  padding: 0 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
}

.add-btn {
  height: 50px;
  line-height: 50px;
  padding: 0 20px;
  font-size: 16px;
  border: none;
  cursor: pointer;
  border-radius: 8px;
  align-self: flex-end;
}

/* 筛选器部分 */
.filter-section {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  background: white;
  padding: 15px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  min-width: 120px;
}

.filter-group label {
  margin-bottom: 5px;
  font-size: 14px;
  color: #555;
}

.filter-select {
  height: 35px;
  padding: 0 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
}

/* 通用按钮样式 */
.btn {
  display: inline-block;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  text-align: center;
  cursor: pointer;
  border: none;
}

.btn-primary {
  background-color: #007aff;
  color: white;
}

.btn-danger {
  background-color: #ff3b30;
  color: white;
}

.btn-success {
  background-color: #4cd964;
  color: white;
}

/* 待办事项统计 */
.todo-stats {
  background: white;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  text-align: center;
}

.stat-text {
  font-size: 16px;
  color: #666;
}

/* 待办事项列表 */
.todo-list {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.todo-item {
  display: flex;
  flex-direction: column;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.todo-item:last-child {
  border-bottom: none;
}

.todo-item.completed {
  background-color: #f9f9f9;
}

.todo-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.todo-label {
  flex: 1;
  display: flex;
  align-items: flex-start;
  margin-right: 15px;
}

.todo-label input[type="checkbox"] {
  width: 20px;
  height: 20px;
  margin-right: 15px;
  margin-top: 5px;
  cursor: pointer;
}

.todo-text {
  font-size: 18px;
  flex: 1;
  word-break: break-word;
}

.todo-item.completed .todo-text {
  text-decoration: line-through;
  color: #999;
}

.todo-meta {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-self: flex-start;
  margin-top: 5px;
}

.due-date {
  background-color: #e3f2fd;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: #1976d2;
}

.due-date.overdue {
  background-color: #ffebee;
  color: #d32f2f;
}

.priority-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: white;
}

.priority-high {
  background-color: #f44336;
}

.priority-medium {
  background-color: #ff9800;
}

.priority-low {
  background-color: #4caf50;
}

.category-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: white;
  background-color: #9e9e9e;
}

.todo-details {
  margin-bottom: 10px;
  padding-left: 25px;
}

.reminder-time {
  background-color: #fff3e0;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: #e65100;
}

.todo-actions {
  display: flex;
  justify-content: flex-end;
}

.empty-tips {
  text-align: center;
  padding: 100px 0;
  color: #999;
  font-size: 18px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .container {
    padding: 10px;
  }
  
  .add-todo-section {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  
  .filter-section {
    flex-direction: column;
  }
  
  .header h1 {
    font-size: 2rem;
  }
  
  .todo-text {
    font-size: 16px;
  }
  
  .todo-header {
    flex-direction: column;
    gap: 10px;
  }
  
  .todo-meta {
    margin-top: 10px;
  }
}

/* 深色模式支持 */
@media (prefers-color-scheme: dark) {
  body {
    background-color: #1a1a1a;
    color: #fff;
  }
  
  .container {
    background-color: #1a1a1a;
  }
  
  .add-todo-section,
  .todo-stats,
  .todo-list,
  .filter-section {
    background: #2a2a2a;
    color: #fff;
  }
  
  .todo-item {
    border-bottom-color: #444;
  }
  
  .todo-item.completed {
    background-color: #333;
  }
  
  .add-input,
  .date-input,
  .priority-select,
  .category-select,
  .reminder-input,
  .filter-select {
    background: #333;
    border-color: #555;
    color: #fff;
  }
  
  .stat-text,
  .todo-text,
  .due-date,
  .reminder-time {
    color: #ccc;
  }
  
  .due-date.overdue {
    color: #ffcdd2;
  }
}
</style>