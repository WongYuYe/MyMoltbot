// pages/index/index.js

Page({
  /**
   * 页面的初始数据
   */
  data: {
    newTodo: '',
    todos: [],
    pendingCount: 0,
    completedCount: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    // 从本地存储加载待办事项
    this.loadTodos();
    this.updateStats();
  },

  /**
   * 加载本地存储的待办事项
   */
  loadTodos: function() {
    const todos = wx.getStorageSync('todos') || [];
    this.setData({
      todos: todos
    });
  },

  /**
   * 保存待办事项到本地存储
   */
  saveTodos: function() {
    wx.setStorageSync('todos', this.data.todos);
    this.updateStats();
  },

  /**
   * 更新统计数据
   */
  updateStats: function() {
    const todos = this.data.todos;
    const completedCount = todos.filter(todo => todo.completed).length;
    const pendingCount = todos.length - completedCount;

    this.setData({
      pendingCount: pendingCount,
      completedCount: completedCount
    });
  },

  /**
   * 输入框内容变化事件
   */
  onNewTodoInput: function(e) {
    this.setData({
      newTodo: e.detail.value
    });
  },

  /**
   * 添加待办事项
   */
  addTodo: function() {
    const newTodo = this.data.newTodo.trim();
    
    if (!newTodo) {
      wx.showToast({
        title: '请输入待办事项',
        icon: 'none'
      });
      return;
    }

    const todos = [...this.data.todos];
    const newTodoItem = {
      id: Date.now(),
      content: newTodo,
      completed: false,
      createTime: new Date().getTime()
    };

    todos.push(newTodoItem);

    this.setData({
      todos: todos,
      newTodo: ''
    });

    this.saveTodos();

    wx.showToast({
      title: '添加成功',
      icon: 'success'
    });
  },

  /**
   * 切换待办事项完成状态
   */
  toggleTodo: function(e) {
    const id = e.currentTarget.dataset.id;
    const todos = [...this.data.todos];
    const index = todos.findIndex(item => item.id === id);

    if (index !== -1) {
      todos[index].completed = !todos[index].completed;
      
      this.setData({
        todos: todos
      });

      this.saveTodos();
    }
  },

  /**
   * 删除待办事项
   */
  deleteTodo: function(e) {
    const id = e.currentTarget.dataset.id;
    const todos = [...this.data.todos];
    const index = todos.findIndex(item => item.id === id);

    if (index !== -1) {
      todos.splice(index, 1);
      
      this.setData({
        todos: todos
      });

      this.saveTodos();

      wx.showToast({
        title: '删除成功',
        icon: 'success'
      });
    }
  }
})