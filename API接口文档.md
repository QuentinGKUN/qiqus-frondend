# 七曲山寺庙智能上香系统 - API接口文档

## 目录
1. [接口说明](#接口说明)
2. [认证接口](#认证接口)
3. [管理员接口](#管理员接口)
4. [员工接口](#员工接口)
5. [游客公开接口](#游客公开接口)
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

**请求参数**:
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "admin",
      "name": "管理员"
    }
  }
}
```

---

### 2. 员工登录

**接口地址**: `POST /auth/employee/login`

**请求参数**:
```json
{
  "username": "DDZ001",
  "password": "password123"
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "DDZ001",
      "name": "张三",
      "post": {
        "id": 1,
        "name": "大殿服务岗"
      }
    }
  }
}
```

---

### 3. 发送短信验证码

**接口地址**: `POST /auth/sms/send`

**请求参数**:
```json
{
  "phone": "13800138000"
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "验证码已发送",
  "data": null
}
```

---

### 4. 验证短信验证码

**接口地址**: `POST /auth/sms/verify`

**请求参数**:
```json
{
  "phone": "13800138000",
  "code": "123456"
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "验证成功",
  "data": {
    "verified": true
  }
}
```

---

## 管理员接口

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
  "sort_order": 1
}
```

#### 2. 岗位列表
- **接口**: `GET /admin/posts`
- **查询参数**: `status` (可选)
- **响应**: 岗位列表

#### 3. 获取岗位详情
- **接口**: `GET /admin/posts/:id`

#### 4. 更新岗位
- **接口**: `PUT /admin/posts/:id`

#### 5. 删除岗位
- **接口**: `DELETE /admin/posts/:id`

---

### 员工管理

#### 1. 创建员工
- **接口**: `POST /admin/employees`
- **请求体**:
```json
{
  "name": "张三",
  "phone": "13800138000",
  "post_id": 1,
  "password": "Password123!",
  "sms_code": "123456"
}
```

#### 2. 员工列表
- **接口**: `GET /admin/employees`
- **查询参数**: 
  - `page`: 页码（默认1）
  - `page_size`: 每页数量（默认10）
  - `post_id`: 岗位ID（可选）
  - `status`: 状态（可选）

#### 3. 获取员工详情
- **接口**: `GET /admin/employees/:id`

#### 4. 更新员工
- **接口**: `PUT /admin/employees/:id`

#### 5. 修改员工密码
- **接口**: `PUT /admin/employees/:id/password`
- **请求体**:
```json
{
  "password": "NewPassword123!"
}
```

#### 6. 删除员工
- **接口**: `DELETE /admin/employees/:id`

---

### 位置配置管理

#### 1. 创建位置配置
- **接口**: `POST /admin/position-configs`
- **请求体**:
```json
{
  "name": "大殿",
  "type": "grid",
  "layout_config": [
    {"row": 1, "cols": 8},
    {"row": 2, "cols": 8},
    {"row": 3, "cols": 8},
    {"row": 4, "cols": 8},
    {"row": 5, "cols": 8},
    {"row": 6, "cols": 8},
    {"row": 7, "cols": 8},
    {"row": 8, "cols": 8},
    {"row": 9, "cols": 8},
    {"row": 10, "cols": 8}
  ],
  "image_url": "https://example.com/image.jpg",
  "description": "大殿座位配置，10行，每行8列"
}
```

**说明**:
- `type`: `grid`（网格布局）或 `custom`（自定义布局）
- `layout_config`: JSON数组，每行一个对象，包含`row`（行号）和`cols`（列数）
- 创建成功后，系统会自动根据`layout_config`生成所有座位

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "name": "大殿",
    "type": "grid",
    "layout_config": "[{\"row\":1,\"cols\":8},...]",
    "status": 1,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

#### 2. 位置配置列表
- **接口**: `GET /admin/position-configs`
- **查询参数**: `status` (可选)
- **响应**: 配置列表

#### 3. 获取位置配置详情
- **接口**: `GET /admin/position-configs/:id`
- **响应**: 配置详情及关联座位

#### 4. 更新位置配置
- **接口**: `PUT /admin/position-configs/:id`
- **请求体**:
```json
{
  "name": "大殿（更新）",
  "type": "custom",
  "layout_config": [
    {"row": 1, "cols": 5},
    {"row": 2, "cols": 6},
    {"row": 3, "cols": 4}
  ],
  "status": 1
}
```

**注意**: 如果配置有上香记录，无法修改`layout_config`

#### 5. 删除位置配置
- **接口**: `DELETE /admin/position-configs/:id`
- **注意**: 如果配置有上香记录，无法删除

---

### 座位管理

#### 1. 创建座位（手动）
- **接口**: `POST /admin/positions`
- **请求体**:
```json
{
  "position_config_id": 1,
  "row": 1,
  "col": 1,
  "name": "A1",
  "capacity": 1,
  "status": 1,
  "description": "第一排第一个座位"
}
```

