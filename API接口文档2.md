# 七曲山寺庙智能上香系统 - API接口文档

## 目录
1. [接口说明](#接口说明)
2. [认证接口](#认证接口)
3. [游客公开接口](#游客公开接口)
4. [管理员接口](#管理员接口)
5. [员工接口](#员工接口)
6. [通用接口](#通用接口)
7. [数据模型](#数据模型)
8. [错误码说明](#错误码说明)

---

## 接口说明

### 基础信息
- **Base URL**: `http://localhost:8080/api/v1`
- **API版本**: v1
- **数据格式**: JSON
- **字符编码**: UTF-8

### 认证方式
- 大部分接口需要JWT Token认证
- Token放在请求头：`Authorization: Bearer {token}`
- Token有效期：根据配置（默认24小时）

### 权限说明
- **管理员（admin）**: 拥有所有权限，可以创建、修改、删除所有资源
- **员工（employee）**: 只能查看和操作其岗位关联的区域下的资源
- **游客（public）**: 只能查询自己的上香记录和可用座位

### 响应格式
```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

---

## 认证接口

### 1. 管理员登录

**接口地址**: `POST /auth/admin/login`

**需要认证**: 否

**请求参数**:
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**说明**:
- `username`: 可以是用户名或手机号（11位数字）
- `password`: 密码

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "role": "admin",
    "username": "admin",
    "user_id": 1,
    "name": "管理员"
  }
}
```

---

### 2. 员工登录

**接口地址**: `POST /auth/employee/login`

**需要认证**: 否

**请求参数**:
```json
{
  "username": "DDZ001",
  "password": "password123"
}
```

**说明**:
- `username`: 可以是用户名或手机号（11位数字）
- `password`: 密码

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "role": "employee",
    "username": "DDZ001",
    "user_id": 1,
    "name": "张三"
  }
}
```

---

### 3. 发送短信验证码

**接口地址**: `POST /auth/sms/send`

**需要认证**: 否

**请求参数**:
```json
{
  "phone": "13800138000",
  "purpose": "employee_register"
}
```

**说明**:
- `phone`: 手机号（11位）
- `purpose`: 用途，可选值：`employee_register`（员工注册）、`employee_update`（员工更新）等

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "message": "短信验证码已发送",
    "code": "123456"
  }
}
```

**注意**: 开发模式下会返回验证码，生产环境不会返回

---

### 4. 验证短信验证码

**接口地址**: `POST /auth/sms/verify`

**需要认证**: 否

**请求参数**:
```json
{
  "phone": "13800138000",
  "code": "123456",
  "purpose": "employee_register"
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "message": "验证成功"
  }
}
```

---

## 游客公开接口

### 1. 查询上香记录

**接口地址**: `POST /public/tourist/records`

**需要认证**: 否

**请求参数**:
```json
{
  "name": "李四",
  "phone": "13900139000"
}
```

**说明**:
- 通过姓名和手机号查询上香记录
- 有每日查询次数限制（默认配置）

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "position_path": "大殿-A1",
      "position_image_url": "https://example.com/image.jpg",
      "incense_type_name": "檀香",
      "start_time": "2024-01-01T10:00:00Z",
      "end_time": "2024-01-01T10:30:00Z",
      "blessing": "祈福平安",
      "remaining_time": "剩余25分钟",
      "created_at": "2024-01-01T09:00:00Z"
    }
  ]
}
```

---

### 2. 查询可用座位

**接口地址**: `GET /public/positions/available`

**需要认证**: 否

**查询参数**:
- `position_config_id` (可选): 位置配置ID，用于筛选特定区域的座位

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "position_config_id": 1,
      "row": 1,
      "col": 1,
      "name": "A1",
      "status": 1,
      "capacity": 1,
      "description": "第一排第一个座位"
    }
  ]
}
```

---

## 管理员接口

**说明**: 以下接口需要管理员权限（`role=admin`）

### 岗位管理

#### 1. 创建岗位
- **接口**: `POST /admin/posts`
- **需要认证**: 是（管理员）
- **请求体**:
```json
{
  "name": "大殿服务岗",
  "code": "DD",
  "description": "负责大殿区域上香业务",
  "position_config_ids": [1, 2],
  "sort_order": 1
}
```

**说明**:
- `position_config_ids`: 位置配置ID数组（可选），创建岗位时可以关联一个或多个区域
- 如果不提供`position_config_ids`，岗位创建后可以通过分配区域接口来分配区域

#### 2. 岗位列表
- **接口**: `GET /admin/posts`
- **需要认证**: 是（登录用户）
- **查询参数**: `status` (可选)
- **响应**: 岗位列表（包含关联的位置配置）

#### 3. 获取岗位详情
- **接口**: `GET /admin/posts/:id`
- **需要认证**: 是（登录用户）
- **响应**: 岗位详情及关联的位置配置

#### 4. 更新岗位
- **接口**: `PUT /admin/posts/:id`
- **需要认证**: 是（管理员）
- **请求体**:
```json
{
  "name": "大殿服务岗（更新）",
  "code": "DD",
  "description": "更新后的描述",
  "position_config_ids": [1, 2],
  "status": 1,
  "sort_order": 1
}
```

**说明**:
- `position_config_ids`: 位置配置ID数组（可选），如果提供则更新岗位的区域关联
- 如果不提供`position_config_ids`，则保持原有的区域关联不变

#### 5. 删除岗位
- **接口**: `DELETE /admin/posts/:id`
- **需要认证**: 是（管理员）
- **注意**: 如果岗位下有员工，无法删除

#### 6. 为岗位分配区域
- **接口**: `POST /admin/posts/:id/assign-areas`
- **需要认证**: 是（管理员）
- **请求体**:
```json
{
  "position_config_ids": [1, 2, 3]
}
```

**说明**:
- `position_config_ids`: 位置配置ID数组（必填），可以为岗位分配一个或多个区域
- 调用此接口会替换岗位原有的区域关联，只保留本次指定的区域

---

### 员工管理

#### 1. 创建员工/管理员
- **接口**: `POST /admin/employees`
- **需要认证**: 是（管理员）
- **请求体**:
```json
{
  "name": "张三",
  "phone": "13800138000",
  "role": "employee",
  "username": "DDZ001",
  "password": "Password123!",
  "post_id": 1
}
```

**说明**:
- `role`: 角色，可选值：`admin`（管理员）、`employee`（员工，默认）
- 创建管理员时：`username`和`password`必填
- 创建员工时：`post_id`必填，`username`可选（不填则使用姓名），`password`可选（不填则自动生成临时密码）
- 员工首次登录需修改密码

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "employee": {...},
    "temp_password": "Temp@001",
    "message": "创建员工成功，员工首次登录需修改密码"
  }
}
```

#### 2. 员工列表
- **接口**: `GET /admin/employees`
- **需要认证**: 是（登录用户）
- **查询参数**: 
  - `page`: 页码（默认1）
  - `page_size`: 每页数量（默认10）
  - `keyword`: 搜索关键词（姓名、用户名、手机号）
  - `role`: 角色筛选（admin/employee）
  - `post_id`: 岗位ID（可选）
  - `status`: 状态（可选）

#### 3. 获取员工详情
- **接口**: `GET /admin/employees/:id`
- **需要认证**: 是（登录用户）

#### 4. 更新员工
- **接口**: `PUT /admin/employees/:id`
- **需要认证**: 是（管理员）
- **请求体**:
```json
{
  "name": "张三",
  "phone": "13800138000",
  "post_id": 1,
  "status": 1,
  "sms_code": "123456"
}
```

**说明**:
- 更新手机号时需要提供`sms_code`（短信验证码）

#### 5. 修改员工密码
- **接口**: `PUT /admin/employees/:id/password`
- **需要认证**: 是（管理员）
- **请求体**:
```json
{
  "password": "NewPassword123!"
}
```

#### 6. 删除员工
- **接口**: `DELETE /admin/employees/:id`
- **需要认证**: 是（管理员）
- **说明**: 软删除，历史记录保留

---

### 位置配置管理

#### 1. 创建位置配置
- **接口**: `POST /admin/position-configs`
- **需要认证**: 是（管理员）
- **请求体**:
```json
{
  "name": "大殿",
  "type": "grid",
  "layout_config": [
    {"row": 1, "cols": 8},
    {"row": 2, "cols": 8},
    {"row": 3, "cols": 8}
  ],
  "image_url": "https://example.com/image.jpg",
  "description": "大殿座位配置，10行，每行8列"
}
```

**说明**:
- `type`: `grid`（网格布局）或 `custom`（自定义布局）
- `layout_config`: JSON数组，每行一个对象，包含`row`（行号）和`cols`（列数）
- 行号必须连续（1, 2, 3...）
- 创建成功后，系统会自动根据`layout_config`生成所有座位

#### 2. 位置配置列表
- **接口**: `GET /admin/position-configs`
- **需要认证**: 是（登录用户）
- **查询参数**: `status` (可选)

#### 3. 获取位置配置详情
- **接口**: `GET /admin/position-configs/:id`
- **需要认证**: 是（登录用户）
- **响应**: 配置详情及关联座位

#### 4. 更新位置配置
- **接口**: `PUT /admin/position-configs/:id`
- **需要认证**: 是（管理员）
- **请求体**:
```json
{
  "name": "大殿（更新）",
  "type": "custom",
  "layout_config": [
    {"row": 1, "cols": 5},
    {"row": 2, "cols": 6}
  ],
  "image_url": "https://example.com/new-image.jpg",
  "status": 1
}
```

**注意**: 
- 如果配置有上香记录，无法修改`layout_config`
- 修改`layout_config`会删除旧座位并生成新座位

#### 5. 删除位置配置
- **接口**: `DELETE /admin/position-configs/:id`
- **需要认证**: 是（管理员）
- **注意**: 如果配置有上香记录，无法删除

---

### 座位管理

#### 1. 创建座位（手动）
- **接口**: `POST /admin/positions`
- **需要认证**: 是（管理员）
- **请求体**:
```json
{
  "position_config_id": 1,
  "row": 1,
  "col": 1,
  "name": "A1",
  "status": 1,
  "description": "第一排第一个座位"
}
```

#### 2. 座位列表
- **接口**: `GET /admin/positions`
- **需要认证**: 是（登录用户）
- **查询参数**:
  - `position_config_id`: 配置ID（可选）
  - `status`: 状态（可选）
  - `row`: 行号（可选）
  - `start_time`: 开始时间（可选，ISO 8601格式）
  - `end_time`: 结束时间（可选，ISO 8601格式）
- **响应**: 座位列表，按行号、列号排序
- **权限说明**:
  - 管理员：可以查看所有座位
  - 员工：只能查看其岗位关联的区域下的座位
- **说明**: 如果提供了`start_time`和`end_time`，会动态计算每个座位的`capacity`（可用容量）

#### 3. 按配置查询座位
- **接口**: `GET /admin/positions/config/:config_id`
- **需要认证**: 是（登录用户）
- **查询参数**:
  - `start_time`: 开始时间（可选，ISO 8601格式）
  - `end_time`: 结束时间（可选，ISO 8601格式）
- **权限说明**:
  - 管理员：可以查看任何配置的座位
  - 员工：只能查看其岗位关联的区域配置的座位，否则返回403错误
- **响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "config": {
      "id": 1,
      "name": "大殿",
      "type": "grid"
    },
    "seats_by_row": {
      "1": [{"id": 1, "row": 1, "col": 1, "name": "A1", ...}, ...],
      "2": [{"id": 9, "row": 2, "col": 1, "name": "B1", ...}, ...]
    },
    "seats": [...]
  }
}
```

#### 4. 获取座位详情
- **接口**: `GET /admin/positions/:id`
- **需要认证**: 是（登录用户）
- **查询参数**:
  - `start_time`: 开始时间（可选）
  - `end_time`: 结束时间（可选）

#### 5. 更新座位
- **接口**: `PUT /admin/positions/:id`
- **需要认证**: 是（管理员）
- **请求体**:
```json
{
  "name": "A1（更新）",
  "status": 1,
  "description": "更新后的描述",
  "row": 1,
  "col": 2
}
```

#### 6. 删除座位
- **接口**: `DELETE /admin/positions/:id`
- **需要认证**: 是（管理员）
- **注意**: 有历史记录无法删除

#### 7. 座位占用历史
- **接口**: `GET /admin/positions/:id/history`
- **需要认证**: 是（登录用户）
- **响应**: 该座位的上香记录列表（最近20条）

---

### 香品管理

#### 1. 创建香品
- **接口**: `POST /admin/incense-types`
- **需要认证**: 是（管理员）
- **请求体**:
```json
{
  "name": "檀香",
  "description": "檀香木制作，香气浓郁持久"
}
```

#### 2. 香品列表
- **接口**: `GET /admin/incense-types`
- **需要认证**: 是（登录用户）
- **查询参数**: 
  - `page`: 页码（默认1）
  - `page_size`: 每页数量（默认10）
  - `keyword`: 搜索关键词（名称）

#### 3. 获取香品详情
- **接口**: `GET /admin/incense-types/:id`
- **需要认证**: 是（登录用户）

#### 4. 更新香品
- **接口**: `PUT /admin/incense-types/:id`
- **需要认证**: 是（管理员）

#### 5. 删除香品
- **接口**: `DELETE /admin/incense-types/:id`
- **需要认证**: 是（管理员）
- **说明**: 软删除

#### 6. 香品使用统计
- **接口**: `GET /admin/incense-types/statistics`
- **需要认证**: 是（登录用户）
- **响应**: 各香品的使用次数统计（按使用次数降序）

---

### 上香记录查询（管理员）

#### 1. 查询所有记录
- **接口**: `GET /admin/incense-records`
- **需要认证**: 是（登录用户）
- **查询参数**:
  - `page`: 页码（默认1）
  - `page_size`: 每页数量（默认10）
  - `employee_id`: 员工ID（可选）
  - `position_id`: 座位ID（可选）
  - `start_date`: 开始日期（可选）
  - `end_date`: 结束日期（可选）
- **响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [...],
    "total": 100,
    "page": 1,
    "page_size": 10
  }
}
```

---

### 操作日志查询

#### 1. 查询操作日志列表
- **接口**: `GET /admin/operation-logs`
- **需要认证**: 是（登录用户）
- **查询参数**:
  - `page`: 页码（默认1）
  - `page_size`: 每页数量（默认20）
  - `operator_id`: 操作人ID（可选）
  - `operator_type`: 操作人类型（可选）
  - `action`: 操作动作（可选，如：create、update、delete）
  - `table_name`: 表名（可选）
  - `record_id`: 记录ID（可选）
  - `start_date`: 开始日期（可选，格式：YYYY-MM-DD）
  - `end_date`: 结束日期（可选，格式：YYYY-MM-DD）

#### 2. 获取操作日志详情
- **接口**: `GET /admin/operation-logs/:id`
- **需要认证**: 是（登录用户）

#### 3. 根据记录查询操作日志
- **接口**: `GET /admin/operation-logs/by-record`
- **需要认证**: 是（登录用户）
- **查询参数**:
  - `table_name`: 表名（必填）
  - `record_id`: 记录ID（必填）

---

### 文件上传

#### 1. 上传位置配置图片
- **接口**: `POST /admin/upload/position-image`
- **需要认证**: 是（管理员）
- **请求类型**: `multipart/form-data`
- **请求参数**:
  - `file`: 图片文件（必填）
- **文件要求**:
  - 支持格式：jpg、jpeg、png、gif
  - 文件大小限制：根据配置（默认10MB）
- **响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "filename": "1234567890_image.jpg",
    "url": "/uploads/position_images/1234567890_image.jpg",
    "size": 102400
  }
}
```

