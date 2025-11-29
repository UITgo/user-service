# UITGo User Service

Microservice quản lý user profile và cung cấp gRPC service cho các service khác trong UITGo.

## Tổng quan

User service chịu trách nhiệm:
- **User Profile Management**: CRUD operations cho user profiles
- **Avatar Upload**: Upload và lưu trữ avatar lên S3
- **gRPC Service**: Cung cấp `GetProfile` gRPC method cho các service khác
- **REST API**: REST endpoints cho client access

## Kiến trúc

User service sử dụng:
- **MongoDB**: Lưu trữ user profiles (document-based, flexible schema)
- **Mongoose ODM**: Object-Document Mapping cho MongoDB
- **AWS S3**: Lưu trữ avatar images
- **gRPC**: Internal service communication
- **NestJS**: Framework

## Endpoints

### REST Endpoints

- `POST /v1/users` - Tạo user profile
  - Body: `{ authId, fullname, role }`
  - Returns: User document
  - Note: Idempotent - nếu user đã tồn tại, return existing user

- `GET /v1/users/me` - Lấy profile của current user
  - Headers: `X-User-Id` (do gateway inject từ JWT)
  - Returns: User profile
  - Error: 400 nếu `X-User-Id` missing

- `GET /v1/users/:authId` - Lấy user profile theo authId
  - Returns: User document
  - Error: 404 nếu user không tồn tại

- `PATCH /v1/users/:authId/avatar` - Upload avatar
  - Content-Type: `multipart/form-data`
  - Body: `file` (image file)
  - Returns: `{ avatar: "https://s3-url" }`
  - Flow:
    1. Upload file lên S3
    2. Update user document với avatar URL
    3. Return avatar URL

### gRPC Service

- `GetProfile(user_id: string)` - Lấy user profile
  - Input: `{ user_id: string }`
  - Output:
    ```protobuf
    {
      exists: bool,
      user_id: string,
      name: string,
      avatar_url: string,
      role: string  // "PASSENGER" | "DRIVER"
    }
    ```
  - Returns `exists: false` nếu user không tồn tại

## Database Schema

User document trong MongoDB:
```typescript
{
  _id: ObjectId,
  authId: string,        // Cognito user ID (unique)
  fullname: string,
  role: string,          // "PASSENGER" | "DRIVER"
  avatar?: string,       // S3 URL
  createdAt: Date,
  updatedAt: Date
}
```

## Environment Variables

```bash
PORT=3001
NODE_ENV=production

# MongoDB
MONGO_URL=mongodb://mongo:27017/uitgo

# AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=xxxxx
AWS_SECRET_ACCESS_KEY=xxxxx
S3_BUCKET_NAME=uitgo-avatars

# gRPC
GRPC_PORT=50051
```

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run start:dev

# Build
npm run build

# Run in production mode
npm run start:prod
```

## Docker

```bash
# Build image
docker build -t uitgo-user .

# Run container
docker run -p 3001:3001 -p 50051:50051 \
  -e MONGO_URL=mongodb://mongo:27017/uitgo \
  -e AWS_REGION=us-east-1 \
  -e AWS_ACCESS_KEY_ID=xxxxx \
  -e AWS_SECRET_ACCESS_KEY=xxxxx \
  -e S3_BUCKET_NAME=uitgo-avatars \
  -v $(pwd)/../proto:/app/proto:ro \
  uitgo-user
```

## Health Check

- `GET /healthz` - Health check endpoint
  - Returns: `{ status: "ok" }`
  - Checks: MongoDB connection

## gRPC Integration

User service expose gRPC service trên port 50051. Các service khác (như `trip-command-service`) có thể gọi `GetProfile` để verify user và lấy thông tin.

### Proto Definition

```protobuf
service UserService {
  rpc GetProfile(GetProfileRequest) returns (GetProfileResponse);
}

message GetProfileRequest {
  string user_id = 1;
}

message GetProfileResponse {
  bool exists = 1;
  string user_id = 2;
  string name = 3;
  string avatar_url = 4;
  string role = 5;
}
```

### Usage Example (trip-command-service)

```typescript
const user = await this.userService.getProfile({ user_id: userId });
if (!user.exists || user.role !== 'PASSENGER') {
  throw new ForbiddenException('Only passengers can create trips');
}
```

## S3 Avatar Storage

Avatar được upload lên S3 với:
- **Key format**: `avatars/{authId}/{timestamp}-{filename}`
- **Content-Type**: Preserved từ uploaded file
- **ACL**: Public read (hoặc signed URL tùy config)
- **Max size**: Có thể config (default: 5MB)

## Error Handling

- **400 Bad Request**: Missing required fields, invalid input
- **404 Not Found**: User không tồn tại
- **500 Internal Server Error**: Database error, S3 error

## Integration Flow

1. **User Registration**:
   - `auth-service` tạo user trong Cognito
   - Client gọi `POST /v1/users` để tạo profile trong MongoDB

2. **User Login**:
   - `auth-service` authenticate và return JWT
   - Gateway verify JWT và inject `X-User-Id` header
   - Client gọi `GET /v1/users/me` với JWT

3. **Internal Service Call**:
   - `trip-command-service` gọi `GetProfile` gRPC để verify user role
   - `user-service` return user info từ MongoDB

## Security Considerations

1. **X-User-Id Header**: Gateway phải verify JWT và inject `X-User-Id`, user-service trust header này
2. **S3 Access**: Avatar URLs có thể public hoặc signed, tùy security requirements
3. **gRPC Authentication**: Có thể thêm authentication cho gRPC calls (mTLS, API key)

## Xem thêm

- **Kiến trúc tổng thể**: Xem [`../architecture/README.md`](../architecture/README.md) để hiểu toàn bộ hệ thống UITGo
- **ARCHITECTURE.md**: [`../architecture/ARCHITECTURE.md`](../architecture/ARCHITECTURE.md) - Kiến trúc chi tiết
- **REPORT.md**: [`../architecture/REPORT.md`](../architecture/REPORT.md) - Báo cáo Module A
