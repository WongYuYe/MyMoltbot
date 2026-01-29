<template>
  <div class="container">
    <div class="header">
      <h1>MyMoltbot - Todo List</h1>
    </div>
    
    <!-- 添加待办事项区域 -->
    <div class="add-todo-section">
      <input 
        v-model="newTodo" 
        class="add-input" 
        placeholder="添加新的待办事项..." 
        @keyup.enter="addTodo"
      />
      <button class="add-btn btn btn-primary" @click="addTodo">添加</button>
    </div>

    <!-- 待办事项统计 -->
    <div class="todo-stats">
      <span class="stat-text">总共: {{ todos.length }} | 待完成: {{ pendingCount }} | 已完成: {{ completedCount }}</span>
    </div>

    <!-- 待办事项列表 -->
    <div class="todo-list">
      <div 
        v-for="todo in todos" 
        :key="todo.id" 
        class="todo-item"
        :class="{ completed: todo.completed }"
      >
        <label class="todo-label">
          <input 
            type="checkbox" 
            :checked="todo.completed" 
            @change="toggleTodo(todo.id)"
          />
          <span class="todo-text">{{ todo.content }}</span>
        </label>
        
        <div class="todo-actions">
          <button class="btn btn-danger" @click="deleteTodo(todo.id)">删除</button>
        </div>
      </div>
    </div>

    <!-- 空状态提示 -->
    <div v-if="todos.length === 0" class="empty-tips">
      <span>暂无待办事项，快添加一个吧！</span>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'

export default {
  name: 'App',
  setup() {
    // 响应式数据
    const newTodo = ref('')
    const todos = ref([])

    // 计算属性
    const pendingCount = computed(() => {
      return todos.value.filter(todo => !todo.completed).length
    })

    const completedCount = computed(() => {
      return todos.value.filter(todo => todo.completed).length
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
      if (!newTodo.value.trim()) {
        alert('请输入待办事项')
        return
      }

      const newTodoItem = {
        id: Date.now(),
        content: newTodo.value.trim(),
        completed: false,
        createTime: new Date().getTime()
      }

      todos.value.push(newTodoItem)
      newTodo.value = ''
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

    // 组件挂载时加载数据
    onMounted(() => {
      loadTodos()
    })

    return {
      newTodo,
      todos,
      pendingCount,
      completedCount,
      addTodo,
      toggleTodo,
      deleteTodo
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
  max-width: 800px;
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
  display: flex;
  margin-bottom: 30px;
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.add-input {
  flex: 1;
  height: 60px;
  line-height: 60px;
  padding: 0 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 18px;
  outline: none;
}

.add-input:focus {
  border-color: #007aff;
}

.add-btn {
  margin-left: 20px;
  height: 60px;
  line-height: 60px;
  padding: 0 30px;
  font-size: 18px;
  border: none;
  cursor: pointer;
  border-radius: 8px;
}

/* 通用按钮样式 */
.btn {
  display: inline-block;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 16px;
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
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.todo-item:last-child {
  border-bottom: none;
}

.todo-item.completed {
  background-color: #f9f9f9;
}

.todo-label {
  flex: 1;
  display: flex;
  align-items: center;
}

.todo-label input[type="checkbox"] {
  width: 20px;
  height: 20px;
  margin-right: 20px;
  cursor: pointer;
}

.todo-text {
  font-size: 18px;
  flex: 1;
}

.todo-item.completed .todo-text {
  text-decoration: line-through;
  color: #999;
}

.todo-actions {
  display: flex;
  gap: 10px;
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
    flex-direction: column;
    gap: 10px;
  }
  
  .add-input {
    height: 50px;
    line-height: 50px;
  }
  
  .add-btn {
    margin-left: 0;
    height: 50px;
    line-height: 50px;
  }
  
  .header h1 {
    font-size: 2rem;
  }
  
  .todo-text {
    font-size: 16px;
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
  .todo-list {
    background: #2a2a2a;
    color: #fff;
  }
  
  .todo-item {
    border-bottom-color: #444;
  }
  
  .todo-item.completed {
    background-color: #333;
  }
  
  .add-input {
    background: #333;
    border-color: #555;
    color: #fff;
  }
  
  .stat-text,
  .todo-text {
    color: #ccc;
  }
}
</style>