---

## 员工接口

**说明**: 以下接口需要员工权限（`role=employee`）

### 游客管理

#### 1. 搜索游客
- **接口**: `GET /employee/tourists/search`
- **需要认证**: 是（员工）
- **查询参数**:
  - `phone`: 手机号（必填）
- **响应**: 匹配的游客列表（最多20条，按更新时间降序）

#### 2. 获取游客详情
- **接口**: `GET /employee/tourists/:id`
- **需要认证**: 是（员工）
- **响应**: 游客详细信息及历史记录（最近10条）

---

### 上香记录管理

#### 1. 创建上香记录
- **接口**: `POST /employee/incense-records`
- **需要认证**: 是（员工）
- **请求体**:
```json
{
  "tourist_name": "李四",
  "tourist_phone": "13900139000",
  "tourist_id_card": "110101199001011234",
  "position_id": 1,
  "incense_type_id": 1,
  "start_time": "2024-01-01T10:00:00Z",
  "end_time": "2024-01-01T10:30:00Z",
  "blessing": "祈福平安"
}
```

**说明**:
- 如果游客不存在，系统会自动创建
- 系统会检查座位可用性和时间合法性
- 时间格式：ISO 8601（如：`2024-01-01T10:00:00Z`）
- 时间会自动向上取整到下一个整点
- **权限检查**: 员工只能为其岗位关联的区域下的位置创建上香记录，否则返回403错误
- `blessing`: 祝福语（可选）

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "tourist_id": 1,
    "position_id": 1,
    "incense_type_id": 1,
    "start_time": "2024-01-01T10:00:00Z",
    "end_time": "2024-01-01T10:30:00Z",
    "blessing": "祈福平安",
    "position_path": "大殿-A1",
    "tourist": {
      "id": 1,
      "name": "李四",
      "phone": "13900139000"
    },
    "position": {
      "id": 1,
      "name": "A1",
      "row": 1,
      "col": 1
    },
    "incense_type": {
      "id": 1,
      "name": "檀香"
    }
  }
}
```

#### 2. 查询我的记录
- **接口**: `GET /employee/incense-records/my`
- **需要认证**: 是（员工）
- **查询参数**:
  - `page`: 页码（默认1）
  - `page_size`: 每页数量（默认10）
- **响应**: 当前员工办理的所有记录

---

## 通用接口

**说明**: 以下接口需要登录即可访问（管理员和员工都可访问）

### 1. 获取上香记录详情
- **接口**: `GET /incense-records/:id`
- **需要认证**: 是（登录用户）
- **响应**: 记录详情及剩余时间

---

### 2. 检查位置可用性
- **接口**: `GET /positions/check`
- **需要认证**: 是（登录用户）
- **查询参数**:
  - `position_id`: 座位ID（必填）
  - `start_time`: 开始时间（必填，ISO 8601格式）
  - `end_time`: 结束时间（必填，ISO 8601格式）
- **响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "available": true,
    "message": ""
  }
}
```

