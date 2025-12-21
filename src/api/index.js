import request from '@/utils/request'

// 认证接口
export const authApi = {
  // 管理员登录
  adminLogin(data) {
    return request({
      url: '/auth/admin/login',
      method: 'post',
      data
    })
  },
  // 员工登录
  employeeLogin(data) {
    return request({
      url: '/auth/employee/login',
      method: 'post',
      data
    })
  },
  // 发送短信验证码
  sendSms(data) {
    return request({
      url: '/auth/sms/send',
      method: 'post',
      data
    })
  },
  // 验证短信验证码
  verifySms(data) {
    return request({
      url: '/auth/sms/verify',
      method: 'post',
      data
    })
  }
}

// 管理员接口
export const adminApi = {
  // 岗位管理
  posts: {
    list(params) {
      return request({
        url: '/admin/posts',
        method: 'get',
        params
      })
    },
    create(data) {
      return request({
        url: '/admin/posts',
        method: 'post',
        data
      })
    },
    detail(id) {
      return request({
        url: `/admin/posts/${id}`,
        method: 'get'
      })
    },
    update(id, data) {
      return request({
        url: `/admin/posts/${id}`,
        method: 'put',
        data
      })
    },
    delete(id) {
      return request({
        url: `/admin/posts/${id}`,
        method: 'delete'
      })
    },
    assignAreas(id, data) {
      return request({
        url: `/admin/posts/${id}/assign-areas`,
        method: 'post',
        data
      })
    }
  },
  // 员工管理
  employees: {
    list(params) {
      return request({
        url: '/admin/employees',
        method: 'get',
        params
      })
    },
    create(data) {
      return request({
        url: '/admin/employees',
        method: 'post',
        data
      })
    },
    detail(id) {
      return request({
        url: `/admin/employees/${id}`,
        method: 'get'
      })
    },
    update(id, data) {
      return request({
        url: `/admin/employees/${id}`,
        method: 'put',
        data
      })
    },
    updatePassword(id, data) {
      return request({
        url: `/admin/employees/${id}/password`,
        method: 'put',
        data
      })
    },
    delete(id) {
      return request({
        url: `/admin/employees/${id}`,
        method: 'delete'
      })
    }
  },
  // 位置配置管理
  positionConfigs: {
    list(params) {
      return request({
        url: '/admin/position-configs',
        method: 'get',
        params
      })
    },
    create(data) {
      return request({
        url: '/admin/position-configs',
        method: 'post',
        data
      })
    },
    detail(id) {
      return request({
        url: `/admin/position-configs/${id}`,
        method: 'get'
      })
    },
    update(id, data) {
      return request({
        url: `/admin/position-configs/${id}`,
        method: 'put',
        data
      })
    },
    delete(id) {
      return request({
        url: `/admin/position-configs/${id}`,
        method: 'delete'
      })
    }
  },
  // 座位管理
  positions: {
    list(params) {
      return request({
        url: '/admin/positions',
        method: 'get',
        params
      })
    },
    create(data) {
      return request({
        url: '/admin/positions',
        method: 'post',
        data
      })
    },
    detail(id) {
      return request({
        url: `/admin/positions/${id}`,
        method: 'get'
      })
    },
    update(id, data) {
      return request({
        url: `/admin/positions/${id}`,
        method: 'put',
        data
      })
    },
    delete(id) {
      return request({
        url: `/admin/positions/${id}`,
        method: 'delete'
      })
    },
    getByConfig(configId, params) {
      return request({
        url: `/admin/positions/config/${configId}`,
        method: 'get',
        params
      })
    },
    getHistory(id) {
      return request({
        url: `/admin/positions/${id}/history`,
        method: 'get'
      })
    }
  },
  // 香品管理
  incenseTypes: {
    list(params) {
      return request({
        url: '/admin/incense-types',
        method: 'get',
        params
      })
    },
    create(data) {
      return request({
        url: '/admin/incense-types',
        method: 'post',
        data
      })
    },
    detail(id) {
      return request({
        url: `/admin/incense-types/${id}`,
        method: 'get'
      })
    },
    update(id, data) {
      return request({
        url: `/admin/incense-types/${id}`,
        method: 'put',
        data
      })
    },
    delete(id) {
      return request({
        url: `/admin/incense-types/${id}`,
        method: 'delete'
      })
    },
    statistics() {
      return request({
        url: '/admin/incense-types/statistics',
        method: 'get'
      })
    }
  },
  // 上香记录查询
  incenseRecords: {
    list(params) {
      return request({
        url: '/admin/incense-records',
        method: 'get',
        params
      })
    }
  },
  // 统计数据概览
  statistics: {
    overview(params) {
      return request({
        url: '/admin/statistics/overview',
        method: 'get',
        params
      })
    }
  }
}

// 员工接口
export const employeeApi = {
  // 游客管理
  tourists: {
    search(params) {
      return request({
        url: '/employee/tourists/search',
        method: 'get',
        params
      })
    },
    detail(id) {
      return request({
        url: `/employee/tourists/${id}`,
        method: 'get'
      })
    }
  },
  // 上香记录管理
  incenseRecords: {
    create(data) {
      return request({
        url: '/employee/incense-records',
        method: 'post',
        data
      })
    },
    myList(params) {
      return request({
        url: '/employee/incense-records/my',
        method: 'get',
        params
      })
    },
    myCount(params) {
      return request({
        url: '/employee/incense-records/my/count',
        method: 'get',
        params
      })
    }
  }
}

// 游客公开接口
export const publicApi = {
  // 查询上香记录
  touristRecords(data) {
    return request({
      url: '/public/tourist/records',
      method: 'post',
      data
    })
  },
  // 查询可用座位
  availablePositions(params) {
    return request({
      url: '/public/positions/available',
      method: 'get',
      params
    })
  }
}

// 通用接口
export const commonApi = {
  // 获取上香记录详情
  incenseRecordDetail(id) {
    return request({
      url: `/incense-records/${id}`,
      method: 'get'
    })
  },
  // 检查位置可用性
  checkPosition(params) {
    return request({
      url: '/positions/check',
      method: 'get',
      params
    })
  },
  // 图片上传
  uploadImage(file) {
    const formData = new FormData()
    formData.append('file', file)
    // 注意：如果后端接口路径不同，请根据实际 Swagger 文档调整
    // 可能的路径：/common/upload, /admin/upload, /upload
    return request({
      url: '/admin/upload/position-image',
      method: 'post',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }
}