#### 2. 座位列表
- **接口**: `GET /admin/positions`
- **查询参数**:
  - `position_config_id`: 配置ID（可选）
  - `status`: 状态（可选）
  - `row`: 行号（可选）
- **响应**: 座位列表，按行号、列号排序

#### 3. 按配置查询座位
- **接口**: `GET /admin/positions/config/:config_id`
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

#### 5. 更新座位
- **接口**: `PUT /admin/positions/:id`
- **请求体**:
```json
{
  "name": "A1（更新）",
  "capacity": 2,
  "status": 1,
  "description": "更新后的描述"
}
```

#### 6. 删除座位
- **接口**: `DELETE /admin/positions/:id`
- **注意**: 有历史记录无法删除

#### 7. 座位占用历史
- **接口**: `GET /admin/positions/:id/history`
- **响应**: 该座位的上香记录列表

---

### 香品管理

#### 1. 创建香品
- **接口**: `POST /admin/incense-types`
- **请求体**:
```json
{
  "name": "檀香",
  "description": "檀香木制作，香气浓郁持久"
}
```

#### 2. 香品列表
- **接口**: `GET /admin/incense-types`
- **查询参数**: `status` (可选)

#### 3. 获取香品详情
- **接口**: `GET /admin/incense-types/:id`

#### 4. 更新香品
- **接口**: `PUT /admin/incense-types/:id`

#### 5. 删除香品
- **接口**: `DELETE /admin/incense-types/:id`

#### 6. 香品使用统计
- **接口**: `GET /admin/incense-types/statistics`
- **响应**: 各香品的使用次数统计

---

### 上香记录查询（管理员）

#### 1. 查询所有记录
- **接口**: `GET /admin/incense-records`
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

## 员工接口

### 游客管理

#### 1. 搜索游客
- **接口**: `GET /employee/tourists/search`
- **需要认证**: 是（员工）
- **查询参数**:
  - `name`: 游客姓名（可选）
  - `phone`: 手机号（可选）
- **响应**: 匹配的游客列表

#### 2. 获取游客详情
- **接口**: `GET /employee/tourists/:id`
- **响应**: 游客详细信息及历史记录

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
  "end_time": "2024-01-01T10:30:00Z"
}
```

**说明**:
- 如果游客不存在，系统会自动创建
- 系统会检查座位可用性和时间合法性
- 时间格式：ISO 8601（如：`2024-01-01T10:00:00Z`）

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
- **查询参数**:
  - `page`: 页码（默认1）
  - `page_size`: 每页数量（默认10）
- **响应**: 当前员工办理的所有记录

---

## 游客公开接口

### 1. 查询上香记录
- **接口**: `POST /public/tourist/records`
- **需要认证**: 否
- **请求体**:
```json
{
  "name": "李四",
  "phone": "13900139000"
}
```

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
      "remaining_time": "剩余25分钟",
      "created_at": "2024-01-01T09:00:00Z"
    }
  ]
}
```

---

### 2. 查询可用座位
- **接口**: `GET /public/positions/available`
- **需要认证**: 否
- **查询参数**:
  - `position_config_id`: 位置配置ID（可选）
- **响应**: 可用座位列表

---

## 通用接口

### 1. 获取上香记录详情
- **接口**: `GET /incense-records/:id`
- **需要认证**: 是（登录用户）
- **响应**: 记录详情及剩余时间

---

### 2. 检查位置可用性
- **接口**: `GET /positions/check`
- **需要认证**: 是（登录用户）
- **查询参数**:
  - `position_id`: 座位ID
  - `start_time`: 开始时间（ISO 8601格式）
  - `end_time`: 结束时间（ISO 8601格式）
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
  "post_id": 1,
  "status": 1,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z",
  "post": {
    "id": 1,
    "name": "大殿服务岗",
    "code": "DD"
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

---

## 错误码说明

| 错误码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 参数错误 |
| 401 | 未授权（Token无效或过期） |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 409 | 冲突（如：座位已被占用） |
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

#### 3. 创建上香记录
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
    "end_time": "2024-01-01T10:30:00Z"
  }'
```

---

## 注意事项

1. **时间格式**: 所有时间字段使用ISO 8601格式（如：`2024-01-01T10:00:00Z`）
2. **Token过期**: Token过期后需要重新登录获取新Token
3. **分页**: 列表接口支持分页，默认每页10条
4. **软删除**: 删除操作都是软删除，数据不会真正删除
5. **历史记录限制**: 有历史记录的资源无法删除或修改关键字段
6. **座位生成**: 创建位置配置后会自动生成座位，无需手动创建
7. **布局配置**: `layout_config`必须是有效的JSON数组，行号必须连续

---

## Swagger文档

系统提供了Swagger API文档，访问地址：
- **本地**: `http://localhost:8080/swagger/index.html`

Swagger文档提供了交互式的API测试界面，可以直接在浏览器中测试接口。