---

### 3. 删除/取消上香记录
- **接口**: `DELETE /incense-records/:id`
- **需要认证**: 是（登录用户）
- **权限说明**:
  - 员工：只能删除自己创建的记录
  - 管理员：可以删除任何记录
- **响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "message": "删除成功"
  }
}
```

---

## 数据模型

### PositionConfig（位置配置）
```json
{
  "id": 1,
  "name": "大殿",
  "type": "grid",
  "layout_config": "[{\"row\":1,\"cols\":8},...]",
  "image_url": "https://example.com/image.jpg",
  "description": "大殿座位配置",
  "status": 1,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### Position（座位）
```json
{
  "id": 1,
  "position_config_id": 1,
  "row": 1,
  "col": 1,
  "name": "A1",
  "status": 1,
  "capacity": 1,
  "description": "第一排第一个座位",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

**说明**: `capacity`字段会根据查询时提供的时间段动态计算可用容量

### IncenseRecord（上香记录）
```json
{
  "id": 1,
  "tourist_id": 1,
  "employee_id": 1,
  "position_id": 1,
  "incense_type_id": 1,
  "start_time": "2024-01-01T10:00:00Z",
  "end_time": "2024-01-01T10:30:00Z",
  "blessing": "祈福平安",
  "employee_name": "张三",
  "employee_username": "DDZ001",
  "post_name": "大殿服务岗",
  "position_path": "大殿-A1",
  "created_at": "2024-01-01T09:00:00Z",
  "updated_at": "2024-01-01T09:00:00Z",
  "tourist": {...},
  "position": {...},
  "incense_type": {...}
}
```

### Post（岗位）
```json
{
  "id": 1,
  "name": "大殿服务岗",
  "code": "DD",
  "description": "负责大殿区域上香业务",
  "status": 1,
  "sort_order": 1,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z",
  "position_configs": [
    {
      "id": 1,
      "name": "大殿",
      "type": "grid",
      "layout_config": "[{\"row\":1,\"cols\":8},...]",
      "status": 1
    }
  ]
}
```

### Tourist（游客）
```json
{
  "id": 1,
  "name": "李四",
  "phone": "13900139000",
  "id_card": "110101199001011234",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### Employee（员工）
```json
{
  "id": 1,
  "username": "DDZ001",
  "name": "张三",
  "phone": "13800138000",
  "role": "employee",
  "post_id": 1,
  "status": 1,
  "phone_verified": true,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z",
  "post": {
    "id": 1,
    "name": "大殿服务岗",
    "code": "DD",
    "position_configs": [
      {
        "id": 1,
        "name": "大殿",
        "type": "grid"
      }
    ]
  }
}
```

### IncenseType（香品）
```json
{
  "id": 1,
  "name": "檀香",
  "description": "檀香木制作，香气浓郁持久",
  "usage_count": 100,
  "status": 1,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### OperationLog（操作日志）
```json
{
  "id": 1,
  "operator_id": 1,
  "operator_type": "admin",
  "operator_name": "管理员",
  "action": "create",
  "target_table": "incense_records",
  "record_id": 1,
  "old_data": null,
  "new_data": {...},
  "description": "创建上香记录: 游客李四, 位置大殿-A1",
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

## 错误码说明

| 错误码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 参数错误 |
| 401 | 未授权（Token无效或过期） |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 409 | 冲突（如：座位已被占用、名称重复等） |
| 429 | 请求次数过多（如：查询次数超限） |
| 500 | 服务器内部错误 |

### 错误响应格式
```json
{
  "code": 400,
  "message": "参数错误: 座位ID不能为空",
  "data": null
}
```

---

## 接口调用示例

### cURL示例

#### 1. 管理员登录
```bash
curl -X POST http://localhost:8080/api/v1/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

#### 2. 创建位置配置
```bash
curl -X POST http://localhost:8080/api/v1/admin/position-configs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "name": "大殿",
    "type": "grid",
    "layout_config": [
      {"row": 1, "cols": 8},
      {"row": 2, "cols": 8}
    ],
    "description": "大殿座位配置"
  }'
```

#### 3. 创建岗位（带区域）
```bash
curl -X POST http://localhost:8080/api/v1/admin/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "name": "大殿服务岗",
    "code": "DD",
    "description": "负责大殿区域上香业务",
    "position_config_ids": [1, 2],
    "sort_order": 1
  }'
```

#### 4. 为岗位分配区域
```bash
curl -X POST http://localhost:8080/api/v1/admin/posts/1/assign-areas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "position_config_ids": [1, 2, 3]
  }'
```

#### 5. 创建上香记录
```bash
curl -X POST http://localhost:8080/api/v1/employee/incense-records \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "tourist_name": "李四",
    "tourist_phone": "13900139000",
    "position_id": 1,
    "incense_type_id": 1,
    "start_time": "2024-01-01T10:00:00Z",
    "end_time": "2024-01-01T10:30:00Z",
    "blessing": "祈福平安"
  }'
```

#### 6. 上传位置图片
```bash
curl -X POST http://localhost:8080/api/v1/admin/upload/position-image \
  -H "Authorization: Bearer {token}" \
  -F "file=@/path/to/image.jpg"
```

---

## 注意事项

1. **时间格式**: 所有时间字段使用ISO 8601格式（如：`2024-01-01T10:00:00Z`）
2. **Token过期**: Token过期后需要重新登录获取新Token
3. **分页**: 列表接口支持分页，默认每页10条（操作日志默认20条）
4. **软删除**: 删除操作都是软删除，数据不会真正删除
5. **历史记录限制**: 有历史记录的资源无法删除或修改关键字段
6. **座位生成**: 创建位置配置后会自动生成座位，无需手动创建
7. **布局配置**: `layout_config`必须是有效的JSON数组，行号必须连续
8. **岗位区域分配**: 
   - 岗位可以关联一个或多个位置配置（区域）
   - 创建岗位时可以指定`position_config_ids`，也可以创建后通过分配区域接口来分配
   - 员工只能查看和操作其岗位关联的区域下的位置
   - 管理员可以查看和操作所有区域的位置
9. **时间自动取整**: 创建上香记录时，开始时间和结束时间会自动向上取整到下一个整点
10. **座位容量**: 座位的`capacity`字段会根据查询时提供的时间段动态计算可用容量
11. **查询限制**: 游客查询上香记录有每日查询次数限制
12. **短信验证码**: 开发模式下会返回验证码，生产环境不会返回
13. **文件上传**: 上传的位置图片可以通过`/uploads/position_images/{filename}`访问

---

## Swagger文档

系统提供了Swagger API文档，访问地址：
- **本地**: `http://localhost:8080/swagger/index.html`

Swagger文档提供了交互式的API测试界面，可以直接在浏览器中测试接口。
